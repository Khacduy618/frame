/**
 * Đà Nẵng flat-vector travel-poster frame (MEMORIES). Original drawings only.
 * Renders a full page PNG; frame-tool finalize punches the openings and validates.
 */
const fs = require('fs');
const path = require('path');
const { sharp, layout, logoPath, outDir } = require('../../lib/kit.cjs');
const { finalize } = require('../../lib/run.cjs');
const { W, H, PRODUCTS } = layout;

const P = {
  skyTop: '#F7845E',
  skyMid: '#FDA772',
  skyLow: '#FFCB8E',
  sun: '#FFE3A1',
  sunRay: '#FFD98C',
  cloud: '#FFF0DA',
  cloudShade: '#FBD9B5',
  navy: '#1D3557',
  marbleFar: '#E98A6B',
  marbleNear: '#D9705A',
  sonTraFar: '#5DA59A',
  sonTraNear: '#3E8A80',
  city: '#2F7D86',
  cityLit: '#FFD27A',
  river: '#1F8A8C',
  riverDeep: '#17616E',
  wave: '#7FD1C2',
  gold: '#F5B301',
  goldDark: '#D38B00',
  goldLight: '#FFD866',
  red: '#D63A2F',
  fire: '#F77F00',
  fireCore: '#FFC93C',
  palm: '#2D6A4F',
  palmLight: '#40916C',
  trunk: '#8C5A3C',
  boat: '#5B3A29',
  boatRim: '#9A6A45',
  statue: '#F6E3C4',
};

const f = (n) => (Math.round(n * 10) / 10).toString();
let uid = 0;

