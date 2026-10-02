/* Excel Académie — app logic (no framework, no build step). */
(() => {
  'use strict';

  /* ------------------------------------------------------------ state */
  const KEY = 'excel-academy-v1';
  const defaults = () => ({ lang: 'fr', xp: 0, done: {}, known: {}, streak: { last: null, count: 0 }, badges: {}, bonus: {}, steps: {} });
  let state = load();

  function load() {
    try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return defaults(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode: ignore */ } }

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

  /* ---- prerequisites: recommended lessons to do (or to mark as already known) first ---- */
  const satisfied = (id) => isDone(id) || !!state.known[id];
  const reqOf = (l) => l.requires || (chapterOf(l.chapterId).requires) || [];
  const missingReqs = (ids) => ids.filter((id) => !satisfied(id));
  function nextLesson() {
    const first = ALL.find((l) => !isDone(l.id));
    if (!first) return null;
    // follow the path: if the next lesson has unmet prerequisites, send her to the first one of those
    let cur = first; const seen = new Set();
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id);
      const miss = missingReqs(reqOf(cur));
      if (!miss.length) return cur;
      cur = lessonOf(miss[0]);
    }
    return first;
  }
  const dismissed = new Set(); // "continue anyway" choices, kept for this visit only

  function gardenInfo() {
    let idx = 0;
    GARDEN.forEach((g, i) => { if (state.xp >= g.xp) idx = i; });
    const cur = GARDEN[idx], nxt = GARDEN[idx + 1];
    const pct = nxt ? Math.round(((state.xp - cur.xp) / (nxt.xp - cur.xp)) * 100) : 100;
    return { idx, cur, nxt, pct };
  }

  /* ------------------------------------------------------------ number formatting */
  function fmtValue(v, kind) {
    if (typeof v === 'boolean') return v ? (state.lang === 'fr' ? 'VRAI' : 'TRUE') : (state.lang === 'fr' ? 'FAUX' : 'FALSE');
    if (typeof v !== 'number') return String(v);
    const loc = state.lang === 'fr' ? 'fr-FR' : 'en-US';
    if (kind === 'eur') return new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR', minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }).format(v);
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
      s.style.left = Math.random() * 100 + '%';
      s.style.background = pick(colors);
      s.style.animationDuration = 2.4 + Math.random() * 2.2 + 's';
      s.style.animationDelay = Math.random() * .5 + 's';
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 5400);
  }
  function popSegment() {
    const cur = $('.seg a.cur');
    if (cur) { cur.classList.remove('pop'); void cur.offsetWidth; cur.classList.add('pop'); }
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
    save(); renderTopbar();
    return result;
  }

  function completeLesson(lesson, { hints = 0, wrongs = 0 }) {
    if (isDone(lesson.id)) return { gain: 0, newBadges: [], levelUp: null, repeat: true };
    const gain = lesson.type === 'quiz' ? Math.max(3, lesson.xp - 2 * wrongs)
      : lesson.type === 'build' ? lesson.xp
        : Math.max(4, lesson.xp - 3 * hints);
    state.done[lesson.id] = { xp: gain, hints: lesson.type === 'practice' ? hints : null, date: today() };
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
    confetti(); popSegment();
    res.newBadges.forEach((b, i) => setTimeout(() => toast(esc(t('badgeUnlocked')) + '<b>' + esc(L(b.title)) + '</b>', b.icon), 500 + i * 1800));
    if (res.levelUp) setTimeout(() => toast(esc(t('levelUp', '', L(res.levelUp.name))), 'star'), 500 + res.newBadges.length * 1800);
  }

  /* ------------------------------------------------------------ chrome: top status + bottom dock */
  function renderTopbar() {
    const g = gardenInfo();
    $('#topbar').innerHTML = `
      <a class="wordmark" href="#/">${Icons.mark(30)}<span>${esc(t('appName'))}</span></a>
      <div class="status">
        <span class="lvl">${Icons.flower(g.idx, 28)}<span class="name">${esc(L(g.cur.name))}</span></span>
        <span class="stat" title="XP">${ic('star', 17)}${state.xp}<span class="muted"> ${t('xpWord')}</span></span>
        <span class="stat" title="${esc(t('streakWord'))}">${ic('flame', 17)}${state.streak.count}</span>
      </div>`;
  }

  function activeNav() {
    const [kind, id] = route.replace(/^#\/?/, '').split('/');
    if (kind === 't') return id;
    if (kind === 'c') { const c = chapterOf(id); return c ? c.track : 'home'; }
    if (kind === 'l') { const l = lessonOf(id); return l ? chapterOf(l.chapterId).track : 'home'; }
    return 'home';
  }

  function renderDock() {
    const active = activeNav();
    $('#dock').innerHTML = `
      <a class="${active === 'home' ? 'on' : ''}" href="#/" aria-label="${esc(t('navHome'))}">${ic('home', 18)}<span class="lab">${esc(t('navHome'))}</span></a>
      ${TRACKS.map((tr, i) => `<a class="c-${tr.color} ${active === tr.id ? 'on' : ''}" href="#/t/${tr.id}" aria-label="${esc(L(tr.title))}"><span class="letter">${LETTERS[i]}</span><span class="lab">${esc(L(tr.short))}</span></a>`).join('')}
      <span class="sep"></span>
      <button class="lang" id="langBtn" aria-label="Language">${state.lang === 'fr' ? '<b>FR</b> / EN' : 'FR / <b>EN</b>'}</button>`;
    $('#langBtn').onclick = () => { state.lang = state.lang === 'fr' ? 'en' : 'fr'; save(); document.documentElement.lang = state.lang; renderTopbar(); render(); };
  }

  /* ------------------------------------------------------------ shared view pieces */
  const app = () => $('#app');
  const typeLabel = (l) => (l.type === 'quiz' ? t('typeQuiz') : l.type === 'build' ? t('typeProject') : t('typePractice'));
  const crumbs = (...parts) => `<nav class="crumbs">${parts.map((p, i) => (i ? '<span class="sl">/</span>' : '') + (p.href ? `<a href="${p.href}">${esc(p.text)}</a>` : `<span>${esc(p.text)}</span>`)).join('')}</nav>`;
  const cellsHTML = (c) => {
    if (!c.lessons.length) return `<div class="cells">${Array.from({ length: Math.min(c.roadmap.length, 8) }, () => '<i class="cell dashed"></i>').join('')}</div>`;
    return `<div class="cells">${c.lessons.map((l) => `<i class="cell ${isDone(l.id) ? 'on' : state.known[l.id] ? 'known' : ''}"></i>`).join('')}</div>`;
  };

  function chapterRow(c) {
    const live = c.lessons.length > 0, p = chapterProgress(c);
    const miss = live ? missingReqs(c.requires || []).length : 0;
    return `<a class="row ${themeOf(c)}" href="#/c/${c.id}">
      <div class="row-title">${esc(L(c.title))}</div>
      <div class="row-sub">${esc(L(c.tagline))}</div>
      ${cellsHTML(c)}
      ${miss ? `<div class="warn-line">${ic('info', 15)}<span>${esc(t('rowDoFirst', miss))}</span></div>` : ''}
      <div class="row-side">${live ? `<span><b>${p.done}</b> / ${p.total}</span>` : `<span class="soon-tag">${t('soonRow')}</span>`}</div>
    </a>`;
  }

  // The soft warning: lists the recommended lessons that are not done yet.
  function mountPrereq(slot, intro, ids, key) {
    const miss = missingReqs(ids);
    if (!miss.length) { slot.innerHTML = ''; return; }
    if (dismissed.has(key)) {
      slot.innerHTML = `<div class="prereq min">${ic('info', 18)}<span>${esc(t('prereqCollapsed', miss.length))}</span><button class="btn text sm" data-act="show">${t('prereqShow')}</button></div>`;
    } else {
      slot.innerHTML = `<section class="prereq">
        <h2>${ic('info', 22)}${t('prereqTitle')}</h2>
        <p>${esc(intro)}</p>
        ${miss.map((id) => { const l = lessonOf(id); return `<div class="preq-row"><div class="t"><b>${esc(L(l.title))}</b><small>${esc(L(chapterOf(l.chapterId).title))}</small></div>
          <div class="preq-actions"><a class="btn soft sm" href="#/l/${id}">${t('prereqDo')}</a><button class="btn text sm" data-known="${id}">${t('prereqKnown')}</button></div></div>`; }).join('')}
        <div class="prereq-foot"><button class="btn text sm" data-act="skip">${t('prereqSkip')}</button></div>
      </section>`;
    }
    $$('[data-known]', slot).forEach((b) => b.addEventListener('click', () => { state.known[b.dataset.known] = true; save(); mountPrereq(slot, intro, ids, key); }));
    const skip = $('[data-act="skip"]', slot), show = $('[data-act="show"]', slot);
    if (skip) skip.addEventListener('click', () => { dismissed.add(key); mountPrereq(slot, intro, ids, key); });
    if (show) show.addEventListener('click', () => { dismissed.delete(key); mountPrereq(slot, intro, ids, key); });
  }

  /* ------------------------------------------------------------ home */
  function viewHome() {
    const g = gardenInfo(), nl = nextLesson();
    const started = Object.keys(state.done).length > 0;
    let first = true;
    try { first = !sessionStorage.getItem('xa-hero'); sessionStorage.setItem('xa-hero', '1'); } catch (e) { /* ignore */ }

    const board = TRACKS.map((tr, i) => {
      const p = trackProgress(tr);
      return `<section class="col c-${tr.color}">
        <div class="col-head">
          <span class="letter">${LETTERS[i]}</span>
          <a class="col-title" href="#/t/${tr.id}">${esc(L(tr.title))}</a>
          <p class="col-sub">${esc(L(tr.tagline))}</p>
          ${!started && i === 0 ? `<span class="col-tag">${t('startHere')}</span>` : ''}
        </div>
        <div class="rows">${chaptersOf(tr.id).map(chapterRow).join('')}</div>
        ${p.total ? `<p class="rows-note">${esc(t('lessonsDone', p.done, p.total))}</p>` : ''}
      </section>`;
    }).join('');

    const badges = BADGES.map((b, i) => `<div class="badge ${state.badges[b.id] ? '' : 'locked'} ${['c-blue', 'c-pink', 'c-green', 'c-lilac', 'c-peach', 'c-yellow'][i % 6]}">
      <span class="disc">${ic(b.icon, 22)}</span><div><b>${esc(L(b.title))}</b><small>${esc(L(b.desc))}</small></div></div>`).join('');

    app().innerHTML = `
      <section class="hero ${first ? 'reveal' : ''}">
        <div>
          <h1 class="hero-h"><span class="line"><span>${esc(t('heroL1'))}</span></span><span class="line"><span>${esc(t('heroL2'))}</span></span></h1>
        </div>
        <div class="hero-foot">
          <div>
            <p class="lede">${esc(t('heroLede'))}</p>
            <div class="cta-row">
              ${nl ? `<a class="btn primary" href="#/l/${nl.id}">${esc(started ? t('continueWith', L(nl.title)) : t('startWith', L(nl.title)))}</a>` : `<span class="lede" style="margin:0">${t('allDone')}</span>`}
              <button class="btn soft" id="pathBtn">${t('viewPath')}</button>
            </div>
          </div>
          <div class="level-card c-green">
            ${Icons.flower(g.idx, 64)}
            <div><b>${esc(L(g.cur.name))}</b>
              <div class="thin"><i style="width:${g.pct}%"></i></div>
              <span class="muted small">${g.nxt ? esc(t('levelNext', g.nxt.xp - state.xp, L(g.nxt.name))) : esc(t('maxLevel'))}</span></div>
          </div>
        </div>
      </section>
      <section id="path" class="board">${board}</section>
      <h2 class="section-h" style="margin-top:clamp(56px,10vh,120px)">${t('badgesTitle')}</h2>
      <div class="badge-row">${badges}</div>
      <div class="reset-row"><button class="btn text sm" id="resetBtn">${t('reset')}</button></div>`;

    $('#pathBtn').onclick = () => $('#path').scrollIntoView({ behavior: 'smooth', block: 'start' });
    // two-tap confirmation (browser confirm() dialogs are blocked in some viewers)
    let armed = false;
    $('#resetBtn').onclick = () => {
      if (!armed) {
        armed = true; $('#resetBtn').textContent = t('resetConfirm');
        setTimeout(() => { armed = false; const b = $('#resetBtn'); if (b) b.textContent = t('reset'); }, 5000);
        return;
      }
      const lang = state.lang; state = defaults(); state.lang = lang; save(); renderTopbar(); render();
    };
  }

  /* ------------------------------------------------------------ track + chapter pages */
  function viewTrack(id) {
    const tr = trackById(id);
    if (!tr) return go('#/');
    const p = trackProgress(tr), i = TRACKS.indexOf(tr);
    app().innerHTML = `
      ${crumbs({ text: t('navHome'), href: '#/' }, { text: L(tr.short) })}
      <header class="band c-${tr.color}">
        <div><h1 class="display">${esc(L(tr.title))}</h1><p>${esc(L(tr.tagline))}</p></div>
        <div class="band-side"><span class="letter" style="background:#fff">${LETTERS[i]}</span>
          ${p.total ? `<div class="band-count">${p.done}<small> / ${p.total}</small></div><span>${esc(t('lessonsDone', p.done, p.total))}</span>` : ''}</div>
      </header>
      <section class="levels c-${tr.color}"><div class="rows">${chaptersOf(tr.id).map(chapterRow).join('')}</div></section>`;
  }

  function viewChapter(id) {
    const c = chapterOf(id);
    if (!c) return go('#/');
    const tr = trackOf(c), p = chapterProgress(c);
    const nl = c.lessons.find((l) => !isDone(l.id));
    let body = '';
    if (c.lessons.length) {
      const levels = [...new Set(c.lessons.map((l) => l.level))].sort();
      body += levels.map((lv) => `
        <section class="level">
          <h2>${esc(L((c.levelNames || {})[lv] || LEVELS[lv]))}<small>${t('levelWord')} ${lv}</small></h2>
          <div class="rows">${c.lessons.filter((l) => l.level === lv).map((l) => {
            const i = c.lessons.indexOf(l) + 1, done = isDone(l.id);
            return `<a class="row lesson ${done ? 'done' : ''} ${nl && nl.id === l.id ? 'next' : ''}" href="#/l/${l.id}">
              <span class="num">${done ? ic('check', 16) : i}</span>
              <div class="row-title">${esc(L(l.title))}</div>
              <div class="row-sub">${esc(typeLabel(l))}</div>
              <div class="row-side"><span>${l.xp} ${t('xpWord')}</span>${done ? `<b>${t('statusDone')}</b>` : state.known[l.id] ? `<span>${t('statusKnown')}</span>` : ''}</div>
            </a>`;
          }).join('')}</div>
        </section>`).join('');
    } else {
      body += `<p class="muted">${esc(t('noLessonsYet'))}</p>`;
    }
    if (c.roadmap && c.roadmap.length) {
      body += `<section class="level"><h2>${esc(c.lessons.length ? (state.lang === 'fr' ? 'À venir' : 'Coming up') : t('roadmapTitle'))}</h2>
        <div class="roadmap">${c.roadmap.map((r) => `<div class="road">${esc(L(r))}</div>`).join('')}</div></section>`;
    }
    app().innerHTML = `
      ${crumbs({ text: t('navHome'), href: '#/' }, { text: L(tr.short), href: '#/t/' + tr.id }, { text: L(c.title) })}
      <header class="band ${themeOf(c)}">
        <div><h1 class="display">${esc(L(c.title))}</h1><p>${esc(L(c.tagline))}</p></div>
        <div class="band-side">
          ${c.lessons.length ? `<div class="band-count">${p.done}<small> / ${p.total}</small></div>${cellsHTML(c)}
            ${nl ? `<a class="btn primary" href="#/l/${nl.id}">${p.done ? t('continue') : t('start')}</a>` : ''}` : `<span class="soon-tag" style="border-color:rgba(30,27,46,.4);color:var(--ink)">${t('soonRow')}</span>`}
        </div>
      </header>
      <div id="prereq-slot" style="margin-top:28px"></div>
      <div class="levels ${themeOf(c)}">${body}</div>`;
    if (c.requires) mountPrereq($('#prereq-slot'), t('chapterPrereqIntro'), c.requires, 'c:' + c.id);
  }

  /* ------------------------------------------------------------ lessons: shared head */
  function lessonHead(lesson, c, chips) {
    const tr = trackOf(c), idx = c.lessons.findIndex((l) => l.id === lesson.id);
    return `${crumbs({ text: t('navHome'), href: '#/' }, { text: L(tr.short), href: '#/t/' + tr.id }, { text: L(c.title), href: '#/c/' + c.id })}
      <header class="lesson-head ${themeOf(c)}">
        <div class="seg">${c.lessons.map((l, i) => `<a class="${isDone(l.id) ? 'on' : ''} ${i === idx ? 'cur' : ''}" href="#/l/${l.id}" aria-label="${esc(L(l.title))}"></a>`).join('')}<span class="seg-label">${esc(t('lessonOf', idx + 1, c.lessons.length))}</span></div>
        <h1 class="lesson-title">${esc(L(lesson.title))}</h1>
        <div class="meta-row">${chips.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>
      </header>
      <div id="prereq-slot"></div>`;
  }
  const nextOf = (lesson, c) => { const i = c.lessons.findIndex((l) => l.id === lesson.id); return c.lessons[i + 1] || null; };
  const nextButtons = (next, c) => (next
    ? `<a class="btn primary" href="#/l/${next.id}">${t('next')}</a><a class="btn soft" href="#/c/${c.id}">${t('nextChapter')}</a>`
    : `<a class="btn primary" href="#/c/${c.id}">${t('nextChapter')}</a>`);
  const noteHTML = (kind, title, bodyHTML) => `<div class="note ${kind === 'tip' ? 'tip' : ''}"><span class="ic-wrap">${ic(kind === 'tip' ? 'star' : 'book', 19)}</span><div><b>${esc(title)}</b>${bodyHTML}</div></div>`;
  const bannerHTML = (kind, inner) => `<div class="banner ${kind}"><span class="ic-wrap">${ic(kind === 'good' ? 'check' : 'alert', 17)}</span><div>${inner}</div></div>`;

  function viewLesson(id) {
    const lesson = lessonOf(id);
    if (!lesson) return go('#/');
    const c = chapterOf(lesson.chapterId);
    document.title = L(lesson.title) + ' · ' + t('appName');
    if (lesson.type === 'quiz') viewQuiz(lesson, c);
    else if (lesson.type === 'build') viewBuild(lesson, c);
    else viewPractice(lesson, c);
    mountPrereq($('#prereq-slot'), t('prereqIntro', L(lesson.title)), reqOf(lesson), 'l:' + lesson.id);
  }

  /* ------------------------------------------------------------ practice lesson (mini Excel) */
  function sheetHTML(lesson) {
    const grid = resolveGrid(lesson.grid);
    const cols = Math.max(...grid.map((r) => r.length));
    let h = `<table class="sheet"><thead><tr><th class="rh"></th>${Array.from({ length: cols }, (_, i) => `<th class="col">${Engine.colLetter(i)}</th>`).join('')}</tr></thead><tbody>`;
    grid.forEach((row, r) => {
      h += `<tr><th class="rh">${r + 1}</th>`;
      for (let col = 0; col < cols; col++) {
        const addr = Engine.colLetter(col) + (r + 1);
        const v = row[col];
        if (addr === lesson.target) {
          h += `<td class="target"><input id="answer" type="text" inputmode="text" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" aria-label="${esc(t('typeHere'))}" placeholder="=" /></td>`;
        } else if (v === null || v === undefined || v === '') {
          h += '<td></td>';
        } else if (r === 0 && typeof v === 'string') {
          h += `<td class="head">${esc(v)}</td>`;
        } else if (typeof v === 'number') {
          h += `<td class="num">${esc(fmtValue(v, fmtKind(lesson, addr)))}</td>`;
        } else {
          h += `<td>${esc(v)}</td>`;
        }
      }
      h += '</tr>';
    });
    return h + '</tbody></table>';
  }

  function runBase(lesson, formula) {
    return Engine.run({ grid: resolveGrid(lesson.grid), target: lesson.target, formula, set: resolveSet(lesson.tests[0].set), lang: state.lang });
  }

  function errMessage(r) {
    switch (r.error) {
      case 'NAME': return t('errName');
      case 'VALUE': return t('errValue');
      case 'DIV_BY_ZERO': return t('errDiv');
      case 'NA': return t('errNA');
      case 'ERROR': return t('errSyntax');
      default: return t('errOther', esc(r.error));
    }
  }

  function checkFormula(lesson, formula) {
    const f = formula.trim();
    if (!f) return { ok: false, html: t('errEmpty') };
    if (f[0] !== '=') return { ok: false, html: t('errNoEquals') };
    const grid = resolveGrid(lesson.grid);
    for (let i = 0; i < lesson.tests.length; i++) {
      const test = lesson.tests[i];
      const expected = resolveCell(test.expect);
      const r = Engine.run({ grid, target: lesson.target, formula: f, set: resolveSet(test.set), lang: state.lang });
      if (r.error) return { ok: false, html: errMessage(r) };
      if (!Engine.equal(r.value, expected)) {
        const kind = fmtKind(lesson, lesson.target);
        if (i === 0) {
          return { ok: false, html: `${t('wrongValue')}<br><small>${t('yourAnswer')} : <code>${esc(fmtValue(r.value, kind))}</code> &nbsp; ${t('expected')} : <code>${esc(fmtValue(expected, kind))}</code></small>` };
        }
        return { ok: false, html: Object.keys(test.set || {}).length ? t('hardcoded') : t('hardcodedChanged') };
      }
      // after the base case passes, enforce the required functions / references
      if (i === 0) {
        const up = f.toUpperCase().replace(/\s/g, '');
        const need = lesson.mustUse ? lesson.mustUse[state.lang].filter((fn) => !up.includes(fn)) : [];
        if (need.length) return { ok: false, html: t('needFn', need.join(' + ')) };
        const refs = (lesson.mustRef || []).filter((x) => !up.includes(x));
        if (refs.length) return { ok: false, html: t('needRef', refs.join(', ')) };
      }
    }
    return { ok: true };
  }

  function viewPractice(lesson, c) {
    const next = nextOf(lesson, c);
    let hints = 0, solved = false;
    const nHints = lesson.hints.length;

    app().innerHTML = `
      ${lessonHead(lesson, c, [`${t('levelWord')} ${lesson.level}`, `${lesson.xp} ${t('xpWord')}`])}
      <div class="lesson-cols ${themeOf(c)}">
        <article class="read">
          <div class="prose">${L(lesson.intro)}</div>
          <div class="mission"><b>${t('mission')}</b>${L(lesson.task)}</div>
          <div class="actions" style="margin-top:0">
            <button class="btn soft sm" id="hintBtn">${ic('bulb', 18)}<span id="hintLabel">${t('hintsLeft', nHints)}</span></button>
            ${isDone(lesson.id) ? `<span class="muted small">${t('alreadyDone')}</span>` : ''}
          </div>
          <div class="hints" id="hints"></div>
          <div id="teacher"></div>
        </article>
        <section class="stage">
          <div class="win">
            <div class="fbar"><span class="namebox">${esc(lesson.target)}</span><span class="fx">fx</span><span class="formula" id="fxBar">&nbsp;</span></div>
            <div class="sheet-scroll">${sheetHTML(lesson)}</div>
            <div class="legend">${t('cellLegend')}</div>
            <div class="result">
              <span class="live" id="live">${t('liveEmpty')}</span>
              <button class="btn primary sm" id="checkBtn">${ic('check', 18)}${t('checkAnswer')}</button>
            </div>
          </div>
          <div id="feedback"></div>
          <div class="actions" id="nextRow"></div>
        </section>
      </div>`;

    const input = $('#answer'), fxBar = $('#fxBar'), live = $('#live'), fb = $('#feedback');
    const kind = fmtKind(lesson, lesson.target);

    function updateLive() {
      const v = input.value;
      fxBar.textContent = v || ' ';
      live.className = 'live';
      if (!v.trim()) { live.textContent = t('liveEmpty'); return; }
      if (v.trim()[0] !== '=') { live.innerHTML = `${t('liveResult')}<b>${esc(v)}</b>`; return; }
      const r = runBase(lesson, v.trim());
      if (r.error) { live.className = 'live err'; live.innerHTML = `${t('liveResult')}<b>#${esc(r.error)}</b>`; }
      else live.innerHTML = `${t('liveResult')}<b>${esc(fmtValue(r.value, kind))}</b>`;
    }
    input.addEventListener('input', () => { updateLive(); if (!solved) fb.innerHTML = ''; });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doCheck(); } });

    function showHints() {
      $('#hints').innerHTML = lesson.hints.slice(0, Math.min(hints, nHints)).map((h) => `<div class="hint">${ic('bulb', 18)}<div>${L(h)}</div></div>`).join('')
        + (hints > nHints ? `<div class="hint">${ic('check', 18)}<div><b>${t('solutionIs')}</b> <code>${esc(L(lesson.solution))}</code></div></div>` : '');
      const left = nHints - hints;
      $('#hintLabel').textContent = left > 0 ? t('hintsLeft', left) : (hints > nHints ? t('showSolution') : t('showSolution'));
      $('#hintBtn').disabled = hints > nHints;
    }
    $('#hintBtn').onclick = () => { hints++; showHints(); };

    function doCheck() {
      const res = checkFormula(lesson, input.value);
      if (!res.ok) { fb.innerHTML = bannerHTML('bad', res.html); input.focus(); return; }
      solved = true;
      const out = completeLesson(lesson, { hints });
      fb.innerHTML = bannerHTML('good', `<b>${esc(pick(t('bravo')))}</b>${out.gain ? `<span class="xp">${esc(t('xpGained', out.gain))}</span>` : ''}`);
      $('#teacher').innerHTML = noteHTML('teacher', t('teacherSays'), `<div>${L(lesson.explain)}</div>`)
        + (lesson.pro ? noteHTML('tip', t('proTip'), `<div>${L(lesson.pro)}</div>`) : '');
      $('#nextRow').innerHTML = nextButtons(next, c);
      celebrate(out);
      $('#feedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    $('#checkBtn').onclick = doCheck;
    setTimeout(() => input.focus({ preventScroll: true }), 80);
  }

  /* ------------------------------------------------------------ build project (real Excel + file check) */
  function viewBuild(lesson, c) {
    const next = nextOf(lesson, c);
    const ticks = (state.steps[lesson.id] = state.steps[lesson.id] || []);
    const startUrl = L(lesson.files.start), modelUrl = lesson.files.model ? L(lesson.files.model) : null;
    const steps = lesson.steps.map((s, i) => `
      <li class="step ${ticks[i] ? 'done' : ''}">
        <span class="step-n">${i + 1}</span>
        <div class="step-title"><b>${L(s.title)}</b>
          <label class="step-tick"><input type="checkbox" data-step="${i}" ${ticks[i] ? 'checked' : ''}>${t('stepDone')}</label></div>
        <div class="prose">${L(s.body)}</div>
      </li>`).join('');

    app().innerHTML = `
      ${lessonHead(lesson, c, [`${t('levelWord')} ${lesson.level}`, t('typeProject'), `${lesson.xp} ${t('xpWord')}`])}
      <div class="lesson-cols ${themeOf(c)}">
        <article class="read">
          <div class="prose">${L(lesson.intro)}</div>
          <div class="actions"><a class="btn primary" href="${esc(startUrl)}" download>${ic('download', 18)}${t('downloadStart')}</a></div>
          <p class="muted small" style="margin-top:10px">${t('openInExcel')}</p>
          <ol class="timeline">${steps}</ol>
        </article>
        <section class="stage">
          <div class="upload">
            <h2>${t('uploadTitle')}</h2>
            <p class="muted" style="margin:0">${t('uploadHelp')}</p>
            <label class="drop" id="drop" for="fileInput">${ic('upload', 30)}<b>${t('dropHere')}</b><small>.xlsx</small></label>
            <input type="file" id="fileInput" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden>
            <p class="privacy">${ic('lock', 16)}<span>${t('privacy')}</span></p>
            <div id="report"></div>
          </div>
          <div id="teacher"></div>
          <div class="actions" id="nextRow"></div>
        </section>
      </div>`;

    $$('input[data-step]').forEach((box) => box.addEventListener('change', () => {
      ticks[+box.dataset.step] = box.checked; save();
      box.closest('.step').classList.toggle('done', box.checked);
    }));

    const report = $('#report'), drop = $('#drop'), input = $('#fileInput');

    function renderReport(results) {
      const req = results.filter((r) => !r.bonus), okReq = req.filter((r) => r.ok).length;
      const gt = (k, dflt) => (lesson.groupTitles && lesson.groupTitles[k] ? L(lesson.groupTitles[k]) : dflt);
      const groups = [['calc', gt('calc', t('groupCalc'))], ['design', gt('design', t('groupDesign'))], ['bonus', t('groupBonus')]];
      const list = groups.map(([g, title]) => `
        <h3 class="chk-group">${title}</h3>
        <ul class="checks">${results.filter((r) => r.group === g).map((r) => `
          <li class="chk ${r.ok ? 'ok' : r.bonus ? 'opt' : 'bad'}"><span class="dot">${r.ok ? ic('check', 14) : r.bonus ? '' : ic('close', 14)}</span>
            <div><b>${esc(r.label)}</b>${r.msg ? `<div class="chk-msg">${r.msg}</div>` : ''}</div></li>`).join('')}</ul>`).join('');
      report.innerHTML = `
        <div class="score"><b>${esc(t('checksPassed', okReq, req.length))}</b><div class="thin"><i style="width:${Math.round((okReq / req.length) * 100)}%"></i></div></div>
        ${list}`;
      return okReq === req.length;
    }

    function finish(results) {
      const out = completeLesson(lesson, {});
      const bonusIds = results.filter((r) => r.bonus && r.ok).map((r) => r.id);
      const bonusRes = awardBonus(lesson, bonusIds);
      $('#teacher').innerHTML = bannerHTML('good', `<b>${esc(pick(t('bravo')))}</b>${out.gain ? `<span class="xp">${esc(t('xpGained', out.gain))}</span>` : `<span class="muted"> ${esc(t('alreadyDone'))}</span>`}${bonusRes ? `<span class="xp">${esc(t('bonusXp', bonusRes.gain))}</span>` : ''}`)
        + noteHTML('teacher', t('teacherSays'), `<div>${L(lesson.explain)}</div>`)
        + (lesson.pro ? noteHTML('tip', t('proTip'), `<div>${L(lesson.pro)}</div>`) : '');
      $('#nextRow').innerHTML = (modelUrl ? `<a class="btn soft" href="${esc(modelUrl)}" download>${ic('download', 18)}${t('downloadModel')}</a>` : '') + nextButtons(next, c);
      if (!out.repeat) celebrate(out);
      if (bonusRes) setTimeout(() => celebrate(bonusRes), out.repeat ? 0 : 2400);
      $('#teacher').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async function handleFile(file) {
      if (!file) return;
      report.innerHTML = `<p class="muted">${esc(t('reading'))}</p>`;
      try {
        if (typeof JSZip === 'undefined') throw new Error('nolib');
        const wb = await XlsxReader.read(await file.arrayBuffer(), JSZip);
        const results = ProjectChecks.run(lesson, wb, state.lang);
        const allOk = renderReport(results);
        $('#teacher').innerHTML = ''; $('#nextRow').innerHTML = '';
        if (allOk) finish(results);
        else { const bonusIds = results.filter((r) => r.bonus && r.ok).map((r) => r.id); if (isDone(lesson.id) && bonusIds.length) awardBonus(lesson, bonusIds); }
      } catch (e) {
        report.innerHTML = bannerHTML('bad', e.message === 'nolib' ? t('libError') : ProjectChecks.MSG[state.lang].notFile);
      } finally { input.value = ''; }
    }
    input.addEventListener('change', () => handleFile(input.files[0]));
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));
  }

  /* ------------------------------------------------------------ quiz lesson */
  function viewQuiz(lesson, c) {
    const next = nextOf(lesson, c);
    let wrongs = 0; const solvedQ = new Set();
    app().innerHTML = `
      ${lessonHead(lesson, c, [`${t('levelWord')} ${lesson.level}`, t('typeQuiz'), `${lesson.xp} ${t('xpWord')}`])}
      <div class="lesson-cols single ${themeOf(c)}"><div class="read" style="max-width:none">
        <div class="prose">${L(lesson.intro)}</div>
        ${lesson.questions.map((q, qi) => `
          <div class="q" data-q="${qi}">
            <h3>${qi + 1}. ${L(q.q)}</h3>
            ${q.options.map((o, oi) => `<button class="opt" data-o="${oi}"><span class="mark"></span><span>${L(o)}</span></button>`).join('')}
            <div class="q-fb"></div>
          </div>`).join('')}
        <p class="muted" id="qProg">${esc(t('quizProgress', 0, lesson.questions.length))}</p>
        <div id="feedback"></div><div class="actions" id="nextRow"></div>
      </div></div>`;

    $$('.opt').forEach((btn) => btn.addEventListener('click', () => {
      const qEl = btn.closest('.q'), qi = +qEl.dataset.q, oi = +btn.dataset.o, q = lesson.questions[qi];
      if (solvedQ.has(qi)) return;
      if (oi === q.answer) {
        btn.classList.add('right'); $('.mark', btn).innerHTML = ic('check', 14); solvedQ.add(qi);
        $$('.opt', qEl).forEach((b) => (b.disabled = true));
        $('.q-fb', qEl).innerHTML = noteHTML('teacher', t('teacherSays'), `<div>${L(q.explain)}</div>`);
        $('#qProg').textContent = t('quizProgress', solvedQ.size, lesson.questions.length);
        if (solvedQ.size === lesson.questions.length) {
          const out = completeLesson(lesson, { wrongs });
          $('#feedback').innerHTML = bannerHTML('good', `<b>${esc(t('quizDone'))}</b>${out.gain ? `<span class="xp">${esc(t('xpGained', out.gain))}</span>` : ''}`);
          $('#nextRow').innerHTML = nextButtons(next, c);
          celebrate(out);
        }
      } else {
        wrongs++;
        btn.classList.add('wrong'); $('.mark', btn).innerHTML = ic('close', 14); btn.disabled = true;
        $('.q-fb', qEl).innerHTML = bannerHTML('bad', esc(t('quizWrong')));
      }
    }));
  }

  /* ------------------------------------------------------------ router */
  // The route is kept in memory so navigation also works inside sandboxed frames
  // (where the URL hash may be read-only); the hash is mirrored when allowed.
  let route = location.hash || '#/';
  function go(h) {
    route = h;
    try { history.pushState(null, '', h); } catch (e) { /* sandboxed: ignore */ }
    render();
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#/"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    go(a.getAttribute('href'));
  });
  const syncFromUrl = () => { route = location.hash || '#/'; render(); };

  function render() {
    const [kind, id] = route.replace(/^#\/?/, '').split('/');
    document.title = t('appName');
    if (kind === 'c') viewChapter(id);
    else if (kind === 'l') viewLesson(id);
    else if (kind === 't') viewTrack(id);
    else viewHome();
    const main = app();
    main.classList.remove('enter'); void main.offsetWidth; main.classList.add('enter');
    window.scrollTo(0, 0);
    renderDock();
    $('#footerText').textContent = t('footer');
  }

  window.addEventListener('hashchange', syncFromUrl);
  window.addEventListener('popstate', syncFromUrl);
  document.documentElement.lang = state.lang;
  renderTopbar();
  render();
})();
