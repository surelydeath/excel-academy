/* Notebook screens: the full page (#/notebook) and the slide-in help drawer.
   The drawer is what the "Besoin d'aide ?" buttons open.                    */
(() => {
  const { state, t, L, esc, ic, $, $$ } = App;
  const catOrder = NOTEBOOK_CATS.map((c) => c.id);
  const catTitle = (id) => L(NOTEBOOK_CATS.find((c) => c.id === id).title);
  const entryById = (id) => NOTEBOOK.find((e) => e.id === id);
  const search = (q) => Search.run(q, state.lang, NOTEBOOK, catOrder);

  /* ---------------------------------------------------------- one entry (shared by page and drawer) */
  // "What you need" + steps shown one at a time + common mistakes
  const needsHTML = (e) => (e.needs && e.needs.length ? `<div class="nb-needs"><b>${ic('check', 16)}${t('nbNeeds')}</b><ul>${e.needs.map((x) => `<li>${L(x)}</li>`).join('')}</ul></div>` : '');
  const stepsHTML = (e) => (e.steps && e.steps.length ? `
    <section class="stepper" data-i="0" data-n="${e.steps.length}">
      <div class="st-head"><h3>${t('nbSteps')}</h3><button class="btn text sm st-all" type="button">${t('nbShowAll')}</button></div>
      <ol class="st-list">${e.steps.map((s, k) => `<li class="st-step ${k === 0 ? 'cur' : ''}"><span class="st-n">${k + 1}</span><div class="st-body"><b>${esc(L(s.t))}</b><div class="prose">${L(s.p)}</div></div></li>`).join('')}</ol>
      <div class="st-nav"><button class="btn text sm st-prev" type="button" disabled>${ic('back', 15)}${t('slidePrev')}</button>
        <span class="dots">${e.steps.map((_, k) => `<i class="dd ${k === 0 ? 'cur' : ''}"></i>`).join('')}</span>
        <button class="btn primary sm st-next" type="button">${t('slideNext')}${ic('next', 15)}</button></div>
    </section>` : '');
  const trapsHTML = (e) => (e.traps && e.traps.length ? `<div class="note"><span class="ic-wrap">${ic('alert', 18)}</span><div><b>${t('nbTraps')}</b><ul class="traps">${e.traps.map((x) => `<li>${L(x)}</li>`).join('')}</ul></div></div>` : '');
  function stepTo(sec, i) {
    const n = +sec.dataset.n; i = Math.max(0, Math.min(n - 1, i)); sec.dataset.i = i;
    $$('.st-step', sec).forEach((li, k) => li.classList.toggle('cur', k === i));
    $$('.dd', sec).forEach((d, k) => { d.className = 'dd ' + (k === i ? 'cur' : k < i ? 'on' : ''); });
    $('.st-prev', sec).disabled = i === 0; $('.st-next', sec).disabled = i === n - 1;
  }
  document.addEventListener('click', (ev) => {
    const sec = ev.target.closest && ev.target.closest('.stepper'); if (!sec) return;
    const i = +sec.dataset.i;
    if (ev.target.closest('.st-next')) { App.sound.play('next'); stepTo(sec, i + 1); }
    else if (ev.target.closest('.st-prev')) { App.sound.play('back'); stepTo(sec, i - 1); }
    else if (ev.target.closest('.st-all')) {
      const all = sec.classList.toggle('all');
      ev.target.closest('.st-all').textContent = all ? t('nbOneByOne') : t('nbShowAll');
    }
  });
  function entryDetail(e) {
    const lessons = (e.lessons || []).map((id) => App.lessonOf(id)).filter(Boolean);
    return `
      ${e.syntax ? `<div class="syntax"><span>${t('nbSyntax')}</span><code>${esc(L(e.syntax))}</code></div>` : ''}
      <div class="prose">${L(e.body)}</div>
      ${needsHTML(e)}${stepsHTML(e)}
      ${e.example ? `<p class="example"><b>${t('nbExample')}</b> ${L(e.example)}</p>` : ''}
      ${e.tip ? `<div class="note tip"><span class="ic-wrap">${ic('bulb', 18)}</span><div>${L(e.tip)}</div></div>` : ''}
      ${trapsHTML(e)}
      ${lessons.length ? `<div class="related"><span>${t('nbRelated')}</span>${lessons.map((l) => `<a class="chip" href="#/l/${l.id}" data-close-drawer>${esc(L(l.title))}</a>`).join('')}</div>` : ''}`;
  }
  function entryAccordion(e, open) {
    return `<article class="entry ${open ? 'open' : ''}" data-id="${e.id}">
      <button class="entry-head" aria-expanded="${open ? 'true' : 'false'}">
        <span class="entry-main"><b>${esc(L(e.title))}</b><span class="entry-sum">${esc(L(e.sum))}</span></span>
        <span class="entry-cat">${esc(catTitle(e.cat))}</span>
        ${ic('back', 16)}
      </button>
      <div class="entry-body">${open ? entryDetail(e) : ''}</div>
    </article>`;
  }
  function bindAccordions(root) {
    $$('.entry-head', root).forEach((btn) => btn.addEventListener('click', () => {
      const art = btn.closest('.entry'), e = entryById(art.dataset.id), open = !art.classList.contains('open');
      art.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      $('.entry-body', art).innerHTML = open ? entryDetail(e) : '';
    }));
  }

  /* ---------------------------------------------------------- the drawer */
  let drawerCtx = { ids: [], title: '' };
  function drawerEl() {
    let d = $('#drawer');
    if (!d) { d = document.createElement('div'); d.id = 'drawer'; d.className = 'drawer'; document.body.appendChild(d); }
    return d;
  }
  function drawerResults(q) {
    const body = $('#drawerBody');
    if (q.trim()) {
      const res = search(q).slice(0, 25);
      body.innerHTML = res.length
        ? `<p class="muted small">${t('nbResults', res.length)}</p>${res.map((e, i) => entryAccordion(e, i === 0 && res.length <= 3)).join('')}`
        : `<div class="empty">${ic('book', 28)}<p><b>${t('nbNone')}</b></p><p class="muted">${t('nbNoneHint')}</p></div>`;
    } else {
      const ctx = drawerCtx.ids.map(entryById).filter(Boolean);
      const rest = NOTEBOOK.filter((e) => !drawerCtx.ids.includes(e.id));
      body.innerHTML = (ctx.length ? `<h3 class="drawer-h">${esc(drawerCtx.title || t('nbForThis'))}</h3>${ctx.map((e, i) => entryAccordion(e, i === 0)).join('')}` : '')
        + `<h3 class="drawer-h">${t('nbBrowse')}</h3>
           <div class="cat-chips">${NOTEBOOK_CATS.map((c) => `<button class="chip" data-cat="${c.id}">${esc(L(c.title))}</button>`).join('')}</div>
           <div id="catList"></div>`;
      $$('[data-cat]', body).forEach((b) => b.addEventListener('click', () => {
        $('#catList').innerHTML = rest.filter((e) => e.cat === b.dataset.cat).map((e) => entryAccordion(e, false)).join('');
        bindAccordions($('#catList'));
      }));
    }
    bindAccordions(body);
    $$('[data-close-drawer]', body).forEach((a) => a.addEventListener('click', closeHelp));
  }
  function openHelp(opts = {}) {
    drawerCtx = { ids: opts.ids || [], title: opts.title || '' };
    const d = drawerEl();
    d.innerHTML = `
      <div class="scrim" id="scrim"></div>
      <aside class="drawer-panel" role="dialog" aria-modal="true" aria-label="${esc(t('nbTitle'))}">
        <header><h2>${ic('book', 22)}${t('nbTitle')}</h2><button class="btn text sm" id="drawerClose" aria-label="${esc(t('close'))}">${ic('close', 18)}</button></header>
        <label class="search">${ic('search', 18)}<input id="drawerQuery" type="search" placeholder="${esc(t('nbPlaceholder'))}" autocomplete="off" spellcheck="false"></label>
        <div class="drawer-body" id="drawerBody"></div>
        <footer><a href="#/notebook" id="drawerFull">${t('nbOpenFull')}</a></footer>
      </aside>`;
    d.classList.add('open');
    $('#scrim').onclick = closeHelp; $('#drawerClose').onclick = closeHelp;
    $('#drawerFull').addEventListener('click', closeHelp);
    const input = $('#drawerQuery');
    input.value = opts.query || '';
    input.addEventListener('input', () => drawerResults(input.value));
    drawerResults(input.value);
    setTimeout(() => input.focus({ preventScroll: true }), 60);
  }
  function closeHelp() { const d = $('#drawer'); if (d) { d.classList.remove('open'); setTimeout(() => { if (!d.classList.contains('open')) d.innerHTML = ''; }, 250); } }
  const helpOpen = () => { const d = $('#drawer'); return !!(d && d.classList.contains('open')); };

  /* ---------------------------------------------------------- the full page */
  function viewNotebook(selId) {
    let q = '', cat = 'all', sel = selId && entryById(selId) ? selId : null;
    App.mount(`
      <div class="nb-page">
        <header class="nb-head">
          <div><h1 class="page-title">${t('nbTitle')}</h1><p class="muted">${t('nbIntro')}</p></div>
          <label class="search big">${ic('search', 20)}<input id="nbQuery" type="search" placeholder="${esc(t('nbPlaceholder'))}" autocomplete="off" spellcheck="false"></label>
        </header>
        <div class="cat-chips" id="nbCats"><button class="chip active" data-cat="all">${t('nbAll')}</button>${NOTEBOOK_CATS.map((c) => `<button class="chip" data-cat="${c.id}">${esc(L(c.title))}</button>`).join('')}</div>
        <div class="nb-panes ${sel ? 'has-sel' : ''}" id="nbPanes">
          <nav class="nb-list" id="nbList" aria-label="${esc(t('nbTitle'))}"></nav>
          <section class="nb-detail" id="nbDetail"></section>
        </div>
      </div>`);

    const list = $('#nbList'), detail = $('#nbDetail');
    function renderList() {
      let res = search(q);
      if (cat !== 'all') res = res.filter((e) => e.cat === cat);
      list.innerHTML = res.length
        ? res.map((e) => `<button class="nb-item ${e.id === sel ? 'active' : ''}" data-id="${e.id}"><b>${esc(L(e.title))}</b><span>${esc(L(e.sum))}</span></button>`).join('')
        : `<div class="empty">${ic('book', 28)}<p><b>${t('nbNone')}</b></p><p class="muted">${t('nbNoneHint')}</p></div>`;
      $$('.nb-item', list).forEach((b) => b.addEventListener('click', () => { sel = b.dataset.id; $('#nbPanes').classList.add('has-sel'); renderList(); renderDetail(); }));
    }
    function renderDetail() {
      const e = sel && entryById(sel);
      detail.innerHTML = e
        ? `<button class="back nb-back" id="nbBack">${ic('back', 16)}${t('back')}</button>
           <span class="chip">${esc(catTitle(e.cat))}</span>
           <h2 class="nb-title">${esc(L(e.title))}</h2><p class="lede-sm">${esc(L(e.sum))}</p>${entryDetail(e)}`
        : `<div class="empty">${ic('book', 36)}<p><b>${t('nbPick')}</b></p><p class="muted">${t('nbPickHint')}</p></div>`;
      const back = $('#nbBack'); if (back) back.onclick = () => { sel = null; $('#nbPanes').classList.remove('has-sel'); renderList(); renderDetail(); };
    }
    $('#nbQuery').addEventListener('input', (ev) => { q = ev.target.value; renderList(); });
    $$('#nbCats .chip').forEach((b) => b.addEventListener('click', () => { cat = b.dataset.cat; $$('#nbCats .chip').forEach((x) => x.classList.toggle('active', x === b)); renderList(); }));
    renderList(); renderDetail();
    if (!sel) setTimeout(() => $('#nbQuery') && $('#nbQuery').focus({ preventScroll: true }), 80);
  }

  /* ---------------------------------------------------------- keyboard: "/" opens the notebook search, Esc closes */
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (e.key === 'Escape' && helpOpen()) { closeHelp(); return; }
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !['input', 'textarea', 'select'].includes(tag) && !e.target.isContentEditable) {
      e.preventDefault();
      const page = $('#nbQuery');
      if (page) page.focus(); else openHelp({});
    }
  });

  // Help ids for a lesson (or one of its quiz questions)
  const helpFor = (lessonId, qIndex) => (qIndex !== undefined && NOTES_FOR_Q[lessonId + ':' + qIndex]) || NOTES_FOR[lessonId] || [];
  Object.assign(App, { openHelp, closeHelp, helpOpen, viewNotebook, helpFor, entryById });
})();
