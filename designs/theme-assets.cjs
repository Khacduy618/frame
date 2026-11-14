/**
 * Locates the user's own (licensed) images in themes/<theme>/assets. These files are NOT in git:
 * they are third-party artwork whose rights are recorded in assets/SOURCES.md.
 */
const fs = require('fs');
const path = require('path');
const { ROOT } = require('../lib/kit.cjs');

const NAMES = {
  beach: ['beach.jpeg', 'beach.jpg', 'beach.png'],
  bridgePoster: ['caurongdanang.jpeg', 'caurongdanang.jpg', 'caurongdanang.png'],
  dragonHead: ['dau-rong.png'],
  stamp: ['stamp-dragon-bridge.jpeg', 'stamp-dragon-bridge.jpg', 'Da Nang Vietnam Dragon Bridge Peninsula Stamp Sticker.jpeg'],
};

function themeDir(theme = 'danang') {
  return path.join(ROOT, 'themes', theme);
}

function asset(key, theme = 'danang') {
  const dir = path.join(themeDir(theme), 'assets');
  for (const n of NAMES[key]) if (fs.existsSync(path.join(dir, n))) return path.join(dir, n);
  throw new Error(`Missing asset "${key}": put one of ${NAMES[key].join(' / ')} in themes/${theme}/assets/ (see themes/${theme}/README.md)`);
}

module.exports = { asset, themeDir, NAMES };
