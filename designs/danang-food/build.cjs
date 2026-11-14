/**
 * Đà Nẵng food scrapbook (OUR STORY): original vector food stickers + compose spec.
 *   node designs/danang-food/build.cjs
 * Signpost labels come from copy.md "signpost:" (comma separated) when present.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { outDir, layout } = require('../../lib/kit.cjs');
const { compose } = require('../../lib/run.cjs');
const { themeDir } = require('../theme-assets.cjs');

const dir = outDir('danang-food');
const node = (script, ...args) => execFileSync(process.execPath, [path.join(__dirname, script), ...args], { stdio: 'inherit' });

const copy = fs.readFileSync(path.join(themeDir('danang'), 'copy.md'), 'utf8');
const m = copy.match(/^-\s*signpost\s*:\s*(.+)$/m);
const labels = m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : [];

fs.mkdirSync(path.join(dir, 'stickers'), { recursive: true });
node('paper.cjs', path.join(dir, 'paper.png'));
node('render-stickers.cjs', path.join(dir, 'stickers'), ...labels);
node('doodles.cjs', path.join(dir, 'stickers'));
fs.copyFileSync(path.join(__dirname, 'spec.json'), path.join(dir, 'spec.json'));
compose(path.join(dir, 'spec.json'), path.join(dir, layout.PRODUCTS.ourStory.file));
