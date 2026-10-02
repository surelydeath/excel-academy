/* Build-project self-test, for EVERY build project:
   - the finished model (when there is one) passes every required check
   - the plain starter fails every required check
   - "sneaky" files (typed numbers, wrong formulas, missing features...) are caught
   Run:  node tests/verify-projects.js                                           */
const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');
const JSZip = require('jszip');
const ExcelJS = require('exceljs');
const { HyperFormula } = require('hyperformula');
global.HyperFormula = HyperFormula;
global.window = global;
require(path.join(root, 'content/chapters.js'));
require(path.join(root, 'content/lessons-2.js'));
const XlsxReader = require(path.join(root, 'js/xlsx-reader.js'));
const ProjectChecks = require(path.join(root, 'js/project-checks.js'));

const projects = CHAPTERS.flatMap((c) => c.lessons).filter((l) => l.type === 'build');
const byId = (id) => projects.find((p) => p.id === id);
let failures = 0;
const expect = (cond, msg) => { if (!cond) { failures++; console.log('  ✗ ' + msg); } else console.log('  ✓ ' + msg); };
const summarize = (res) => res.map((r) => (r.ok ? '✓' : '✗') + r.id).join(' ');
const plain = (html) => html.replace(/<[^>]+>/g, '');

const asset = (p, kind, lang) => path.join(root, p.files[kind][lang].replace(/\\/g, '/'));
async function check(project, buf, lang) {
  const wb = await XlsxReader.read(buf, JSZip);
  return ProjectChecks.run(project, wb, lang);
}
async function variant(project, kind, lang, edit) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(asset(project, kind, lang));
  await edit(wb.worksheets[0], wb);
  return wb.xlsx.writeBuffer();
}
const get = (res, id) => res.find((r) => r.id === id);

// Minimal pivot table parts, shaped like the ones Excel writes (for the pivot project)
async function withPivot(project, lang, opts = {}) {
  const names = lang === 'fr' ? ['Date', 'Catégorie', 'Produit', 'Région', 'Montant'] : ['Date', 'Category', 'Product', 'Region', 'Amount'];
  const zip = await JSZip.loadAsync(fs.readFileSync(asset(project, 'start', lang)));
  const ns = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
  zip.file('xl/pivotCache/pivotCacheDefinition1.xml', `<?xml version="1.0" encoding="UTF-8"?><pivotCacheDefinition ${ns}><cacheSource type="worksheet"><worksheetSource ref="A1:E41" sheet="Ventes"/></cacheSource><cacheFields count="5">${names.map((n) => `<cacheField name="${n}" numFmtId="0"><sharedItems/></cacheField>`).join('')}</cacheFields></pivotCacheDefinition>`);
  const axis = (i) => (i === (opts.rowIdx ?? 1) ? 'axisRow' : i === opts.colIdx ? 'axisCol' : '');
  const pf = names.map((_, i) => (axis(i) ? `<pivotField axis="${axis(i)}" showAll="0"><items count="2"><item x="0"/><item t="default"/></items></pivotField>` : i === 4 && !opts.noData ? '<pivotField dataField="1" showAll="0"/>' : '<pivotField showAll="0"/>')).join('');
  zip.file('xl/pivotTables/pivotTable1.xml', `<?xml version="1.0" encoding="UTF-8"?><pivotTableDefinition ${ns} name="PivotTable1" cacheId="1"><location ref="A3:B7"/><pivotFields count="5">${pf}</pivotFields><rowFields count="1"><field x="${opts.rowIdx ?? 1}"/></rowFields>${opts.noData ? '' : `<dataFields count="1"><dataField name="Sum of ${names[4]}" fld="4" baseField="0" baseItem="0"${opts.agg ? ` subtotal="${opts.agg}"` : ''}/></dataFields>`}</pivotTableDefinition>`);
  zip.file('xl/pivotTables/_rels/pivotTable1.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/pivotCacheDefinition" Target="../pivotCache/pivotCacheDefinition1.xml"/></Relationships>');
  if (opts.slicer) zip.file('xl/slicers/slicer1.xml', '<slicers/>');
  return zip.generateAsync({ type: 'nodebuffer' });
}

