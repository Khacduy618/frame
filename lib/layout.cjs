/**
 * Frame layout from docs/frame-templates/README.md (Canon SELPHY CP1000, 106 x 158 mm @600 DPI).
 * Every generated frame uses exactly these numbers; the importer checks the openings within 2 px.
 */

const W = 2504;
const H = 3732;
const TRIM = { x: 71, y: 118, w: 2362, h: 3496 }; // 100 x 148 mm
const SAFE = { x: 142, y: 189, w: 2220, h: 3354 };
const STRIP_SHIFT = 1181; // right strip = left strip moved 50 mm
const CUT_X = 1252;
const QR_BOX = 283;

const PRODUCTS = {
  spotlight: {
    file: 'peak-spotlight-2504x3732.png',
    label: 'SPOTLIGHT',
    strip: false,
    openings: [[189, 260, 2126, 2658]],
    qr: [[2079, 3260]],
    footer: { x: 142, y: 2950, w: 2220, h: 593 },
  },
  memories: {
    file: 'peak-memories-2504x3732.png',
    label: 'MEMORIES',
    strip: false,
    openings: [[189, 260, 1028, 1287], [1287, 260, 1028, 1287], [189, 1618, 1028, 1287], [1287, 1618, 1028, 1287]],
    qr: [[2079, 3260]],
    footer: { x: 142, y: 2940, w: 2220, h: 603 },
  },
  ourStory: {
    file: 'peak-our-story-2504x3732.png',
    label: 'OUR STORY',
    strip: false,
    openings: [685, 1441, 2197].flatMap((y) => [[189, y, 1028, 685], [1287, y, 1028, 685]]),
    qr: [[2079, 3260]],
    header: { x: 142, y: 189, w: 2220, h: 470 },
    footer: { x: 142, y: 2915, w: 2220, h: 628 },
  },
  youAndMe: {
    file: 'peak-you-and-me-strip-2504x3732.png',
    label: 'YOU & ME',
    strip: true,
    // per strip, in the left strip's coordinates (page x for the left strip)
    openings: [[165, 260, 992, 1240], [165, 1571, 992, 1240]],
    qr: [[898, 3260]],
    footer: { x: 142, y: 2840, w: 1040, h: 703 },
  },
  moments: {
    file: 'peak-moments-strip-2504x3732.png',
    label: 'MOMENTS',
    strip: true,
    openings: [[165, 260, 992, 661], [165, 992, 992, 661], [165, 1724, 992, 661], [165, 2457, 992, 661]],
    qr: [[898, 3260]],
    footer: { x: 142, y: 3140, w: 1040, h: 403 },
  },
};

/** All openings of a product in page coordinates (strips: both copies). */
function pageOpenings(product) {
  if (!product.strip) return product.openings;
  return [...product.openings, ...product.openings.map(([x, y, w, h]) => [x + STRIP_SHIFT, y, w, h])];
}

module.exports = { W, H, TRIM, SAFE, STRIP_SHIFT, CUT_X, QR_BOX, PRODUCTS, pageOpenings };
