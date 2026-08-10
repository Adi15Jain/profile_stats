// Renders assets/linkedin-cover.png — the LinkedIn banner, on the same design
// system as the README cards.
//
//   node scripts/linkedin-cover.mjs
//
// LinkedIn wants 1584x396 and does not accept SVG, so this lays the cover out
// as HTML with the same inlined Geist + cobalt tokens the cards use, then
// shoots it in headless Chrome at 2x for a crisp 3168x792 PNG.
//
// The composition is a two-column split, which is what the awkward canvas
// asks for:
//   · The profile photo overlaps the bottom-left — roughly a 310px circle
//     from y=210 down — so the copy column starts at x=420 and only a small
//     wordmark sits above the photo.
//   · The right column carries the proof metrics rather than empty gradient,
//     the same "every claim carries a receipt" idea as the portfolio's
//     Approach section.
//   · The room render sits behind that column as atmosphere, bled off the
//     right edge and dropped low enough to read text over.
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { FONT_GEIST_WOFF2, FONT_GEIST_MONO_WOFF2, HERO_ROOM } from "../lib/assets.generated.js";
import { T } from "../lib/theme.js";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const W = 1584;
const H = 396;
const SAFE_LEFT = 420; // clear of the profile photo
const SPLIT = 1054; // where the copy column ends and the proof column starts
const GRID = 88; // grid pitch
const GRID_W = 1010; // stops short of the divider — see .grid

// Every figure here is traceable to the project's own repo:
//   99.2% / 72.3%  PneumoAI — web-assets/telemetry/run.json, epoch 12, 624-image split
//   1.2s           InterviewPilot — README, down from ~2.7s after dropping LiveKit
//   193            AlgoPlus — README, "~193 live topics across 8 modules"
// Recall travels with its precision: on its own it flatters a model that
// over-calls pneumonia. CoinPush's old "90% lower latency" is gone — nothing
// in that repo measures it.
const PROOF = [
    ["99.2%", "RECALL · 72.3% PRECISION", "PNEUMOAI · 624-IMAGE SPLIT"],
    ["1.2s", "VOICE-TO-VOICE REPLY", "INTERVIEWPILOT · WAS 2.7s"],
    ["193", "LIVE INTERACTIVE TOPICS", "ALGOPLUS · 8 MODULES"],
];

// Deterministic sparse starfield, kept to the right half.
function stars(n = 26) {
    let seed = 991;
    const rand = () => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
    };
    let out = "";
    for (let i = 0; i < n; i++) {
        const x = 980 + rand() * 580;
        const y = 18 + rand() * 360;
        const r = 0.7 + rand() * 1.4;
        const o = (0.14 + rand() * 0.34).toFixed(2);
        out += `<i style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${r.toFixed(1)}px;height:${r.toFixed(1)}px;opacity:${o}"></i>`;
    }
    return out;
}

const proofRows = PROOF.map(
    ([value, label, project]) => `
      <div class="row">
        <div class="v">${value}</div>
        <div class="l">${label}<span class="p">${project}</span></div>
      </div>`,
).join("");

