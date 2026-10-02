/* Starter + model Excel files for the other build projects:
     suivi-devis   : quote tracker (statuses, dropdown, colours, summary)
     liste-ventes  : a clean, structured sales list (the Tables chapter)
     donnees-tcd   : raw data for the first pivot table
   Run:  npm run build:starters                                             */
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const PASTEL = { pink: 'FFF9B9D0', blue: 'FFA8D3F5', peach: 'FFFDE9D8', green: 'FFE4F5DA', yellow: 'FFFEF3C7', red: 'FFFDE0EA', lilac: 'FFD3B6F3' };
const serial = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 864e5);
const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const FMT = {
  fr: { money: '#,##0.00\\ "$"', date: 'dd/mm/yyyy' },
  en: { money: '"$"#,##0.00', date: 'mm/dd/yyyy' },
};

/* ------------------------------------------------------------------ quote tracker */
const QUOTES = [
  // client, date, validity (days), amount before tax, tax rate (14.975% QC, 5% GST only, 13% ON), status index (0 accepted, 1 pending, 2 declined)
  ['Atelier Lumen', [2025, 1, 6], 30, 2440, 0.14975, 2],
  ['Studio Nomade', [2025, 1, 14], 30, 1265, 0.14975, 0],
  ['Maison Ardoise', [2025, 1, 20], 60, 1890, 0.05, 0],
  ['Nova & Co', [2025, 2, 3], 30, 246, 0.14975, 1],
  ['Les Petites Pixels', [2025, 2, 10], 15, 452.5, 0.14975, 2],
  ['Julien Moreau', [2025, 2, 24], 45, 3200, 0.14975, 1],
  ['Camille Richard', [2025, 3, 4], 30, 980, 0.13, 0],
  ['Echo Concept', [2025, 3, 18], 60, 1500, 0.14975, 1],
  ['Sophie Lambert', [2025, 3, 27], 15, 610, 0.14975, 2],
  ['Studio Equinoxe', [2025, 4, 8], 30, 2150, 0.14975, 1],
];
const QL = {
  fr: {
    sheet: 'Devis', title: 'Suivi de devis', sum: ['Nombre de devis', 'Devis acceptés', 'En attente', 'Refusés'], sum2: ['Taux de conversion', 'Montant total taxes incluses', 'Montant accepté taxes incluses'],
    head: ['N°', 'Client', 'Date du devis', 'Validité (jours)', 'Montant avant taxes', 'Taxes', 'Montant taxes incluses', 'Date limite', 'Statut'], legend: 'Statuts', statuses: ['Accepté', 'En attente', 'Refusé'],
  },
  en: {
    sheet: 'Quotes', title: 'Quote tracker', sum: ['Number of quotes', 'Accepted quotes', 'Pending', 'Declined'], sum2: ['Conversion rate', 'Total with tax', 'Accepted with tax'],
    head: ['No.', 'Client', 'Quote date', 'Validity (days)', 'Amount before tax', 'Tax', 'Amount with tax', 'Deadline', 'Status'], legend: 'Statuses', statuses: ['Accepted', 'Pending', 'Declined'],
  },
};

function quoteBase(lang) {
  const L = QL[lang], wb = new ExcelJS.Workbook();
  wb.creator = 'Excel Académie';
  const ws = wb.addWorksheet(L.sheet);
  [12, 22, 15, 16, 16, 9, 16, 15, 14, 3, 14].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  ws.getCell('A1').value = L.title;
  L.sum.forEach((t, i) => { ws.getCell('A' + (3 + i)).value = t; });
  L.sum2.forEach((t, i) => { ws.getCell('D' + (3 + i)).value = t; });
  L.head.forEach((t, i) => { ws.getCell(7, i + 1).value = t; });
  ws.getCell('K7').value = L.legend;
  L.statuses.forEach((t, i) => { ws.getCell('K' + (8 + i)).value = t; });
  QUOTES.forEach((q, i) => {
    const r = 8 + i;
    ws.getCell('A' + r).value = 'D-' + String(i + 1).padStart(3, '0');
    ws.getCell('B' + r).value = q[0];
    const c = ws.getCell('C' + r); c.value = serial(...q[1]); c.numFmt = FMT[lang].date;
    ws.getCell('D' + r).value = q[2];
    ws.getCell('E' + r).value = q[3];
    ws.getCell('F' + r).value = q[4];
    ws.getCell('I' + r).value = L.statuses[q[5]];
  });
  return { wb, ws, L };
}

async function quoteStarter(lang) {
  await quoteBase(lang).wb.xlsx.writeFile(path.join(OUT, `suivi-devis-depart-${lang}.xlsx`));
}

