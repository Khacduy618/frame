/**
 * OUR STORY travel-journal frame from themes/danang (user assets + copy.md).
 *   node designs/danang-journal/build.cjs
 * Needs the user's images in themes/danang/assets (not in git): beach, caurongdanang, dau-rong, stamp.
 * Every raster is placed at <= 1.0x its native size (sizes logged).
 */
const fs = require('fs');
const path = require('path');
const { sharp, layout, logoPath, outDir } = require('../../lib/kit.cjs');
const { finalize, sticker } = require('../../lib/run.cjs');
const { asset, themeDir: themeOf } = require('../theme-assets.cjs');
const { W, H, PRODUCTS } = layout;

const themeDir = themeOf('danang');
const dir = outDir('danang-journal');
const out = path.join(dir, 'raw.png');
const stampFile = path.join(dir, 'stamp-cut.png');

// copy.md: "- key: value"; "key;" or empty value = not used
const copy = {};
for (const line of fs.readFileSync(path.join(themeDir, 'copy.md'), 'utf8').split('\n')) {
  const m = line.match(/^-\s*([a-z_]+)\s*:\s*(.*)$/);
  if (m && m[2].trim()) copy[m[1]] = m[2].trim();
}

const C = { ivory: '#F2E6D3', mat: '#F7EEDF', navy: '#173D59', muted: '#6E8DA1', gold: '#B8862F' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const svg = (body, w = W, h = H) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);
const text = (x, y, s, o = {}) => (s ? `<text x="${x}" y="${y}" font-family="${o.font || 'Avenir Next'}" font-size="${o.size || 30}" font-weight="${o.weight || 'normal'}" fill="${o.fill || C.navy}" letter-spacing="${o.spacing || 0}" text-anchor="${o.anchor || 'start'}"${o.rotate ? ` transform="rotate(${o.rotate} ${x} ${y})"` : ''}>${esc(s)}</text>` : '');
const sizes = [];

async function grade(buf) {
  const m = await sharp(buf).metadata();
  const g = await sharp(buf).modulate({ saturation: 0.9 }).png().toBuffer();
  return sharp(g).composite([{ input: svg(`<rect width="100%" height="100%" fill="#E8A86A" opacity="0.1"/>`, m.width, m.height), blend: 'soft-light' }]).png().toBuffer();
}

/** Drop shadow + rotation for any RGBA layer. */
async function lift(buf, rot, { blur = 14, dx = 8, dy = 16, op = 0.3 } = {}) {
  const m = await sharp(buf).metadata();
  const pad = 70;
  const alpha = await sharp(buf).ensureAlpha().extractChannel(3).toBuffer();
  const dark = await sharp({ create: { width: m.width, height: m.height, channels: 3, background: '#3a2a18' } }).joinChannel(alpha).png().toBuffer();
  const shadow = await sharp({ create: { width: m.width + pad * 2, height: m.height + pad * 2, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: dark, left: pad + dx, top: pad + dy }]).png().toBuffer();
  const soft = await sharp(shadow).blur(blur).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < soft.data.length; i += 4) soft.data[i] = Math.round(soft.data[i] * op);
  const stack = await sharp(soft.data, { raw: soft.info }).composite([{ input: buf, left: pad, top: pad }]).png().toBuffer();
  const r = await sharp(stack).rotate(rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const rm = await sharp(r).metadata();
  return { buf: r, w: rm.width, h: rm.height };
}

async function card(file, crop, w, rot, mat = 18) {
  const meta = await sharp(file).metadata();
  const h = Math.round((w * crop.height) / crop.width);
  sizes.push(`${path.basename(file)}: crop ${crop.width}x${crop.height} -> ${w}x${h} (${(w / crop.width).toFixed(2)}x, native ${meta.width}x${meta.height})`);
  if (w > crop.width) throw new Error(`${path.basename(file)} would be enlarged`);
  const img = await grade(await sharp(file).extract(crop).resize(w, h, { kernel: 'lanczos3' }).png().toBuffer());
  const cw = w + mat * 2, ch = h + mat * 2;
  const face = await sharp(svg(`<rect width="${cw}" height="${ch}" fill="${C.mat}"/><rect x="${mat - 1}" y="${mat - 1}" width="${w + 2}" height="${h + 2}" fill="none" stroke="${C.navy}" stroke-width="2" opacity="0.45"/>`, cw, ch))
    .composite([{ input: img, left: mat, top: mat }]).png().toBuffer();
  return lift(face, rot);
}

