/* Notebook self-test: structure, links and search behaviour.
   Run:  node tests/verify-notebook.js                                   */
const path = require('path');
const root = path.join(__dirname, '..');
global.window = global;
require(path.join(root, 'content/chapters.js'));
require(path.join(root, 'content/lessons-2.js'));
require(path.join(root, 'content/notebook.js'));
const Search = require(path.join(root, 'js/search.js'));

let failures = 0;
const ok = (cond, msg) => { if (!cond) { failures++; console.log('  ✗ ' + msg); } };
const lessons = CHAPTERS.flatMap((c) => c.lessons);
const ids = new Set(NOTEBOOK.map((e) => e.id));
const cats = new Set(NOTEBOOK_CATS.map((c) => c.id));

console.log('entries:', NOTEBOOK.length);
ok(ids.size === NOTEBOOK.length, 'entry ids are unique');
for (const e of NOTEBOOK) {
  ok(cats.has(e.cat), e.id + ': unknown category ' + e.cat);
  for (const f of ['title', 'sum', 'body']) ok(e[f] && e[f].fr && e[f].en, e.id + ': missing FR/EN ' + f);
  if (e.syntax) ok(e.syntax.fr && e.syntax.en, e.id + ': syntax needs FR and EN');
  for (const l of e.lessons || []) ok(lessons.some((x) => x.id === l), e.id + ': lesson link ' + l + ' does not exist');
}
for (const [lesson, list] of Object.entries(NOTES_FOR)) {
  ok(lessons.some((x) => x.id === lesson), 'NOTES_FOR: unknown lesson ' + lesson);
  for (const id of list) ok(ids.has(id), 'NOTES_FOR[' + lesson + ']: unknown entry ' + id);
}
for (const [key, list] of Object.entries(NOTES_FOR_Q)) {
  const [lid, qi] = key.split(':');
  const l = lessons.find((x) => x.id === lid);
  ok(l && l.type === 'quiz' && l.questions[+qi], 'NOTES_FOR_Q: no such question ' + key);
  for (const id of list) ok(ids.has(id), 'NOTES_FOR_Q[' + key + ']: unknown entry ' + id);
}
for (const l of lessons) {
  ok(NOTES_FOR[l.id] && NOTES_FOR[l.id].length, 'lesson ' + l.id + ' has no help entries');
  if (l.type === 'quiz') l.questions.forEach((q, i) => ok(NOTES_FOR_Q[l.id + ':' + i] || NOTES_FOR[l.id], 'question ' + l.id + ':' + i + ' has no help'));
}

const order = NOTEBOOK_CATS.map((c) => c.id);
const top = (q, lang) => Search.run(q, lang, NOTEBOOK, order).map((e) => e.id);
const first = (q, lang, id, n = 1) => ok(top(q, lang).slice(0, n).includes(id), `search "${q}" (${lang}) -> expected "${id}" in top ${n}, got ${top(q, lang).slice(0, n).join(', ')}`);
first('somme', 'fr', 'sum'); first('sum', 'en', 'sum'); first('sum', 'fr', 'sum');   // English name still finds it in French
first('recherchev', 'fr', 'vlookup'); first('vlookup', 'en', 'vlookup');
first('verrouiller', 'fr', 'absolute-ref', 3); first('dollar', 'fr', 'absolute-ref', 3);
first('#n/a', 'en', 'err-na');
first('tcd', 'fr', 'pivot');
first('seuil', 'fr', 'break-even');
first('télécharger', 'fr', 'download-open'); first('download', 'en', 'download-open');
first('tps', 'fr', 'sales-tax-ca');
ok(top('zzzzqq', 'fr').length === 0, 'nonsense query returns nothing');
ok(top('', 'fr').length === NOTEBOOK.length, 'empty query returns every entry');

console.log(failures ? failures + ' problem(s)' : 'Notebook verified ✔');
process.exit(failures ? 1 : 0);
