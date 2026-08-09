import { fetchGitHubData } from "../lib/githubData.js";
import { renderProjectsSVG } from "../lib/projectsCard.js";
import { decorateWithGitHub, FEATURED } from "../lib/featured.js";
import { withFonts } from "../lib/theme.js";

export default async function handler(req, res) {
    // The card is curated (lib/featured.js); GitHub only supplies live numbers
    // on top, so a token failure costs stars, not the whole card.
    let projects = FEATURED;
    try {
        const { pinned } = await fetchGitHubData();
        projects = decorateWithGitHub(pinned);
    } catch (err) {
        console.error("Projects: GitHub enrich failed, serving curated data:", err.message);
    }

    try {
        const svg = withFonts(renderProjectsSVG({ projects }));
        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=21600");
        res.status(200).send(svg);
    } catch (err) {
        console.error("Projects handler error:", err);
        res.setHeader("Content-Type", "image/svg+xml");
        res.status(200).send("<svg xmlns='http://www.w3.org/2000/svg'></svg>");
    }
}
