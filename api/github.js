const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'User-Agent': 'profile-stats',
      },
    });

    if (!response.ok) {
      throw new Error('GitHub API failed');
    }

    const data = await response.json();

    const svg = `
<svg width="420" height="160" xmlns="http://www.w3.org/2000/svg">
  <style>
    text {
      fill: #777;
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial;
      font-size: 13px;
    }
  </style>

  <rect width="100%" height="100%" rx="12" fill="transparent"/>
  <text x="20" y="28" font-size="15" fill="#3776AB" font-weight="600">
    GitHub Stats
  </text>

  <text x="20" y="60">Public Repos: ${data.public_repos}</text>
  <text x="20" y="85">Followers: ${data.followers}</text>
  <text x="20" y="110">Following: ${data.following}</text>
</svg>
`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=21600');
    res.status(200).send(svg);
  } catch {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(`<svg></svg>`);
  }
}
