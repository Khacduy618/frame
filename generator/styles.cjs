/**
 * Ten frame styles (trends 2025–26: coquette bows, Y2K chrome, film negative, denim & lace, retro
 * checkerboard, Korean minimal, scrapbook, magazine cover, cherry gingham, starry night).
 *
 * Colour rule from the importer: an opaque pixel with min(R,G,B) >= 195 and saturation <= 20 is
 * read as a photo opening. Light colours here always carry colour (saturation > 20), and nothing
 * white or pale grey touches an opening.
 */
const { rng, text, heart, star, sparkle, bow, cherry, moon, scallops, barcode } = require('./shapes.cjs');

const MONO = 'Menlo';

/** Footer used by most styles: logo, tagline and a small caption, left of the QR area. */
function footer(ctx, { tagline, taglineFont = 'Georgia', taglineStyle = 'italic', taglineWeight = 'normal', taglineColor, caption, captionColor, logoWidth }) {
  const { area, kind } = ctx;
  if (kind === 'sheet') {
    const lw = logoWidth || 640;
    const lh = lw * 0.44;
    const x = area.x + 40;
    const y = area.y + 40;
    return ctx.logo(x, y, lw) +
      text(x + 6, y + lh + 120, tagline, { size: 100, family: taglineFont, style: taglineStyle, weight: taglineWeight, fill: taglineColor }) +
      (caption ? text(x + 8, y + lh + 200, caption, { size: 42, family: MONO, fill: captionColor, spacing: 6 }) : '');
  }
  const big = area.h > 500;
  const lw = logoWidth || (big ? 520 : 380);
  const lh = lw * 0.44;
  const cx = area.x + (898 - 30 - area.x) / 2;
  const y = area.y + (big ? 40 : 20);
  return ctx.logo(cx - lw / 2, y, lw) +
    text(cx, y + lh + (big ? 90 : 70), tagline, { size: big ? 56 : 46, family: taglineFont, style: taglineStyle, weight: taglineWeight, fill: taglineColor, anchor: 'middle' }) +
    (caption ? text(cx, y + lh + (big ? 170 : 132), caption, { size: big ? 30 : 26, family: MONO, fill: captionColor, anchor: 'middle', spacing: 5 }) : '');
}

/** Our Story title band. */
function header(ctx, { label, title, titleFont = 'Georgia', titleStyle = 'italic', titleWeight = 'normal', color, labelColor, deco = '' }) {
  return text(1252, 300, label, { size: 40, family: MONO, fill: labelColor || color, anchor: 'middle', spacing: 14 }) +
    text(1252, 500, title, { size: 124, family: titleFont, style: titleStyle, weight: titleWeight, fill: color, anchor: 'middle' }) + deco;
}

