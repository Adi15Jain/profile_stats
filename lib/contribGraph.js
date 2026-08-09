// Renders the contribution heatmap card. Cells cascade in as a diagonal wave
// on load, the busiest days breathe with a soft glow, a shine band sweeps the
// grid, and a summary strip below the grid shows active days, busiest day and
// daily average. Pure function: pass { weeks, total } from fetchGitHubData().
import { deriveCalendarStats } from "./githubData.js";
import { T, MONO, baseTextStyles, baseDefs, cardShell, statusDot } from "./theme.js";

export function renderContribGraph({ weeks, total }) {
  const cell = 11;
  const gap = 4;
  const step = cell + gap;
  const gridX0 = 38;
  const gridY0 = 80;
  const nWeeks = weeks.length;

  const gridW = nWeeks * step;
  const gridH = 7 * step;

  const width = gridX0 + gridW + 18;
  const summaryY = gridY0 + gridH + 22;
  const height = summaryY + 52;

  const stats = deriveCalendarStats(weeks);
  const activePct = stats.totalDays
    ? Math.round((stats.activeDays / stats.totalDays) * 100)
    : 0;
  const avgPerDay = stats.totalDays ? (total / stats.totalDays).toFixed(1) : "0";
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const busiestLabel = stats.busiest.date
    ? `${MONTHS[new Date(stats.busiest.date).getMonth()]} ${new Date(stats.busiest.date).getDate()}`
    : "—";

  let max = 0;
  for (const wk of weeks) for (const d of wk) if (d.count > max) max = d.count;
  const levelOf = (c) => {
    if (c <= 0 || max <= 0) return 0;
    const r = c / max;
    if (r <= 0.25) return 1;
    if (r <= 0.5) return 2;
    if (r <= 0.75) return 3;
    return 4;
  };

  // Intensity ramp in the one accent — density is read from lightness, not
  // from a change of hue, which is what keeps the card on the house palette.
  const ramp = [
    ['#16171d', '#111217'], // empty
    ['#1d2a63', '#16204b'],
    ['#2a3fae', '#1f2f84'],
    [T.accent, '#3049cc'],
    ['#8ea3ff', T.accent],
  ];

  // cells: diagonal cascade on load, breathing glow on the busiest days
  let cells = '';
  weeks.forEach((wk, w) => {
    wk.forEach((d, dy) => {
      const lvl = levelOf(d.count);
      const x = gridX0 + w * step;
      const y = gridY0 + dy * step;
      const begin = (w * 0.018 + dy * 0.05).toFixed(2);
      const glow = lvl === 4 ? ' filter="url(#cellGlow)"' : '';
      const pulse = lvl >= 3
        ? `<animate attributeName="opacity" values="0.82;1;0.82" dur="2.6s" begin="${((w % 5) * 0.3 + 2).toFixed(2)}s" repeatCount="indefinite"/>`
        : '';
      cells += `<g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.45s" begin="${begin}s" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" fill="freeze"/><rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="url(#lvl${lvl})"${glow}>${pulse}</rect></g>`;
    });
  });

  // month labels
  let monthLabels = '';
  let lastMonth = -1;
  weeks.forEach((wk, w) => {
    const first = wk[0];
    if (!first) return;
    const m = new Date(first.date).getMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      const x = gridX0 + w * step;
      if (x < width - 26) monthLabels += `<text x="${x}" y="${gridY0 - 9}" class="mlabel">${MONTHS[m]}</text>`;
    }
  });

  const dayLabels = [
    `<text x="${gridX0 - 8}" y="${gridY0 + 1 * step + 9}" text-anchor="end" class="dlabel">Mon</text>`,
    `<text x="${gridX0 - 8}" y="${gridY0 + 3 * step + 9}" text-anchor="end" class="dlabel">Wed</text>`,
    `<text x="${gridX0 - 8}" y="${gridY0 + 5 * step + 9}" text-anchor="end" class="dlabel">Fri</text>`,
  ].join('');

  // summary strip
  const summaryStats = [
    { value: `${stats.activeDays}`, extra: ` · ${activePct}%`, label: 'ACTIVE DAYS' },
    { value: `${stats.busiest.count}`, extra: ` · ${busiestLabel}`, label: 'BUSIEST DAY' },
    { value: avgPerDay, extra: ' / day', label: 'DAILY AVERAGE' },
    { value: `${stats.longestStreak}`, extra: 'd', label: 'LONGEST STREAK' },
  ];
  const summary = summaryStats
    .map((s, i) => {
      const x = gridX0 + i * 150;
      return `
  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin="${(1.3 + i * 0.12).toFixed(2)}s" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" fill="freeze"/>
    <text x="${x}" y="${summaryY + 14}" class="sval" filter="url(#numGlow)">${s.value}<tspan class="sextra">${s.extra}</tspan></text>
    <text x="${x}" y="${summaryY + 30}" class="slbl">${s.label}</text>
  </g>`;
    })
    .join('');

  // legend, right-aligned with the summary strip
  const legX = width - 18 - 5 * step - 64;
  const legY = summaryY + 16;
  let legend = `<text x="${legX - 8}" y="${legY + 4}" text-anchor="end" class="dlabel">Less</text>`;
  for (let l = 0; l < 5; l++) {
    legend += `<rect x="${legX + l * step}" y="${legY - 5}" width="${cell}" height="${cell}" rx="3" fill="url(#lvl${l})"/>`;
  }
  legend += `<text x="${legX + 5 * step + 4}" y="${legY + 4}" class="dlabel">More</text>`;

  const rampDefs = ramp
    .map((c, i) => `<linearGradient id="lvl${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c[0]}"/><stop offset="100%" stop-color="${c[1]}"/></linearGradient>`)
    .join('');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

  <style>
    ${baseTextStyles()}
    .mlabel  { font-family: ${MONO}; font-size: 8.5px; font-weight: 500; fill: ${T.inkFaint}; letter-spacing: 0.8px; }
    .dlabel  { font-family: ${MONO}; font-size: 8.5px; font-weight: 500; fill: rgba(255,255,255,0.22); letter-spacing: 0.6px; }
    .sval    { font-size: 16px; font-weight: 700; fill: ${T.ink}; letter-spacing: -0.3px; }
    .sextra  { font-family: ${MONO}; font-size: 9px; font-weight: 500; fill: ${T.inkFaint}; letter-spacing: 0.4px; }
    .slbl    { font-family: ${MONO}; font-size: 8.5px; font-weight: 500; fill: ${T.inkFaint}; letter-spacing: 1px; }
    .live    { font-family: ${MONO}; font-size: 8.5px; font-weight: 500; fill: ${T.green}; letter-spacing: 1.2px; }
  </style>

  <defs>
    ${baseDefs("", { width, height })}
    <linearGradient id="sweep" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#dbe3ff" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="cellGlow" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="numGlow" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="1.2"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <clipPath id="gridClip"><rect x="${gridX0 - 2}" y="${gridY0 - 2}" width="${gridW + 2}" height="${gridH + 2}"/></clipPath>
    ${rampDefs}
  </defs>

  ${cardShell("", { width, height })}

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.7s" begin="0.05s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
    <text x="24" y="38" class="h-card">Contribution graph</text>
    <text x="24" y="55" class="eyebrow">${total} CONTRIBUTIONS · LAST 12 MONTHS · PUBLIC + PRIVATE</text>
    ${statusDot(width - 62, 33, 3)}
    <text x="${width - 52}" y="36.5" class="live">LIVE</text>
  </g>

  <!-- cells -->
  ${cells}

  <!-- diagonal shine sweep across the grid -->
  <g clip-path="url(#gridClip)">
    <rect x="${gridX0 - 120}" y="${gridY0 - 6}" width="80" height="${gridH + 12}" fill="url(#sweep)" transform="skewX(-18)">
      <animate attributeName="x" values="${gridX0 - 120};${gridX0 + gridW + 40}" dur="6s" begin="1.6s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.55 1"/>
    </rect>
  </g>

  ${monthLabels}
  ${dayLabels}

  <line x1="${gridX0}" y1="${summaryY - 12}" x2="${width - 18}" y2="${summaryY - 12}" stroke="#ffffff" stroke-opacity="0.07" stroke-width="1"/>
  ${summary}
  ${legend}

</svg>
`;
}
