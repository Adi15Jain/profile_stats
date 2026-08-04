// Shared SMIL animation helpers for the SVG cards. GitHub READMEs strip
// JavaScript from images, so all motion has to be declarative SMIL/CSS.

export function esc(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// Count-up number. SMIL can't interpolate text content, so we stack one
// <text> per frame and flash each visible for its slice; the last one freezes.
// `value` may be "343", 343, or "6.2" — decimals are preserved in the frames.
export function countUp({
    value,
    x,
    y,
    className,
    fill,
    filter = "",
    begin = 0,
    dur = 0.9,
    frames = 12,
    suffix = "",
}) {
    const num = parseFloat(value);
    const filterAttr = filter ? ` filter="${filter}"` : "";
    const suffixSpan = suffix
        ? `<tspan font-size="12" dx="1">${esc(suffix)}</tspan>`
        : "";

    if (!Number.isFinite(num)) {
        return `<text x="${x}" y="${y}" class="${className}" fill="${fill}"${filterAttr}>${esc(value)}${suffixSpan}</text>`;
    }

    const decimals = String(value).includes(".")
        ? String(value).split(".")[1].length
        : 0;

    const dt = dur / frames;
    let out = "";
    for (let i = 0; i < frames; i++) {
        // ease-out cubic so the count decelerates into the final value
        const t = (i + 1) / frames;
        const eased = 1 - Math.pow(1 - t, 3);
        const v = (num * eased).toFixed(decimals);
        const b = (begin + i * dt).toFixed(2);
        if (i < frames - 1) {
            out += `<text x="${x}" y="${y}" class="${className}" fill="${fill}"${filterAttr} opacity="0">${v}${suffixSpan}<set attributeName="opacity" to="1" begin="${b}s" dur="${dt.toFixed(2)}s"/></text>`;
        } else {
            out += `<text x="${x}" y="${y}" class="${className}" fill="${fill}"${filterAttr} opacity="0">${v}${suffixSpan}<set attributeName="opacity" to="1" begin="${b}s" fill="freeze"/></text>`;
        }
    }
    return out;
}

// Typewriter that cycles through phrases forever: types each one character by
// character (discrete clip-path steps), holds, then hands off to the next.
// Returns { defs, body } — defs holds the clipPaths, body the text groups.
export function typewriter({
    phrases,
    x,
    y,
    className,
    idPrefix,
    charW = 5.8,
    typeSpeed = 0.045, // seconds per character
    hold = 2.2,
    gap = 0.35,
    caretColor = "#6ee7b7",
    caretH = 11,
}) {
    const slots = phrases.map((p) => p.length * typeSpeed + hold + gap);
    const T = slots.reduce((a, b) => a + b, 0);

    let defs = "";
    let body = "";
    let start = 0;

    phrases.forEach((p, i) => {
        const typeDur = p.length * typeSpeed;
        const end = start + slots[i] - gap;
        const w = Math.ceil(p.length * charW) + 2;

        // visibility window for this phrase (discrete on/off over the cycle)
        const s = start / T;
        const e = end / T;
        const gateValues = s === 0 ? "1;0" : "0;1;0";
        const gateTimes =
            s === 0 ? `0;${e.toFixed(4)}` : `0;${s.toFixed(4)};${e.toFixed(4)}`;

        // clip width stepping through the characters, expressed over the full
        // cycle so a single repeating animate drives it
        const widths = ["0"];
        const times = ["0"];
        if (s > 0) {
            widths.push("0");
            times.push(s.toFixed(4));
        }
        for (let c = 1; c <= p.length; c++) {
            widths.push(String(Math.ceil(c * charW)));
            times.push(((start + c * typeSpeed) / T).toFixed(4));
        }
        widths.push(String(w), "0");
        times.push(e.toFixed(4), Math.min(0.9999, e + 0.0001).toFixed(4));

        defs += `<clipPath id="${idPrefix}-clip-${i}"><rect x="${x}" y="${y - caretH}" width="0" height="${caretH + 4}"><animate attributeName="width" calcMode="discrete" values="${widths.join(";")}" keyTimes="${times.join(";")}" dur="${T.toFixed(2)}s" repeatCount="indefinite"/></rect></clipPath>`;

        body += `
  <g opacity="0">
    <animate attributeName="opacity" calcMode="discrete" values="${gateValues}" keyTimes="${gateTimes}" dur="${T.toFixed(2)}s" repeatCount="indefinite"/>
    <g clip-path="url(#${idPrefix}-clip-${i})"><text x="${x}" y="${y}" class="${className}">${esc(p)}</text></g>
    <rect x="${x}" y="${y - caretH + 1}" width="1.5" height="${caretH}" fill="${caretColor}">
      <animate attributeName="x" calcMode="discrete" values="${widths.map((wv) => x + Number(wv) + 1).join(";")}" keyTimes="${times.join(";")}" dur="${T.toFixed(2)}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.5;0.5;0.99;1" dur="1.1s" repeatCount="indefinite"/>
    </rect>
  </g>`;

        start += slots[i];
    });

    return { defs, body };
}
