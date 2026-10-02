/* Reads the cell references (B2, B2:B5, $E$1) in a formula and copies a formula down/across
   the way Excel does. Used by the slide player and its tests. */
const FormulaRefs = (() => {
  const Eng = typeof Engine !== "undefined" ? Engine : require("./engine.js");
  const REF = /(?<![A-Za-z$])(\$?)([A-Z]{1,2})(\$?)(\d{1,3})(?::(\$?)([A-Z]{1,2})(\$?)(\d{1,3}))?(?![A-Za-z(\d])/g;
  const colNum = (s) => [...s].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
  function expand(a, b) {
    if (!b) return [a];
    const A = Eng.parseAddress(a), B = Eng.parseAddress(b), out = [];
    for (let r = Math.min(A.row, B.row); r <= Math.max(A.row, B.row); r++)
      for (let c = Math.min(A.col, B.col); c <= Math.max(A.col, B.col); c++) out.push(Eng.colLetter(c) + (r + 1));
    return out;
  }
  function tokens(f) {
    const quoted = []; f.replace(/"[^"]*"/g, (s, idx) => { quoted.push([idx, idx + s.length]); return s; });
    const out = []; let m; REF.lastIndex = 0;
    while ((m = REF.exec(f))) {
      if (quoted.some(([a, b]) => m.index >= a && m.index < b)) continue;
      out.push({ start: m.index, end: m.index + m[0].length, cells: expand(m[2] + m[4], m[6] ? m[6] + m[8] : null) });
    }
    return out;
  }
  // copy a formula down/across: relative references move, $-locked ones stay put
  function shift(f, dr, dc) {
    return f.replace(/(\$?)([A-Z]{1,2})(\$?)(\d{1,3})/g, (m, ca, col, ra, row, off, whole) => {
      if (/[A-Za-z$]/.test(whole[off - 1] || '') || /[A-Za-z(]/.test(whole[off + m.length] || '')) return m;
      const c = ca ? colNum(col) - 1 : colNum(col) - 1 + dc, r = ra ? +row : +row + dr;
      return ca + Eng.colLetter(c) + ra + r;
    });
  }
  return { tokens, shift, colNum };
})();
if (typeof module !== "undefined") module.exports = FormulaRefs;
