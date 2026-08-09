// The README masthead — a port of the portfolio's hero section.
//
// Same eyebrow, same two-line headline with the accent word carrying the
// sentence, same status strip. The site reveals each headline line by sliding
// it up out of its own clip (GSAP yPercent 115 + expo.out) and runs a cobalt
// "hot" layer inside the glyphs that follows the pointer; both are reproduced
// here in SMIL, with the blob sweeping on a slow loop since an image has no
// pointer to follow.
import { esc } from "./animate.js";
import { HERO_ROOM } from "./assets.generated.js";
import { T, DISPLAY, MONO, baseTextStyles, baseDefs, cardShell, maskReveal, riseIn, statusDot } from "./theme.js";

const WIDTH = 860;
const HEIGHT = 272;

// The room render, bled off the right edge like the site's hero. Its own
// aspect is 1010x740, so the height follows from the width rather than being
// guessed at.
const ROOM_X = 540;
const ROOM_Y = 26;
const ROOM_W = 336;
const ROOM_H = Math.round((ROOM_W * 740) / 1010);

// Where the copy stops and the art begins. The rule under the sub-copy ends
// here rather than running the full width — it belongs to the text column.
const TEXT_EDGE = 512;

const EYEBROW = "AI / ML ENGINEER";
const LINE_1 = "I build AI that";
const LINE_2A = "makes it to ";
const LINE_2B = "production.";
const SUB = [
    "I design and ship computer-vision, real-time inference and full-stack",
    "systems end to end — from the model to the interface people actually use.",
];

