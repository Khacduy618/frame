#!/usr/bin/env node
/**
 * Peak frame tool: makes Canva/AI-designed frames pass the app's importer.
 * Black box: run with --help. Geometry comes from lib/layout.cjs (copy of the app's
 * scripts/frame-generator/layout.cjs — keep them identical).
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { sharp, layout, logoPath, appRoot } = require('../lib/kit.cjs');
const { W, H, TRIM, SAFE, STRIP_SHIFT, CUT_X, QR_BOX, PRODUCTS, pageOpenings } = layout;
const TILE_W = STRIP_SHIFT + 142;

const HELP = `frame-tool.cjs <command> [options]

  products                         List product keys, openings, QR boxes, footer areas
  base     --product K --out F     Background-only page (2504x3732) with flat #FFFFFF openings,
           [--bg #hex] [--bg2 #hex]  for uploading to Canva as the bottom layer
  guides   --product K --out F     Transparent guide overlay (trim, safe, openings, QR). Top layer in
                                   Canva; hide/delete before export
  sticker  IN --out F [--tol 38] [--tint]
                                   Cut a sticker from a flat-background image (AI output): removes the
                                   colour touching the borders, trims, reports importer-unsafe pixels.
                                   --tint shifts near-white pixels to warm cream so they never read as
                                   a photo opening
  logo     --variant ink|white --width 600 --out F
                                   Peak Photobooth logo PNG (white for dark backgrounds) to upload to Canva
  upscale  IN --out F [--model anime|photo] [--width N]
                                   AI upscale x4 with Real-ESRGAN (ncnn-vulkan; binary from $REALESRGAN_BIN,
                                   PATH or ~/.local/share/realesrgan), then Lanczos down to --width.
                                   anime = flat illustrations/posters, photo = photographs
  export   --src DIR --name THEME [--dest DIR]
                                   Hand-off for the Windows booth: copies only the final frame PNGs
                                   (peak-*-2504x3732.png) from DIR to <dest>/<THEME>/ (default
                                   ~/Desktop/Peak Frames), checks size/alpha/600 DPI, re-runs the
                                   importer, writes CHECKSUMS.sha256 + HUONG-DAN-IMPORT.txt, and
                                   zips it as <THEME>.zip (byte-exact; send the zip as a FILE)
  compose  SPEC.json --out F       Build a frame from a JSON spec (background, stickers, texts, logo,
                                   opening borders) then run finalize. See references/compose-spec.md
  finalize IN --product K --out F [--style ID] [--no-validate] [--cut #hex]
                                   Canva export -> importer-ready PNG: resize to 2504x3732, strips: copy
                                   left strip +1181 px and draw the cut line, punch exact transparent
                                   openings, check QR area / white areas / semi-transparent pixels,
                                   write F and F.preview.png, run the app's importer validator

Exit code 1 when a check fails. Product keys: ${Object.keys(PRODUCTS).join(', ')}`;

function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      o[k] = v;
    } else o._.push(a);
  }
  return o;
}

const product = (k) => {
  const p = PRODUCTS[k];
  if (!p) throw new Error(`Unknown product "${k}". Use: ${Object.keys(PRODUCTS).join(', ')}`);
  return p;
};
const hex = (h) => { const n = parseInt(String(h).replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const qrBoxes = (p) => (p.strip ? [[898, 3260], [2079, 3260]] : p.qr).map(([x, y]) => [x, y, QR_BOX, QR_BOX]);

/** Importer rule (services/frame-import/alpha-mask.service.ts): pixel read as photo opening. */
function slotLike(r, g, b, a) {
  if (a <= 220) return true;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx - mn;
  return (mn >= 230 && s <= 15) || (mn >= 210 && s <= 18) || (mn >= 195 && s <= 20);
}

function bgSvg(opt, w = W, h = H) {
  const c1 = opt.bg || '#1b2a5e';
  const c2 = opt.bg2 || c1;
  return `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#bg)"/>`;
}

