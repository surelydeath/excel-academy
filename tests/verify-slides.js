/* Slides self-test: every practice lesson has a deck; every example computes (no errors, except the
   one that is meant to show #N/A); both languages are filled in; "copy down" keeps $ locks.
   Run:  node tests/verify-slides.js                                                          */
const path = require('path');
const root = path.join(__dirname, '..');
const { HyperFormula } = require('hyperformula');
global.HyperFormula = HyperFormula;
require(path.join(root, 'node_modules/hyperformula/dist/languages/frFR.js'));
global.window = global;
require(path.join(root, 'content/chapters.js'));
require(path.join(root, 'content/lessons-2.js'));
require(path.join(root, 'content/slides.js'));
const Engine = require(path.join(root, 'js/engine.js'));
const Refs = require(path.join(root, 'js/formula-refs.js'));

const R = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] : v);
let failures = 0;
const fail = (m) => { failures++; console.log('  ✗ ' + m); };
const expect = (c, m) => { if (!c) fail(m); };

// copying keeps $ locks and slides the rest
expect(Refs.shift('=B2*(1+$E$1+$E$2)', 1, 0) === '=B3*(1+$E$1+$E$2)', 'shift keeps $E$1 and $E$2 locked, moves B2');
expect(Refs.shift('=D2+B3-C3', 1, 0) === '=D3+B4-C4', 'shift moves every relative reference');
expect(Refs.shift('=SOMME.SI(A2:A6;D2;B2:B6)', 0, 1) === '=SOMME.SI(B2:B6;E2;C2:C6)', 'shift handles ranges and function names with dots');
expect(Refs.shift('=SI(B2>=60;"Z9";"x")', 1, 0).includes('B3'), 'shift moves references next to text');
expect(Refs.tokens('=SOMME(B2:B5)')[0].cells.join() === 'B2,B3,B4,B5', 'a range expands to its cells');
expect(Refs.tokens('=SI(B2>=60;"A1";"x")').length === 1, 'references inside quotes are ignored');

let decks = 0;
for (const ch of CHAPTERS) for (const lesson of ch.lessons) {
  if (lesson.type !== 'practice') continue;
  const deck = SLIDES[lesson.id];
  if (!deck) { fail(lesson.id + ' has no slide deck'); continue; }
  decks++;
  const { ex, slides } = deck;
  expect(slides.length >= 3 && slides.length <= 6, lesson.id + ' has ' + slides.length + ' slides (3 to 6 expected)');
  expect(slides.some((s) => s.show === 'edit'), lesson.id + ' has an interactive "edit" slide');
  expect(slides.some((s) => s.show === 'type'), lesson.id + ' shows the formula being typed');
  for (const lang of ['fr', 'en']) {
    const grid = ex.grid.map((row) => row.map((c) => R(c, lang)));
    slides.forEach((s, k) => {
      expect(s.t && s.t[lang] && s.p && s.p[lang], lesson.id + ' slide ' + (k + 1) + ' misses text in ' + lang);
      if (s.show === 'data') return;
      const f = R(s.f || ex.f, lang);
      expect(f && f[0] === '=', lesson.id + ' slide ' + (k + 1) + ' has no formula');
      const cells = { [ex.target]: f };
      const T0 = Engine.parseAddress(ex.target);
      if (s.copy) (ex.also || []).forEach((a) => { const P = Engine.parseAddress(a); cells[a] = Refs.shift(f, P.row - T0.row, P.col - T0.col); });
      const out = Engine.runMany({ grid, cells, set: {}, lang });
      for (const [a, r] of Object.entries(out)) {
        const meantToFail = lesson.id === 'f12' && k === 0;
        if (meantToFail) expect(r.error === 'NA', lesson.id + ' ' + lang + ' slide 1 should show #N/A, got ' + JSON.stringify(r));
        else expect(!r.error, lesson.id + ' ' + lang + ' slide ' + (k + 1) + ' ' + a + ' ' + cells[a] + ' -> ' + JSON.stringify(r));
      }
      // referenced cells must exist in the grid
      Refs.tokens(f).forEach((tk) => tk.cells.forEach((a) => {
        const P = Engine.parseAddress(a);
        expect(P.row < grid.length, lesson.id + ' ' + lang + ' formula points outside the example: ' + a);
      }));
    });
  }
  console.log('✓ ' + lesson.id + ' (' + slides.length + ' slides)');
}
expect(decks === 17, 'expected 17 decks, found ' + decks);

// a few of the numbers quoted in the text
const run = (id, set, lang = 'en') => {
  const d = SLIDES[id], grid = d.ex.grid.map((row) => row.map((c) => R(c, lang)));
  return Engine.run({ grid, target: d.ex.target, formula: R(d.ex.f, lang), set, lang });
};
expect(Math.abs(run('m1', { B3: 40 }).value - 0) >= 0, 'm1 runs');
const m1 = Engine.runMany({ grid: SLIDES.m1.ex.grid.map((r) => r.map((c) => R(c, 'en'))), cells: { D3: '=(B3-C3)/B3' }, set: { B3: 40 }, lang: 'en' });
expect(Math.abs(m1.D3.value - 0.475) < 1e-9, 'm1: honey at $40 gives 47.5%');
expect(run('m3', {}).value === 167, 'm3: 2000 / 12 rounds up to 167');
expect(Math.abs(run('m5', {}).value - 608.3265) < 0.01, 'm5: 500 at 4% for 5 years');
expect(run('f7', {}).value === 120, 'f7: tea totals 120');
expect(run('f8', {}).value === 3, 'f8: 3 delivered');
expect(run('f9', { B2: 85 }).value === 'Excellent' && run('f9', { B2: 40 }).value === 'Review', 'f9: three grades');
expect(run('f5', { B2: 60 }).value === 'Pass' && run('f5', { B2: 59 }).value === 'Review', 'f5: 60 passes, 59 does not');

console.log(failures ? '\n' + failures + ' problem(s)' : '\nAll slides verified ✔');
process.exit(failures ? 1 : 0);
