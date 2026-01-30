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

    const repos = await reposRes.json();
    const totals = {};

    for (const repo of repos) {
      if (repo.fork) continue;

      const langRes = await fetch(repo.languages_url, { headers });
      const langs = await langRes.json();

      for (const [lang, loc] of Object.entries(langs)) {
        totals[lang] = (totals[lang] || 0) + loc;
      }
    }

    const top = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    let y = 60;
    const rows = top
      .map(([lang]) => {
        const row = `<text x="20" y="${y}">${lang}</text>`;
        y += 22;
        return row;
      })
      .join('');

    const svg = `
<svg width="420" height="${y + 20}" xmlns="http://www.w3.org/2000/svg">
  <style>
    text {
      fill: #777;
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial;
      font-size: 13px;
    }
  </style>

  <rect width="100%" height="100%" rx="12" fill="transparent"/>
  <text x="20" y="28" font-size="15" fill="#3776AB" font-weight="600">
    Top Languages
  </text>

  ${rows}
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
