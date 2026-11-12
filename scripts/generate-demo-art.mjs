// Generates the Marilicht demo artwork (product renders, logo, cover, previews).
// Run with: node scripts/generate-demo-art.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "demo", "marilicht");
mkdirSync(OUT, { recursive: true });

const NAVY = "#0A2342";
const ABYSS = "#061528";
const AQUA = "#3CC3E3";

const f = (n) => Number(n.toFixed(1));

const BRAND = "MARILICHT";
/** Font size that fits the brand name across a label of the given width. */
const fitBrand = (width) => f(Math.min(30, (width * 0.84 - 14) / 6.1));

/** Classic PET bottle silhouette, centred on x = 200 in a 400×600 box. */
function bottlePath({ neckW, bodyW, neckTop, shoulderStart, shoulderEnd, bottom, r = 26, waist = 0, waistTop = 0, waistBottom = 0 }) {
  const cx = 200;
  const nL = cx - neckW / 2, nR = cx + neckW / 2;
  const bL = cx - bodyW / 2, bR = cx + bodyW / 2;
  const k = (shoulderEnd - shoulderStart) * 0.55;
  let right = `L ${f(nR)} ${f(shoulderStart)} C ${f(nR)} ${f(shoulderStart + k)} ${f(bR)} ${f(shoulderEnd - k)} ${f(bR)} ${f(shoulderEnd)}`;
  let left = `L ${f(bL)} ${f(shoulderEnd)} C ${f(bL)} ${f(shoulderEnd - k)} ${f(nL)} ${f(shoulderStart + k)} ${f(nL)} ${f(shoulderStart)}`;
  if (waist) {
    const mid = (waistTop + waistBottom) / 2;
    const q = (waistBottom - waistTop) / 2;
    right += ` L ${f(bR)} ${f(waistTop)} C ${f(bR)} ${f(waistTop + q * 0.6)} ${f(bR - waist)} ${f(mid - q * 0.4)} ${f(bR - waist)} ${f(mid)} C ${f(bR - waist)} ${f(mid + q * 0.4)} ${f(bR)} ${f(waistBottom - q * 0.6)} ${f(bR)} ${f(waistBottom)}`;
    left = `L ${f(bL)} ${f(waistBottom)} C ${f(bL)} ${f(waistBottom - q * 0.6)} ${f(bL + waist)} ${f(mid + q * 0.4)} ${f(bL + waist)} ${f(mid)} C ${f(bL + waist)} ${f(mid - q * 0.4)} ${f(bL)} ${f(waistTop + q * 0.6)} ${f(bL)} ${f(waistTop)} ` + left;
  }
  return `M ${f(nL)} ${f(neckTop)} L ${f(nR)} ${f(neckTop)} ${right} L ${f(bR)} ${f(bottom - r)} Q ${f(bR)} ${f(bottom)} ${f(bR - r)} ${f(bottom)} L ${f(bL + r)} ${f(bottom)} Q ${f(bL)} ${f(bottom)} ${f(bL)} ${f(bottom - r)} ${left} Z`;
}

function defs(id) {
  return `
  <defs>
    <linearGradient id="${id}-plastic" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#7FCFE6" stop-opacity="0.95"/>
      <stop offset="0.18" stop-color="#CFEFF8" stop-opacity="0.75"/>
      <stop offset="0.5" stop-color="#F3FCFF" stop-opacity="0.45"/>
      <stop offset="0.82" stop-color="#BFE8F4" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#5FBFDC" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="${id}-water" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#8EDDF0" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#2FA9D3" stop-opacity="0.75"/>
    </linearGradient>
    <linearGradient id="${id}-shine" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.25" stop-color="#fff" stop-opacity="0.9"/>
      <stop offset="0.8" stop-color="#fff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="${id}-cap" x1="0" x2="1">
      <stop offset="0" stop-color="${ABYSS}"/>
      <stop offset="0.45" stop-color="#1B4E80"/>
      <stop offset="1" stop-color="${ABYSS}"/>
    </linearGradient>
    <linearGradient id="${id}-label" x1="0" x2="1">
      <stop offset="0" stop-color="#DCEFF6"/>
      <stop offset="0.35" stop-color="#FFFFFF"/>
      <stop offset="0.7" stop-color="#F4FAFC"/>
      <stop offset="1" stop-color="#C9E4EE"/>
    </linearGradient>
    <radialGradient id="${id}-shadow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${ABYSS}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${ABYSS}" stop-opacity="0"/>
    </radialGradient>
  </defs>`;
}