async function quoteModel(lang) {
  const { wb, ws, L } = quoteBase(lang);
  const f = FMT[lang];
  ws.getCell('A1').font = { bold: true, size: 18, color: { argb: 'FF40304F' } };
  for (let c = 1; c <= 9; c++) { const h = ws.getCell(7, c); h.fill = fill(PASTEL.pink); h.font = { bold: true, color: { argb: 'FFFFFFFF' } }; }
  ws.getCell('K7').font = { bold: true };

  const rows = QUOTES.map((q) => ({ ht: q[3], vat: q[4], date: serial(...q[1]), days: q[2], st: q[5] }));
  const ttc = rows.map((r) => r.ht * (1 + r.vat));
  rows.forEach((r, i) => {
    const n = 8 + i;
    ws.getCell('G' + n).value = { formula: `E${n}*(1+F${n})`, result: ttc[i] };
    ws.getCell('H' + n).value = { formula: `C${n}+D${n}`, result: r.date + r.days };
    ws.getCell('E' + n).numFmt = f.money; ws.getCell('G' + n).numFmt = f.money;
    ws.getCell('F' + n).numFmt = '0.0##%';
    ws.getCell('H' + n).numFmt = f.date;
  });
  const acc = rows.filter((r) => r.st === 0), pen = rows.filter((r) => r.st === 1), dec = rows.filter((r) => r.st === 2);
  const total = ttc.reduce((a, b) => a + b, 0), accTotal = rows.reduce((a, r, i) => a + (r.st === 0 ? ttc[i] : 0), 0);
  ws.getCell('B3').value = { formula: 'COUNTA(A8:A17)', result: rows.length };
  ws.getCell('B4').value = { formula: 'COUNTIF(I8:I17,K8)', result: acc.length };
  ws.getCell('B5').value = { formula: 'COUNTIF(I8:I17,K9)', result: pen.length };
  ws.getCell('B6').value = { formula: 'COUNTIF(I8:I17,K10)', result: dec.length };
  ws.getCell('E3').value = { formula: 'B4/B3', result: acc.length / rows.length }; ws.getCell('E3').numFmt = '0.0%';
  ws.getCell('E4').value = { formula: 'SUM(G8:G17)', result: total }; ws.getCell('E4').numFmt = f.money;
  ws.getCell('E5').value = { formula: 'SUMIF(I8:I17,K8,G8:G17)', result: accTotal }; ws.getCell('E5').numFmt = f.money;
  ['B3', 'B4', 'B5', 'B6', 'E3', 'E4', 'E5'].forEach((a) => { ws.getCell(a).fill = fill(PASTEL.green); ws.getCell(a).font = { bold: true }; });

  ws.getCell('I8').dataValidation = undefined;
  for (let n = 8; n <= 17; n++) ws.getCell('I' + n).dataValidation = { type: 'list', allowBlank: false, formulae: ['$K$8:$K$10'] };
  const rule = (k, argb) => ({ type: 'expression', formulae: [`$I8=$K$${8 + k}`], style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb } } } });
  ws.addConditionalFormatting({ ref: 'I8:I17', rules: [rule(0, PASTEL.green), rule(1, PASTEL.yellow), rule(2, PASTEL.red)] });
  ws.views = [{ state: 'frozen', ySplit: 7 }];
  await wb.xlsx.writeFile(path.join(OUT, `suivi-devis-modele-${lang}.xlsx`));
}

/* ------------------------------------------------------------------ clean sales list (Tables) */
const SALES = [
  ['Studio Nomade', 'Bougie Lune', 3, 12, [2025, 1, 6]], ['Atelier Lumen', 'Savon Menthe', 12, 6, [2025, 1, 9]], ['Nova & Co', 'Diffuseur Ambre', 2, 24, [2025, 1, 15]],
  ['Maison Ardoise', 'Bougie Soleil', 6, 15, [2025, 1, 22]], ['Camille Richard', 'Savon Miel', 8, 7, [2025, 2, 3]], ['Studio Nomade', 'Bougie Étoile', 4, 9, [2025, 2, 11]],
  ['Echo Concept', 'Diffuseur Ambre', 1, 24, [2025, 2, 18]], ['Atelier Lumen', 'Bougie Lune', 10, 12, [2025, 2, 26]], ['Julien Moreau', 'Savon Menthe', 5, 6, [2025, 3, 5]],
  ['Nova & Co', 'Bougie Soleil', 3, 15, [2025, 3, 14]], ['Maison Ardoise', 'Savon Miel', 20, 7, [2025, 3, 21]], ['Camille Richard', 'Bougie Étoile', 2, 9, [2025, 3, 28]],
];
const SL = {
  fr: { sheet: 'Ventes', head: ['Date', 'Client', 'Produit', 'Quantité', 'Prix unitaire', 'Total'], tableName: 'Ventes' },
  en: { sheet: 'Sales', head: ['Date', 'Client', 'Product', 'Quantity', 'Unit price', 'Total'], tableName: 'Sales' },
};

