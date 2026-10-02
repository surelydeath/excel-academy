/* Excel Académie — shell and router. Screens live in views.js, lessons.js, notebook-ui.js. */
(() => {
  const { state, t, L, esc, ic, $, $$, LETTERS } = App;

  /* ------------------------------------------------------------ router */
  // The route is kept in memory so navigation also works inside sandboxed frames
  // (where the URL hash may be read-only); the hash is mirrored when allowed.
  let route = location.hash || '#/';
  const parts = () => route.replace(/^#\/?/, '').split('/');

  App.mount = (html) => {
    const main = $('#app');
    main.innerHTML = html;
    main.classList.remove('enter'); void main.offsetWidth; main.classList.add('enter');
    window.scrollTo(0, 0);
  };
  App.go = (h) => {
    route = h;
    try { history.pushState(null, '', h); } catch (e) { /* sandboxed: ignore */ }
    render();
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#/"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    App.go(a.getAttribute('href'));
  });
  const syncFromUrl = () => { route = location.hash || '#/'; render(); };

  /* ------------------------------------------------------------ which nav item is active */
  function where() {
    const [kind, id] = parts();
    if (kind === 't') return { page: 'track', track: id };
    if (kind === 'c') { const c = App.chapterOf(id); return { page: 'chapter', track: c && c.track, chapter: id }; }
    if (kind === 'l') { const l = App.lessonOf(id); const c = l && App.chapterOf(l.chapterId); return { page: 'lesson', track: c && c.track, chapter: c && c.id, lesson: id }; }
    if (kind === 'notebook') return { page: 'notebook' };
    if (kind === 'progress') return { page: 'progress' };
    if (kind === 'welcome') return { page: 'welcome' };
    return { page: 'home' };
  }

  /* ------------------------------------------------------------ sidebar (desktop) / tab bar (narrow) */
  function renderSide() {
    const w = where(), g = App.gardenInfo();
    $('#side').innerHTML = `
      <a class="brand" href="#/">${Icons.mark(30)}<span>${esc(t('appName'))}</span></a>
      <nav class="nav" aria-label="${esc(t('navMain'))}">
        <a class="nav-item ${w.page === 'home' ? 'on' : ''}" href="#/">${ic('home', 19)}<span class="lab">${t('navDashboard')}</span></a>
        <div class="nav-group"><span class="nav-label">${t('navLearn')}</span>
          ${TRACKS.map((tr, i) => {
            const p = App.trackProgress(tr), open = w.track === tr.id;
            return `<a class="nav-item track c-${tr.color} ${open && w.page === 'track' ? 'on' : open ? 'in' : ''}" href="#/t/${tr.id}" aria-label="${esc(L(tr.title))}">
                <span class="letter">${LETTERS[i]}</span><span class="lab">${esc(L(tr.short))}</span><span class="nav-count">${p.done}/${p.total}</span></a>
              ${open ? `<div class="subnav c-${tr.color}">${App.chaptersOf(tr.id).map((c) => `<a class="sub ${w.chapter === c.id ? 'on' : ''}" href="#/c/${c.id}"><span>${esc(L(c.title))}</span>${c.lessons.length ? '' : `<em>${t('soonRow')}</em>`}</a>`).join('')}</div>` : ''}`;
          }).join('')}
        </div>
        <div class="nav-group"><span class="nav-label">${t('navTools')}</span>
          <a class="nav-item ${w.page === 'notebook' ? 'on' : ''}" href="#/notebook">${ic('book', 19)}<span class="lab">${t('nbTitle')}</span><kbd>/</kbd></a>
          <a class="nav-item ${w.page === 'progress' ? 'on' : ''}" href="#/progress">${ic('trophy', 19)}<span class="lab">${t('navProgress')}</span></a>
        </div>
      </nav>
      <div class="side-foot">
        <a class="mini-level" href="#/progress">${Icons.flower(g.idx, 38)}<span><b>${esc(L(g.cur.name))}</b><span class="thin"><i style="width:${g.pct}%"></i></span></span></a>
        <button class="lang" data-lang aria-label="Language">${state.lang === 'fr' ? '<b>FR</b> / EN' : 'FR / <b>EN</b>'}</button>
      </div>`;
    bindLang();
  }
  function bindLang() {
    $$('[data-lang]').forEach((b) => (b.onclick = () => {
      state.lang = state.lang === 'fr' ? 'en' : 'fr'; App.save(); document.documentElement.lang = state.lang;
      refreshChrome(); render();
    }));
  }

  /* ------------------------------------------------------------ top bar */
  function crumbsFor() {
    const w = where(), home = { text: t('navDashboard'), href: '#/' };
    const tr = w.track && App.trackById(w.track);
    switch (w.page) {
      case 'track': return tr ? [home, { text: L(tr.short) }] : [home];
      case 'chapter': return tr ? [home, { text: L(tr.short), href: '#/t/' + tr.id }, { text: L(App.chapterOf(w.chapter).title) }] : [home];
      case 'lesson': return tr ? [home, { text: L(tr.short), href: '#/t/' + tr.id }, { text: L(App.chapterOf(w.chapter).title), href: '#/c/' + w.chapter }, { text: L(App.lessonOf(w.lesson).title) }] : [home];
      case 'notebook': return [home, { text: t('nbTitle') }];
      case 'progress': return [home, { text: t('navProgress') }];
      case 'welcome': return [{ text: t('welBreadcrumb') }];
      default: return [{ text: t('navDashboard') }];
    }
  }
  function renderTop() {
    const items = crumbsFor();
    $('#topbar').innerHTML = `
      <nav class="crumbs" aria-label="breadcrumb">${items.map((p, i) => (i ? '<span class="sl">/</span>' : '') + (p.href ? `<a href="${p.href}">${esc(p.text)}</a>` : `<span class="here">${esc(p.text)}</span>`)).join('')}</nav>
      <div class="top-actions">
        <button class="search-btn" id="searchBtn" aria-label="${esc(t('nbSearchBtn'))}">${ic('search', 17)}<span>${t('nbSearchBtn')}</span><kbd>/</kbd></button>
        <span class="stat" title="XP">${ic('star', 16)}<b>${state.xp}</b></span>
        <span class="stat" title="${esc(t('streakWord'))}">${ic('flame', 16)}<b>${state.streak.count}</b></span>
        <button class="lang lang-top" data-lang aria-label="Language">${state.lang === 'fr' ? '<b>FR</b> / EN' : 'FR / <b>EN</b>'}</button>
      </div>`;
    $('#searchBtn').onclick = () => App.openHelp({});
    bindLang();
  }
  function refreshChrome() { renderSide(); renderTop(); }
  App.refreshChrome = refreshChrome;

  /* ------------------------------------------------------------ render */
  function render() {
    // first visit: ask where she starts
    if (!state.onboarded && parts()[0] !== 'welcome') { route = '#/welcome'; try { history.replaceState(null, '', route); } catch (e) { /* ignore */ } }
    const k = parts()[0], i = parts()[1];
    document.title = t('appName');
    App.closeHelp();
    document.body.classList.toggle('is-welcome', k === 'welcome');
    document.body.classList.toggle('is-lesson', k === 'l');
    if (k === 'welcome') App.viewWelcome();
    else if (k === 'c') App.viewChapter(i);
    else if (k === 'l') App.viewLesson(i);
    else if (k === 't') App.viewTrack(i);
    else if (k === 'notebook') App.viewNotebook(i);
    else if (k === 'progress') App.viewProgress();
    else App.viewDashboard();
    refreshChrome();
  }

  window.addEventListener('hashchange', syncFromUrl);
  window.addEventListener('popstate', syncFromUrl);
  document.documentElement.lang = state.lang;
  render();
})();