function dropMark(cx, cy, s, color = NAVY) {
  // A droplet with a wave cut, the Marilicht mark.
  return `<g transform="translate(${cx} ${cy}) scale(${s})">
    <path d="M0 -18 C 7 -8 12 -1 12 6 A 12 12 0 0 1 -12 6 C -12 -1 -7 -8 0 -18 Z" fill="${color}"/>
    <path d="M-10 6 C -5 2 -1 9 4 5 C 7 3 9 4 11 5 A 11.5 11.5 0 0 1 -10 6 Z" fill="${AQUA}"/>
  </g>`;
}

function classicBottle({ id, size, neckW, bodyW, neckTop, shoulderStart, shoulderEnd, bottom, capH = 34, capW, waist = 0, waistTop = 0, waistBottom = 0, labelTop, labelH, sport = false, waterLine }) {
  const path = bottlePath({ neckW, bodyW, neckTop, shoulderStart, shoulderEnd, bottom, waist, waistTop, waistBottom });
  const capTop = neckTop - capH;
  const cw = capW ?? neckW + 12;
  const ridges = Array.from({ length: Math.floor(cw / 7) }, (_, i) => {
    const x = 200 - cw / 2 + 5 + i * 7;
    return `<line x1="${f(x)}" y1="${f(capTop + 6)}" x2="${f(x)}" y2="${f(capTop + capH - 5)}" stroke="#fff" stroke-opacity="0.12" stroke-width="2"/>`;
  }).join("");
  const sportCap = sport
    ? `<path d="M ${200 - 14} ${capTop - 30} Q 200 ${capTop - 40} ${200 + 14} ${capTop - 30} L ${200 + 18} ${capTop} L ${200 - 18} ${capTop} Z" fill="${AQUA}"/>
       <rect x="${200 - 9}" y="${capTop - 44}" width="18" height="16" rx="6" fill="#E8F8FC"/>`
    : "";
  const ringY = neckTop + 6;
  const lw = bodyW + 4;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  ${defs(id)}
  <clipPath id="${id}-clip"><path d="${path}"/></clipPath>
  <ellipse cx="200" cy="${bottom + 6}" rx="${bodyW * 0.62}" ry="14" fill="url(#${id}-shadow)"/>
  <g>
    <path d="${path}" fill="url(#${id}-plastic)"/>
    <g clip-path="url(#${id}-clip)">
      <path d="M 0 ${waterLine} C 90 ${waterLine - 9} 150 ${waterLine + 9} 220 ${waterLine} S 340 ${waterLine - 8} 400 ${waterLine} L 400 600 L 0 600 Z" fill="url(#${id}-water)"/>
      <path d="M 0 ${waterLine} C 90 ${waterLine - 9} 150 ${waterLine + 9} 220 ${waterLine} S 340 ${waterLine - 8} 400 ${waterLine}" fill="none" stroke="#fff" stroke-opacity="0.8" stroke-width="2"/>
      <rect x="${200 - lw / 2}" y="${labelTop}" width="${lw}" height="${labelH}" fill="url(#${id}-label)"/>
      <rect x="${200 - lw / 2}" y="${labelTop}" width="${lw}" height="3" fill="${AQUA}"/>
      <rect x="${200 - lw / 2}" y="${labelTop + labelH - 3}" width="${lw}" height="3" fill="${AQUA}"/>
      ${dropMark(200, labelTop + labelH * 0.3, Math.min(1.1, labelH / 100))}
      <text x="200" y="${labelTop + labelH * 0.68}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${fitBrand(bodyW)}" fill="${NAVY}" letter-spacing="1.5">${BRAND}</text>
      <text x="200" y="${labelTop + labelH * 0.68 + Math.min(18, labelH / 5.5)}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${Math.min(9.5, bodyW / 15)}" fill="${NAVY}" fill-opacity="0.7" letter-spacing="1.6">${size}</text>
      <rect x="${200 - bodyW * 0.33}" y="${neckTop}" width="${bodyW * 0.07}" height="${bottom - neckTop}" fill="url(#${id}-shine)" opacity="0.85"/>
      <rect x="${200 + bodyW * 0.22}" y="${neckTop + 30}" width="${bodyW * 0.035}" height="${bottom - neckTop - 60}" fill="url(#${id}-shine)" opacity="0.55"/>
    </g>
    <path d="${path}" fill="none" stroke="${NAVY}" stroke-opacity="0.22" stroke-width="1.5"/>
    <rect x="${200 - neckW / 2 - 4}" y="${ringY}" width="${neckW + 8}" height="7" rx="3" fill="#BFE6F2" stroke="${NAVY}" stroke-opacity="0.18"/>
  </g>
  ${sportCap}
  <rect x="${200 - cw / 2}" y="${capTop}" width="${cw}" height="${capH}" rx="7" fill="url(#${id}-cap)"/>
  ${ridges}
</svg>`;
}

function jug({ id, size }) {
  // 5 L jug: rectangular body, top handle.
  const path = "M 170 120 L 230 120 L 232 150 C 232 170 300 172 300 205 L 300 520 Q 300 548 272 548 L 128 548 Q 100 548 100 520 L 100 205 C 100 172 168 170 168 150 Z";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  ${defs(id)}
  <clipPath id="${id}-clip"><path d="${path}"/></clipPath>
  <ellipse cx="200" cy="554" rx="140" ry="14" fill="url(#${id}-shadow)"/>
  <path d="M 236 160 C 290 150 312 168 312 196 L 300 205 C 296 186 280 176 240 182 Z" fill="#BFE6F2" stroke="${NAVY}" stroke-opacity="0.2"/>
  <path d="${path}" fill="url(#${id}-plastic)"/>
  <g clip-path="url(#${id}-clip)">
    <path d="M 0 232 C 90 222 150 242 220 232 S 340 224 400 232 L 400 600 L 0 600 Z" fill="url(#${id}-water)"/>
    <path d="M 0 232 C 90 222 150 242 220 232 S 340 224 400 232" fill="none" stroke="#fff" stroke-opacity="0.8" stroke-width="2"/>
    <rect x="96" y="300" width="208" height="150" fill="url(#${id}-label)"/>
    <rect x="96" y="300" width="208" height="3" fill="${AQUA}"/>
    <rect x="96" y="447" width="208" height="3" fill="${AQUA}"/>
    ${dropMark(200, 344, 1.5)}
    <text x="200" y="400" text-anchor="middle" font-family="Georgia, serif" font-size="${fitBrand(200)}" fill="${NAVY}" letter-spacing="1.5">${BRAND}</text>
    <text x="200" y="422" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="${NAVY}" fill-opacity="0.7" letter-spacing="2.4">SPRING WATER · ${size}</text>
    <rect x="124" y="140" width="14" height="400" fill="url(#${id}-shine)" opacity="0.8"/>
    <rect x="262" y="210" width="7" height="300" fill="url(#${id}-shine)" opacity="0.5"/>
    ${[250, 270, 470, 490].map((y) => `<rect x="100" y="${y}" width="200" height="2" fill="#fff" opacity="0.35"/>`).join("")}
  </g>
  <path d="${path}" fill="none" stroke="${NAVY}" stroke-opacity="0.22" stroke-width="1.5"/>
  <rect x="160" y="88" width="80" height="36" rx="8" fill="url(#${id}-cap)"/>
</svg>`;
}