function salesBase(lang) {
  const L = SL[lang], wb = new ExcelJS.Workbook();
  wb.creator = 'Excel Académie';
  const ws = wb.addWorksheet(L.sheet);
  [14, 22, 20, 12, 14, 14].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  L.head.forEach((t, i) => { ws.getCell(1, i + 1).value = t; });
  SALES.forEach((r, i) => {
    const n = 2 + i;
    ws.getCell('A' + n).value = serial(...r[4]);   // raw serial number: she will format it as a date
    ws.getCell('B' + n).value = r[0]; ws.getCell('C' + n).value = r[1];
    ws.getCell('D' + n).value = r[2]; ws.getCell('E' + n).value = r[3];
  });
  return { wb, ws, L };
}
async function salesStarter(lang) { await salesBase(lang).wb.xlsx.writeFile(path.join(OUT, `liste-ventes-depart-${lang}.xlsx`)); }
async function salesModel(lang) {
  const { wb, ws, L } = salesBase(lang);
  const f = FMT[lang];
  SALES.forEach((r, i) => {
    const n = 2 + i;
    ws.getCell('F' + n).value = { formula: `D${n}*E${n}`, result: r[2] * r[3] };
    ws.getCell('A' + n).numFmt = f.date; ws.getCell('E' + n).numFmt = f.money; ws.getCell('F' + n).numFmt = f.money;
  });
  for (let c = 1; c <= 6; c++) { const h = ws.getCell(1, c); h.fill = fill(PASTEL.blue); h.font = { bold: true }; }
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = 'A1:F13';
  await wb.xlsx.writeFile(path.join(OUT, `liste-ventes-modele-${lang}.xlsx`));
}

/* ------------------------------------------------------------------ pivot table data */
const PL = {
  fr: { sheet: 'Ventes', head: ['Date', 'Catégorie', 'Produit', 'Région', 'Montant'], cats: [['Bougies', ['Bougie Lune', 'Bougie Soleil', 'Bougie Étoile']], ['Savons', ['Savon Menthe', 'Savon Miel']], ['Diffuseurs', ['Diffuseur Ambre']]], regions: ['Nord', 'Sud', 'Est', 'Ouest'] },
  en: { sheet: 'Sales', head: ['Date', 'Category', 'Product', 'Region', 'Amount'], cats: [['Candles', ['Moon Candle', 'Sun Candle', 'Star Candle']], ['Soaps', ['Mint Soap', 'Honey Soap']], ['Diffusers', ['Amber Diffuser']]], regions: ['North', 'South', 'East', 'West'] },
};
async function pivotStarter(lang) {
  const L = PL[lang], wb = new ExcelJS.Workbook();
  wb.creator = 'Excel Académie';
  const ws = wb.addWorksheet(L.sheet);
  [14, 16, 20, 12, 12].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  L.head.forEach((t, i) => { const c = ws.getCell(1, i + 1); c.value = t; c.font = { bold: true }; c.fill = fill(PASTEL.lilac); });
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 40; i++) {
    const n = 2 + i, [cat, prods] = L.cats[Math.floor(rnd() * L.cats.length)];
    const date = ws.getCell('A' + n); date.value = serial(2025, 1 + Math.floor(i / 7), 1 + ((i * 5) % 27)); date.numFmt = FMT[lang].date;
    ws.getCell('B' + n).value = cat;
    ws.getCell('C' + n).value = prods[Math.floor(rnd() * prods.length)];
    ws.getCell('D' + n).value = L.regions[Math.floor(rnd() * L.regions.length)];
    ws.getCell('E' + n).value = Math.round((20 + rnd() * 380) * 100) / 100;
  }
  await wb.xlsx.writeFile(path.join(OUT, `donnees-tcd-depart-${lang}.xlsx`));
}

