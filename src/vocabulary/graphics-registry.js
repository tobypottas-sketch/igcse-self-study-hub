// Single owner of the Vocabulary Builder's PNG illustration assets: where each file lives, how big it is, and whether it
// has been shipped yet. Rendering (views.js) and styling (vocabulary-graphics.css) never contain an asset path.
//
// The inline SVG artwork (study-art-svg.js) is both the placeholder and the fallback: a PNG is layered over it only when
// it is listed in graphics-manifest.js, and it replaces the SVG only once it has actually loaded (graphics-runtime.js).
import { SHIPPED_PNG } from './graphics-manifest.js';

// Paths are relative to vocabulary.html (the site is served from the repository root; it has no public/ folder).
export const GRAPHICS_ROOT = 'assets/vocabulary';

export const PATHWAY_PNG = Object.freeze({
  meaning:'pathways/meaning.png',
  context:'pathways/context.png',
  word_families:'pathways/word-families.png',
  paraphrasing:'pathways/paraphrasing.png',
  precision_use:'pathways/precision-use.png',
  spelling_recall:'pathways/spelling-recall.png'
});
// Unit banners follow one naming rule, so future units need no code: unit-01.png … unit-20.png.
export const unitPngName = unitNumber => `units/unit-${String(Math.trunc(Number(unitNumber))).padStart(2, '0')}.png`;

// Intrinsic sizes the artwork is produced at (only used to reserve the aspect ratio; the slot owns the displayed size).
export const PNG_SIZE = Object.freeze({ unit:Object.freeze({ width:1600, height:900 }), pathway:Object.freeze({ width:1024, height:1024 }) });

let shipped = new Set(SHIPPED_PNG);
const failedThisSession = new Set();
// A listed PNG that failed to load is not requested again in this session (the SVG artwork stays in use).
export function reportGraphicFailure(src) { failedThisSession.add(String(src)); }
// Test seam: run `work` as if exactly `names` had been shipped.
export function withShippedGraphics(names, work) {
  const previous = shipped; shipped = new Set(names);
  try { return work(); } finally { shipped = previous; }
}

function name(group, key) {
  if (group === 'pathway') return PATHWAY_PNG[String(key)] ?? null;
  if (group === 'unit') { const number = Number(key); return Number.isInteger(number) && number >= 1 && number <= 99 ? unitPngName(number) : null; }
  return null;
}
// Canonical location of an asset whether or not it exists yet (used by docs and tests).
export function graphicPath(group, key) {
  const file = name(group, key);
  return file ? `${GRAPHICS_ROOT}/${file}` : null;
}
// The PNG to render, or null while it has not been shipped (the SVG artwork is used instead).
export function shippedGraphic(group, key) {
  const file = name(group, key);
  if (!file || !shipped.has(file)) return null;
  const src = `${GRAPHICS_ROOT}/${file}`;
  return failedThisSession.has(src) ? null : { src, ...PNG_SIZE[group] };
}
export function allGraphicNames() {
  return [...Object.values(PATHWAY_PNG), ...Array.from({ length:20 }, (_, index) => unitPngName(index + 1))];
}
