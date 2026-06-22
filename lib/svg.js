export function renderWakaTimeSVG(stats) {
    const width = 420;

    // Vibrant two-hue gradient per language (flows for a living look)
    const colorMap = {
        typescript: ["#2563eb", "#38bdf8", "#22d3ee"],
        javascript: ["#f59e0b", "#fde047", "#facc15"],
        python: ["#0891b2", "#22d3ee", "#34d399"],
        css: ["#db2777", "#f472b6", "#a855f7"],
        html: ["#ea580c", "#fb923c", "#f59e0b"],
        rust: ["#c2410c", "#fb923c", "#f43f5e"],
        go: ["#0284c7", "#38bdf8", "#22d3ee"],
        cpp: ["#0369a1", "#38bdf8", "#818cf8"],
        c: ["#6366f1", "#818cf8", "#a78bfa"],
    };
    const fallbacks = [
        ["#6366f1", "#818cf8", "#a78bfa"],
        ["#8b5cf6", "#a855f7", "#d946ef"],
        ["#10b981", "#34d399", "#22d3ee"],
        ["#f43f5e", "#fb7185", "#f97316"],
        ["#0ea5e9", "#22d3ee", "#34d399"],
    ];

    // Layout
    const padX = 24;
    const trackW = width - padX * 2;
    const startY = 112;
    const rowStep = 38;
    const height = startY + stats.languages.length * rowStep + 6;

    let gradientDefs = "";

    const rows = stats.languages
        .map((lang, i) => {
            const key = lang.name.toLowerCase();
            const [c0, c1, c2] =
                colorMap[key] || fallbacks[i % fallbacks.length];

            const rowY = startY + i * rowStep;
            const barY = rowY + 8;
            const fillW = Math.max(
                6,
                Math.round((lang.percent / 100) * trackW),
            );

            // flowing gradient (smooth, no harsh sweep)
            gradientDefs += `
    <linearGradient id="bar-${i}" x1="0" y1="0" x2="150" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
      <stop offset="0%" stop-color="${c0}"/>
      <stop offset="50%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
      <animateTransform attributeName="gradientTransform" type="translate"
                        from="0 0" to="150 0" dur="${(4 + i * 0.4).toFixed(1)}s" repeatCount="indefinite"/>
    </linearGradient>`;

            return `
  <g>
    <text x="${padX}" y="${rowY}" class="lang">${lang.name}</text>
    <text x="${width - padX}" y="${rowY}" text-anchor="end" class="pct">${lang.percent.toFixed(1)}%</text>

    <!-- track -->
    <rect x="${padX}" y="${barY}" width="${trackW}" height="9" rx="4.5" fill="#ffffff" fill-opacity="0.06"/>
    <!-- fill: static width at the real %, always visible; gradient flows for life -->
    <rect x="${padX}" y="${barY}" width="${fillW}" height="9" rx="4.5" fill="url(#bar-${i})"/>
  </g>`;
        })
        .join("");

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

  <style>
    text { font-family: "Outfit","Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
    .title   { font-size: 16px; font-weight: 800; fill: url(#titleFlow); letter-spacing: 0.2px; }
    .eyebrow { font-size: 10px; font-weight: 600; fill: #8b93a7; letter-spacing: 0.4px; }
    .total   { font-size: 11px; font-weight: 600; fill: #c9d1d9; }
    .lang    { font-size: 11px; font-weight: 700; fill: #e6edf3; }
    .pct     { font-size: 11px; font-weight: 700; fill: #ffffff; }
    .live    { font-size: 8.5px; font-weight: 700; fill: #6ee7b7; letter-spacing: 0.6px; }
  </style>

  <defs>
    <linearGradient id="base" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1018"/>
      <stop offset="100%" stop-color="#080810"/>
    </linearGradient>

    <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="33%" stop-color="#8b5cf6"/>
      <stop offset="66%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#06b6d4"/>
      <animateTransform attributeName="gradientTransform" type="rotate"
                        from="0 0.5 0.5" to="360 0.5 0.5" dur="18s" repeatCount="indefinite"/>
    </linearGradient>

    <linearGradient id="titleFlow" x1="0" y1="0" x2="170" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="reflect">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="50%" stop-color="#c4b5fd"/>
      <stop offset="100%" stop-color="#f0abfc"/>
      <animateTransform attributeName="gradientTransform" type="translate"
                        from="0 0" to="170 0" dur="9s" repeatCount="indefinite"/>
    </linearGradient>

    <radialGradient id="blobBlue"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.42"/><stop offset="70%" stop-color="#3b82f6" stop-opacity="0"/></radialGradient>
    <radialGradient id="blobPink"><stop offset="0%" stop-color="#ec4899" stop-opacity="0.36"/><stop offset="70%" stop-color="#ec4899" stop-opacity="0"/></radialGradient>

    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="26"/></filter>

    <clipPath id="cardClip"><rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="14"/></clipPath>
    ${gradientDefs}
  </defs>

  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="14" fill="url(#base)"/>

  <!-- ambient corner blobs (kept to corners so the center stays clean) -->
  <g clip-path="url(#cardClip)" filter="url(#soft)">
    <circle cx="40" cy="40" r="80" fill="url(#blobBlue)">
      <animateTransform attributeName="transform" type="translate" values="0 0; 30 25; 0 0"
                        dur="16s" repeatCount="indefinite" calcMode="spline"
                        keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </circle>
    <circle cx="${width - 40}" cy="${height - 30}" r="85" fill="url(#blobPink)">
      <animateTransform attributeName="transform" type="translate" values="0 0; -30 -20; 0 0"
                        dur="20s" repeatCount="indefinite" calcMode="spline"
                        keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
    </circle>
  </g>

  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="14"
        fill="none" stroke="url(#cardBorder)" stroke-width="1.4" stroke-opacity="0.9"/>
  <rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="13.5"
        fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>

  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.7s" begin="0.05s"
             calcMode="spline" keyTimes="0;1" keySplines="0.16 1 0.3 1" fill="freeze"/>
    <text x="24" y="36" class="title">Coding Activity</text>
    <text x="24" y="54" class="eyebrow">All-time · WakaTime</text>

    <rect x="346" y="22" width="52" height="17" rx="8.5" fill="#10b981" fill-opacity="0.12" stroke="#10b981" stroke-opacity="0.35" stroke-width="0.8"/>
    <circle cx="358" cy="30.5" r="3" fill="#34d399">
      <animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite"/>
    </circle>
    <text x="366" y="33.5" class="live">LIVE</text>

    <line x1="24" y1="70" x2="396" y2="70" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
    <text x="24" y="94" class="total">Total tracked: ${stats.total}</text>
  </g>

  ${rows}

</svg>
`;
}
