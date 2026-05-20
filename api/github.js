const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export default async function handler(req, res) {
  try {
    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      'User-Agent': 'profile-stats',
    };

    // Fetch user profile
    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) throw new Error('GitHub user fetch failed');
    const user = await userRes.json();

    // Fetch repos to compute stars & forks
    const reposRes = await fetch(
      'https://api.github.com/user/repos?per_page=100',
      { headers },
    );
    if (!reposRes.ok) throw new Error('GitHub repos fetch failed');
    const repos = await reposRes.json();

    let totalStars = 0;
    let totalForks = 0;

    for (const repo of repos) {
      if (repo.fork) continue;
      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;
    }

    // Account age
    const created = new Date(user.created_at);
    const yearsOnGitHub = (
      (Date.now() - created.getTime()) /
      (1000 * 60 * 60 * 24 * 365)
    ).toFixed(1);

    // Seasoned calculation including overall 20+ years developer experience
    const devExperienceYears = 4.4;
    const score = Math.min(
      98,
      Math.round(
        user.public_repos * 1.2 +
        user.followers * 1.5 +
        totalStars * 3 +
        yearsOnGitHub * 2.5 +
        devExperienceYears * 2.3
      ),
    );

    const svg = `
<svg width="480" height="320"
     viewBox="0 0 480 320"
     xmlns="http://www.w3.org/2000/svg">

  <style>
    text {
      font-family: "Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      dominant-baseline: middle;
    }
    .glitch-text {
      font-weight: 800;
      letter-spacing: 1px;
    }
    .widget-val {
      font-weight: 700;
      fill: #f8fafc;
      font-size: 16px;
    }
    .widget-lbl {
      fill: #64748b;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .system-status {
      font-family: monospace;
      font-size: 9px;
      fill: #34d399;
      letter-spacing: 1px;
    }
  </style>

  <defs>
    <!-- Glassmorphic shadows -->
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#6366f1" flood-opacity="0.35"/>
    </filter>
    <filter id="neonShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.4"/>
    </filter>

    <!-- Holographic grid pattern -->
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" stroke-width="0.7" stroke-opacity="0.25"/>
      <circle cx="24" cy="0" r="1" fill="#475569" fill-opacity="0.3"/>
    </pattern>

    <!-- Moving border gradient -->
    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="35%" stop-color="#06b6d4"/>
      <stop offset="70%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#4f46e5"/>
      <animateTransform
        attributeName="gradientTransform"
        type="rotate"
        from="0 0.5 0.5"
        to="360 0.5 0.5"
        dur="10s"
        repeatCount="indefinite"/>
    </linearGradient>

    <!-- Gradient for stats widgets -->
    <linearGradient id="widgetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0.85"/>
    </linearGradient>

    <!-- Deep obsidian base background -->
    <radialGradient id="bgGradient" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0b0f19"/>
      <stop offset="100%" stop-color="#020408"/>
    </radialGradient>

    <!-- Neon progress bar gradient -->
    <linearGradient id="strengthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#f43f5e"/>
    </linearGradient>
  </defs>

  <!-- Background base -->
  <rect width="100%" height="100%" rx="16" fill="url(#bgGradient)"/>
  
  <!-- Tech Grid overlays -->
  <rect width="100%" height="100%" rx="16" fill="url(#grid)"/>

  <!-- Glowing background aura -->
  <circle cx="240" cy="160" r="140" fill="#4f46e5" fill-opacity="0.04" filter="url(#glow)"/>

  <!-- Rotating Laser Border -->
  <rect x="1.5" y="1.5" width="477" height="317" rx="14.5" 
        fill="none" stroke="url(#borderGradient)" stroke-width="2" />

  <!-- ==================== HEADER ==================== -->
  
  <!-- Badge Tag -->
  <g transform="translate(24, 24)">
    <rect x="0" y="0" width="168" height="18" rx="4" fill="#6366f1" fill-opacity="0.15" stroke="#6366f1" stroke-opacity="0.4" stroke-width="0.8"/>
    <text x="8" y="9.5" fill="#a5b4fc" font-size="8.5" font-weight="700" letter-spacing="1.2">PRINCIPAL SYSTEMS ARCHITECT</text>
  </g>

  <!-- Title -->
  <text x="24" y="56" font-size="18" font-weight="800" fill="#f8fafc" class="glitch-text" letter-spacing="0.5">
    GitHub Overview
  </text>
  
  <!-- Subtitle -->
  <text x="174" y="56" font-size="11" font-weight="500" fill="#475569">
    // EST. 2006 · SENIOR VETERAN
  </text>

  <!-- Status indicator -->
  <g transform="translate(372, 24)" class="system-status">
    <circle cx="0" cy="9" r="3" fill="#34d399" filter="url(#neonShadow)">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
    </circle>
    <text x="10" y="9" font-weight="700">SYS_ACTIVE // v2.6</text>
  </g>

  <!-- Divider line -->
  <line x1="24" y1="72" x2="456" y2="72" stroke="#1e293b" stroke-width="1"/>

  <!-- ==================== WIDGETS GRID ==================== -->

  <!-- Widget 1: Developer Experience (Veteran Core) -->
  <g transform="translate(24, 84)" filter="url(#cardShadow)">
    <rect width="136" height="58" rx="8" fill="url(#widgetGrad)" stroke="#334155" stroke-opacity="0.4" stroke-width="1"/>
    <text x="12" y="20" class="widget-lbl">DEVELOPER EXP</text>
    <text x="12" y="38" class="widget-val" fill="#a5b4fc">20+ Years</text>
    <!-- Micro-graph indicator line -->
    <path d="M 95 38 Q 105 28 115 36 T 125 24" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.8"/>
  </g>

  <!-- Widget 2: Public Repos -->
  <g transform="translate(172, 84)" filter="url(#cardShadow)">
    <rect width="136" height="58" rx="8" fill="url(#widgetGrad)" stroke="#334155" stroke-opacity="0.4" stroke-width="1"/>
    <text x="12" y="20" class="widget-lbl">REPOSITORIES</text>
    <text x="12" y="38" class="widget-val">${user.public_repos}</text>
    <!-- Micro-graph indicator line -->
    <path d="M 95 34 Q 105 38 115 28 T 125 32" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.8"/>
  </g>

  <!-- Widget 3: Total Stars -->
  <g transform="translate(320, 84)" filter="url(#cardShadow)">
    <rect width="136" height="58" rx="8" fill="url(#widgetGrad)" stroke="#334155" stroke-opacity="0.4" stroke-width="1"/>
    <text x="12" y="20" class="widget-lbl">TOTAL STARS</text>
    <text x="12" y="38" class="widget-val" fill="#f59e0b">${totalStars}</text>
    <!-- Micro-graph indicator line -->
    <path d="M 95 36 Q 105 24 115 32 T 125 20" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.8"/>
  </g>

  <!-- Widget 4: Followers -->
  <g transform="translate(24, 154)" filter="url(#cardShadow)">
    <rect width="136" height="58" rx="8" fill="url(#widgetGrad)" stroke="#334155" stroke-opacity="0.4" stroke-width="1"/>
    <text x="12" y="20" class="widget-lbl">FOLLOWERS</text>
    <text x="12" y="38" class="widget-val">${user.followers}</text>
    <!-- Micro-graph indicator line -->
    <path d="M 95 24 Q 105 32 115 26 T 125 34" fill="none" stroke="#ec4899" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.8"/>
  </g>

  <!-- Widget 5: Forks -->
  <g transform="translate(172, 154)" filter="url(#cardShadow)">
    <rect width="136" height="58" rx="8" fill="url(#widgetGrad)" stroke="#334155" stroke-opacity="0.4" stroke-width="1"/>
    <text x="12" y="20" class="widget-lbl">TOTAL FORKS</text>
    <text x="12" y="38" class="widget-val">${totalForks}</text>
    <!-- Micro-graph indicator line -->
    <path d="M 95 32 Q 105 24 115 36 T 125 26" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.8"/>
  </g>

  <!-- Widget 6: GitHub Member Age -->
  <g transform="translate(320, 154)" filter="url(#cardShadow)">
    <rect width="136" height="58" rx="8" fill="url(#widgetGrad)" stroke="#334155" stroke-opacity="0.4" stroke-width="1"/>
    <text x="12" y="20" class="widget-lbl">GITHUB MEMBER</text>
    <text x="12" y="38" class="widget-val">${yearsOnGitHub} Yrs</text>
    <!-- Micro-graph indicator line -->
    <path d="M 95 30 Q 105 28 115 32 T 125 24" fill="none" stroke="#a855f7" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.8"/>
  </g>

  <!-- ==================== STRENGTH / INTEGRITY ==================== -->

  <!-- Strength Bar Container -->
  <g transform="translate(24, 230)">
    <!-- Label -->
    <text x="0" y="10" font-size="10" font-weight="700" fill="#94a3b8" letter-spacing="1">SYSTEM INTEGRITY // CORE CAPACITY</text>
    
    <!-- Value -->
    <text x="432" y="10" font-size="11" font-weight="800" fill="#ec4899" text-anchor="end" letter-spacing="0.5">
      ${score}% // ARCHITECT GRADE
    </text>

    <!-- Outer progress track -->
    <rect x="0" y="22" width="432" height="12" rx="6" fill="#0f172a" fill-opacity="0.8" stroke="#1e293b" stroke-width="1"/>
    
    <!-- Inner progress bar filled -->
    <rect x="0" y="22" width="${(432 * score) / 100}" height="12" rx="6" fill="url(#strengthGradient)" filter="url(#neonShadow)">
      <animate attributeName="width"
               from="0"
               to="${(432 * score) / 100}"
               dur="1.8s"
               easing="cubic-bezier(0.4, 0, 0.2, 1)"
               fill="freeze"/>
    </rect>

    <!-- Floating scanline highlight on progress bar -->
    <rect x="0" y="23" width="30" height="10" rx="3" fill="#ffffff" fill-opacity="0.15">
      <animate attributeName="x"
               values="0;400;0"
               dur="4s"
               repeatCount="indefinite"/>
    </rect>
  </g>

  <!-- Status Details Footer -->
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
    console.error('GitHub stats handler error:', err);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(`
<svg width="480" height="320" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="16" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>
  <text x="240" y="160" dominant-baseline="middle" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="14" font-weight="bold">
    GitHub Overview Endpoint Error
  </text>
</svg>
`);
  }
}
