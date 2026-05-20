export function renderWakaTimeSVG(stats) {
  const width = 480;
  const height = 320;

  // Modern language-to-color mapping for a premium high-tech look
  const colorMap = {
    typescript: {
      front: ['#3b82f6', '#1d4ed8'],
      top: ['#60a5fa', '#3b82f6'],
      right: ['#1d4ed8', '#172554'],
    },
    javascript: {
      front: ['#facc15', '#ca8a04'],
      top: ['#fef08a', '#facc15'],
      right: ['#ca8a04', '#713f12'],
    },
    python: {
      front: ['#06b6d4', '#0891b2'],
      top: ['#22d3ee', '#06b6d4'],
      right: ['#0891b2', '#164e63'],
    },
    css: {
      front: ['#ec4899', '#db2777'],
      top: ['#f472b6', '#ec4899'],
      right: ['#db2777', '#4c0519'],
    },
    html: {
      front: ['#f97316', '#ea580c'],
      top: ['#fb923c', '#f97316'],
      right: ['#ea580c', '#7c2d12'],
    },
    rust: {
      front: ['#ea580c', '#c2410c'],
      top: ['#f97316', '#ea580c'],
      right: ['#c2410c', '#431407'],
    },
    go: {
      front: ['#06b6d4', '#0284c7'],
      top: ['#38bdf8', '#06b6d4'],
      right: ['#0284c7', '#0c4a6e'],
    },
    cpp: {
      front: ['#0284c7', '#0369a1'],
      top: ['#38bdf8', '#0284c7'],
      right: ['#0369a1', '#0c4a6e'],
    },
    c: {
      front: ['#475569', '#334155'],
      top: ['#64748b', '#475569'],
      right: ['#334155', '#0f172a'],
    }
  };

  // Fallbacks
  const fallbacks = [
    {
      front: ['#6366f1', '#4f46e5'],
      top: ['#818cf8', '#6366f1'],
      right: ['#4f46e5', '#312e81'],
    },
    {
      front: ['#d946ef', '#a855f7'],
      top: ['#f0abfc', '#d946ef'],
      right: ['#a855f7', '#4a044e'],
    },
    {
      front: ['#10b981', '#059669'],
      top: ['#34d399', '#10b981'],
      right: ['#059669', '#064e3b'],
    }
  ];

  let gradientDefs = '';
  let y = 136;
  const dDepth = 5;

  const rows = stats.languages
    .map((lang, i) => {
      const key = lang.name.toLowerCase();
      const scheme = colorMap[key] || fallbacks[i % fallbacks.length];

      // Define three gradients for this specific language (Front, Top, Right) to build 3D volume
      gradientDefs += `
    <linearGradient id="frontGrad-${i}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${scheme.front[0]}"/>
      <stop offset="100%" stop-color="${scheme.front[1]}"/>
    </linearGradient>
    <linearGradient id="topGrad-${i}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${scheme.top[0]}"/>
      <stop offset="100%" stop-color="${scheme.top[1]}"/>
    </linearGradient>
    <linearGradient id="rightGrad-${i}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${scheme.right[0]}"/>
      <stop offset="100%" stop-color="${scheme.right[1]}"/>
    </linearGradient>
      `;

      // 412 max width at 100%
      const targetW = Math.max(10, Math.round((lang.percent / 100) * 412));
      const rowY = y;

      const row = `
  <!-- Language ${lang.name} Group -->
  <g opacity="0">
    <animate attributeName="opacity"
             from="0"
             to="1"
             dur="0.6s"
             begin="${i * 0.15 + 0.2}s"
             fill="freeze"/>

    <animateTransform
      attributeName="transform"
      type="translate"
      from="0 10"
      to="0 0"
      dur="0.6s"
      begin="${i * 0.15 + 0.2}s"
      fill="freeze"/>

    <!-- Labels -->
    <text x="24" y="${rowY}" fill="#cbd5e1" font-size="12" font-weight="700">${lang.name}</text>
    <text x="456" y="${rowY}" text-anchor="end" fill="#f1f5f9" font-size="12" font-weight="700">${lang.percent.toFixed(1)}%</text>

    <!-- 3D Bar Track Trough (Backing shadow) -->
    <rect x="24" y="${rowY + 14}" width="432" height="10" rx="5" fill="#0f172a" fill-opacity="0.8" stroke="#1e293b" stroke-width="0.8"/>

    <!-- 3D Bar Elements (Front, Top, Right Faces) with physical depth -->
    
    <!-- Top Face -->
    <path fill="url(#topGrad-${i})">
      <animate attributeName="d"
               dur="1.5s"
               begin="${i * 0.18 + 0.3}s"
               fill="freeze"
               calcMode="spline"
               keyTimes="0;1"
               keySplines="0.25 1 0.5 1"
               from="M 24 ${rowY + 14} L ${24 + dDepth} ${rowY + 14 - dDepth} L ${24 + dDepth} ${rowY + 14 - dDepth} L 24 ${rowY + 14} Z"
               to="M 24 ${rowY + 14} L ${24 + dDepth} ${rowY + 14 - dDepth} L ${24 + targetW + dDepth} ${rowY + 14 - dDepth} L ${24 + targetW} ${rowY + 14} Z"/>
    </path>

    <!-- Front Face -->
    <path fill="url(#frontGrad-${i})">
      <animate attributeName="d"
               dur="1.5s"
               begin="${i * 0.18 + 0.3}s"
               fill="freeze"
               calcMode="spline"
               keyTimes="0;1"
               keySplines="0.25 1 0.5 1"
               from="M 24 ${rowY + 14} L 24 ${rowY + 14} L 24 ${rowY + 24} L 24 ${rowY + 24} Z"
               to="M 24 ${rowY + 14} L ${24 + targetW} ${rowY + 14} L ${24 + targetW} ${rowY + 24} L 24 ${rowY + 24} Z"/>
    </path>

    <!-- Right Side Face -->
    <path fill="url(#rightGrad-${i})">
      <animate attributeName="d"
               dur="1.5s"
               begin="${i * 0.18 + 0.3}s"
               fill="freeze"
               calcMode="spline"
               keyTimes="0;1"
               keySplines="0.25 1 0.5 1"
               from="M 24 ${rowY + 14} L ${24 + dDepth} ${rowY + 14 - dDepth} L ${24 + dDepth} ${rowY + 24 - dDepth} L 24 ${rowY + 24} Z"
               to="M ${24 + targetW} ${rowY + 14} L ${24 + targetW + dDepth} ${rowY + 14 - dDepth} L ${24 + targetW + dDepth} ${rowY + 24 - dDepth} L ${24 + targetW} ${rowY + 24} Z"/>
    </path>

  </g>
`;
      y += 48;
      return row;
    })
    .join('');

  return `
<svg width="${width}"
     height="${height}"
     viewBox="0 0 ${width} ${height}"
     xmlns="http://www.w3.org/2000/svg">

  <style>
    text {
      font-family: "Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      dominant-baseline: middle;
    }
    .card-title {
      font-weight: 800;
      letter-spacing: 0.5px;
      fill: #f8fafc;
    }
    .card-subtitle {
      font-weight: 500;
      fill: #475569;
    }
    .system-status {
      font-family: monospace;
      font-size: 9px;
      fill: #34d399;
      letter-spacing: 1px;
    }
    .banner-text {
      font-family: monospace;
      font-size: 10px;
      font-weight: 700;
      fill: #a5b4fc;
      letter-spacing: 1px;
    }
  </style>

  <defs>
    <!-- Background Aura Glow -->
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#06b6d4" flood-opacity="0.3"/>
    </filter>
    <filter id="neonShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Holographic grid pattern -->
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" stroke-width="0.7" stroke-opacity="0.25"/>
      <circle cx="24" cy="0" r="1" fill="#475569" fill-opacity="0.3"/>
    </pattern>

    <!-- Dynamic rotating border gradient -->
    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="35%" stop-color="#818cf8"/>
      <stop offset="70%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#06b6d4"/>
      <animateTransform
        attributeName="gradientTransform"
        type="rotate"
        from="0 0.5 0.5"
        to="360 0.5 0.5"
        dur="10s"
        repeatCount="indefinite"/>
    </linearGradient>

    <!-- Deep obsidian base background -->
    <radialGradient id="bgGradient" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0b0f19"/>
      <stop offset="100%" stop-color="#020408"/>
    </radialGradient>

    <!-- Generated language gradients definitions -->
    ${gradientDefs}
  </defs>

  <!-- Background Base -->
  <rect width="100%" height="100%" rx="16" fill="url(#bgGradient)"/>
  
  <!-- Tech Grid Overlay -->
  <rect width="100%" height="100%" rx="16" fill="url(#grid)"/>

  <!-- Glowing Background Aura -->
  <circle cx="240" cy="160" r="140" fill="#06b6d4" fill-opacity="0.03" filter="url(#glow)"/>

  <!-- Rotating Laser Border -->
  <rect x="1.5" y="1.5" width="477" height="317" rx="14.5" 
        fill="none" stroke="url(#borderGradient)" stroke-width="2" />

  <!-- ==================== HEADER ==================== -->

  <!-- Badge Tag -->
  <g transform="translate(24, 24)">
    <rect x="0" y="0" width="138" height="18" rx="4" fill="#06b6d4" fill-opacity="0.15" stroke="#06b6d4" stroke-opacity="0.4" stroke-width="0.8"/>
    <text x="8" y="9.5" fill="#67e8f9" font-size="8.5" font-weight="700" letter-spacing="1.2">DEVELOPER METRICS</text>
  </g>

  <!-- Title -->
  <text x="24" y="56" font-size="18" font-weight="800" fill="#f8fafc" class="card-title">
    Coding Metrics
  </text>
  
  <!-- Subtitle -->
  <text x="166" y="56" font-size="11" font-weight="500" fill="#475569" class="card-subtitle">
    // LAST 7 DAYS · WAKATIME
  </text>

  <!-- Status Indicator -->
  <g transform="translate(372, 24)" class="system-status">
    <circle cx="0" cy="9" r="3" fill="#34d399" filter="url(#neonShadow)">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="2.0s" repeatCount="indefinite"/>
    </circle>
    <text x="10" y="9" font-weight="700">WAKA_SYNC // OK</text>
  </g>

  <!-- Divider Line -->
  <line x1="24" y1="72" x2="456" y2="72" stroke="#1e293b" stroke-width="1"/>

  <!-- Total Time Glassmorphic Panel -->
  <g transform="translate(24, 82)">
    <rect x="0" y="0" width="432" height="30" rx="6" fill="#6366f1" fill-opacity="0.08" stroke="#6366f1" stroke-opacity="0.25" stroke-width="0.8"/>
    <text x="12" y="15" class="banner-text">TOTAL LOGGED TIME: ${stats.total} // ACTIVE CONTEXT</text>
    <circle cx="418" cy="15" r="4" fill="#6366f1" fill-opacity="0.8" filter="url(#neonShadow)">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
    </circle>
  </g>

  <!-- ==================== ROWS ==================== -->
  ${rows}

  <!-- Footer Details -->
  <text x="24" y="294" font-size="9" font-weight="600" fill="#334155" letter-spacing="0.5">
    DATA SYNC: SUCCESSFUL // CACHE_CONTROL: PUBLIC_MAX_AGE=21600
  </text>
  <text x="456" y="294" font-size="9" font-weight="600" fill="#334155" text-anchor="end" letter-spacing="0.5">
    SECURE PROTOCOL // SHIELD_SYSTEMS_ACTIVE
  </text>

</svg>
`;
}
