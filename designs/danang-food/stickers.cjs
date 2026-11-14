/**
 * Original flat-vector food stickers for the Đà Nẵng food scrapbook.
 * Each export returns { vb: [w, h], svg: '<g>…</g>' } drawn in its own viewBox.
 * Colours avoid importer-light greys (any light tone keeps saturation > 20).
 */
const C = {
  green: '#2F5D46', greenDk: '#24473A', leaf: '#5E9F45', leafLt: '#86BF5A', leafDk: '#3D7A34',
  red: '#D6453A', redDk: '#A9302A', mustard: '#E8B84A', cream: '#FFF4E2', paper: '#F6EAD3',
  crepe: '#F3B935', crepeDk: '#DE9420', crepeLt: '#F8D272', shrimp: '#F0835A', shrimpDk: '#D2603F',
  rattan: '#C99A5B', rattanDk: '#A9773E', rattanLt: '#DDB57A', sauce: '#E2793A', chili: '#C8322B',
  bowl: '#D6E6F0', bowlBlue: '#2F5E9E', broth: '#E6A53A', noodle: '#F6D46B', pork: '#B9654A', egg: '#F6EBD2', yolk: '#F2B53A',
  peanut: '#C98B4B', sesame: '#3B2A20', cracker: '#EAD3A2', wood: '#8B5E3C', woodDk: '#6E4529', ink: '#2B2B2B',
  glass: '#BFDCDB', avo: '#9CC56B', avoDk: '#7AA84D', coconut: '#F4E6CC', coffee: '#4A2C1F', milk: '#E9CFA0', metal: '#A9B2BB', metalDk: '#7F8A95',
  hat: '#E2C27E', hatDk: '#C9A45E', ribbon: '#D6453A',
};
const f = (n) => (Math.round(n * 10) / 10).toString();

