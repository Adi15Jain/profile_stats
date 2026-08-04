// Renders the right-column card: GitHub Overview (top) + Contribution Activity
// (bottom). One SVG so it aligns perfectly beside the (taller) Coding Activity
// card. Pure function of fetchGitHubData()'s result so it can be previewed
// without network. Stats are picked from a ranked pool and anything at zero is
// simply never rendered.
import { countUp, typewriter } from "./animate.js";

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
    const slotColors = [
        { c: ["#60a5fa", "#22d3ee"], glow: "#3b82f6" },
        { c: ["#c084fc", "#f0abfc"], glow: "#a855f7" },
        { c: ["#fbbf24", "#fb923c"], glow: "#f59e0b" },
        { c: ["#34d399", "#22d3ee"], glow: "#10b981" },
    ];
    const overviewStats = pool
        .filter((s) => parseFloat(s.value) > 0)
        .slice(0, 4)
        .map((s, i) => ({ ...s, ...slotColors[i] }));

    // ---- ACTIVITY PANEL (1x3): swap dead streaks for living numbers ----
    const activityStats = [
        {
            label: "CONTRIBUTIONS · 1Y",
            value: c.total,
            c: ["#60a5fa", "#818cf8"],
            glow: "#6366f1",
        },
        c.currentStreak > 0
            ? {
                  label: "CURRENT STREAK",
                  value: `${c.currentStreak}`,
                  suffix: "d",
                  c: ["#fb923c", "#f43f5e"],
                  glow: "#f97316",
              }
            : {
                  label: "ACTIVE DAYS · 1Y",
                  value: `${c.activeDays}`,
                  c: ["#fb923c", "#f43f5e"],
                  glow: "#f97316",
              },
        {
            label: "LONGEST STREAK",
            value: `${c.longestStreak}`,
            suffix: "d",
            c: ["#34d399", "#22d3ee"],
            glow: "#10b981",
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
            `${role} · ${Math.floor(devExperienceYears)}+ years`,
            "RAG pipelines & multi-agent systems",
            "FastAPI backends · React frontends",
            "LLM-powered products, end-to-end",
        ],
        x: 24,
        y: 52,
        className: "eyebrow",
        idPrefix: "gh-tag",
    });

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

  <style>
    text { font-family: "Outfit","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
    .title    { font-size: 16px;  font-weight: 800; fill: url(#titleFlow); letter-spacing: 0.2px; }
    .eyebrow  { font-size: 10px;  font-weight: 600; fill: #8b93a7; letter-spacing: 0.4px; }
    .stat-num { font-size: 22px;  font-weight: 800; }
    .stat-lbl { font-size: 9.5px; font-weight: 600; fill: #8b93a7; letter-spacing: 0.6px; }
    .act-num  { font-size: 20px;  font-weight: 800; }
    .act-lbl  { font-size: 8.5px; font-weight: 600; fill: #8b93a7; letter-spacing: 0.5px; }
    .foot     { font-size: 9px;   font-weight: 500; fill: #6e7681; letter-spacing: 0.3px; }
    .live     { font-size: 8.5px; font-weight: 700; fill: #6ee7b7; letter-spacing: 0.6px; }
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
    <linearGradient id="titleFlow" x1="0" y1="0" x2="170" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
      <stop offset="0%" stop-color="#93c5fd"/><stop offset="50%" stop-color="#c4b5fd"/><stop offset="100%" stop-color="#f0abfc"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="170 0" dur="9s" repeatCount="indefinite"/>
    </linearGradient>
    <radialGradient id="blobBlue"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.4"/><stop offset="70%" stop-color="#3b82f6" stop-opacity="0"/></radialGradient>
    <radialGradient id="blobPurple"><stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.38"/><stop offset="70%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="26"/></filter>
    <filter id="numGlow" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="1.4"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <clipPath id="cardClip"><rect x="1" y="1" width="${width - 2}" height="211" rx="14"/></clipPath>
    <clipPath id="cardClip2"><rect x="1" y="${aPanelY}" width="${width - 2}" height="${height - aPanelY - 1}" rx="14"/></clipPath>
    ${tagline.defs}
    ${gradDefs}
  </defs>

  <!-- ===== OVERVIEW PANEL ===== -->
  <rect x="1" y="1" width="${width - 2}" height="210" rx="14" fill="url(#base)"/>
  <g clip-path="url(#cardClip)" filter="url(#soft)">
    <circle cx="${width - 40}" cy="40" r="80" fill="url(#blobPurple)">
      <animateTransform attributeName="transform" type="translate" values="0 0; -30 25; 0 0" dur="17s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </circle>
    <circle cx="40" cy="190" r="75" fill="url(#blobBlue)">
      <animateTransform attributeName="transform" type="translate" values="0 0; 30 -20; 0 0" dur="20s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </circle>
  </g>
  <rect x="1" y="1" width="${width - 2}" height="210" rx="14" fill="none" stroke="url(#cardBorder)" stroke-width="1.4" stroke-opacity="0.9"/>
  <rect x="1.5" y="1.5" width="${width - 3}" height="209" rx="13.5" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.7s" begin="0.05s" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" fill="freeze"/>
    <text x="24" y="34" class="title">GitHub Overview</text>
    ${tagline.body}
    <rect x="346" y="22" width="52" height="17" rx="8.5" fill="#10b981" fill-opacity="0.12" stroke="#10b981" stroke-opacity="0.35" stroke-width="0.8"/>
    <circle cx="358" cy="30.5" r="3" fill="#34d399"><animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite"/></circle>
    <text x="366" y="33.5" class="live">LIVE</text>
    <line x1="24" y1="62" x2="396" y2="62" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
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
  <rect x="1" y="${aPanelY}" width="${width - 2}" height="${height - aPanelY - 1}" rx="14" fill="url(#base)"/>
  <g clip-path="url(#cardClip2)" filter="url(#soft)">
    <circle cx="60" cy="${aPanelY + 30}" r="70" fill="url(#blobBlue)">
      <animateTransform attributeName="transform" type="translate" values="0 0; 30 15; 0 0" dur="19s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </circle>
    <circle cx="${width - 60}" cy="${height - 30}" r="70" fill="url(#blobPurple)">
      <animateTransform attributeName="transform" type="translate" values="0 0; -25 -15; 0 0" dur="22s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </circle>
  </g>
  <rect x="1" y="${aPanelY}" width="${width - 2}" height="${height - aPanelY - 1}" rx="14" fill="none" stroke="url(#cardBorder)" stroke-width="1.4" stroke-opacity="0.9"/>
  <rect x="1.5" y="${aPanelY + 0.5}" width="${width - 3}" height="${height - aPanelY - 2}" rx="13.5" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.7s" begin="0.6s" calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" fill="freeze"/>
    <text x="24" y="${aPanelY + 28}" class="title">Contribution Activity</text>
    <text x="24" y="${aPanelY + 44}" class="eyebrow">Last 12 months · includes private repos</text>
    <rect x="346" y="${aPanelY + 14}" width="52" height="17" rx="8.5" fill="#10b981" fill-opacity="0.12" stroke="#10b981" stroke-opacity="0.35" stroke-width="0.8"/>
    <circle cx="358" cy="${aPanelY + 22.5}" r="3" fill="#34d399"><animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite"/></circle>
    <text x="366" y="${aPanelY + 25.5}" class="live">LIVE</text>
  </g>
  ${activityCells}

</svg>
`;
}
