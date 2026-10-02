/* Build-project self-test. The finished model must pass every required check,
   the plain starter must fail them, and "sneaky" variants must be caught.
   Run:  node tests/verify-projects.js                                       */
const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');
const JSZip = require('jszip');
const ExcelJS = require('exceljs');
const { HyperFormula } = require('hyperformula');
global.HyperFormula = HyperFormula;
global.window = global;
require(path.join(root, 'content/chapters.js'));
const XlsxReader = require(path.join(root, 'js/xlsx-reader.js'));
const ProjectChecks = require(path.join(root, 'js/project-checks.js'));

const project = CHAPTERS.flatMap((c) => c.lessons).find((l) => l.type === 'build');
let failures = 0;
const expect = (cond, msg) => { if (!cond) { failures++; console.log('  ✗ ' + msg); } else console.log('  ✓ ' + msg); };
const summarize = (res) => res.map((r) => (r.ok ? '✓' : '✗') + r.id).join(' ');

async function check(buf, lang) {
  const wb = await XlsxReader.read(buf, JSZip);
  return ProjectChecks.run(project, wb, lang);
}
async function variant(file, edit) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.join(root, 'assets', file));
  edit(wb.worksheets[0]);
  return wb.xlsx.writeBuffer();
}

(async () => {
  for (const lang of ['fr', 'en']) {
    console.log('\n=== ' + lang.toUpperCase() + ' ===');

    console.log('model file');
    let res = await check(fs.readFileSync(path.join(root, 'assets', `calculateur-prix-modele-${lang}.xlsx`)), lang);
    const required = res.filter((r) => !r.bonus);
    expect(required.every((r) => r.ok), 'all required checks pass  [' + summarize(res) + ']');
    expect(res.find((r) => r.id === 'b1').ok && res.find((r) => r.id === 'b2').ok, 'bonus: conditional formatting + dropdown detected');
    expect(!res.find((r) => r.id === 'b3').ok, 'bonus: no chart in model (expected)');

    console.log('plain starter');
    res = await check(fs.readFileSync(path.join(root, 'assets', `calculateur-prix-depart-${lang}.xlsx`)), lang);
    expect(res.filter((r) => !r.bonus).every((r) => !r.ok), 'every required check fails  [' + summarize(res) + ']');

    console.log('sneaky: results typed as numbers');
    let buf = await variant(`calculateur-prix-modele-${lang}.xlsx`, (ws) => { ws.getCell('B14').value = 0.3333; });
    res = await check(buf, lang);
    expect(!res.find((r) => r.id === 'c14').ok && /=/.test(res.find((r) => r.id === 'c14').msg), 'B14 typed number is caught: ' + res.find((r) => r.id === 'c14').msg);
    expect(res.find((r) => r.id === 'c10').ok && res.find((r) => r.id === 'c13').ok, 'the other formulas still pass');

    console.log('sneaky: formula that ignores a starting cell (hard-coded 15 €/h)');
    buf = await variant(`calculateur-prix-modele-${lang}.xlsx`, (ws) => { ws.getCell('B10').value = { formula: 'B3+B4/60*15+B6', result: 14.58 }; });
    res = await check(buf, lang);
    expect(!res.find((r) => r.id === 'c10').ok, 'caught when starting values change: ' + res.find((r) => r.id === 'c10').msg);

    console.log('wrong formula (forgot the 60)');
    buf = await variant(`calculateur-prix-modele-${lang}.xlsx`, (ws) => { ws.getCell('B10').value = { formula: 'B3+B4*B5+B6', result: 0 }; });
    res = await check(buf, lang);
    expect(!res.find((r) => r.id === 'c10').ok && /<strong>/.test(res.find((r) => r.id === 'c10').msg), 'shows got vs expected: ' + res.find((r) => r.id === 'c10').msg.replace(/<[^>]+>/g, ''));

    console.log('learner changed her own inputs (still a correct file)');
    buf = await variant(`calculateur-prix-modele-${lang}.xlsx`, (ws) => { ws.getCell('B3').value = 12; ws.getCell('B7').value = 0.8; });
    res = await check(buf, lang);
    expect(res.filter((r) => !r.bonus).every((r) => r.ok), 'still passes with different inputs');

    console.log('same colour for inputs and results');
    buf = await variant(`calculateur-prix-modele-${lang}.xlsx`, (ws) => {
      for (let r = 10; r <= 14; r++) ws.getCell('B' + r).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE9D8' } };
    });
    res = await check(buf, lang);
    expect(!res.find((r) => r.id === 'd5').ok, 'identical colours flagged: ' + res.find((r) => r.id === 'd5').msg);

    console.log('dollar format instead of euro');
    buf = await variant(`calculateur-prix-modele-${lang}.xlsx`, (ws) => { ws.getCell('B10').numFmt = '"$"#,##0.00'; });
    res = await check(buf, lang);
    expect(!res.find((r) => r.id === 'd1').ok, 'non-euro currency flagged: ' + res.find((r) => r.id === 'd1').msg);

    console.log('chart detection (zip contains a chart part)');
    const zip = await JSZip.loadAsync(fs.readFileSync(path.join(root, 'assets', `calculateur-prix-modele-${lang}.xlsx`)));
    zip.file('xl/charts/chart1.xml', '<c:chartSpace/>');
    res = await check(await zip.generateAsync({ type: 'nodebuffer' }), lang);
    expect(res.find((r) => r.id === 'b3').ok, 'chart bonus detected');
  }

  console.log('\nnot an xlsx file');
  let threw = false;
  try { await XlsxReader.read(Buffer.from('hello'), JSZip); } catch (e) { threw = true; }
  expect(threw, 'reader rejects a non-xlsx file');

  console.log(failures ? '\n' + failures + ' problem(s)' : '\nAll project checks verified ✔');
  process.exit(failures ? 1 : 0);
})();
