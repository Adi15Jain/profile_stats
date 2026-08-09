// Featured Projects — the README's version of the portfolio's "Selected Work".
//
// Each slide pairs the real product screenshot (inlined as WebP; see
// scripts/build-assets.mjs) with the copy and headline metric from the site,
// and takes on that project's own hue: the wash behind the shot, the rule under
// the title and the metric all shift, while the shell stays on the portfolio's
// near-black cobalt canvas.
//
// Motion, per slide: the screenshot wipes in behind a rounded clip and drifts
// under a slow Ken Burns while it is on screen, the copy rises into place with
// the house expo easing, and a story-style progress segment fills for the
// duration. Everything is SMIL — GitHub strips scripts from README images.
import { esc } from "./animate.js";
import { T, MONO, baseTextStyles, baseDefs, cardShell } from "./theme.js";
import { thumbFor } from "./featured.js";

const WIDTH = 860;
const HEIGHT = 320;
const SLIDE_SECS = 6.5;
const FADE_SECS = 0.55;

// Image slot
const IMG_X = 520;
const IMG_Y = 92;
const IMG_W = 306;
const IMG_H = 172;

const PAD = 34;
const TEXT_W = 450;

function wrapText(text, maxChars, maxLines) {
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const w of words) {
        if ((line + " " + w).trim().length > maxChars) {
            lines.push(line.trim());
            line = w;
            if (lines.length === maxLines) break;
        } else {
            line = (line + " " + w).trim();
        }
    }
    if (lines.length < maxLines && line) lines.push(line.trim());
    else if (lines.length === maxLines && line) {
        lines[maxLines - 1] = lines[maxLines - 1].slice(0, maxChars - 1).trimEnd() + "…";
    }
    return lines;
}

// Fallback art for a project with no screenshot: the accent wash plus a few
// abstract UI rules, so the slot never renders as an empty hole.
function placeholderArt(p, accent) {
    return `
    <rect x="${IMG_X}" y="${IMG_Y}" width="${IMG_W}" height="${IMG_H}" fill="${accent}" fill-opacity="0.08"/>
    <g stroke="${accent}" stroke-opacity="0.35" stroke-width="1.5" stroke-linecap="round">
      <path d="M${IMG_X + 28} ${IMG_Y + 52} h84"/>
      <path d="M${IMG_X + 28} ${IMG_Y + 74} h146"/>
      <path d="M${IMG_X + 28} ${IMG_Y + 96} h112"/>
    </g>`;
}

