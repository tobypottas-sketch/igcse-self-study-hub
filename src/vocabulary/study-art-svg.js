// Decorative study artwork as inline SVG.
//
// One visual language for every card graphic: a 2.5px rounded ink outline, one accent hue (set per unit or
// pathway through --sa-a), a pale tint of that hue for secondary shapes and a single warm highlight. The art is
// rendered straight into the view HTML, so there is no network request, no decode delay and no script that
// has to run after first paint. The SVG never sizes itself: its slot (see vocabulary-study-art.css) owns the
// width and height and the artwork simply fills it.

const ART_VERSION = 3;

const UNIT_ACCENT = Object.freeze({ 1:'#137e80', 2:'#2e73d6', 3:'#2a8fbd', 4:'#2f9a68', 5:'#6f5bd0' });
// Pathway artwork uses the same accent as its card (see [data-study-accent] in vocabulary-study-app.css).
const PATHWAY_ACCENT = Object.freeze({ meaning:'#ed3f89', context:'#2d9ddd', word_families:'#2ba76a', paraphrasing:'#ef7f35', precision_use:'#eab326', spelling_recall:'#8658e8' });
const ACHIEVEMENT_ACCENT = Object.freeze({ completion:'#137e80', stage_advanced:'#2e73d6', mastered:'#d9a21b' });

// Shapes use four classes only: sa-i (ink outline), sa-a (accent fill), sa-t (accent tint fill), sa-w (warm highlight).
const WIDE = '0 0 160 112';
const BADGE = '0 0 120 104';

const UNIT = Object.freeze({
  1:{ alt:'Football and running track', box:WIDE, body:`
    <path class="sa-t" d="M14 96c18-34 52-52 132-52v22c-70 0-100 14-116 30z"/>
    <path class="sa-i" d="M14 96c18-34 52-52 132-52M30 96c16-26 44-40 116-40"/>
    <circle class="sa-i sa-p" cx="62" cy="58" r="26"/>
    <path class="sa-a" d="M62 46l10 7-4 12H56l-4-12z"/>
    <path class="sa-i" d="M62 32v14M72 53l14-4M68 65l8 12M56 65l-8 12M52 53l-14-4"/>
    <circle class="sa-w" cx="128" cy="30" r="7"/>` },
  2:{ alt:'Laptop and phone', box:WIDE, body:`
    <rect class="sa-i sa-p" x="30" y="24" width="82" height="54" rx="7"/>
    <rect class="sa-t" x="37" y="31" width="68" height="40" rx="3"/>
    <path class="sa-a" d="M45 62l12-14 10 8 14-16 14 22z"/>
    <path class="sa-i" d="M18 84h106l-7 9H25z"/>
    <rect class="sa-i sa-p" x="112" y="44" width="30" height="52" rx="7"/>
    <circle class="sa-a" cx="127" cy="86" r="3"/>
    <path class="sa-i" d="M124 40c8-8 20-8 28 0M128 33c11-10 27-10 38 0"/>
    <circle class="sa-w" cx="40" cy="14" r="6"/>` },
  3:{ alt:'Aeroplane flying a dotted route', box:WIDE, body:`
    <path class="sa-t" d="M8 98c20-14 38-14 58 0s40 14 62 0l24-14v28H8z"/>
    <path class="sa-i" d="M14 70c26-34 70-46 104-30" stroke-dasharray="3 7"/>
    <path class="sa-a" d="M96 38l36-16 6 6-22 22 4 18-8 4-10-20-18 10-4-8z"/>
    <path class="sa-i" d="M96 38l36-16 6 6-22 22 4 18-8 4-10-20-18 10-4-8z"/>
    <circle class="sa-w" cx="30" cy="30" r="8"/>
    <path class="sa-i sa-p" d="M24 86c0-8 6-12 12-11 2-7 14-7 17 1 7-1 11 4 10 10z"/>` },
  4:{ alt:'Hills, tree and sun', box:WIDE, body:`
    <circle class="sa-w" cx="122" cy="28" r="12"/>
    <path class="sa-t" d="M4 96c24-34 56-44 86-18 14-18 34-24 66-6v40H4z"/>
    <path class="sa-i" d="M4 96c24-34 56-44 86-18 14-18 34-24 66-6"/>
    <rect class="sa-i sa-p" x="56" y="62" width="8" height="26" rx="3"/>
    <circle class="sa-a" cx="60" cy="48" r="20"/>
    <circle class="sa-i" cx="60" cy="48" r="20"/>
    <path class="sa-i" d="M60 70V50M60 58l-8-8M60 54l8-8"/>` },
  5:{ alt:'Graduation cap and open book', box:WIDE, body:`
    <path class="sa-i sa-p" d="M20 72c20-8 40-8 60 4 20-12 40-12 60-4v26c-20-8-40-8-60 4-20-12-40-12-60-4z"/>
    <path class="sa-i" d="M80 76v26"/>
    <path class="sa-a" d="M80 18l50 18-50 18-50-18z"/>
    <path class="sa-i" d="M80 18l50 18-50 18-50-18z"/>
    <path class="sa-t" d="M50 48v14c0 6 14 12 30 12s30-6 30-12V48l-30 10z"/>
    <path class="sa-i" d="M130 36v22"/>
    <circle class="sa-w" cx="130" cy="62" r="5"/>` }
});

