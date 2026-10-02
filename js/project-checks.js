/* Runs a project's checks against a file read by XlsxReader.
   Formulas are re-calculated with HyperFormula using several sets of
   starting values, so a typed-in number can't pass for a formula.
   A scenario value like '@K8' means "whatever cell K8 contains in the file". */
const ProjectChecks = (() => {
  const MSG = {
    fr: {
      empty: (c) => `La cellule <code>${c}</code> est vide.`,
      typed: (c) => `<code>${c}</code> contient un chiffre tapé à la main. Remplace-le par une formule qui commence par <code>=</code>.`,
      inputs: 'Je ne retrouve pas les cellules de départ. Garde la même mise en page que le fichier de départ.',
      unreadable: (c) => `Je n'arrive pas à lire la formule de <code>${c}</code>. Vérifie qu'elle ne contient pas d'erreur.`,
      structured: (c) => `La formule de <code>${c}</code> utilise des noms de colonnes (références structurées). Retape-la avec des adresses de cellules comme <code>D2*E2</code>.`,
      shared: (c) => `La formule de <code>${c}</code> a été recopiée depuis une autre cellule et je ne peux pas la relire. Retape-la directement dans la cellule.`,
      wrong: (c, got, exp) => `Avec tes valeurs, <code>${c}</code> affiche <strong>${got}</strong> au lieu de <strong>${exp}</strong>.`,
      hardcoded: (c) => `Ça marche avec tes chiffres, mais quand je change les valeurs de départ, <code>${c}</code> ne suit plus. Ta formule doit utiliser les cellules de départ plutôt que des nombres ou des textes tapés.`,
      money: (cells) => `Pas de format $ sur : <code>${cells}</code>. (Ctrl + 1 → Nombre → Monétaire → $)`,
      moneyOther: (cells) => `Ces cellules sont en euros ou dans une autre devise, pas en dollars : <code>${cells}</code>. (Ctrl + 1 → Nombre → Monétaire → $)`,
      percent: (cells) => `Pas de format % sur : <code>${cells}</code>. (bouton % de l'onglet Accueil)`,
      date: (cells) => `Pas de format date sur : <code>${cells}</code>. (Ctrl + 1 → Nombre → Date)`,
      fill: (cells) => `Pas de couleur de fond sur : <code>${cells}</code>.`,
      bold: (cells) => `Pas en gras : <code>${cells}</code>.`,
      groupsUnfilled: (cells) => `Colore ces cellules : <code>${cells}</code>.`,
      groupsSame: 'Les cases de départ et les cases de résultat ont la même couleur. Choisis deux couleurs différentes.',
      dvList: (range) => `Je ne vois pas de liste déroulante sur <code>${range}</code>. (Données → Validation des données → Liste)`,
      cfRules: (range, n) => `Il faut au moins ${n} règles de mise en forme conditionnelle sur <code>${range}</code> (une couleur par statut).`,
      feature: {
        conditionalFormatting: 'Je ne vois pas de mise en forme conditionnelle.', dataValidation: 'Je ne vois pas de liste déroulante (validation de données).',
        chart: 'Je ne vois pas de graphique.', freeze: 'Je ne vois pas de volets figés. (Affichage → Figer les volets)',
        table: 'Je ne vois pas de tableau structuré. (Sélectionne tes données puis Ctrl + T)', filter: 'Je ne vois pas de filtre sur tes données. (Ctrl + T, ou Données → Filtrer)',
        slicer: 'Je ne vois pas de segment (slicer). (Analyse du tableau croisé → Insérer un segment)',
      },
      pivotNone: 'Je ne vois pas de tableau croisé dynamique. (Insertion → Tableau croisé dynamique)',
      pivotRow: (name) => `Place « ${name} » dans la zone <strong>Lignes</strong> du tableau croisé.`,
      pivotData: (name) => `Place « ${name} » dans la zone <strong>Valeurs</strong>, en <strong>Somme</strong>.`,
      pivotCol: 'Ajoute un deuxième champ dans la zone Colonnes pour croiser deux dimensions.',
      notFile: 'Ce fichier ne ressemble pas à un classeur Excel (.xlsx). Enregistre-le au format « Classeur Excel (*.xlsx) ».',
    },
    en: {
      empty: (c) => `Cell <code>${c}</code> is empty.`,
      typed: (c) => `<code>${c}</code> contains a number typed by hand. Replace it with a formula starting with <code>=</code>.`,
      inputs: 'I can\'t find the starting cells. Keep the same layout as the starter file.',
      unreadable: (c) => `I can't read the formula in <code>${c}</code>. Check that it has no error.`,
      structured: (c) => `The formula in <code>${c}</code> uses column names (structured references). Retype it with cell addresses like <code>D2*E2</code>.`,
      shared: (c) => `The formula in <code>${c}</code> was copied from another cell and I can't read it back. Retype it directly in the cell.`,
      wrong: (c, got, exp) => `With your values, <code>${c}</code> shows <strong>${got}</strong> instead of <strong>${exp}</strong>.`,
      hardcoded: (c) => `It works with your numbers, but when I change the starting values, <code>${c}</code> doesn't follow. Your formula must use the starting cells instead of typed numbers or text.`,
      money: (cells) => `No $ format on: <code>${cells}</code>. (Ctrl + 1 → Number → Currency → $)`,
      moneyOther: (cells) => `These cells are in euros or another currency, not dollars: <code>${cells}</code>. (Ctrl + 1 → Number → Currency → $)`,
      percent: (cells) => `No % format on: <code>${cells}</code>. (the % button on the Home tab)`,
      date: (cells) => `No date format on: <code>${cells}</code>. (Ctrl + 1 → Number → Date)`,
      fill: (cells) => `No fill colour on: <code>${cells}</code>.`,
      bold: (cells) => `Not bold: <code>${cells}</code>.`,
      groupsUnfilled: (cells) => `Colour these cells: <code>${cells}</code>.`,
      groupsSame: 'The starting cells and the result cells have the same colour. Pick two different colours.',
      dvList: (range) => `I can't see a dropdown list on <code>${range}</code>. (Data → Data Validation → List)`,
      cfRules: (range, n) => `You need at least ${n} conditional formatting rules on <code>${range}</code> (one colour per status).`,
      feature: {
        conditionalFormatting: 'I can\'t see any conditional formatting.', dataValidation: 'I can\'t see a dropdown list (data validation).',
        chart: 'I can\'t see a chart.', freeze: 'I can\'t see frozen panes. (View → Freeze Panes)',
        table: 'I can\'t see a structured table. (Select your data then Ctrl + T)', filter: 'I can\'t see a filter on your data. (Ctrl + T, or Data → Filter)',
        slicer: 'I can\'t see a slicer. (PivotTable Analyze → Insert Slicer)',
      },
      pivotNone: 'I can\'t see a PivotTable. (Insert → PivotTable)',
      pivotRow: (name) => `Put "${name}" in the <strong>Rows</strong> area of the PivotTable.`,
      pivotData: (name) => `Put "${name}" in the <strong>Values</strong> area, as a <strong>Sum</strong>.`,
      pivotCol: 'Add a second field in the Columns area to cross two dimensions.',
      notFile: 'This file doesn\'t look like an Excel workbook (.xlsx). Save it as "Excel Workbook (*.xlsx)".',
    },
  };

  /* ---------- addresses and ranges ---------- */
  const colNum = (letters) => { let c = 0; for (const ch of letters) c = c * 26 + ch.charCodeAt(0) - 64; return c - 1; };
  const colRow = (addr) => { const m = /^([A-Z]+)(\d+)$/.exec(addr); return { col: colNum(m[1]), row: +m[2] - 1 }; };
  const colName = (i) => { let s = ''; i += 1; while (i > 0) { const r = (i - 1) % 26; s = String.fromCharCode(65 + r) + s; i = Math.floor((i - 1) / 26); } return s; };
  // "G8:G17" -> ["G8", ..., "G17"]; a single address stays as it is
  function expand(range) {
    const m = /^\$?([A-Z]+)\$?(\d+)(?::\$?([A-Z]+)\$?(\d+))?$/.exec(range.trim());
    if (!m) return [];
    const c1 = colNum(m[1]), r1 = +m[2], c2 = m[3] ? colNum(m[3]) : c1, r2 = m[4] ? +m[4] : r1;
    const out = [];
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) out.push(colName(c) + r);
    return out;
  }
  const expandAll = (list) => list.flatMap((x) => (/[:]/.test(x) || /^[A-Z]+\d+$/.test(x) ? expand(x) : []));
  // does a sqref like "I8:I17 K1" cover every cell of `range`?
  function covers(sqref, range) {
    const have = new Set(sqref.split(/\s+/).filter(Boolean).flatMap(expand));
    return expand(range).every((a) => have.has(a));
  }

  const num = (c) => (c && typeof c.value === 'number' ? c.value : null);
  const cellValue = (sheet, a) => { const c = sheet.cells[a]; return c && c.value !== null && typeof c.value !== 'object' ? c.value : null; };

  function buildHF(sheet) {
    let maxR = 0, maxC = 0;
    const entries = Object.entries(sheet.cells);
    entries.forEach(([a]) => { const p = colRow(a); maxR = Math.max(maxR, p.row); maxC = Math.max(maxC, p.col); });
    const data = Array.from({ length: maxR + 1 }, () => Array(maxC + 1).fill(null));
    entries.forEach(([a, c]) => {
      const p = colRow(a);
      let v = c.f ? '=' + c.f : c.value;
      if (v && typeof v === 'object') v = null;                 // error values
      if (typeof v === 'string' && v.startsWith('=') && !c.f) v = "'" + v; // plain text that looks like a formula
      data[p.row][p.col] = v;
    });
    return HyperFormula.buildFromArray(data, { language: 'enGB', functionArgSeparator: ',', decimalSeparator: '.', licenseKey: 'gpl-v3' });
  }

  // Evaluate every output cell for one scenario (her own values + overrides)
  function evaluate(sheet, outputs, overrides) {
    let hf;
    try {
      hf = buildHF(sheet);
      Object.entries(overrides || {}).forEach(([a, v]) => { const p = colRow(a); hf.setCellContents({ sheet: 0, col: p.col, row: p.row }, [[v]]); });
      const out = {};
      outputs.forEach((a) => {
        const p = colRow(a);
        const v = hf.getCellValue({ sheet: 0, col: p.col, row: p.row });
        out[a] = typeof v === 'number' ? v : null;
      });
      return out;
    } catch (e) {
      return null;
    } finally {
      if (hf) hf.destroy();
    }
  }

  const fmtNum = (v, lang, kind) => {
    const loc = lang === 'fr' ? 'fr-CA' : 'en-CA';
    if (kind === 'pct') return new Intl.NumberFormat(loc, { style: 'percent', maximumFractionDigits: 1 }).format(v);
    if (kind === 'num') return new Intl.NumberFormat(loc, { maximumFractionDigits: 2 }).format(v);
    return new Intl.NumberFormat(loc, { style: 'currency', currency: 'CAD' }).format(v);
  };

  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

  function run(project, wb, lang) {
    const M = MSG[lang];
    const sheet = wb.sheets[0];
    const results = [];
    const push = (check, ok, msg) => results.push({ id: check.id, group: check.group, bonus: !!check.bonus, label: check.label[lang], ok, msg: ok ? '' : msg });

    // ----- scenarios for the calculation checks
    const calcChecks = project.checks.filter((c) => c.kind === 'calc');
    const outputs = [...new Set(calcChecks.flatMap((c) => (c.cells ? expand(c.cells) : [c.cell])))];
    const own = {};
    project.inputs.forEach((a) => { own[a] = cellValue(sheet, a); });
    const inputsOk = (project.required || project.inputs).every((a) => own[a] !== null);
    const resolveToken = (v) => (typeof v === 'string' && v[0] === '@' ? cellValue(sheet, v.slice(1)) : v);
    const scenarios = [{ name: 'own', inputs: own, overrides: {} }].concat(
      (project.scenarios || []).map((s, i) => {
        const o = {}; Object.entries(s).forEach(([a, v]) => { o[a] = resolveToken(v); });
        return { name: 's' + i, inputs: o, overrides: o };
      })
    );
    if (inputsOk && calcChecks.length) scenarios.forEach((s) => { s.got = evaluate(sheet, outputs, s.overrides); s.expected = project.model(Object.assign({}, own, s.inputs)); });

    for (const check of project.checks) {
      switch (check.kind) {
        case 'calc': {
          const cells = check.cells ? expand(check.cells) : [check.cell];
          const tol = check.tol || 0.005;
          let msg = null;
          for (const a of cells) {
            const c = sheet.cells[a];
            if (!c || (c.value === null && !c.hasFormula)) { msg = M.empty(a); break; }
            if (!c.hasFormula) { msg = M.typed(a); break; }
            if (c.sharedChild) { msg = M.shared(a); break; }
            if (c.f && c.f.includes('[')) { msg = M.structured(a); break; }
          }
          if (!msg && !inputsOk) msg = M.inputs;
          if (!msg) {
            outer: for (const s of scenarios) {
              for (const a of cells) {
                const got = s.got && s.got[a], exp = s.expected[a];
                if (got === null || got === undefined) { msg = M.unreadable(a); break outer; }
                if (Math.abs(got - exp) > tol) {
                  msg = s.name === 'own' ? M.wrong(a, fmtNum(got, lang, check.display), fmtNum(exp, lang, check.display)) : M.hardcoded(a);
                  break outer;
                }
              }
            }
          }
          push(check, !msg, msg);
          break;
        }
        case 'format': {
          const cells = expandAll(check.cells);
          const ok = (c) => c && (check.type === 'money' ? (c.style.money || c.style.currencyBuiltin) : check.type === 'percent' ? c.style.percent : c.style.date);
          const bad = cells.filter((a) => !ok(sheet.cells[a]));
          let msg = '';
          if (bad.length) {
            const list = bad.length > 6 ? bad.slice(0, 6).join(', ') + '…' : bad.join(', ');
            if (check.type === 'percent') msg = M.percent(list);
            else if (check.type === 'date') msg = M.date(list);
            else msg = bad.some((a) => sheet.cells[a] && sheet.cells[a].style.euroSign) ? M.moneyOther(list) : M.money(list);
          }
          push(check, !bad.length, msg);
          break;
        }
        case 'fill': case 'bold': {
          const cells = expandAll(check.cells);
          const bad = cells.filter((a) => { const c = sheet.cells[a]; return !c || !(check.kind === 'fill' ? c.style.filled : c.style.bold); });
          const list = bad.length > 6 ? bad.slice(0, 6).join(', ') + '…' : bad.join(', ');
          push(check, !bad.length, check.kind === 'fill' ? M.fill(list) : M.bold(list));
          break;
        }
        case 'fillGroups': {
          const groups = check.groups.map(expandAll);
          const bad = groups.flat().filter((a) => !(sheet.cells[a] && sheet.cells[a].style.filled));
          if (bad.length) { push(check, false, M.groupsUnfilled(bad.slice(0, 6).join(', '))); break; }
          const keys = groups.map((g) => new Set(g.map((a) => sheet.cells[a].style.fillKey)));
          const shared = [...keys[0]].some((k) => keys[1].has(k));
          push(check, !shared, M.groupsSame);
          break;
        }
        case 'dvList': {
          const ok = sheet.validations.some((v) => v.type === 'list' && covers(v.sqref, check.range));
          push(check, ok, M.dvList(check.range));
          break;
        }
        case 'cfRules': {
          const n = sheet.conditionals.filter((c) => covers(c.sqref, check.range)).reduce((a, c) => a + c.rules, 0);
          push(check, n >= (check.min || 1), M.cfRules(check.range, check.min || 1));
          break;
        }
        case 'feature': {
          const has = {
            chart: wb.hasChart, freeze: wb.sheets.some((s) => s.freeze), table: wb.tableCount > 0, slicer: wb.hasSlicer,
            filter: wb.tableCount > 0 || wb.sheets.some((s) => s.autoFilter),
            conditionalFormatting: wb.sheets.some((s) => s.hasConditionalFormatting), dataValidation: wb.sheets.some((s) => s.hasDataValidation),
          }[check.feature];
          push(check, !!has, M.feature[check.feature]);
          break;
        }
        case 'pivot': {
          const p = (wb.pivots || [])[0];
          if (!p) { push(check, false, M.pivotNone); break; }
          const want = (ref) => norm(cellValue(sheet, ref) || '');
          if (check.part === 'exists') { push(check, true, ''); break; }
          if (check.part === 'rows') {
            const name = cellValue(sheet, check.field) || check.field;
            push(check, p.rows.some((r) => norm(r) === norm(name)), M.pivotRow(name)); break;
          }
          if (check.part === 'sum') {
            const name = cellValue(sheet, check.field) || check.field;
            push(check, p.data.some((d) => norm(d.field) === norm(name) && d.agg === 'sum'), M.pivotData(name)); break;
          }
          if (check.part === 'cols') { push(check, p.cols.length > 0, M.pivotCol); break; }
          void want;
          break;
        }
        default: break;
      }
    }
    return results;
  }

  return { run, MSG, expand };
})();

if (typeof module !== 'undefined') module.exports = ProjectChecks;