(async () => {
  for (const lang of ['fr', 'en']) {
    console.log('\n########## ' + lang.toUpperCase() + ' ##########');

    /* ---------- generic checks for every project ---------- */
    for (const p of projects) {
      console.log('\n[' + p.id + '] ' + p.title.en);
      if (p.files.model) {
        const res = await check(p, fs.readFileSync(asset(p, 'model', lang)), lang);
        expect(res.filter((r) => !r.bonus).every((r) => r.ok), 'finished model passes every required check  [' + summarize(res) + ']');
      } else console.log('  · no finished model for this project');
      const res0 = await check(p, fs.readFileSync(asset(p, 'start', lang)), lang);
      expect(res0.filter((r) => !r.bonus).every((r) => !r.ok), 'plain starter fails every required check  [' + summarize(res0) + ']');
    }

    /* ---------- p1: price calculator ---------- */
    {
      const p = byId('p1'); console.log('\n[p1] sneaky variants');
      let res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('B14').value = 0.3333; }), lang);
      expect(!get(res, 'c14').ok && /=/.test(get(res, 'c14').msg) && get(res, 'c10').ok, 'typed number in B14 is caught, other formulas pass');
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('B10').value = { formula: 'B3+B4/60*15+B6', result: 14.58 }; }), lang);
      expect(!get(res, 'c10').ok, 'hard-coded hourly rate is caught: ' + plain(get(res, 'c10').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('B10').value = { formula: 'B3+B4*B5+B6', result: 0 }; }), lang);
      expect(!get(res, 'c10').ok && /<strong>/.test(get(res, 'c10').msg), 'wrong formula shows got vs expected: ' + plain(get(res, 'c10').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('B3').value = 12; ws.getCell('B7').value = 0.8; }), lang);
      expect(res.filter((r) => !r.bonus).every((r) => r.ok), 'still passes when she changes her own inputs');
      res = await check(p, await variant(p, 'model', lang, (ws) => { for (let r = 10; r <= 14; r++) ws.getCell('B' + r).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE9D8' } }; }), lang);
      expect(!get(res, 'd5').ok, 'same colour for inputs and results is flagged');
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('B10').numFmt = '"€"#,##0.00'; }), lang);
      expect(!get(res, 'd1').ok && /euro/i.test(plain(get(res, 'd1').msg)), 'euros instead of dollars are flagged: ' + plain(get(res, 'd1').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('B10').numFmt = '[$$-1009]#,##0.00'; ws.getCell('B11').numFmt = '[$$-C0C]#,##0.00'; }), lang);
      expect(get(res, 'd1').ok, 'Canadian locale currency tags ([$$-1009], [$$-C0C]) are accepted');
      const zip = await JSZip.loadAsync(fs.readFileSync(asset(p, 'model', lang)));
      zip.file('xl/charts/chart1.xml', '<c:chartSpace/>');
      res = await check(p, await zip.generateAsync({ type: 'nodebuffer' }), lang);
      expect(get(res, 'b3').ok, 'chart bonus detected');
    }

    /* ---------- p2: quote tracker ---------- */
    {
      const p = byId('p2'); console.log('\n[p2] sneaky variants');
      let res = await check(p, fs.readFileSync(asset(p, 'model', lang)), lang);
      expect(get(res, 'b1').ok, 'bonus: frozen panes detected');
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('E5').value = 4321.5; }), lang);
      expect(!get(res, 'c5').ok && /=/.test(get(res, 'c5').msg), 'typed total is caught: ' + plain(get(res, 'c5').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('B4').value = { formula: 'COUNTIF(I8:I17,"' + (lang === 'fr' ? 'Accepté' : 'Accepted') + '")', result: 3 }; }), lang);
      expect(get(res, 'c3').ok, 'a literal word as criterion is fine when it matches the list');
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('B5').value = { formula: '4', result: 4 }; }), lang);
      expect(!get(res, 'c3').ok, 'a formula that just returns 4 is caught: ' + plain(get(res, 'c3').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('H9').value = { formula: 'C9+30', result: 0 }; }), lang);
      expect(!get(res, 'c2').ok && /H9/.test(get(res, 'c2').msg), 'validity hard-coded to 30 days is caught: ' + plain(get(res, 'c2').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('G10').value = { formula: 'E10*1.14975', result: 0 }; }), lang);
      expect(!get(res, 'c1').ok, 'tax rate typed into the formula is caught: ' + plain(get(res, 'c1').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { for (let n = 8; n <= 17; n++) ws.getCell('I' + n).dataValidation = undefined; }), lang);
      expect(!get(res, 'd6').ok, 'missing dropdown is caught: ' + plain(get(res, 'd6').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.conditionalFormattings = []; }), lang);
      expect(!get(res, 'd7').ok, 'missing status colours are caught: ' + plain(get(res, 'd7').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('I8').value = ws.getCell('K9').value; ws.getCell('I9').value = ws.getCell('K8').value; ws.getCell('E12').value = 999; }), lang);
      expect(res.filter((r) => !r.bonus).every((r) => r.ok), 'still passes when she edits statuses and amounts');
    }

    /* ---------- m6: monthly budget ---------- */
    {
      const p = byId('m6'); console.log('\n[m6] sneaky variants');
      let res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('C13').value = 2639.95; }), lang);
      expect(!get(res, 'c3').ok && /=/.test(get(res, 'c3').msg), 'typed total is caught: ' + plain(get(res, 'c3').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('E7').value = { formula: 'C7/B4', result: 0 }; }), lang);
      expect(!get(res, 'c2').ok, 'income not locked with $ (C7/B4) is caught: ' + plain(get(res, 'c2').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('E8').value = { formula: 'C8/3400', result: 0 }; }), lang);
      expect(!get(res, 'c2').ok && /E8/.test(get(res, 'c2').msg), 'income typed into the formula is caught: ' + plain(get(res, 'c2').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('B17').value = { formula: '2', result: 2 }; }), lang);
      expect(!get(res, 'c7').ok, 'a count that just returns 2 is caught: ' + plain(get(res, 'c7').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('B16').value = { formula: 'C11/C13', result: 0 }; }), lang);
      expect(!get(res, 'c6').ok, 'savings rate on the wrong base is caught: ' + plain(get(res, 'c6').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.conditionalFormattings = []; }), lang);
      expect(!get(res, 'd6').ok, 'missing pink alert is caught: ' + plain(get(res, 'd6').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { for (let r = 13; r <= 17; r++) ['B', 'C', 'D', 'E'].forEach((c) => { ws.getCell(c + r).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE9D8' } }; }); }), lang);
      expect(!get(res, 'd5').ok, 'same colour for inputs and results is flagged');
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('B3').value = 5200; ws.getCell('C8').value = 410; ws.getCell('B9').value = 150; }), lang);
      expect(res.filter((r) => !r.bonus).every((r) => r.ok), 'still passes when she changes her income and expenses');
    }

    /* ---------- t2: clean sales list ---------- */
    {
      const p = byId('t2'); console.log('\n[t2] sneaky variants');
      let res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('F5').value = 99; }), lang);
      expect(!get(res, 'c1').ok, 'typed total is caught: ' + plain(get(res, 'c1').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.getCell('F4').value = { formula: 'Sales[[#This Row],[Quantity]]*Sales[[#This Row],[Unit price]]', result: 48 }; }), lang);
      expect(!get(res, 'c1').ok && /D2\*E2/.test(get(res, 'c1').msg), 'structured references get a clear message: ' + plain(get(res, 'c1').msg));
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.views = [{}]; }), lang);
      expect(!get(res, 's2').ok, 'missing frozen header is caught');
      res = await check(p, await variant(p, 'model', lang, (ws) => { ws.autoFilter = undefined; }), lang);
      expect(!get(res, 's1').ok, 'no filter at all is caught: ' + plain(get(res, 's1').msg));
      const zip = await JSZip.loadAsync(fs.readFileSync(asset(p, 'model', lang)));
      zip.file('xl/tables/table1.xml', '<table/>');
      res = await check(p, await zip.generateAsync({ type: 'nodebuffer' }), lang);
      expect(get(res, 'b1').ok, 'real Excel table detected (bonus)');
    }

    /* ---------- v2: pivot table ---------- */
    {
      const p = byId('v2'); console.log('\n[v2] pivot table checks');
      let res = await check(p, await withPivot(p, lang), lang);
      expect(res.filter((r) => !r.bonus).every((r) => r.ok), 'category in rows + sum of amount passes  [' + summarize(res) + ']');
      expect(!get(res, 'b1').ok && !get(res, 'b2').ok, 'no second dimension / slicer yet');
      res = await check(p, await withPivot(p, lang, { colIdx: 3, slicer: true }), lang);
      expect(get(res, 'b1').ok && get(res, 'b2').ok, 'bonus: second dimension in Columns + slicer detected');
      res = await check(p, await withPivot(p, lang, { noData: true }), lang);
      expect(get(res, 'p1').ok && !get(res, 'p2').ok, 'missing Values field is caught: ' + plain(get(res, 'p2').msg));
      res = await check(p, await withPivot(p, lang, { rowIdx: 2 }), lang);
      expect(!get(res, 'p1').ok, 'wrong field in Rows is caught: ' + plain(get(res, 'p1').msg));
      res = await check(p, await withPivot(p, lang, { agg: 'count' }), lang);
      expect(!get(res, 'p2').ok, 'Count instead of Sum is caught');
    }
  }

  console.log('\nnot an xlsx file');
  let threw = false;
  try { await XlsxReader.read(Buffer.from('hello'), JSZip); } catch (e) { threw = true; }
  expect(threw, 'reader rejects a non-xlsx file');

  console.log(failures ? '\n' + failures + ' problem(s)' : '\nAll project checks verified ✔');
  process.exit(failures ? 1 : 0);
})();