async function cutout(file, w, rot, shadow) {
  const meta = await sharp(file).metadata();
  sizes.push(`${path.basename(file)}: ${meta.width}x${meta.height} -> ${w}x${Math.round((w * meta.height) / meta.width)} (${(w / meta.width).toFixed(2)}x)`);
  if (w > meta.width) throw new Error(`${path.basename(file)} would be enlarged`);
  const buf = await sharp(file).resize({ width: w, kernel: 'lanczos3' }).png().toBuffer();
  return lift(buf, rot, shadow);
}

const at = (layer, cx, cy) => ({ input: layer.buf, left: Math.round(cx - layer.w / 2), top: Math.round(cy - layer.h / 2) });

(async () => {
  const p = PRODUCTS.ourStory;

  // paper base
  let grain = '';
  let s = 11;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 9000; i++) grain += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${(0.6 + rnd() * 1.6).toFixed(1)}" fill="${rnd() > 0.5 ? '#E6D5BB' : '#EADBC4'}"/>`;

  // keylines around the openings + editorial rules
  let lines = '';
  for (const [x, y, w, h] of p.openings) {
    lines += `<rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" fill="none" stroke="${C.navy}" stroke-width="3"/>`;
    for (const [cx, cy, dx, dy] of [[x - 12, y - 12, 1, 1], [x + w + 12, y - 12, -1, 1], [x - 12, y + h + 12, 1, -1], [x + w + 12, y + h + 12, -1, -1]]) lines += `<path d="M${cx} ${cy + dy * 46} L${cx} ${cy} L${cx + dx * 46} ${cy}" fill="none" stroke="${C.gold}" stroke-width="7"/>`;
  }
  lines += `<rect x="189" y="290" width="1050" height="2" fill="${C.navy}" opacity="0.6"/>`;
  lines += `<rect x="189" y="2928" width="2126" height="2" fill="${C.navy}" opacity="0.6"/>`;
  // gold wave ornament under the footer details
  lines += `<path d="M1440 3196 c28 -18 56 -18 84 0 s56 18 84 0 s56 -18 84 0 s56 18 84 0" fill="none" stroke="${C.gold}" stroke-width="5" stroke-linecap="round"/>`;

  // type (verbatim from copy.md; missing keys are skipped)
  let type = '';
  type += text(189, 262, copy.kicker, { size: 30, weight: '600', fill: C.muted, spacing: 9 });
  type += text(182, 492, copy.title, { font: 'Didot', size: 212, weight: 'bold', spacing: 4 });
  type += text(196, 622, copy.tagline, { font: 'Snell Roundhand', size: 86, weight: 'bold', fill: C.gold });
  type += text(170, 2100, copy.side_left, { size: 24, weight: '600', fill: C.muted, spacing: 10, rotate: -90, anchor: 'middle' });
  type += text(2340, 1500, copy.side_right, { size: 24, weight: '600', fill: C.muted, spacing: 10, rotate: 90, anchor: 'middle' });
  type += text(1440, 3080, copy.location, { size: 46, weight: '600', spacing: 14 });
  type += text(1442, 3140, [copy.footer_line, copy.coordinates].filter(Boolean).join('  ·  '), { size: 30, weight: '500', fill: C.muted, spacing: 9 });
  type += text(1442, 3255, [copy.date, copy.hashtag, copy.event_name].filter(Boolean).join('  ·  '), { size: 30, weight: '500', fill: C.navy, spacing: 6 });

  // assets
  sticker(asset('stamp'), stampFile, ['--tol', '16', '--tint']);
  const beach = await card(asset('beach'), { left: 0, top: 420, width: 736, height: 460 }, 600, -4);
  const stamp = await cutout(stampFile, 360, 7, { blur: 10, dx: 6, dy: 12, op: 0.28 });
  const bridge = await card(asset('bridgePoster'), { left: 14, top: 470, width: 707, height: 530 }, 700, -2.5);
  const dragon = await cutout(asset('dragonHead'), 600, -4, { blur: 16, dx: 10, dy: 18, op: 0.32 });

  const logo = await sharp(logoPath()).resize({ width: 320 }).png().toBuffer();

  const page = await sharp(svg(`<rect width="${W}" height="${H}" fill="${C.ivory}"/>${grain}`)).composite([
    { input: svg(lines), left: 0, top: 0 },
    at(beach, 1650, 400),
    at(stamp, 2110, 412),
    at(bridge, 605, 3238),
    at(dragon, 1080, 3262),
    { input: svg(type), left: 0, top: 0 },
    { input: logo, left: 1440, top: 3300 },
  ]).png().toBuffer();
  await sharp(page).png().toFile(out);
  console.log('copy used:', JSON.stringify(copy));
  sizes.forEach((l) => console.log('size', l));
  finalize(out, 'ourStory', path.join(dir, PRODUCTS.ourStory.file), 'danang-journal');
  fs.rmSync(out, { force: true });
})().catch((e) => { console.error(e.message); process.exit(1); });