export function renderProjectsSVG({ projects }) {
    const p = "";
    const slides = projects && projects.length ? projects : [];
    if (!slides.length) {
        return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg"></svg>`;
    }

    const n = slides.length;
    const T_TOTAL = n * SLIDE_SECS;
    const single = n === 1;

    // Normalised window for slide i across the whole loop.
    const win = (i) => {
        const s = (i * SLIDE_SECS) / T_TOTAL;
        const e = ((i + 1) * SLIDE_SECS) / T_TOTAL;
        const f = FADE_SECS / T_TOTAL;
        return { s, e, f };
    };
    const k = (v) => Math.min(Math.max(v, 0), 0.9999).toFixed(4);

    let defs = "";

    const slideGroups = slides
        .map((proj, i) => {
            const { s, e, f } = win(i);
            const accent = proj.accent || T.accent;
            const thumb = thumbFor(proj.id);
            const cx = IMG_X + IMG_W / 2;
            const cy = IMG_Y + IMG_H / 2;

            // --- per-slide defs -------------------------------------------------
            defs += `
    <clipPath id="${p}imgRound-${i}"><rect x="${IMG_X}" y="${IMG_Y}" width="${IMG_W}" height="${IMG_H}" rx="11"/></clipPath>
    <clipPath id="${p}imgWipe-${i}">
      <rect x="${IMG_X}" y="${IMG_Y}" width="0" height="${IMG_H}">
        ${
            single
                ? `<set attributeName="width" to="${IMG_W}"/>`
                : `<animate attributeName="width" values="0;0;${IMG_W};${IMG_W};0" keyTimes="0;${k(s)};${k(s + f * 1.5)};${k(e)};1" dur="${T_TOTAL}s" repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;${T.ease};0 0 1 1;0 0 1 1"/>`
        }
      </rect>
    </clipPath>
    <linearGradient id="${p}veil-${i}" x1="0" y1="1" x2="0.35" y2="0">
      <stop offset="0%" stop-color="${T.bgSunk}" stop-opacity="0.72"/>
      <stop offset="55%" stop-color="${accent}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.02"/>
    </linearGradient>
    <radialGradient id="${p}tint-${i}">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>`;

            // --- gates ----------------------------------------------------------
            // Opacity + a small horizontal travel, so a slide arrives and leaves
            // rather than simply blinking.
            const gate = single
                ? ""
                : `<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;${k(s)};${k(s + f)};${k(e - f)};${k(e)};1" dur="${T_TOTAL}s" repeatCount="indefinite"/>`;
            const travel = single
                ? ""
                : `<animateTransform attributeName="transform" type="translate" values="22 0;22 0;0 0;0 0;-14 0;22 0" keyTimes="0;${k(s)};${k(s + f)};${k(e - f)};${k(e)};1" dur="${T_TOTAL}s" repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;${T.ease};0 0 1 1;${T.easeInOut};0 0 1 1"/>`;

            // Ken Burns: scale about the slot's centre for the whole window.
            const ken = single
                ? ""
                : `<animateTransform attributeName="transform" type="scale" values="1.12;1.12;1.02;1.02" keyTimes="0;${k(s)};${k(e)};1" dur="${T_TOTAL}s" repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;0.4 0 0.2 1;0 0 1 1"/>`;

            // --- left column ----------------------------------------------------
            const kicker = wrapText(proj.kicker, 58, 2)
                .map((ln, li) => `<text x="${PAD}" y="${160 + li * 18}" class="kick">${esc(ln)}</text>`)
                .join("");

            const metric = `
      <text x="${PAD}" y="222" class="metric" fill="${accent}">${esc(proj.metricValue)}</text>
      <text x="${PAD}" y="238" class="metric-lbl">${esc(proj.metricLabel)}</text>`;

            // Stack chips — mono pills on a hairline, the site's tag styling.
            let chipX = PAD;
            const chips = proj.stack
                .map((tech) => {
                    const w = Math.round(tech.length * 5.5 + 20);
                    const chip = `
      <g>
        <rect x="${chipX}" y="258" width="${w}" height="19" rx="9.5" fill="#ffffff" fill-opacity="0.035" stroke="#ffffff" stroke-opacity="0.09" stroke-width="1"/>
        <text x="${chipX + w / 2}" y="270.5" text-anchor="middle" class="chip">${esc(tech)}</text>
      </g>`;
                    chipX += w + 7;
                    return chip;
                })
                .join("");

            // Footer: language, then the live domain — the site's "every claim
            // carries a receipt" proof line.
            let fx = PAD;
            let footer = "";
            if (proj.lang) {
                footer += `<circle cx="${fx + 3.5}" cy="${296 - 3.5}" r="3.5" fill="${proj.langColor || T.inkFaint}"/>`;
                footer += `<text x="${fx + 13}" y="296" class="foot">${esc(proj.lang)}</text>`;
                fx += 13 + proj.lang.length * 5.6 + 20;
            }
            // Star counts are deliberately absent: the headline metric above
            // says more about the project than a vanity number would.
            if (proj.domain) {
                footer += `<circle cx="${fx + 3}" cy="${296 - 3.5}" r="3" fill="${T.greenBright}"><animate attributeName="opacity" values="0.35;1;0.35" dur="2.4s" repeatCount="indefinite"/></circle>`;
                footer += `<text x="${fx + 12}" y="296" class="foot live">${esc(proj.domain)}</text>`;
            }

            // --- image ------------------------------------------------------------
            const art = thumb
                ? `<image href="data:image/webp;base64,${thumb}" x="${IMG_X}" y="${IMG_Y}" width="${IMG_W}" height="${IMG_H}" preserveAspectRatio="xMidYMid slice"/>`
                : placeholderArt(proj, accent);

            const image = `
    <g clip-path="url(#${p}imgWipe-${i})">
      <g clip-path="url(#${p}imgRound-${i})">
        <rect x="${IMG_X}" y="${IMG_Y}" width="${IMG_W}" height="${IMG_H}" fill="${T.bgSunk}"/>
        <g transform="translate(${cx} ${cy})">
          <g>
            ${ken}
            <g transform="translate(${-cx} ${-cy})">
              ${art}
            </g>
          </g>
        </g>
        <rect x="${IMG_X}" y="${IMG_Y}" width="${IMG_W}" height="${IMG_H}" fill="url(#${p}veil-${i})"/>
        <!-- sheen sweeping across the shot as it settles -->
        <rect x="${IMG_X - 90}" y="${IMG_Y}" width="60" height="${IMG_H}" fill="#ffffff" fill-opacity="0.05" transform="skewX(-16)">
          ${
              single
                  ? ""
                  : `<animate attributeName="x" values="${IMG_X - 120};${IMG_X - 120};${IMG_X + IMG_W + 60};${IMG_X + IMG_W + 60}" keyTimes="0;${k(s + f)};${k(s + f * 3.2)};1" dur="${T_TOTAL}s" repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;${T.ease};0 0 1 1"/>`
          }
        </rect>
      </g>
    </g>
    <rect x="${IMG_X}" y="${IMG_Y}" width="${IMG_W}" height="${IMG_H}" rx="11" fill="none" stroke="${accent}" stroke-opacity="0.28" stroke-width="1"/>`;

            return `
  <g opacity="${single ? 1 : 0}">
    ${gate}
    <!-- project tint, behind everything in the slide -->
    <g clip-path="url(#${p}cardClip)">
      <ellipse cx="${IMG_X + 40}" cy="${IMG_Y + 150}" rx="300" ry="190" fill="url(#${p}tint-${i})" opacity="0.9"/>
    </g>
    <g>
      ${travel}
      <text x="${WIDTH - PAD}" y="42" text-anchor="end" class="idx">${String(i + 1).padStart(2, "0")} <tspan class="idx dim">/ ${String(n).padStart(2, "0")}</tspan></text>
      <text x="${PAD}" y="126" class="pname">${esc(proj.title)}</text>
      <rect x="${PAD}" y="136" width="42" height="2.5" rx="1.25" fill="${accent}"/>
      ${kicker}
      ${metric}
      ${chips}
      ${footer}
    </g>
    ${image}
  </g>`;
        })
        .join("");

    // Story-style progress: one segment per project, the active one filling.
    const segW = 34;
    const segGap = 7;
    const segTotal = n * segW + (n - 1) * segGap;
    const segX0 = WIDTH - PAD - segTotal;
    const progress = single
        ? ""
        : slides
              .map((_, i) => {
                  const { s, e } = win(i);
                  const x = segX0 + i * (segW + segGap);
                  return `
  <rect x="${x}" y="290" width="${segW}" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.10"/>
  <rect x="${x}" y="290" width="0" height="3" rx="1.5" fill="${T.accent2}">
    <!-- fills across its own window, then snaps back rather than draining
         slowly across every later slide -->
    <animate attributeName="width" values="0;0;${segW};0;0" keyTimes="0;${k(s)};${k(e)};${k(e + 0.0002)};1" dur="${T_TOTAL}s" repeatCount="indefinite"/>
  </rect>`;
              })
              .join("");

    return `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Selected work: ${esc(slides.map((x) => x.title).join(", "))}">

  <style>
    ${baseTextStyles()}
    .pname     { font-size: 27px; font-weight: 700; fill: ${T.ink}; letter-spacing: -0.7px; }
    .kick      { font-size: 12px; font-weight: 400; fill: ${T.inkDim}; }
    .metric    { font-size: 26px; font-weight: 700; letter-spacing: -0.8px; }
    .metric-lbl{ font-family: ${MONO}; font-size: 8.5px; font-weight: 500; fill: ${T.inkFaint}; letter-spacing: 1.1px; }
    .chip      { font-family: ${MONO}; font-size: 9px; font-weight: 500; fill: ${T.inkDim}; letter-spacing: 0.4px; }
    .foot      { font-family: ${MONO}; font-size: 9.5px; font-weight: 500; fill: ${T.inkFaint}; letter-spacing: 0.5px; }
    .foot.live { fill: ${T.inkDim}; }
    .idx       { font-family: ${MONO}; font-size: 11px; font-weight: 500; fill: ${T.inkDim}; letter-spacing: 1.4px; }
    .idx.dim   { fill: rgba(255,255,255,0.20); }
  </style>

  <defs>
    ${baseDefs(p, { width: WIDTH, height: HEIGHT })}
    ${defs}
  </defs>

  ${cardShell(p, { width: WIDTH, height: HEIGHT })}

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.7s" begin="0.05s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
    <text x="${PAD}" y="42" class="h-card">Selected work</text>
    <text x="${PAD}" y="59" class="eyebrow">A FEW THINGS I'VE SHIPPED END TO END</text>
    <line x1="${PAD}" y1="74" x2="${WIDTH - PAD}" y2="74" stroke="#ffffff" stroke-opacity="0.07" stroke-width="1"/>
  </g>

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.8s" begin="0.3s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
    ${slideGroups}
    ${progress}
  </g>

</svg>
`;
}
