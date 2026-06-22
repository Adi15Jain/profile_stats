import { fetchWakaTimeLast7Days } from "../lib/wakatime.js";
import { renderWakaTimeSVG } from "../lib/svg.js";
import { renderGitHubSVG } from "../lib/githubCard.js";
import { fetchContributions } from "../lib/githubData.js";
import { combineCards } from "../lib/statsCard.js";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export default async function handler(req, res) {
    try {
        const headers = {
            Authorization: `token ${GITHUB_TOKEN}`,
            "User-Agent": "profile-stats",
        };

        // Left card — WakaTime coding activity
        const waka = await fetchWakaTimeLast7Days();
        const leftSvg = renderWakaTimeSVG(waka);

        // Right card — GitHub overview + contribution activity
        const user = await (
            await fetch("https://api.github.com/user", { headers })
        ).json();
        const repos = await (
            await fetch("https://api.github.com/user/repos?per_page=100", {
                headers,
            })
        ).json();

        let totalStars = 0;
        let totalForks = 0;
        for (const repo of repos) {
            if (repo.fork) continue;
            totalStars += repo.stargazers_count;
            totalForks += repo.forks_count;
        }

        let contributions = { total: 0, currentStreak: 0, longestStreak: 0 };
        try {
            contributions = await fetchContributions();
        } catch (e) {
            console.error("contributions fetch failed:", e.message);
        }

        const rightSvg = renderGitHubSVG({
            user,
            totalStars,
            totalForks,
            contributions,
        });

        const svg = combineCards(leftSvg, rightSvg);

        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=21600");
        res.status(200).send(svg);
    } catch (err) {
        console.error("Stats handler error:", err);
        res.setHeader("Content-Type", "image/svg+xml");
        res.status(200).send("<svg></svg>");
    }
}