function sky() {
  return `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${P.skyTop}"/><stop offset="0.45" stop-color="${P.skyMid}"/><stop offset="0.86" stop-color="${P.skyLow}"/><stop offset="1" stop-color="${P.skyLow}"/></linearGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
}

/** Flat sun with alternating ray wedges. */
function sun(cx, cy, r) {
  let s = '';
  const n = 24;
  for (let i = 0; i < n; i += 2) {
    const a0 = (Math.PI * 2 * (i + 0.5)) / n, a1 = (Math.PI * 2 * (i + 1.5)) / n, R = 2600;
    s += `<path d="M${cx} ${cy} L${f(cx + Math.cos(a0) * R)} ${f(cy + Math.sin(a0) * R)} L${f(cx + Math.cos(a1) * R)} ${f(cy + Math.sin(a1) * R)} Z" fill="${P.sunRay}" opacity="0.28"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${r * 1.25}" fill="${P.sun}" opacity="0.45"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${P.sun}"/>`;
}

/** Flat cloud: bumps on a flat base, with a shade strip. */
function cloud(x, y, s) {
  const bumps = [[0, 0, 60], [70, -40, 80], [160, -10, 65], [230, 10, 45]];
  let c = `<g transform="translate(${x} ${y}) scale(${s})">`;
  c += `<rect x="-50" y="10" width="330" height="55" rx="27" fill="${P.cloudShade}"/>`;
  for (const [bx, by, r] of bumps) c += `<circle cx="${bx}" cy="${by}" r="${r}" fill="${P.cloud}"/>`;
  c += `<rect x="-50" y="0" width="330" height="50" rx="25" fill="${P.cloud}"/></g>`;
  return c;
}

const bird = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-30 0 C-20 -14 -8 -14 0 0 C8 -14 20 -14 30 0 C20 -8 8 -6 0 6 C-8 -6 -20 -8 -30 0 Z" fill="${P.navy}"/>`;

/** Marble Mountains: limestone karsts with a small pagoda. */
function marbleMountains(x, base) {
  const k = (cx, w, h, col) => `<path d="M${cx - w / 2} ${base} C${cx - w / 2} ${base - h * 0.6} ${cx - w * 0.3} ${base - h} ${cx} ${base - h} C${cx + w * 0.3} ${base - h} ${cx + w / 2} ${base - h * 0.6} ${cx + w / 2} ${base} Z" fill="${col}"/>`;
  let s = k(x + 100, 200, 160, P.marbleFar) + k(x + 270, 230, 215, P.marbleFar) + k(x + 430, 170, 140, P.marbleFar);
  s += k(x + 190, 180, 115, P.marbleNear) + k(x + 360, 160, 95, P.marbleNear);
  // pagoda on the tallest peak
  const px = x + 270, py = base - 205;
  s += `<g fill="${P.navy}"><rect x="${px - 6}" y="${py - 70}" width="12" height="16"/>` +
    [0, 1, 2].map((i) => `<path d="M${px - 34 + i * 8} ${py - 12 - i * 20} L${px + 34 - i * 8} ${py - 12 - i * 20} L${px + 22 - i * 8} ${py - 26 - i * 20} L${px - 22 + i * 8} ${py - 26 - i * 20} Z"/><rect x="${px - 14 + i * 4}" y="${py - 12 - i * 20}" width="${28 - i * 8}" height="12"/>`).join('') + `</g>`;
  return s;
}

/** Son Tra peninsula ridge with the Lady Buddha statue (cream, small). */
function sonTra(x0, x1, base) {
  const far = `<path d="M${x0} ${base} C${x0 + 200} ${base - 120} ${x0 + 380} ${base - 230} ${x0 + 560} ${base - 210} C${x0 + 700} ${base - 195} ${x0 + 780} ${base - 260} ${x0 + 900} ${base - 250} C${x1 - 200} ${base - 230} ${x1 - 80} ${base - 120} ${x1} ${base - 90} L${x1} ${base} Z" fill="${P.sonTraFar}"/>`;
  const near = `<path d="M${x0 + 150} ${base} C${x0 + 320} ${base - 80} ${x0 + 480} ${base - 140} ${x0 + 650} ${base - 120} C${x0 + 800} ${base - 105} ${x1 - 150} ${base - 60} ${x1} ${base - 40} L${x1} ${base} Z" fill="${P.sonTraNear}"/>`;
  // statue: lotus base + robe silhouette
  const sx = x0 + 905, sy = base - 248;
  const statue = `<g fill="${P.statue}"><path d="M${sx - 26} ${sy + 2} C${sx - 20} ${sy - 10} ${sx + 20} ${sy - 10} ${sx + 26} ${sy + 2} Z"/>` +
    `<path d="M${sx - 14} ${sy - 6} C${sx - 18} ${sy - 50} ${sx - 12} ${sy - 80} ${sx} ${sy - 86} C${sx + 12} ${sy - 80} ${sx + 18} ${sy - 50} ${sx + 14} ${sy - 6} Z"/>` +
    `<circle cx="${sx}" cy="${sy - 94}" r="10"/><circle cx="${sx}" cy="${sy - 94}" r="17" fill="none" stroke="${P.statue}" stroke-width="3" opacity="0.7"/></g>`;
  return far + statue + near;
}

/** Flat city skyline with lit windows. */
function city(x0, x1, base) {
  const blocks = [[0, 90, 120], [95, 70, 190], [170, 110, 150], [285, 60, 240], [350, 120, 110], [475, 80, 210], [560, 100, 160],
    [665, 70, 260], [740, 130, 130], [875, 90, 200], [970, 60, 150], [1035, 110, 230], [1150, 80, 170], [1235, 120, 120], [1360, 70, 210], [1435, 100, 150], [1540, 90, 190]];
  let s = '';
  for (let [dx, w, h] of blocks) {
    const x = x0 + dx;
    if (x > x1) break;
    h = Math.round(h * 0.62);
    s += `<rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${P.city}"/>`;
    if (h > 130) s += `<rect x="${x + w / 2 - 3}" y="${base - h - 34}" width="6" height="34" fill="${P.city}"/>`;
    for (let wy = base - h + 22; wy < base - 20; wy += 30) for (let wx = x + 12; wx < x + w - 14; wx += 22) if ((wx * 7 + wy * 3) % 5 < 2) s += `<rect x="${wx}" y="${wy}" width="9" height="12" fill="${P.cityLit}" opacity="0.8"/>`;
  }
  return s;
}

function river(y) {
  let s = `<defs><linearGradient id="riv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.river}"/><stop offset="1" stop-color="${P.riverDeep}"/></linearGradient></defs>` +
    `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="url(#riv)"/>`;
  // sun glitter + wave dashes
  const rows = [[y + 40, 0.55], [y + 90, 0.45], [y + 150, 0.4], [y + 220, 0.35], [y + 300, 0.3], [y + 380, 0.25]];
  rows.forEach(([ry, op], i) => {
    for (let x = (i % 2) * 90 - 40; x < W; x += 210) s += `<rect x="${x}" y="${ry}" width="${110 - i * 6}" height="8" rx="4" fill="${P.wave}" opacity="${op}"/>`;
  });
  return s;
}

/** Basket boat (thúng chai) with a rower. */
function basketBoat(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">` +
    `<path d="M-70 0 C-66 40 66 40 70 0 Z" fill="${P.boat}"/><rect x="-74" y="-8" width="148" height="12" rx="6" fill="${P.boatRim}"/>` +
    `<path d="M-60 12 C-30 22 30 22 60 12" fill="none" stroke="${P.boatRim}" stroke-width="4"/>` +
    // rower
    `<rect x="-10" y="-58" width="20" height="50" rx="8" fill="${P.navy}"/><circle cx="0" cy="-70" r="12" fill="${P.navy}"/>` +
    `<path d="M-38 -78 L0 -92 L38 -78 Z" fill="${P.goldLight}"/>` + // nón lá
    `<line x1="8" y1="-40" x2="70" y2="30" stroke="${P.boatRim}" stroke-width="6" stroke-linecap="round"/></g>`;
}

/** Palm tree, fronds radiating from the crown. dir 1 = leans right. */
function palm(x, baseY, height, dir = 1, scale = 1) {
  const cx = x + dir * 90 * scale, cy = baseY - height;
  let s = `<path d="M${x - 16 * scale} ${baseY} C${x - 10 * scale} ${baseY - height * 0.5} ${cx - dir * 40 * scale} ${cy + 80 * scale} ${cx - 8 * scale} ${cy} L${cx + 8 * scale} ${cy} C${cx - dir * 20 * scale} ${cy + 90 * scale} ${x + 14 * scale} ${baseY - height * 0.5} ${x + 18 * scale} ${baseY} Z" fill="${P.trunk}"/>`;
  const fronds = [-170, -140, -110, -70, -40, -10, 20];
  fronds.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180, len = (230 + (i % 3) * 30) * scale;
    const ex = cx + Math.cos(a) * len, ey = cy + Math.sin(a) * len + 60 * scale;
    const mx = cx + Math.cos(a) * len * 0.5, my = cy + Math.sin(a) * len * 0.5 - 40 * scale;
    const nx = -Math.sin(a) * 34 * scale, ny = Math.cos(a) * 34 * scale;
    s += `<path d="M${f(cx)} ${f(cy)} Q${f(mx + nx)} ${f(my + ny)} ${f(ex)} ${f(ey)} Q${f(mx - nx * 0.3)} ${f(my - ny * 0.3)} ${f(cx)} ${f(cy)} Z" fill="${i % 2 ? P.palm : P.palmLight}"/>`;
  });
  return s + `<circle cx="${f(cx)}" cy="${f(cy + 10 * scale)}" r="${14 * scale}" fill="${P.trunk}"/>`;
}

