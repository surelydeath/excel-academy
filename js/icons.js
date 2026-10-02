/* Small hand-picked icon set (stroke icons, 24px grid) + a few drawn marks.
   Icon('check') returns an inline SVG that inherits the text colour.        */
const Icons = (() => {
  const P = {
    check: '<path d="M20 6 9 17l-5-5"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-1.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98 1.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    grid: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
  };

  const icon = (name, size = 20) =>
    `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;

  // Brand mark: a tiny sheet whose cells are filled in pastel
  const mark = (size = 30) => `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true">
    <rect x="2" y="2" width="12" height="12" rx="3.5" fill="#BFE0FB"/><rect x="18" y="2" width="12" height="12" rx="3.5" fill="#FAC3DC"/>
    <rect x="2" y="18" width="12" height="12" rx="3.5" fill="#C5EBD2"/><rect x="18" y="18" width="12" height="12" rx="3.5" fill="none" stroke="#1E1B2E" stroke-width="1.6" stroke-dasharray="3 3"/></svg>`;

  // Level mark: a seed that grows petals as the learner levels up (index 0 = seed)
  const PETALS = ['#FAC3DC', '#BFE0FB', '#FBEAA8', '#C5EBD2', '#DCCBFA', '#FDD5B8', '#FAC3DC'];
  const flower = (level, size = 56) => {
    if (level <= 0) return `<svg class="flower" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="7" fill="#C5EBD2"/><circle cx="24" cy="24" r="2.4" fill="#1E1B2E" opacity=".55"/></svg>`;
    const n = level + 2;
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      s += `<circle cx="${(24 + Math.cos(a) * 11.5).toFixed(2)}" cy="${(24 + Math.sin(a) * 11.5).toFixed(2)}" r="8.5" fill="${PETALS[i % PETALS.length]}" opacity=".92"/>`;
    }
    return `<svg class="flower" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">${s}<circle cx="24" cy="24" r="5.5" fill="#FBEAA8"/><circle cx="24" cy="24" r="1.8" fill="#1E1B2E" opacity=".5"/></svg>`;
  };

  return { icon, mark, flower };
})();