function dispenser({ id, size }) {
  // 18.9 L dispenser bottle with ribs.
  const path = "M 178 96 L 222 96 L 222 128 C 222 150 318 150 318 196 L 318 516 Q 318 548 286 548 L 114 548 Q 82 548 82 516 L 82 196 C 82 150 178 150 178 128 Z";
  const ribs = [228, 264, 476, 512]
    .map((y) => `<path d="M 82 ${y} Q 200 ${y + 10} 318 ${y}" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="5"/><path d="M 82 ${y + 6} Q 200 ${y + 16} 318 ${y + 6}" fill="none" stroke="${NAVY}" stroke-opacity="0.08" stroke-width="3"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  ${defs(id)}
  <clipPath id="${id}-clip"><path d="${path}"/></clipPath>
  <ellipse cx="200" cy="554" rx="158" ry="15" fill="url(#${id}-shadow)"/>
  <path d="${path}" fill="url(#${id}-plastic)"/>
  <g clip-path="url(#${id}-clip)">
    <path d="M 0 176 C 90 166 150 186 220 176 S 340 168 400 176 L 400 600 L 0 600 Z" fill="url(#${id}-water)"/>
    <path d="M 0 176 C 90 166 150 186 220 176 S 340 168 400 176" fill="none" stroke="#fff" stroke-opacity="0.8" stroke-width="2"/>
    ${ribs}
    <rect x="78" y="300" width="244" height="150" fill="url(#${id}-label)"/>
    <rect x="78" y="300" width="244" height="3" fill="${AQUA}"/>
    <rect x="78" y="447" width="244" height="3" fill="${AQUA}"/>
    ${dropMark(200, 344, 1.5)}
    <text x="200" y="400" text-anchor="middle" font-family="Georgia, serif" font-size="${fitBrand(240)}" fill="${NAVY}" letter-spacing="1.5">${BRAND}</text>
    <text x="200" y="422" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="${NAVY}" fill-opacity="0.7" letter-spacing="2.4">DISPENSER REFILL · ${size}</text>
    <rect x="108" y="150" width="16" height="390" fill="url(#${id}-shine)" opacity="0.8"/>
    <rect x="280" y="200" width="8" height="300" fill="url(#${id}-shine)" opacity="0.5"/>
  </g>
  <path d="${path}" fill="none" stroke="${NAVY}" stroke-opacity="0.22" stroke-width="1.5"/>
  <rect x="168" y="62" width="64" height="38" rx="9" fill="url(#${id}-cap)"/>
  <rect x="176" y="70" width="48" height="6" rx="3" fill="#fff" fill-opacity="0.18"/>
</svg>`;
}

const files = {
  "bottle-50cl.svg": classicBottle({ id: "b50", size: "50CL", neckW: 46, bodyW: 132, neckTop: 132, shoulderStart: 170, shoulderEnd: 250, bottom: 548, waist: 7, waistTop: 300, waistBottom: 380, labelTop: 392, labelH: 112, waterLine: 214 }),
  "bottle-75cl-sport.svg": classicBottle({ id: "b75", size: "75CL", neckW: 50, bodyW: 146, neckTop: 150, shoulderStart: 176, shoulderEnd: 246, bottom: 548, labelTop: 330, labelH: 136, waterLine: 222, sport: true, capH: 30 }),
  "bottle-1-5l.svg": classicBottle({ id: "b15", size: "1.5L", neckW: 48, bodyW: 176, neckTop: 96, shoulderStart: 130, shoulderEnd: 236, bottom: 548, waist: 10, waistTop: 270, waistBottom: 360, labelTop: 372, labelH: 128, waterLine: 196 }),
  "jug-5l.svg": jug({ id: "j5", size: "5L" }),
  "dispenser-18-9l.svg": dispenser({ id: "d19", size: "18.9L" }),
};

// Logo: navy disc with a white droplet and an aqua wave.
files["logo.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <radialGradient id="g" cx="0.32" cy="0.25" r="0.9">
      <stop offset="0" stop-color="#1D4E80"/>
      <stop offset="0.6" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="${ABYSS}"/>
    </radialGradient>
    <linearGradient id="w" x1="0" x2="1"><stop offset="0" stop-color="#7FE0F4"/><stop offset="1" stop-color="${AQUA}"/></linearGradient>
  </defs>
  <rect width="256" height="256" rx="128" fill="url(#g)"/>
  <path d="M128 46 C 152 80 172 106 172 136 A 44 44 0 0 1 84 136 C 84 106 104 80 128 46 Z" fill="#fff"/>
  <path d="M86 140 C 100 126 114 150 130 138 C 144 128 156 132 170 140 A 42 42 0 0 1 86 140 Z" fill="url(#w)"/>
  <path d="M112 92 C 104 104 100 114 100 124" stroke="${AQUA}" stroke-opacity="0.45" stroke-width="6" stroke-linecap="round" fill="none"/>
</svg>`;

// Cover: light falling through water.
const rays = Array.from({ length: 9 }, (_, i) => {
  const x = 120 + i * 170;
  const w = 40 + ((i * 37) % 70);
  return `<polygon points="${x},0 ${x + w},0 ${x + w * 3.2 - 160},900 ${x - 160},900" fill="url(#ray)" opacity="${(0.25 + ((i * 13) % 30) / 100).toFixed(2)}"/>`;
}).join("");
const caustic = Array.from({ length: 14 }, (_, i) => {
  const y = 520 + i * 28;
  const a = 10 + (i % 4) * 6;
  return `<path d="M -50 ${y} C 150 ${y - a} 300 ${y + a} 500 ${y} S 850 ${y - a} 1050 ${y} S 1400 ${y + a} 1650 ${y}" fill="none" stroke="#BFF3FF" stroke-opacity="${(0.05 + (i % 5) * 0.025).toFixed(3)}" stroke-width="${1 + (i % 3)}"/>`;
}).join("");
const bubbles = [
  [210, 640, 6], [260, 560, 3], [1260, 520, 5], [1320, 610, 8], [1180, 700, 3], [420, 760, 4], [980, 760, 5], [1450, 420, 4], [140, 450, 3],
].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#E6FBFF" stroke-opacity="0.55" stroke-width="1.5"/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 4}" fill="#fff" fill-opacity="0.6"/>`).join("");
files["cover.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#7FDDF0"/>
      <stop offset="0.35" stop-color="#2AA6CF"/>
      <stop offset="0.75" stop-color="#0F4F84"/>
      <stop offset="1" stop-color="${NAVY}"/>
    </linearGradient>
    <linearGradient id="ray" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.62" cy="-0.05" r="0.7">
      <stop offset="0" stop-color="#fff" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#sea)"/>
  <rect width="1600" height="900" fill="url(#sun)"/>
  ${rays}
  <path d="M0 40 C 200 70 380 10 600 36 S 1000 80 1200 40 S 1480 10 1600 34 L 1600 0 L 0 0 Z" fill="#E9FBFF" fill-opacity="0.55"/>
  <path d="M0 70 C 240 96 420 46 640 66 S 1040 110 1240 72 S 1500 50 1600 66" fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="2"/>
  ${caustic}
  ${bubbles}
</svg>`;

// Website preview: a believable homepage screenshot.
files["website-preview.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <linearGradient id="hero" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#E7F7FB"/>
      <stop offset="1" stop-color="#BDE9F4"/>
    </linearGradient>
    <linearGradient id="btl" x1="0" x2="1"><stop offset="0" stop-color="#7FCFE6"/><stop offset="0.5" stop-color="#F3FCFF"/><stop offset="1" stop-color="#5FBFDC"/></linearGradient>
  </defs>
  <rect width="1200" height="750" fill="#fff"/>
  <rect width="1200" height="520" fill="url(#hero)"/>
  ${dropMark(84, 60, 1.25)}
  <text x="108" y="68" font-family="Georgia, serif" font-size="24" fill="${NAVY}" letter-spacing="1">Marilicht</text>
  ${["Our water", "Delivery", "Business", "About"].map((t, i) => `<text x="${620 + i * 120}" y="66" font-family="Helvetica, Arial" font-size="16" fill="${NAVY}" fill-opacity="0.75">${t}</text>`).join("")}
  <rect x="1090" y="42" width="80" height="38" rx="19" fill="${NAVY}"/>
  <text x="1130" y="66" text-anchor="middle" font-family="Helvetica, Arial" font-size="15" fill="#fff">Order</text>
  <text x="84" y="230" font-family="Georgia, serif" font-size="78" fill="${NAVY}">Pure water,</text>
  <text x="84" y="316" font-family="Georgia, serif" font-size="78" fill="${NAVY}">delivered.</text>
  <text x="86" y="372" font-family="Helvetica, Arial" font-size="20" fill="${NAVY}" fill-opacity="0.65">From our protected spring to your home and office.</text>
  <rect x="84" y="410" width="190" height="56" rx="28" fill="${NAVY}"/>
  <text x="179" y="445" text-anchor="middle" font-family="Helvetica, Arial" font-size="18" fill="#fff">Start a delivery</text>
  <rect x="290" y="410" width="160" height="56" rx="28" fill="none" stroke="${NAVY}" stroke-opacity="0.4"/>
  <text x="370" y="445" text-anchor="middle" font-family="Helvetica, Arial" font-size="18" fill="${NAVY}">Our range</text>
  <circle cx="900" cy="300" r="210" fill="#fff" fill-opacity="0.45"/>
  <path d="M870 120 L 930 120 L 930 150 C 930 170 1010 175 1010 220 L 1010 470 Q 1010 500 980 500 L 820 500 Q 790 500 790 470 L 790 220 C 790 175 870 170 870 150 Z" fill="url(#btl)" stroke="${NAVY}" stroke-opacity="0.2"/>
  <rect x="790" y="320" width="220" height="110" fill="#fff" fill-opacity="0.9"/>
  ${dropMark(900, 352, 1.2)}
  <text x="900" y="400" text-anchor="middle" font-family="Georgia, serif" font-size="${fitBrand(220)}" fill="${NAVY}" letter-spacing="1.5">${BRAND}</text>
  <rect x="860" y="92" width="80" height="32" rx="6" fill="${NAVY}"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="${84 + i * 270}" y="570" width="250" height="150" rx="16" fill="#F4FAFC"/><rect x="${108 + i * 270}" y="600" width="120" height="14" rx="7" fill="${NAVY}" fill-opacity="0.75"/><rect x="${108 + i * 270}" y="628" width="180" height="10" rx="5" fill="${NAVY}" fill-opacity="0.2"/><rect x="${108 + i * 270}" y="648" width="150" height="10" rx="5" fill="${NAVY}" fill-opacity="0.2"/>`).join("")}
