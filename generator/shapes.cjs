/** Small SVG helpers shared by the frame styles (all original drawings). */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Deterministic random numbers, so every run (and both strip copies) draw the same picture. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const text = (x, y, str, { size = 48, family = 'Georgia', weight = 'normal', style = 'normal', fill = '#1c1c1c', anchor = 'start', spacing = 0, rotate = 0, opacity = 1 } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-family="${family}" font-weight="${weight}" font-style="${style}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}" opacity="${opacity}"${rotate ? ` transform="rotate(${rotate} ${x} ${y})"` : ''}>${esc(str)}</text>`;

const heart = (x, y, s, fill, stroke = 'none', sw = 0) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -12 C-6 -26 -30 -22 -28 -4 C-26 10 -8 20 0 30 C8 20 26 10 28 -4 C30 -22 6 -26 0 -12 Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

const star = (x, y, r, fill, inner = 0.45, stroke = 'none', sw = 0) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * inner : r;
    return `${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
};

/** Four-point sparkle. */
const sparkle = (x, y, r, fill) =>
  `<path d="M${x} ${y - r} Q${x + r * 0.16} ${y - r * 0.16} ${x + r} ${y} Q${x + r * 0.16} ${y + r * 0.16} ${x} ${y + r} Q${x - r * 0.16} ${y + r * 0.16} ${x - r} ${y} Q${x - r * 0.16} ${y - r * 0.16} ${x} ${y - r} Z" fill="${fill}"/>`;

const bow = (x, y, s, fill, stroke = 'none') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C-30 -30 -62 -20 -58 6 C-54 30 -22 18 0 0 Z M0 0 C30 -30 62 -20 58 6 C54 30 22 18 0 0 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>` +
  `<path d="M-6 4 L-24 44 L-10 40 L-4 52 L2 8 Z M6 4 L24 44 L10 40 L4 52 L-2 8 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/><circle r="9" fill="${fill}" stroke="${stroke}" stroke-width="3"/></g>`;

const cherry = (x, y, s) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 Q-4 -40 10 -52 M14 4 Q12 -30 10 -52" stroke="#3f7d3a" stroke-width="5" fill="none"/>` +
  `<path d="M10 -52 Q34 -66 46 -48 Q28 -40 10 -52 Z" fill="#5aa04f"/>` +
  `<circle cx="-16" cy="12" r="18" fill="#d6224a"/><circle cx="18" cy="16" r="18" fill="#e33a5e"/>` +
  `<circle cx="-22" cy="6" r="5" fill="#ffb3c2"/><circle cx="12" cy="10" r="5" fill="#ffb3c2"/></g>`;

const moon = (x, y, r, fill, bg) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/><circle cx="${x + r * 0.42}" cy="${y - r * 0.18}" r="${r * 0.86}" fill="${bg}"/>`;

/** Scalloped (lace-like) band along a horizontal line, bumps facing up or down. */
function scallops(x, y, w, r, fill, dir = 1, holes = null) {
  let s = '';
  for (let cx = x + r; cx < x + w + r; cx += r * 2) {
    s += `<circle cx="${cx}" cy="${y}" r="${r}" fill="${fill}"/>`;
    if (holes) s += `<circle cx="${cx}" cy="${y + dir * r * 0.25}" r="${r * 0.32}" fill="${holes}"/>`;
  }
  return s;
}

/** Barcode block (for the magazine style). */
function barcode(x, y, w, h, fill, seed = 7) {
  const rand = rng(seed);
  let s = '';
  let cx = x;
  while (cx < x + w) {
    const bw = 3 + Math.floor(rand() * 9);
    if (rand() > 0.35) s += `<rect x="${cx}" y="${y}" width="${bw}" height="${h}" fill="${fill}"/>`;
    cx += bw + 3;
  }
  return s;
}

module.exports = { esc, rng, text, heart, star, sparkle, bow, cherry, moon, scallops, barcode };

// ---- Instagram-style UI icons (drawn here, simplified) ----
const igHeart = (x, y, s, fill = 'none', stroke = '#fff') =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 8 C-4 -2 -20 -2 -20 10 C-20 20 -8 28 0 34 C8 28 20 20 20 10 C20 -2 4 -2 0 8 Z" fill="${fill}" stroke="${stroke}" stroke-width="${3 / s}" stroke-linejoin="round"/>`;
const igComment = (x, y, s, stroke = '#fff') =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${stroke}" stroke-width="${3 / s}" stroke-linejoin="round"><path d="M18 30 A18 18 0 1 1 30 22 L33 33 Z"/></g>`;
const igSend = (x, y, s, stroke = '#fff') =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${stroke}" stroke-width="${3 / s}" stroke-linejoin="round"><path d="M0 0 L34 0 L14 34 L12 14 Z M12 14 L34 0"/></g>`;
const igBookmark = (x, y, s, stroke = '#fff') =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 0 H26 V36 L13 26 L0 36 Z" fill="none" stroke="${stroke}" stroke-width="${3 / s}" stroke-linejoin="round"/>`;
const igVerified = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3897f0"/><path d="M${x - r * 0.45} ${y} L${x - r * 0.1} ${y + r * 0.35} L${x + r * 0.5} ${y - r * 0.35}" fill="none" stroke="#fff" stroke-width="${r * 0.28}" stroke-linecap="round" stroke-linejoin="round"/>`;
/** Avatar with the Instagram story ring (gradient id must be defined by the caller: igRing). */
const igAvatar = (x, y, r, inner, ring = 'url(#igRing)', gap = '#0f0f0f') =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${ring}"/><circle cx="${x}" cy="${y}" r="${r * 0.86}" fill="${gap}"/><circle cx="${x}" cy="${y}" r="${r * 0.74}" fill="${inner}"/>`;
const igRingDefs = `<defs><linearGradient id="igRing" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset="0.35" stop-color="#fa7e1e"/><stop offset="0.65" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs>`;

module.exports.igHeart = igHeart;
module.exports.igComment = igComment;
module.exports.igSend = igSend;
module.exports.igBookmark = igBookmark;
module.exports.igVerified = igVerified;
module.exports.igAvatar = igAvatar;
module.exports.igRingDefs = igRingDefs;
