export function renderWakaTimeSVG(stats) {
  let y = 120;

  const rows = stats.languages
    .map((lang, i) => {
      const width = Math.max(20, lang.percent * 2.5);
      const row = `
      <text x="40" y="${y}" opacity="0.9">${lang.name}</text>
      <text x="380" y="${y}" text-anchor="end" opacity="0.7">
        ${lang.percent.toFixed(1)}%
      </text>

      <rect x="40" y="${y + 8}" width="320" height="8" rx="4" fill="#1f2937"/>
      <rect x="40" y="${y + 8}" width="${width}" height="8" rx="4"
        fill="url(#barGradient)">
        <animate attributeName="width"
                 from="0"
                 to="${width}"
                 dur="1.2s"
                 begin="${i * 0.15}s"
                 fill="freeze" />
      </rect>
    `;
      y += 38;
      return row;
    })
    .join('');

  return `
<svg width="420" height="${y + 40}" viewBox="0 0 420 ${y + 40}"
     xmlns="http://www.w3.org/2000/svg">

  <defs>
    <!-- Background gradient -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>

    <!-- Animated glow -->
    <radialGradient id="glowGradient">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
    </radialGradient>

    <!-- Bar gradient -->
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
    repeatCount="indefinite" />
</linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" rx="18" fill="url(#bgGradient)"/>

  <!-- Soft animated glow -->
  <circle cx="360" cy="40" r="80" fill="url(#glowGradient)">
    <animate attributeName="opacity"
             values="0.2;0.4;0.2"
             dur="6s"
             repeatCount="indefinite"/>
  </circle>

  <!-- Header -->
  <text x="40" y="42"
        font-size="16"
        font-weight="600"
        fill="#e5e7eb">
    WakaTime · Last 7 Days
  </text>

  <text x="40" y="66"
        font-size="13"
        fill="#94a3b8">
    Total Coding Time: ${stats.total}
  </text>

  <!-- Divider -->
  <line x1="40" y1="82" x2="380" y2="82"
        stroke="#334155" stroke-opacity="0.6"/>

  <!-- Language rows -->
  ${rows}

</svg>
`;
}