const html = `<!doctype html><meta charset="utf-8">
<style>
  @font-face { font-family:"Geist"; font-weight:100 900; font-display:block; src:url(data:font/woff2;base64,${FONT_GEIST_WOFF2}) format("woff2"); }
  @font-face { font-family:"Geist Mono"; font-weight:500; font-display:block; src:url(data:font/woff2;base64,${FONT_GEIST_MONO_WOFF2}) format("woff2"); }

  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:${W}px; height:${H}px; overflow:hidden; position:relative;
         background:${T.bg}; font-family:"Geist",sans-serif; -webkit-font-smoothing:antialiased; }

  /* The site's faint vertical rules, scoped to the copy column and cut off at
     1010px — a full 88px clear of the divider. Running them to the seam put a
     grid line within a couple of pixels of the divider, and the two read as
     one doubled, slightly blurred rule. */
  .grid { position:absolute; left:0; top:0; width:${GRID_W}px; height:100%;
          background:repeating-linear-gradient(90deg, transparent 0 ${GRID - 1}px, rgba(255,255,255,.03) ${GRID - 1}px ${GRID}px); }

  /* one cobalt wash, sitting behind the room */
  .glow { position:absolute; inset:0;
          background:radial-gradient(ellipse 620px 330px at 82% 52%, rgba(61,90,254,.24), transparent 70%); }

  /* the 3D room — atmosphere behind the proof column, not a subject */
  .room { position:absolute; right:-130px; top:50%; transform:translateY(-50%);
          width:660px; opacity:.52;
          -webkit-mask-image: radial-gradient(ellipse 52% 54% at 52% 50%, #000 30%, transparent 74%),
                              linear-gradient(90deg, transparent 4%, #000 44%);
          -webkit-mask-composite: source-in; mask-composite: intersect; }

  .stars i { position:absolute; border-radius:50%; background:#fff; }

  /* small letterhead mark, sitting above where the profile photo lands */
  .mark { position:absolute; left:64px; top:58px; }
  .mark .name { font-size:21px; font-weight:600; letter-spacing:-.3px; color:${T.ink}; }
  .mark .rule { margin-top:10px; width:30px; height:2px; border-radius:1px; background:${T.accent}; }

  .copy { position:absolute; left:${SAFE_LEFT}px; top:50%; transform:translateY(-50%); }

  .eyebrow { font-family:"Geist Mono",monospace; font-size:15px; font-weight:500;
             letter-spacing:3.4px; color:${T.inkFaint}; }

  h1 { margin:18px 0 0; font-size:56px; font-weight:700; letter-spacing:-2px;
       line-height:1.1; color:${T.ink}; white-space:nowrap; }
  h1 b { font-weight:700; color:${T.accent}; }

  .strip { margin-top:26px; display:flex; align-items:center; gap:20px;
           font-family:"Geist Mono",monospace; font-size:14px; font-weight:500; letter-spacing:1.9px; }
  .strip .dot { width:8px; height:8px; border-radius:50%; background:${T.greenBright}; }
  .strip .live { color:${T.green}; margin-left:-8px; }
  .strip .sep { color:rgba(255,255,255,.18); }
  .strip .item { color:${T.inkFaint}; }

  /* the hairline that makes the split read as deliberate */
  .divider { position:absolute; left:${SPLIT}px; top:104px; width:1px; height:188px;
             background:linear-gradient(180deg, transparent, rgba(255,255,255,.16) 24%, rgba(255,255,255,.16) 76%, transparent); }

  .proof { position:absolute; left:${SPLIT + 54}px; top:50%; transform:translateY(-50%);
           display:flex; flex-direction:column; gap:24px; }
  .proof .row { display:flex; align-items:baseline; gap:16px; }
  .proof .v { font-size:30px; font-weight:700; letter-spacing:-1px; color:${T.accent2};
              min-width:92px; }
  .proof .l { font-family:"Geist Mono",monospace; font-size:11px; font-weight:500;
              letter-spacing:1.5px; color:${T.inkFaint}; line-height:1.7; }
  .proof .p { display:block; color:rgba(255,255,255,.26); }

  /* the proof labels are small mono — this keeps them on clean dark instead
     of on the room's furniture, while the room stays legible to the right */
  .right-scrim { position:absolute; left:${SPLIT - 96}px; top:0; width:540px; height:100%;
                 background:linear-gradient(90deg,
                   rgba(10,10,12,0) 0%, rgba(10,10,12,.62) 22%, rgba(10,10,12,.90) 44%,
                   rgba(10,10,12,.74) 74%, rgba(10,10,12,0) 100%); }

  /* keeps the avatar corner clean, whatever the wash is doing */
  .corner { position:absolute; left:0; bottom:0; width:520px; height:280px;
            background:radial-gradient(ellipse at 10% 100%, ${T.bg} 38%, transparent 72%); }
</style>
<body>
  <div class="grid"></div>
  <div class="glow"></div>
  <img class="room" src="data:image/webp;base64,${HERO_ROOM}">
  <div class="stars">${stars()}</div>
  <div class="right-scrim"></div>
  <div class="corner"></div>

  <div class="mark">
    <div class="name">Adi Jain</div>
    <div class="rule"></div>
  </div>

  <div class="copy">
    <div class="eyebrow">AI / ML ENGINEER</div>
    <h1>I build AI that<br>makes it to <b>production.</b></h1>
    <div class="strip">
      <span class="dot"></span><span class="live">AVAILABLE FOR WORK</span>
      <span class="sep">·</span><span class="item">ADIJAIN.CLICK</span>
      <span class="sep">·</span><span class="item">GITHUB.COM/ADI15JAIN</span>
    </div>
  </div>

  <div class="divider"></div>
  <div class="proof">${proofRows}</div>
</body>`;

const tmp = mkdtempSync(join(tmpdir(), "li-cover-"));
try {
    const page = join(tmp, "cover.html");
    writeFileSync(page, html);
    const out = fileURLToPath(new URL("../assets/linkedin-cover.png", import.meta.url));
    execFileSync(
        CHROME,
        [
            "--headless",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-device-scale-factor=2",
            "--virtual-time-budget=3000",
            `--window-size=${W},${H}`,
            `--screenshot=${out}`,
            `file://${page}`,
        ],
        { stdio: "ignore" },
    );
    console.log(`Wrote assets/linkedin-cover.png (${W * 2}x${H * 2})`);
} finally {
    rmSync(tmp, { recursive: true, force: true });
}
