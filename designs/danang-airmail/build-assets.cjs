/**
 * Airmail-letter assets for YOU & ME (strip). Everything is drawn for the LEFT strip tile;
 * frame-tool finalize copies it +1181 px. Airmail bands sit at x 0–142 and x 1181–1323 so both
 * strips end up with a band on each side.
 *   node build-assets.cjs <outDir>
 */
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { sharp, layout } = require('../../lib/kit.cjs');
const { sticker } = require('../../lib/run.cjs');
const { asset } = require('../theme-assets.cjs');
const { miQuang } = require('../danang-food/stickers.cjs');
const { W, H, PRODUCTS } = layout;

const out = process.argv[2];
fs.mkdirSync(path.join(out, 'stickers'), { recursive: true });
const C = { paper: '#F1E6D2', mat: '#FBF2E1', red: '#C8402F', navy: '#2C4A7A', ink: '#2B3A55', rule: '#CDB896', stamp: '#A8402F', mustard: '#E8B84A' };
const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}">${body}</svg>`);

/** Perforated stamp edge as a mask: white body, black bite circles along every edge. */
function perfMask(id, x, y, w, h, r = 9, step = 26) {
  let bites = '';
  for (let cx = x; cx <= x + w; cx += step) bites += `<circle cx="${cx}" cy="${y}" r="${r}"/><circle cx="${cx}" cy="${y + h}" r="${r}"/>`;
  for (let cy = y; cy <= y + h; cy += step) bites += `<circle cx="${x}" cy="${cy}" r="${r}"/><circle cx="${x + w}" cy="${cy}" r="${r}"/>`;
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/><g fill="#000">${bites}</g></mask>`;
}

async function background() {
  const p = PRODUCTS.youAndMe;
  let defs = `<pattern id="air" width="150" height="150" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">` +
    `<rect width="150" height="150" fill="${C.paper}"/><rect x="0" y="0" width="150" height="42" fill="${C.red}"/><rect x="0" y="75" width="150" height="42" fill="${C.navy}"/></pattern>` +
    `<filter id="sh" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="7"/></filter>`;
  let body = '';
  // airmail bands (left band incl. bleed, and the band the right copy needs)
  for (const [x0, x1] of [[0, 142], [1181, 1323]]) body += `<rect x="${x0}" y="0" width="${x1 - x0}" height="${H}" fill="url(#air)"/>`;
  // stamp-perforated mats behind the openings
  p.openings.forEach(([x, y, w, h], i) => {
    const pad = 22, mx = x - pad, my = y - pad, mw = w + pad * 2, mh = h + pad * 2;
    defs += perfMask(`m${i}`, mx, my, mw, mh);
    body += `<rect x="${mx + 5}" y="${my + 10}" width="${mw}" height="${mh}" fill="#6B5232" opacity="0.28" filter="url(#sh)" mask="url(#m${i})"/>`;
    body += `<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" fill="${C.mat}" mask="url(#m${i})"/>`;
    body += `<rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" fill="none" stroke="${C.red}" stroke-width="3"/>`;
  });
  // envelope ruled lines in the footer
  for (const y of [3262, 3317, 3372]) body += `<rect x="184" y="${y}" width="676" height="2" fill="${C.rule}"/>`;
  const paper = path.join(out, 'paper.png');
  execFileSync(process.execPath, [path.join(__dirname, '../danang-food/paper.cjs'), paper], { stdio: 'inherit' });
  await sharp(paper).composite([{ input: svg(W, H, `<defs>${defs}</defs>${body}`) }]).png().toFile(path.join(out, 'bg.png'));
}

