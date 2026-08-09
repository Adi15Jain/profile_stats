// Headless snapshots of the cards at chosen points on their timeline.
//
// A card is almost entirely SMIL, and SMIL does not advance for a plain
// --screenshot: every entrance still sits at t=0, so the card photographs
// blank. This inlines the SVG into a page, calls pauseAnimations() +
// setCurrentTime(t), and only then shoots — so what lands in the PNG is the
// card as a reader actually sees it.
//
//   node scripts/preview.js && node scripts/snapshot.mjs
//   node scripts/snapshot.mjs projects 8.5      # one card, one moment
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const dir = fileURLToPath(new URL("../preview/", import.meta.url));

// [card, seconds, w, h] — for the rotating card, one shot per slide, sampled
// mid-window so the slide is fully settled rather than mid-transition.
const DEFAULT_SHOTS = [
    ["hero", 3.2, 880, 292],
    ["projects", 3.2, 880, 340],
    ["projects", 9.7, 880, 340],
    ["projects", 16.2, 880, 340],
    ["projects", 22.7, 880, 340],
    ["stats", 4.0, 900, 366],
    ["contributions", 4.0, 880, 300],
];

function shoot(card, t, w, h) {
    const svgPath = `${dir}${card}.svg`;
    if (!existsSync(svgPath)) throw new Error(`Missing ${svgPath} — run scripts/preview.js first`);
    const svg = readFileSync(svgPath, "utf8");

    const page = `<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#0a0a0c">
<div id="host">${svg}</div>
<script>
  const svg = document.querySelector("#host svg");
  svg.pauseAnimations();
  svg.setCurrentTime(${t});
</script>`;
    const pagePath = `${dir}.snap.html`;
    writeFileSync(pagePath, page);

    const outName = `shot_${card}${t ? `_t${String(t).replace(".", "-")}` : ""}.png`;
    execFileSync(
        CHROME,
        [
            "--headless",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-device-scale-factor=2",
            "--virtual-time-budget=4000",
            `--window-size=${w},${h}`,
            `--screenshot=${dir}${outName}`,
            `file://${pagePath}`,
        ],
        { stdio: "ignore" },
    );
    console.log(`${outName}  (t=${t}s)`);
}

const [card, t] = process.argv.slice(2);
if (card) shoot(card, Number(t ?? 3.2), 880, 340);
else for (const [c, s, w, h] of DEFAULT_SHOTS) shoot(c, s, w, h);
