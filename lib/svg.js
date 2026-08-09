import { T, MONO, baseTextStyles, baseDefs, cardShell, statusDot } from "./theme.js";

export function renderWakaTimeSVG(stats) {
    const width = 420;

    // One accent, ranked by lightness: the busiest language reads brightest and
    // each one below it steps back. Hue never carries meaning here, so the card
    // stays inside the portfolio's palette however the language mix shifts.
    const rankedBar = (i, n) => {
        const t = n > 1 ? i / (n - 1) : 0;
        const lift = 1 - t; // 1 at the top of the list, 0 at the bottom
        return {
            from: `hsl(${229 - lift * 4} 100% ${34 + lift * 22}%)`,
            to: `hsl(${229 - lift * 4} 100% ${52 + lift * 20}%)`,
        };
    };

    // Layout
    const padX = 24;
    const trackW = width - padX * 2;
    const startY = 112;
    const rowStep = 38;
    const height = startY + stats.languages.length * rowStep + 6;

    let gradientDefs = "";

    const rows = stats.languages
        .map((lang, i) => {
            const { from, to } = rankedBar(i, stats.languages.length);

            const rowY = startY + i * rowStep;
            const barY = rowY + 8;
            const fillW = Math.max(
                6,
                Math.round((lang.percent / 100) * trackW),
            );

            // Gentle flow along the bar so it reads as live without changing hue.
            gradientDefs += `
    <linearGradient id="bar-${i}" x1="0" y1="0" x2="170" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
      <animateTransform attributeName="gradientTransform" type="translate"
                        from="0 0" to="170 0" dur="${(5 + i * 0.4).toFixed(1)}s" repeatCount="indefinite"/>
    </linearGradient>`;

            return `
  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.55s" begin="${(0.35 + i * 0.09).toFixed(2)}s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
    <text x="${padX}" y="${rowY}" class="lang">${lang.name}</text>
    <text x="${width - padX}" y="${rowY}" text-anchor="end" class="pct">${lang.percent.toFixed(1)}%</text>

    <!-- track -->
    <rect x="${padX}" y="${barY}" width="${trackW}" height="7" rx="3.5" fill="#ffffff" fill-opacity="0.055"/>
    <!-- fill: grows to the real % once, then holds -->
    <rect x="${padX}" y="${barY}" width="0" height="7" rx="3.5" fill="url(#bar-${i})">
      <animate attributeName="width" from="0" to="${fillW}" dur="1.1s" begin="${(0.45 + i * 0.09).toFixed(2)}s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
    </rect>
  </g>`;
        })
        .join("");

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

  <style>
    ${baseTextStyles()}
    .total   { font-family: ${MONO}; font-size: 10px; font-weight: 500; fill: ${T.inkDim}; letter-spacing: 0.6px; }
    .lang    { font-size: 11.5px; font-weight: 500; fill: ${T.ink}; }
    .pct     { font-family: ${MONO}; font-size: 10.5px; font-weight: 500; fill: ${T.inkDim}; }
    .live    { font-family: ${MONO}; font-size: 8.5px; font-weight: 500; fill: ${T.green}; letter-spacing: 1.2px; }
  </style>

  <defs>
    ${baseDefs("", { width, height })}
    ${gradientDefs}
  </defs>

  ${cardShell("", { width, height })}

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.7s" begin="0.05s"
             calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
    <text x="24" y="38" class="h-card">Coding activity</text>
    <text x="24" y="55" class="eyebrow">ALL-TIME · WAKATIME</text>

    ${statusDot(356, 33, 3)}
    <text x="366" y="36.5" class="live">LIVE</text>

    <line x1="24" y1="72" x2="396" y2="72" stroke="#ffffff" stroke-opacity="0.07" stroke-width="1"/>
    <text x="24" y="94" class="total">TOTAL TRACKED · ${stats.total.toUpperCase()}</text>
  </g>

  ${rows}

</svg>
`;
}