/** Round postmark (ring text set glyph by glyph) + wavy cancellation lines to the LEFT. */
async function postmark() {
  const w = 340, h = 190, r = 84, cx = w - 95, cy = 95, R = r - 21;
  let s = `<g fill="none" stroke="${C.stamp}"><circle cx="${cx}" cy="${cy}" r="${r}" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="${r - 40}" stroke-width="3"/></g>`;
  const ring = 'DA NANG, VIETNAM · DA NANG, VIETNAM · ';
  const step = (2 * Math.PI) / ring.length;
  [...ring].forEach((ch, i) => {
    const a = -Math.PI / 2 + i * step;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    if (ch.trim()) s += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="American Typewriter" font-weight="bold" font-size="17" fill="${C.stamp}" text-anchor="middle" dominant-baseline="central" transform="rotate(${((a * 180) / Math.PI + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})">${ch}</text>`;
  });
  s += `<g transform="translate(${cx - 22} ${cy - 14}) rotate(-12)"><path d="M0 0 L44 14 L0 28 L9 14 Z" fill="${C.stamp}"/></g>`;
  for (let i = 0; i < 3; i++) s += `<path d="M10 ${62 + i * 32} c22 -14 44 -14 66 0 s44 14 66 0 s22 -10 ${cx - r - 152} -4" fill="none" stroke="${C.stamp}" stroke-width="5" stroke-linecap="round"/>`;
  await sharp(svg(w, h, s)).rotate(-6, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(out, 'stickers', 'postmark.png'));
}

/** Vector stamp: perforated paper, mustard field, Mì Quảng illustration. */
async function stampMiQuang() {
  const w = 230, h = 280, pad = 14;
  const art = miQuang();
  const inner = `<svg x="${pad + 14}" y="${pad + 30}" width="${w - 2 * pad - 28}" height="${h - 2 * pad - 70}" viewBox="0 0 ${art.vb[0]} ${art.vb[1]}">${art.svg}</svg>`;
  let s = `<defs>${perfMask('pm', 8, 8, w - 16, h - 16, 7, 20).replace(`width="${W}" height="${H}"`, `width="${w}" height="${h}"`)}</defs>`;
  s += `<rect x="8" y="8" width="${w - 16}" height="${h - 16}" fill="${C.mat}" mask="url(#pm)"/>`;
  s += `<rect x="${pad + 6}" y="${pad + 6}" width="${w - 2 * pad - 12}" height="${h - 2 * pad - 12}" fill="${C.mustard}"/>`;
  s += `<rect x="${pad + 6}" y="${pad + 6}" width="${w - 2 * pad - 12}" height="${h - 2 * pad - 12}" fill="none" stroke="${C.red}" stroke-width="3"/>`;
  s += inner;
  s += `<rect x="${pad + 6}" y="${h - pad - 40}" width="${w - 2 * pad - 12}" height="34" fill="${C.red}"/>`;
  s += `<text x="${w / 2}" y="${h - pad - 16}" font-family="Avenir Next Condensed" font-weight="900" font-size="22" fill="${C.mat}" text-anchor="middle" letter-spacing="2">MÌ QUẢNG</text>`;
  const body = await sharp(svg(w, h, s)).png().toBuffer();
  await sharp(body).rotate(8, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(out, 'stickers', 'stamp-miquang.png'));
}

/** Paper airplane with a dashed flight path. */
async function airplane() {
  const s = `<path d="M10 120 C80 150 150 60 230 90 S330 120 360 70" fill="none" stroke="${C.navy}" stroke-width="4" stroke-dasharray="12 10" stroke-linecap="round"/>` +
    `<g transform="translate(370 60) rotate(-18)"><path d="M0 0 L70 22 L0 44 L14 22 Z" fill="${C.navy}"/><path d="M14 22 L70 22 L22 34 Z" fill="${C.red}"/></g>`;
  await sharp(svg(460, 160, s)).png().toFile(path.join(out, 'stickers', 'airplane.png'));
}

(async () => {
  await background();
  await postmark();
  await stampMiQuang();
  await airplane();
  // user's Dragon Bridge stamp from themes/danang/assets (not in git), cut and used at 0.5x
  const cut = path.join(out, 'stamp-cut.png');
  sticker(asset('stamp'), cut, ['--tol', '16', '--tint']);
  await sharp(cut).resize({ width: 300, kernel: 'lanczos3' }).png().toFile(path.join(out, 'stickers', 'stamp-dragon.png'));
  for (const f of fs.readdirSync(path.join(out, 'stickers'))) {
    const m = await sharp(path.join(out, 'stickers', f)).metadata();
    console.log(f, m.width + 'x' + m.height);
  }
})().catch((e) => { console.error(e); process.exit(1); });
