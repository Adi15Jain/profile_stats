// The design system every card renders against — a direct port of the
// portfolio's "editorial-technical" tokens (app/globals.css): a near-black
// canvas, a neutral ink ramp, hairline rules, and ONE electric-cobalt accent
// used sparingly. No rainbow gradients; if something needs to stand out it
// gets cobalt or it gets weight, not a new hue.
//
// Per-project hues (lib/featured.js) are the single sanctioned exception, and
// they only ever appear as a low-alpha wash so the canvas stays near-black.
import { FONT_GEIST_WOFF2, FONT_GEIST_MONO_WOFF2 } from "./assets.generated.js";

export const T = {
    // Canvas + ink ramp
    bg: "#0a0a0c",
    bgRaise: "#101013",
    bgSunk: "#08080a",
    ink: "#ededf0",
    inkDim: "#9a9aa4",
    inkFaint: "#5c5c66",

    // Hairlines
    line: "rgba(255,255,255,0.09)",
    lineStrong: "rgba(255,255,255,0.16)",

    // The one accent
    accent: "#3d5afe",
    accent2: "#6e86ff",
    accentDeep: "#2440c0",
    accentPale: "#8aa0ff",

    // Semantic only — "available for work" / live status, never decoration
    green: "#10b981",
    greenBright: "#34d399",

    // One house easing, matching --ease-out-expo
    ease: "0.16 1 0.3 1",
    easeInOut: "0.65 0 0.35 1",
};

// Type roles. Display = Geist (the portfolio's --font-display), mono = Geist
// Mono for eyebrows, indices and metadata — the two voices the site uses.
export const DISPLAY = `"Geist","Mona Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`;
export const MONO = `"Geist Mono",ui-monospace,"SF Mono",Menlo,monospace`;

// The @font-face block. Injected exactly once per rendered file by withFonts()
// — a combined card (statsCard) hoists it to the wrapper rather than paying
// for the payload twice.
const FONT_FACES = `
    @font-face { font-family: "Geist"; font-style: normal; font-weight: 100 900; font-display: block; src: url(data:font/woff2;base64,${FONT_GEIST_WOFF2}) format("woff2"); }
    @font-face { font-family: "Geist Mono"; font-style: normal; font-weight: 500; font-display: block; src: url(data:font/woff2;base64,${FONT_GEIST_MONO_WOFF2}) format("woff2"); }`;

// Wraps a finished card so its text renders in the site's actual typefaces.
// Must be the last step before the SVG goes out the door.
export function withFonts(svg) {
    return svg.replace(/(<svg\b[^>]*>)/, `$1\n  <style>${FONT_FACES}\n  </style>`);
}

// Shared text roles. Every card pulls the same ladder so headings, eyebrows and
// metadata are identical across the README.
export function baseTextStyles() {
    return `
    text { font-family: ${DISPLAY}; }
    .mono { font-family: ${MONO}; }
    .eyebrow  { font-family: ${MONO}; font-size: 9.5px; font-weight: 500; fill: ${T.inkFaint}; letter-spacing: 1.3px; }
    .h-card   { font-size: 17px; font-weight: 700; fill: ${T.ink}; letter-spacing: -0.2px; }
    .sub      { font-size: 11px; font-weight: 400; fill: ${T.inkDim}; }
    .meta     { font-family: ${MONO}; font-size: 9.5px; font-weight: 500; fill: ${T.inkFaint}; letter-spacing: 0.6px; }
    .num      { font-size: 21px; font-weight: 700; fill: ${T.ink}; letter-spacing: -0.5px; }
    .numlbl   { font-family: ${MONO}; font-size: 8.5px; font-weight: 500; fill: ${T.inkFaint}; letter-spacing: 0.9px; }`;
}

// Defs shared by every card: the flat near-black fill, the vertical hairline
// grid the site draws behind its sections, a soft blur, and a cobalt wash.
// `p` namespaces the ids so two cards can be combined into one document.
export function baseDefs(p = "", { width = 420, height = 300 } = {}) {
    return `
    <linearGradient id="${p}base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${T.bgRaise}"/><stop offset="100%" stop-color="${T.bgSunk}"/>
    </linearGradient>
    <radialGradient id="${p}wash"><stop offset="0%" stop-color="${T.accent}" stop-opacity="0.20"/><stop offset="70%" stop-color="${T.accent}" stop-opacity="0"/></radialGradient>
    <pattern id="${p}grid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0 V44" stroke="#ffffff" stroke-opacity="0.028" stroke-width="1"/>
    </pattern>
    <filter id="${p}soft" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="34"/></filter>
    <clipPath id="${p}cardClip"><rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="16"/></clipPath>`;
}

// The card shell: flat panel, hairline grid, one drifting cobalt wash, and a
// single 1px border. `accent` lets a project slide tint its own shell.
export function cardShell(
    p = "",
    { width = 420, height = 300, accent = T.accent, x = 1, y = 1, rx = 16 } = {},
) {
    const w = width - 2;
    const h = height - 2;
    return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${p}base)"/>
  <g clip-path="url(#${p}cardClip)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${p}grid)"/>
    <g filter="url(#${p}soft)">
      <circle cx="${width - 110}" cy="${height - 40}" r="130" fill="${accent}" fill-opacity="0.10">
        <animateTransform attributeName="transform" type="translate" values="0 0; -46 -24; 0 0" dur="26s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="${T.easeInOut};${T.easeInOut}"/>
      </circle>
      <circle cx="70" cy="30" r="110" fill="${accent}" fill-opacity="0.07">
        <animateTransform attributeName="transform" type="translate" values="0 0; 40 26; 0 0" dur="31s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="${T.easeInOut};${T.easeInOut}"/>
      </circle>
    </g>
  </g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#ffffff" stroke-opacity="0.10" stroke-width="1"/>`;
}

// The site's signature entrance: a line of type sliding up out of its own clip
// (GSAP `yPercent: 115` + expo.out). SMIL can't animate a clip and its content
// independently in one node, so the clip is a static window and the inner
// group does the travelling.
export function maskReveal({
    content,
    x,
    y,
    width,
    height,
    id,
    begin = 0,
    dur = 1.05,
    distance = null,
}) {
    const travel = distance ?? height;
    return {
        def: `<clipPath id="${id}"><rect x="${x}" y="${y - height + 4}" width="${width}" height="${height + 6}"/></clipPath>`,
        body: `
  <g clip-path="url(#${id})">
    <g transform="translate(0 ${travel})">
      <animateTransform attributeName="transform" type="translate" from="0 ${travel}" to="0 0" dur="${dur}s" begin="${begin}s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
      ${content}
    </g>
  </g>`,
    };
}

// Fade + rise, the softer entrance used for supporting copy.
export function riseIn(content, { begin = 0, dur = 0.8, y = 14 } = {}) {
    return `
  <g opacity="0" transform="translate(0 ${y})">
    <animate attributeName="opacity" from="0" to="1" dur="${dur}s" begin="${begin}s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 ${y}" to="0 0" dur="${dur}s" begin="${begin}s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
    ${content}
  </g>`;
}

// The green "available / live" dot the site uses in its status lines. Semantic,
// never decorative.
export function statusDot(cx, cy, r = 3.2) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${T.greenBright}">
    <animate attributeName="opacity" values="0.35;1;0.35" dur="2.4s" repeatCount="indefinite"/>
  </circle>`;
}
