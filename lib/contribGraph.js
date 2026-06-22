// Renders a premium 2D contribution heatmap.
// Glossy gradient cells (GitHub-green intensity), a soft glow + gentle pulse on
// the busiest days, and a diagonal shine band that sweeps across on a loop.
// Pure function: pass { weeks, total }. weeks = array of weeks, each = array of { date, count }.
export function renderContribGraph({ weeks, total }) {
  const cell = 11;
  const gap = 4;
  const step = cell + gap;
  const gridX0 = 38;
  const gridY0 = 80;
  const nWeeks = weeks.length;

  const width = gridX0 + nWeeks * step + 18;
  const height = gridY0 + 7 * step + 30;

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

  // glossy per-level gradients (top lighter -> bottom darker)
  const ramp = [
    ['#1c2331', '#141a26'], // empty
    ['#1f7a3a', '#14532b'],
    ['#2ea043', '#1a7335'],
    ['#39d353', '#248f3a'],
    ['#6ff58f', '#2ea043'],
  ];

  // cells
  let cells = '';
  weeks.forEach((wk, w) => {
    wk.forEach((d, dy) => {
      const lvl = levelOf(d.count);
      const x = gridX0 + w * step;
      const y = gridY0 + dy * step;
      const glow = lvl === 4 ? ' filter="url(#cellGlow)"' : '';
      const pulse = lvl === 4
        ? `<animate attributeName="opacity" values="0.82;1;0.82" dur="2.6s" begin="${((w % 5) * 0.3).toFixed(2)}s" repeatCount="indefinite"/>`
        : '';
      cells += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="url(#lvl${lvl})"${glow}>${pulse}</rect>`;
    });
  });

  // month labels
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
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

  // legend
  const legX = width - 18 - 5 * step - 64;
  const legY = height - 16;
  let legend = `<text x="${legX - 8}" y="${legY + 4}" text-anchor="end" class="dlabel">Less</text>`;
  for (let l = 0; l < 5; l++) {
    legend += `<rect x="${legX + l * step}" y="${legY - 5}" width="${cell}" height="${cell}" rx="3" fill="url(#lvl${l})"/>`;
  }
  legend += `<text x="${legX + 5 * step + 4}" y="${legY + 4}" class="dlabel">More</text>`;

  const gridW = nWeeks * step;
  const gridH = 7 * step;

  const rampDefs = ramp
    .map((c, i) => `<linearGradient id="lvl${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c[0]}"/><stop offset="100%" stop-color="${c[1]}"/></linearGradient>`)
    .join('');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

  <style>
    text { font-family: "Outfit","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
    .title   { font-size: 16px; font-weight: 800; fill: url(#titleFlow); letter-spacing: 0.2px; }
    .eyebrow { font-size: 10px; font-weight: 600; fill: #8b93a7; letter-spacing: 0.4px; }
    .mlabel  { font-size: 9px;  font-weight: 600; fill: #8b93a7; }
    .dlabel  { font-size: 9px;  font-weight: 600; fill: #6e7681; }
    .live    { font-size: 8.5px; font-weight: 700; fill: #6ee7b7; letter-spacing: 0.6px; }
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
    <linearGradient id="sweep" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#d8fff0" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="blobGreen"><stop offset="0%" stop-color="#10b981" stop-opacity="0.26"/><stop offset="70%" stop-color="#10b981" stop-opacity="0"/></radialGradient>
    <radialGradient id="blobBlue"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.26"/><stop offset="70%" stop-color="#3b82f6" stop-opacity="0"/></radialGradient>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="cellGlow" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <clipPath id="cardClip"><rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="14"/></clipPath>
    <clipPath id="gridClip"><rect x="${gridX0 - 2}" y="${gridY0 - 2}" width="${gridW + 2}" height="${gridH + 2}"/></clipPath>
    ${rampDefs}
  </defs>

  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="14" fill="url(#base)"/>
  <g clip-path="url(#cardClip)" filter="url(#soft)">
    <circle cx="120" cy="60" r="100" fill="url(#blobGreen)">
      <animateTransform attributeName="transform" type="translate" values="0 0; 40 20; 0 0" dur="18s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </circle>
    <circle cx="${width - 120}" cy="${height - 40}" r="110" fill="url(#blobBlue)">
      <animateTransform attributeName="transform" type="translate" values="0 0; -40 -20; 0 0" dur="22s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </circle>
  </g>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="14" fill="none" stroke="url(#cardBorder)" stroke-width="1.4" stroke-opacity="0.9"/>
  <rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="13.5" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.7s" begin="0.05s" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" fill="freeze"/>
    <text x="24" y="34" class="title">Contribution Graph</text>
    <text x="24" y="52" class="eyebrow">${total} contributions in the last year</text>
    <rect x="${width - 70}" y="22" width="52" height="17" rx="8.5" fill="#10b981" fill-opacity="0.12" stroke="#10b981" stroke-opacity="0.35" stroke-width="0.8"/>
    <circle cx="${width - 58}" cy="30.5" r="3" fill="#34d399"><animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite"/></circle>
    <text x="${width - 50}" y="33.5" class="live">LIVE</text>
  </g>

  <!-- cells -->
  ${cells}

  <!-- diagonal shine sweep across the grid -->
  <g clip-path="url(#gridClip)">
    <rect x="${gridX0 - 120}" y="${gridY0 - 6}" width="80" height="${gridH + 12}" fill="url(#sweep)" transform="skewX(-18)">
      <animate attributeName="x" values="${gridX0 - 120};${gridX0 + gridW + 40}" dur="3.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.55 1"/>
    </rect>
  </g>

  ${monthLabels}
  ${dayLabels}
  ${legend}

</svg>
`;
}
