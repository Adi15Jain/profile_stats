// The featured projects, curated rather than scraped.
//
// GitHub's pinned-repo descriptions are one flat sentence with no metric and no
// screenshot, which is why the old card read as filler. This mirrors the
// portfolio's "Selected Work" section instead — same four projects, same
// order, same copy and headline metric — so the README and the site tell one
// story. Live GitHub numbers are merged in at render time where they exist
// (see decorateWithGitHub).
//
// `accent` is each project's own hue, sampled from its live site. It is only
// ever painted as a low-alpha wash and a hairline, so the card stays on the
// portfolio's near-black canvas.
import { THUMBS } from "./assets.generated.js";

export const FEATURED = [
    {
        id: "interviewpilot",
        repo: "InterviewPilot",
        title: "InterviewPilot",
        kicker: "Speak to a realtime AI interviewer, solve a live coding round, get graded by five agents.",
        metricValue: "1.2s",
        metricLabel: "VOICE-TO-VOICE REPLY",
        stack: ["Next.js 16", "Deepgram", "Gemini 2.5"],
        domain: "interviewpilot.adijain.click",
        accent: "#7b6cff",
        lang: "TypeScript",
        langColor: "#3178c6",
    },
    {
        id: "pneumoai",
        repo: "pneumoAI",
        title: "PneumoAI",
        kicker: "A pneumonia CNN that runs entirely in the browser, and shows its own working.",
        metricValue: "99.2%",
        metricLabel: "RECALL, HELD-OUT SPLIT",
        stack: ["PyTorch", "TensorFlow.js", "React 19"],
        domain: "pneumoai.adijain.click",
        accent: "#38bdf8",
        lang: "Python",
        langColor: "#3572A5",
    },
    {
        id: "coinpush",
        repo: "CoinPush",
        title: "CoinPush",
        kicker: "Live market screening streamed over WebSockets, never polled.",
        metricValue: "90%",
        metricLabel: "LOWER UPDATE LATENCY",
        stack: ["Next.js", "WebSockets", "SWR"],
        domain: "coinpush.adijain.click",
        accent: "#16c784",
        lang: "TypeScript",
        langColor: "#3178c6",
    },
    {
        id: "algoplus",
        repo: "AlgoPlus",
        title: "AlgoPlus",
        kicker: "A full CS degree visualised — 193 interactive topics, all computed client-side.",
        metricValue: "193",
        metricLabel: "LIVE INTERACTIVE TOPICS",
        stack: ["TypeScript", "Next.js 16", "Three.js"],
        domain: "algoplus.adijain.click",
        accent: "#a78bfa",
        lang: "TypeScript",
        langColor: "#3178c6",
    },
];

export const thumbFor = (id) => THUMBS[id] || null;

// Folds live GitHub numbers onto the curated list, matched case-insensitively
// by repo name. Nothing here is required: with no token, or with a project that
// isn't pinned, the card simply renders the curated copy.
export function decorateWithGitHub(pinned = []) {
    const byName = new Map(
        pinned.filter((p) => p?.name).map((p) => [p.name.toLowerCase(), p]),
    );
    return FEATURED.map((p) => {
        const gh = byName.get(p.repo.toLowerCase());
        return gh
            ? {
                  ...p,
                  stars: gh.stars,
                  pushedAt: gh.pushedAt,
                  lang: gh.language || p.lang,
                  langColor: gh.languageColor || p.langColor,
              }
            : p;
    });
}
