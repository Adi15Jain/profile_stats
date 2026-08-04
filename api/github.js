import { renderGitHubSVG } from "../lib/githubCard.js";
import { fetchGitHubData } from "../lib/githubData.js";

export default async function handler(req, res) {
    try {
        const data = await fetchGitHubData();
        const svg = renderGitHubSVG(data);

        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=21600");
        res.status(200).send(svg);
    } catch (err) {
        console.error("GitHub stats handler error:", err);
        res.setHeader("Content-Type", "image/svg+xml");
        res.status(200).send("<svg xmlns='http://www.w3.org/2000/svg'></svg>");
    }
}
