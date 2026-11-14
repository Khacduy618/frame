/**
 * Renders the vector stickers to PNG at their exact page size (1.0x, no upscaling), adds a cream
 * die-cut edge, and writes a review sheet.  node render-stickers.cjs <outDir> [signpost labels…]
 */
const path = require('path');
const fs = require('fs');
const { sharp } = require('../../lib/kit.cjs');
const S = require('./stickers.cjs');

const out = process.argv[2];
const labels = process.argv.slice(3).length ? process.argv.slice(3) : ['MÌ QUẢNG', 'BÁNH XÈO', 'BÚN MẮM NÊM', 'BÁNH TRÁNG CUỐN'];
fs.mkdirSync(out, { recursive: true });

/** vector -> PNG at width w, plus an 12px cream die-cut edge (alpha dilate via blur+threshold). */
async function render(name, art, w, edge = 12) {
  const [vw, vh] = art.vb;
  const h = Math.round((w * vh) / vw);
  const pad = edge * 3;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w + pad * 2}" height="${h + pad * 2}" viewBox="${-pad * vw / w} ${-pad * vh / h} ${vw + (2 * pad * vw) / w} ${vh + (2 * pad * vh) / h}">${art.svg}</svg>`;
  const body = await sharp(Buffer.from(svg)).png().toBuffer();
  const alpha = await sharp(body).ensureAlpha().extractChannel(3).blur(edge / 2).threshold(8).toBuffer();
  const meta = await sharp(body).metadata();
  const edgeLayer = await sharp({ create: { width: meta.width, height: meta.height, channels: 3, background: '#F7EBD5' } }).joinChannel(alpha).png().toBuffer();
  const file = path.join(out, `${name}.png`);
  const stickerBuf = await sharp(edgeLayer).composite([{ input: body }]).png().toBuffer();
  // soft paper-sticker shadow, offset down-right
  const sa = await sharp(stickerBuf).extractChannel(3).toBuffer();
  const dark = await sharp({ create: { width: meta.width, height: meta.height, channels: 3, background: '#4A3420' } }).joinChannel(sa).png().toBuffer();
  const shadow = await sharp({ create: { width: meta.width, height: meta.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: dark, left: Math.round(edge * 0.5), top: Math.round(edge * 0.9) }]).blur(Math.max(0.5, edge * 0.8)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < shadow.data.length; i += 4) shadow.data[i] = Math.round(shadow.data[i] * 0.32);
  await sharp(shadow.data, { raw: shadow.info }).composite([{ input: stickerBuf }]).png().toFile(file);
  console.log(`${name}.png ${meta.width}x${meta.height}`);
  return file;
}

(async () => {
  const files = [];
  files.push(await render('banh-xeo', S.banhXeo(), 760));
  files.push(await render('mi-quang', S.miQuang(), 700));
  files.push(await render('sinh-to-bo', S.sinhToBo(), 230));
  files.push(await render('ca-phe', S.caPhe(), 340));
  files.push(await render('signpost', S.signpost(labels), 700));
  files.push(await render('wordmark', S.wordmark('DA NANG'), 1150, 4));
  // review sheet
  const tiles = [];
  let x = 20, y = 20, rowH = 0;
  for (const f of files) {
    const m = await sharp(f).metadata();
    if (x + m.width > 2600) { x = 20; y += rowH + 20; rowH = 0; }
    tiles.push({ input: f, left: x, top: y });
    x += m.width + 20; rowH = Math.max(rowH, m.height);
  }
  await sharp({ create: { width: 2640, height: y + rowH + 20, channels: 3, background: '#EFE6D6' } }).composite(tiles).png().toFile(path.join(out, '_sheet.png'));
})().catch((e) => { console.error(e); process.exit(1); });
