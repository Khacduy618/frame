/**
 * Đà Nẵng airmail letter (YOU & ME strip). Left strip only; frame-tool copies it +1181 px.
 *   node designs/danang-airmail/build.cjs
 * Needs the stamp image in themes/danang/assets (not in git).
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { outDir, layout } = require('../../lib/kit.cjs');
const { compose } = require('../../lib/run.cjs');

const dir = outDir('danang-airmail');
execFileSync(process.execPath, [path.join(__dirname, 'build-assets.cjs'), dir], { stdio: 'inherit' });
fs.copyFileSync(path.join(__dirname, 'spec.json'), path.join(dir, 'spec.json'));
compose(path.join(dir, 'spec.json'), path.join(dir, layout.PRODUCTS.youAndMe.file));
