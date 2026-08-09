// Renders the right-column card: GitHub Overview (top) + Contribution Activity
// (bottom). One SVG so it aligns perfectly beside the (taller) Coding Activity
// card. Pure function of fetchGitHubData()'s result so it can be previewed
// without network. Stats are picked from a ranked pool and anything at zero is
// simply never rendered.
import { countUp, typewriter } from "./animate.js";
import { T, MONO, baseTextStyles, baseDefs, cardShell, statusDot } from "./theme.js";

export function renderGitHubSVG(data) {
    const { user, repoCount, totalStars, totalForks, contributions: c } = data;
    const width = 420;
    const height = 346;

    const created = new Date(user.createdAt);
    const createdYear = created.getFullYear();
    const yearsOnGitHub = (
        (Date.now() - created.getTime()) /
        (1000 * 60 * 60 * 24 * 365)
    ).toFixed(1);

    const devExperienceYears = Number(yearsOnGitHub);
    let role = "Full-Stack Developer";
    if (devExperienceYears >= 15) role = "Principal Engineer";
    else if (devExperienceYears >= 8) role = "Lead Engineer";

    // ---- OVERVIEW PANEL (2x2): ranked pool, zeros never make the cut ----
    const pool = [
        { label: "COMMITS · 1Y", value: c.commits },
        { label: "REPOSITORIES", value: repoCount },
        { label: "TOTAL STARS", value: totalStars },
        { label: "YEARS ON GITHUB", value: yearsOnGitHub },
        { label: "FOLLOWERS", value: user.followers },
        { label: "PULL REQUESTS · 1Y", value: c.prs },
        { label: "CODE REVIEWS · 1Y", value: c.reviews },
        { label: "ISSUES OPENED · 1Y", value: c.issues },
    ];
    // Every cell is the same cobalt; rank is carried by position, not hue.
    const slotColors = Array.from({ length: 4 }, () => ({
        c: [T.ink, T.ink],
        glow: T.accent,
    }));
    const overviewStats = pool
        .filter((s) => parseFloat(s.value) > 0)
        .slice(0, 4)
        .map((s, i) => ({ ...s, ...slotColors[i] }));

    // ---- ACTIVITY PANEL (1x3): swap dead streaks for living numbers ----
    const activityStats = [
        {
            label: "CONTRIBUTIONS · 1Y",
            value: c.total,
            c: [T.ink, T.ink],
            glow: T.accent,
        },
        c.currentStreak > 0
            ? {
                  label: "CURRENT STREAK",
                  value: `${c.currentStreak}`,
                  suffix: "d",
                  c: [T.ink, T.ink],
                  glow: T.accent,
              }
            : {
                  label: "ACTIVE DAYS · 1Y",
                  value: `${c.activeDays}`,
                  c: [T.ink, T.ink],
                  glow: T.accent,
              },
        {
            label: "LONGEST STREAK",
            value: `${c.longestStreak}`,
            suffix: "d",
            c: [T.ink, T.ink],
            glow: T.accent,
        },
    ].filter((s) => parseFloat(s.value) > 0);

    // Overview cell geometry
    const oCellW = 179,
        oCellH = 50,
        oGapX = 14,
        oGapY = 10;
    const oCols = [24, 24 + oCellW + oGapX];
    const oRowsY = [76, 76 + oCellH + oGapY];

    // Activity panel region — cells spread to fill whatever survived the filter
    const aPanelY = 223;
    const aGapX = 12;
    const aCellW = Math.floor(
        (width - 32 - (activityStats.length - 1) * aGapX) / activityStats.length,
    );
    const aCellH = 54;
    const aCols = activityStats.map((_, i) => 16 + i * (aCellW + aGapX));
    const aCellY = 277;

    let gradDefs = "";

    // Overview cells
    const overviewCells = overviewStats
        .map((s, i) => {
            const x = oCols[i % 2];
            const yTop = oRowsY[Math.floor(i / 2)];
            const begin = i * 0.1 + 0.45;

            gradDefs += `
    <linearGradient id="onum-${i}" x1="0" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
      <stop offset="0%" stop-color="${s.c[0]}"/><stop offset="100%" stop-color="${s.c[1]}"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="60 0" dur="${(4 + i * 0.5).toFixed(1)}s" repeatCount="indefinite"/>
    </linearGradient>
    <clipPath id="oclip-${i}"><rect x="${x}" y="${yTop}" width="${oCellW}" height="${oCellH}" rx="9"/></clipPath>
    <radialGradient id="oglow-${i}"><stop offset="0%" stop-color="${s.glow}" stop-opacity="0.28"/><stop offset="70%" stop-color="${s.glow}" stop-opacity="0"/></radialGradient>`;

            return `
  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin="${begin.toFixed(2)}s" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" fill="freeze"/>
    <rect x="${x}" y="${yTop}" width="${oCellW}" height="${oCellH}" rx="9" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
    <g clip-path="url(#oclip-${i})">
      <circle cx="${x + oCellW - 14}" cy="${yTop + 12}" r="44" fill="url(#oglow-${i})">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="${(4.5 + i * 0.4).toFixed(1)}s" repeatCount="indefinite"/>
      </circle>
    </g>
    ${countUp({
        value: s.value,
        x: x + 16,
        y: yTop + 31,
        className: "stat-num",
        fill: `url(#onum-${i})`,
        filter: "url(#numGlow)",
        begin: begin + 0.1,
    })}
    <text x="${x + 16}" y="${yTop + 44}" class="stat-lbl">${s.label}</text>
  </g>`;
        })
        .join("");

    // Activity cells
    const activityCells = activityStats
        .map((s, i) => {
            const x = aCols[i];
            const begin = i * 0.1 + 1.0;

            gradDefs += `
    <linearGradient id="anum-${i}" x1="0" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
      <stop offset="0%" stop-color="${s.c[0]}"/><stop offset="100%" stop-color="${s.c[1]}"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="60 0" dur="${(4 + i * 0.5).toFixed(1)}s" repeatCount="indefinite"/>
    </linearGradient>
    <clipPath id="aclip-${i}"><rect x="${x}" y="${aCellY}" width="${aCellW}" height="${aCellH}" rx="9"/></clipPath>
    <radialGradient id="aglow-${i}"><stop offset="0%" stop-color="${s.glow}" stop-opacity="0.30"/><stop offset="70%" stop-color="${s.glow}" stop-opacity="0"/></radialGradient>`;

            return `
  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin="${begin.toFixed(2)}s" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" fill="freeze"/>
    <rect x="${x}" y="${aCellY}" width="${aCellW}" height="${aCellH}" rx="9" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
    <g clip-path="url(#aclip-${i})">
      <circle cx="${x + aCellW - 12}" cy="${aCellY + 12}" r="40" fill="url(#aglow-${i})">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="${(4.5 + i * 0.4).toFixed(1)}s" repeatCount="indefinite"/>
      </circle>
    </g>
    ${countUp({
        value: s.value,
        x: x + 13,
        y: aCellY + 30,
        className: "act-num",
        fill: `url(#anum-${i})`,
        filter: "url(#numGlow)",
        begin: begin + 0.1,
        suffix: s.suffix || "",
    })}
    <text x="${x + 13}" y="${aCellY + 44}" class="act-lbl">${s.label}</text>
  </g>`;
        })
        .join("");

    // Typewriter tagline cycling under the title
    const tagline = typewriter({
        phrases: [
            `${role.toUpperCase()} · ${Math.floor(devExperienceYears)}+ YEARS`,
            "RAG PIPELINES & MULTI-AGENT SYSTEMS",
            "FASTAPI BACKENDS · REACT FRONTENDS",
            "LLM-POWERED PRODUCTS, END TO END",
        ],
        x: 24,
        y: 54,
        className: "eyebrow",
        idPrefix: "gh-tag",
        // Geist Mono at 9.5px with the eyebrow's 1.3px tracking — the caret
        // rides on this figure, so it has to match the real advance.
        charW: 7.0,
        caretColor: T.accent2,
        caretH: 10,
    });

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

  <style>
    ${baseTextStyles()}
    .stat-num { font-size: 22px;  font-weight: 700; letter-spacing: -0.5px; }
    .stat-lbl { font-family: ${MONO}; font-size: 8.5px; font-weight: 500; fill: ${T.inkFaint}; letter-spacing: 1px; }
    .act-num  { font-size: 20px;  font-weight: 700; letter-spacing: -0.5px; }
    .act-lbl  { font-family: ${MONO}; font-size: 8px; font-weight: 500; fill: ${T.inkFaint}; letter-spacing: 0.9px; }
    .foot     { font-family: ${MONO}; font-size: 8.5px; font-weight: 500; fill: ${T.inkFaint}; letter-spacing: 0.6px; }
    .live     { font-family: ${MONO}; font-size: 8.5px; font-weight: 500; fill: ${T.green}; letter-spacing: 1.2px; }
  </style>

  <defs>
    ${baseDefs("", { width, height: 212 })}
    <clipPath id="cardClip2"><rect x="1" y="${aPanelY}" width="${width - 2}" height="${height - aPanelY - 1}" rx="16"/></clipPath>
    <filter id="numGlow" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="1.4"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    ${tagline.defs}
    ${gradDefs}
  </defs>

  <!-- ===== OVERVIEW PANEL ===== -->
  ${cardShell("", { width, height: 212 })}

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.7s" begin="0.05s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
    <text x="24" y="36" class="h-card">GitHub overview</text>
    ${tagline.body}
    ${statusDot(356, 31, 3)}
    <text x="366" y="34.5" class="live">LIVE</text>
    <line x1="24" y1="64" x2="396" y2="64" stroke="#ffffff" stroke-opacity="0.07" stroke-width="1"/>
  </g>
  ${overviewCells}
  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin="0.85s" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" fill="freeze"/>
    <text x="24" y="200" class="foot">${[
        `Member since ${createdYear}`,
        "public + private activity",
        totalForks > 0 ? `${totalForks} forks` : null,
        totalStars > 0 && !overviewStats.some((s) => s.label === "TOTAL STARS")
            ? `${totalStars} stars`
            : null,
    ]
        .filter(Boolean)
        .join(" · ")}</text>
  </g>

  <!-- ===== CONTRIBUTION ACTIVITY PANEL ===== -->
  <!-- Second panel, same shell as the first but offset down the column; it
       carries its own clip so the wash cannot bleed past the rounded edge. -->
  <rect x="1" y="${aPanelY}" width="${width - 2}" height="${height - aPanelY - 1}" rx="16" fill="url(#base)"/>
  <g clip-path="url(#cardClip2)">
    <rect x="1" y="${aPanelY}" width="${width - 2}" height="${height - aPanelY - 1}" fill="url(#grid)"/>
    <g filter="url(#soft)">
      <circle cx="${width - 70}" cy="${height - 20}" r="105" fill="${T.accent}" fill-opacity="0.10">
        <animateTransform attributeName="transform" type="translate" values="0 0; -34 -18; 0 0" dur="27s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="${T.easeInOut};${T.easeInOut}"/>
      </circle>
      <circle cx="60" cy="${aPanelY + 20}" r="90" fill="${T.accent}" fill-opacity="0.06">
        <animateTransform attributeName="transform" type="translate" values="0 0; 30 20; 0 0" dur="33s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="${T.easeInOut};${T.easeInOut}"/>
      </circle>
    </g>
  </g>
  <rect x="1" y="${aPanelY}" width="${width - 2}" height="${height - aPanelY - 1}" rx="16" fill="none" stroke="#ffffff" stroke-opacity="0.10" stroke-width="1"/>

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.7s" begin="0.6s" calcMode="spline" keyTimes="0;1" keySplines="${T.ease}" fill="freeze"/>
    <text x="24" y="${aPanelY + 30}" class="h-card">Contribution activity</text>
    <text x="24" y="${aPanelY + 47}" class="eyebrow">LAST 12 MONTHS · INCLUDES PRIVATE REPOS</text>
    ${statusDot(356, aPanelY + 23, 3)}
    <text x="366" y="${aPanelY + 26.5}" class="live">LIVE</text>
  </g>
  ${activityCells}

</svg>
`;
}
