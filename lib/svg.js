export function renderWakaTimeSVG(stats) {
  const width = 420;
  const headerHeight = 100;
  const rowHeight = 38;
  const paddingBottom = 30;

  const totalHeight =
    headerHeight + stats.languages.length * rowHeight + paddingBottom;

  let y = headerHeight;

  const rows = stats.languages
    .map((lang, i) => {
      const barWidth = Math.max(20, lang.percent * 2.6);

      const row = `
  <g opacity="0">
    <animate attributeName="opacity"
             from="0"
             to="1"
             dur="0.6s"
             begin="${i * 0.15}s"
             fill="freeze"/>

    <animateTransform
      attributeName="transform"
      type="translate"
      from="0 6"
      to="0 0"
      dur="0.6s"
      begin="${i * 0.15}s"
      fill="freeze"/>

    <text x="40" y="${y}" fill="#cbd5f5">${lang.name}</text>

    <text x="380" y="${y}"
          text-anchor="end"
          fill="#e5e7eb"
          font-weight="500">
      ${lang.percent.toFixed(1)}%
    </text>

    <rect x="40" y="${y + 10}"
          width="320" height="8"
          rx="4"
          fill="#1f2937"/>

    <rect x="40" y="${y + 10}"
          width="${barWidth}" height="8"
          rx="4"
          fill="url(#barGradient)">
      <animate attributeName="width"
               from="0"
               to="${barWidth}"
               dur="1.2s"
               begin="${i * 0.15}s"
               fill="freeze"/>
    </rect>
  </g>
`;

      y += rowHeight;
      return row;
    })
    .join('');

  return `
<svg width="${width}"
     height="${totalHeight}"
     viewBox="0 0 ${width} ${totalHeight}"
     xmlns="http://www.w3.org/2000/svg">

  <style>
    text {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                   Helvetica, Arial, sans-serif;
      font-size: 13px;
      dominant-baseline: middle;
    }
  </style>


  <defs>
    <!-- Background -->
    <!-- Animated bar gradient -->
    <linearGradient id="barGradient"
                    x1="0%" y1="0%"
                    x2="100%" y2="0%"
                    gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#6366f1"/>

      <animateTransform
        attributeName="gradientTransform"
        type="translate"
        from="0 0"
        to="200 0"
        dur="8s"
        repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="bgGradientAnimated"
                x1="0%" y1="0%"
                x2="100%" y2="100%"
                gradientUnits="userSpaceOnUse">
  <stop offset="0%" stop-color="#0f172a"/>
  <stop offset="100%" stop-color="#020617"/>

  <animateTransform
    attributeName="gradientTransform"
    type="translate"
    from="0 0"
    to="40 20"
    dur="20s"
    repeatCount="indefinite"/>
</linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%"
      rx="18"
      fill="url(#bgGradientAnimated)"/>

  <!-- Header -->
  <text x="40" y="38"
        font-size="16"
        font-weight="600"
        fill="#e5e7eb">
    WakaTime · Last 7 Days
  </text>

  <text x="40" y="64"
        font-size="13"
        fill="#94a3b8">
    Total Coding Time: ${stats.total}
  </text>

  <line x1="40" y1="78" x2="380" y2="78"
      stroke="#334155"
      stroke-width="1"
      stroke-dasharray="340"
      stroke-dashoffset="340">
  <animate attributeName="stroke-dashoffset"
           from="340"
           to="0"
           dur="0.8s"
           begin="0.2s"
           fill="freeze"/>
</line>

  <!-- Rows -->
  ${rows}

</svg>
`;
}
