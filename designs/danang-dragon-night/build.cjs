/**
 * Đà Nẵng · Dragon Bridge at night (MEMORIES). Original vector drawing.
 *   node designs/danang-dragon-night/build.cjs
 */
const path = require('path');
const fs = require('fs');
const { sharp, layout, logoPath, outDir } = require('../../lib/kit.cjs');
const { finalize } = require('../../lib/run.cjs');
const { style } = require('./style.cjs');

const { W, H, PRODUCTS } = layout;
const product = PRODUCTS.memories;
const dir = outDir('danang-dragon-night');

(async () => {
  // white logo variant for the dark background
  const { data, info } = await sharp(logoPath()).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
  const white = (await sharp(data, { raw: info }).png().toBuffer()).toString('base64');
  const ratio = info.height / info.width;
  const ctx = {
    product, kind: 'sheet', area: product.footer, openings: product.openings,
    logo: (x, y, w) => `<image href="data:image/png;base64,${white}" x="${x}" y="${y}" width="${w}" height="${w * ratio}" preserveAspectRatio="xMidYMid meet"/>`,
  };
  const body = style.background(W, H, ctx) + product.openings.map((o) => style.opening(o, ctx)).join('') + style.footer(ctx);
  const raw = path.join(dir, 'raw.png');
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${body}</svg>`)).png().toFile(raw);
  finalize(raw, 'memories', path.join(dir, product.file), 'danang-dragon-night');
  fs.rmSync(raw, { force: true });
})().catch((e) => { console.error(e.message); process.exit(1); });
