/* Slide player for the "Comprendre" step of a lesson.
   Each slide = a short text on the left + a live example sheet on the right.
   The example is interactive: formulas are typed out with colour-coded references (as Excel does),
   Enter computes the result, any cell can be tapped to read it, and on "edit" slides the numbers can
   be changed to watch the result follow.

   A deck (content/slides.js) looks like:
     { ex: { grid, target, f, fmt, also, editText }, slides: [ { show, t, p, f?, copy? } ] }
   show: 'data' (no formula yet) | 'type' (formula typed out, then Enter) | 'result' | 'edit'
   f (formula) can be set on the deck or per slide; copy:true also fills the cells in `ex.also`.   */
(() => {
  const { state, t, L, esc, ic, $, $$ } = App;

  const { tokens, shift, colNum } = FormulaRefs;

  // formula text with each reference coloured like Excel does; `n` = how many characters are typed so far
  function formulaHTML(f, n) {
    const toks = tokens(f).filter((k) => k.end <= n);
    let h = '', pos = 0;
    toks.forEach((k, i) => { h += esc(f.slice(pos, k.start)) + `<span class="rf rf${i % 5}">${esc(f.slice(k.start, k.end))}</span>`; pos = k.end; });
    return h + esc(f.slice(pos, n));
  }

  /* ---------------------------------------------------------- player */
  function mount(root, { deck, onDone, doneLabel, lesson }) {
    const { ex, slides } = deck;
    const grid0 = App.resolveGrid(ex.grid);
    const cols = Math.max(...grid0.map((r) => r.length));
    const lessonLike = { fmt: ex.fmt || {} };
    const also = ex.also || [];
    const editText = ex.editText || [];
    let i = 0, set = {}, sel = ex.target, typed = 0, entered = false, timer = null, results = {};

    const slide = () => slides[i];
    const mode = () => slide().show;
    const formula = () => L(slide().f || ex.f);
    const hasFormula = () => mode() !== 'data';
    // formulas shown in the sheet for this slide: the target, plus the "copied" cells when asked
    function formulaCells() {
      const out = {}; if (!hasFormula()) return out;
      const f = formula(), T0 = Engine.parseAddress(ex.target);
      out[ex.target] = f;
      if (slide().copy) also.forEach((a) => { const P = Engine.parseAddress(a); out[a] = shift(f, P.row - T0.row, P.col - T0.col); });
      return out;
    }
    const fc = () => formulaCells();
    const resultsNow = () => { const c = fc(); return Object.keys(c).length ? Engine.runMany({ grid: grid0, cells: c, set, lang: state.lang }) : {}; };
    const shown = (addr) => {                       // text displayed for a formula cell
      const r = results[addr]; if (!r) return '';
      if (r.error) return '#' + (r.error === 'NA' ? 'N/A' : r.error === 'DIV_BY_ZERO' ? 'DIV/0!' : r.error === 'VALUE' ? 'VALEUR!' : r.error);
      return App.fmtValue(r.value, App.fmtKind(lessonLike, addr));
    };
    const refColor = (upTo) => {                    // address -> colour index, for the references typed so far
      const map = {}; if (!hasFormula()) return map;
      tokens(formula()).filter((k) => k.end <= upTo).forEach((k, n) => k.cells.forEach((a) => { map[a] = n % 5; }));
      return map;
    };
    const isEditable = (addr, v, r) => mode() === 'edit' && ((r > 0 && typeof v === 'number') || editText.includes(addr));
    const showsResult = () => mode() === 'result' || mode() === 'edit' || (mode() === 'type' && entered);

    function sheetHTML() {
      const f = formula(), cellsF = fc();
      const colors = refColor(mode() === 'type' && !entered ? typed : f.length);
      let h = `<table class="sheet"><thead><tr><th class="rh"></th>${Array.from({ length: cols }, (_, c) => `<th class="col">${Engine.colLetter(c)}</th>`).join('')}</tr></thead><tbody>`;
      grid0.forEach((row, r) => {
        h += `<tr><th class="rh">${r + 1}</th>`;
        for (let c = 0; c < cols; c++) {
          const addr = Engine.colLetter(c) + (r + 1), base = row[c], v = set[addr] !== undefined ? set[addr] : base;
          const cls = [];
          if (colors[addr] !== undefined) cls.push('rc rc' + colors[addr]);
          if (sel === addr) cls.push('sel');
          let inner = '';
          if (cellsF[addr] !== undefined) {
            cls.push(addr === ex.target ? 'target' : 'also');
            if (addr === ex.target && mode() === 'type' && !entered) { cls.push('typing'); inner = `<span class="fc">${formulaHTML(f, typed)}</span>`; }
            else if (showsResult()) { cls.push('has'); const isErr = results[addr] && results[addr].error; inner = `<span class="fc ${isErr ? 'err' : ''}" data-fc="${addr}">${esc(shown(addr))}</span>`; if (typeof (results[addr] || {}).value === 'number') cls.push('num'); }
            else inner = '';
          } else if (addr === ex.target) { cls.push('target', 'empty'); }
          else if (v === null || v === undefined || v === '') inner = '';
          else if (isEditable(addr, base, r)) {
            const kind = App.fmtKind(lessonLike, addr), isPct = kind === 'pct';
            const val = typeof v === 'number' ? (isPct ? +(v * 100).toFixed(4) : v) : v;
            inner = `<input class="ed" data-ed="${addr}" value="${esc(String(val).replace('.', state.lang === 'fr' ? ',' : '.'))}" inputmode="decimal" autocomplete="off" aria-label="${esc(addr)}">${isPct ? '<span class="sfx">%</span>' : ''}`;
            cls.push('editable'); if (typeof base === 'number') cls.push('num');
          } else if (r === 0 && typeof v === 'string') { cls.push('head'); inner = esc(v); }
          else if (typeof v === 'number') { cls.push('num'); inner = esc(App.fmtValue(v, App.fmtKind(lessonLike, addr))); }
          else inner = esc(v);
          h += `<td data-addr="${addr}" class="${cls.join(' ')}">${inner}</td>`;
        }
        h += '</tr>';
      });
      return h + '</tbody></table>';
    }

    function barHTML() {
      const cellsF = fc(), isF = cellsF[sel] !== undefined;
      if (isF) {
        if (mode() === 'type' && !entered && sel === ex.target) return formulaHTML(cellsF[sel], typed) + (typed < cellsF[sel].length ? '<span class="caret"></span>' : '');
        return formulaHTML(cellsF[sel], cellsF[sel].length);
      }
      const row = Number(sel.replace(/\D/g, '')) - 1, col = colNum(sel.replace(/\d/g, '')) - 1;
      const v = set[sel] !== undefined ? set[sel] : (grid0[row] || [])[col];
      if (sel === ex.target) return '';
      return v === null || v === undefined ? '' : esc(typeof v === 'number' ? String(v).replace('.', state.lang === 'fr' ? ',' : '.') : v);
    }

    function cueHTML() {
      if (mode() === 'type') return entered ? `<span class="cue ok">${ic('check', 16)}${esc(t('slideEntered'))}</span>` : (typed >= formula().length ? `<button class="btn primary sm cue-btn" id="enterBtn">${esc(t('pressEnter'))} <kbd>↵</kbd></button>` : `<span class="cue">${esc(t('slideTyping'))}</span>`) + (entered || typed >= formula().length ? `<button class="btn text sm" id="replay">${ic('back', 15)}${esc(t('replay'))}</button>` : '');
      if (mode() === 'edit') return `<span class="cue try">${ic('bulb', 16)}${esc(t('tryEdit'))}</span>`;
      return `<span class="cue">${ic('eye', 16)}${esc(t('tapCell'))}</span>`;
    }

    function paintSheet() {
      results = showsResult() ? resultsNow() : {};
      $('#deckSheet', root).innerHTML = sheetHTML();
      $('#deckBar', root).innerHTML = barHTML();
      $('#deckName', root).textContent = sel;
      $$('td[data-addr]', root).forEach((td) => td.addEventListener('click', (e) => {
        if (e.target.matches('input')) { sel = td.dataset.addr; $('#deckBar', root).innerHTML = barHTML(); $('#deckName', root).textContent = sel; return; }
        sel = td.dataset.addr; App.sound.play('soft');
        $$('td.sel', root).forEach((x) => x.classList.remove('sel')); td.classList.add('sel');
        $('#deckBar', root).innerHTML = barHTML(); $('#deckName', root).textContent = sel;
      }));
      $$('input.ed', root).forEach((inp) => {
        const addr = inp.dataset.ed, isPct = App.fmtKind(lessonLike, addr) === 'pct';
        inp.addEventListener('focus', () => { sel = addr; inp.select(); $('#deckName', root).textContent = sel; });
        inp.addEventListener('input', () => {
          const txt = inp.value.trim(), raw = txt.replace(',', '.').replace('%', '');
          const num = raw !== '' && raw !== '-' && !Number.isNaN(Number(raw));
          if (editText.includes(addr)) set[addr] = num ? Number(raw) : txt;      // text cells (a criterion, a code) stay text
          else if (num) set[addr] = isPct ? Number(raw) / 100 : Number(raw);
          else return;
          recalc();
        });
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
      });
    }
    // update only the computed cells so the field being typed in keeps its focus
    function recalc() {
      results = resultsNow();
      $$('[data-fc]', root).forEach((s) => {
        const a = s.dataset.fc, isErr = results[a] && results[a].error;
        s.textContent = shown(a); s.classList.toggle('err', !!isErr);
        s.parentElement.classList.remove('flash'); void s.parentElement.offsetWidth; s.parentElement.classList.add('flash');
      });
      $('#deckBar', root).innerHTML = barHTML();
    }

    function startType() {
      clearInterval(timer); typed = 0; entered = false;
      const f = formula();
      sel = ex.target; paintSheet(); $('#deckCue', root).innerHTML = cueHTML();
      timer = setInterval(() => {
        if (!document.body.contains(root)) return clearInterval(timer);
        typed++;
        if (typed >= f.length) { clearInterval(timer); typed = f.length; App.sound.play('soft'); paintSheet(); wireCue(); }
        else { paintSheet(); }
        $('#deckCue', root).innerHTML = cueHTML(); wireCue();
      }, 45);
    }
    function enter() {
      if (mode() !== 'type' || entered || typed < formula().length) return;
      entered = true; App.sound.play('step'); paintSheet(); $('#deckCue', root).innerHTML = cueHTML(); wireCue();
      const td = $(`td[data-addr="${ex.target}"]`, root); if (td) td.classList.add('flash');
    }
    function wireCue() {
      const b = $('#enterBtn', root); if (b) b.onclick = enter;
      const r = $('#replay', root); if (r) r.onclick = () => { App.sound.play('tick'); startType(); };
    }

    function draw(dir) {
      clearInterval(timer);
      set = {}; sel = ex.target; typed = 0; entered = false;
      const s = slide(), n = slides.length, last = i === n - 1;
      root.innerHTML = `
        <div class="deck" id="deck">
          <div class="deck-main">
            <article class="deck-text ${dir ? (dir > 0 ? 'in-r' : 'in-l') : 'in-r'}">
              <span class="deck-count">${esc(t('slideN', i + 1, n))}</span>
              <h2 class="deck-h">${esc(L(s.t))}</h2>
              <div class="prose deck-p">${L(s.p)}</div>
              <div class="deck-cue" id="deckCue"></div>
            </article>
            <section class="deck-stage ${dir ? (dir > 0 ? 'in-r' : 'in-l') : 'in-r'}">
              <div class="win deck-win" style="--rows:${grid0.length}">
                <div class="fbar"><span class="namebox" id="deckName">${esc(sel)}</span><span class="fx">fx</span><span class="formula" id="deckBar"></span></div>
                <div class="sheet-scroll" id="deckSheet"></div>
              </div>
            </section>
          </div>
          <footer class="deck-nav">
            <button class="btn text" id="dPrev" ${i === 0 ? 'disabled' : ''}>${ic('back', 16)}${esc(t('slidePrev'))}</button>
            <div class="dots" role="tablist">${slides.map((_, k) => `<button class="dd ${k === i ? 'cur' : k < i ? 'on' : ''}" data-k="${k}" aria-label="${k + 1}"></button>`).join('')}</div>
            <button class="btn primary" id="dNext">${esc(last ? doneLabel : t('slideNext'))}${last ? '' : ic('next', 16)}</button>
          </footer>
        </div>`;
      $('#dPrev', root).onclick = () => go(i - 1);
      $('#dNext', root).onclick = () => (last ? (App.sound.play('next'), onDone()) : go(i + 1));
      $$('.dd', root).forEach((b) => (b.onclick = () => go(+b.dataset.k)));
      if (mode() === 'type') startType();
      else { paintSheet(); $('#deckCue', root).innerHTML = cueHTML(); }
      wireCue();
    }
    function go(k) {
      if (k < 0 || k >= slides.length || k === i) return;
      App.sound.play(k > i ? 'next' : 'back');
      const dir = k > i ? 1 : -1; i = k; draw(dir);
    }

    // keyboard (arrows, Enter) and swipe, only while this deck is on screen
    if (window.__deckKey) document.removeEventListener('keydown', window.__deckKey);
    window.__deckKey = (e) => {
      if (!document.body.contains(root) || !$('#deck', root)) { document.removeEventListener('keydown', window.__deckKey); return; }
      if (e.target.matches && e.target.matches('input, textarea, select')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); i === slides.length - 1 ? onDone() : go(i + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
      else if (e.key === 'Enter' && mode() === 'type' && !entered && typed >= formula().length) { e.preventDefault(); enter(); }
    };
    document.addEventListener('keydown', window.__deckKey);
    let x0 = null;
    root.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (x0 === null || e.target.closest('input, .sheet-scroll')) { x0 = null; return; }
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 60) { if (dx < 0) { i === slides.length - 1 ? onDone() : go(i + 1); } else go(i - 1); }
    }, { passive: true });

    draw(0);
  }

  Object.assign(App, { slides: { mount } });
})();
