/* Content self-test: every practice lesson's `solution` must pass all of
   its own tests in BOTH languages, and obvious wrong answers must fail.
   Run:  node tests/verify-content.js                                    */
const path = require('path');
const root = path.join(__dirname, '..');

const { HyperFormula } = require('hyperformula');
global.HyperFormula = HyperFormula;
require(path.join(root, 'node_modules/hyperformula/dist/languages/frFR.js'));
global.window = global;
require(path.join(root, 'content/chapters.js'));
const Engine = require(path.join(root, 'js/engine.js'));

const R = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] : v);
let failures = 0;
const fail = (msg) => { failures++; console.log('  ✗ ' + msg); };

for (const lang of ['fr', 'en']) {
  console.log('\n=== ' + lang.toUpperCase() + ' ===');
  for (const ch of CHAPTERS) {
    for (const lesson of ch.lessons) {
      if (lesson.type === 'quiz') {
        const ok = lesson.questions.every((q) => q.answer >= 0 && q.answer < q.options.length && q.options.length >= 2);
        console.log((ok ? '✓' : '✗') + ' ' + lesson.id + ' quiz (' + lesson.questions.length + ' q)');
        if (!ok) failures++;
        continue;
      }
      if (lesson.type === 'build') { console.log('· ' + lesson.id + ' build project (see verify-projects.js)'); continue; }
      const grid = lesson.grid.map((row) => row.map((c) => R(c, lang)));
      const formula = lesson.solution[lang];
      let ok = true;
      lesson.tests.forEach((t, i) => {
        const set = {};
        for (const [a, v] of Object.entries(t.set || {})) set[a] = R(v, lang);
        const r = Engine.run({ grid, target: lesson.target, formula, set, lang });
        const exp = R(t.expect, lang);
        if (r.error || !Engine.equal(r.value, exp)) {
          ok = false;
          fail(lesson.id + ' test#' + i + ' expected ' + JSON.stringify(exp) + ' got ' + JSON.stringify(r));
        }
      });
      // a hardcoded answer must fail the second test
      const first = R(lesson.tests[0].expect, lang);
      const hard = typeof first === 'number' ? '=' + String(first).replace('.', lang === 'fr' ? ',' : '.') : '="' + first + '"';
      const sets = lesson.tests.slice(1).map((t) => {
        const set = {};
        for (const [a, v] of Object.entries(t.set || {})) set[a] = R(v, lang);
        return { set, expect: R(t.expect, lang) };
      });
      const survives = sets.every((t) => {
        const r = Engine.run({ grid, target: lesson.target, formula: hard, set: t.set, lang });
        return !r.error && Engine.equal(r.value, t.expect);
      });
      if (survives) { ok = false; fail(lesson.id + ' a hard-coded answer passes all tests (tests too weak)'); }
      if (lesson.mustUse) {
        const f = formula.toUpperCase().replace(/\s/g, '');
        for (const fn of lesson.mustUse[lang]) if (!f.includes(fn)) { ok = false; fail(lesson.id + ' solution misses required ' + fn); }
      }
      for (const ref of lesson.mustRef || []) if (!formula.includes(ref)) { ok = false; fail(lesson.id + ' solution misses ' + ref); }
      console.log((ok ? '✓' : '✗') + ' ' + lesson.id + ' ' + formula);
    }
  }
}

console.log(failures ? '\n' + failures + ' problem(s)' : '\nAll lessons verified ✔');
process.exit(failures ? 1 : 0);
