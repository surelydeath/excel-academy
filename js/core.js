/* Shared core: state, data lookups, prerequisites, rewards, small UI helpers.
   Every other file hangs its functions on the global `App` object.         */
const App = (() => {
  /* ------------------------------------------------------------ state */
  const KEY = 'excel-academy-v1';
  const defaults = () => ({ lang: 'fr', xp: 0, done: {}, known: {}, streak: { last: null, count: 0 }, badges: {}, bonus: {}, steps: {}, wiz: {}, dl: {}, onboarded: false });
  const state = defaults();
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* first visit or blocked storage */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode: ignore */ } };
  const resetState = () => { const lang = state.lang; Object.keys(state).forEach((k) => delete state[k]); Object.assign(state, defaults(), { lang }); save(); };

  /* ------------------------------------------------------------ helpers */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const t = (key, ...args) => { const v = STRINGS[state.lang][key]; return typeof v === 'function' ? v(...args) : v; };
  const L = (x) => (x && typeof x === 'object' && !Array.isArray(x) && ('fr' in x || 'en' in x) ? x[state.lang] : x);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const today = () => new Date().toISOString().slice(0, 10);
  const ic = Icons.icon;
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];

  /* ------------------------------------------------------------ course data */
  // Chapters are grouped by track (skills, visual, finance); the recommended path follows this order.
  const chaptersOf = (trackId) => CHAPTERS.filter((c) => c.track === trackId);
  const ORDERED = TRACKS.flatMap((tr) => chaptersOf(tr.id));
  const ALL = ORDERED.flatMap((c) => c.lessons.map((l) => Object.assign(l, { chapterId: c.id })));
  const chapterOf = (id) => CHAPTERS.find((c) => c.id === id);
  const trackById = (id) => TRACKS.find((tr) => tr.id === id);
  const trackOf = (c) => trackById(c.track);
  const lessonOf = (id) => ALL.find((l) => l.id === id);
  const themeOf = (c) => 'c-' + trackOf(c).color;
  const isDone = (id) => !!state.done[id];
  const chapterProgress = (c) => ({ done: c.lessons.filter((l) => isDone(l.id)).length, total: c.lessons.length });
  const trackProgress = (tr) => chaptersOf(tr.id).reduce((a, c) => { const p = chapterProgress(c); return { done: a.done + p.done, total: a.total + p.total }; }, { done: 0, total: 0 });
  const typeLabel = (l) => (l.type === 'quiz' ? t('typeQuiz') : l.type === 'build' ? t('typeProject') : t('typePractice'));

  /* ---- prerequisites: recommended lessons to do (or to mark as already known) first ---- */
  const satisfied = (id) => isDone(id) || !!state.known[id];
  const reqOf = (l) => l.requires || (chapterOf(l.chapterId).requires) || [];
  const missingReqs = (ids) => ids.filter((id) => !satisfied(id));
  // follow the path: if a lesson has unmet prerequisites, point to the first of those instead
  function resolvePath(lesson) {
    let cur = lesson; const seen = new Set();
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id);
      const miss = missingReqs(reqOf(cur));
      if (!miss.length) return cur;
      cur = lessonOf(miss[0]);
    }
    return lesson;
  }
  // "Pick up where you left off": continue in the chapter she was last working in, else follow the path.
  function nextLesson() {
    const lastId = Object.keys(state.done).pop();           // insertion order = completion order
    const last = lastId && lessonOf(lastId);
    if (last) {
      const chapter = chapterOf(last.chapterId);
      const here = chapter.lessons.find((l) => !isDone(l.id) && !state.known[l.id]);
      if (here) return resolvePath(here);
    }
    const first = ALL.find((l) => !isDone(l.id) && !state.known[l.id]);
    return first ? resolvePath(first) : null;
  }
  // the next few lessons to do, in path order (no duplicates)
  function upcoming(n) {
    const out = [];
    for (const l of ALL) {
      if (isDone(l.id) || state.known[l.id]) continue;
      const r = resolvePath(l);
      if (!out.includes(r) && !isDone(r.id)) out.push(r);
      if (out.length >= n) break;
    }
    return out;
  }
  // lessons she finished with help (hints / wrong answers) are worth another look
  const needsReview = () => ALL.filter((l) => { const d = state.done[l.id]; return d && ((d.hints || 0) >= 2 || (d.wrongs || 0) >= 2); });
  const recentlyDone = (n) => Object.entries(state.done).reverse().sort((a, b) => (b[1].date || '').localeCompare(a[1].date || '')).slice(0, n).map(([id]) => lessonOf(id)).filter(Boolean);

  function gardenInfo() {
    let idx = 0;
    GARDEN.forEach((g, i) => { if (state.xp >= g.xp) idx = i; });
    const cur = GARDEN[idx], nxt = GARDEN[idx + 1];
    const pct = nxt ? Math.round(((state.xp - cur.xp) / (nxt.xp - cur.xp)) * 100) : 100;
    return { idx, cur, nxt, pct };
  }

  /* ------------------------------------------------------------ number formatting (Canadian dollars) */
  function fmtValue(v, kind) {
    if (typeof v === 'boolean') return v ? (state.lang === 'fr' ? 'VRAI' : 'TRUE') : (state.lang === 'fr' ? 'FAUX' : 'FALSE');
    if (typeof v !== 'number') return String(v);
    const loc = state.lang === 'fr' ? 'fr-CA' : 'en-CA';
    if (kind === 'money') return new Intl.NumberFormat(loc, { style: 'currency', currency: 'CAD', minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }).format(v);
    if (kind === 'pct') return new Intl.NumberFormat(loc, { style: 'percent', maximumFractionDigits: 1 }).format(v);
    return new Intl.NumberFormat(loc, { maximumFractionDigits: 2 }).format(v);
  }
  const fmtKind = (lesson, addr) => { const col = addr.replace(/\d+/, ''); const f = lesson.fmt || {}; return f[addr] || f[col]; };
  const resolveCell = (c) => (c && typeof c === 'object' ? c[state.lang] : c);
  const resolveGrid = (g) => g.map((row) => row.map(resolveCell));
  const resolveSet = (s) => { const o = {}; for (const [a, v] of Object.entries(s || {})) o[a] = resolveCell(v); return o; };

  /* ------------------------------------------------------------ feedback bits */
  function toast(msg, icon = 'star') {
    let stack = $('#toasts');
    if (!stack) { stack = document.createElement('div'); stack.id = 'toasts'; document.body.appendChild(stack); }
    const el = document.createElement('div');
    el.className = 'toast'; el.innerHTML = ic(icon, 18) + '<span>' + msg + '</span>';
    stack.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }
  function confetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div'); box.className = 'confetti';
    const colors = ['#FAC3DC', '#BFE0FB', '#C5EBD2', '#FBEAA8', '#DCCBFA', '#FDD5B8'];
    for (let i = 0; i < 44; i++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%'; s.style.background = pick(colors);
      s.style.animationDuration = 2.4 + Math.random() * 2.2 + 's'; s.style.animationDelay = Math.random() * .5 + 's';
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 5400);
  }

  /* ------------------------------------------------------------ progress engine */
  function badgeEarned(id) {
    const doneIds = Object.keys(state.done);
    switch (id) {
      case 'first': return doneIds.length >= 1;
      case 'streak3': return state.streak.count >= 3;
      case 'nohint': return Object.values(state.done).some((d) => d.hints === 0);
      case 'level2': return ALL.filter((l) => l.chapterId === 'formulas' && l.level === 1).every((l) => isDone(l.id));
      case 'five': return doneIds.length >= 5;
      case 'chapter': return CHAPTERS.some((c) => c.lessons.length && c.lessons.every((l) => isDone(l.id)));
      case 'builder': return ALL.some((l) => l.type === 'build' && isDone(l.id));
      case 'bonus': return Object.values(state.bonus).some((a) => a.length > 0);
      default: return false;
    }
  }

  // Adds XP, updates the streak, unlocks badges / garden levels, saves.
  function reward(gain) {
    const result = { gain, newBadges: [], levelUp: null, repeat: false };
    const before = gardenInfo().idx;
    state.xp += gain;
    const d = today();
    if (state.streak.last !== d) {
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      state.streak.count = state.streak.last === y ? state.streak.count + 1 : 1;
      state.streak.last = d;
    }
    BADGES.forEach((b) => { if (!state.badges[b.id] && badgeEarned(b.id)) { state.badges[b.id] = d; result.newBadges.push(b); } });
    const after = gardenInfo();
    if (after.idx > before) result.levelUp = after.cur;
    save(); App.refreshChrome && App.refreshChrome();
    return result;
  }

  function completeLesson(lesson, { hints = 0, wrongs = 0 }) {
    if (isDone(lesson.id)) return { gain: 0, newBadges: [], levelUp: null, repeat: true };
    const gain = lesson.type === 'quiz' ? Math.max(3, lesson.xp - 2 * wrongs)
      : lesson.type === 'build' ? lesson.xp
        : Math.max(4, lesson.xp - 3 * hints);
    state.done[lesson.id] = { xp: gain, hints: lesson.type === 'practice' ? hints : null, wrongs: lesson.type === 'quiz' ? wrongs : null, date: today() };
    return reward(gain);
  }

  // Project bonuses can be earned on later uploads: 5 XP each, once.
  function awardBonus(lesson, ids) {
    const have = state.bonus[lesson.id] = state.bonus[lesson.id] || [];
    const fresh = ids.filter((i) => !have.includes(i));
    if (!fresh.length) return null;
    have.push(...fresh);
    return reward(5 * fresh.length);
  }

  function celebrate(res) {
    confetti();
    res.newBadges.forEach((b, i) => setTimeout(() => toast(esc(t('badgeUnlocked')) + '<b>' + esc(L(b.title)) + '</b>', b.icon), 500 + i * 1800));
    if (res.levelUp) setTimeout(() => toast(esc(t('levelUp', '', L(res.levelUp.name))), 'star'), 500 + res.newBadges.length * 1800);
  }

  // Wizard position is remembered so a refresh (or a trip to Excel and back) resumes where she was.
  const wizGet = (id) => state.wiz[id] || null;
  const wizSet = (id, v) => { state.wiz[id] = v; save(); };

  return {
    state, defaults, save, resetState, $, $$, t, L, esc, pick, today, ic, LETTERS,
    chaptersOf, ORDERED, ALL, chapterOf, trackById, trackOf, lessonOf, themeOf, isDone, chapterProgress, trackProgress, typeLabel,
    satisfied, reqOf, missingReqs, resolvePath, nextLesson, upcoming, needsReview, recentlyDone, gardenInfo,
    fmtValue, fmtKind, resolveCell, resolveGrid, resolveSet, toast, confetti,
    reward, completeLesson, awardBonus, celebrate, wizGet, wizSet,
  };
})();