// Deterministic star positions: a seeded LCG keeps the field identical between
// renders, so a redeploy never produces a gratuitous diff.
function starfield(x0, x1, y0, y1) {
    let seed = 20260809;
    const rand = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
    };
    let out = "";
    for (let i = 0; i < 30; i++) {
        const cx = (x0 + rand() * (x1 - x0)).toFixed(1);
        const cy = (y0 + rand() * (y1 - y0)).toFixed(1);
        const r = (0.5 + rand() * 1.15).toFixed(2);
        const base = 0.18 + rand() * 0.5;
        const dur = (2.6 + rand() * 5).toFixed(1);
        const begin = (rand() * 5).toFixed(1);
        out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" fill-opacity="${base.toFixed(2)}">
      <animate attributeName="fill-opacity" values="${base.toFixed(2)};${Math.min(1, base + 0.42).toFixed(2)};${base.toFixed(2)}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>
    </circle>`;
    }
    return out;
}

// The actual 3D room from the hero, inlined as WebP. Two nested masks do the
// blending: a radial vignette softens every edge, and a horizontal ramp inside
// it dissolves the left edge into the canvas so the render reads as part of the
// card rather than a photo pasted onto it. Nesting is what multiplies them —
// sibling elements in one mask would just paint over each other.
function room(p) {
    const cx = ROOM_X + ROOM_W / 2;
    const cy = ROOM_Y + ROOM_H / 2;
    return `
  <g mask="url(#${p}roomVignette)">
    <g mask="url(#${p}roomEdge)">
      <g transform="translate(${cx} ${cy})">
        <g>
          <!-- a slow breath, so the scene is never quite static -->
          <animateTransform attributeName="transform" type="scale" values="1;1.035;1" dur="30s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="${T.easeInOut};${T.easeInOut}"/>
          <g transform="translate(${-cx} ${-cy})">
            <image href="data:image/webp;base64,${HERO_ROOM}" x="${ROOM_X}" y="${ROOM_Y}" width="${ROOM_W}" height="${ROOM_H}" preserveAspectRatio="xMidYMid slice"/>
          </g>
        </g>
      </g>
    </g>
  </g>
  <!-- the monitors, given a pulse the still render can't have -->
  <ellipse cx="${ROOM_X + ROOM_W * 0.65}" cy="${ROOM_Y + ROOM_H * 0.55}" rx="46" ry="18" fill="${T.accentPale}" opacity="0.10">
    <animate attributeName="opacity" values="0.06;0.16;0.06" dur="8s" repeatCount="indefinite"/>
  </ellipse>`;
}

export function renderHeroSVG({ projectsShipped = 9 } = {}) {
    const p = "";
    const headY1 = 118;
    const headY2 = 168;
    const headSize = 44;

    // Two mask-revealed headline lines, staggered exactly like the site's
    // timeline. Each line is drawn twice: the ink layer, then a brighter cobalt
    // layer that only shows through the travelling blob mask.
    const line1 = `<text x="40" y="${headY1}" class="head">${esc(LINE_1)}</text>`;
    const line2 = `<text x="40" y="${headY2}" class="head">${esc(LINE_2A)}<tspan class="head accent">${esc(LINE_2B)}</tspan></text>`;
    const line1Hot = `<text x="40" y="${headY1}" class="head hot">${esc(LINE_1)}</text>`;
    const line2Hot = `<text x="40" y="${headY2}" class="head hot">${esc(LINE_2A)}<tspan class="head hotAccent">${esc(LINE_2B)}</tspan></text>`;

    const r1 = maskReveal({ content: line1 + `<g mask="url(#${p}blobMask)">${line1Hot}</g>`, x: 30, y: headY1, width: 560, height: headSize + 8, id: `${p}mask1`, begin: 0.15, distance: headSize + 14 });
    const r2 = maskReveal({ content: line2 + `<g mask="url(#${p}blobMask)">${line2Hot}</g>`, x: 30, y: headY2, width: 560, height: headSize + 8, id: `${p}mask2`, begin: 0.26, distance: headSize + 14 });

    const sub = riseIn(
        SUB.map((ln, i) => `<text x="41" y="${204 + i * 18}" class="sub">${esc(ln)}</text>`).join(""),
        { begin: 0.72 },
    );

    // Status strip — the site's "AVAILABLE FOR WORK · N PROJECTS SHIPPED ·
    // B.TECH CSE · AI / ML" line, laid out on a mono grid.
    const stripY = 248;
    const items = [
        `${projectsShipped} PROJECTS SHIPPED`,
        "B.TECH CSE",
        "AI / ML",
    ];
    // Geist Mono advances 0.6em; at 9.5px with 1.2px tracking that is 6.9px a
    // character, which is what keeps the separators evenly gapped.
    const CH = 6.9;
    let sx = 54;
    let strip = `<text x="${sx}" y="${stripY + 3.5}" class="strip live">AVAILABLE FOR WORK</text>`;
    sx += "AVAILABLE FOR WORK".length * CH + 14;
    for (const it of items) {
        strip += `<text x="${sx}" y="${stripY + 3.5}" class="strip dot">·</text>`;
        sx += 14;
        strip += `<text x="${sx}" y="${stripY + 3.5}" class="strip">${esc(it)}</text>`;
        sx += it.length * CH + 14;
    }
    const statusStrip = riseIn(statusDot(41, stripY) + strip, { begin: 0.9, y: 10 });

    return `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Adi Jain — AI/ML engineer. I build AI that makes it to production.">

  <style>
    ${baseTextStyles()}
    .head      { font-size: ${headSize}px; font-weight: 700; fill: ${T.ink}; letter-spacing: -1.4px; }
    .head.accent    { fill: ${T.accent}; }
    .head.hot       { fill: #c7d2ff; }
    .head.hotAccent { fill: #8ea3ff; }
    .sub       { font-size: 12.5px; font-weight: 400; fill: ${T.inkDim}; }
    .strip     { font-family: ${MONO}; font-size: 9.5px; font-weight: 500; fill: ${T.inkFaint}; letter-spacing: 1.2px; }
    .strip.live { fill: ${T.green}; }
    .strip.dot  { fill: rgba(255,255,255,0.18); }
    .pill      { font-family: ${MONO}; font-size: 9.5px; font-weight: 500; fill: ${T.accentPale}; letter-spacing: 1.1px; }
  </style>

  <defs>
    ${baseDefs(p, { width: WIDTH, height: HEIGHT })}
    ${r1.def}
    ${r2.def}
    <!-- Deliberately soft-topped: the hot layer should read as a sheen moving
         through the glyphs, not as the headline changing colour. -->
    <radialGradient id="${p}blobGrad">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.60"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <!-- The pointer-follow reveal from the site, on an autonomous loop:
         a breathing radial mask drifting across the headline. -->
    <mask id="${p}blobMask">
      <circle cy="146" r="132" fill="url(#${p}blobGrad)">
        <animate attributeName="cx" values="60;520;60" dur="17s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="${T.easeInOut};${T.easeInOut}"/>
        <animate attributeName="r" values="132;158;132" dur="6.5s" repeatCount="indefinite"/>
      </circle>
    </mask>
    <radialGradient id="${p}horizon">
      <stop offset="0%" stop-color="${T.accent}" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="${T.accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${p}vignetteGrad">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="46%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <linearGradient id="${p}edgeGrad" x1="${ROOM_X}" y1="0" x2="${ROOM_X + ROOM_W * 0.42}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <mask id="${p}roomVignette">
      <ellipse cx="${ROOM_X + ROOM_W / 2}" cy="${ROOM_Y + ROOM_H / 2}" rx="${ROOM_W * 0.78}" ry="${ROOM_H * 0.78}" fill="url(#${p}vignetteGrad)"/>
    </mask>
    <mask id="${p}roomEdge">
      <rect x="${ROOM_X}" y="${ROOM_Y}" width="${ROOM_W}" height="${ROOM_H}" fill="url(#${p}edgeGrad)"/>
    </mask>
    <!-- The rule belongs to the text column, so it fades out instead of
         running on through the artwork. -->
    <linearGradient id="${p}ruleFade" x1="40" y1="0" x2="${TEXT_EDGE}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.11"/>
      <stop offset="72%" stop-color="#ffffff" stop-opacity="0.09"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="${p}pillEdge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${T.accent}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${T.accent}" stop-opacity="0.15"/>
    </linearGradient>
  </defs>

  ${cardShell(p, { width: WIDTH, height: HEIGHT })}

  <!-- Right side: the hero's night-sky room -->
  <g clip-path="url(#${p}cardClip)">
    <ellipse cx="700" cy="150" rx="230" ry="150" fill="url(#${p}horizon)" opacity="0.6">
      <animate attributeName="opacity" values="0.42;0.68;0.42" dur="11s" repeatCount="indefinite"/>
    </ellipse>
    <g opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur="1.6s" begin="0.2s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
      ${room(p)}
      <!-- twinkle confined to the dark band above the room, where it reads as
           the render's own sky rather than dots on a lit wall -->
      ${starfield(524, 852, 14, 118)}
    </g>
  </g>

  <!-- Eyebrow -->
  ${riseIn(`<text x="41" y="52" class="eyebrow">${esc(EYEBROW)}</text>`, { begin: 0.05, y: 10 })}

  <!-- adijain.click pill, top right -->
  ${riseIn(
      // The pill crosses the room's brightest wall, so it carries its own dark
      // backdrop — the same trick the site's nav uses to stay legible over the
      // 3D scene.
      `<rect x="${WIDTH - 186}" y="36" width="146" height="22" rx="11" fill="${T.bgSunk}" fill-opacity="0.82"/>
       <rect x="${WIDTH - 186}" y="36" width="146" height="22" rx="11" fill="${T.accent}" fill-opacity="0.14" stroke="url(#${p}pillEdge)" stroke-width="1"/>
       <circle cx="${WIDTH - 170}" cy="47" r="2.6" fill="${T.accentPale}"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.8s" repeatCount="indefinite"/></circle>
       <text x="${WIDTH - 160}" y="50.5" class="pill">ADIJAIN.CLICK</text>`,
      { begin: 0.12, y: 8 },
  )}

  <!-- Headline -->
  ${r1.body}
  ${r2.body}

  ${sub}

  <!-- Hairline above the status strip, drawn on. Stops at the text column and
       fades out, so it never cuts across the room. -->
  <line x1="40" y1="230" x2="40" y2="230" stroke="url(#${p}ruleFade)" stroke-width="1">
    <animate attributeName="x2" from="40" to="${TEXT_EDGE}" dur="1.1s" begin="0.8s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
  </line>

  ${statusStrip}

</svg>
`;
}
