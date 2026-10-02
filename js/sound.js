/* Soft UI sounds, synthesised with the Web Audio API (no audio files).
   Gentle sine "glass" notes on a pentatonic scale so they never clash, kept quiet.
   Muted with one button in the top bar; the choice is remembered (state.sound).   */
(() => {
  const { state } = App;
  let ctx = null, master = null, lastPlay = 0;

  const enabled = () => state.sound !== false;

  function ensure() {
    if (ctx) return ctx.state === 'suspended' ? (ctx.resume(), ctx) : ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200;
    master = ctx.createGain(); master.gain.value = 0.5;
    master.connect(lp); lp.connect(ctx.destination);
    return ctx;
  }

  // one soft note: sine body + a quiet octave "sparkle", fast attack, exponential fade
  function note(freq, at, dur, vol, { type = 'sine', glideTo = null, sparkle = true } = {}) {
    const t0 = ctx.currentTime + at;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    g.connect(master);
    const voices = [[freq, 1]]; if (sparkle) voices.push([freq * 2, 0.22]);
    voices.forEach(([f, k]) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t0);
      if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo * (f / freq), t0 + dur * 0.8);
      const vg = ctx.createGain(); vg.gain.value = k;
      o.connect(vg); vg.connect(g); o.start(t0); o.stop(t0 + dur + 0.05);
    });
  }

  const N = { A4: 440, C5: 523.25, D5: 587.33, B5: 987.77, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, D6: 1174.7, E6: 1318.5, G6: 1568 };

  const SOUNDS = {
    tick: () => note(1250, 0, 0.07, 0.07, { glideTo: 900, sparkle: false }),                 // any button
    pop: () => note(520, 0, 0.1, 0.1, { glideTo: 720 }),                                     // pick an option
    next: () => { note(N.G5, 0, 0.16, 0.09); note(N.B5, 0.06, 0.2, 0.09); },          // forward (slide, question)
    back: () => { note(988, 0, 0.14, 0.07); note(N.G5, 0.06, 0.18, 0.07); },
    right: () => { note(N.C5, 0, 0.3, 0.12); note(N.E5, 0.08, 0.3, 0.12); note(N.G5, 0.16, 0.5, 0.13); },
    wrong: () => note(210, 0, 0.28, 0.12, { type: 'triangle', glideTo: 160, sparkle: false }),   // soft low "bonk", not harsh
    step: () => { note(N.E5, 0, 0.2, 0.1); note(N.A5, 0.08, 0.32, 0.1); },                    // a project step ticked off
    win: () => [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f, i) => note(f, i * 0.09, 0.7, 0.11)), // lesson finished
    badge: () => [N.G5, N.C6, N.E6, N.G6].forEach((f, i) => note(f, i * 0.1, 0.8, 0.09)),     // badge / level up
    on: () => { note(N.G5, 0, 0.18, 0.1); note(N.C6, 0.07, 0.3, 0.1); },                      // sound switched on
    soft: () => note(N.D5, 0, 0.18, 0.06),                                                    // drawers, small things
  };

  function play(name) {
    if (!enabled() || !SOUNDS[name]) return;
    try { if (!ensure()) return; SOUNDS[name](); lastPlay = performance.now(); } catch (e) { /* audio blocked: stay silent */ }
  }

  function setOn(on) {
    state.sound = !!on; App.save();
    if (on) { try { ensure(); SOUNDS.on(); lastPlay = performance.now(); } catch (e) { /* ignore */ } }
    document.querySelectorAll('[data-sound]').forEach(paint);
  }
  const toggle = () => setOn(!enabled());

  function paint(btn) {
    const on = enabled();
    btn.innerHTML = App.ic(on ? 'volume' : 'mute', 18);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    const label = App.t(on ? 'soundOn' : 'soundOff');
    btn.setAttribute('aria-label', label); btn.title = label;
    btn.classList.toggle('muted', !on);
  }
  function bind(root = document) {
    root.querySelectorAll('[data-sound]').forEach((b) => { paint(b); b.onclick = (e) => { e.stopPropagation(); toggle(); }; });
  }

  // a quiet tick for any button that did not play a sound of its own
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('.btn, .nav-item, .sub, .tab, .chip, .sn, .search-btn, .choice, .ccard, .row.lesson, .mini-row, .nb-item, .entry-head, .lang');
    if (!el || el.hasAttribute('data-sound') || el.disabled) return;
    setTimeout(() => { if (performance.now() - lastPlay > 90) play('tick'); }, 0);
  });

  Object.assign(App, { sound: { play, toggle, setOn, enabled, bind, paint } });
})();
