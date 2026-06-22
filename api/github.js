import { renderGitHubSVG } from '../lib/githubCard.js';
import { fetchContributions } from '../lib/githubData.js';

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

    // Contribution stats (streaks + total) via GraphQL
    let contributions = { total: 0, currentStreak: 0, longestStreak: 0 };
    try {
      contributions = await fetchContributions();
    } catch (e) {
      console.error('contributions fetch failed:', e.message);
    }

    const svg = renderGitHubSVG({ user, totalStars, totalForks, contributions });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=21600');
    res.status(200).send(svg);
  } catch (err) {
    console.error('GitHub stats handler error:', err);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send('<svg></svg>');
  }
}
