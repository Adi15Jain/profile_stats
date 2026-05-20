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

    // Seasoned calculation including overall developer experience
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

    // Dynamic career ranking based on experience years
    let badgeTitle = 'FULL-STACK DEVELOPER';
    let careerSub = 'ACTIVE PROFESSIONAL';
    const floorExp = Math.floor(devExperienceYears);
    const expLabel = `${floorExp}+ Year${floorExp !== 1 ? 's' : ''}`;
    const estYear = new Date().getFullYear() - floorExp;

    if (devExperienceYears >= 15) {
      badgeTitle = 'PRINCIPAL SYSTEMS ARCHITECT';
      careerSub = `EST. ${estYear} · SENIOR VETERAN`;
    } else if (devExperienceYears >= 8) {
      badgeTitle = 'LEAD FULL-STACK ARCHITECT';
      careerSub = `EST. ${estYear} · TECH LEAD`;
    } else if (devExperienceYears >= 4) {
      badgeTitle = 'SENIOR FULL-STACK DEVELOPER';
      careerSub = `EST. ${estYear} · EXPERT DEV`;
    } else {
      badgeTitle = 'FULL-STACK DEVELOPER';
      careerSub = `EST. ${estYear} · ACTIVE PRO`;
    }

    const svg = `
<svg width="420" height="220"
     viewBox="0 0 420 220"
     xmlns="http://www.w3.org/2000/svg">

  <style>
    text {
      font-family: "Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      dominant-baseline: middle;
    }
    .widget-val {
      font-weight: 700;
      fill: #f8fafc;
      font-size: 13px;
    }
    .widget-lbl {
      fill: #64748b;
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .system-status {
      font-family: monospace;
      font-size: 8px;
      fill: #34d399;
      letter-spacing: 1px;
    }
  </style>

  <defs>
    <!-- Glassmorphic shadows -->
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#6366f1" flood-opacity="0.3"/>
    </filter>
    <filter id="neonShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.4"/>
    </filter>

    <!-- Holographic grid pattern -->
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.6" stroke-opacity="0.2"/>
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
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0.9"/>
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
  <rect width="100%" height="100%" rx="14" fill="url(#bgGradient)"/>
  
  <!-- Tech Grid overlays -->
  <rect width="100%" height="100%" rx="14" fill="url(#grid)"/>

  <!-- Rotating Laser Border -->
  <rect x="1.5" y="1.5" width="417" height="217" rx="12.5" 
        fill="none" stroke="url(#borderGradient)" stroke-width="2" />

  <!-- ==================== HEADER ==================== -->
  
  <!-- Badge Tag -->
  <g transform="translate(20, 16)">
    <rect x="0" y="0" width="166" height="15" rx="3.5" fill="#6366f1" fill-opacity="0.15" stroke="#6366f1" stroke-opacity="0.4" stroke-width="0.8"/>
    <text x="8" y="8" fill="#a5b4fc" font-size="7.5" font-weight="700" letter-spacing="1">${badgeTitle}</text>
  </g>

  <!-- Title -->
  <text x="20" y="46" font-size="14.5" font-weight="800" fill="#f8fafc" letter-spacing="0.5">
    GitHub Overview
  </text>
  
  <!-- Subtitle -->
  <text x="146" y="46" font-size="9" font-weight="500" fill="#475569">
    // ${careerSub}
  </text>

  <!-- Status indicator -->
  <g transform="translate(320, 16)" class="system-status">
    <circle cx="0" cy="8" r="2.5" fill="#34d399" filter="url(#neonShadow)">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
    </circle>
    <text x="8" y="8" font-weight="700">SYS_ACTIVE</text>
  </g>

  <!-- Divider line -->
  <line x1="20" y1="62" x2="400" y2="62" stroke="#1e293b" stroke-width="1"/>

  <!-- ==================== CONTENT DOUBLE COLUMN ==================== -->

  <!-- Left Column Widget: Stats Box -->
  <g transform="translate(20, 72)" filter="url(#cardShadow)">
    <rect width="186" height="114" rx="8" fill="url(#widgetGrad)" stroke="#334155" stroke-opacity="0.4" stroke-width="0.8"/>
    
    <!-- Row 1: Experience -->
    <text x="12" y="20" class="widget-lbl">DEVELOPER EXP</text>
    <text x="174" y="20" class="widget-val" fill="#a5b4fc" text-anchor="end">${expLabel}</text>
    
    <!-- Row 2: Repos -->
    <text x="12" y="44" class="widget-lbl">REPOSITORIES</text>
    <text x="174" y="44" class="widget-val" text-anchor="end">${user.public_repos}</text>

    <!-- Row 3: Total Stars -->
    <text x="12" y="68" class="widget-lbl">TOTAL STARS</text>
    <text x="174" y="68" class="widget-val" fill="#f59e0b" text-anchor="end">${totalStars}</text>

    <!-- Row 4: Followers / Member -->
    <text x="12" y="92" class="widget-lbl">FOLLOWERS</text>
    <text x="174" y="92" class="widget-val" fill="#ec4899" text-anchor="end">${user.followers}</text>
  </g>

  <!-- Right Column Widget: Strength Meter -->
  <g transform="translate(216, 72)" filter="url(#cardShadow)">
    <rect width="184" height="114" rx="8" fill="url(#widgetGrad)" stroke="#334155" stroke-opacity="0.4" stroke-width="0.8"/>
    
    <text x="14" y="22" class="widget-lbl" fill="#94a3b8" letter-spacing="0.5">SYSTEM INTEGRITY</text>
    <text x="14" y="42" class="widget-val" fill="#ec4899" font-size="14">${score}%</text>
    <text x="170" y="42" font-size="8.5" font-weight="700" fill="#34d399" text-anchor="end" font-family="monospace">// CORE OK</text>
    
    <!-- Score Progress Trough -->
    <rect x="14" y="58" width="156" height="8" rx="4" fill="#0f172a" stroke="#1e293b" stroke-width="0.6"/>
    
    <!-- Score Progress Bar -->
    <rect x="14" y="58" width="${(156 * score) / 100}" height="8" rx="4" fill="url(#strengthGradient)" filter="url(#neonShadow)">
      <animate attributeName="width"
               from="0"
               to="${(156 * score) / 100}"
               dur="1.6s"
               calcMode="spline"
               keyTimes="0;1"
               keySplines="0.25 1 0.5 1"
               fill="freeze"/>
    </rect>
    
    <!-- Detailed telemetry strings -->
    <text x="14" y="84" font-size="8" font-family="monospace" fill="#475569">GITHUB MEMBER: ${yearsOnGitHub} YEARS</text>
    <text x="14" y="98" font-size="8" font-family="monospace" fill="#475569">TOTAL FORKS: ${totalForks} ENTS</text>
  </g>

  <!-- ==================== FOOTER ==================== -->
  <text x="20" y="202" font-size="8" font-weight="600" fill="#334155" letter-spacing="0.5">
    SECURE PROTOCOL // SHIELD_ACTIVE
  </text>
  <text x="400" y="202" font-size="8" font-weight="600" fill="#334155" text-anchor="end" letter-spacing="0.5">
    DATA SYNC: SUCCESSFUL // CACHED
  </text>

</svg>
