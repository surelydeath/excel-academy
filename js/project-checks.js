/* Runs a project's checks against a file read by XlsxReader.
   Formulas are re-calculated with HyperFormula using several sets of
   starting values, so a typed-in number can't pass for a formula.        */
const ProjectChecks = (() => {
  const MSG = {
    fr: {
      empty: (c) => `La cellule <code>${c}</code> est vide.`,
      typed: (c) => `<code>${c}</code> contient un chiffre tapé à la main. Remplace-le par une formule qui commence par <code>=</code>.`,
      inputs: 'Je ne retrouve pas les cellules de départ (B3 à B8). Garde la même mise en page que le fichier de départ.',
      unreadable: (c) => `Je n'arrive pas à lire la formule de <code>${c}</code>. Vérifie qu'elle ne contient pas d'erreur.`,
      shared: (c) => `La formule de <code>${c}</code> a été recopiée depuis une autre cellule et je ne peux pas la relire. Retape-la directement dans la cellule.`,
      wrong: (c, got, exp) => `Avec tes valeurs, <code>${c}</code> affiche <strong>${got}</strong> au lieu de <strong>${exp}</strong>.`,
      hardcoded: (c) => `Ça marche avec tes chiffres, mais quand je change les valeurs de départ, <code>${c}</code> ne suit plus. Ta formule doit utiliser les cellules de départ (B3, B4…) plutôt que des nombres.`,
      euro: (cells) => `Pas de format € sur : <code>${cells}</code>. (Ctrl + 1 → Nombre → Monétaire → €)`,
      euroOther: (cells) => `Ces cellules ont une devise, mais pas l'euro : <code>${cells}</code>.`,
      percent: (cells) => `Pas de format % sur : <code>${cells}</code>. (bouton % de l'onglet Accueil)`,
      fill: (cells) => `Pas de couleur de fond sur : <code>${cells}</code>.`,
      bold: (cells) => `Pas en gras : <code>${cells}</code>.`,
      groupsUnfilled: (cells) => `Colore ces cellules : <code>${cells}</code>.`,
      groupsSame: 'Les cases de départ et les cases de résultat ont la même couleur. Choisis deux couleurs différentes.',
      feature: { conditionalFormatting: 'Je ne vois pas de mise en forme conditionnelle.', dataValidation: 'Je ne vois pas de liste déroulante (validation de données).', chart: 'Je ne vois pas de graphique.' },
      notFile: 'Ce fichier ne ressemble pas à un classeur Excel (.xlsx). Enregistre-le au format « Classeur Excel (*.xlsx) ».',
    },
    en: {
      empty: (c) => `Cell <code>${c}</code> is empty.`,
      typed: (c) => `<code>${c}</code> contains a number typed by hand. Replace it with a formula starting with <code>=</code>.`,
      inputs: 'I can\'t find the starting cells (B3 to B8). Keep the same layout as the starter file.',
      unreadable: (c) => `I can't read the formula in <code>${c}</code>. Check that it has no error.`,
      shared: (c) => `The formula in <code>${c}</code> was copied from another cell and I can't read it back. Retype it directly in the cell.`,
      wrong: (c, got, exp) => `With your values, <code>${c}</code> shows <strong>${got}</strong> instead of <strong>${exp}</strong>.`,
      hardcoded: (c) => `It works with your numbers, but when I change the starting values, <code>${c}</code> doesn't follow. Your formula must use the starting cells (B3, B4…) instead of numbers.`,
      euro: (cells) => `No € format on: <code>${cells}</code>. (Ctrl + 1 → Number → Currency → €)`,
      euroOther: (cells) => `These cells have a currency, but not euros: <code>${cells}</code>.`,
      percent: (cells) => `No % format on: <code>${cells}</code>. (the % button on the Home tab)`,
      fill: (cells) => `No fill colour on: <code>${cells}</code>.`,
      bold: (cells) => `Not bold: <code>${cells}</code>.`,
      groupsUnfilled: (cells) => `Colour these cells: <code>${cells}</code>.`,
      groupsSame: 'The starting cells and the result cells have the same colour. Pick two different colours.',
      feature: { conditionalFormatting: 'I can\'t see any conditional formatting.', dataValidation: 'I can\'t see a dropdown list (data validation).', chart: 'I can\'t see a chart.' },
      notFile: 'This file doesn\'t look like an Excel workbook (.xlsx). Save it as "Excel Workbook (*.xlsx)".',
    },
  };

  const colRow = (addr) => { const m = /^([A-Z]+)(\d+)$/.exec(addr); let c = 0; for (const ch of m[1]) c = c * 26 + ch.charCodeAt(0) - 64; return { col: c - 1, row: +m[2] - 1 }; };
  const num = (c) => (c && typeof c.value === 'number' ? c.value : null);

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

  // Evaluate every output cell for one scenario (own values + optional overrides)
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
    const loc = lang === 'fr' ? 'fr-FR' : 'en-US';
    if (kind === 'pct') return new Intl.NumberFormat(loc, { style: 'percent', maximumFractionDigits: 1 }).format(v);
    return new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR' }).format(v);
  };

  function run(project, wb, lang) {
    const M = MSG[lang];
    const sheet = wb.sheets[0];
    const results = [];
    const push = (check, ok, msg) => results.push({ id: check.id, group: check.group, bonus: !!check.bonus, label: check.label[lang], ok, msg: ok ? '' : msg });

    // ----- prepare scenarios for the calculation checks
    const outputs = project.checks.filter((c) => c.kind === 'calc').map((c) => c.cell);
    const own = {};
    let inputsOk = true;
    project.inputs.forEach((a) => { const v = num(sheet.cells[a]); if (v === null) inputsOk = false; own[a] = v; });
    const scenarios = [{ name: 'own', inputs: own, overrides: {} }].concat(
      (project.scenarios || []).map((s, i) => ({ name: 's' + i, inputs: s, overrides: s }))
    );
    if (inputsOk) scenarios.forEach((s) => { s.got = evaluate(sheet, outputs, s.overrides); s.expected = project.model(Object.assign({}, own, s.inputs)); });

    for (const check of project.checks) {
      switch (check.kind) {
        case 'calc': {
          const c = sheet.cells[check.cell];
          if (!c || (c.value === null && !c.hasFormula)) { push(check, false, M.empty(check.cell)); break; }
          if (!c.hasFormula) { push(check, false, M.typed(check.cell)); break; }
          if (c.sharedChild) { push(check, false, M.shared(check.cell)); break; }
          if (!inputsOk) { push(check, false, M.inputs); break; }
          const tol = check.tol || 0.005;
          let msg = null;
          for (const s of scenarios) {
            const got = s.got && s.got[check.cell], exp = s.expected[check.cell];
            if (got === null || got === undefined) { msg = M.unreadable(check.cell); break; }
            if (Math.abs(got - exp) > tol) {
              msg = s.name === 'own' ? M.wrong(check.cell, fmtNum(got, lang, check.display), fmtNum(exp, lang, check.display)) : M.hardcoded(check.cell);
              break;
            }
          }
          push(check, !msg, msg);
          break;
        }
        case 'format': {
          const bad = check.cells.filter((a) => { const c = sheet.cells[a]; return !c || !(check.type === 'euro' ? c.style.euro : c.style.percent); });
          let msg = '';
          if (bad.length) {
            if (check.type === 'percent') msg = M.percent(bad.join(', '));
            else msg = bad.every((a) => sheet.cells[a] && sheet.cells[a].style.currencyBuiltin) ? M.euroOther(bad.join(', ')) : M.euro(bad.join(', '));
          }
          push(check, !bad.length, msg);
          break;
        }
        case 'fill': case 'bold': {
          const bad = check.cells.filter((a) => { const c = sheet.cells[a]; return !c || !(check.kind === 'fill' ? c.style.filled : c.style.bold); });
          push(check, !bad.length, check.kind === 'fill' ? M.fill(bad.join(', ')) : M.bold(bad.join(', ')));
          break;
        }
        case 'fillGroups': {
          const all = check.groups.flat();
          const bad = all.filter((a) => !(sheet.cells[a] && sheet.cells[a].style.filled));
          if (bad.length) { push(check, false, M.groupsUnfilled(bad.join(', '))); break; }
          const keys = check.groups.map((g) => new Set(g.map((a) => sheet.cells[a].style.fillKey)));
          const shared = [...keys[0]].some((k) => keys[1].has(k));
          push(check, !shared, M.groupsSame);
          break;
        }
        case 'feature': {
          const has = check.feature === 'chart' ? wb.hasChart
            : check.feature === 'conditionalFormatting' ? wb.sheets.some((s) => s.hasConditionalFormatting)
              : wb.sheets.some((s) => s.hasDataValidation);
          push(check, has, M.feature[check.feature]);
          break;
        }
        default: break;
      }
    }
    return results;
  }

  return { run, MSG };
})();

if (typeof module !== 'undefined') module.exports = ProjectChecks;