/** Dragon Bridge, flat style, side view; head at the right (east). */
function dragonBridge(x0, x1, deckY) {
  const id = `db${uid++}`;
  const bx0 = x0 + 170, bx1 = x1 - 250;
  const amp = 118, base = deckY - 22, waves = 5;
  const pts = [];
  for (let x = bx0; x <= bx1; x += 5) {
    const t = (x - bx0) / (bx1 - bx0);
    pts.push([x, base - amp * (0.8 + 0.3 * t) * Math.sin(Math.PI * waves * t)]);
  }
  const d = 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L');
  const tube = 34;
  let s = '';
  // piers
  for (let px = x0 + 140; px < x1 - 80; px += 300) s += `<rect x="${px - 16}" y="${deckY}" width="32" height="150" fill="${P.navy}" opacity="0.9"/>`;
  // reflection of the dragon on the water
  // arch part under the deck (darker), deck, then arch above the deck
  s += `<path d="${d}" fill="none" stroke="${P.goldDark}" stroke-width="${tube}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // suspenders
  for (let i = 0; i < pts.length; i += 9) {
    const [x, y] = pts[i];
    if (y < deckY - 30) s += `<rect x="${f(x - 2)}" y="${f(y)}" width="4" height="${f(deckY - y)}" fill="${P.navy}" opacity="0.55"/>`;
  }
  s += `<rect x="${x0}" y="${deckY - 14}" width="${x1 - x0}" height="34" fill="${P.navy}"/><rect x="${x0}" y="${deckY - 14}" width="${x1 - x0}" height="8" fill="${P.red}"/>`;
  for (let lx = x0 + 30; lx < x1; lx += 80) s += `<rect x="${lx}" y="${deckY - 34}" width="6" height="22" fill="${P.navy}"/><circle cx="${lx + 3}" cy="${deckY - 38}" r="7" fill="${P.goldLight}"/>`;
  s += `<clipPath id="${id}"><rect x="0" y="0" width="${W}" height="${deckY - 14}"/></clipPath><g clip-path="url(#${id})">` +
    `<path d="${d}" fill="none" stroke="${P.gold}" stroke-width="${tube}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${P.goldLight}" stroke-width="8" transform="translate(0 9)" stroke-linecap="round"/>` +
    `<path d="${d}" fill="none" stroke="${P.goldDark}" stroke-width="12" stroke-dasharray="3 16" transform="translate(0 -6)" stroke-linecap="round"/>` +
    pts.filter((_, i) => i % 7 === 3).map(([x, y]) => `<path d="M${f(x - 10)} ${f(y - 14)} L${f(x + 2)} ${f(y - 40)} L${f(x + 12)} ${f(y - 14)} Z" fill="${P.red}"/>`).join('') +
    `</g>`;

  // tail: curl + fin
  const [tx, ty] = pts[0];
  s += `<path d="M${tx} ${ty} C${tx - 70} ${ty + 6} ${tx - 130} ${ty - 50} ${tx - 104} ${ty - 110} C${tx - 82} ${ty - 160} ${tx - 18} ${ty - 150} ${tx - 18} ${ty - 106} C${tx - 18} ${ty - 76} ${tx - 58} ${ty - 76} ${tx - 58} ${ty - 102}" fill="none" stroke="${P.gold}" stroke-width="26" stroke-linecap="round"/>`;
  s += `<path d="M${tx - 120} ${ty - 70} C${tx - 170} ${ty - 70} ${tx - 190} ${ty - 120} ${tx - 170} ${ty - 150} C${tx - 150} ${ty - 120} ${tx - 130} ${ty - 110} ${tx - 112} ${ty - 112} Z" fill="${P.red}"/>`;

  // neck + head
  const [ex, ey] = pts[pts.length - 1];
  const hx = ex + 80, hy = ey - 120;
  s += `<path d="M${f(ex)} ${f(ey)} C${f(ex + 40)} ${f(ey - 60)} ${f(hx - 70)} ${f(hy + 70)} ${f(hx)} ${f(hy)}" fill="none" stroke="${P.gold}" stroke-width="${tube}" stroke-linecap="round"/>`;
  s += `<g transform="translate(${f(hx)} ${f(hy)}) scale(1.4)">` +
    // mane
    `<path d="M-26 6 C-60 -4 -78 -30 -70 -58 C-56 -40 -44 -36 -34 -38 C-44 -60 -36 -84 -16 -96 C-14 -72 -4 -58 8 -52 Z" fill="${P.red}"/>` +
    // horn
    `<path d="M2 -40 C0 -70 16 -92 40 -100 C28 -80 26 -60 28 -38 Z" fill="${P.goldLight}"/>` +
    // head
    `<path d="M-30 0 C-34 -34 -6 -48 24 -42 L84 -30 C100 -27 106 -14 96 -8 L84 -4 L40 2 C20 6 -6 20 -30 0 Z" fill="${P.gold}"/>` +
    `<path d="M24 -42 L84 -30 C96 -28 100 -20 98 -16 L30 -26 Z" fill="${P.goldLight}"/>` +
    // lower jaw
    `<path d="M-16 12 C10 22 40 22 84 30 C92 32 90 42 80 42 L30 40 C6 38 -12 30 -16 12 Z" fill="${P.goldDark}"/>` +
    // eye + brow
    `<circle cx="26" cy="-24" r="8" fill="${P.navy}"/><circle cx="28" cy="-26" r="3" fill="${P.goldLight}"/>` +
    `<path d="M12 -36 C22 -44 38 -42 44 -34" fill="none" stroke="${P.red}" stroke-width="6" stroke-linecap="round"/>` +
    // whiskers
    `<path d="M90 -20 C118 -36 130 -12 152 -30" fill="none" stroke="${P.red}" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M80 38 C100 56 120 50 134 62" fill="none" stroke="${P.red}" stroke-width="5" stroke-linecap="round"/>` +
    // teeth
    `<path d="M50 -2 l6 10 l6 -10 Z M66 -4 l6 10 l6 -10 Z" fill="${P.goldLight}"/>` +
    `</g>`;
  // fire breath
  const fx = hx + 136, fy = hy + 16;
  s += `<g transform="translate(${f(fx)} ${f(fy)})">` +
    `<path d="M0 0 C40 -44 90 -36 120 -66 C112 -24 150 -14 172 -46 C176 6 136 44 84 40 C52 38 22 26 0 0 Z" fill="${P.red}"/>` +
    `<path d="M4 2 C36 -22 70 -16 98 -38 C94 -10 118 -2 134 -18 C128 14 98 28 66 26 C40 24 20 18 4 2 Z" fill="${P.fire}"/>` +
    `<path d="M8 4 C30 -8 52 -6 70 -16 C70 0 84 6 92 0 C86 16 66 20 48 18 C30 16 18 12 8 4 Z" fill="${P.fireCore}"/>` +
    `</g>`;
  return s;
}

