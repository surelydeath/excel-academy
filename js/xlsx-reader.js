/* Reads an .xlsx file entirely in the browser (nothing is uploaded anywhere).
   An .xlsx is a zip of XML files; we read just what the project checks need:
   cell values, formulas, fills, bold, number formats, dropdowns, conditional
   formats, frozen panes, tables, charts and pivot tables.                    */
const XlsxReader = (() => {
  const unescapeXml = (s) =>
    s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/&amp;/g, '&');

  const attrs = (s) => { const o = {}; (s || '').replace(/([\w:]+)\s*=\s*"([^"]*)"/g, (_, k, v) => { o[k] = unescapeXml(v); return ''; }); return o; };

  const BUILTIN_FMT = { 0: 'General', 1: '0', 2: '0.00', 3: '#,##0', 4: '#,##0.00', 9: '0%', 10: '0.00%', 11: '0.00E+00', 12: '# ?/?', 13: '# ??/??' };
  // built-in currency / accounting ids (symbol depends on the user's region, so the code is unknown)
  const BUILTIN_CURRENCY = new Set([5, 6, 7, 8, 41, 42, 43, 44]);

  // true when a number format shows a date or time (ids 14-22 and 45-47, or d / m / y / h / s codes)
  function isDateFmt(code, id) {
    if ((id >= 14 && id <= 22) || (id >= 45 && id <= 47)) return true;
    if (!code || /^general$/i.test(code)) return false;
    const c = code.replace(/"[^"]*"/g, '').replace(/\[[^\]]*\]/g, '').replace(/\\./g, '');
    return /[dmyhs]/i.test(c);
  }

  function parseSharedStrings(xml) {
    if (!xml) return [];
    const out = [];
    xml.replace(/<si\b[^>]*>([\s\S]*?)<\/si>/g, (_, inner) => {
      let text = '';
      inner.replace(/<t\b[^>]*>([\s\S]*?)<\/t>/g, (_m, t) => { text += unescapeXml(t); return ''; });
      out.push(text);
      return '';
    });
    return out;
  }

  function parseStyles(xml) {
    const styles = { numFmts: {}, fonts: [], fills: [], xfs: [] };
    if (!xml) return styles;
    xml.replace(/<numFmt\b([^>]*?)\/?>/g, (_, a) => { const o = attrs(a); styles.numFmts[o.numFmtId] = o.formatCode; return ''; });

    const fontsBlock = (/<fonts\b[^>]*>([\s\S]*?)<\/fonts>/.exec(xml) || [])[1] || '';
    fontsBlock.replace(/<font\b[^>]*?(?:\/>|>([\s\S]*?)<\/font>)/g, (_, inner = '') => {
      const sz = /<sz\b[^>]*val="([\d.]+)"/.exec(inner);
      styles.fonts.push({ bold: /<b\s*\/>|<b\s+val="(1|true)"/.test(inner) || /<b>/.test(inner), size: sz ? +sz[1] : 11 });
      return '';
    });

    const fillsBlock = (/<fills\b[^>]*>([\s\S]*?)<\/fills>/.exec(xml) || [])[1] || '';
    fillsBlock.replace(/<fill\b[^>]*>([\s\S]*?)<\/fill>/g, (_, inner) => {
      const pat = /<patternFill\b([^>]*?)(?:\/>|>([\s\S]*?)<\/patternFill>)/.exec(inner);
      const pa = pat ? attrs(pat[1]) : {};
      const fg = pat && /<fgColor\b([^>]*?)\/?>/.exec(pat[2] || '');
      const c = fg ? attrs(fg[1]) : {};
      let solid = pa.patternType === 'solid';
      const key = c.rgb ? c.rgb.toUpperCase() : c.theme !== undefined ? 'theme' + c.theme + ':' + (c.tint || 0) : c.indexed !== undefined ? 'idx' + c.indexed : 'none';
      // white (or "automatic") backgrounds do not count as a colour
      if (/^(FF)?FFFFFF$/.test(key) || key === 'theme0:0' || key === 'idx64' || key === 'idx9') solid = false;
      styles.fills.push({ solid, key });
      return '';
    });

    const xfBlock = (/<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/.exec(xml) || [])[1] || '';
    xfBlock.replace(/<xf\b([^>]*?)(?:\/>|>[\s\S]*?<\/xf>)/g, (_, a) => { const o = attrs(a); styles.xfs.push({ numFmtId: +(o.numFmtId || 0), fontId: +(o.fontId || 0), fillId: +(o.fillId || 0) }); return ''; });
    return styles;
  }

  function describeStyle(styles, sIndex) {
    const xf = styles.xfs[sIndex || 0] || { numFmtId: 0, fontId: 0, fillId: 0 };
    const code = styles.numFmts[xf.numFmtId] || BUILTIN_FMT[xf.numFmtId] || '';
    const font = styles.fonts[xf.fontId] || { bold: false, size: 11 };
    const fill = styles.fills[xf.fillId] || { solid: false, key: 'none' };
    return {
      numFmtCode: code,
      currencyBuiltin: BUILTIN_CURRENCY.has(xf.numFmtId),
      percent: /%/.test(code) || xf.numFmtId === 9 || xf.numFmtId === 10,
      euro: /€|\[\$€|\\u20ac/i.test(code),
      date: isDateFmt(code, xf.numFmtId),
      bold: font.bold, size: font.size,
      filled: fill.solid, fillKey: fill.solid ? fill.key : null,
    };
  }

  function parseSheet(xml, shared, styles) {
    const cells = {};
    xml.replace(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, (_, a, inner = '') => {
      const at = attrs(a);
      if (!at.r) return '';
      const fm = /<f\b([^>]*?)(?:\/>|>([\s\S]*?)<\/f>)/.exec(inner);
      const vm = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(inner);
      let value = null;
      if (at.t === 's' && vm) value = shared[+vm[1]];
      else if (at.t === 'inlineStr') { const t = /<t\b[^>]*>([\s\S]*?)<\/t>/.exec(inner); value = t ? unescapeXml(t[1]) : ''; }
      else if (at.t === 'str' && vm) value = unescapeXml(vm[1]);
      else if (at.t === 'b' && vm) value = vm[1] === '1';
      else if (at.t === 'e' && vm) value = { error: vm[1] };
      else if (vm) value = parseFloat(vm[1]);
      let f = null, sharedChild = false;
      if (fm) {
        const fa = attrs(fm[1]);
        if (fm[2] !== undefined && fm[2] !== '') f = unescapeXml(fm[2]).replace(/_xlfn\./g, '').replace(/_xlws\./g, '');
        else if (fa.t === 'shared') sharedChild = true;
      }
      cells[at.r.toUpperCase()] = { value, f, hasFormula: !!fm, sharedChild, style: describeStyle(styles, +(at.s || 0)) };
      return '';
    });

    const validations = [], conditionals = [];
    xml.replace(/<dataValidation\b([^>]*?)(?:\/>|>([\s\S]*?)<\/dataValidation>)/g, (_, a, inner = '') => {
      const o = attrs(a); const f1 = /<formula1>([\s\S]*?)<\/formula1>/.exec(inner);
      validations.push({ sqref: o.sqref || '', type: o.type || '', formula1: f1 ? unescapeXml(f1[1]) : '' });
      return '';
    });
    xml.replace(/<conditionalFormatting\b([^>]*?)>([\s\S]*?)<\/conditionalFormatting>/g, (_, a, inner) => {
      conditionals.push({ sqref: attrs(a).sqref || '', rules: (inner.match(/<cfRule\b/g) || []).length });
      return '';
    });
    return {
      cells, validations, conditionals,
      hasConditionalFormatting: conditionals.length > 0,
      hasDataValidation: validations.length > 0,
      freeze: /<pane\b[^>]*state="frozen"/.test(xml),
      autoFilter: /<autoFilter\b/.test(xml),
    };
  }

  // Pivot tables: which fields sit in rows / columns / filters, and what is calculated
  async function readPivots(zip, text) {
    const out = [];
    const names = Object.keys(zip.files).filter((n) => /^xl\/pivotTables\/pivotTable\d+\.xml$/.test(n));
    for (const name of names) {
      const xml = await text(name);
      if (!xml) continue;
      const relsXml = (await text(name.replace('pivotTables/', 'pivotTables/_rels/') + '.rels')) || '';
      const target = (/Target="([^"]*pivotCacheDefinition\d+\.xml)"/.exec(relsXml) || [])[1];
      const cacheXml = target ? await text('xl/' + target.replace(/^(\.\.\/)+/, '').replace(/^\/?xl\//, '')) : null;
      const fields = [];
      (cacheXml || '').replace(/<cacheField\b([^>]*?)(?:\/>|>)/g, (_, a) => { fields.push(unescapeXml(attrs(a).name || '')); return ''; });
      const pf = [];
      const block = (/<pivotFields\b[^>]*>([\s\S]*?)<\/pivotFields>/.exec(xml) || [])[1] || '';
      block.replace(/<pivotField\b([^>]*?)(?:\/>|>[\s\S]*?<\/pivotField>)/g, (_, a) => { pf.push(attrs(a)); return ''; });
      const pivot = { name: attrs((/<pivotTableDefinition\b([^>]*)>/.exec(xml) || [])[1]).name || '', rows: [], cols: [], pages: [], data: [] };
      pf.forEach((p, i) => {
        const label = fields[i] || ('field' + i);
        if (p.axis === 'axisRow') pivot.rows.push(label);
        else if (p.axis === 'axisCol') pivot.cols.push(label);
        else if (p.axis === 'axisPage') pivot.pages.push(label);
      });
      xml.replace(/<dataField\b([^>]*?)\/?>/g, (_, a) => {
        const o = attrs(a);
        pivot.data.push({ field: fields[+o.fld] || ('field' + o.fld), agg: o.subtotal || 'sum', name: o.name || '' });
        return '';
      });
      out.push(pivot);
    }
    return out;
  }

  async function read(data, JSZipLib) {
    const zip = await JSZipLib.loadAsync(data);
    const text = async (name) => { const f = zip.file(name); return f ? f.async('string') : null; };

    const workbook = await text('xl/workbook.xml');
    if (!workbook) throw new Error('not-xlsx');
    const rels = (await text('xl/_rels/workbook.xml.rels')) || '';
    const relMap = {};
    rels.replace(/<Relationship\b([^>]*?)\/?>/g, (_, a) => { const o = attrs(a); relMap[o.Id] = o.Target; return ''; });

    const shared = parseSharedStrings(await text('xl/sharedStrings.xml'));
    const styles = parseStyles(await text('xl/styles.xml'));

    const sheets = [];
    const sheetTags = [];
    workbook.replace(/<sheet\b([^>]*?)\/?>/g, (_, a) => { sheetTags.push(attrs(a)); return ''; });
    for (const s of sheetTags) {
      let target = relMap[s['r:id']] || '';
      target = target.replace(/^\//, '');
      const file = target.startsWith('xl/') ? target : 'xl/' + target;
      const xml = await text(file);
      if (!xml) continue;
      sheets.push(Object.assign({ name: s.name }, parseSheet(xml, shared, styles)));
    }
    const files = Object.keys(zip.files);
    const hasChart = files.some((n) => /^xl\/charts\/chart\d*\.xml$/.test(n));
    const tableCount = files.filter((n) => /^xl\/tables\/table\d*\.xml$/.test(n)).length;
    const hasSlicer = files.some((n) => /^xl\/slicers\/slicer\d*\.xml$/.test(n));
    const pivots = await readPivots(zip, text);
    return { sheets, hasChart, tableCount, hasSlicer, pivots };
  }

  return { read };
})();

if (typeof module !== 'undefined') module.exports = XlsxReader;
