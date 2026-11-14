// Warm watercolor-paper texture 2504x3732 (all tones keep saturation > 20).
const { sharp } = require('../../lib/kit.cjs');
const W = 2504, H = 3732;
let s = 3; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
let blobs = '', fib = '';
for (let i = 0; i < 60; i++) blobs += `<ellipse cx="${(r() * W) | 0}" cy="${(r() * H) | 0}" rx="${(150 + r() * 400) | 0}" ry="${(120 + r() * 300) | 0}" fill="${r() > 0.5 ? '#E4D4BA' : '#F2E7D3'}" opacity="0.35"/>`;
for (let i = 0; i < 14000; i++) { const x = r() * W, y = r() * H, a = r() * Math.PI, l = 3 + r() * 14; fib += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x + Math.cos(a) * l).toFixed(0)}" y2="${(y + Math.sin(a) * l).toFixed(0)}" stroke="${r() > 0.55 ? '#DCCBAF' : '#F3EAD8'}" stroke-width="${(0.8 + r() * 1.4).toFixed(1)}"/>`; }
(async () => {
  const base = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#EEE3D0"/>${blobs}</svg>`)).blur(40).png().toBuffer();
  await sharp(base).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${fib}</svg>`) }]).png().toFile(process.argv[2]);
})();
