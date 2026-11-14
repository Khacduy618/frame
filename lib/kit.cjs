/**
 * Shared paths for the frame kit. Nothing machine-specific is hard-coded:
 *   PEAK_LOGO       path to the Peak Photobooth logo PNG (default assets/branding/peak-logo-top.png)
 *   PHOTOBOOTH_APP  path to a photoboothai_cameraos checkout; when set, finalize/export also run
 *                   the app's own importer (scripts/frame-generator/validate-frames.ts)
 *   FRAME_OUT       output folder (default <kit>/out)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const sharp = require('sharp');
const layout = require('./layout.cjs');

function logoPath() {
  const p = path.resolve(process.env.PEAK_LOGO || path.join(ROOT, 'assets/branding/peak-logo-top.png'));
  if (!fs.existsSync(p)) {
    throw new Error(`Peak logo not found at ${path.relative(process.cwd(), p) || p}. Copy public/branding/peak-logo-top.png from the app into assets/branding/ (or set PEAK_LOGO).`);
  }
  return p;
}

/** Path to the app checkout used for importer validation, or null. */
function appRoot() {
  const p = process.env.PHOTOBOOTH_APP;
  if (!p) return null;
  const abs = path.resolve(p);
  return fs.existsSync(path.join(abs, 'scripts/frame-generator/validate-frames.ts')) ? abs : null;
}

const outDir = (...parts) => {
  const d = path.resolve(process.env.FRAME_OUT || path.join(ROOT, 'out'), ...parts);
  fs.mkdirSync(d, { recursive: true });
  return d;
};

module.exports = { ROOT, sharp, layout, logoPath, appRoot, outDir };