</svg>`;

// Promotion artwork: refill offer.
files["promo-refill.svg"] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="1200" height="600">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#43C9E8"/>
      <stop offset="1" stop-color="#1786B8"/>
    </linearGradient>
    <linearGradient id="btl" x1="0" x2="1"><stop offset="0" stop-color="#A8E6F5" stop-opacity="0.9"/><stop offset="0.5" stop-color="#F3FCFF" stop-opacity="0.65"/><stop offset="1" stop-color="#7FD3EA" stop-opacity="0.95"/></linearGradient>
  </defs>
  <rect width="1200" height="600" fill="url(#bg)"/>
  ${Array.from({ length: 10 }, (_, i) => `<circle cx="${880}" cy="${300}" r="${80 + i * 46}" fill="none" stroke="#fff" stroke-opacity="${(0.22 - i * 0.02).toFixed(2)}" stroke-width="2"/>`).join("")}
  <g transform="translate(700 40) scale(0.9)">
    <path d="M 178 96 L 222 96 L 222 128 C 222 150 318 150 318 196 L 318 516 Q 318 548 286 548 L 114 548 Q 82 548 82 516 L 82 196 C 82 150 178 150 178 128 Z" fill="url(#btl)" stroke="${NAVY}" stroke-opacity="0.2" stroke-width="2"/>
    <rect x="82" y="300" width="236" height="140" fill="#fff" fill-opacity="0.92"/>
    ${dropMark(200, 344, 1.5)}
    <text x="200" y="402" text-anchor="middle" font-family="Georgia, serif" font-size="${fitBrand(236)}" fill="${NAVY}" letter-spacing="1.5">${BRAND}</text>
    <rect x="168" y="62" width="64" height="38" rx="9" fill="${NAVY}"/>
  </g>
</svg>`;

for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(OUT, name), svg.trim() + "\n");
  console.log("wrote", name);
}
