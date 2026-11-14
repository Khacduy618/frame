/**
 * Social-app layouts: an Instagram-style post / profile / story (dark and blush) and a
 * Locket-style widget (rounded photos, caption pills, shutter button; dark and cream).
 * Original drawings that only borrow the layout idea; the brand on every frame is Peak.
 */
const { esc, text, igHeart, igComment, igSend, igBookmark, igVerified, igAvatar, igRingDefs } = require('./shapes.cjs');

const SANS = 'Helvetica Neue';
const MONO = 'Menlo';
const stripCenterX = 165 + 992 / 2; // left strip, tile coordinates

// ---------------------------------------------------------------- Instagram
function igStyle({ id, name, description, bg, ink, muted, link, line, logo, cut }) {
  const header = (x0, right, small) => {
    const r = small ? 26 : 30;
    const ax = x0 + r + 2;
    const size = small ? 30 : 36;
    const handleW = size * 0.56 * 'peak.photobooth'.length;
    return igAvatar(ax, 224, r, '#f05e81', 'url(#igRing)', bg) +
      text(ax + r + 22, 224 + size * 0.36, 'peak.photobooth', { size, family: SANS, weight: 'bold', fill: ink }) +
      igVerified(ax + r + 22 + handleW + 22, 224, small ? 11 : 13) +
      text(right, 224 + 10, '•••', { size: small ? 34 : 40, family: SANS, weight: 'bold', fill: ink, anchor: 'end' });
  };
  const caption = (x, y, size) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-family="${SANS}" fill="${ink}"><tspan font-weight="bold">peak.photobooth</tspan> good memories always fit. <tspan fill="${link}">#peakphotobooth</tspan></text>`;
  return {
    id,
    name,
    description,
    logo,
    cut,
    background: (w, h) => `${igRingDefs}<rect width="${w}" height="${h}" fill="${bg}"/>`,
    opening: ([x, y, w, h]) => `<rect x="${x - 2}" y="${y - 2}" width="${w + 4}" height="${h + 4}" fill="none" stroke="${line}" stroke-width="3"/>`,
    extras: (ctx) => {
      if (ctx.product.header) return ''; // Our Story: the profile header replaces the post header
      return ctx.kind === 'sheet' ? header(189, 2315, false) : header(165, 1150, true);
    },
    header: () =>
      // Profile header (Our Story): avatar, handle, stats, bio, Follow button
      igAvatar(330, 420, 125, '#f05e81', 'url(#igRing)', bg) +
      text(520, 300, 'peak.photobooth', { size: 54, family: SANS, weight: 'bold', fill: ink }) + igVerified(520 + 54 * 0.56 * 15 + 30, 284, 18) +
      [['6', 'posts', 560], ['1M', 'followers', 900], ['3', 'following', 1280]].map(([n, l, x]) =>
        text(x, 420, n, { size: 60, family: SANS, weight: 'bold', fill: ink, anchor: 'middle' }) + text(x, 476, l, { size: 36, family: SANS, fill: muted, anchor: 'middle' })).join('') +
      text(520, 590, 'Peak Photobooth ✦ good memories always fit.', { size: 40, family: SANS, fill: ink }) +
      `<rect x="1780" y="380" width="520" height="96" rx="20" fill="#3897f0"/>` + text(2040, 442, 'Follow', { size: 42, family: SANS, weight: 'bold', fill: '#ffffff', anchor: 'middle' }),
    footer: (ctx) => {
      const { area, kind, product } = ctx;
      if (kind === 'sheet') {
        const y0 = area.y + 70;
        const dots = product.openings.length === 4
          ? [0, 1, 2, 3].map((i) => `<circle cx="${1252 - 45 + i * 30}" cy="${area.y + 22}" r="9" fill="${i === 0 ? '#3897f0' : muted}"/>`).join('')
          : '';
        return dots +
          igHeart(225, y0, 1.6, '#ed4956', '#ed4956') + igComment(300, y0 - 2, 1.6, ink) + igSend(410, y0 + 4, 1.5, ink) + igBookmark(2270, y0, 1.6, ink) +
          text(189, y0 + 140, '12,026 likes', { size: 44, family: SANS, weight: 'bold', fill: ink }) +
          caption(189, y0 + 210, 42) +
          text(189, y0 + 272, 'View all 2,026 comments', { size: 38, family: SANS, fill: muted }) +
          ctx.logo(189, y0 + 300, 300);
      }
      const big = area.h > 500;
      const y0 = area.y + 40;
      return igHeart(190, y0, 1.25, '#ed4956', '#ed4956') + igComment(250, y0 - 2, 1.25, ink) + igSend(335, y0 + 3, 1.2, ink) + igBookmark(1100, y0, 1.25, ink) +
        text(165, y0 + 100, 'liked by besties and 2,026 others', { size: 30, family: SANS, weight: 'bold', fill: ink }) +
        (big ? caption(165, y0 + 155, 30) + text(165, y0 + 205, 'View all comments', { size: 28, family: SANS, fill: muted }) : '') +
        ctx.logo(165, y0 + (big ? 245 : 125), big ? 330 : 270);
    },
  };
}

