/* App icons for the browser tab, the iPad/iPhone home screen and installed web app.
   Draws the brand mark (three pastel cells + one dashed, still-to-fill cell). Run: node tools/make-icons.js */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const OUT = path.join(__dirname, '..', 'assets', 'icons');
fs.mkdirSync(OUT, { recursive: true });

// scale = how much of the canvas the mark fills (maskable icons need a bigger safe margin)
const svg = (scale) => {
  const size = 1024, cell = 300 * scale, gap = 56 * scale, total = cell * 2 + gap, x0 = (size - total) / 2, r = 86 * scale;
  const pos = [[x0, x0], [x0 + cell + gap, x0], [x0, x0 + cell + gap], [x0 + cell + gap, x0 + cell + gap]];
  const fills = ['#BFE0FB', '#FAC3DC', '#C5EBD2'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7F1FF"/><stop offset="1" stop-color="#FFEFF6"/></linearGradient></defs>
    <rect width="${size}" height="${size}" fill="url(#bg)"/>
    ${pos.slice(0, 3).map((p, i) => `<rect x="${p[0]}" y="${p[1]}" width="${cell}" height="${cell}" rx="${r}" fill="${fills[i]}"/>`).join('')}
    <rect x="${pos[3][0] + 9}" y="${pos[3][1] + 9}" width="${cell - 18}" height="${cell - 18}" rx="${r - 6}" fill="none" stroke="#1E1B2E" stroke-width="18" stroke-dasharray="46 34" stroke-linecap="round"/>
  </svg>`;
};

(async () => {
  const jobs = [['apple-touch-icon.png', 180, 1], ['icon-192.png', 192, 1], ['icon-512.png', 512, 1], ['icon-maskable-512.png', 512, 0.78], ['favicon-32.png', 32, 1], ['favicon-64.png', 64, 1]];
  for (const [name, size, scale] of jobs) {
    await sharp(Buffer.from(svg(scale))).resize(size, size).png().toFile(path.join(OUT, name));
  }
  fs.writeFileSync(path.join(OUT, 'icon.svg'), svg(1));
  console.log('icons written:', fs.readdirSync(OUT).join(', '));
})();