function render() {
  const p = PRODUCTS.memories;
  const deckY = 3420;
  let s = sky();
  s += sun(1252, 215, 230);
  // clouds peeking at margins and photo corners
  s += cloud(-60, 300, 1.1) + cloud(2230, 230, 1.0) + cloud(-90, 1560, 1.25) + cloud(2250, 1600, 1.15) + cloud(1110, 1560, 0.75) + cloud(2150, 2860, 0.8);
  s += bird(560, 180, 1.2) + bird(660, 150, 0.9) + bird(1850, 170, 1.1) + bird(1100, 1580, 0.8) + bird(170, 2940, 0.9);
  // opening frames: navy with a thin gold inner line
  for (const [x, y, w, h] of p.openings) {
    s += `<rect x="${x - 22}" y="${y - 22}" width="${w + 44}" height="${h + 44}" fill="${P.navy}"/>`;
    s += `<rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" fill="none" stroke="${P.goldLight}" stroke-width="4"/>`;
  }
  // landscape (footer)
  s += sonTra(1350, W, deckY + 5) + city(560, 1520, deckY + 5) + marbleMountains(60, deckY + 5);
  s += river(deckY + 5);
  s += dragonBridge(150, 1900, deckY);
  s += basketBoat(560, 3530, 0.85) + basketBoat(1420, 3565, 0.7);
  s += palm(40, H, 1150, 1, 1.0) + palm(2470, 3240, 420, -1, 0.75);
  // title + caption
  s += `<text x="300" y="3068" font-family="Futura" font-weight="bold" font-size="140" fill="${P.navy}" letter-spacing="6">ĐÀ NẴNG</text>`;
  s += `<text x="306" y="3124" font-family="Menlo" font-size="34" fill="${P.navy}" letter-spacing="9">DRAGON BRIDGE · HAN RIVER</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${s}</svg>`;
}

(async () => {
  const dir = outDir('danang-vector-sunset');
  const out = path.join(dir, 'raw.png');
  const svg = render();
  fs.writeFileSync(out.replace(/\.png$/, '.svg'), svg);
  const logo = await sharp(logoPath()).resize({ width: 300 }).png().toBuffer();
  await sharp(Buffer.from(svg)).composite([{ input: logo, left: 1190, top: 2956 }]).png().toFile(out);
  finalize(out, 'memories', path.join(dir, PRODUCTS.memories.file), 'danang-vector-sunset');
  fs.rmSync(out, { force: true });
  fs.rmSync(out.replace(/\.png$/, '.svg'), { force: true });
})().catch((e) => { console.error(e); process.exit(1); });