const PATHWAY = Object.freeze({
  meaning:{ alt:'Open vocabulary book', box:WIDE, body:`
    <path class="sa-i sa-a" d="M10 38c24-8 48-6 70 8 22-14 46-16 70-8v60c-24-8-48-6-70 8-22-14-46-16-70-8z"/>
    <path class="sa-i sa-p" d="M20 28c20-6 42-4 60 10 18-14 40-16 60-10v58c-20-6-42-4-60 10-18-14-40-16-60-10z"/>
    <path class="sa-i" d="M80 38v58"/>
    <rect class="sa-w" x="30" y="44" width="34" height="10" rx="4"/>
    <path class="sa-ln" d="M30 66h34M30 78h24"/>
    <path class="sa-ln sa-ln--a" d="M96 52h34M96 66h34M96 78h22"/>` },
  context:{ alt:'Speech bubble with a gap in the sentence', box:WIDE, body:`
    <path class="sa-i sa-p" d="M20 14h120a10 10 0 0 1 10 10v50a10 10 0 0 1-10 10H78l-26 20V84H20A10 10 0 0 1 10 74V24A10 10 0 0 1 20 14z"/>
    <path class="sa-ln" d="M24 34h46M24 62h28M104 62h30"/>
    <path class="sa-ln" d="M24 48h30M100 34h34"/>
    <rect class="sa-i sa-a" x="58" y="40" width="42" height="16" rx="7"/>
    <path class="sa-ln sa-ln--w" d="M68 48h22"/>
    <circle class="sa-w" cx="140" cy="96" r="8"/>` },
  word_families:{ alt:'A root word branching into related word forms', box:WIDE, body:`
    <path class="sa-i" d="M80 36v16M28 52h104M28 52v18M80 52v18M132 52v18"/>
    <rect class="sa-i sa-a" x="48" y="8" width="64" height="28" rx="9"/>
    <path class="sa-ln sa-ln--w" d="M62 22h36"/>
    <rect class="sa-i sa-t" x="6" y="70" width="44" height="32" rx="9"/>
    <rect class="sa-i sa-t" x="58" y="70" width="44" height="32" rx="9"/>
    <rect class="sa-i sa-t" x="110" y="70" width="44" height="32" rx="9"/>
    <path class="sa-ln sa-ln--a" d="M16 86h24M68 86h24M120 86h24"/>` },
  paraphrasing:{ alt:'Two speech bubbles saying the same idea in different words', box:WIDE, body:`
    <path class="sa-i sa-p" d="M12 10h74a9 9 0 0 1 9 9v32a9 9 0 0 1-9 9H44L26 74V60H12a9 9 0 0 1-9-9V19a9 9 0 0 1 9-9z"/>
    <path class="sa-ln" d="M18 28h60M18 42h38"/>
    <path class="sa-i sa-a" d="M74 52h74a9 9 0 0 1 9 9v32a9 9 0 0 1-9 9h-12v14l-18-14H74a9 9 0 0 1-9-9V61a9 9 0 0 1 9-9z"/>
    <path class="sa-ln sa-ln--w" d="M80 70h60M80 84h38"/>
    <circle class="sa-i sa-w" cx="80" cy="56" r="13"/>
    <path class="sa-ln" d="M73 53h14M73 60h14" style="stroke-width:3.5"/>` },
  precision_use:{ alt:'Target with an arrow in the bullseye', box:WIDE, body:`
    <circle class="sa-i sa-a" cx="72" cy="58" r="46"/>
    <circle class="sa-i sa-p" cx="72" cy="58" r="32"/>
    <circle class="sa-i sa-a" cx="72" cy="58" r="19"/>
    <circle class="sa-i" cx="72" cy="58" r="7" style="fill:var(--sa-ink)"/>
    <path class="sa-ln" d="M72 58l46-46" style="stroke-width:4.5"/>
    <path class="sa-i sa-p" d="M104 8l4 18 18 4 12-12-16-4-4-16z"/>` },
  spelling_recall:{ alt:'Letter tiles spelling a word', box:WIDE, body:`
    <g transform="rotate(-9 34 62)"><rect class="sa-i sa-p" x="10" y="32" width="46" height="54" rx="10"/><text x="33" y="70" text-anchor="middle" class="sa-txt">a</text></g>
    <rect class="sa-i sa-a" x="56" y="22" width="48" height="58" rx="10"/><text x="80" y="62" text-anchor="middle" class="sa-txt sa-txt--on">b</text>
    <g transform="rotate(9 126 62)"><rect class="sa-i sa-t" x="104" y="32" width="46" height="54" rx="10"/><text x="127" y="70" text-anchor="middle" class="sa-txt">c</text></g>
    <path class="sa-ln sa-ln--a" d="M22 100h116" style="stroke-dasharray:1 12"/>` }
});

