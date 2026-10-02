/* Reads an .xlsx file entirely in the browser (nothing is uploaded anywhere).
   An .xlsx is a zip of XML files; we read just what the project checks need:
   cell values, formulas, fills, bold, number formats, charts, validations.   */
const XlsxReader = (() => {
  const unescapeXml = (s) =>
    s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/&amp;/g, '&');

  const attrs = (s) => { const o = {}; s.replace(/([\w:]+)\s*=\s*"([^"]*)"/g, (_, k, v) => { o[k] = unescapeXml(v); return ''; }); return o; };

  const BUILTIN_FMT = { 0: 'General', 1: '0', 2: '0.00', 3: '#,##0', 4: '#,##0.00', 9: '0%', 10: '0.00%', 11: '0.00E+00', 12: '# ?/?', 13: '# ??/??' };
  // built-in currency / accounting ids (symbol depends on the user's region, so the code is unknown)
  const BUILTIN_CURRENCY = new Set([5, 6, 7, 8, 41, 42, 43, 44]);

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
      let key = c.rgb ? c.rgb.toUpperCase() : c.theme !== undefined ? 'theme' + c.theme + ':' + (c.tint || 0) : c.indexed !== undefined ? 'idx' + c.indexed : 'none';
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
    return {
      cells,
      hasConditionalFormatting: /<conditionalFormatting\b/.test(xml),
      hasDataValidation: /<dataValidation\b/.test(xml),
    };
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
    const hasChart = Object.keys(zip.files).some((n) => /^xl\/charts\/chart\d*\.xml$/.test(n));
    return { sheets, hasChart };
  }

  return { read };
})();

if (typeof module !== 'undefined') module.exports = XlsxReader;
