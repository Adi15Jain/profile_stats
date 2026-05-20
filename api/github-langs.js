const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export default async function handler(req, res) {
  try {
    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      'User-Agent': 'profile-stats',
    };

    const reposRes = await fetch(
      'https://api.github.com/user/repos?per_page=100',
      { headers },
    );

    if (!reposRes.ok) throw new Error('GitHub repos fetch failed');
    const repos = await reposRes.json();
    const totals = {};

    // Parallelized fetching of repo language breakdowns to prevent Vercel timeouts
    const repoPromises = repos
      .filter((repo) => !repo.fork)
      .map(async (repo) => {
        try {
          const langRes = await fetch(repo.languages_url, { headers });
          if (langRes.ok) {
            return await langRes.json();
          }
        } catch (err) {
          console.error(`Error fetching languages for ${repo.name}:`, err);
        }
        return {};
      });

    const allLangs = await Promise.all(repoPromises);

    for (const langs of allLangs) {
      if (!langs) continue;
      for (const [lang, loc] of Object.entries(langs)) {
        totals[lang] = (totals[lang] || 0) + loc;
      }
    }

    const top = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Compute total LOC in top 5 to get percentage weight
    const topSum = top.reduce((sum, item) => sum + item[1], 0);

    // Dynamic 3D Isometric themes for columns
    const themes = {
      teal: {
        name: 'Teal',
        left: ['#047857', '#064e3b'],
        right: ['#10b981', '#065f46'],
        top: ['#34d399', '#10b981'],
        glow: '#10b981'
      },
      blue: {
        name: 'Blue',
        left: ['#1d4ed8', '#172554'],
        right: ['#3b82f6', '#1e40af'],
        top: ['#60a5fa', '#3b82f6'],
        glow: '#3b82f6'
      },
      purple: {
        name: 'Purple',
        left: ['#7c3aed', '#3b0764'],
        right: ['#9333ea', '#581c87'],
        top: ['#c084fc', '#9333ea'],
        glow: '#9333ea'
      },
      orange: {
        name: 'Orange',
        left: ['#ea580c', '#431407'],
        right: ['#f97316', '#9a3412'],
        top: ['#fb923c', '#f97316'],
        glow: '#f97316'
      },
      yellow: {
        name: 'Yellow',
        left: ['#ca8a04', '#422006'],
        right: ['#eab308', '#a16207'],
        top: ['#fde047', '#eab308'],
        glow: '#eab308'
      }
    };

    // Brand color mapping
    const langToTheme = {
      typescript: themes.blue,
      javascript: themes.yellow,
      python: themes.teal,
      html: themes.orange,
      css: themes.purple,
      rust: themes.orange,
      go: themes.blue,
      c: themes.blue,
      cpp: themes.blue
    };

    const keys = Object.keys(themes);

    let gradientDefs = '';
    let columnsSVG = '';

    // Core coordinates
    const cy = 246;          // base Y level
    const w = 15;            // isometric column half-width
    const dDepth = 7;        // isometric perspective depth depth
    const maxH = 120;        // maximum pillar height

    // Standardize positions for 5 pillars
    const cxPositions = [72, 156, 240, 324, 408];

    // Compute the max LOC value in top 5 for visual scaling
    const maxLOC = top.length > 0 ? top[0][1] : 1;

    top.forEach(([lang, loc], i) => {
      const cx = cxPositions[i];
      const key = lang.toLowerCase();
      // Select official brand color scheme, or fallback based on index
      const theme = langToTheme[key] || themes[keys[i % keys.length]];
      const pct = topSum > 0 ? (loc / topSum) * 100 : 0;

      // Visual height scaling (highest language takes maxH, others scale down proportionally)
      // Minimum height of 30px to ensure beautiful volumetric shape is visible
      const targetH = Math.round(30 + ((loc / maxLOC) * (maxH - 30)));

      // Render gradient configurations
      gradientDefs += `
    <linearGradient id="leftGrad-${i}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${theme.left[0]}"/>
      <stop offset="100%" stop-color="${theme.left[1]}"/>
    </linearGradient>
    <linearGradient id="rightGrad-${i}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${theme.right[0]}"/>
      <stop offset="100%" stop-color="${theme.right[1]}"/>
    </linearGradient>
    <linearGradient id="topGrad-${i}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.top[0]}"/>
      <stop offset="100%" stop-color="${theme.top[1]}"/>
    </linearGradient>
    <radialGradient id="shadowGrad-${i}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${theme.glow}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${theme.glow}" stop-opacity="0"/>
    </radialGradient>
      `;

      columnsSVG += `
  <!-- Pillar ${i + 1}: ${lang} -->
  <g opacity="0">
    <animate attributeName="opacity"
             from="0"
             to="1"
             dur="0.6s"
             begin="${i * 0.15 + 0.1}s"
             fill="freeze"/>

    <!-- Base Glowing Footpad (3D Shadow Projection) -->
    <ellipse cx="${cx}" cy="${cy - dDepth}" rx="24" ry="10" fill="url(#shadowGrad-${i})" filter="url(#neonShadow)"/>

    <!-- 3D Column isometric prism faces -->
    
    <!-- Front-Left Face -->
    <polygon fill="url(#leftGrad-${i})" stroke="${theme.left[0]}" stroke-width="0.3" stroke-opacity="0.3">
      <animate attributeName="points"
               dur="1.5s"
               begin="${i * 0.18 + 0.3}s"
               fill="freeze"
               calcMode="spline"
               keyTimes="0;1"
               keySplines="0.25 1 0.5 1"
               from="${cx},${cy} ${cx - w},${cy - dDepth} ${cx - w},${cy - dDepth} ${cx},${cy}"
               to="${cx},${cy} ${cx - w},${cy - dDepth} ${cx - w},${cy - targetH - dDepth} ${cx},${cy - targetH}"/>
    </polygon>

    <!-- Front-Right Face -->
    <polygon fill="url(#rightGrad-${i})" stroke="${theme.right[0]}" stroke-width="0.3" stroke-opacity="0.3">
      <animate attributeName="points"
               dur="1.5s"
               begin="${i * 0.18 + 0.3}s"
               fill="freeze"
               calcMode="spline"
               keyTimes="0;1"
               keySplines="0.25 1 0.5 1"
               from="${cx},${cy} ${cx + w},${cy - dDepth} ${cx + w},${cy - dDepth} ${cx},${cy}"
               to="${cx},${cy} ${cx + w},${cy - dDepth} ${cx + w},${cy - targetH - dDepth} ${cx},${cy - targetH}"/>
    </polygon>

    <!-- Top Cap Face -->
    <polygon fill="url(#topGrad-${i})" stroke="${theme.top[0]}" stroke-width="0.3" stroke-opacity="0.5">
      <animate attributeName="points"
               dur="1.5s"
               begin="${i * 0.18 + 0.3}s"
               fill="freeze"
               calcMode="spline"
               keyTimes="0;1"
               keySplines="0.25 1 0.5 1"
               from="${cx},${cy} ${cx - w},${cy - dDepth} ${cx},${cy - 2 * dDepth} ${cx + w},${cy - dDepth}"
               to="${cx},${cy - targetH} ${cx - w},${cy - targetH - dDepth} ${cx},${cy - targetH - 2 * dDepth} ${cx + w},${cy - targetH - dDepth}"/>
    </polygon>

    <!-- Levitating Holographic Badge Group -->
    <g>
      <!-- Magnetic levitation floating animation -->
      <animateTransform attributeName="transform"
                        type="translate"
                        values="0 0; 0 -5; 0 0"
                        dur="3.2s"
                        repeatCount="indefinite"
                        begin="${i * 0.3}s"/>
      
      <!-- Slide up on entrance -->
      <animateTransform attributeName="transform"
                        type="translate"
                        from="0 100"
                        to="0 0"
                        dur="1.5s"
                        begin="${i * 0.18 + 0.3}s"
                        calcMode="spline"
                        keyTimes="0;1"
                        keySplines="0.25 1 0.5 1"
                        additive="sum"
                        fill="freeze"/>

      <!-- Translucent glass panel label -->
      <rect x="${cx - 28}" y="${cy - targetH - 38}" width="56" height="20" rx="4"
            fill="#090d16" fill-opacity="0.8" 
            stroke="url(#topGrad-${i})" stroke-width="0.8" />
      
      <!-- Floating light point -->
      <circle cx="${cx - 20}" cy="${cy - targetH - 28}" r="1.5" fill="${theme.glow}" filter="url(#neonShadow)"/>
      
      <!-- Language Code Name Text -->
      <text x="${cx + 4}" y="${cy - targetH - 28}" font-size="8" font-weight="800" fill="#f8fafc" text-anchor="middle">
        ${lang.substring(0, 5).toUpperCase()}
      </text>

      <!-- Percentage tag -->
      <text x="${cx}" y="${cy - targetH - 46}" font-size="8" font-weight="700" fill="#cbd5e1" text-anchor="middle">
        ${pct.toFixed(0)}%
      </text>
    </g>

  </g>
      `;
    });

    const svg = `
<svg width="480" height="320"
     viewBox="0 0 480 320"
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
      fill: #e0f2fe;
      letter-spacing: 1px;
    }
  </style>

  <defs>
    <!-- Background glow filter -->
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#a855f7" flood-opacity="0.3"/>
    </filter>
    <filter id="neonShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
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

    <!-- Deep obsidian base background -->
    <radialGradient id="bgGradient" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0b0f19"/>
      <stop offset="100%" stop-color="#020408"/>
    </radialGradient>

    <!-- Dynamic rotating border gradient -->
    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d946ef"/>
      <stop offset="35%" stop-color="#38bdf8"/>
      <stop offset="70%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#d946ef"/>
      <animateTransform
        attributeName="gradientTransform"
        type="rotate"
        from="0 0.5 0.5"
        to="360 0.5 0.5"
        dur="10s"
        repeatCount="indefinite"/>
    </linearGradient>

    <!-- Generated language specific linear gradients -->
    ${gradientDefs}
  </defs>

  <!-- Background Base -->
  <rect width="100%" height="100%" rx="16" fill="url(#bgGradient)"/>
  
  <!-- Tech Grid Overlay -->
  <rect width="100%" height="100%" rx="16" fill="url(#grid)"/>

  <!-- Glowing Background Aura -->
  <circle cx="240" cy="160" r="140" fill="#a855f7" fill-opacity="0.03" filter="url(#glow)"/>

  <!-- Rotating Laser Border -->
  <rect x="1.5" y="1.5" width="477" height="317" rx="14.5" 
        fill="none" stroke="url(#borderGradient)" stroke-width="2" />

  <!-- ==================== HEADER ==================== -->

  <!-- Badge Tag -->
  <g transform="translate(24, 24)">
    <rect x="0" y="0" width="138" height="18" rx="4" fill="#d946ef" fill-opacity="0.15" stroke="#d946ef" stroke-opacity="0.4" stroke-width="0.8"/>
    <text x="8" y="9.5" fill="#f5d0fe" font-size="8.5" font-weight="700" letter-spacing="1.2">SYSTEM CORE STACK</text>
  </g>

  <!-- Title -->
  <text x="24" y="56" font-size="18" font-weight="800" fill="#f8fafc" class="card-title">
    Technology Stack
  </text>
  
  <!-- Subtitle -->
  <text x="194" y="56" font-size="11" font-weight="500" fill="#475569" class="card-subtitle">
    // LANGUAGE METRICS · GITHUB
  </text>

  <!-- Status Indicator -->
  <g transform="translate(372, 24)" class="system-status">
    <circle cx="0" cy="9" r="3" fill="#a855f7" filter="url(#neonShadow)">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="2.0s" repeatCount="indefinite"/>
    </circle>
    <text x="10" y="9" font-weight="700" fill="#d946ef">STACK_LOADED // 3D</text>
  </g>

  <!-- Divider Line -->
  <line x1="24" y1="72" x2="456" y2="72" stroke="#1e293b" stroke-width="1"/>

  <!-- Stage Baseline (Isometric shadow floor lines) -->
  <path d="M 36 ${cy} L 444 ${cy}" stroke="#334155" stroke-opacity="0.25" stroke-width="1"/>
  <path d="M 36 ${cy - dDepth} L 444 ${cy - dDepth}" stroke="#1e293b" stroke-opacity="0.4" stroke-width="0.8" stroke-dasharray="4 4"/>

  <!-- ==================== 3D PILLARS GRID ==================== -->
  ${columnsSVG}

  <!-- Footer Details -->
  <text x="24" y="294" font-size="9" font-weight="600" fill="#334155" letter-spacing="0.5">
    DATA SYNC: SUCCESSFUL // CACHE_CONTROL: PUBLIC_MAX_AGE=21600
  </text>
  <text x="456" y="294" font-size="9" font-weight="600" fill="#334155" text-anchor="end" letter-spacing="0.5">
    SECURE PROTOCOL // SHIELD_SYSTEMS_ACTIVE
  </text>

</svg>
`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=21600');
    res.status(200).send(svg);
  } catch (err) {
    console.error('GitHub langs endpoint error:', err);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(`
<svg width="480" height="320" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="16" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
  <text x="240" y="160" dominant-baseline="middle" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="14" font-weight="bold">
    GitHub Langs Endpoint Error
  </text>
</svg>
`);
  }
}
