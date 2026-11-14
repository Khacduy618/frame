# Frame design guide (Canon SELPHY CP1000)

Every frame is a PNG of **2504 × 3732 px (106 × 158 mm at 600 DPI)**, portrait.
The guide PNGs in this folder show bleed (red), trim (black), safe zone (blue dashed),
photo openings (green) and the QR area (amber). Put the guide on the top layer in Canva,
design under it, delete it before export.

| Zone | Size / position | Rule |
| --- | --- | --- |
| Page | 2504 × 3732 px | Canva custom size in **px** |
| Bleed | outer 3 mm left/right (71 px), 5 mm top/bottom (118 px) | Background colour/pattern continues to the page edge; nothing important here — the printer cuts it off |
| Trim (paper) | x 71–2433, y 118–3614 px (100 × 148 mm) | What the guest gets on paper and sees on screen |
| Safe zone | ≥ 3 mm inside trim: x 142–2362, y 189–3543 px | Text, logo, date must stay inside |
| QR area | 12 × 12 mm box inside the safe line, bottom-right of the trim (strips: of each strip) | Keep free of text and logos, but **no white box**: the booth prints a 200 px (8.5 mm) QR with its own white margin, centred in it, ~4.75 mm from the paper edge. The screen, share image and video have no QR, so an empty box would show there |
| Photo openings | see each product | Fully **transparent**, or a flat **pure white #FFFFFF** box (no shadow, no texture) |

## Rules that make the import work

1. Export **PNG**, size 1×. Transparent openings are best (Canva Pro: "Transparent background", and no full-page fill under the openings). Otherwise use flat #FFFFFF boxes.
2. Never use white or very light grey (lighter than ~#C8C8C8, low colour) for any other large area: the importer treats it as a photo opening. Light pastel backgrounds need some colour (e.g. #F5E1DC, not #FAF0EE).
3. Openings are rectangles with straight edges, not touching the page edge.
4. Strips: design the LEFT strip, then **duplicate it and move it exactly +1181 px (50 mm) to the right**. Draw the dashed cut line at x = 1252 px (53 mm). The importer rejects strips that are not exact copies.
5. **Every frame carries the Peak Photobooth logo** (`public/branding/peak-logo-top.png`, ink or white on dark backgrounds), inside the safe zone. Each strip has its own logo. No frame without the brand.

## Products (px, top-left x/y, width × height)

| Product | Openings |
| --- | --- |
| SPOTLIGHT (Postcard, 1 photo) | (189, 260) 2126 × 2658 |
| MEMORIES (Sheet 4) | (189, 260) (1287, 260) (189, 1618) (1287, 1618) — each 1028 × 1287 |
| OUR STORY (Sheet 6, landscape photos) | x 189 / 1287; y 685 / 1441 / 2197 — each 1028 × 685 |
| YOU & ME (Strip 2, per strip) | left x 165, right x 1346; y 260 / 1571 — each 992 × 1240 |
| MOMENTS (Strip 4, per strip, landscape photos) | left x 165, right x 1346; y 260 / 992 / 1724 / 2457 — each 992 × 661 |

QR areas (283 × 283 px keep-clear area, background only, no white box): sheets x 2079, y 3260; strips x 898 and x 2079, y 3260. The printed QR itself is 200 × 200 px at x 2121, y 3302 (strips: x 940 and x 2121).

## Prompts (Canva Magic Design / AI image tools)

Common part, put in front of each product prompt:

> Photobooth print frame, portrait, exactly 2504 × 3732 px. Flat graphic design for a 10×15 cm photo print with 3 mm side and 5 mm top/bottom bleed: background colour and pattern extend fully to every page edge. Leave the photo openings as empty flat pure-white rectangles with sharp straight edges and no shadow, border glow or texture inside. Keep all text and logos at least 142 px from the left/right edges and 189 px from the top/bottom edges. Keep the 283 × 283 px area at x 2079, y 3260 (bottom-right, inside the safe area) free of text and logos, with the normal background (no white box). No large white or very light grey areas. Brand: "Peak Photobooth", ink #1C1C1C, blush #F5E1DC, accent pink #F05E81, font Plus Jakarta Sans, small uppercase labels in JetBrains Mono.

- **SPOTLIGHT:** one large portrait photo opening at x 189, y 260, 2126 × 2658 px (4:5). Below it a calm footer band (y 2950–3543) with the event title in Plus Jakarta Sans SemiBold, a date line in JetBrains Mono, and room for a guest handwritten note on the left; QR area bottom-right (background only).
- **MEMORIES:** four portrait photo openings 1028 × 1287 px in a 2 × 2 grid at (189, 260), (1287, 260), (189, 1618), (1287, 1618). Footer band below the grid with the event title and date; QR area bottom-right (background only).
- **OUR STORY:** a title band at the top (y 189–620) with the event name, then six landscape photo openings 1028 × 685 px in 2 columns × 3 rows at x 189 / 1287 and y 685 / 1441 / 2197. Footer band below with the date; QR area bottom-right (background only).
- **YOU & ME (strip ×2):** two identical vertical 2×6 strips side by side, separated by a thin dashed cut line at x 1252. Each strip has two portrait photo openings 992 × 1240 px at y 260 and y 1571 (left strip x 165, right strip x 1346), and a short logo/date block at the bottom, leaving the 283 px QR area in its bottom-right safe corner (x 898 and x 2079, y 3260) free with the normal background. The right strip is an exact copy of the left strip shifted 1181 px.
- **MOMENTS (strip ×2):** two identical vertical 2×6 strips side by side with a thin dashed cut line at x 1252. Each strip has four landscape photo openings 992 × 661 px at y 260, 992, 1724, 2457 (left strip x 165, right strip x 1346), and a compact logo/date block at the bottom, leaving the 283 px QR area in its bottom-right safe corner (x 898 and x 2079, y 3260) free with the normal background. The right strip is an exact copy of the left strip shifted 1181 px.

After export: Admin › Frames › import. Strip sheets with 8 openings are detected automatically; for YOU & ME choose the Strip 2 product before publishing.

## Generating frames in batches

`scripts/frame-generator/` builds frames from these rules (exact openings, bleed, strip copy +1181 px, QR area as background, Peak logo required):

```bash
node scripts/frame-generator/generate-frames.cjs artifacts/frames            # all styles
node scripts/frame-generator/generate-frames.cjs artifacts/frames starry-night
npx jiti scripts/frame-generator/validate-frames.ts artifacts/frames         # checks with the app's importer
```

Styles live in `styles.cjs` and `styles-social.cjs` (Instagram / Locket layouts): background, opening border, Our Story header, footer, and optionally `corners` (rounded photo corners) and `overPhotos` (caption pills) drawn after the openings are punched. A style that renders no logo fails the build. The output is kept in `assets/frame-library/` (shipped with the installer).