async function cmdBase(o) {
  const p = product(o.product);
  const holes = pageOpenings(p).map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#FFFFFF"/>`).join('');
  const cut = p.strip ? `<line x1="${CUT_X}" y1="0" x2="${CUT_X}" y2="${H}" stroke="${o.cut || '#888888'}" stroke-width="4" stroke-dasharray="26 18"/>` : '';
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${bgSvg(o)}${holes}${cut}</svg>`)).png().toFile(o.out);
  console.log(`base ${o.product} -> ${o.out}`);
}

function guidesSvg(p) {
  let s = `<rect x="${TRIM.x}" y="${TRIM.y}" width="${TRIM.w}" height="${TRIM.h}" fill="none" stroke="#ff2d2d" stroke-width="5" stroke-dasharray="24 14"/>`;
  const safes = p.strip ? [[SAFE.x, 1252 - 71 - SAFE.x], [SAFE.x + STRIP_SHIFT, 1252 - 71 - SAFE.x]] : [[SAFE.x, SAFE.w]];
  for (const [x, w] of safes) s += `<rect x="${x}" y="${SAFE.y}" width="${w}" height="${SAFE.h}" fill="none" stroke="#2d6bff" stroke-width="4" stroke-dasharray="16 12"/>`;
  for (const [x, y, w, h] of pageOpenings(p)) s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#19c37d" fill-opacity="0.18" stroke="#19c37d" stroke-width="5"/>`;
  for (const [x, y] of qrBoxes(p)) s += `<rect x="${x}" y="${y}" width="${QR_BOX}" height="${QR_BOX}" fill="none" stroke="#ffb020" stroke-width="4" stroke-dasharray="14 10"/>`;
  return s;
}