const frameRect = ([x, y, w, h], pad, stroke, sw, extra = '') =>
  `<rect x="${x - pad}" y="${y - pad}" width="${w + pad * 2}" height="${h + pad * 2}" fill="none" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;

const styles = [
  {
    id: 'coquette-bow',
    name: 'Coquette Bow',
    description: 'Blush pink, tiny hearts, lace edge and pink ribbon bows.',
    logo: 'ink',
    cut: '#c96b86',
    background: (w, h) => {
      let s = `<rect width="${w}" height="${h}" fill="#f6d1db"/>`;
      for (let y = 40; y < h; y += 92) for (let x = (y / 92) % 2 ? 40 : 86; x < w; x += 92) s += heart(x, y, 0.34, '#efb3c3');
      return s + scallops(0, 150, w, 26, '#f9dbe4', 1, '#f6d1db') + scallops(0, h - 150, w, 26, '#f9dbe4', -1, '#f6d1db');
    },
    opening: (o) => frameRect(o, 9, '#e07f9b', 14),
    header: (ctx) => header(ctx, { label: 'OUR STORY', title: 'sweet little moments', titleFont: 'Snell Roundhand', titleStyle: 'normal', titleWeight: 'bold', color: '#b8486a', deco: bow(560, 430, 1.3, '#e9779a') + bow(1944, 430, 1.3, '#e9779a') }),
    footer: (ctx) => footer(ctx, { tagline: 'sweet like you', taglineFont: 'Snell Roundhand', taglineStyle: 'normal', taglineWeight: 'bold', taglineColor: '#b8486a', caption: 'PEAK PHOTOBOOTH', captionColor: '#a8566f' }) +
      (ctx.kind === 'sheet' ? bow(ctx.area.x + 1200, ctx.area.y + 240, 1.6, '#e9779a') + heart(ctx.area.x + 1500, ctx.area.y + 380, 1.4, '#e07f9b') : bow(ctx.area.x + 70, ctx.area.y + 60, 0.9, '#e9779a')),
  },
  {
    id: 'y2k-chrome',
    name: 'Y2K Chrome',
    description: 'Lilac-to-sky gradient, chrome stars and sparkles, bubbly 2000s type.',
    logo: 'ink',
    cut: '#5b4fb8',
    background: (w, h) => {
      const r = rng(11);
      let s = `<defs><linearGradient id="y2kbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b7a3ff"/><stop offset="0.55" stop-color="#d6a8f0"/><stop offset="1" stop-color="#8fcfff"/></linearGradient>` +
        `<linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dcf2"/><stop offset="0.5" stop-color="#8d93b8"/><stop offset="1" stop-color="#c6cae6"/></linearGradient></defs>` +
        `<rect width="${w}" height="${h}" fill="url(#y2kbg)"/>`;
      for (let i = 0; i < 70; i++) s += sparkle(r() * w, r() * h, 8 + r() * 16, r() > 0.5 ? '#ffe97a' : '#ff8ad8');
      return s;
    },
    opening: (o) => frameRect(o, 10, '#6c5ce7', 16, 'rx="4"'),
    header: (ctx) => header(ctx, { label: '✦ OUR STORY ✦', title: 'BEST DAY EVER', titleFont: 'Futura', titleStyle: 'italic', titleWeight: 'bold', color: '#4b3aa8', deco: star(420, 440, 70, 'url(#chrome)', 0.42, '#5b4fb8', 4) + star(2084, 440, 70, 'url(#chrome)', 0.42, '#5b4fb8', 4) }),
    footer: (ctx) => footer(ctx, { tagline: 'y2k mood ✦', taglineFont: 'Futura', taglineStyle: 'italic', taglineWeight: 'bold', taglineColor: '#4b3aa8', caption: 'PEAK  ✦  PHOTOBOOTH', captionColor: '#5b4fb8' }) +
      (ctx.kind === 'sheet' ? star(ctx.area.x + 1300, ctx.area.y + 250, 110, 'url(#chrome)', 0.42, '#5b4fb8', 5) + star(ctx.area.x + 1560, ctx.area.y + 420, 60, 'url(#chrome)', 0.42, '#5b4fb8', 4) : star(ctx.area.x + 60, ctx.area.y + 50, 42, 'url(#chrome)', 0.42, '#5b4fb8', 3)),
  },
  {
    id: 'film-negative',
    name: 'Film Negative',
    description: 'Dark film stock with sprocket holes, orange edge codes, PEAK 400.',
    logo: 'white',
    cut: '#8a7a6a',
    background: (w, h, ctx) => {
      let s = `<rect width="${w}" height="${h}" fill="#1b1714"/>`;
      // sprocket holes in the side margins
      const cols = ctx.kind === 'sheet' ? [100, w - 144] : [96, w - 140];
      for (const x of cols) for (let y = 150; y < h - 120; y += 118) s += `<rect x="${x}" y="${y}" width="44" height="64" rx="9" fill="#3b332c"/>`;
      return s;
    },
    opening: (o) => frameRect(o, 7, '#3b332c', 8),
    extras: (ctx) => {
      let s = '';
      ctx.openings.forEach(([x, y, w], i) => {
        s += text(x + 4, y - 30, `▸ ${String(12 + i).padStart(2, '0')}A`, { size: 34, family: MONO, fill: '#f08a24', spacing: 3 });
        s += text(x + w - 4, y - 30, 'PEAK 400', { size: 34, family: MONO, fill: '#f08a24', anchor: 'end', spacing: 6 });
      });
      return s;
    },
    header: (ctx) => header(ctx, { label: '▸ OUR STORY ◂', title: 'shot on peak 400', titleFont: 'American Typewriter', titleStyle: 'normal', color: '#f3e6d6', labelColor: '#f08a24' }),
    footer: (ctx) => footer(ctx, { tagline: 'good memories always fit.', taglineFont: 'American Typewriter', taglineStyle: 'normal', taglineColor: '#f3e6d6', caption: 'PEAK FILM 400  ·  ISO 400', captionColor: '#f08a24' }),
  },
  {
    id: 'denim-lace',
    name: 'Denim & Lace',
    description: 'Denim twill, gold stitching, pink lace edges and embroidered patches.',
    palette: true,
    logo: 'white',
    cut: '#e9b872',
    background: (w, h) => {
      // Twill plus a repeating fibre tile (a random fibre layer made the PNG ~4 MB)
      let s = `<defs><pattern id="twill" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="14" height="14" fill="#2e3e66"/><rect width="7" height="14" fill="#38497a"/><rect width="14" height="2" fill="#26355a" opacity="0.7"/></pattern>` +
        `<pattern id="fibre" width="180" height="120" patternUnits="userSpaceOnUse"><rect x="12" y="20" width="9" height="2" fill="#5a6ea3" opacity="0.5"/><rect x="96" y="54" width="6" height="2" fill="#5a6ea3" opacity="0.5"/><rect x="140" y="98" width="11" height="2" fill="#5a6ea3" opacity="0.5"/><rect x="58" y="88" width="4" height="2" fill="#5a6ea3" opacity="0.5"/></pattern></defs>` +
        `<rect width="${w}" height="${h}" fill="url(#twill)"/><rect width="${w}" height="${h}" fill="url(#fibre)"/>`;
      return s + scallops(0, 150, w, 24, '#f3cfdb', 1, '#2e3e66') + scallops(0, h - 150, w, 24, '#f3cfdb', -1, '#2e3e66') +
        `<rect x="112" y="210" width="${w - 224}" height="${h - 420}" fill="none" stroke="#e9b872" stroke-width="5" stroke-dasharray="22 14"/>`;
    },
    opening: (o) => frameRect(o, 12, '#e9b872', 6, 'stroke-dasharray="20 12"'),
    header: (ctx) => header(ctx, { label: '♡ OUR STORY ♡', title: 'girl gang forever', titleFont: 'Snell Roundhand', titleStyle: 'normal', titleWeight: 'bold', color: '#f6c7d6', labelColor: '#e9b872' }),
    footer: (ctx) => {
      const patch = (x, y, label) => `<g transform="rotate(-8 ${x} ${y})"><rect x="${x - 120}" y="${y - 42}" width="240" height="84" rx="42" fill="#f49ab6" stroke="#e9b872" stroke-width="5" stroke-dasharray="10 6"/>${text(x, y + 16, label, { size: 46, family: 'Snell Roundhand', weight: 'bold', fill: '#7a1f3d', anchor: 'middle' })}</g>`;
      return footer(ctx, { tagline: 'xoxo, us', taglineFont: 'Snell Roundhand', taglineStyle: 'normal', taglineWeight: 'bold', taglineColor: '#f6c7d6', caption: 'PEAK FILM', captionColor: '#e9b872' }) +
        (ctx.kind === 'sheet' ? patch(ctx.area.x + 1300, ctx.area.y + 200, 'xoxo') + heart(ctx.area.x + 1560, ctx.area.y + 380, 1.6, '#f49ab6', '#e9b872', 3) + cherry(ctx.area.x + 1150, ctx.area.y + 420, 1.4) : heart(ctx.area.x + 60, ctx.area.y + 60, 0.9, '#f49ab6', '#e9b872', 3));
    },
  },
  {
    id: 'retro-checker',
    name: 'Retro Checker',
    description: '70s cream and chocolate checkerboard border, orange groovy type.',
    logo: 'ink',
    cut: '#2e2a26',
    background: (w, h) => {
      let s = `<rect width="${w}" height="${h}" fill="#f2dcae"/>`;
      const sq = 54;
      const band = (x0, y0, cols, rows) => {
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if ((r + c) % 2 === 0) s += `<rect x="${x0 + c * sq}" y="${y0 + r * sq}" width="${sq}" height="${sq}" fill="#3a2a20"/>`;
      };
      band(0, 0, Math.ceil(w / sq), 3); // top: bleed + 1 row in the trim
      band(0, h - sq * 3, Math.ceil(w / sq), 3);
      band(0, 0, 2, Math.ceil(h / sq));
      band(w - sq * 2, 0, 2, Math.ceil(h / sq));
      return s;
    },
    opening: (o) => `<rect x="${o[0] + 8}" y="${o[1] + 8}" width="${o[2] + 14}" height="${o[3] + 14}" fill="#e2702e"/>` + frameRect(o, 8, '#3a2a20', 12),
    header: (ctx) => header(ctx, { label: '★ OUR STORY ★', title: 'GOOD VIBES ONLY', titleFont: 'Futura', titleStyle: 'normal', titleWeight: 'bold', color: '#e2702e', labelColor: '#3a2a20' }),
    footer: (ctx) => footer(ctx, { tagline: 'good vibes only', taglineFont: 'Futura', taglineStyle: 'normal', taglineWeight: 'bold', taglineColor: '#e2702e', caption: 'PEAK  ★  PHOTOBOOTH', captionColor: '#3a2a20' }) +
      (ctx.kind === 'sheet' ? star(ctx.area.x + 1300, ctx.area.y + 260, 100, '#e2702e', 0.5, '#3a2a20', 6) + star(ctx.area.x + 1540, ctx.area.y + 430, 56, '#f2b134', 0.5, '#3a2a20', 5) : ''),
  },
  {
    id: 'korean-minimal',
    name: 'Korean Minimal',
    description: 'Warm beige, hairline frames, mono captions — the clean four-cut look.',
    logo: 'ink',
    cut: '#8a7f72',
    background: (w, h) => `<rect width="${w}" height="${h}" fill="#e8dcc9"/>`,
    opening: (o) => frameRect(o, 12, '#2b2b2b', 4),
    extras: (ctx) => ctx.openings.map(([x, y, w, h], i) => text(x + w, y + h + 50, `no. 0${i + 1}`, { size: 30, family: MONO, fill: '#6f665b', anchor: 'end', spacing: 4 })).join(''),
    header: (ctx) => header(ctx, { label: 'OUR STORY', title: 'today, us.', titleFont: 'Avenir Next', titleStyle: 'italic', titleWeight: '300', color: '#2b2b2b', labelColor: '#6f665b' }),
    footer: (ctx) => footer(ctx, { tagline: 'today, us.', taglineFont: 'Avenir Next', taglineStyle: 'italic', taglineWeight: '300', taglineColor: '#2b2b2b', caption: 'PEAK — PHOTO — ✦', captionColor: '#6f665b', logoWidth: ctx.kind === 'sheet' ? 520 : undefined }),
  },
  {
    id: 'scrapbook-kraft',
    name: 'Scrapbook Kraft',
    description: 'Kraft paper, cream photo mats, washi tape and handwritten notes.',
    logo: 'ink',
    cut: '#5a4636',
    background: (w, h) => {
      const r = rng(3);
      let s = `<rect width="${w}" height="${h}" fill="#c49d74"/>`;
      for (let i = 0; i < 2600; i++) s += `<circle cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" r="${(0.8 + r() * 2.4).toFixed(1)}" fill="${r() > 0.5 ? '#a9825c' : '#d6b38c'}"/>`;
      return s;
    },
    opening: (o, ctx) => {
      const [x, y, w, h] = o;
      const tape = (cx, cy, rot, fill) => `<rect x="${cx - 95}" y="${cy - 30}" width="190" height="60" fill="${fill}" opacity="0.85" transform="rotate(${rot} ${cx} ${cy})"/>`;
      const mat = ctx.kind === 'strip' ? 18 : 26;
      return `<rect x="${x - mat}" y="${y - mat}" width="${w + mat * 2}" height="${h + mat * 2}" fill="#efdcbf"/>` +
        tape(x + 20, y - 10, -32, '#f2a7b8') + tape(x + w - 20, y + h + 10, -32, '#9ed3c8');
    },
    header: (ctx) => header(ctx, { label: '~ our story ~', title: 'best day ever ♡', titleFont: 'Bradley Hand', titleStyle: 'normal', titleWeight: 'bold', color: '#4a3526', labelColor: '#5a4636' }),
    footer: (ctx) => footer(ctx, { tagline: 'best day ever ♡', taglineFont: 'Bradley Hand', taglineStyle: 'normal', taglineWeight: 'bold', taglineColor: '#4a3526', caption: 'peak photobooth', captionColor: '#5a4636' }) +
      (ctx.kind === 'sheet' ? `<path d="M${ctx.area.x + 1180} ${ctx.area.y + 360} q120 -140 260 -40" fill="none" stroke="#4a3526" stroke-width="6" stroke-linecap="round"/><path d="M${ctx.area.x + 1430} ${ctx.area.y + 300} l18 30 l-38 6" fill="none" stroke="#4a3526" stroke-width="6" stroke-linecap="round"/>` + star(ctx.area.x + 1620, ctx.area.y + 220, 46, 'none', 0.45, '#4a3526', 6) : ''),
  },
  {
    id: 'magazine-cover',
    name: 'Magazine Cover',
    description: 'Fashion-cover masthead in red, cover lines and a barcode.',
    logo: 'ink',
    cut: '#1c1c1c',
    background: (w, h) => `<rect width="${w}" height="${h}" fill="#ead8c3"/>`,
    opening: (o) => frameRect(o, 8, '#1c1c1c', 6),
    // One brand mark only: the Peak logo. Cover type says what the issue is, never "PEAK" again.
    header: () => text(1252, 280, 'THE PHOTOBOOTH ISSUE', { size: 38, family: MONO, fill: '#1c1c1c', anchor: 'middle', spacing: 10 }) +
      text(1252, 560, 'Our Story', { size: 250, family: 'Didot', style: 'italic', weight: 'bold', fill: '#d7262e', anchor: 'middle' }),
    footer: (ctx) => {
      const { area, kind } = ctx;
      if (kind === 'sheet') {
        return text(area.x + 40, area.y + 190, 'The Photobooth', { size: 150, family: 'Didot', style: 'italic', weight: 'bold', fill: '#d7262e' }) +
          text(area.x + 40, area.y + 340, 'Issue', { size: 150, family: 'Didot', style: 'italic', weight: 'bold', fill: '#d7262e' }) +
          text(area.x + 44, area.y + 440, 'GOOD MEMORIES ALWAYS FIT.', { size: 40, family: MONO, fill: '#1c1c1c', spacing: 8 }) +
          ctx.logo(area.x + 1390, area.y + 40, 500) +
          barcode(area.x + 1430, area.y + 300, 420, 120, '#1c1c1c') + text(area.x + 1640, area.y + 470, 'ISSUE No. 10', { size: 30, family: MONO, fill: '#1c1c1c', anchor: 'middle', spacing: 6 });
      }
      const cx = area.x + (898 - 30 - area.x) / 2;
      const big = area.h > 500;
      const lw = big ? 480 : 360;
      return ctx.logo(cx - lw / 2, area.y + 20, lw) +
        text(cx, area.y + 20 + lw * 0.44 + (big ? 70 : 52), 'THE PHOTOBOOTH ISSUE', { size: big ? 32 : 26, family: MONO, fill: '#d7262e', anchor: 'middle', spacing: 5 }) +
        barcode(cx - 150, area.y + 20 + lw * 0.44 + (big ? 110 : 76), 300, big ? 90 : 56, '#1c1c1c');
    },
  },
  {
    id: 'cherry-gingham',
    name: 'Cherry Gingham',
    description: 'Red picnic gingham, cherry stickers, cherry-on-top script.',
    logo: 'ink',
    cut: '#b8202f',
    background: (w, h) => {
      let s = `<rect width="${w}" height="${h}" fill="#f6c6cb"/>`;
      for (let x = 0; x < w; x += 120) s += `<rect x="${x}" y="0" width="60" height="${h}" fill="#e84a5a" opacity="0.3"/>`;
      for (let y = 0; y < h; y += 120) s += `<rect x="0" y="${y}" width="${w}" height="60" fill="#e84a5a" opacity="0.3"/>`;
      return s;
    },
    opening: (o) => frameRect(o, 10, '#b8202f', 14, 'rx="6"'),
    header: (ctx) => header(ctx, { label: '♥ OUR STORY ♥', title: 'cherry on top', titleFont: 'Georgia', titleStyle: 'italic', titleWeight: 'bold', color: '#b8202f', labelColor: '#7a1420', deco: cherry(470, 470, 2.2) + cherry(2034, 470, 2.2) }),
    footer: (ctx) => footer(ctx, { tagline: 'cherry on top', taglineFont: 'Georgia', taglineStyle: 'italic', taglineWeight: 'bold', taglineColor: '#b8202f', caption: 'PEAK PHOTOBOOTH', captionColor: '#7a1420' }) +
      (ctx.kind === 'sheet' ? cherry(ctx.area.x + 1300, ctx.area.y + 280, 3) + cherry(ctx.area.x + 1560, ctx.area.y + 430, 1.8) : cherry(ctx.area.x + 70, ctx.area.y + 90, 1.3)),
  },
  {
    id: 'starry-night',
    name: 'Starry Night',
    description: 'Midnight blue, gold stars and moon, constellations.',
    logo: 'white',
    cut: '#e8c46a',
    background: (w, h) => {
      const r = rng(21);
      let s = `<defs><linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a38"/><stop offset="1" stop-color="#2a3767"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#night)"/>`;
      for (let i = 0; i < 420; i++) s += `<circle cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" r="${(1 + r() * 3).toFixed(1)}" fill="#f6e3a8" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
      for (let i = 0; i < 26; i++) s += sparkle(r() * w, r() * h, 10 + r() * 14, '#e8c46a');
      return s;
    },
    opening: (o) => frameRect(o, 10, '#e8c46a', 8),
    header: (ctx) => header(ctx, { label: '☾ OUR STORY ☽', title: 'under the same stars', titleFont: 'Snell Roundhand', titleStyle: 'normal', titleWeight: 'bold', color: '#e8c46a', labelColor: '#c9b27a', deco: moon(400, 420, 80, '#e8c46a', '#16204a') }),
    footer: (ctx) => {
      const c = ctx.area;
      const cons = ctx.kind === 'sheet'
        ? `<path d="M${c.x + 1180} ${c.y + 380} L${c.x + 1300} ${c.y + 260} L${c.x + 1440} ${c.y + 320} L${c.x + 1560} ${c.y + 200}" fill="none" stroke="#c9b27a" stroke-width="3" opacity="0.8"/>` +
          [[1180, 380], [1300, 260], [1440, 320], [1560, 200]].map(([x, y]) => star(c.x + x, c.y + y, 22, '#e8c46a')).join('') + moon(c.x + 1720, c.y + 430, 70, '#e8c46a', '#26335f')
        : moon(c.x + 70, c.y + 70, 40, '#e8c46a', '#26335f');
      return footer(ctx, { tagline: 'under the same stars', taglineFont: 'Snell Roundhand', taglineStyle: 'normal', taglineWeight: 'bold', taglineColor: '#e8c46a', caption: 'PEAK  ☾  PHOTOBOOTH', captionColor: '#c9b27a' }) + cons;
    },
  },
];

module.exports = { styles: [...styles, ...require('./styles-social.cjs').socialStyles] };
