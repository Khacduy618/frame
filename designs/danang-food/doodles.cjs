// Thin ink doodles (sparkles, dashed journey line, birds) as transparent layers for compose.
const { sharp } = require('../../lib/kit.cjs');
const out = process.argv[2];
const G = '#2F5D46', M = '#E8B84A', R = '#D6453A';
const spark = (x, y, r, c) => `<path d="M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z" fill="${c}"/>`;
const bird = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-30 0 C-20 -14 -8 -14 0 0 C8 -14 20 -14 30 0" fill="none" stroke="${G}" stroke-width="${4 / s}" stroke-linecap="round"/>`;
const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -6 C-6 -20 -28 -16 -26 0 C-24 12 -8 20 0 28 C8 20 24 12 26 0 C28 -16 6 -20 0 -6 Z" fill="none" stroke="${c}" stroke-width="${4 / s}"/>`;
(async () => {
  // header layer: 2504 x 660, sparkles around the wordmark + birds
  const head = spark(560, 300, 30, M) + spark(620, 230, 16, G) + spark(1930, 560, 26, M) + spark(1880, 620, 14, R) + bird(1500, 120, 1.1) + bird(1580, 95, 0.8) + heart(1660, 610, 0.9, R);
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2504" height="660">${head}</svg>`)).png().toFile(`${out}/doodle-head.png`);
  // footer layer: 2060 x 820 starting at page y 2900 (stops left of the QR corner); dashed journey line signpost -> coffee
  const foot = `<path d="M560 520 C780 700 980 640 1120 610 C1300 570 1420 640 1600 560" fill="none" stroke="${G}" stroke-width="5" stroke-dasharray="18 16" stroke-linecap="round"/>` +
    `<path d="M1588 548 l26 10 l-20 20" fill="none" stroke="${G}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
    spark(840, 190, 24, M) + spark(1660, 120, 22, M) + spark(1700, 175, 12, R) + spark(930, 560, 14, G) + heart(1500, 470, 0.8, R);
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="2060" height="820">${foot}</svg>`)).png().toFile(`${out}/doodle-foot.png`);
  console.log('ok');
})();