const ACHIEVEMENT = Object.freeze({
  completion:{ alt:'Trophy', box:BADGE, body:`
    <path class="sa-i sa-p" d="M34 14h52v26a26 26 0 0 1-52 0z"/>
    <path class="sa-i" d="M34 22H18c0 16 8 26 20 28M86 22h16c0 16-8 26-20 28"/>
    <path class="sa-a" d="M60 24l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z"/>
    <path class="sa-i" d="M60 66v14M42 90h36"/>
    <rect class="sa-t" x="38" y="80" width="44" height="12" rx="4"/><rect class="sa-i" x="38" y="80" width="44" height="12" rx="4"/>
    <circle class="sa-w" cx="100" cy="14" r="6"/>` },
  stage_advanced:{ alt:'Steps leading up to a flag', box:BADGE, body:`
    <path class="sa-t" d="M14 92V70h24V52h24V34h24v58z"/>
    <path class="sa-i sa-p" d="M14 92V70h24V52h24V34h24v58z"/>
    <path class="sa-a" d="M62 34V8l30 9-30 9"/><path class="sa-i" d="M62 34V8l30 9-30 9"/>
    <path class="sa-i" d="M24 60l8-8M48 42l8-8"/>
    <circle class="sa-w" cx="104" cy="60" r="6"/>` },
  mastered:{ alt:'Mastery badge with a star', box:BADGE, body:`
    <path class="sa-t" d="M42 62l-10 32 28-10 28 10-10-32z"/><path class="sa-i" d="M42 62l-10 32 28-10 28 10-10-32z"/>
    <circle class="sa-a" cx="60" cy="42" r="30"/><circle class="sa-i" cx="60" cy="42" r="30"/>
    <circle class="sa-i" cx="60" cy="42" r="22" stroke-dasharray="2 5"/>
    <path class="sa-w" d="M60 26l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z"/>
    <path class="sa-i" d="M60 26l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z"/>` }
});

function frame(spec, accent, className) {
  const cls = ['study-art__svg', className].filter(Boolean).join(' ');
  return `<svg class="${cls}" viewBox="${spec.box}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" focusable="false" aria-hidden="true" style="--sa-a:${accent}" data-art-version="${ART_VERSION}">${spec.body.replace(/\s*\n\s*/g,'')}</svg>`;
}

export function unitArtSvg(unitNumber, className = '') {
  const spec = UNIT[Number(unitNumber)];
  return spec ? frame(spec, UNIT_ACCENT[Number(unitNumber)], className) : '';
}
export function pathwayArtSvg(pathwayId, className = '') {
  const spec = PATHWAY[pathwayId];
  return spec ? frame(spec, PATHWAY_ACCENT[pathwayId], className) : '';
}
export function achievementArtSvg(kind, className = '') {
  const spec = ACHIEVEMENT[kind];
  return spec ? frame(spec, ACHIEVEMENT_ACCENT[kind], className) : '';
}
export const STUDY_ART_KEYS = Object.freeze({ units:Object.keys(UNIT).map(Number), pathways:Object.keys(PATHWAY), achievements:Object.keys(ACHIEVEMENT) });
export function studyArtAlt(group, key) {
  return (group === 'unit' ? UNIT[Number(key)] : group === 'pathway' ? PATHWAY[key] : ACHIEVEMENT[key])?.alt ?? '';
}
