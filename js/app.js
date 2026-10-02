/* Excel Académie — app logic (no framework, no build step). */
(() => {
  'use strict';

  /* ------------------------------------------------------------ state */
  const KEY = 'excel-academy-v1';
  const defaults = () => ({ lang: 'fr', xp: 0, done: {}, streak: { last: null, count: 0 }, badges: {}, bonus: {}, steps: {} });
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

  // Chapters are grouped by track (skills, visual, finance); the "next lesson" follows this order.
  const chaptersOf = (trackId) => CHAPTERS.filter((c) => c.track === trackId);
  const ORDERED = TRACKS.flatMap((tr) => chaptersOf(tr.id));
  const ALL = ORDERED.flatMap((c) => c.lessons.map((l) => Object.assign(l, { chapterId: c.id })));
  const chapterOf = (id) => CHAPTERS.find((c) => c.id === id);
  const trackOf = (c) => TRACKS.find((tr) => tr.id === c.track);
  const numOf = (c) => chaptersOf(c.track).indexOf(c) + 1;
  const trackProgress = (tr) => chaptersOf(tr.id).reduce((a, c) => { const p = chapterProgress(c); return { done: a.done + p.done, total: a.total + p.total }; }, { done: 0, total: 0 });
  const lessonOf = (id) => ALL.find((l) => l.id === id);
  const isDone = (id) => !!state.done[id];
  const chapterProgress = (c) => ({ done: c.lessons.filter((l) => isDone(l.id)).length, total: c.lessons.length });
  const nextLesson = () => ALL.find((l) => !isDone(l.id));

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
  function toast(msg) {
    let stack = $('#toasts');
    if (!stack) { stack = document.createElement('div'); stack.id = 'toasts'; document.body.appendChild(stack); }
    const el = document.createElement('div');
    el.className = 'toast'; el.innerHTML = msg;
    stack.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }
  function confetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div'); box.className = 'confetti';
    const em = ['🌸', '✨', '💖', '🌷', '⭐', '🎀', '💜', '🌼'];
    for (let i = 0; i < 30; i++) {
      const s = document.createElement('span');
      s.textContent = pick(em);
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDuration = 2.2 + Math.random() * 2 + 's';
      s.style.animationDelay = Math.random() * .6 + 's';
      s.style.fontSize = 1.1 + Math.random() * 1.3 + 'rem';
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 5200);
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
    confetti();
    res.newBadges.forEach((b, i) => setTimeout(() => toast(t('badgeUnlocked') + b.icon + ' <b>' + esc(L(b.title)) + '</b>'), 400 + i * 1800));
    if (res.levelUp) setTimeout(() => toast(t('levelUp', res.levelUp.icon, L(res.levelUp.name))), 400 + res.newBadges.length * 1800);
  }

  /* ------------------------------------------------------------ top bar */
  function renderTopbar() {
    const g = gardenInfo();
    $('#topbar').innerHTML = `
      <a class="logo" href="#/"><span class="dot">✿</span><span>${esc(t('appName'))}</span></a>
      <div class="chips">
        <span class="chip" title="${esc(L(g.cur.name))}">${g.cur.icon}<span class="lab">${esc(L(g.cur.name))}</span></span>
        <span class="chip xp-chip">⭐ ${state.xp}<span class="lab"> ${t('xp')}</span></span>
        <span class="chip" title="Streak">🔥 ${state.streak.count ? esc(t('streakDays', state.streak.count)) : '0'}</span>
        <button class="chip lang" id="langBtn" aria-label="Language"><span class="${state.lang === 'fr' ? 'on' : ''}">FR</span><span class="${state.lang === 'en' ? 'on' : ''}">EN</span></button>
      </div>`;
    $('#langBtn').onclick = () => { state.lang = state.lang === 'fr' ? 'en' : 'fr'; save(); document.documentElement.lang = state.lang; renderTopbar(); render(); };
  }

  /* ------------------------------------------------------------ views */
  const app = () => $('#app');

  function viewHome() {
    const g = gardenInfo(), nl = nextLesson();
    const started = Object.keys(state.done).length > 0;
    const chapterCard = (c) => {
      const p = chapterProgress(c), live = c.lessons.length > 0;
      return `<a class="chapter c-${c.color}" href="#/c/${c.id}">
        <span class="num">${t('chapterWord')} ${numOf(c)}</span>${live ? '' : `<span class="soon">${t('soon')}</span>`}
        <div class="blob-wrap"><div class="blob">${esc(L(c.title))}</div></div>
        <p>${c.icon} ${esc(L(c.tagline))}</p>
        <div class="meta">${live
          ? `<div class="bar"><i style="width:${Math.round((p.done / p.total) * 100)}%"></i></div><span>${t('lessonsDone', p.done, p.total)}</span>`
          : `<span class="muted">${t('comingSoon')} · ${c.roadmap.length} ${state.lang === 'fr' ? 'sujets' : 'topics'}</span>`}</div>
      </a>`;
    };
    const trackSections = TRACKS.map((tr) => {
      const p = trackProgress(tr);
      return `<section class="track c-${tr.color}">
        <div class="track-head">
          <span class="track-ic">${tr.icon}</span>
          <div class="track-title"><h2>${esc(L(tr.title))}</h2><p class="muted">${esc(L(tr.tagline))}</p></div>
          ${p.total ? `<div class="track-prog"><div class="bar green"><i style="width:${Math.round((p.done / p.total) * 100)}%"></i></div><small>${t('lessonsDone', p.done, p.total)}</small></div>` : ''}
        </div>
        <div class="grid">${chaptersOf(tr.id).map(chapterCard).join('')}</div>
      </section>`;
    }).join('');

    const badges = BADGES.map((b) => `<div class="badge ${state.badges[b.id] ? '' : 'locked'}"><span class="ic">${b.icon}</span><div><b>${esc(L(b.title))}</b><small>${esc(L(b.desc))}</small></div></div>`).join('');

    app().innerHTML = `
      <section class="hero">
        <div class="card hero-main">
          <h1>${started ? t('welcomeBack') : t('welcome')}</h1>
          <p>${t('heroText')}</p>
          ${nl ? `<a class="btn" href="#/l/${nl.id}">${started ? t('continue') : t('start')} →</a>` : `<p><b>${t('allDone')}</b></p>`}
          ${nl ? `<p class="muted" style="margin:.8em 0 0;font-size:.92rem">${t('nextUp')} : ${esc(L(nl.title))}</p>` : ''}
        </div>
        <div class="card garden">
          <div class="big">${g.cur.icon}</div>
          <h2 style="margin:0">${esc(L(g.cur.name))}</h2>
          <div class="bar green"><i style="width:${g.pct}%"></i></div>
          <span class="muted">${g.nxt ? t('xpToNext', g.nxt.xp - state.xp, L(g.nxt.name)) : t('maxLevel')}</span>
        </div>
      </section>
      ${trackSections}
      <div class="section-title"><h2>${t('badges')}</h2></div>
      <div class="badges">${badges}</div>
      <p style="margin-top:34px;text-align:center"><button class="btn soft" id="resetBtn" style="font-size:.85rem;min-height:38px;padding:8px 18px">${t('reset')}</button></p>`;
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

  const typeLabel = (l) => (l.type === 'quiz' ? 'Quiz' : l.type === 'build' ? t('projectWord') : t('practiceWord'));

  function viewChapter(id) {
    const c = chapterOf(id);
    if (!c) return go('#/');
    const p = chapterProgress(c);
    const nl = c.lessons.find((l) => !isDone(l.id));
    let body = '';
    if (c.lessons.length) {
      const levels = [...new Set(c.lessons.map((l) => l.level))].sort();
      body += levels.map((lv) => `
        <section class="level-block">
          <h2><span class="lvl-pill">${t('level')} ${lv}</span> ${esc(L((c.levelNames || {})[lv] || LEVELS[lv]))}</h2>
          <div class="lessons">${c.lessons.filter((l) => l.level === lv).map((l) => {
            const i = c.lessons.indexOf(l) + 1;
            return `<a class="lesson-card ${isDone(l.id) ? 'done' : ''} ${nl && nl.id === l.id ? 'next' : ''}" href="#/l/${l.id}">
              <span class="st">${isDone(l.id) ? '✓' : i}</span>
              <span><b>${esc(L(l.title))}</b><small>${typeLabel(l)} · ${l.xp} XP</small></span>
            </a>`;
          }).join('')}</div>
        </section>`).join('');
    }
    if (c.roadmap && c.roadmap.length) {
      body += `<section class="level-block"><h2>${c.lessons.length ? '🌱 ' + (state.lang === 'fr' ? 'À venir' : 'Coming up') : '🌱 ' + t('roadmapTitle')}</h2>
        <div class="roadmap">${c.roadmap.map((r) => `<span class="road-chip">${esc(L(r))}</span>`).join('')}</div></section>`;
    }
    app().innerHTML = `
      <a class="back" href="#/">${t('back')}</a>
      <div class="chapter-head c-${c.color}">
        <div class="blob big">${esc(L(c.title))}</div>
        <div class="info">
          <span class="tag">${esc(L(trackOf(c).title))} · ${t('chapterWord')} ${numOf(c)}</span>
          <h1 style="margin-top:8px">${c.icon} ${esc(L(c.tagline))}</h1>
          ${c.lessons.length ? `<div class="bar green" style="max-width:380px"><i style="width:${Math.round((p.done / p.total) * 100)}%"></i></div><p class="muted" style="margin:.4em 0 0">${t('lessonsDone', p.done, p.total)}</p>
          ${nl ? `<p><a class="btn" href="#/l/${nl.id}">${p.done ? t('continue') : t('start')} →</a></p>` : ''}` : `<p class="muted">${t('comingSoon')} ✨</p>`}
        </div>
      </div>
      <div class="c-${c.color}">${body}</div>`;
  }

  /* ---- lesson: shared frame ---- */
  function lessonFrame(lesson, c) {
    const nl = ALL.filter((l) => l.chapterId === c.id);
    const idx = nl.findIndex((l) => l.id === lesson.id);
    return { next: nl[idx + 1] || null };
  }

  function viewLesson(id) {
    const lesson = lessonOf(id);
    if (!lesson) return go('#/');
    const c = chapterOf(lesson.chapterId);
    document.title = L(lesson.title) + ' · ' + t('appName');
    if (lesson.type === 'quiz') return viewQuiz(lesson, c);
    if (lesson.type === 'build') return viewBuild(lesson, c);
    return viewPractice(lesson, c);
  }

  /* ---- practice lesson ---- */
  function sheetHTML(lesson) {
    const grid = resolveGrid(lesson.grid);
    const cols = Math.max(...grid.map((r) => r.length));
    let h = `<table class="sheet"><thead><tr><th></th>${Array.from({ length: cols }, (_, i) => `<th class="col">${Engine.colLetter(i)}</th>`).join('')}</tr></thead><tbody>`;
    grid.forEach((row, r) => {
      h += `<tr><th>${r + 1}</th>`;
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
          return { ok: false, html: `${t('wrongValue')}<br><small>${t('yourAnswer')} : <code>${esc(fmtValue(r.value, kind))}</code> · ${t('expected')} : <code>${esc(fmtValue(expected, kind))}</code></small>` };
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
    const { next } = lessonFrame(lesson, c);
    let hints = 0, solved = false;
    const nHints = lesson.hints.length;

    app().innerHTML = `
      <a class="back" href="#/c/${c.id}">${t('backChapter', esc(L(c.title)))}</a>
      <div class="lesson-grid c-${c.color}">
        <div class="card">
          <span class="tag">${t('level')} ${lesson.level}</span><span class="tag">${lesson.xp} XP</span>
          <h1 class="lesson-title">${esc(L(lesson.title))}</h1>
          <div class="prose">${L(lesson.intro)}</div>
          <div class="mission"><b class="lab">🎯 ${t('mission')}</b>${L(lesson.task)}</div>
          <div class="actions">
            <button class="btn soft" id="hintBtn">💡 ${t('hintsLeft', nHints)}</button>
            ${isDone(lesson.id) ? `<span class="muted" style="font-size:.9rem">${t('alreadyDone')}</span>` : ''}
          </div>
          <div class="hint-box" id="hints"></div>
          <div id="teacher"></div>
        </div>
        <div class="sticky">
          <div class="card sheet-card">
            <div class="sheet-top"><span class="cellref">${esc(lesson.target)}</span><span class="fx">fx</span><span class="bar-input" id="fxBar">&nbsp;</span></div>
            <div class="sheet-scroll">${sheetHTML(lesson)}</div>
            <div class="legend">${t('cellLegend')}</div>
            <div class="result-bar">
              <span class="live" id="live">${t('liveEmpty')}</span>
              <button class="btn" id="checkBtn">✓ ${t('checkAnswer')}</button>
            </div>
          </div>
          <div id="feedback"></div>
          <div class="actions" id="nextRow"></div>
        </div>
      </div>`;

    const input = $('#answer'), fxBar = $('#fxBar'), live = $('#live'), fb = $('#feedback');
    const kind = fmtKind(lesson, lesson.target);

    function updateLive() {
      const v = input.value;
      fxBar.textContent = v || ' ';
      live.className = 'live';
      if (!v.trim()) { live.textContent = t('liveEmpty'); return; }
      if (v.trim()[0] !== '=') { live.innerHTML = `${t('liveResult')} : <b>${esc(v)}</b>`; return; }
      const r = runBase(lesson, v.trim());
      if (r.error) { live.className = 'live err'; live.innerHTML = `${t('liveResult')} : <b>#${esc(r.error)}</b>`; }
      else live.innerHTML = `${t('liveResult')} : <b>${esc(fmtValue(r.value, kind))}</b>`;
    }
    input.addEventListener('input', () => { updateLive(); if (!solved) fb.innerHTML = ''; });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doCheck(); } });

    function showHints() {
      const box = $('#hints');
      box.innerHTML = lesson.hints.slice(0, Math.min(hints, nHints)).map((h, i) => `<div class="hint">💡 <b>${t('hint')} ${i + 1}</b> — ${L(h)}</div>`).join('')
        + (hints > nHints ? `<div class="hint">🔑 <b>${t('solutionIs')}</b> <code>${esc(L(lesson.solution))}</code></div>` : '');
      const left = nHints - hints;
      $('#hintBtn').innerHTML = left > 0 ? `💡 ${t('hintsLeft', left)}` : (hints > nHints ? '🔑 ✓' : `🔑 ${t('showSolution')}`);
      $('#hintBtn').disabled = hints > nHints;
    }
    $('#hintBtn').onclick = () => { hints++; showHints(); };

    function doCheck() {
      const res = checkFormula(lesson, input.value);
      if (!res.ok) {
        fb.innerHTML = `<div class="feedback bad">🤔 ${res.html}</div>`;
        input.focus();
        return;
      }
      solved = true;
      const out = completeLesson(lesson, { hints });
      fb.innerHTML = `<div class="feedback good">🎉 <b>${esc(pick(t('bravo')))}</b> ${out.gain ? `<span class="xp-pop">${t('xpGained', out.gain)}</span>` : ''}</div>`;
      $('#teacher').innerHTML = `
        <div class="teacher"><span class="face">👩‍🏫</span><div><b>${t('teacherSays')}</b><br>${L(lesson.explain)}</div></div>
        ${lesson.pro ? `<div class="teacher pro"><span class="face">✨</span><div><b>${t('proTip')}</b><br>${L(lesson.pro)}</div></div>` : ''}`;
      $('#nextRow').innerHTML = next
        ? `<a class="btn green" href="#/l/${next.id}">${t('next')} →</a><a class="btn soft" href="#/c/${c.id}">${t('nextChapter')}</a>`
        : `<a class="btn green" href="#/c/${c.id}">${t('nextChapter')} →</a>`;
      celebrate(out);
      $('#feedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    $('#checkBtn').onclick = doCheck;
    window.scrollTo(0, 0);
    setTimeout(() => input.focus({ preventScroll: true }), 50);
  }

  /* ---- build project: do it in real Excel, then upload the file to be checked ---- */
  function viewBuild(lesson, c) {
    const { next } = lessonFrame(lesson, c);
    const ticks = (state.steps[lesson.id] = state.steps[lesson.id] || []);
    const startUrl = L(lesson.files.start), modelUrl = L(lesson.files.model);
    const steps = lesson.steps.map((s, i) => `
      <li class="step ${ticks[i] ? 'done' : ''}" data-i="${i}">
        <div class="step-n">${i + 1}</div>
        <div class="step-body">
          <div class="step-title"><b>${L(s.title)}</b>
            <label class="step-tick"><input type="checkbox" data-step="${i}" ${ticks[i] ? 'checked' : ''}> ${t('stepDone')}</label></div>
          <div class="prose">${L(s.body)}</div>
        </div>
      </li>`).join('');

    app().innerHTML = `
      <a class="back" href="#/c/${c.id}">${t('backChapter', esc(L(c.title)))}</a>
      <div class="lesson-grid c-${c.color}">
        <div class="card">
          <span class="tag">${t('level')} ${lesson.level}</span><span class="tag">${t('projectWord')}</span><span class="tag">${lesson.xp} XP</span>
          <h1 class="lesson-title">${esc(L(lesson.title))}</h1>
          <div class="prose">${L(lesson.intro)}</div>
          <div class="actions"><a class="btn" href="${esc(startUrl)}" download>⬇ ${t('downloadStart')}</a><span class="muted" style="font-size:.9rem">${t('openInExcel')}</span></div>
          <ol class="steps">${steps}</ol>
        </div>
        <div class="sticky">
          <div class="card upload-card">
            <h2>📤 ${t('uploadTitle')}</h2>
            <p class="muted" style="margin-top:0">${t('uploadHelp')}</p>
            <label class="drop" id="drop" for="fileInput"><span class="drop-ic">📄</span><b>${t('dropHere')}</b><small>.xlsx</small></label>
            <input type="file" id="fileInput" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden>
            <p class="privacy">🔒 ${t('privacy')}</p>
            <div id="report"></div>
          </div>
          <div id="teacher"></div>
          <div class="actions" id="nextRow"></div>
        </div>
      </div>`;

    $$('input[data-step]').forEach((box) => box.addEventListener('change', () => {
      ticks[+box.dataset.step] = box.checked; save();
      box.closest('.step').classList.toggle('done', box.checked);
    }));

    const report = $('#report'), drop = $('#drop'), input = $('#fileInput');

    function renderReport(results) {
      const req = results.filter((r) => !r.bonus), okReq = req.filter((r) => r.ok).length;
      const groups = [['calc', t('groupCalc')], ['design', t('groupDesign')], ['bonus', t('groupBonus')]];
      const list = groups.map(([g, title]) => `
        <h3 class="chk-group">${title}</h3>
        <ul class="checks">${results.filter((r) => r.group === g).map((r) => `
          <li class="chk ${r.ok ? 'ok' : r.bonus ? 'opt' : 'bad'}"><span class="ic">${r.ok ? '✓' : r.bonus ? '○' : '✗'}</span>
            <div><b>${esc(r.label)}</b>${r.msg ? `<div class="chk-msg">${r.msg}</div>` : ''}</div></li>`).join('')}</ul>`).join('');
      report.innerHTML = `
        <div class="score"><div class="bar green"><i style="width:${Math.round((okReq / req.length) * 100)}%"></i></div><b>${t('checksPassed', okReq, req.length)}</b></div>
        ${list}`;
      return okReq === req.length;
    }

    function finish(results) {
      const out = completeLesson(lesson, {});
      const bonusIds = results.filter((r) => r.bonus && r.ok).map((r) => r.id);
      const bonusRes = awardBonus(lesson, bonusIds);
      $('#teacher').innerHTML = `
        <div class="feedback good">🎉 <b>${esc(pick(t('bravo')))}</b> ${out.gain ? `<span class="xp-pop">${t('xpGained', out.gain)}</span>` : `<span class="muted">${t('alreadyDone')}</span>`}
          ${bonusRes ? `<br><span class="xp-pop">✨ ${t('bonusXp', bonusRes.gain)}</span>` : ''}</div>
        <div class="teacher"><span class="face">👩‍🏫</span><div><b>${t('teacherSays')}</b><br>${L(lesson.explain)}</div></div>
        ${lesson.pro ? `<div class="teacher pro"><span class="face">✨</span><div><b>${t('proTip')}</b><br>${L(lesson.pro)}</div></div>` : ''}`;
      $('#nextRow').innerHTML = `<a class="btn soft" href="${esc(modelUrl)}" download>⬇ ${t('downloadModel')}</a>`
        + (next ? `<a class="btn green" href="#/l/${next.id}">${t('next')} →</a>` : `<a class="btn green" href="#/c/${c.id}">${t('nextChapter')} →</a>`);
      if (!out.repeat) celebrate(out);
      if (bonusRes) setTimeout(() => celebrate(bonusRes), out.repeat ? 0 : 2200);
      $('#teacher').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async function handleFile(file) {
      if (!file) return;
      report.innerHTML = `<p class="muted">⏳ ${t('reading')}</p>`;
      try {
        if (typeof JSZip === 'undefined') throw new Error('nolib');
        const wb = await XlsxReader.read(await file.arrayBuffer(), JSZip);
        const results = ProjectChecks.run(lesson, wb, state.lang);
        const allOk = renderReport(results);
        $('#teacher').innerHTML = ''; $('#nextRow').innerHTML = '';
        if (allOk) finish(results);
        else { const bonusIds = results.filter((r) => r.bonus && r.ok).map((r) => r.id); if (isDone(lesson.id) && bonusIds.length) awardBonus(lesson, bonusIds); }
      } catch (e) {
        report.innerHTML = `<div class="feedback bad">🤔 ${e.message === 'nolib' ? t('libError') : ProjectChecks.MSG[state.lang].notFile}</div>`;
      } finally { input.value = ''; }
    }
    input.addEventListener('change', () => handleFile(input.files[0]));
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));
    window.scrollTo(0, 0);
  }

  /* ---- quiz lesson ---- */
  function viewQuiz(lesson, c) {
    const { next } = lessonFrame(lesson, c);
    let wrongs = 0; const solvedQ = new Set();
    app().innerHTML = `
      <a class="back" href="#/c/${c.id}">${t('backChapter', esc(L(c.title)))}</a>
      <div class="lesson-grid single c-${c.color}"><div class="card">
        <span class="tag">${t('level')} ${lesson.level}</span><span class="tag">Quiz</span><span class="tag">${lesson.xp} XP</span>
        <h1 class="lesson-title">${esc(L(lesson.title))}</h1>
        <div class="prose">${L(lesson.intro)}</div>
        ${lesson.questions.map((q, qi) => `
          <div class="q" data-q="${qi}">
            <h3>${qi + 1}. ${L(q.q)}</h3>
            ${q.options.map((o, oi) => `<button class="opt" data-o="${oi}">${L(o)}</button>`).join('')}
            <div class="q-fb"></div>
          </div>`).join('')}
        <div class="muted" id="qProg">${t('quizProgress', 0, lesson.questions.length)}</div>
        <div id="feedback"></div><div class="actions" id="nextRow"></div>
      </div></div>`;

    $$('.opt').forEach((btn) => btn.addEventListener('click', () => {
      const qEl = btn.closest('.q'), qi = +qEl.dataset.q, oi = +btn.dataset.o, q = lesson.questions[qi];
      if (solvedQ.has(qi)) return;
      if (oi === q.answer) {
        btn.classList.add('right'); solvedQ.add(qi);
        $$('.opt', qEl).forEach((b) => (b.disabled = true));
        $('.q-fb', qEl).innerHTML = `<div class="teacher"><span class="face">👩‍🏫</span><div>${L(q.explain)}</div></div>`;
        $('#qProg').textContent = t('quizProgress', solvedQ.size, lesson.questions.length);
        if (solvedQ.size === lesson.questions.length) {
          const out = completeLesson(lesson, { wrongs });
          $('#feedback').innerHTML = `<div class="feedback good">🎉 <b>${t('quizDone')}</b> ${out.gain ? `<span class="xp-pop">${t('xpGained', out.gain)}</span>` : ''}</div>`;
          $('#nextRow').innerHTML = next
            ? `<a class="btn green" href="#/l/${next.id}">${t('next')} →</a><a class="btn soft" href="#/c/${c.id}">${t('nextChapter')}</a>`
            : `<a class="btn green" href="#/c/${c.id}">${t('nextChapter')} →</a>`;
          celebrate(out);
        }
      } else {
        wrongs++;
        btn.classList.add('wrong'); btn.disabled = true;
        $('.q-fb', qEl).innerHTML = `<div class="feedback bad">${t('quizWrong')}</div>`;
      }
    }));
    window.scrollTo(0, 0);
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
    const hash = route.replace(/^#\/?/, '');
    const [kind, id] = hash.split('/');
    document.title = t('appName');
    if (kind === 'c') viewChapter(id);
    else if (kind === 'l') viewLesson(id);
    else viewHome();
    if (kind !== 'l') window.scrollTo(0, 0);
    $('#footerText').textContent = t('footer');
  }

  window.addEventListener('hashchange', syncFromUrl);
  window.addEventListener('popstate', syncFromUrl);
  document.documentElement.lang = state.lang;
  renderTopbar();
  render();
})();
