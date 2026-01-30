export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'API is working',
  });
}
import { fetchWakaTimeLast7Days } from '../lib/wakatime.js';
import { renderWakaTimeSVG } from '../lib/svg.js';

export default async function handler(req, res) {
  try {
    const stats = await fetchWakaTimeLast7Days();
    const svg = renderWakaTimeSVG(stats);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=21600');
    res.status(200).send(svg);
  } catch (err) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(`
<svg width="420" height="80" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="12" fill="#0d1117"/>
  <text x="20" y="45" fill="#c9d1d9">
    WakaTime stats unavailable
  </text>
</svg>
`);
  }
}
