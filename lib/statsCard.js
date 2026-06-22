// Composes two standalone card SVGs into ONE side-by-side image.
// A single image scales as a unit (GitHub's `max-width:100%`), so the
// side-by-side layout can never wrap/stack on a narrow profile column.

// Prefix every id and url(#id)/href="#id" reference inside one SVG so two
// SVGs that reuse the same ids (base, cardBorder, titleFlow, cardClip, ...)
// don't collide once placed in the same document.
function nsIds(svg, p) {
  return svg
    .replace(/id="([^"]+)"/g, `id="${p}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${p}$1"`);
}

const attr = (svg, name, fallback) => {
  const m = svg.match(new RegExp(`<svg[^>]*\\b${name}="(\\d+)"`));
  return m ? parseInt(m[1], 10) : fallback;
};

export function combineCards(leftSvg, rightSvg, { gap = 20 } = {}) {
  const lW = attr(leftSvg, 'width', 420);
  const lH = attr(leftSvg, 'height', 346);
  const rW = attr(rightSvg, 'width', 420);
  const rH = attr(rightSvg, 'height', 346);

  const H = Math.max(lH, rH);
  const W = lW + gap + rW;

  const left = nsIds(leftSvg, 'l_').replace('<svg ', '<svg x="0" y="0" ');
  const right = nsIds(rightSvg, 'r_').replace('<svg ', `<svg x="${lW + gap}" y="0" `);

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${left}${right}</svg>`;
}