/** Bánh xèo on a woven tray with herbs and dipping sauce. */
function banhXeo() {
  let s = '';
  // tray
  s += `<circle cx="400" cy="400" r="385" fill="${C.rattanDk}"/><circle cx="400" cy="400" r="362" fill="${C.rattan}"/>`;
  for (let r = 330; r > 40; r -= 26) s += `<circle cx="400" cy="400" r="${r}" fill="none" stroke="${C.rattanDk}" stroke-width="5" stroke-dasharray="14 10" opacity="0.55"/>`;
  s += `<circle cx="400" cy="400" r="362" fill="none" stroke="${C.rattanLt}" stroke-width="8" stroke-dasharray="22 12"/>`;
  // banana leaf
  s += `<path d="M110 520 C140 300 330 150 640 170 C600 420 420 600 110 520 Z" fill="${C.leafDk}"/><path d="M130 505 C170 320 340 190 610 190 C570 410 400 570 130 505 Z" fill="${C.leaf}"/>`;
  s += `<path d="M135 500 C300 420 460 310 600 195" fill="none" stroke="${C.leafLt}" stroke-width="6"/>`;
  for (let i = 0; i < 8; i++) { const t = 0.12 + i * 0.1; const x = 135 + 465 * t, y = 500 - 305 * t; s += `<path d="M${f(x)} ${f(y)} l${f(-40 + i * 2)} ${f(-55 + i * 3)}" stroke="${C.leafLt}" stroke-width="3" opacity="0.7"/>`; }
  // herbs (lettuce + mint) on the left
  const blob = (cx, cy, r, col, rot) => `<path transform="translate(${cx} ${cy}) rotate(${rot})" d="M0 ${-r} C${r * 0.9} ${-r * 0.9} ${r * 1.1} ${r * 0.2} ${r * 0.2} ${r} C${-r * 0.4} ${r * 1.1} ${-r * 1.1} ${r * 0.3} ${-r * 0.8} ${-r * 0.4} C${-r * 0.6} ${-r * 0.9} ${-r * 0.3} ${-r} 0 ${-r} Z" fill="${col}"/>`;
  [[170, 420, 95, C.leafDk, 10], [215, 330, 85, C.leaf, -30], [150, 300, 70, C.leafLt, 40], [260, 255, 60, C.leafDk, 0], [120, 380, 60, C.leaf, 70], [205, 480, 60, C.leafLt, -10]].forEach((b) => (s += blob(...b)));
  for (let i = 0; i < 6; i++) s += `<path d="M${180 + i * 12} ${300 + i * 25} q30 -10 50 6" fill="none" stroke="${C.leafLt}" stroke-width="3" opacity="0.8"/>`;
  // two folded crêpes (half moons)
  const crepe = (cx, cy, r, rot) => {
    let c = `<g transform="translate(${cx} ${cy}) rotate(${rot})">`;
    c += `<path d="M${-r} 0 A${r} ${r} 0 0 0 ${r} 0 Q0 ${-r * 0.12} ${-r} 0 Z" fill="${C.crepeDk}"/>`;
    c += `<path d="M${-r + 10} 4 A${r - 10} ${r - 10} 0 0 0 ${r - 10} 4 Q0 ${-r * 0.06} ${-r + 10} 4 Z" fill="${C.crepe}"/>`;
    // lace holes + crispy specks
    for (let i = 0; i < 26; i++) { const a = Math.PI * (0.08 + (i * 0.84) / 26), rr = r * (0.35 + ((i * 37) % 50) / 100); c += `<ellipse cx="${f(Math.cos(a) * rr)}" cy="${f(Math.sin(a) * rr)}" rx="${7 + (i % 3) * 3}" ry="${4 + (i % 2) * 2}" fill="${i % 3 ? C.crepeLt : C.crepeDk}" opacity="0.85"/>`; }
    // shrimp + sprouts peeking at the fold
    c += `<path d="M${-r * 0.45} 2 C${-r * 0.45} -40 ${-r * 0.1} -46 ${-r * 0.05} -8 C${-r * 0.12} -26 ${-r * 0.35} -24 ${-r * 0.33} 2 Z" fill="${C.shrimp}"/>`;
    c += `<path d="M${-r * 0.42} -6 l12 -14 M${-r * 0.32} -16 l10 -14 M${-r * 0.2} -18 l6 -14" stroke="${C.shrimpDk}" stroke-width="3"/>`;
    c += `<path d="M${r * 0.15} 2 C${r * 0.18} -38 ${r * 0.5} -40 ${r * 0.52} -6 C${r * 0.44} -22 ${r * 0.26} -22 ${r * 0.27} 2 Z" fill="${C.shrimp}"/>`;
    for (let i = 0; i < 5; i++) c += `<path d="M${f(-r * 0.05 + i * 14)} 0 q4 -${18 + i * 3} 12 -${24 + i * 2}" stroke="${C.cream}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    return c + '</g>';
  };
  s += crepe(470, 360, 230, 25) + crepe(430, 520, 220, 10);
  // dipping bowl
  s += `<circle cx="230" cy="600" r="110" fill="${C.bowlBlue}"/><circle cx="230" cy="600" r="98" fill="${C.bowl}"/><circle cx="230" cy="600" r="78" fill="${C.sauce}"/>`;
  for (let i = 0; i < 10; i++) s += `<circle cx="${190 + ((i * 29) % 80)}" cy="${565 + ((i * 41) % 70)}" r="${5 + (i % 3)}" fill="${i % 2 ? C.chili : C.cream}"/>`;
  s += `<path d="M180 580 q30 -18 70 0 M195 630 q25 14 60 -4" stroke="${C.mustard}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  return { vb: [800, 800], svg: s };
}

/** Mì Quảng in a blue-and-white bowl with a sesame rice cracker. */
function miQuang() {
  let s = '';
  // sesame rice cracker behind
  s += `<g transform="rotate(-18 520 230)"><ellipse cx="520" cy="230" rx="210" ry="200" fill="${C.cracker}"/>`;
  let seed = 5;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 90; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 0.9;
    const x = 520 + Math.cos(a) * 210 * r, y = 230 + Math.sin(a) * 200 * r;
    s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="5.5" ry="2.8" fill="${C.sesame}" transform="rotate(${f(rnd() * 180)} ${f(x)} ${f(y)})"/>`;
  }
  s += `<ellipse cx="520" cy="230" rx="210" ry="200" fill="none" stroke="${C.crepeDk}" stroke-width="6" opacity="0.5"/></g>`;
  // bowl body
  s += `<path d="M90 400 C100 600 230 700 400 700 C570 700 700 600 710 400 Z" fill="${C.bowl}"/>`;
  s += `<path d="M90 400 C100 600 230 700 400 700 C570 700 700 600 710 400" fill="none" stroke="${C.bowlBlue}" stroke-width="10"/>`;
  // blue pattern band + waves
  s += `<path d="M120 470 C260 500 540 500 680 470" fill="none" stroke="${C.bowlBlue}" stroke-width="8"/>`;
  for (let i = 0; i < 7; i++) { const x = 160 + i * 80; s += `<path d="M${x} 540 c14 -22 34 -22 48 0 s34 22 48 0" fill="none" stroke="${C.bowlBlue}" stroke-width="6" opacity="${i % 2 ? 0.9 : 0.6}"/>`; }
  s += `<path d="M250 640 C330 668 470 668 550 640" fill="none" stroke="${C.bowlBlue}" stroke-width="6"/>`;
  s += `<rect x="330" y="690" width="140" height="34" rx="12" fill="${C.bowlBlue}"/>`;
  // rim + broth
  s += `<ellipse cx="400" cy="400" rx="312" ry="92" fill="${C.bowlBlue}"/><ellipse cx="400" cy="400" rx="296" ry="80" fill="${C.bowl}"/><ellipse cx="400" cy="408" rx="270" ry="66" fill="${C.broth}"/>`;
  // noodles
  for (let i = 0; i < 9; i++) s += `<path d="M${170 + i * 40} ${430 - (i % 3) * 6} q30 -${30 + (i % 4) * 6} 70 -6" fill="none" stroke="${C.noodle}" stroke-width="14" stroke-linecap="round"/>`;
  // toppings: pork, shrimp, quail eggs, peanuts, herbs
  s += `<path d="M190 392 q40 -30 90 -4 q-30 26 -90 4 Z" fill="${C.pork}"/><path d="M270 372 q46 -22 88 6 q-36 22 -88 -6 Z" fill="${C.pork}"/>`;
  s += `<path d="M380 360 C380 320 440 316 450 350 C436 336 400 340 404 362 Z" fill="${C.shrimp}"/><path d="M460 380 C462 340 520 336 528 372 C514 358 482 360 486 382 Z" fill="${C.shrimp}"/>`;
  s += `<ellipse cx="560" cy="400" rx="38" ry="26" fill="${C.egg}"/><circle cx="560" cy="400" r="14" fill="${C.yolk}"/><ellipse cx="610" cy="420" rx="32" ry="22" fill="${C.egg}"/><circle cx="610" cy="420" r="12" fill="${C.yolk}"/>`;
  for (let i = 0; i < 18; i++) s += `<ellipse cx="${250 + ((i * 41) % 330)}" cy="${400 + ((i * 23) % 40)}" rx="9" ry="6" fill="${C.peanut}"/>`;
  [[330, 420], [430, 430], [520, 440]].forEach(([x, y]) => (s += `<path d="M${x} ${y} c10 -30 40 -30 46 -6 c-16 -6 -30 -2 -46 6 Z" fill="${C.leaf}"/>`));
  // chopsticks
  s += `<path d="M560 250 L780 520" stroke="${C.woodDk}" stroke-width="14" stroke-linecap="round"/><path d="M600 236 L790 470" stroke="${C.wood}" stroke-width="14" stroke-linecap="round"/>`;
  return { vb: [800, 760], svg: s };
}

/** Avocado smoothie with coconut ice cream (sinh tố bơ dầm). */
function sinhToBo() {
  let s = '';
  s += `<path d="M140 180 L180 720 C182 742 198 752 220 752 L380 752 C402 752 418 742 420 720 L460 180 Z" fill="${C.glass}"/>`;
  s += `<path d="M156 260 L188 700 C190 716 200 722 216 722 L384 722 C400 722 410 716 412 700 L444 260 Z" fill="${C.avo}"/>`;
  for (let i = 0; i < 5; i++) s += `<path d="M${170 + i * 4} ${330 + i * 80} C260 ${310 + i * 80} 340 ${350 + i * 80} ${430 - i * 4} ${320 + i * 80}" fill="none" stroke="${C.avoDk}" stroke-width="10" opacity="0.5"/>`;
  // ice cream scoop + coconut flakes + peanuts
  s += `<path d="M150 260 C150 150 450 150 450 260 C420 280 180 280 150 260 Z" fill="${C.coconut}"/>`;
  s += `<path d="M150 260 C190 240 220 290 260 262 C300 238 330 290 370 262 C400 244 430 280 450 260" fill="${C.coconut}"/>`;
  for (let i = 0; i < 14; i++) s += `<path d="M${200 + ((i * 37) % 210)} ${170 + ((i * 29) % 70)} l${12 + (i % 3) * 4} -6" stroke="${C.crepeLt}" stroke-width="5" stroke-linecap="round"/>`;
  for (let i = 0; i < 8; i++) s += `<ellipse cx="${210 + ((i * 47) % 190)}" cy="${190 + ((i * 31) % 50)}" rx="9" ry="6" fill="${C.peanut}"/>`;
  // straw + avocado half
  s += `<path d="M330 60 L300 300" stroke="${C.red}" stroke-width="22" stroke-linecap="round"/><path d="M330 60 L300 300" stroke="${C.cream}" stroke-width="22" stroke-dasharray="18 18" stroke-linecap="butt" opacity="0.9"/>`;
  s += `<g transform="rotate(-20 520 640)"><ellipse cx="520" cy="640" rx="110" ry="140" fill="#3F6B2A"/><ellipse cx="520" cy="645" rx="96" ry="126" fill="#CFE08A"/><ellipse cx="520" cy="680" rx="48" ry="52" fill="${C.wood}"/><ellipse cx="506" cy="664" rx="14" ry="10" fill="${C.peanut}"/></g>`;
  // glass highlight
  s += `<path d="M178 300 L206 690" stroke="${C.cream}" stroke-width="10" stroke-linecap="round" opacity="0.55"/>`;
  return { vb: [660, 780], svg: s };
}

/** Vietnamese drip coffee (cà phê phin) with condensed milk. */
function caPhe() {
  let s = '';
  s += `<path d="M120 300 L150 620 C152 640 166 650 186 650 L334 650 C354 650 368 640 370 620 L400 300 Z" fill="${C.glass}"/>`;
  s += `<path d="M138 420 L156 610 C158 624 168 630 182 630 L338 630 C352 630 362 624 364 610 L382 420 Z" fill="${C.coffee}"/>`;
  s += `<path d="M156 560 L160 610 C162 624 172 630 186 630 L334 630 C348 630 358 624 360 610 L364 560 Z" fill="${C.milk}"/>`;
  s += `<path d="M150 330 L174 600" stroke="${C.cream}" stroke-width="8" stroke-linecap="round" opacity="0.55"/>`;
  // phin
  s += `<rect x="100" y="270" width="320" height="34" rx="10" fill="${C.metalDk}"/><path d="M150 120 L370 120 L352 280 L168 280 Z" fill="${C.metal}"/>`;
  s += `<rect x="140" y="96" width="240" height="34" rx="12" fill="${C.metalDk}"/><rect x="236" y="56" width="48" height="44" rx="10" fill="${C.metalDk}"/>`;
  s += `<path d="M180 150 L196 260" stroke="${C.cream}" stroke-width="10" stroke-linecap="round" opacity="0.5"/>`;
  s += `<path d="M258 304 L258 400" stroke="${C.coffee}" stroke-width="10" stroke-linecap="round" stroke-dasharray="20 18"/>`;
  return { vb: [520, 680], svg: s };
}

/** Wooden signpost with arrow signs (dish names) and a nón lá on top. */
function signpost(labels) {
  const colors = [C.green, C.red, C.mustard, C.green, C.red];
  const ink = [C.cream, C.cream, C.greenDk, C.cream, C.cream];
  const P = 540;
  let s = `<rect x="${P - 23}" y="150" width="46" height="1000" rx="10" fill="${C.wood}"/><rect x="${P - 23}" y="150" width="14" height="1000" fill="${C.woodDk}" opacity="0.6"/>`;
  s += `<rect x="${P - 57}" y="1120" width="114" height="40" rx="12" fill="${C.woodDk}"/>`;
  labels.forEach((t, i) => {
    const y = 250 + i * 170;
    const dir = i % 2 ? -1 : 1;
    const w = Math.max(330, 40 + t.length * 30);
    const x0 = dir > 0 ? P - 40 : P + 40 - w;
    const tip = dir > 0 ? x0 + w + 46 : x0 - 46;
    const d = dir > 0
      ? `M${x0} ${y} L${x0 + w} ${y} L${tip} ${y + 55} L${x0 + w} ${y + 110} L${x0} ${y + 110} Z`
      : `M${x0 + w} ${y} L${x0} ${y} L${tip} ${y + 55} L${x0} ${y + 110} L${x0 + w} ${y + 110} Z`;
    s += `<g transform="rotate(${dir * (2 + (i % 2))} ${P} ${y + 55})"><path d="${d}" fill="${C.woodDk}" transform="translate(6 8)" opacity="0.35"/><path d="${d}" fill="${colors[i % colors.length]}"/>`;
    s += `<path d="${d}" fill="none" stroke="${C.cream}" stroke-width="6" transform="translate(${dir * 0} 0) scale(1)" opacity="0.9" stroke-dasharray="0" />`;
    s += `<text x="${x0 + w / 2 + (dir > 0 ? 6 : -6)}" y="${y + 72}" font-family="Avenir Next Condensed" font-weight="900" font-size="52" fill="${ink[i % ink.length]}" text-anchor="middle" letter-spacing="2">${t}</text></g>`;
  });
  // nón lá hanging on top
  const g = `<g transform="translate(${P - 293} 0)">` +
    `<path d="M293 20 L470 165 C380 190 206 190 116 165 Z" fill="${C.hat}"/>` +
    Array.from({ length: 6 }, (_, k) => `<path d="M293 22 L${116 + (k + 1) * 50} ${f(165 + Math.sin(((k + 1) / 7) * Math.PI) * 18)}" stroke="${C.hatDk}" stroke-width="4"/>`).join('') +
    `<path d="M116 165 C206 190 380 190 470 165" fill="none" stroke="${C.hatDk}" stroke-width="8"/>` +
    `<path d="M200 178 C210 240 250 260 280 250 M386 178 C380 240 340 262 310 250" fill="none" stroke="${C.ribbon}" stroke-width="10" stroke-linecap="round"/></g>`;
  return { vb: [1080, 1170], svg: s + g };
}

/** Extruded wordmark (Noteworthy Bold, cream face, forest-green 3D shadow). */
function wordmark(text, size = 230) {
  const w = Math.round(text.length * size * 0.62 + 120);
  const h = Math.round(size * 1.45);
  let s = '';
  for (let k = 26; k > 0; k--) s += `<text x="${40 + k * 1.7}" y="${size + 30 + k * 1.7}" font-family="Noteworthy" font-weight="bold" font-size="${size}" fill="${C.greenDk}" stroke="${C.greenDk}" stroke-width="18" stroke-linejoin="round">${text}</text>`;
  s += `<text x="40" y="${size + 30}" font-family="Noteworthy" font-weight="bold" font-size="${size}" fill="${C.cream}" stroke="${C.green}" stroke-width="18" stroke-linejoin="round" paint-order="stroke">${text}</text>`;
  return { vb: [w, h], svg: s };
}

module.exports = { banhXeo, miQuang, sinhToBo, caPhe, signpost, wordmark, C };