// ---------------------------------------------------------------- Locket
const LOCKET_CAPTIONS = ['us ✦', 'best day ever', 'core memory', 'besties ♡', 'so happy', 'love this', 'this one', 'forever'];

function locketStyle({ id, name, description, bg, ink, muted, ring, inner, pill, logo, cut }) {
  const shutter = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${ring}" stroke-width="${r * 0.17}"/><circle cx="${x}" cy="${y}" r="${r * 0.74}" fill="${inner}"/>`;
  const topPill = (cx, small) => {
    const w = small ? 300 : 380;
    const h = small ? 56 : 64;
    return `<rect x="${cx - w / 2}" y="${224 - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${pill}"/>` +
      text(cx, 224 + (small ? 11 : 13), 'Peak friends ⌄', { size: small ? 30 : 34, family: SANS, weight: 'bold', fill: ink, anchor: 'middle' });
  };
  return {
    id,
    name,
    description,
    logo,
    cut,
    corners: { radius: 72, fill: bg },
    background: (w, h) => `<rect width="${w}" height="${h}" fill="${bg}"/>`,
    opening: () => '',
    extras: (ctx) => {
      if (ctx.product.header) return '';
      if (ctx.kind === 'sheet') return `<circle cx="221" cy="224" r="30" fill="${pill}"/>` + text(221, 236, 'P', { size: 32, family: SANS, weight: 'bold', fill: ink, anchor: 'middle' }) + topPill(1252, false);
      return topPill(stripCenterX, true);
    },
    header: () => topPill(1252, false).replace(/224/g, '300') +
      text(1252, 500, 'our little widget', { size: 110, family: 'Avenir Next', weight: '600', fill: ink, anchor: 'middle' }) +
      [0, 1, 2, 3, 4].map((i) => `<circle cx="${1252 - 200 + i * 100}" cy="595" r="34" fill="${['#f05e81', '#f2c94c', '#6fcf97', '#56ccf2', '#bb6bd9'][i]}" stroke="${bg}" stroke-width="6"/>`).join(''),
    overPhotos: ({ openings, kind }) => openings.map(([x, y, w, h], i) => {
      const label = LOCKET_CAPTIONS[(kind === 'strip' ? i % (openings.length / 2) : i) % LOCKET_CAPTIONS.length];
      const size = w > 1500 ? 48 : 38;
      const pw = label.length * size * 0.6 + 70;
      const ph = size + 34;
      const cx = x + w / 2;
      const py = y + h - ph - 36;
      return `<rect x="${cx - pw / 2}" y="${py}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="#000000" opacity="0.45"/>` +
        `<text x="${cx}" y="${py + ph / 2 + size * 0.36}" font-size="${size}" font-family="Avenir Next" font-weight="600" fill="#ffffff" text-anchor="middle">${esc(label)}</text>`;
    }).join(''),
    footer: (ctx) => {
      const { area, kind } = ctx;
      if (kind === 'sheet') {
        return ctx.logo(area.x + 40, area.y + 120, 440) +
          shutter(1252, area.y + 260, 100) +
          text(1252, area.y + 440, 'History ⌄', { size: 40, family: SANS, weight: 'bold', fill: muted, anchor: 'middle' }) +
          text(area.x + 46, area.y + 420, 'good memories always fit.', { size: 40, family: 'Avenir Next', style: 'italic', fill: muted });
      }
      const big = area.h > 500;
      return ctx.logo(170, area.y + (big ? 60 : 30), big ? 360 : 300) + shutter(745, area.y + (big ? 140 : 100), big ? 70 : 58) +
        text(170, area.y + (big ? 300 : 225), 'good memories always fit.', { size: big ? 32 : 28, family: 'Avenir Next', style: 'italic', fill: muted });
    },
  };
}

const socialStyles = [
  igStyle({ id: 'instagram-dark', name: 'Instagram Dark', description: 'Dark-mode post: story-ring avatar, likes, caption; Our Story as a profile grid.', bg: '#0f0f0f', ink: '#f5f5f5', muted: '#a8a8a8', link: '#8ab4f8', line: '#262626', logo: 'white', cut: '#555555' }),
  igStyle({ id: 'instagram-blush', name: 'Instagram Blush', description: 'The same post layout on Peak blush.', bg: '#f6dce0', ink: '#1c1c1c', muted: '#8e6e72', link: '#00376b', line: '#e2b9c0', logo: 'ink', cut: '#c98a95' }),
  locketStyle({ id: 'locket-dark', name: 'Locket Dark', description: 'Widget look: rounded photos, caption pills, gold shutter button.', bg: '#151515', ink: '#f5f5f5', muted: '#9a9a9a', ring: '#f2c94c', inner: '#f4e3c1', pill: '#2a2a2a', logo: 'white', cut: '#555555' }),
  locketStyle({ id: 'locket-cream', name: 'Locket Cream', description: 'Widget look on warm cream with a brown shutter.', bg: '#f1e3cb', ink: '#2b2118', muted: '#8a7660', ring: '#2b2118', inner: '#e9b872', pill: '#e2cfae', logo: 'ink', cut: '#a8916f' }),
];

module.exports = { socialStyles };
