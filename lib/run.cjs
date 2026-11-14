/** Helpers for design build scripts: call bin/frame-tool.cjs the same way a person would. */
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT } = require('./kit.cjs');

const TOOL = path.join(ROOT, 'bin', 'frame-tool.cjs');

function tool(args, opts = {}) {
  execFileSync(process.execPath, [TOOL, ...args], { stdio: 'inherit', ...opts });
}

/** Raw page PNG -> importer-ready frame (+ .preview.png). */
const finalize = (raw, product, out, style) => tool(['finalize', raw, '--product', product, '--out', out, '--style', style]);

/** spec.json (paths relative to its folder) -> importer-ready frame. */
const compose = (spec, out) => tool(['compose', path.basename(spec), '--out', path.resolve(out)], { cwd: path.dirname(spec) });

/** Cut a sticker from a flat-background image. */
const sticker = (src, out, extra = []) => tool(['sticker', src, '--out', out, ...extra]);

module.exports = { tool, finalize, compose, sticker, TOOL };
