/* Main screens: dashboard, track, chapter, progress, welcome. */
(() => {
  const { state, t, L, esc, ic, $, $$, LETTERS } = App;

  /* ---------------------------------------------------------- shared pieces */
  const cellsHTML = (c) => {
    if (!c.lessons.length) return `<div class="cells">${Array.from({ length: Math.min(c.roadmap.length, 8) }, () => '<i class="cell dashed"></i>').join('')}</div>`;
    return `<div class="cells">${c.lessons.map((l) => `<i class="cell ${App.isDone(l.id) ? 'on' : state.known[l.id] ? 'known' : ''}"></i>`).join('')}</div>`;
  };
  const metaLine = (l) => { const c = App.chapterOf(l.chapterId); return `${L(App.trackOf(c).short)} › ${L(c.title)}`; };

  // The soft warning: lists the recommended lessons that are not done yet.
  const dismissed = new Set(); // "continue anyway" choices, kept for this visit only
  function mountPrereq(slot, intro, ids, key) {
    const miss = App.missingReqs(ids);
    if (!miss.length) { slot.innerHTML = ''; return; }
    if (dismissed.has(key)) {
      slot.innerHTML = `<div class="prereq min">${ic('info', 18)}<span>${esc(t('prereqCollapsed', miss.length))}</span><button class="btn text sm" data-act="show">${t('prereqShow')}</button></div>`;
    } else {
      slot.innerHTML = `<section class="prereq">
        <div class="prereq-top"><h2>${ic('info', 18)}${t('prereqTitle')}</h2><span class="prereq-intro">${esc(intro)}</span><button class="btn text sm" data-act="skip">${t('prereqSkip')}</button></div>
        <div class="preq-list">${miss.map((id) => { const l = App.lessonOf(id); return `<div class="preq-row"><div class="t"><b>${esc(L(l.title))}</b><small>${esc(L(App.chapterOf(l.chapterId).title))}</small></div>
          <div class="preq-actions"><a class="btn soft sm" href="#/l/${id}">${t('prereqDo')}</a><button class="btn text sm" data-known="${id}">${t('prereqKnown')}</button></div></div>`; }).join('')}</div>
      </section>`;
    }
    $$('[data-known]', slot).forEach((b) => b.addEventListener('click', () => { state.known[b.dataset.known] = true; App.save(); mountPrereq(slot, intro, ids, key); }));
    const skip = $('[data-act="skip"]', slot), show = $('[data-act="show"]', slot);
    if (skip) skip.addEventListener('click', () => { dismissed.add(key); mountPrereq(slot, intro, ids, key); });
    if (show) show.addEventListener('click', () => { dismissed.delete(key); mountPrereq(slot, intro, ids, key); });
  }

  /* ---------------------------------------------------------- dashboard */
  function viewDashboard() {
    const g = App.gardenInfo(), nl = App.nextLesson();
    const started = Object.keys(state.done).length > 0;
    const next = App.upcoming(5).filter((l) => !nl || l.id !== nl.id).slice(0, 3);
    const review = App.needsReview().slice(0, 4);
    const recent = App.recentlyDone(3);
    const totals = App.ALL.length, doneN = Object.keys(state.done).length;

    let hero;
    if (nl) {
      const c = App.chapterOf(nl.chapterId), idx = c.lessons.findIndex((l) => l.id === nl.id);
      hero = `
        <section class="card hero-card ${App.themeOf(c)}">
          <div class="hero-text">
            <span class="chip">${started ? t('dashResume') : t('dashStart')}</span>
            <h1 class="dash-title">${esc(L(nl.title))}</h1>
            <p class="muted">${esc(metaLine(nl))} · ${esc(App.typeLabel(nl))} · ${nl.xp} ${t('xpWord')}</p>
            <div class="actions"><a class="btn primary" href="#/l/${nl.id}">${t(started ? 'continue' : 'start')}</a><a class="btn soft" href="#/c/${c.id}">${t('dashSeeChapter')}</a></div>
          </div>
          <div class="hero-side">
            <div class="seg">${c.lessons.map((l, i) => `<a class="${App.isDone(l.id) ? 'on' : ''} ${i === idx ? 'cur' : ''}" href="#/l/${l.id}" aria-label="${esc(L(l.title))}"></a>`).join('')}</div>
            <span class="muted small">${esc(t('lessonOf', idx + 1, c.lessons.length))}</span>
          </div>
        </section>`;
    } else {
      hero = `<section class="card hero-card c-green"><div class="hero-text"><h1 class="dash-title">${t('dashDone')}</h1><p class="muted">${t('dashDoneHint')}</p>
        <div class="actions"><a class="btn primary" href="#/notebook">${t('nbTitle')}</a></div></div></section>`;
    }

    const nextRows = next.length ? next.map((l) => {
      const miss = App.missingReqs(App.reqOf(l)).length;
      return `<a class="mini-row" href="#/l/${l.id}"><span class="mini-ic ${App.themeOf(App.chapterOf(l.chapterId))}">${ic(l.type === 'quiz' ? 'target' : l.type === 'build' ? 'file' : 'grid', 17)}</span>
        <span class="mini-t"><b>${esc(L(l.title))}</b><small>${esc(metaLine(l))}</small></span>${miss ? `<span class="warn-dot" title="${esc(t('rowDoFirst', miss))}">${ic('info', 15)}</span>` : ''}</a>`;
    }).join('') : `<p class="muted">${t('dashNoNext')}</p>`;

    const pathRows = TRACKS.map((tr, i) => {
      const p = App.trackProgress(tr), pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
      return `<a class="path-row c-${tr.color}" href="#/t/${tr.id}"><span class="letter">${LETTERS[i]}</span>
        <span class="path-main"><b>${esc(L(tr.short))}</b><span class="thin"><i style="width:${pct}%"></i></span></span><span class="path-n"><b>${p.done}</b> / ${p.total}</span></a>`;
    }).join('');

    const reviewRows = review.length ? review.map((l) => `<a class="mini-row" href="#/l/${l.id}"><span class="mini-ic c-peach">${ic('clock', 17)}</span><span class="mini-t"><b>${esc(L(l.title))}</b><small>${esc(metaLine(l))}</small></span></a>`).join('')
      : `<p class="muted">${recent.length ? t('dashReviewEmpty') : t('dashReviewNone')}</p>`;

    const badges = BADGES.map((b, i) => `<span class="badge-dot ${state.badges[b.id] ? '' : 'locked'} ${['c-blue', 'c-pink', 'c-green', 'c-lilac', 'c-peach', 'c-yellow'][i % 6]}" title="${esc(L(b.title))}: ${esc(L(b.desc))}">${ic(b.icon, 20)}</span>`).join('');

    App.mount(`
      <div class="dash">
        ${hero}
        <section class="card level-card c-green">
          ${Icons.flower(g.idx, 60)}
          <div class="level-main"><b>${esc(L(g.cur.name))}</b>
            <div class="thin"><i style="width:${g.pct}%"></i></div>
            <span class="muted small">${g.nxt ? esc(t('levelNext', g.nxt.xp - state.xp, L(g.nxt.name))) : esc(t('maxLevel'))}</span></div>
          <div class="level-stats"><span>${ic('star', 17)}<b>${state.xp}</b> ${t('xpWord')}</span><span>${ic('flame', 17)}<b>${state.streak.count}</b> ${t('streakWord')}</span><span>${ic('check', 17)}<b>${doneN}</b> / ${totals}</span></div>
        </section>
        <section class="card next-card"><h2>${t('dashNext')}</h2><div class="mini-list">${nextRows}</div></section>
        <section class="card path-card"><h2>${t('dashPath')}</h2><div class="path-list">${pathRows}</div></section>
        <section class="card review-card"><h2>${t('dashReview')}</h2><div class="mini-list">${reviewRows}</div></section>
        <section class="card badges-card"><div class="card-head"><h2>${t('badgesTitle')}</h2><a class="btn text sm" href="#/progress">${t('dashAllBadges')}</a></div><div class="badge-strip">${badges}</div></section>
      </div>`);
  }

  /* ---------------------------------------------------------- track page */
  function chapterCard(c) {
    const live = c.lessons.length > 0, p = App.chapterProgress(c);
    const miss = live ? App.missingReqs(c.requires || []).length : 0;
    return `<a class="ccard ${App.themeOf(c)}" href="#/c/${c.id}">
      <div class="ccard-top"><h3>${esc(L(c.title))}</h3>${live ? `<span class="count"><b>${p.done}</b> / ${p.total}</span>` : `<span class="soon-tag">${t('soonRow')}</span>`}</div>
      <p>${esc(L(c.tagline))}</p>
      ${cellsHTML(c)}
      ${miss ? `<div class="warn-line">${ic('info', 15)}<span>${esc(t('rowDoFirst', miss))}</span></div>` : ''}
    </a>`;
  }
  function viewTrack(id) {
    const tr = App.trackById(id);
    if (!tr) return App.go('#/');
    const p = App.trackProgress(tr), i = TRACKS.indexOf(tr);
    App.mount(`
      <div class="page ${'c-' + tr.color}">
        <header class="page-head">
          <span class="letter big">${LETTERS[i]}</span>
          <div class="grow"><h1 class="page-title">${esc(L(tr.title))}</h1><p class="muted">${esc(L(tr.tagline))}</p></div>
          ${p.total ? `<div class="head-stat"><b>${p.done}</b> / ${p.total}<span class="muted small">${esc(t('lessonsDone', p.done, p.total))}</span></div>` : ''}
        </header>
        <div class="ccards">${App.chaptersOf(tr.id).map(chapterCard).join('')}</div>
      </div>`);
  }

  /* ---------------------------------------------------------- chapter page */
  function viewChapter(id) {
    const c = App.chapterOf(id);
    if (!c) return App.go('#/');
    const p = App.chapterProgress(c);
    const nl = c.lessons.find((l) => !App.isDone(l.id));
    let body = '';
    if (c.lessons.length) {
      const levels = [...new Set(c.lessons.map((l) => l.level))].sort();
      body += `<div class="level-cols">${levels.map((lv) => `
        <section class="level">
          <h2>${esc(L((c.levelNames || {})[lv] || LEVELS[lv]))}<small>${t('levelWord')} ${lv}</small></h2>
          <div class="rows">${c.lessons.filter((l) => l.level === lv).map((l) => {
            const i = c.lessons.indexOf(l) + 1, done = App.isDone(l.id);
            return `<a class="row lesson ${done ? 'done' : ''} ${nl && nl.id === l.id ? 'next' : ''}" href="#/l/${l.id}">
              <span class="num">${done ? ic('check', 16) : i}</span>
              <div class="row-title">${esc(L(l.title))}</div>
              <div class="row-sub">${esc(App.typeLabel(l))} · ${l.xp} ${t('xpWord')}${state.known[l.id] && !done ? ' · ' + esc(t('statusKnown')) : ''}</div>
            </a>`;
          }).join('')}</div>
        </section>`).join('')}</div>`;
    } else {
      body += `<p class="muted">${esc(t('noLessonsYet'))}</p>`;
    }
    if (c.roadmap && c.roadmap.length) {
      body += `<section class="level roadmap-block"><h2>${esc(c.lessons.length ? t('comingUp') : t('roadmapTitle'))}</h2>
        <div class="roadmap">${c.roadmap.map((r) => `<div class="road">${esc(L(r))}</div>`).join('')}</div></section>`;
    }
    App.mount(`
      <div class="page ${App.themeOf(c)}">
        <header class="page-head">
          <div class="grow"><h1 class="page-title">${esc(L(c.title))}</h1><p class="muted">${esc(L(c.tagline))}</p></div>
          ${c.lessons.length ? `<div class="head-stat"><b>${p.done}</b> / ${p.total}${cellsHTML(c)}</div>
            ${nl ? `<a class="btn primary" href="#/l/${nl.id}">${t(p.done ? 'continue' : 'start')}</a>` : ''}` : `<span class="soon-tag">${t('soonRow')}</span>`}
        </header>
        <div id="prereq-slot"></div>
        ${body}
      </div>`);
    if (c.requires) mountPrereq($('#prereq-slot'), t('chapterPrereqIntro'), c.requires, 'c:' + c.id);
  }

  /* ---------------------------------------------------------- progress page */
  function viewProgress() {
    const g = App.gardenInfo();
    const hist = Object.entries(state.done).sort((a, b) => (b[1].date || '').localeCompare(a[1].date || '')).map(([id, d]) => ({ l: App.lessonOf(id), d })).filter((x) => x.l);
    const badges = BADGES.map((b, i) => `<div class="badge ${state.badges[b.id] ? '' : 'locked'} ${['c-blue', 'c-pink', 'c-green', 'c-lilac', 'c-peach', 'c-yellow'][i % 6]}">
      <span class="disc">${ic(b.icon, 22)}</span><div><b>${esc(L(b.title))}</b><small>${esc(L(b.desc))}</small></div></div>`).join('');
    App.mount(`
      <div class="page">
        <header class="page-head"><div class="grow"><h1 class="page-title">${t('progTitle')}</h1></div></header>
        <div class="prog-grid">
          <section class="card level-card c-green">${Icons.flower(g.idx, 72)}
            <div class="level-main"><b>${esc(L(g.cur.name))}</b><div class="thin"><i style="width:${g.pct}%"></i></div>
              <span class="muted small">${g.nxt ? esc(t('levelNext', g.nxt.xp - state.xp, L(g.nxt.name))) : esc(t('maxLevel'))}</span></div>
            <div class="level-stats"><span>${ic('star', 17)}<b>${state.xp}</b> ${t('xpWord')}</span><span>${ic('flame', 17)}<b>${state.streak.count}</b> ${t('streakWord')}</span><span>${ic('check', 17)}<b>${hist.length}</b> / ${App.ALL.length}</span></div></section>
          <section class="card"><h2>${t('badgesTitle')}</h2><div class="badge-row">${badges}</div></section>
          <section class="card"><h2>${t('progHistory')}</h2>
            ${hist.length ? `<div class="mini-list">${hist.slice(0, 4).map(({ l, d }) => `<a class="mini-row" href="#/l/${l.id}"><span class="mini-ic ${App.themeOf(App.chapterOf(l.chapterId))}">${ic('check', 17)}</span><span class="mini-t"><b>${esc(L(l.title))}</b><small>${esc(d.date || '')} · +${d.xp} ${t('xpWord')}</small></span></a>`).join('')}</div>` : `<p class="muted">${t('progNone')}</p>`}</section>
          <section class="card"><h2>${t('progSettings')}</h2>
            <div class="setting"><div><b>${t('progStart')}</b><p class="muted small">${t('progStartHint')}</p></div><a class="btn soft sm" href="#/welcome">${t('progChange')}</a></div>
            <div class="setting"><div><b>${t('reset')}</b><p class="muted small">${t('progResetHint')}</p></div><button class="btn soft sm" id="resetBtn">${t('reset')}</button></div></section>
        </div>
      </div>`);
    // two-tap confirmation (browser confirm() dialogs are blocked in some viewers)
    let armed = false;
    $('#resetBtn').onclick = () => {
      if (!armed) {
        armed = true; $('#resetBtn').textContent = t('resetConfirm');
        setTimeout(() => { armed = false; const b = $('#resetBtn'); if (b) b.textContent = t('reset'); }, 5000);
        return;
      }
      App.resetState(); App.refreshChrome(); App.go('#/welcome');
    };
  }

  /* ---------------------------------------------------------- welcome: where do you start? */
  const START_KNOWN = {
    some: ['f1', 'f2', 'f3', 'f4', 't1'],
    pro: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 't1', 'k1'],
  };
  function viewWelcome() {
    const opts = [
      ['new', 'welNew', 'welNewDesc', 'star'], ['some', 'welSome', 'welSomeDesc', 'layers'], ['pro', 'welPro', 'welProDesc', 'trophy'],
    ];
    App.mount(`
      <div class="welcome">
        <h1 class="page-title">${t('welTitle')}</h1>
        <p class="lede-sm">${t('welIntro')}</p>
        <div class="choices">${opts.map(([k, a, b, icon], i) => `<button class="choice c-${['pink', 'blue', 'green'][i]}" data-k="${k}"><span class="ic-wrap">${ic(icon, 24)}</span><b>${t(a)}</b><span>${t(b)}</span></button>`).join('')}</div>
        <p class="muted small">${t('welNote')}</p>
      </div>`);
    $$('.choice').forEach((b) => b.addEventListener('click', () => {
      (START_KNOWN[b.dataset.k] || []).forEach((id) => { if (!App.isDone(id)) state.known[id] = true; });
      state.onboarded = true; App.save(); App.go('#/');
    }));
  }

  Object.assign(App, { viewDashboard, viewTrack, viewChapter, viewProgress, viewWelcome, mountPrereq, cellsHTML });
})();
