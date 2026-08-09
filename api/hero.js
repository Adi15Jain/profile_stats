import { renderHeroSVG } from "../lib/heroCard.js";
import { withFonts } from "../lib/theme.js";

// Static masthead — no upstream data, so it can cache hard.
export default function handler(req, res) {
    const svg = withFonts(renderHeroSVG());
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.status(200).send(svg);
}
