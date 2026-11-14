# Peak Frame Kit

Tools and finished designs for **Peak Photobooth** print frames: Canon SELPHY CP1000, PNG
**2504 × 3732 px** (106 × 158 mm at 600 DPI), transparent photo openings, strips printed 2-up.

The design skill that drives this kit lives in
[skills-create-frame](https://github.com/Khacduy618/skills-create-frame).

## Setup

```bash
npm install
cp <path-to-app>/public/branding/peak-logo-top.png assets/branding/   # or: export PEAK_LOGO=...
```

Optional, to also run the app's own importer on every frame:

```bash
export PHOTOBOOTH_APP=<path-to-photoboothai_cameraos>
```

Without it, `frame-tool` still runs its built-in checks (opening geometry, strip copy, QR corner,
light areas, transparency). With it, it also runs `scripts/frame-generator/validate-frames.ts`
from the app — the same code Admin › Frames › Import uses.

Fonts: designs use macOS system fonts (Futura, Didot, Avenir Next, Noteworthy, American
Typewriter, Bradley Hand…). On other systems sharp/librsvg substitutes fonts.

## Layout

| Path | What |
|---|---|
| `lib/layout.cjs` | Openings, QR corners, footer/header bands per product. **Copy of the app's `scripts/frame-generator/layout.cjs` — keep them identical** |
| `lib/kit.cjs` | Paths, logo, optional app importer (`PEAK_LOGO`, `PHOTOBOOTH_APP`, `FRAME_OUT`) |
| `bin/frame-tool.cjs` | `products`, `base`, `guides`, `logo`, `sticker`, `upscale`, `compose`, `finalize`, `export` (run with `--help`) |
| `generator/` | Pattern/vector styles for all 5 products (`npm run generate`) |
| `designs/` | Finished Đà Nẵng designs, each rebuildable with one command |
| `themes/danang/` | `copy.md` (all text on the frames) and `assets/` (your licensed images, not in git) |
| `docs/frame-spec.md`, `docs/guides/` | Print spec and guide overlays for Canva |

## Products

| Key | Product | Openings |
|---|---|---|
| `spotlight` | SPOTLIGHT (1 photo) | (189, 260) 2126 × 2658 |
| `memories` | MEMORIES (sheet 4) | 2 × 2, 1028 × 1287 |
| `ourStory` | OUR STORY (sheet 6) | 2 × 3, 1028 × 685, header band |
| `youAndMe` | YOU & ME (strip 2 ×2) | 992 × 1240, right strip = left + 1181 px |
| `moments` | MOMENTS (strip 4 ×2) | 992 × 661, right strip = left + 1181 px |

`node bin/frame-tool.cjs products` prints the exact numbers.

## Designs

| Command | Design | Product | Needs your images |
|---|---|---|---|
| `npm run design:dragon-night` | Dragon Bridge at night, fireworks | MEMORIES | no |
| `npm run design:vector-sunset` | Flat travel poster at sunset | MEMORIES | no |
| `npm run design:food` | Food scrapbook (bánh xèo, mì Quảng, signpost…) | OUR STORY | no |
| `npm run design:journal` | Travel journal with photo cards | OUR STORY | yes |
| `npm run design:airmail` | Airmail letter, perforated stamp mats | YOU & ME | yes (stamp) |

Output: `out/<design>/peak-<product>-2504x3732.png` plus `*.preview.png` (guides drawn on top).
Image files for `journal`/`airmail` go in `themes/danang/assets/` (names in
`themes/danang/README.md`); they are third-party artwork and never committed.

## Rules the tools enforce

- Openings are exact transparent rectangles at the `layout.cjs` positions (re-punched by `finalize`).
- Strips: only the left strip is designed; `finalize` copies it +1181 px and draws the cut line at x 1252.
- **No QR zone is drawn.** The 283 × 283 bottom-right corner (each strip) holds background only;
  the booth stamps its own QR at print time.
- Nothing large and near-white outside the openings (the importer would read it as an opening);
  page fully opaque outside the openings.
- Stickers on photos only in the outer 12 % side/bottom band (`"overPhoto": true`).
- Raster assets never enlarged above 1.0× (`compose` warns; use `frame-tool upscale`).
- Peak logo on every frame and strip.

## Hand-off to the booth (Windows)

```bash
node bin/frame-tool.cjs export --src out/danang-food --name danang-food
```

Writes `~/Desktop/Peak Frames/<name>/` (PNG only, `CHECKSUMS.sha256`, `HUONG-DAN-IMPORT.txt`) and
`<name>.zip`. Send the zip as a file (USB, Google Drive) — never as a photo in chat apps — then
Admin › Frames › Import on the booth PC (YOU & ME: choose the Strip 2 product).
