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

    // Simple, explainable profile strength score
    const score = Math.min(
      100,
      Math.round(
        user.public_repos * 1.5 +
          user.followers * 2 +
          totalStars * 3 +
          yearsOnGitHub * 5,
      ),
    );

    const svg = `
<svg width="420" height="220"
     viewBox="0 0 420 220"
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
    <linearGradient id="bgGradient"
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

    <linearGradient id="accentGradient"
                    x1="0%" y1="0%"
                    x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" rx="18" fill="url(#bgGradient)"/>

  <!-- Header -->
  <text x="40" y="36"
        font-size="16"
        font-weight="600"
        fill="#e5e7eb">
    GitHub · Profile Overview
  </text>

  <text x="40" y="58"
        font-size="13"
        fill="#94a3b8">
    Since ${yearsOnGitHub} years · ${user.public_repos} repositories
  </text>

  <!-- Divider -->
  <line x1="40" y1="74" x2="380" y2="74"
        stroke="#334155" stroke-opacity="0.6"/>

  <!-- Stats grid -->
  <text x="40" y="102" fill="#cbd5f5">Followers</text>
  <text x="180" y="102" fill="#e5e7eb" font-weight="500">${user.followers}</text>

  <text x="40" y="126" fill="#cbd5f5">Following</text>
  <text x="180" y="126" fill="#e5e7eb" font-weight="500">${user.following}</text>

  <text x="40" y="150" fill="#cbd5f5">Total Stars</text>
  <text x="180" y="150" fill="#e5e7eb" font-weight="500">${totalStars}</text>

  <text x="40" y="174" fill="#cbd5f5">Total Forks</text>
  <text x="180" y="174" fill="#e5e7eb" font-weight="500">${totalForks}</text>

  <!-- Profile strength -->
  <text x="260" y="112" fill="#cbd5f5">Profile Strength</text>

  <rect x="260" y="124"
        width="120" height="8"
        rx="4"
        fill="#1f2937"/>

  <rect x="260" y="124"
        width="${Math.min(120, score * 1.2)}"
        height="8"
        rx="4"
        fill="url(#accentGradient)">
    <animate attributeName="width"
             from="0"
             to="${Math.min(120, score * 1.2)}"
             dur="1.2s"
             fill="freeze"/>
  </rect>

  <text x="260" y="146"
        fill="#e5e7eb"
        font-weight="500">
    Score: ${score}/100
  </text>

</svg>
`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=21600');
    res.status(200).send(svg);
  } catch (err) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(`<svg></svg>`);
  }
}
