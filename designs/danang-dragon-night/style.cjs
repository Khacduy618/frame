/**
 * "Đà Nẵng · Dragon Bridge" frame style (original vector drawings).
 * Night over the Han River: golden dragon arch with LED scales, fire breath, DIFF fireworks.
 */
const { rng, text, sparkle } = require('../../generator/shapes.cjs');

const MONO = 'Menlo';
const C = {
  night0: '#0b1533',
  night1: '#1b2a5e',
  river: '#14224d',
  gold: '#f2b630',
  goldDeep: '#c98a12',
  goldLight: '#ffe08a',
  fire: '#ff7a2f',
  fireCore: '#ffd23f',
  pink: '#ff5fa2',
  cyan: '#48d1e8',
  steel: '#2c3558',
};

/** Firework burst: rays with a dot on each tip. */
function firework(cx, cy, r, color, rays = 18, seed = 1, opacity = 1) {
  const rand = rng(seed);
  let s = `<g opacity="${opacity}">`;
  for (let i = 0; i < rays; i++) {
    const a = (Math.PI * 2 * i) / rays + rand() * 0.1;
    const rr = r * (0.75 + rand() * 0.25);
    const x0 = cx + Math.cos(a) * r * 0.22;
    const y0 = cy + Math.sin(a) * r * 0.22;
    const x1 = cx + Math.cos(a) * rr;
    const y1 = cy + Math.sin(a) * rr;
    s += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${color}" stroke-width="${(r / 55).toFixed(1)}" stroke-linecap="round"/>`;
    s += `<circle cx="${(cx + Math.cos(a) * (rr + r * 0.08)).toFixed(1)}" cy="${(cy + Math.sin(a) * (rr + r * 0.08)).toFixed(1)}" r="${(r / 32).toFixed(1)}" fill="${color}"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${(r / 18).toFixed(1)}" fill="${color}"/></g>`;
}

/** Points of the dragon body: tail curl on the left, undulating arch, neck rising to the head. */
function bodyPoints(x0, x1, base, amp, halfWaves) {
  const pts = [];
  const span = x1 - x0;
  for (let x = x0; x <= x1; x += 6) {
    const t = (x - x0) / span;
    // amplitude grows toward the head, so the dragon "rises" east
    const a = amp * (0.75 + 0.35 * t);
    pts.push([x, base - a * Math.sin(Math.PI * halfWaves * t)]);
  }
  return pts;
}

const toPath = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L');

/**
 * Dragon Bridge, side view. (x0, deckY) = left end of the deck, w = deck length, s = scale.
 * Head at the right end, facing east, breathing fire.
 */
function dragonBridge(x0, deckY, w, s = 1, { fire = true } = {}) {
  const bodyX0 = x0 + 150 * s;
  const bodyX1 = x0 + w - 230 * s;
  const base = deckY - 40 * s;
  const pts = bodyPoints(bodyX0, bodyX1, base, 130 * s, 5);
  const [ex, ey] = pts[pts.length - 1];
  const tube = 30 * s;
  let g = '';

  // River reflections under the deck (LED colours)
  const r = rng(5);
  for (let i = 0; i < 46; i++) {
    const x = x0 + r() * w;
    const y = deckY + 70 * s + r() * 140 * s;
    const len = (30 + r() * 110) * s;
    const col = [C.gold, C.pink, C.cyan][i % 3];
    g += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${len.toFixed(0)}" height="${(5 * s).toFixed(1)}" rx="${(2.5 * s).toFixed(1)}" fill="${col}" opacity="${(0.25 + r() * 0.45).toFixed(2)}"/>`;
  }

  // Piers
  for (let px = x0 + 120 * s; px < x0 + w - 60 * s; px += 330 * s) {
    g += `<rect x="${(px - 14 * s).toFixed(0)}" y="${deckY}" width="${(28 * s).toFixed(0)}" height="${(150 * s).toFixed(0)}" fill="${C.steel}"/>`;
  }

  // Suspender cables from the arch to the deck (only where the arch is above the deck)
  for (let i = 0; i < pts.length; i += Math.round(7 * s) || 1) {
    const [x, y] = pts[i];
    if (y < deckY - 18 * s) g += `<line x1="${x.toFixed(1)}" y1="${(y + tube / 2).toFixed(1)}" x2="${x.toFixed(1)}" y2="${deckY}" stroke="${C.goldDeep}" stroke-width="${(3 * s).toFixed(1)}" opacity="0.8"/>`;
  }

  const body = toPath(pts);
  // Arch below the deck first (goes "behind" the deck), then the deck, then the arch again clipped above it
  g += `<path d="${body}" fill="none" stroke="${C.goldDeep}" stroke-width="${tube.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`;

  // Deck with lamp line
  g += `<rect x="${x0}" y="${deckY - 12 * s}" width="${w}" height="${(30 * s).toFixed(0)}" fill="${C.steel}"/>` +
    `<rect x="${x0}" y="${deckY - 12 * s}" width="${w}" height="${(5 * s).toFixed(1)}" fill="${C.goldLight}" opacity="0.9"/>`;
  for (let lx = x0 + 40 * s; lx < x0 + w; lx += 90 * s) g += `<circle cx="${lx.toFixed(0)}" cy="${(deckY - 20 * s).toFixed(0)}" r="${(5 * s).toFixed(1)}" fill="${C.goldLight}"/>`;

  // Upper part of the arch, drawn over the deck
  const id = `above${Math.round(x0)}_${Math.round(deckY)}`;
  g += `<clipPath id="${id}"><rect x="${x0 - 400 * s}" y="${deckY - 700 * s}" width="${w + 800 * s}" height="${700 * s - 12 * s}"/></clipPath>`;
  g += `<g clip-path="url(#${id})">` +
    `<path d="${body}" fill="none" stroke="${C.gold}" stroke-width="${tube.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    // scale texture + LED dots along the body
    `<path d="${body}" fill="none" stroke="${C.goldDeep}" stroke-width="${(tube * 0.55).toFixed(1)}" stroke-dasharray="${(14 * s).toFixed(1)} ${(10 * s).toFixed(1)}" opacity="0.55"/>` +
    `<path d="${body}" fill="none" stroke="${C.goldLight}" stroke-width="${(5 * s).toFixed(1)}" stroke-dasharray="${(2 * s).toFixed(1)} ${(22 * s).toFixed(1)}" stroke-linecap="round" transform="translate(0 ${(-8 * s).toFixed(1)})"/>` +
    // dorsal spines on the humps
    pts.filter((_, i) => i % Math.round(9 / s || 1) === 0 && i > 4).map(([x, y]) => `<path d="M${(x - 9 * s).toFixed(1)} ${(y - tube * 0.4).toFixed(1)} L${(x + 4 * s).toFixed(1)} ${(y - tube * 0.4 - 22 * s).toFixed(1)} L${(x + 11 * s).toFixed(1)} ${(y - tube * 0.4).toFixed(1)} Z" fill="${C.gold}"/>`).join('') +
    `</g>`;

  // Tail: a curl on the left (lotus-like flourish)
  const tx = bodyX0;
  const ty = base;
  g += `<path d="M${tx} ${ty} C${tx - 60 * s} ${ty + 10 * s} ${tx - 120 * s} ${ty - 40 * s} ${tx - 100 * s} ${ty - 100 * s} C${tx - 80 * s} ${ty - 150 * s} ${tx - 20 * s} ${ty - 140 * s} ${tx - 20 * s} ${ty - 100 * s} C${tx - 20 * s} ${ty - 70 * s} ${tx - 60 * s} ${ty - 70 * s} ${tx - 60 * s} ${ty - 95 * s}" fill="none" stroke="${C.gold}" stroke-width="${(tube * 0.7).toFixed(1)}" stroke-linecap="round"/>`;
  g += [[-128, -40], [-116, -112], [-58, -150]].map(([dx, dy], i) => `<path d="M${tx + dx * s} ${ty + dy * s} q${(-28 * s).toFixed(1)} ${(-10 * s).toFixed(1)} ${(-34 * s).toFixed(1)} ${(-34 * s).toFixed(1)} q${(24 * s).toFixed(1)} ${(4 * s).toFixed(1)} ${(40 * s).toFixed(1)} ${(22 * s).toFixed(1)} Z" fill="${C.gold}" transform="rotate(${-30 + i * 40} ${tx + dx * s} ${ty + dy * s})"/>`).join('');

  // Neck + head (facing right / east)
  const hx = ex + 70 * s;
  const hy = ey - 120 * s;
  g += `<path d="M${ex.toFixed(1)} ${ey.toFixed(1)} C${(ex + 30 * s).toFixed(1)} ${(ey - 50 * s).toFixed(1)} ${(hx - 50 * s).toFixed(1)} ${(hy + 40 * s).toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}" fill="none" stroke="${C.gold}" stroke-width="${tube.toFixed(1)}" stroke-linecap="round"/>`;
  g += `<g transform="translate(${hx.toFixed(1)} ${hy.toFixed(1)}) scale(${s * 1.35})">` +
    // mane flames behind the head
    `<path d="M-30 -10 L-78 -46 L-40 -30 L-64 -78 L-22 -42 L-20 -92 L2 -40 Z" fill="${C.goldDeep}"/>` +
    // horns
    `<path d="M-6 -34 C-10 -70 10 -96 34 -104 C18 -84 14 -62 16 -36 Z" fill="${C.goldLight}"/>` +
    // skull + upper jaw
    `<path d="M-34 -6 C-34 -40 0 -46 28 -36 L92 -24 C104 -22 108 -8 98 -4 L40 2 C20 4 -4 18 -34 -6 Z" fill="${C.gold}"/>` +
    // lower jaw (mouth open)
    `<path d="M-20 10 C10 20 40 20 86 30 C92 32 90 42 82 42 L30 40 C6 38 -14 30 -20 10 Z" fill="${C.goldDeep}"/>` +
    // whisker
    `<path d="M92 -16 C120 -30 132 -10 150 -26" fill="none" stroke="${C.goldLight}" stroke-width="5" stroke-linecap="round"/>` +
    // eye
    `<circle cx="22" cy="-22" r="8" fill="${C.night0}"/><circle cx="24" cy="-24" r="3" fill="${C.goldLight}"/>` +
    // teeth
    `<path d="M50 0 l6 10 l6 -10 M66 -2 l6 10 l6 -10" fill="${C.goldLight}"/>` +
    `</g>`;

  if (fire) {
    const fx = hx + 128 * s;
    const fy = hy + 22 * s;
    g += `<g transform="translate(${fx.toFixed(1)} ${fy.toFixed(1)}) scale(${s})">` +
      `<path d="M0 0 C40 -40 90 -30 120 -60 C110 -20 150 -10 170 -40 C170 10 130 40 80 36 C50 34 20 24 0 0 Z" fill="${C.fire}"/>` +
      `<path d="M4 4 C36 -16 70 -10 96 -30 C92 -4 116 4 130 -10 C122 18 92 28 62 24 C36 22 18 16 4 4 Z" fill="${C.fireCore}"/>` +
      `</g>`;
  }
  return g;
}

/** City skyline silhouette (Da Nang riverfront) along a baseline. */
function skyline(x0, baseY, w, fill, seed = 9) {
  const r = rng(seed);
  let s = '';
  let x = x0;
  while (x < x0 + w) {
    const bw = 40 + r() * 90;
    const bh = 60 + r() * 220;
    s += `<rect x="${x.toFixed(0)}" y="${(baseY - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="${fill}"/>`;
    // lit windows
    for (let wy = baseY - bh + 18; wy < baseY - 14; wy += 26) {
      for (let wx = x + 10; wx < x + bw - 12; wx += 20) if (r() > 0.62) s += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="8" height="10" fill="${C.goldLight}" opacity="0.55"/>`;
    }
    x += bw + 6;
  }
  return s;
}

const frameRect = ([x, y, w, h], pad, stroke, sw) =>
  `<rect x="${x - pad}" y="${y - pad}" width="${w + pad * 2}" height="${h + pad * 2}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>`;

/** Small corner ornaments (Lý-dynasty-style cloud curl, simplified) at each photo corner. */
function cornerCurls([x, y, w, h], pad, color) {
  const curl = (cx, cy, sx, sy) =>
    `<path transform="translate(${cx} ${cy}) scale(${sx} ${sy})" d="M0 0 L34 0 M0 0 L0 34 M12 12 C24 12 27 23 19 26 C13 27 12 21 16 19" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`;
  const l = x - pad;
  const t = y - pad;
  const rgt = x + w + pad;
  const b = y + h + pad;
  return curl(l, t, 1, 1) + curl(rgt, t, -1, 1) + curl(l, b, 1, -1) + curl(rgt, b, -1, -1);
}

const style = {
  id: 'danang-dragon-bridge',
  name: 'Đà Nẵng Dragon Bridge',
  description: 'Night over the Han River: golden Dragon Bridge breathing fire, LED reflections and fireworks.',
  logo: 'white',
  cut: C.gold,
  background: (w, h) => {
    const r = rng(42);
    let s = `<defs><linearGradient id="dnNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.night0}"/><stop offset="0.75" stop-color="${C.night1}"/><stop offset="1" stop-color="${C.river}"/></linearGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="url(#dnNight)"/>`;
    for (let i = 0; i < 360; i++) s += `<circle cx="${(r() * w).toFixed(0)}" cy="${(r() * h * 0.85).toFixed(0)}" r="${(1 + r() * 2.6).toFixed(1)}" fill="${C.goldLight}" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`;
    // DIFF fireworks: big bursts behind the photos peek out in the margins and gaps
    s += firework(130, 210, 260, C.pink, 22, 3, 0.55) + firework(w - 120, 180, 230, C.cyan, 20, 4, 0.55) +
      firework(80, 1580, 200, C.gold, 18, 6, 0.5) + firework(w - 70, 1500, 220, C.pink, 18, 7, 0.5);
    for (let i = 0; i < 16; i++) s += sparkle(r() * w, r() * h * 0.8, 10 + r() * 12, C.gold);
    return s;
  },
  opening: (o) => frameRect(o, 12, C.gold, 7) + cornerCurls(o, 12, C.goldLight),
  footer: (ctx) => {
    const { area } = ctx;
    // Sheet footer: text row on top, Dragon Bridge across the bottom (stops left of the QR area)
    let s = '';
    s += firework(area.x + 1860, area.y + 150, 105, C.pink, 18, 11) + firework(area.x + 1620, area.y + 80, 62, C.cyan, 14, 12) + firework(area.x + 2080, area.y + 60, 52, C.gold, 14, 13);
    s += skyline(area.x - 80, area.y + 540, 1990, '#1a2856');
    s += dragonBridge(area.x - 60, area.y + 455, 1780, 1);
    s += text(area.x + 30, area.y + 150, 'Đà Nẵng', { size: 150, family: 'Georgia', style: 'italic', weight: 'bold', fill: C.gold });
    s += text(area.x + 36, area.y + 222, 'DRAGON BRIDGE  ·  HAN RIVER', { size: 40, family: MONO, fill: C.goldLight, spacing: 8 });
    s += ctx.logo(area.x + 1010, area.y + 40, 360);
    return s;
  },
};

module.exports = { style, dragonBridge, firework, skyline, C };
