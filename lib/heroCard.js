// The README masthead — a port of the portfolio's hero section.
//
// Same eyebrow, same two-line headline with the accent word carrying the
// sentence, same status strip. The site reveals each headline line by sliding
// it up out of its own clip (GSAP yPercent 115 + expo.out) and runs a cobalt
// "hot" layer inside the glyphs that follows the pointer; both are reproduced
// here in SMIL, with the blob sweeping on a slow loop since an image has no
// pointer to follow.
import { esc } from "./animate.js";
import { T, DISPLAY, MONO, baseTextStyles, baseDefs, cardShell, maskReveal, riseIn, statusDot } from "./theme.js";

const WIDTH = 860;
const HEIGHT = 272;

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
    for (let i = 0; i < 64; i++) {
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

// The hero's 3D room, reduced to a cobalt wireframe: a desk, a lit monitor and
// a chair on a faint ground plane. Ambient only — it sits behind the starfield
// at low opacity and never competes with the copy.
function isoDesk(ox, oy, U = 27) {
    // Standard isometric projection: x runs down-right, y down-left, z up.
    const pt = (x, y, z = 0) => [
        (ox + (x - y) * 0.866 * U).toFixed(1),
        (oy + ((x + y) * 0.5 - z) * U).toFixed(1),
    ].join(",");
    const poly = (pts) => pts.map((a) => pt(...a)).join(" ");

    const DESK_Z = 1.05;
    return `
  <g fill="none" stroke="${T.accent2}" stroke-width="1" stroke-linejoin="round">
    <!-- desk top + legs -->
    <polygon points="${poly([[0, 0, DESK_Z], [3, 0, DESK_Z], [3, 2, DESK_Z], [0, 2, DESK_Z]])}" fill="${T.accent}" fill-opacity="0.05" stroke-opacity="0.34"/>
    <g stroke-opacity="0.24">
      <line x1="${pt(0, 0, DESK_Z).split(",")[0]}" y1="${pt(0, 0, DESK_Z).split(",")[1]}" x2="${pt(0, 0).split(",")[0]}" y2="${pt(0, 0).split(",")[1]}"/>
      <line x1="${pt(3, 0, DESK_Z).split(",")[0]}" y1="${pt(3, 0, DESK_Z).split(",")[1]}" x2="${pt(3, 0).split(",")[0]}" y2="${pt(3, 0).split(",")[1]}"/>
      <line x1="${pt(3, 2, DESK_Z).split(",")[0]}" y1="${pt(3, 2, DESK_Z).split(",")[1]}" x2="${pt(3, 2).split(",")[0]}" y2="${pt(3, 2).split(",")[1]}"/>
    </g>
    <!-- monitor: the one thing in the scene that is actually lit -->
    <polygon points="${poly([[0.35, 0.25, DESK_Z], [2.55, 0.25, DESK_Z], [2.55, 0.25, DESK_Z + 1.15], [0.35, 0.25, DESK_Z + 1.15]])}" fill="${T.accent}" fill-opacity="0.20" stroke-opacity="0.45">
      <animate attributeName="fill-opacity" values="0.14;0.26;0.14" dur="7s" repeatCount="indefinite"/>
    </polygon>
    <!-- keyboard -->
    <polygon points="${poly([[0.7, 1.1, DESK_Z], [2.2, 1.1, DESK_Z], [2.2, 1.7, DESK_Z], [0.7, 1.7, DESK_Z]])}" stroke-opacity="0.20"/>
    <!-- chair -->
    <polygon points="${poly([[1.1, 2.7, 0.55], [2.1, 2.7, 0.55], [2.1, 3.5, 0.55], [1.1, 3.5, 0.55]])}" stroke-opacity="0.18"/>
    <polygon points="${poly([[1.1, 3.5, 0.55], [2.1, 3.5, 0.55], [2.1, 3.5, 1.35], [1.1, 3.5, 1.35]])}" stroke-opacity="0.16"/>
  </g>`;
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
    <linearGradient id="${p}pillEdge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${T.accent}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${T.accent}" stop-opacity="0.15"/>
    </linearGradient>
  </defs>

  ${cardShell(p, { width: WIDTH, height: HEIGHT })}

  <!-- Ambient right side: the hero's night-sky room, abstracted -->
  <g clip-path="url(#${p}cardClip)">
    <ellipse cx="700" cy="150" rx="230" ry="150" fill="url(#${p}horizon)" opacity="0.75">
      <animate attributeName="opacity" values="0.55;0.85;0.55" dur="11s" repeatCount="indefinite"/>
    </ellipse>
    <g opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur="1.6s" begin="0.2s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
      ${starfield(556, 848, 22, 250)}
      ${isoDesk(706, 132, 22)}
    </g>
    <!-- soft mask so the starfield never crowds the copy -->
    <rect x="1" y="1" width="540" height="${HEIGHT - 2}" fill="url(#${p}base)" opacity="0.55"/>
  </g>

  <!-- Eyebrow -->
  ${riseIn(`<text x="41" y="52" class="eyebrow">${esc(EYEBROW)}</text>`, { begin: 0.05, y: 10 })}

  <!-- adijain.click pill, top right -->
  ${riseIn(
      `<rect x="${WIDTH - 186}" y="36" width="146" height="22" rx="11" fill="${T.accent}" fill-opacity="0.10" stroke="url(#${p}pillEdge)" stroke-width="1"/>
       <circle cx="${WIDTH - 170}" cy="47" r="2.6" fill="${T.accentPale}"><animate attributeName="opacity" values="0.4;1;0.4" dur="2.8s" repeatCount="indefinite"/></circle>
       <text x="${WIDTH - 160}" y="50.5" class="pill">ADIJAIN.CLICK</text>`,
      { begin: 0.12, y: 8 },
  )}

  <!-- Headline -->
  ${r1.body}
  ${r2.body}

  ${sub}

  <!-- Hairline above the status strip, drawn on -->
  <line x1="40" y1="230" x2="40" y2="230" stroke="#ffffff" stroke-opacity="0.09" stroke-width="1">
    <animate attributeName="x2" from="40" to="${WIDTH - 40}" dur="1.1s" begin="0.8s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
  </line>

  ${statusStrip}

</svg>
`;
}
