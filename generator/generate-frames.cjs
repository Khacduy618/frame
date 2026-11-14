#!/usr/bin/env node
/**
 * Generates Peak photobooth frames that follow docs/frame-templates/README.md exactly:
 * 2504 x 3732 px PNG, background to the page edge (bleed), photo openings fully transparent at the
 * documented positions, strips = the left strip copied +1181 px with a dashed cut line at x 1252,
 * the QR area left as background (no white box), and the Peak Photobooth logo on every frame.
 *
 *   node generator/generate-frames.cjs [outDir] [styleId ...]
 *
 * Output: <outDir>/<style>/peak-<product>-2504x3732.png and <outDir>/_previews/<style>.png.
 */
const fs = require('fs');
const path = require('path');
const { sharp, layout, logoPath, ROOT } = require('../lib/kit.cjs');
const { W, H, STRIP_SHIFT, CUT_X, QR_BOX, PRODUCTS, pageOpenings } = layout;
const { styles } = require('./styles.cjs');

const outDir = path.resolve(process.argv[2] || path.join(ROOT, 'out/generator'));
const only = process.argv.slice(3);
const TILE_W = STRIP_SHIFT + 142; // one strip (50 mm) + 3 mm bleed each side

async function logoData() {
  const src = logoPath();
  const ink = await sharp(src).png().toBuffer();
  // White variant for dark backgrounds: keep the alpha, paint every pixel white
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
  const white = await sharp(data, { raw: info }).png().toBuffer();
  const meta = await sharp(src).metadata();
  return { ink: ink.toString('base64'), white: white.toString('base64'), ratio: meta.height / meta.width };
}

function makeCtx(style, product, kind, logos, used) {
  const area = product.footer;
  return {
    product,
    kind,
    area,
    openings: product.openings,
    qr: product.qr.map(([x, y]) => [x, y, QR_BOX]),
    /** The Peak Photobooth logo (required on every frame). */
    logo: (x, y, width) => {
      used.logo = true;
      const h = width * logos.ratio;
      return `<image href="data:image/png;base64,${style.logo === 'white' ? logos.white : logos.ink}" x="${x}" y="${y}" width="${width}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
    },
  };
}

/** SVG of one layer: the whole sheet, or one strip tile. */
function layerSvg(style, product, kind, width, logos, used) {
  const ctx = makeCtx(style, product, kind, logos, used);
  const body =
    style.background(width, H, ctx) +
    product.openings.map((o) => style.opening(o, ctx)).join('') +
    (product.header && style.header ? style.header(ctx) : '') +
    (style.extras ? style.extras(ctx) : '') +
    style.footer(ctx);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${H}">${body}</svg>`;
}

async function renderFrame(style, key, logos) {
  const product = PRODUCTS[key];
  const used = { logo: false };
  let page;
  if (!product.strip) {
    page = await sharp(Buffer.from(layerSvg(style, product, 'sheet', W, logos, used))).png().toBuffer();
  } else {
    // Left strip tile (with bleed), copied 1181 px to the right: the two strips are identical
    const tile = await sharp(Buffer.from(layerSvg(style, product, 'strip', TILE_W, logos, used))).png().toBuffer();
    const cut = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><line x1="${CUT_X}" y1="0" x2="${CUT_X}" y2="${H}" stroke="${style.cut}" stroke-width="4" stroke-dasharray="26 18"/></svg>`;
    page = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: tile, left: 0, top: 0 }, { input: tile, left: STRIP_SHIFT, top: 0 }, { input: Buffer.from(cut), left: 0, top: 0 }])
      .png()
      .toBuffer();
  }
  if (!used.logo) throw new Error(`${style.id}/${key}: the Peak Photobooth logo is missing (required on every frame)`);

  // Punch the openings: fully transparent, exact pixel rectangles
  const { data, info } = await sharp(page).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (const [x, y, w, h] of pageOpenings(product)) {
    for (let yy = y; yy < y + h; yy++) {
      const row = (yy * W + x) * 4;
      for (let i = 0; i < w; i++) data[row + i * 4 + 3] = 0;
    }
  }
  let punched = await sharp(data, { raw: info }).png().toBuffer();

  // Drawn over the photos after punching: rounded photo corners (Locket) and caption pills.
  // Openings stay the documented rectangles; only their corners / a small label are covered.
  if (style.corners || style.overPhotos) {
    const openings = pageOpenings(product);
    const r = style.corners ? style.corners.radius : 0;
    const corner = (x, y, dx, dy) => `<path d="M${x} ${y} L${x + dx * r} ${y} A${r} ${r} 0 0 ${dx * dy > 0 ? 0 : 1} ${x} ${y + dy * r} Z" fill="${style.corners.fill}"/>`;
    const corners = style.corners
      ? openings.map(([x, y, w, h]) => corner(x, y, 1, 1) + corner(x + w, y, -1, 1) + corner(x, y + h, 1, -1) + corner(x + w, y + h, -1, -1)).join('')
      : '';
    const over = style.overPhotos ? style.overPhotos({ openings, product, kind: product.strip ? 'strip' : 'sheet' }) : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${corners}${over}</svg>`;
    punched = await sharp(punched).composite([{ input: Buffer.from(svg), left: 0, top: 0 }]).png().toBuffer();
  }

  // Busy textures (denim) compress far better as a 256-colour palette PNG; alpha stays exact
  const png = style.palette ? { compressionLevel: 9, palette: true, colours: 256, dither: 0 } : { compressionLevel: 9 };
  return sharp(punched).png(png).withMetadata({ density: 600 }).toBuffer();
}

async function preview(files, out) {
  const w = 360;
  const h = Math.round((w * H) / W);
  const tiles = await Promise.all(files.map(async (f, i) => ({ input: await sharp(f).resize(w, h).toBuffer(), left: 20 + i * (w + 20), top: 20 })));
  await sharp({ create: { width: 20 + files.length * (w + 20), height: h + 40, channels: 4, background: '#d0d0d0' } }).composite(tiles).png().toFile(out);
}

(async () => {
  const logos = await logoData();
  fs.mkdirSync(outDir, { recursive: true });
  for (const style of styles.filter((s) => !only.length || only.includes(s.id))) {
    const dir = path.join(outDir, style.id);
    fs.mkdirSync(dir, { recursive: true });
    const files = [];
    for (const key of Object.keys(PRODUCTS)) {
      const file = path.join(dir, PRODUCTS[key].file);
      fs.writeFileSync(file, await renderFrame(style, key, logos));
      files.push(file);
    }
    // Previews sit apart from the frames, so selecting a style folder in Admin never imports one
    fs.mkdirSync(path.join(outDir, '_previews'), { recursive: true });
    await preview(files, path.join(outDir, '_previews', `${style.id}.png`));
    console.log(`${style.id}: ${files.length} frames`);
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
