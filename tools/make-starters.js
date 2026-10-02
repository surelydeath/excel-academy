/* Generates the Excel files used by the build projects:
     assets/<project>-depart-<lang>.xlsx  (plain starter the learner builds on)
     assets/<project>-modele-<lang>.xlsx  (finished, pastel model to compare with)
   Run:  npm run build:starters                                            */
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const PASTEL = { pink: 'FFF9B9D0', blue: 'FFA8D3F5', peach: 'FFFDE9D8', green: 'FFE4F5DA', lilac: 'FFD3B6F3' };
const LABELS = {
  fr: {
    sheet: 'Calculateur', title: 'Calculateur de prix', head: ['Élément', 'Valeur'],
    rows: ['Coût des matières', 'Temps de fabrication (min)', 'Taux horaire', 'Autres coûts (emballage…)', 'Taux de marge souhaité', 'TVA'],
    out: ['Coût de revient', 'Prix de vente HT', 'Prix de vente TTC', 'Bénéfice par produit', 'Taux de marque'],
    money: '#,##0.00\\ "$"',
  },
  en: {
    sheet: 'Calculator', title: 'Price calculator', head: ['Item', 'Value'],
    rows: ['Material cost', 'Production time (min)', 'Hourly rate', 'Other costs (packaging…)', 'Desired markup', 'VAT'],
    out: ['Cost price', 'Selling price excl. VAT', 'Selling price incl. VAT', 'Profit per product', 'Margin rate'],
    money: '"$"#,##0.00',
  },
};
const INPUTS = [5.5, 30, 15, 1.58, 0.5, 0.2];
// Model results for the default inputs (cached values so viewers that don't recalc still show numbers)
const COST = 5.5 + (30 / 60) * 15 + 1.58, HT = COST * 1.5, TTC = HT * 1.2;

function base(lang) {
  const L = LABELS[lang];
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Excel Académie';
  const ws = wb.addWorksheet(L.sheet);
  ws.getColumn(1).width = 34; ws.getColumn(2).width = 18;
  ws.getCell('A1').value = L.title;
  ws.getCell('A2').value = L.head[0]; ws.getCell('B2').value = L.head[1];
  L.rows.forEach((label, i) => { ws.getCell('A' + (3 + i)).value = label; ws.getCell('B' + (3 + i)).value = INPUTS[i]; });
  L.out.forEach((label, i) => { ws.getCell('A' + (10 + i)).value = label; });
  return { wb, ws, L };
}

async function starter(lang) {
  const { wb } = base(lang);
  await wb.xlsx.writeFile(path.join(OUT, `calculateur-prix-depart-${lang}.xlsx`));
}

async function model(lang) {
  const { wb, ws, L } = base(lang);
  const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
  ws.getCell('A1').font = { bold: true, size: 18, color: { argb: 'FF40304F' } };
  ['A2', 'B2'].forEach((a) => { ws.getCell(a).fill = fill(PASTEL.pink); ws.getCell(a).font = { bold: true, color: { argb: 'FFFFFFFF' } }; });
  ws.getCell('B2').alignment = { horizontal: 'right' };

  const f = { B10: 'B3+B4/60*B5+B6', B11: 'B10*(1+B7)', B12: 'B11*(1+B8)', B13: 'B11-B10', B14: 'B13/B11' };
  const r = { B10: COST, B11: HT, B12: TTC, B13: HT - COST, B14: (HT - COST) / HT };
  Object.keys(f).forEach((a) => { ws.getCell(a).value = { formula: f[a], result: r[a] }; });

  ['B3', 'B5', 'B6', 'B10', 'B11', 'B12', 'B13'].forEach((a) => { ws.getCell(a).numFmt = L.money; });
  ['B7', 'B8'].forEach((a) => { ws.getCell(a).numFmt = '0%'; });
  ws.getCell('B14').numFmt = '0.0%';
  for (let row = 3; row <= 8; row++) ws.getCell('B' + row).fill = fill(PASTEL.peach);
  for (let row = 10; row <= 14; row++) { ws.getCell('B' + row).fill = fill(PASTEL.green); ws.getCell('A' + row).font = { bold: row === 12 }; }

  // bonus: conditional formatting + dropdown for the VAT rate
  ws.addConditionalFormatting({
    ref: 'B14',
    rules: [{ type: 'cellIs', operator: 'lessThan', formulae: [0.2], style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFDE0EA' } } } }],
  });
  ws.getCell('B8').dataValidation = { type: 'list', allowBlank: false, formulae: ['"0.055,0.1,0.2"'] };

  await wb.xlsx.writeFile(path.join(OUT, `calculateur-prix-modele-${lang}.xlsx`));
}

(async () => {
  for (const lang of ['fr', 'en']) { await starter(lang); await model(lang); }
  console.log('Written to', OUT, fs.readdirSync(OUT).join(', '));
})();
