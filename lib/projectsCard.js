// Featured Projects spotlight: a full-width card that auto-rotates through the
// pinned repositories. Each slide fades/slides in with name, description,
// language chip and star/fork counts; progress dots track the rotation.
// Width matches the combined stats row (420 + 20 + 420) so the README column
// lines up. Pure function of fetchGitHubData().pinned.
import { esc } from "./animate.js";

const SLIDE_SECS = 5;
const FADE_SECS = 0.5;

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
        lines[maxLines - 1] =
            lines[maxLines - 1].slice(0, maxChars - 1).trimEnd() + "…";
    }
    return lines;
}

function monthYear(iso) {
    const d = new Date(iso);
    const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${M[d.getMonth()]} ${d.getFullYear()}`;
}

export function renderProjectsSVG({ pinned }) {
    const width = 860;
    const height = 200;
    const n = Math.max(pinned.length, 1);
    const T = n * SLIDE_SECS;

    const slides = pinned.length
        ? pinned
        : [{ name: "No pinned repositories", description: "Pin repositories on your GitHub profile to feature them here.", language: null, languageColor: "#8b93a7", stars: 0, forks: 0, pushedAt: null }];

    // opacity + slide keyframes for slide i over the full cycle
    const window = (i) => {
        const s = (i * SLIDE_SECS) / T;
        const e = ((i + 1) * SLIDE_SECS) / T;
        const f = FADE_SECS / T;
        return { s, e, f };
    };

    const slideGroups = slides
        .map((p, i) => {
            const { s, e, f } = window(i);

            let opacityAnim;
            let slideAnim;
            if (slides.length === 1) {
                opacityAnim = "";
                slideAnim = "";
            } else if (s === 0) {
                opacityAnim = `<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;${f.toFixed(4)};${(e - f).toFixed(4)};${e.toFixed(4)};1" dur="${T}s" repeatCount="indefinite"/>`;
                slideAnim = `<animateTransform attributeName="transform" type="translate" values="18 0;0 0;0 0;-12 0;18 0" keyTimes="0;${f.toFixed(4)};${(e - f).toFixed(4)};${e.toFixed(4)};1" dur="${T}s" repeatCount="indefinite"/>`;
            } else {
                opacityAnim = `<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;${s.toFixed(4)};${(s + f).toFixed(4)};${(e - f).toFixed(4)};${Math.min(e, 0.9999).toFixed(4)};1" dur="${T}s" repeatCount="indefinite"/>`;
                slideAnim = `<animateTransform attributeName="transform" type="translate" values="18 0;18 0;0 0;0 0;-12 0;18 0" keyTimes="0;${s.toFixed(4)};${(s + f).toFixed(4)};${(e - f).toFixed(4)};${Math.min(e, 0.9999).toFixed(4)};1" dur="${T}s" repeatCount="indefinite"/>`;
            }

            const descLines = wrapText(p.description || "A project by yours truly.", 96, 2);
            const desc = descLines
                .map(
                    (ln, li) =>
                        `<text x="32" y="${118 + li * 17}" class="desc">${esc(ln)}</text>`,
                )
                .join("");

            // meta row: language chip, stars, forks, updated — only nonzero bits
            let mx = 32;
            let meta = "";
            if (p.language) {
                meta += `<circle cx="${mx + 4}" cy="164" r="4" fill="${p.languageColor}"/><text x="${mx + 13}" y="168" class="meta">${esc(p.language)}</text>`;
                mx += 13 + p.language.length * 6.2 + 22;
            }
            if (p.stars > 0) {
                meta += `<text x="${mx}" y="168" class="meta star">★ ${p.stars}</text>`;
                mx += String(p.stars).length * 7 + 34;
            }
            if (p.forks > 0) {
                // font-independent fork glyph (octicon-ish), drawn as vectors
                meta += `<g transform="translate(${mx}, 157)" stroke="#8b93a7" stroke-width="1.3" fill="none">
        <circle cx="2" cy="2" r="1.6"/><circle cx="9" cy="2" r="1.6"/><circle cx="5.5" cy="10" r="1.6"/>
        <path d="M2 3.6 v0.9 a3 3 0 0 0 3 3 h1 a3 3 0 0 0 3 -3 v-0.9 M5.5 7.5 v0.9"/>
      </g><text x="${mx + 14}" y="168" class="meta">${p.forks}</text>`;
                mx += 14 + String(p.forks).length * 7 + 24;
            }
            if (p.pushedAt) {
                meta += `<text x="${mx}" y="168" class="meta dim">Updated ${monthYear(p.pushedAt)}</text>`;
            }

            const num = String(i + 1).padStart(2, "0");

            return `
  <g opacity="${slides.length === 1 ? 1 : 0}">
    ${opacityAnim}
    <g>
      ${slideAnim}
      <text x="${width - 32}" y="74" text-anchor="end" class="idx">${num} / ${String(slides.length).padStart(2, "0")}</text>
      <text x="32" y="92" class="pname" filter="url(#pGlow)">${esc(p.name)}</text>
      <rect x="32" y="99" height="2.5" rx="1.25" width="54" fill="url(#accent)">
        <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite"/>
      </rect>
      ${desc}
      ${meta}
    </g>
  </g>`;
        })
        .join("");

    // progress dots, bottom-right; the active one lights up during its window
    const dots = slides.length > 1
        ? slides
              .map((_, i) => {
                  const { s, e } = window(i);
                  const cx = width - 28 - (slides.length - 1 - i) * 18;
                  const gate =
                      s === 0
                          ? `values="1;0" keyTimes="0;${e.toFixed(4)}"`
                          : `values="0;1;0" keyTimes="0;${s.toFixed(4)};${Math.min(e, 0.9999).toFixed(4)}"`;
                  return `
  <circle cx="${cx}" cy="${height - 26}" r="3.5" fill="#ffffff" fill-opacity="0.14"/>
  <circle cx="${cx}" cy="${height - 26}" r="3.5" fill="url(#accent)" opacity="0">
    <animate attributeName="opacity" calcMode="discrete" ${gate} dur="${T}s" repeatCount="indefinite"/>
  </circle>`;
              })
              .join("")
        : "";

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

  <style>
    text { font-family: "Outfit","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
    .title { font-size: 16px; font-weight: 800; fill: url(#titleFlow); letter-spacing: 0.2px; }
    .eyebrow { font-size: 10px; font-weight: 600; fill: #8b93a7; letter-spacing: 0.4px; }
    .idx   { font-size: 12px; font-weight: 700; fill: #ffffff; fill-opacity: 0.28; letter-spacing: 1px; }
    .pname { font-size: 21px; font-weight: 800; fill: url(#pnameFlow); letter-spacing: 0.2px; }
    .desc  { font-size: 11.5px; font-weight: 500; fill: #b6bfd0; }
    .meta  { font-size: 10.5px; font-weight: 600; fill: #8b93a7; }
    .meta.star { fill: #fbbf24; }
    .meta.dim  { fill: #6e7681; font-weight: 500; }
    .live  { font-size: 8.5px; font-weight: 700; fill: #6ee7b7; letter-spacing: 0.6px; }
  </style>

  <defs>
    <linearGradient id="base" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1018"/><stop offset="100%" stop-color="#080810"/>
    </linearGradient>
    <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/><stop offset="33%" stop-color="#8b5cf6"/>
      <stop offset="66%" stop-color="#ec4899"/><stop offset="100%" stop-color="#06b6d4"/>
      <animateTransform attributeName="gradientTransform" type="rotate" from="0 0.5 0.5" to="360 0.5 0.5" dur="18s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="titleFlow" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
      <stop offset="0%" stop-color="#93c5fd"/><stop offset="50%" stop-color="#c4b5fd"/><stop offset="100%" stop-color="#f0abfc"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="180 0" dur="9s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="pnameFlow" x1="0" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
      <stop offset="0%" stop-color="#e0eaff"/><stop offset="50%" stop-color="#c4b5fd"/><stop offset="100%" stop-color="#93c5fd"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="260 0" dur="7s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
    <radialGradient id="blobViolet"><stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.30"/><stop offset="70%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
    <radialGradient id="blobCyan"><stop offset="0%" stop-color="#06b6d4" stop-opacity="0.26"/><stop offset="70%" stop-color="#06b6d4" stop-opacity="0"/></radialGradient>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="pGlow" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="1.6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <clipPath id="cardClip"><rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="14"/></clipPath>
  </defs>

  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="14" fill="url(#base)"/>
  <g clip-path="url(#cardClip)" filter="url(#soft)">
    <circle cx="120" cy="${height - 30}" r="110" fill="url(#blobViolet)">
      <animateTransform attributeName="transform" type="translate" values="0 0; 50 -15; 0 0" dur="19s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </circle>
    <circle cx="${width - 130}" cy="40" r="120" fill="url(#blobCyan)">
      <animateTransform attributeName="transform" type="translate" values="0 0; -50 20; 0 0" dur="23s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </circle>
  </g>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="14" fill="none" stroke="url(#cardBorder)" stroke-width="1.4" stroke-opacity="0.9"/>
  <rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="13.5" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.7s" begin="0.05s" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" fill="freeze"/>
    <text x="32" y="34" class="title">Featured Projects</text>
    <text x="32" y="50" class="eyebrow">Pinned repositories · auto-rotating</text>
    <rect x="${width - 84}" y="22" width="52" height="17" rx="8.5" fill="#10b981" fill-opacity="0.12" stroke="#10b981" stroke-opacity="0.35" stroke-width="0.8"/>
    <circle cx="${width - 72}" cy="30.5" r="3" fill="#34d399"><animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite"/></circle>
    <text x="${width - 64}" y="33.5" class="live">LIVE</text>
  </g>

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.8s" begin="0.35s" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" fill="freeze"/>
    ${slideGroups}
    ${dots}
  </g>

</svg>
`;
}
