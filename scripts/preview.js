// Local preview: renders every card with mock (or live, if GITHUB_TOKEN is
// set) data into preview/, plus an index.html to eyeball the animations.
//   node scripts/preview.js          # mock data, no network
//   GITHUB_TOKEN=... node scripts/preview.js --live
import { mkdirSync, writeFileSync } from "node:fs";
import { renderGitHubSVG } from "../lib/githubCard.js";
import { renderContribGraph } from "../lib/contribGraph.js";
import { renderProjectsSVG } from "../lib/projectsCard.js";
import { renderHeroSVG } from "../lib/heroCard.js";
import { renderWakaTimeSVG } from "../lib/svg.js";
import { combineCards } from "../lib/statsCard.js";
import { decorateWithGitHub, FEATURED } from "../lib/featured.js";
import { withFonts } from "../lib/theme.js";

function mockWeeks() {
    // deterministic pseudo-random calendar: 53 weeks, denser in recent months
    const weeks = [];
    const start = new Date("2025-08-03");
    let seed = 42;
    const rand = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
    };
    for (let w = 0; w < 53; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            const date = new Date(start.getTime() + (w * 7 + d) * 86400000);
            const density = 0.25 + (w / 53) * 0.4;
            const count = rand() < density ? Math.ceil(rand() * 12) : 0;
            week.push({ date: date.toISOString().slice(0, 10), count });
        }
        weeks.push(week);
    }
    return weeks;
}

function mockData() {
    const weeks = mockWeeks();
    const days = weeks.flat();
    const total = days.reduce((a, d) => a + d.count, 0);
    return {
        user: { login: "Adi15Jain", name: "Adi Jain", createdAt: "2020-05-20T00:00:00Z", followers: 4 },
        repoCount: 31,
        totalStars: 0,
        totalForks: 3,
        pinned: [
            { name: "InterviewPilot", description: "Realtime AI interviewer.", url: "#", stars: 3, forks: 0, pushedAt: "2026-07-12T00:00:00Z", language: "TypeScript", languageColor: "#3178c6" },
            { name: "CoinPush", description: "CryptoCurrency screening app built with Next.js 16.", url: "#", stars: 0, forks: 1, pushedAt: "2026-06-02T00:00:00Z", language: "TypeScript", languageColor: "#3178c6" },
            { name: "pneumoAI", description: "In-browser pneumonia CNN.", url: "#", stars: 5, forks: 2, pushedAt: "2026-08-01T00:00:00Z", language: "Python", languageColor: "#3572A5" },
        ],
        contributions: {
            weeks,
            total,
            commits: Math.round(total * 0.8),
            prs: 14,
            issues: 0,
            reviews: 3,
            currentStreak: 0,
            longestStreak: 9,
            activeDays: days.filter((d) => d.count > 0).length,
            busiest: days.reduce((a, d) => (d.count > a.count ? d : a), { date: null, count: 0 }),
            totalDays: days.length,
        },
    };
}

const mockWaka = {
    total: "479 hrs 13 mins",
    languages: [
        { name: "TypeScript", percent: 25.5 },
        { name: "Markdown", percent: 14.2 },
        { name: "CSS", percent: 13.9 },
        { name: "HTML", percent: 13.0 },
        { name: "JavaScript", percent: 11.6 },
        { name: "Blade Template", percent: 6.9 },
    ],
};

async function main() {
    let data;
    if (process.argv.includes("--live")) {
        const { fetchGitHubData } = await import("../lib/githubData.js");
        data = await fetchGitHubData();
    } else {
        data = mockData();
    }

    mkdirSync(new URL("../preview/", import.meta.url), { recursive: true });
    const out = (name, svg) =>
        writeFileSync(new URL(`../preview/${name}.svg`, import.meta.url), withFonts(svg).trim());

    const projects = decorateWithGitHub(data.pinned);

    out("hero", renderHeroSVG());
    out("github", renderGitHubSVG(data));
    out("contributions", renderContribGraph({ weeks: data.contributions.weeks, total: data.contributions.total }));
    out("projects", renderProjectsSVG({ projects }));
    out("stats", combineCards(renderWakaTimeSVG(mockWaka), renderGitHubSVG(data)));

    const cards = ["hero", "projects", "stats", "contributions", "github"];
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>profile_stats preview</title>
<style>body{background:#0a0a0c;padding:32px;display:flex;flex-direction:column;gap:24px;align-items:center;font-family:sans-serif}h2{color:#5c5c66;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;margin:0}img{max-width:100%}</style></head><body>
${cards.map((c) => `<h2>${c}.svg</h2><img src="${c}.svg">`).join("\n")}
</body></html>`;
    writeFileSync(new URL("../preview/index.html", import.meta.url), html);

    // One page per card too — handy for pixel-checking a single card in a
    // headless screenshot without the others in frame.
    for (const c of cards) {
        writeFileSync(
            new URL(`../preview/snap_${c}.html`, import.meta.url),
            `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#0a0a0c"><img src="${c}.svg" style="display:block">`,
        );
    }

    console.log(`Wrote preview/{${cards.join(",")}}.svg + index.html`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