async function cmdGuides(o) {
  const p = product(o.product);
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${guidesSvg(p)}</svg>`)).png().toFile(o.out);
  console.log(`guides ${o.product} -> ${o.out}`);
}

async function cmdSticker(o) {
  const src = o._[1];
  const tol = Number(o.tol || 38);
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const at = (x, y) => (y * w + x) * 4;
  // background colour = median of the four corners
  const corners = [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)].map((i) => [data[i], data[i + 1], data[i + 2]]);
  const key = corners.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]))[1];
  const near = (i) => Math.abs(data[i] - key[0]) + Math.abs(data[i + 1] - key[1]) + Math.abs(data[i + 2] - key[2]) <= tol * 3;
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, 0, x, h - 1);
  for (let y = 0; y < h; y++) stack.push(0, y, w - 1, y);
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const k = y * w + x;
    if (seen[k] || !near(k * 4)) continue;
    seen[k] = 1;
    data[k * 4 + 3] = 0;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
  let unsafe = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    if (slotLike(data[i], data[i + 1], data[i + 2], 255)) {
      unsafe++;
      if (o.tint) { data[i] = Math.min(data[i], 243); data[i + 1] = Math.min(data[i + 1], 226); data[i + 2] = Math.min(data[i + 2], 196); }
    }
  }
  // soften the cut edge inward only (never let removed background pixels come back as a pale fringe)
  const blurred = await sharp(Buffer.from(data.filter((_, i) => i % 4 === 3)), { raw: { width: w, height: h, channels: 1 } }).blur(0.8).extractChannel(0).raw().toBuffer();
  for (let k = 0; k < w * h; k++) data[k * 4 + 3] = Math.min(data[k * 4 + 3], blurred[k]);
  await sharp(data, { raw: info }).trim({ threshold: 1 }).png().toFile(o.out);
  const pct = ((unsafe / (w * h)) * 100).toFixed(1);
  console.log(`sticker -> ${o.out}  (key rgb ${key.join(',')}, near-white px ${pct}%${o.tint ? ' tinted' : unsafe ? ' — use --tint if this sticker sits near a photo or is large' : ''})`);
}

async function logoBuffer(variant, width) {
  const src = logoPath();
  let img = sharp(src).resize({ width: Math.round(width) });
  if (variant === 'white') {
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
    return sharp(data, { raw: info }).png().toBuffer();
  }
  return img.png().toBuffer();
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const overlaps = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];

function realesrgan() {
  const cands = [process.env.REALESRGAN_BIN, path.join(require('os').homedir(), '.local/share/realesrgan/realesrgan-ncnn-vulkan')].filter(Boolean);
  for (const c of cands) if (fs.existsSync(c)) return c;
  try { return execFileSync('which', ['realesrgan-ncnn-vulkan'], { encoding: 'utf8' }).trim(); } catch { return null; }
}

async function cmdUpscale(o) {
  const src = path.resolve(o._[1]);
  const bin = realesrgan();
  if (!bin) throw new Error('Real-ESRGAN not installed. Ask the user before downloading realesrgan-ncnn-vulkan (official release: github.com/xinntao/Real-ESRGAN/releases) into ~/.local/share/realesrgan/');
  const model = o.model === 'photo' ? 'realesrgan-x4plus' : 'realesrgan-x4plus-anime';
  const tmp = path.join(require('os').tmpdir(), `upscale-${process.pid}.png`);
  const pngIn = path.join(require('os').tmpdir(), `upscale-in-${process.pid}.png`);
  await sharp(src).removeAlpha().png().toFile(pngIn);
  execFileSync(bin, ['-i', pngIn, '-o', tmp, '-n', model, '-s', '4', '-m', path.join(path.dirname(bin), 'models')], { stdio: 'ignore' });
  const before = await sharp(src).metadata();
  let img = sharp(tmp);
  if (o.width) img = img.resize({ width: Number(o.width), kernel: 'lanczos3' });
  await img.png().toFile(o.out);
  const after = await sharp(o.out).metadata();
  fs.rmSync(tmp, { force: true }); fs.rmSync(pngIn, { force: true });
  console.log(`upscale ${before.width}x${before.height} -> ${after.width}x${after.height} (${model}) -> ${o.out}`);
}

async function cmdExport(o) {
  const crypto = require('crypto');
  const safe = String(o.name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
  const destRoot = path.resolve(o.dest || path.join(require('os').homedir(), 'Desktop', 'Peak Frames'));
  const dir = path.join(destRoot, safe);
  const srcDir = path.resolve(o.src);
  const files = fs.readdirSync(srcDir).filter((f) => /^peak-[a-z-]+-2504x3732\.png$/.test(f)).sort();
  if (!files.length) throw new Error(`no final frames (peak-*-2504x3732.png) in ${srcDir}`);
  const fails = [];
  fs.mkdirSync(dir, { recursive: true });
  const sums = [];
  for (const f of files) {
    const m = await sharp(path.join(srcDir, f)).metadata();
    if (m.width !== W || m.height !== H) fails.push(`${f}: ${m.width}x${m.height}`);
    if (!m.hasAlpha) fails.push(`${f}: no transparent openings (alpha missing)`);
    if (Math.round(m.density || 0) !== 600) fails.push(`${f}: ${m.density} DPI, expected 600`);
    fs.copyFileSync(path.join(srcDir, f), path.join(dir, f));
    const h = crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, f))).digest('hex');
    sums.push(`${h}  ${f}`);
  }
  fs.writeFileSync(path.join(dir, 'CHECKSUMS.sha256'), sums.join('\n') + '\n');
  fs.writeFileSync(path.join(dir, 'HUONG-DAN-IMPORT.txt'), [
    `Peak Photobooth - bo frame "${safe}" (${files.length} file, 2504x3732 px, 600 DPI, PNG trong suot)`,
    '',
    '1. Chep ca thu muc (hoac giai nen file .zip) vao may booth Windows.',
    '   Gui bang USB, Google Drive hoac gui FILE .zip. KHONG gui dang anh qua Zalo/Messenger (bi nen, mo).',
    '2. Kiem tra file con nguyen (PowerShell, trong thu muc nay):',
    '   Get-FileHash *.png -Algorithm SHA256',
    '   So voi CHECKSUMS.sha256 (chu thuong/hoa khong quan trong).',
    '3. Admin > Frames > Import: chon tung file PNG. YOU & ME: chon san pham Strip 2 truoc khi publish.',
    '',
    ...sums.map((l) => '   ' + l.split('  ')[1]),
  ].join('\r\n') + '\r\n');
  // importer check on the exported copy
  const app = appRoot();
  if (!app) console.log('info  importer: skipped (set PHOTOBOOTH_APP to an app checkout to run it)');
  else try {
    execFileSync('npx', ['jiti', 'scripts/frame-generator/validate-frames.ts', destRoot], { cwd: app, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      .trim().split('\n').filter((l) => l.includes(safe + '/')).forEach((l) => console.log(`info  importer: ${l.trim()}`));
  } catch (e) {
    String(e.stdout || '').split('\n').filter((l) => l.includes(safe + '/') && l.startsWith('FAIL')).forEach((l) => fails.push('importer: ' + l));
  }
  const zip = path.join(destRoot, `${safe}.zip`);
  fs.rmSync(zip, { force: true });
  execFileSync('zip', ['-X', '-q', '-r', zip, safe], { cwd: destRoot });
  fails.forEach((f) => console.log(`FAIL  ${f}`));
  console.log(`${fails.length ? 'FAIL' : 'PASS'}  ${files.length} frame(s) -> ${dir}\n      zip ${zip}`);
  if (fails.length) process.exitCode = 1;
}

async function cmdCompose(o) {
  const specPath = path.resolve(o._[1]);
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const base = path.dirname(specPath);
  const p = product(spec.product);
  const warn = [];
  const qrHits = [];
  const overlays = [];
  let svg = '';
  const bg = spec.background || {};
  if (bg.image) {
    // full-bleed image background, cover
    svg += '';
  } else svg += bgSvg({ bg: bg.color || (bg.gradient || [])[0], bg2: (bg.gradient || [])[1] });
  const ob = spec.openingBorder;
  if (ob) for (const [x, y, w, h] of p.openings) {
    const pad = ob.pad ?? 12;
    svg += `<rect x="${x - pad}" y="${y - pad}" width="${w + pad * 2}" height="${h + pad * 2}" rx="${ob.radius || 0}" fill="none" stroke="${ob.color}" stroke-width="${ob.width || 6}"/>`;
  }
  for (const t of spec.texts || []) {
    svg += `<text x="${t.x}" y="${t.y}" font-size="${t.size || 60}" font-family="${esc(t.font || 'Georgia')}" font-weight="${t.weight || 'normal'}" font-style="${t.style || 'normal'}" fill="${t.color || '#1c1c1c'}" text-anchor="${t.anchor || 'start'}" letter-spacing="${t.spacing || 0}"${t.rotate ? ` transform="rotate(${t.rotate} ${t.x} ${t.y})"` : ''}>${esc(t.text)}</text>`;
  }
  const layers = [];
  let page = bg.image
    ? await sharp(path.resolve(base, bg.image)).resize(W, H, { fit: 'cover' }).png().toBuffer()
    : await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`)).png().toBuffer();
  if (bg.image && svg) layers.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`), left: 0, top: 0 });

  const stickers = [...(spec.stickers || [])].sort((a, b) => (a.z || 0) - (b.z || 0));
  for (const s of stickers) {
    const native = await sharp(path.resolve(base, s.file)).metadata();
    const enlarge = s.w / native.width;
    if (enlarge > 1.02) warn.push(`sticker ${s.file} is enlarged ${enlarge.toFixed(2)}x (native ${native.width}px) and will look soft — run: frame-tool upscale ${s.file} --out ... first`);
    let img = sharp(path.resolve(base, s.file));
    if (s.flip) img = img.flop();
    img = img.resize({ width: Math.round(s.w), height: s.h ? Math.round(s.h) : undefined, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
    let buf = await img.png().toBuffer();
    if (s.rotate) buf = await sharp(buf).rotate(s.rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    if (s.opacity != null && s.opacity < 1) {
      const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * s.opacity);
      buf = await sharp(data, { raw: info }).png().toBuffer();
    }
    const m = await sharp(buf).metadata();
    const left = Math.round(s.x), top = Math.round(s.y);
    const box = [left, top, m.width, m.height];
    if (!s.ambient && qrBoxes(p).some((q) => overlaps(box, q))) qrHits.push(`sticker ${s.file} at ${left},${top} overlaps the QR area (move it; "ambient": true only for faint background texture)`);
    if (!s.overPhoto && pageOpenings(p).some((q) => overlaps(box, q))) warn.push(`sticker ${s.file} overlaps a photo opening (it is cut away there; set "overPhoto": true only for small corner accents)`);
    // crop to the page
    const cl = Math.max(0, -left), ct = Math.max(0, -top);
    const cw = Math.min(m.width - cl, W - Math.max(0, left)), ch = Math.min(m.height - ct, H - Math.max(0, top));
    if (cw <= 0 || ch <= 0) { warn.push(`sticker ${s.file} is off the page`); continue; }
    const piece = await sharp(buf).extract({ left: cl, top: ct, width: cw, height: ch }).png().toBuffer();
    if (s.overPhoto) {
      // drawn after the holes are punched; only in the outer band of an opening, never over faces
      const ob = [Math.max(0, left), Math.max(0, top), cw, ch];
      for (const [x, y, w, h] of p.openings) {
        const ix0 = Math.max(ob[0], x), iy0 = Math.max(ob[1], y), ix1 = Math.min(ob[0] + ob[2], x + w), iy1 = Math.min(ob[1] + ob[3], y + h);
        if (ix0 >= ix1 || iy0 >= iy1) continue;
        const ok = ix1 <= x + w * 0.12 || ix0 >= x + w * 0.88 || iy0 >= y + h * 0.88;
        if (!ok) qrHits.push(`overPhoto sticker ${s.file} reaches ${ix1 - ix0}x${iy1 - iy0} px into opening ${x},${y} (only the outer 12 % side/bottom band is allowed)`);
      }
      overlays.push({ input: piece, left: Math.max(0, left), top: Math.max(0, top) });
    } else layers.push({ input: piece, left: Math.max(0, left), top: Math.max(0, top) });
  }
  for (const l of [].concat(spec.logo || [])) {
    layers.push({ input: await logoBuffer(l.variant || 'ink', l.width), left: Math.round(l.x), top: Math.round(l.y) });
  }
  if (!spec.logo) warn.push('no Peak logo in the spec (required on every frame; strips: in the left strip, it is copied)');
  page = await sharp(page).composite(layers).png().toBuffer();
  const raw = o.out.replace(/\.png$/, '') + '.raw.png';
  fs.writeFileSync(raw, page);
  warn.forEach((w) => console.log(`WARN  ${w}`));
  return cmdFinalize({ ...o, _: ['finalize', raw], product: spec.product, style: o.style || spec.id, cut: o.cut || spec.cut, extraFails: qrHits, overlays });
}

/** Connected components of a mask, returns boxes [x,y,w,h,area] (4-neighbour). */
function blobs(mask, w, h) {
  const out = [];
  const lab = new Uint8Array(w * h);
  const st = new Int32Array(w * h);
  for (let k = 0; k < w * h; k++) {
    if (!mask[k] || lab[k]) continue;
    let sp = 0, area = 0, x0 = w, y0 = h, x1 = 0, y1 = 0;
    st[sp++] = k; lab[k] = 1;
    while (sp) {
      const c = st[--sp];
      const x = c % w, y = (c - x) / w;
      area++; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y;
      const n = [x > 0 ? c - 1 : -1, x < w - 1 ? c + 1 : -1, y > 0 ? c - w : -1, y < h - 1 ? c + w : -1];
      for (const q of n) if (q >= 0 && mask[q] && !lab[q]) { lab[q] = 1; st[sp++] = q; }
    }
    out.push([x0, y0, x1 - x0 + 1, y1 - y0 + 1, area]);
  }
  return out;
}

async function cmdFinalize(o) {
  const src = o._[1];
  const p = product(o.product);
  const fails = [...(o.extraFails || [])];
  const notes = [];
  const meta = await sharp(src).metadata();
  const ratio = meta.width / meta.height;
  if (Math.abs(ratio - W / H) > 0.004) fails.push(`input is ${meta.width}x${meta.height}, aspect ${ratio.toFixed(4)} != ${(W / H).toFixed(4)} (wrong Canva page size)`);
  if (meta.width !== W || meta.height !== H) notes.push(`resized ${meta.width}x${meta.height} -> ${W}x${H}`);
  let page = await sharp(src).resize(W, H, { fit: 'fill' }).ensureAlpha().png().toBuffer();

  if (p.strip) {
    const tile = await sharp(page).extract({ left: 0, top: 0, width: TILE_W, height: H }).png().toBuffer();
    const cut = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><line x1="${CUT_X}" y1="0" x2="${CUT_X}" y2="${H}" stroke="${o.cut || '#9a9a9a'}" stroke-width="4" stroke-dasharray="26 18"/></svg>`;
    page = await sharp(page).composite([{ input: tile, left: 0, top: 0 }, { input: tile, left: STRIP_SHIFT, top: 0 }, { input: Buffer.from(cut), left: 0, top: 0 }]).png().toBuffer();
    notes.push('right strip = left strip copied +1181 px, cut line at x 1252');
  }

  let { data, info } = await sharp(page).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const holes = pageOpenings(p);
  const inHole = new Uint8Array(W * H);
  for (const [x, y, w, h] of holes) for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) { inHole[yy * W + xx] = 1; data[(yy * W + xx) * 4 + 3] = 0; }
  if (o.overlays && o.overlays.length) {
    // stickers that sit on photo edges: drawn after punching (strips: copied +1181 px too)
    const ov = p.strip ? [...o.overlays, ...o.overlays.map((l) => ({ ...l, left: l.left + STRIP_SHIFT }))] : o.overlays;
    const merged = await sharp(data, { raw: info }).composite(ov.filter((l) => l.left < W)).raw().toBuffer({ resolveWithObject: true });
    data = merged.data; info = merged.info;
    notes.push(`${ov.length} overPhoto sticker(s) drawn on top of the openings`);
  }

  // Checks outside the openings
  const mask = new Uint8Array(W * H);
  let semi = 0;
  for (let k = 0; k < W * H; k++) {
    if (inHole[k]) continue;
    const i = k * 4;
    if (data[i + 3] < 255) semi++;
    if (slotLike(data[i], data[i + 1], data[i + 2], data[i + 3])) mask[k] = 1;
  }
  if (semi > 0) {
    // the page must be opaque outside the openings; flatten onto the darkest-safe colour would change art, so fail
    fails.push(`${semi} transparent/semi-transparent px outside the openings (export without transparent background, or fill the page)`);
  }
  for (const [qx, qy] of qrBoxes(p)) {
    let n = 0;
    for (let y = qy; y < qy + QR_BOX; y++) for (let x = qx; x < qx + QR_BOX; x++) n += mask[y * W + x];
    if (n > QR_BOX * QR_BOX * 0.02) fails.push(`QR area ${qx},${qy}: ${n} white/light px (no white box, no frame; background only)`);
  }
  // ring 14 px around each opening must not be white-ish (it would merge into the opening)
  for (const [x, y, w, h] of holes) {
    let n = 0;
    for (let yy = y - 14; yy < y + h + 14; yy++) for (let xx = x - 14; xx < x + w + 14; xx++) {
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      if (!inHole[yy * W + xx] && mask[yy * W + xx]) n++;
    }
    if (n > 200) fails.push(`${n} white/light px touch opening ${x},${y} (would grow the detected opening)`);
  }
  const big = blobs(mask, W, H).filter((b) => b[4] > W * H * 0.004).sort((a, b) => b[4] - a[4]);
  for (const b of big.slice(0, 5)) fails.push(`light area ${b[2]}x${b[3]} at ${b[0]},${b[1]} could be read as a photo opening (tint it: saturation > 20 or darker than #C3C3C3)`);

  fs.mkdirSync(path.dirname(path.resolve(o.out)), { recursive: true });
  await sharp(data, { raw: info }).png({ compressionLevel: 9 }).withMetadata({ density: 600 }).toFile(o.out);
  const prev = o.out.replace(/\.png$/, '') + '.preview.png';
  const g = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${guidesSvg(p)}</svg>`;
  const comp = await sharp({ create: { width: W, height: H, channels: 4, background: '#8a94a8' } }).composite([{ input: o.out }, { input: Buffer.from(g) }]).png().toBuffer();
  await sharp(comp).resize(1252).png().toFile(prev);

  if (!o['no-validate'] && !appRoot()) notes.push('importer: skipped (set PHOTOBOOTH_APP to an app checkout to run it; built-in checks still ran)');
  if (!o['no-validate'] && appRoot()) {
    const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'peakframe-'));
    const style = o.style || 'candidate';
    fs.mkdirSync(path.join(dir, style));
    fs.copyFileSync(o.out, path.join(dir, style, p.file));
    try {
      const outTxt = execFileSync('npx', ['jiti', 'scripts/frame-generator/validate-frames.ts', dir], { cwd: appRoot(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      notes.push('importer: ' + outTxt.trim().split('\n')[0]);
    } catch (e) {
      fails.push('importer: ' + String(e.stdout || e.message).trim().split('\n')[0]);
    }
  }
  notes.forEach((n) => console.log(`info  ${n}`));
  fails.forEach((f) => console.log(`FAIL  ${f}`));
  console.log(`${fails.length ? 'FAIL' : 'PASS'}  ${o.out}\n      preview ${prev}`);
  if (fails.length) process.exitCode = 1;
}

(async () => {
  const o = args(process.argv.slice(2));
  const cmd = o._[0];
  if (!cmd || o.help || cmd === 'help') return console.log(HELP);
  if (cmd === 'products') {
    for (const [k, p] of Object.entries(PRODUCTS)) console.log(`${k.padEnd(10)} ${p.label.padEnd(10)} strip=${p.strip}  openings ${JSON.stringify(p.openings)}  qr ${JSON.stringify(qrBoxes(p).map(([x, y]) => [x, y]))}  footer ${JSON.stringify(p.footer)}${p.header ? '  header ' + JSON.stringify(p.header) : ''}`);
    return;
  }
  const need = (k) => { if (!o[k]) throw new Error(`--${k} is required (see --help)`); };
  if (cmd === 'base') { need('product'); need('out'); return cmdBase(o); }
  if (cmd === 'guides') { need('product'); need('out'); return cmdGuides(o); }
  if (cmd === 'sticker') { need('out'); return cmdSticker(o); }
  if (cmd === 'logo') { need('out'); fs.writeFileSync(o.out, await logoBuffer(o.variant || 'ink', Number(o.width || 600))); return console.log(`logo -> ${o.out}`); }
  if (cmd === 'export') { need('src'); need('name'); return cmdExport(o); }
  if (cmd === 'upscale') { need('out'); return cmdUpscale(o); }
  if (cmd === 'compose') { need('out'); return cmdCompose(o); }
  if (cmd === 'finalize') { need('product'); need('out'); return cmdFinalize(o); }
  throw new Error(`Unknown command "${cmd}" (see --help)`);
})().catch((e) => { console.error(`ERROR ${e.message}`); process.exit(1); });
