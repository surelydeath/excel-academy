/* Lessons as short, step-by-step screens (no long scrolling pages).
   practice : understand -> practise -> remember
   quiz     : one question per screen
   build    : brief -> download -> open -> steps -> check                       */
(() => {
  const { state, t, L, esc, ic, $, $$, pick } = App;

  /* ---------------------------------------------------------- shared frame */
  const bannerHTML = (kind, inner) => `<div class="banner ${kind}"><span class="ic-wrap">${ic(kind === 'good' ? 'check' : 'alert', 17)}</span><div>${inner}</div></div>`;
  const proText = (x) => L(x).replace(/^s*(Astuce de pro|Pro tip|À savoir|Good to know|Attention|Careful|Limite|Limit)s*:s*/i, '');
  const noteHTML = (kind, title, bodyHTML) => `<div class="note ${kind === 'tip' ? 'tip' : ''}"><span class="ic-wrap">${ic(kind === 'tip' ? 'star' : 'book', 19)}</span><div><b>${esc(title)}</b>${bodyHTML}</div></div>`;
  const nextOf = (lesson, c) => { const i = c.lessons.findIndex((l) => l.id === lesson.id); return c.lessons[i + 1] || null; };
  const nextButtons = (next, c) => (next
    ? `<a class="btn primary" href="#/l/${next.id}">${t('next')}</a><a class="btn soft" href="#/c/${c.id}">${t('nextChapter')}</a>`
    : `<a class="btn primary" href="#/c/${c.id}">${t('nextChapter')}</a>`);

  // pills at the top: which stage she is in. `labels` are strings, `cur` is the active index.
  const stagesHTML = (labels, cur) => `<ol class="stages">${labels.map((s, i) => `<li class="${i < cur ? 'done' : i === cur ? 'cur' : ''}"><span class="dot">${i < cur ? ic('check', 12) : i + 1}</span>${esc(s)}</li>`).join('')}</ol>`;

  function frame(lesson, c, { labels, cur, helpIds, helpTitle }) {
    const hid = helpIds || App.helpFor(lesson.id);
    return `
      <div class="lesson ${App.themeOf(c)}">
        <header class="lhead">
          <div class="lhead-main">
            <a class="back" href="#/c/${c.id}">${App.ic('back', 16)}${esc(L(c.title))}</a>
            <h1 class="ltitle">${esc(L(lesson.title))}</h1>
          </div>
          <div id="stagesBox">${stagesHTML(labels, cur)}</div>
          <button class="btn soft sm" id="helpBtn">${ic('help', 18)}${t('needHelp')}</button>
        </header>
        <div id="prereq-slot"></div>
        <div class="lbody" id="lbody"></div>
      </div>`;
  }
  function bindFrame(lesson, helpIds, helpTitle) {
    $('#helpBtn').onclick = () => App.openHelp({ ids: helpIds || App.helpFor(lesson.id), title: helpTitle || t('nbForThis') });
  }
  function setBody(html) {
    const b = $('#lbody'); b.innerHTML = html;
    b.classList.remove('swap'); void b.offsetWidth; b.classList.add('swap');
  }
  const setStages = (labels, cur) => { $('#stagesBox').innerHTML = stagesHTML(labels, cur); };

  /* ---------------------------------------------------------- the mini spreadsheet */
  // mode: 'input' (she types), 'preview' (target shown as "?"), 'solved' (target shows the result)
  function sheetHTML(lesson, mode, solvedText) {
    const grid = App.resolveGrid(lesson.grid);
    const cols = Math.max(...grid.map((r) => r.length));
    let h = `<table class="sheet"><thead><tr><th class="rh"></th>${Array.from({ length: cols }, (_, i) => `<th class="col">${Engine.colLetter(i)}</th>`).join('')}</tr></thead><tbody>`;
    grid.forEach((row, r) => {
      h += `<tr><th class="rh">${r + 1}</th>`;
      for (let col = 0; col < cols; col++) {
        const addr = Engine.colLetter(col) + (r + 1);
        const v = row[col];
        if (addr === lesson.target) {
          if (mode === 'input') h += `<td class="target"><input id="answer" type="text" inputmode="text" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" aria-label="${esc(t('typeHere'))}" placeholder="=" /></td>`;
          else h += `<td class="target ${mode}">${esc(mode === 'preview' ? '?' : solvedText)}</td>`;
        } else if (v === null || v === undefined || v === '') {
          h += '<td></td>';
        } else if (r === 0 && typeof v === 'string') {
          h += `<td class="head">${esc(v)}</td>`;
        } else if (typeof v === 'number') {
          h += `<td class="num">${esc(App.fmtValue(v, App.fmtKind(lesson, addr)))}</td>`;
        } else {
          h += `<td>${esc(v)}</td>`;
        }
      }
      h += '</tr>';
    });
    return h + '</tbody></table>';
  }

  function runBase(lesson, formula) {
    return Engine.run({ grid: App.resolveGrid(lesson.grid), target: lesson.target, formula, set: App.resolveSet(lesson.tests[0].set), lang: state.lang });
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
    const grid = App.resolveGrid(lesson.grid);
    for (let i = 0; i < lesson.tests.length; i++) {
      const test = lesson.tests[i];
      const expected = App.resolveCell(test.expect);
      const r = Engine.run({ grid, target: lesson.target, formula: f, set: App.resolveSet(test.set), lang: state.lang });
      if (r.error) return { ok: false, html: errMessage(r) };
      if (!Engine.equal(r.value, expected)) {
        const kind = App.fmtKind(lesson, lesson.target);
        if (i === 0) return { ok: false, html: `${t('wrongValue')}<br><small>${t('yourAnswer')} : <code>${esc(App.fmtValue(r.value, kind))}</code> &nbsp; ${t('expected')} : <code>${esc(App.fmtValue(expected, kind))}</code></small>` };
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

  /* ---------------------------------------------------------- PRACTICE: understand -> practise -> remember */
  function viewPractice(lesson, c) {
    const next = nextOf(lesson, c);
    const labels = [t('stLearn'), t('stPractice'), t('stRecap')];
    let hints = 0, solvedFormula = null, stage = 0;
    const nHints = lesson.hints.length;
    const kind = App.fmtKind(lesson, lesson.target);

    App.mount(frame(lesson, c, { labels, cur: 0 }));
    bindFrame(lesson);
    App.mountPrereq($('#prereq-slot'), t('prereqIntro', L(lesson.title)), App.reqOf(lesson), 'l:' + lesson.id);

    function go(n) { stage = n; setStages(labels, n); [showLearn, showPractice, showRecap][n](); if (n !== 0) $('#prereq-slot').innerHTML = ''; }

    function showLearn() {
      setBody(`
        <div class="two learn">
          <article class="read"><div class="prose big">${L(lesson.intro)}</div>
            <div class="actions"><button class="btn primary" id="toPractice">${t('toPractice')}</button>
              ${App.isDone(lesson.id) ? `<span class="muted small">${t('alreadyDone')}</span>` : ''}</div></article>
          <aside class="stage"><div class="win compact"><div class="fbar"><span class="namebox">${esc(lesson.target)}</span><span class="fx">fx</span><span class="formula">&nbsp;</span></div>
            <div class="sheet-scroll">${sheetHTML(lesson, 'preview')}</div></div>
            <div class="mission"><b>${t('mission')}</b>${L(lesson.task)}</div></aside>
        </div>`);
      $('#toPractice').onclick = () => go(1);
    }

    function showPractice() {
      setBody(`
        <div class="two">
          <article class="read">
            <div class="mission"><b>${t('mission')}</b>${L(lesson.task)}</div>
            <div class="actions" style="margin-top:0">
              <button class="btn soft sm" id="hintBtn">${ic('bulb', 18)}<span id="hintLabel">${t('hintsLeft', nHints)}</span></button>
              <button class="btn text sm" id="reread">${ic('back', 16)}${t('reread')}</button>
            </div>
            <div class="hints" id="hints"></div>
          </article>
          <section class="stage">
            <div class="win">
              <div class="fbar"><span class="namebox">${esc(lesson.target)}</span><span class="fx">fx</span><span class="formula" id="fxBar">&nbsp;</span></div>
              <div class="sheet-scroll">${sheetHTML(lesson, 'input')}</div>
              <div class="result">
                <span class="live" id="live">${t('liveEmpty')}</span>
                <button class="btn primary sm" id="checkBtn">${ic('check', 18)}${t('checkAnswer')}</button>
              </div>
            </div>
            <div id="feedback"></div>
          </section>
        </div>`);
      const input = $('#answer'), fxBar = $('#fxBar'), live = $('#live'), fb = $('#feedback');

      function updateLive() {
        const v = input.value;
        fxBar.textContent = v || ' ';
        live.className = 'live';
        if (!v.trim()) { live.textContent = t('liveEmpty'); return; }
        if (v.trim()[0] !== '=') { live.innerHTML = `${t('liveResult')}<b>${esc(v)}</b>`; return; }
        const r = runBase(lesson, v.trim());
        if (r.error) { live.className = 'live err'; live.innerHTML = `${t('liveResult')}<b>#${esc(r.error)}</b>`; }
        else live.innerHTML = `${t('liveResult')}<b>${esc(App.fmtValue(r.value, kind))}</b>`;
      }
      input.addEventListener('input', () => { updateLive(); fb.innerHTML = ''; });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doCheck(); } });

      function showHints() {
        $('#hints').innerHTML = lesson.hints.slice(0, Math.min(hints, nHints)).map((h) => `<div class="hint">${ic('bulb', 18)}<div>${L(h)}</div></div>`).join('')
          + (hints > nHints ? `<div class="hint">${ic('check', 18)}<div><b>${t('solutionIs')}</b> <code>${esc(L(lesson.solution))}</code></div></div>` : '');
        const left = nHints - hints;
        $('#hintLabel').textContent = left > 0 ? t('hintsLeft', left) : t('showSolution');
        $('#hintBtn').disabled = hints > nHints;
      }
      $('#hintBtn').onclick = () => { hints++; showHints(); };
      $('#reread').onclick = () => go(0);
      showHints();

      function doCheck() {
        const res = checkFormula(lesson, input.value);
        if (!res.ok) { fb.innerHTML = bannerHTML('bad', res.html); input.focus(); return; }
        solvedFormula = input.value.trim();
        const out = App.completeLesson(lesson, { hints });
        App.celebrate(out);
        state.lastGain = out.gain;
        go(2);
      }
      $('#checkBtn').onclick = doCheck;
      setTimeout(() => input.focus({ preventScroll: true }), 80);
    }

    function showRecap() {
      const r = solvedFormula ? runBase(lesson, solvedFormula) : null;
      const shown = r && !r.error ? App.fmtValue(r.value, kind) : '';
      const gain = state.lastGain || 0;
      setBody(`
        <div class="two">
          <article class="read">
            ${bannerHTML('good', `<b>${esc(pick(t('bravo')))}</b>${gain ? `<span class="xp">${esc(t('xpGained', gain))}</span>` : ''}`)}
            ${noteHTML('teacher', t('teacherSays'), `<div>${L(lesson.explain)}</div>`)}
            ${lesson.pro ? noteHTML('tip', t('proTip'), `<div>${proText(lesson.pro)}</div>`) : ''}
            <div class="actions">${nextButtons(next, c)}</div>
          </article>
          <aside class="stage"><div class="win compact"><div class="fbar"><span class="namebox">${esc(lesson.target)}</span><span class="fx">fx</span><span class="formula">${esc(solvedFormula || L(lesson.solution))}</span></div>
            <div class="sheet-scroll">${sheetHTML(lesson, 'solved', shown)}</div></div></aside>
        </div>`);
    }

    showLearn();
  }

  /* ---------------------------------------------------------- QUIZ: one question per screen */
  function viewQuiz(lesson, c) {
    const next = nextOf(lesson, c);
    const n = lesson.questions.length;
    let cur = -1, wrongs = 0, qWrong = 0;

    App.mount(frame(lesson, c, { labels: [t('stIntro'), t('stQuestions'), t('stRecap')], cur: 0 }));
    bindFrame(lesson);
    App.mountPrereq($('#prereq-slot'), t('prereqIntro', L(lesson.title)), App.reqOf(lesson), 'l:' + lesson.id);

    const progress = (i) => `<div class="seg qseg">${lesson.questions.map((_, k) => `<span class="${k < i ? 'on' : ''} ${k === i ? 'cur' : ''}"></span>`).join('')}</div>`;

    function showIntro() {
      setBody(`<div class="center-card wide"><div class="prose big">${L(lesson.intro)}</div>
        <div class="actions"><button class="btn primary" id="startQ">${t('quizStart', n)}</button></div></div>`);
      $('#startQ').onclick = () => showQuestion(0);
    }

    function showQuestion(i) {
      cur = i; qWrong = 0;
      $('#prereq-slot').innerHTML = '';
      const q = lesson.questions[i];
      $('#helpBtn').onclick = () => App.openHelp({ ids: App.helpFor(lesson.id, i), title: t('nbForQuestion') });
      setStages([t('stIntro'), t('stQuestions') + ' ' + (i + 1) + '/' + n, t('stRecap')], 1);
      setBody(`
        <div class="qwrap">
          ${progress(i)}
          <h2 class="qtitle">${L(q.q)}</h2>
          <div class="opts">${q.options.map((o, oi) => `<button class="opt" data-o="${oi}"><span class="mark"></span><span>${L(o)}</span></button>`).join('')}</div>
          <div id="qfeed"></div>
          <div class="actions" id="qActions">
            <button class="btn soft sm" id="qHelp">${ic('help', 18)}${t('needHelp')}</button>
            <button class="btn text sm" id="qReveal">${ic('eye', 18)}${t('showAnswer')}</button>
          </div>
        </div>`);
      $('#qHelp').onclick = () => App.openHelp({ ids: App.helpFor(lesson.id, i), title: t('nbForQuestion') });
      const finishQ = (revealed) => {
        $$('.opt').forEach((b) => (b.disabled = true));
        const right = $$('.opt')[q.answer]; right.classList.add('right'); $('.mark', right).innerHTML = ic('check', 14);
        $('#qfeed').innerHTML = noteHTML('teacher', revealed ? t('theAnswer') : t('teacherSays'), `<div>${L(q.explain)}</div>`);
        $('#qActions').innerHTML = `<button class="btn primary" id="qNext">${t(i + 1 < n ? 'nextQuestion' : 'seeResult')}</button>`;
        $('#qNext').onclick = () => (i + 1 < n ? showQuestion(i + 1) : showDone());
        $('#qNext').focus();
      };
      $$('.opt').forEach((btn) => btn.addEventListener('click', () => {
        const oi = +btn.dataset.o;
        if (oi === q.answer) finishQ(false);
        else { wrongs++; qWrong++; btn.classList.add('wrong'); $('.mark', btn).innerHTML = ic('close', 14); btn.disabled = true; $('#qfeed').innerHTML = bannerHTML('bad', esc(t('quizWrong'))); }
      }));
      $('#qReveal').onclick = () => { if (!qWrong) wrongs++; finishQ(true); };
    }

    function showDone() {
      $('#helpBtn').onclick = () => App.openHelp({ ids: App.helpFor(lesson.id), title: t('nbForThis') });
      setStages([t('stIntro'), t('stQuestions'), t('stRecap')], 2);
      const out = App.completeLesson(lesson, { wrongs });
      App.celebrate(out);
      setBody(`<div class="center-card">
        ${bannerHTML('good', `<b>${esc(t('quizDone'))}</b>${out.gain ? `<span class="xp">${esc(t('xpGained', out.gain))}</span>` : `<span class="muted"> ${esc(t('alreadyDone'))}</span>`}`)}
        <p class="big-n">${n - Math.min(wrongs, n)} / ${n}</p><p class="muted">${esc(t(wrongs ? 'quizSomeWrong' : 'quizPerfect'))}</p>
        <div class="actions">${nextButtons(next, c)}</div></div>`);
    }

    showIntro();
  }

  /* ---------------------------------------------------------- BUILD: guided project in real Excel */
  function viewBuild(lesson, c) {
    const next = nextOf(lesson, c);
    const startUrl = L(lesson.files.start), modelUrl = lesson.files.model ? L(lesson.files.model) : null;
    const fileName = startUrl.split('/').pop();
    const ticks = (state.steps[lesson.id] = state.steps[lesson.id] || []);
    const N = lesson.steps.length;
    const labels = [t('stPrepare'), t('stBuild'), t('stCheck')];
    const saved = App.wizGet(lesson.id);
    let pos = saved && saved.pos ? saved.pos : { s: 'brief' };      // { s:'brief'|'download'|'open'|'step'|'check', i }
    const pill = () => (['brief', 'download', 'open'].includes(pos.s) ? 0 : pos.s === 'step' ? 1 : 2);

    App.mount(frame(lesson, c, { labels, cur: 0 }));
    bindFrame(lesson);
    App.mountPrereq($('#prereq-slot'), t('prereqIntro', L(lesson.title)), App.reqOf(lesson), 'l:' + lesson.id);

    function go(p) {
      pos = p; App.wizSet(lesson.id, { pos: p });
      setStages(labels, pill());
      if (p.s !== 'brief') $('#prereq-slot').innerHTML = '';
      ({ brief: showBrief, download: showDownload, open: showOpen, step: showStep, check: showCheck })[p.s]();
    }

    /* ---- 1. brief: what you will build */
    function showBrief() {
      setBody(`
        <div class="two">
          <article class="read"><div class="prose big">${L(lesson.intro)}</div>
            <div class="actions"><button class="btn primary" id="toDl">${ic('download', 18)}${t('briefGo')}</button>
              ${state.dl[lesson.id] ? `<button class="btn text sm" id="skipDl">${t('briefHave')}</button>` : ''}</div></article>
          <aside class="stage"><div class="panel"><h2>${t('briefSteps', N)}</h2>
            <ol class="outline">${lesson.steps.map((s) => `<li>${L(s.title)}</li>`).join('')}</ol>
            <p class="muted small">${ic('clock', 15)} ${t('briefTime', Math.max(10, N * 4))}</p></div></aside>
        </div>`);
      $('#toDl').onclick = () => go({ s: 'download' });
      const sk = $('#skipDl'); if (sk) sk.onclick = () => go({ s: 'open' });
    }

    /* ---- 2. download, then ask if it worked */
    function showDownload() {
      const confirmed = !!state.dl[lesson.id];
      setBody(`
        <div class="center-card">
          <span class="file-ic">${ic('file', 38)}</span>
          <h2>${t('dlTitle')}</h2>
          <p class="muted">${esc(fileName)} · ${t('dlWhat')}</p>
          <div id="dlArea"></div>
          <button class="btn text sm" id="dlBack">${ic('back', 16)}${t('back')}</button>
        </div>`);
      $('#dlBack').onclick = () => go({ s: 'brief' });
      const area = $('#dlArea');
      const askButton = () => {
        area.innerHTML = `<a class="btn primary big" id="dlBtn" href="${esc(startUrl)}" download>${ic('download', 20)}${t(confirmed ? 'dlAgain' : 'dlButton')}</a>
          ${confirmed ? `<div class="actions center"><button class="btn primary" id="dlContinue">${t('dlContinue')}</button></div>` : ''}`;
        $('#dlBtn').addEventListener('click', () => setTimeout(askConfirm, 700));
        const cont = $('#dlContinue'); if (cont) cont.onclick = () => go({ s: 'open' });
      };
      const askConfirm = () => {
        area.innerHTML = `<div class="ask"><b>${t('dlAsk')}</b><p class="muted">${t('dlAskHint')}</p>
          <div class="actions center"><button class="btn primary" id="dlYes">${ic('check', 18)}${t('dlYes')}</button><button class="btn soft" id="dlNo">${t('dlNo')}</button></div></div>`;
        $('#dlYes').onclick = () => { state.dl[lesson.id] = true; App.save(); go({ s: 'open' }); };
        $('#dlNo').onclick = askTrouble;
      };
      const askTrouble = () => {
        area.innerHTML = `<div class="trouble"><b>${t('dlTroubleTitle')}</b>
          <ul><li>${ic('monitor', 16)}<span>${t('dlWin')}</span></li><li>${ic('tablet', 16)}<span>${t('dlIpad')}</span></li><li>${ic('folder', 16)}<span>${t('dlSearch')}</span></li></ul>
          <div class="actions center"><a class="btn primary" id="dlRetry" href="${esc(startUrl)}" download>${ic('download', 18)}${t('dlAgain')}</a>
            <button class="btn soft" id="dlFound">${t('dlYes')}</button></div></div>`;
        $('#dlRetry').addEventListener('click', () => setTimeout(askConfirm, 700));
        $('#dlFound').onclick = () => { state.dl[lesson.id] = true; App.save(); go({ s: 'open' }); };
      };
      askButton();
    }

    /* ---- 3. open it in Excel */
    function showOpen() {
      let tab = /iPad|iPhone/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform)) ? 'ipad' : 'win';
      const render = () => {
        setBody(`
          <div class="center-card wide">
            <h2>${t('openTitle')}</h2>
            <div class="tabs" role="tablist"><button class="tab ${tab === 'win' ? 'on' : ''}" data-tab="win">${ic('monitor', 17)}Windows</button><button class="tab ${tab === 'ipad' ? 'on' : ''}" data-tab="ipad">${ic('tablet', 17)}iPad</button></div>
            <ol class="how">${(tab === 'win' ? t('openWin') : t('openIpad')).map((s) => `<li>${s}</li>`).join('')}</ol>
            <div class="note tip"><span class="ic-wrap">${ic('info', 18)}</span><div>${t('openProtected')}</div></div>
            <div class="actions"><button class="btn primary" id="isOpen">${ic('check', 18)}${t('openYes')}</button>
              <button class="btn text sm" id="backDl">${ic('back', 16)}${t('openBack')}</button></div>
          </div>`);
        $$('.tab').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; render(); }));
        $('#isOpen').onclick = () => go({ s: 'step', i: 0 });
        $('#backDl').onclick = () => go({ s: 'download' });
      };
      render();
    }

    /* ---- 4. one step at a time */
    function showStep() {
      const i = Math.min(pos.i || 0, N - 1), s = lesson.steps[i];
      setBody(`
        <div class="steps-layout">
          <nav class="steps-nav" aria-label="${esc(t('briefSteps', N))}">${lesson.steps.map((st, k) => `<button class="sn ${k === i ? 'cur' : ''} ${ticks[k] ? 'done' : ''}" data-k="${k}"><span class="dot">${ticks[k] ? ic('check', 12) : k + 1}</span><span>${L(st.title)}</span></button>`).join('')}</nav>
          <article class="step-card">
            <div class="step-count">${esc(t('stepOf', i + 1, N))}</div>
            <h2 class="step-h">${L(s.title)}</h2>
            <div class="prose">${L(s.body)}</div>
            <div class="actions step-actions">
              ${i > 0 ? `<button class="btn text" id="stPrev">${ic('back', 16)}${t('prevStep')}</button>` : `<button class="btn text" id="stPrev">${ic('back', 16)}${t('openBack')}</button>`}
              <button class="btn primary" id="stDone">${ic('check', 18)}${t(i + 1 < N ? 'stepFinished' : 'stepLast')}</button>
            </div>
          </article>
        </div>`);
      $$('.sn').forEach((b) => (b.onclick = () => go({ s: 'step', i: +b.dataset.k })));
      $('#stPrev').onclick = () => (i > 0 ? go({ s: 'step', i: i - 1 }) : go({ s: 'open' }));
      $('#stDone').onclick = () => { ticks[i] = true; App.save(); i + 1 < N ? go({ s: 'step', i: i + 1 }) : go({ s: 'check' }); };
    }

    /* ---- 5. upload and check */
    function showCheck() {
      setBody(`
        <div class="two">
          <article class="read">
            <h2 class="step-h">${t('uploadTitle')}</h2>
            <p class="muted">${t('uploadHelp')}</p>
            <label class="drop" id="drop" for="fileInput">${ic('upload', 30)}<b>${t('dropHere')}</b><small>.xlsx</small></label>
            <input type="file" id="fileInput" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden>
            <p class="privacy">${ic('lock', 16)}<span>${t('privacy')}</span></p>
            <div class="actions"><button class="btn text sm" id="backSteps">${ic('back', 16)}${t('backToSteps')}</button></div>
          </article>
          <section class="stage"><div class="panel report-panel"><div id="report"><p class="muted">${t('reportWaiting')}</p></div></div><div id="teacher"></div><div class="actions" id="nextRow"></div></section>
        </div>`);
      $('#backSteps').onclick = () => go({ s: 'step', i: N - 1 });
      const report = $('#report'), drop = $('#drop'), input = $('#fileInput');

      function renderReport(results) {
        const req = results.filter((r) => !r.bonus), okReq = req.filter((r) => r.ok).length;
        const gt = (k, dflt) => (lesson.groupTitles && lesson.groupTitles[k] ? L(lesson.groupTitles[k]) : dflt);
        const groups = [['calc', gt('calc', t('groupCalc'))], ['design', gt('design', t('groupDesign'))], ['bonus', t('groupBonus')]];
        const list = groups.map(([g, title]) => (results.some((r) => r.group === g) ? `
          <h3 class="chk-group">${title}</h3>
          <ul class="checks">${results.filter((r) => r.group === g).map((r) => `
            <li class="chk ${r.ok ? 'ok' : r.bonus ? 'opt' : 'bad'}"><span class="dot">${r.ok ? ic('check', 14) : r.bonus ? '' : ic('close', 14)}</span>
              <div><b>${esc(r.label)}</b>${r.msg ? `<div class="chk-msg">${r.msg}</div>` : ''}</div></li>`).join('')}</ul>` : '')).join('');
        report.innerHTML = `<div class="score"><b>${esc(t('checksPassed', okReq, req.length))}</b><div class="thin"><i style="width:${Math.round((okReq / req.length) * 100)}%"></i></div></div>${list}`;
        return okReq === req.length;
      }

      function finish(results) {
        const out = App.completeLesson(lesson, {});
        const bonusIds = results.filter((r) => r.bonus && r.ok).map((r) => r.id);
        const bonusRes = App.awardBonus(lesson, bonusIds);
        $('#teacher').innerHTML = bannerHTML('good', `<b>${esc(pick(t('bravo')))}</b>${out.gain ? `<span class="xp">${esc(t('xpGained', out.gain))}</span>` : `<span class="muted"> ${esc(t('alreadyDone'))}</span>`}${bonusRes ? `<span class="xp">${esc(t('bonusXp', bonusRes.gain))}</span>` : ''}`)
          + noteHTML('teacher', t('teacherSays'), `<div>${L(lesson.explain)}</div>`)
          + (lesson.pro ? noteHTML('tip', t('proTip'), `<div>${proText(lesson.pro)}</div>`) : '');
        $('#nextRow').innerHTML = (modelUrl ? `<a class="btn soft" href="${esc(modelUrl)}" download>${ic('download', 18)}${t('downloadModel')}</a>` : '') + nextButtons(next, c);
        if (!out.repeat) App.celebrate(out);
        if (bonusRes) setTimeout(() => App.celebrate(bonusRes), out.repeat ? 0 : 2400);
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
          else { const bonusIds = results.filter((r) => r.bonus && r.ok).map((r) => r.id); if (App.isDone(lesson.id) && bonusIds.length) App.awardBonus(lesson, bonusIds); }
        } catch (e) {
          report.innerHTML = bannerHTML('bad', e.message === 'nolib' ? t('libError') : ProjectChecks.MSG[state.lang].notFile);
        } finally { input.value = ''; }
      }
      input.addEventListener('change', () => handleFile(input.files[0]));
      ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
      ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));
    }

    go(pos);
  }

  function viewLesson(id) {
    const lesson = App.lessonOf(id);
    if (!lesson) return App.go('#/');
    const c = App.chapterOf(lesson.chapterId);
    document.title = L(lesson.title) + ' · ' + t('appName');
    if (lesson.type === 'quiz') viewQuiz(lesson, c);
    else if (lesson.type === 'build') viewBuild(lesson, c);
    else viewPractice(lesson, c);
  }

  Object.assign(App, { viewLesson });
})();
