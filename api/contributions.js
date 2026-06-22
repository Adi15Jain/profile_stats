import { renderContribGraph } from '../lib/contribGraph.js';
import { fetchContributions } from '../lib/githubData.js';

export default async function handler(req, res) {
  try {
    const { weeks, total } = await fetchContributions();
    const svg = renderContribGraph({ weeks, total });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=21600');
    res.status(200).send(svg);
  } catch (err) {
    console.error('Contributions handler error:', err);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send('<svg></svg>');
  }
}
