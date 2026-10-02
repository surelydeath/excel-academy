/* Formula engine: wraps HyperFormula so the learner can type real
   Excel-style formulas (French or English function names). */
const Engine = (() => {
  let ready = false;

  function ensure() {
    if (ready) return;
    if (HyperFormula.languages && HyperFormula.languages.frFR) {
      HyperFormula.registerLanguage('frFR', HyperFormula.languages.frFR);
    }
    ready = true;
  }

  function options(lang) {
    return lang === 'fr'
      ? { language: 'frFR', functionArgSeparator: ';', decimalSeparator: ',', licenseKey: 'gpl-v3' }
      : { language: 'enGB', functionArgSeparator: ',', decimalSeparator: '.', licenseKey: 'gpl-v3' };
  }

  // French Excel writes FAUX / VRAI without parentheses; HyperFormula wants FAUX().
  function fixBooleans(formula, lang) {
    const names = lang === 'fr' ? 'FAUX|VRAI' : 'FALSE|TRUE';
    const re = new RegExp('\\b(' + names + ')\\b(?!\\s*\\()', 'gi');
    return formula
      .split(/("[^"]*")/)
      .map((part) => (part.startsWith('"') ? part : part.replace(re, '$1()')))
      .join('');
  }

  function parseAddress(addr) {
    const m = /^([A-Z]+)(\d+)$/.exec(addr.toUpperCase());
    let col = 0;
    for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);
    return { sheet: 0, col: col - 1, row: parseInt(m[2], 10) - 1 };
  }

  function colLetter(i) {
    let s = '';
    i += 1;
    while (i > 0) {
      const r = (i - 1) % 26;
      s = String.fromCharCode(65 + r) + s;
      i = Math.floor((i - 1) / 26);
    }
    return s;
  }

  function normalizeError(v) {
    if (v && typeof v === 'object' && v.type) return { error: v.type, message: v.message || '' };
    return null;
  }

  // Run `formula` in `target` over a grid (already language-resolved), with cell overrides.
  function run({ grid, target, formula, set, lang }) {
    ensure();
    const data = grid.map((row) => row.map((c) => (c === undefined ? null : c)));
    const hf = HyperFormula.buildFromArray(data.length ? data : [[null]], options(lang));
    try {
      for (const [addr, val] of Object.entries(set || {})) {
        hf.setCellContents(parseAddress(addr), [[val]]);
      }
      hf.setCellContents(parseAddress(target), [[fixBooleans(formula, lang)]]);
      const raw = hf.getCellValue(parseAddress(target));
      const err = normalizeError(raw);
      return err ? { error: err.error, message: err.message } : { value: raw };
    } catch (e) {
      return { error: 'ERROR', message: String(e && e.message ? e.message : e) };
    } finally {
      hf.destroy();
    }
  }

  function norm(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  }

  function equal(got, expected) {
    if (typeof expected === 'number') return typeof got === 'number' && Math.abs(got - expected) < 0.005;
    if (typeof expected === 'boolean') return got === expected;
    return norm(got) === norm(expected);
  }

  return { run, equal, parseAddress, colLetter, fixBooleans };
})();

if (typeof module !== 'undefined') module.exports = Engine;
