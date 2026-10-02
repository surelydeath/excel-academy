/* Notebook search: accent-insensitive, matches in both languages,
   title matches rank first. Works in the browser and in Node (tests). */
const Search = (() => {
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const strip = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
  const pickLang = (x, lang) => (x && typeof x === 'object' && ('fr' in x || 'en' in x) ? x[lang] || '' : x || '');
  const bothLangs = (x) => (x && typeof x === 'object' ? (x.fr || '') + ' ' + (x.en || '') : x || '');

  const cache = new Map();
  function haystack(entry) {
    if (!cache.has(entry.id)) {
      cache.set(entry.id, {
        title: norm(bothLangs(entry.title)),
        titles: [norm(pickLang(entry.title, 'fr')), norm(pickLang(entry.title, 'en'))],
        kw: norm(entry.kw || ''),
        sum: { fr: norm(pickLang(entry.sum, 'fr')), en: norm(pickLang(entry.sum, 'en')) },
        body: { fr: norm(strip(pickLang(entry.body, 'fr'))), en: norm(strip(pickLang(entry.body, 'en'))) },
        syntax: norm(bothLangs(entry.syntax)),
      });
    }
    return cache.get(entry.id);
  }

  // Returns entries ranked for `query` (all entries, in order, when the query is empty).
  function run(query, lang, entries, catOrder) {
    const tokens = norm(query).split(/\s+/).filter(Boolean);
    if (!tokens.length) {
      const order = (e) => (catOrder ? catOrder.indexOf(e.cat) : 0);
      return entries.slice().sort((a, b) => order(a) - order(b));
    }
    const scored = [];
    for (const e of entries) {
      const h = haystack(e);
      let total = 0, ok = true;
      for (const tk of tokens) {
        let s = 0;
        if (h.titles.includes(tk)) s += 12;                                          // the whole title is exactly the word
        if (h.title.includes(tk)) {
          const words = h.title.split(/[^a-z0-9#$]+/).filter(Boolean);
          s += words.includes(tk) ? 16 : words.some((w) => w.startsWith(tk)) ? 10 : 6;   // exact word > prefix > inside
        }
        if (h.kw.includes(tk)) s += 4;
        if (h.syntax.includes(tk)) s += 3;
        if (h.sum[lang].includes(tk)) s += 3;
        if (h.body[lang].includes(tk)) s += 1;
        if (!s) { ok = false; break; }
        total += s;
      }
      if (ok) scored.push({ e, total });
    }
    scored.sort((a, b) => b.total - a.total || norm(pickLang(a.e.title, lang)).localeCompare(norm(pickLang(b.e.title, lang))));
    return scored.map((x) => x.e);
  }

  return { run, norm };
})();

if (typeof module !== 'undefined') module.exports = Search;
