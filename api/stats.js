import { fetchWakaTimeLast7Days } from "../lib/wakatime.js";
import { renderWakaTimeSVG } from "../lib/svg.js";
import { renderGitHubSVG } from "../lib/githubCard.js";
import { fetchGitHubData } from "../lib/githubData.js";
import { combineCards } from "../lib/statsCard.js";

export default async function handler(req, res) {
    try {
        // Left card — WakaTime coding activity; right card — GitHub overview.
        const [waka, github] = await Promise.all([
            fetchWakaTimeLast7Days(),
            fetchGitHubData(),
        ]);

        const svg = combineCards(renderWakaTimeSVG(waka), renderGitHubSVG(github));

        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=21600");
        res.status(200).send(svg);
    } catch (err) {
        console.error("Stats handler error:", err);
        res.setHeader("Content-Type", "image/svg+xml");
        res.status(200).send("<svg xmlns='http://www.w3.org/2000/svg'></svg>");
    }
}