/* ------------------------------------------------------------------ monthly budget (finance) */
const BUDGET = [[1100, 1100], [450, 512.4], [180, 165.25], [120, 118], [200, 245.8], [400, 400], [150, 98.5]];   // planned, spent
const INCOME = 3400;
const BL = {
  fr: { sheet: 'Budget', title: 'Budget mensuel', income: 'Revenu du mois', head: ['Catégorie', 'Budget prévu', 'Dépensé', 'Reste', '% du revenu'],
    cats: ['Loyer', 'Épicerie', 'Transport', 'Téléphone et internet', 'Loisirs', 'Épargne', 'Autres'], total: 'Total', sum: ['Reste en fin de mois', "Taux d'épargne", 'Catégories dépassées'] },
  en: { sheet: 'Budget', title: 'Monthly budget', income: 'Income this month', head: ['Category', 'Planned', 'Spent', 'Left', '% of income'],
    cats: ['Rent', 'Groceries', 'Transport', 'Phone and internet', 'Fun', 'Savings', 'Other'], total: 'Total', sum: ['Left at month end', 'Savings rate', 'Categories over budget'] },
};
function budgetBase(lang) {
  const L = BL[lang], wb = new ExcelJS.Workbook();
  wb.creator = 'Excel Académie';
  const ws = wb.addWorksheet(L.sheet);
  [26, 16, 14, 14, 14].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  ws.getCell('A1').value = L.title;
  ws.getCell('A3').value = L.income; ws.getCell('B3').value = INCOME;
  L.head.forEach((t, i) => { ws.getCell(5, i + 1).value = t; });
  L.cats.forEach((c, i) => { const r = 6 + i; ws.getCell('A' + r).value = c; ws.getCell('B' + r).value = BUDGET[i][0]; ws.getCell('C' + r).value = BUDGET[i][1]; });
  ws.getCell('A13').value = L.total;
  L.sum.forEach((t, i) => { ws.getCell('A' + (15 + i)).value = t; });
  return { wb, ws, L };
}
async function budgetStarter(lang) { await budgetBase(lang).wb.xlsx.writeFile(path.join(OUT, `budget-depart-${lang}.xlsx`)); }
async function budgetModel(lang) {
  const { wb, ws } = budgetBase(lang);
  const f = FMT[lang];
  const plan = BUDGET.reduce((a, r) => a + r[0], 0), spent = BUDGET.reduce((a, r) => a + r[1], 0);
  BUDGET.forEach((r, i) => {
    const n = 6 + i;
    ws.getCell('D' + n).value = { formula: `B${n}-C${n}`, result: r[0] - r[1] };
    ws.getCell('E' + n).value = { formula: `C${n}/$B$3`, result: r[1] / INCOME };
  });
  ws.getCell('B13').value = { formula: 'SUM(B6:B12)', result: plan };
  ws.getCell('C13').value = { formula: 'SUM(C6:C12)', result: spent };
  ws.getCell('D13').value = { formula: 'B13-C13', result: plan - spent };
  ws.getCell('E13').value = { formula: 'C13/B3', result: spent / INCOME };
  ws.getCell('B15').value = { formula: 'B3-C13', result: INCOME - spent };
  ws.getCell('B16').value = { formula: 'C11/B3', result: BUDGET[5][1] / INCOME };
  ws.getCell('B17').value = { formula: 'COUNTIF(D6:D12,"<0")', result: BUDGET.filter((r) => r[0] - r[1] < 0).length };
  const money = (a) => { ws.getCell(a).numFmt = f.money; };
  ['B3', 'B15'].forEach(money);
  for (let n = 6; n <= 13; n++) { ['B', 'C', 'D'].forEach((c) => money(c + n)); ws.getCell('E' + n).numFmt = '0.0%'; }
  ws.getCell('B16').numFmt = '0.0%';
  ws.getCell('A1').font = { bold: true, size: 18, color: { argb: 'FF40304F' } };
  for (let c = 1; c <= 5; c++) { const h = ws.getCell(5, c); h.fill = fill(PASTEL.pink); h.font = { bold: true, color: { argb: 'FFFFFFFF' } }; }
  ['B3'].concat(range('B', 6, 12), range('C', 6, 12)).forEach((a) => { ws.getCell(a).fill = fill(PASTEL.peach); });
  range('D', 6, 12).concat(range('E', 6, 12), ['B13', 'C13', 'D13', 'E13', 'B15', 'B16', 'B17']).forEach((a) => { ws.getCell(a).fill = fill(PASTEL.green); });
  for (let c = 1; c <= 5; c++) ws.getCell(13, c).font = { bold: true };
  ws.addConditionalFormatting({ ref: 'D6:D12', rules: [{ type: 'cellIs', operator: 'lessThan', formulae: [0], style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFDE0EA' } } } }] });
  ws.views = [{ state: 'frozen', ySplit: 5 }];
  await wb.xlsx.writeFile(path.join(OUT, `budget-modele-${lang}.xlsx`));
}
const range = (col, a, b) => Array.from({ length: b - a + 1 }, (_, i) => col + (a + i));

(async () => {
  for (const lang of ['fr', 'en']) {
    await budgetStarter(lang); await budgetModel(lang);
    await quoteStarter(lang); await quoteModel(lang);
    await salesStarter(lang); await salesModel(lang);
    await pivotStarter(lang);
  }
  console.log('Projects written:', fs.readdirSync(OUT).filter((f) => !/calculateur/.test(f)).join(', '));
})();
