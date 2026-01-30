export function renderWakaTimeSVG(stats) {
  let y = 90;

  const rows = stats.languages
    .map((lang) => {
      const row = `
        <text x="20" y="${y}">${lang.name}</text>
        <text x="380" y="${y}" text-anchor="end">${lang.percent.toFixed(1)}%</text>
      `;
      y += 22;
      return row;
    })
    .join('');

  return `
<svg width="420" height="${y + 20}" xmlns="http://www.w3.org/2000/svg">
  <style>
    text {
      fill: #c9d1d9;
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial;
      font-size: 13px;
    }
  </style>

  <rect width="100%" height="100%" rx="12" fill="#0d1117"/>

  <text x="20" y="28" font-size="15" font-weight="600">
    WakaTime — Last 7 Days
  </text>

  <text x="20" y="55">
    Total: ${stats.total}
  </text>

  ${rows}
</svg>
`;
}
