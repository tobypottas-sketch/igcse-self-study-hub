// Decorative study artwork as inline SVG.
//
// One visual language for every card graphic: a 2.5px rounded ink outline, one accent hue (set per unit or
// pathway through --sa-a), a pale tint of that hue for secondary shapes and a single warm highlight. The art is
// rendered straight into the view HTML, so there is no network request, no decode delay and no script that
// has to run after first paint. The SVG never sizes itself: its slot (see vocabulary-study-art.css) owns the
// width and height and the artwork simply fills it.

const ART_VERSION = 2;

const UNIT_ACCENT = Object.freeze({ 1:'#137e80', 2:'#2e73d6', 3:'#2a8fbd', 4:'#2f9a68', 5:'#6f5bd0' });
const PATHWAY_ACCENT = Object.freeze({ meaning:'#137e80', context:'#2e73d6', word_families:'#2f9a68', paraphrasing:'#6f5bd0', precision_use:'#d9822b', spelling_recall:'#2a8fbd' });
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
    <path class="sa-i sa-p" d="M20 28c22-6 42-4 60 8 18-12 38-14 60-8v62c-22-6-42-4-60 8-18-12-38-14-60-8z"/>
    <path class="sa-i" d="M80 36v62"/>
    <path class="sa-t" d="M32 40c14-2 28 0 40 6v10c-12-6-26-8-40-6zM88 46c12-6 26-8 40-6v10c-14-2-28 0-40 6z"/>
    <path class="sa-a" d="M34 66h30M34 78h22M96 66h30M96 78h22" stroke-width="5" stroke-linecap="round"/>
    <circle class="sa-w" cx="132" cy="22" r="7"/>` },
  context:{ alt:'Speech bubble with a gap in the sentence', box:WIDE, body:`
    <path class="sa-i sa-p" d="M22 18h116a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10H70l-22 18V82H22a10 10 0 0 1-10-10V28a10 10 0 0 1 10-10z"/>
    <path class="sa-t" d="M26 34h40M26 48h26M92 48h34M26 62h50"/>
    <rect class="sa-a" x="58" y="42" width="30" height="12" rx="5"/>
    <path class="sa-i" d="M26 34h40M26 62h50M92 48h34" stroke-width="5" stroke-linecap="round"/>
    <circle class="sa-w" cx="136" cy="94" r="7"/>` },
  word_families:{ alt:'Branching word family', box:WIDE, body:`
    <path class="sa-i" d="M80 34v14M80 48H34v18M80 48v18M80 48h46v18"/>
    <circle class="sa-a" cx="80" cy="22" r="14"/><circle class="sa-i" cx="80" cy="22" r="14"/>
    <circle class="sa-t" cx="34" cy="78" r="13"/><circle class="sa-i" cx="34" cy="78" r="13"/>
    <circle class="sa-t" cx="80" cy="78" r="13"/><circle class="sa-i" cx="80" cy="78" r="13"/>
    <circle class="sa-t" cx="126" cy="78" r="13"/><circle class="sa-i" cx="126" cy="78" r="13"/>
    <circle class="sa-w" cx="146" cy="22" r="7"/>` },
  paraphrasing:{ alt:'Two bubbles exchanging the same idea', box:WIDE, body:`
    <path class="sa-i sa-p" d="M16 18h66a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8H44l-14 12V60H16a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z"/>
    <path class="sa-a" d="M78 52h66a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8h-14v12l-14-12H78a8 8 0 0 1-8-8V60a8 8 0 0 1 8-8z"/>
    <path class="sa-i" d="M78 52h66a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8h-14v12l-14-12H78a8 8 0 0 1-8-8V60a8 8 0 0 1 8-8z"/>
    <path class="sa-i" d="M24 32h46M24 44h28" stroke-width="5" stroke-linecap="round"/>
    <path d="M86 70h46M86 82h30" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>
    <circle class="sa-w" cx="140" cy="20" r="7"/>` },
  precision_use:{ alt:'Target with an arrow in the centre', box:WIDE, body:`
    <circle class="sa-t" cx="76" cy="58" r="44"/><circle class="sa-i" cx="76" cy="58" r="44"/>
    <circle class="sa-p" cx="76" cy="58" r="30"/><circle class="sa-i" cx="76" cy="58" r="30"/>
    <circle class="sa-a" cx="76" cy="58" r="15"/><circle class="sa-i" cx="76" cy="58" r="15"/>
    <path class="sa-i" d="M76 58l40-40M108 14l2 12 12 2"/>
    <circle class="sa-w" cx="140" cy="92" r="7"/>` },
  spelling_recall:{ alt:'Letter tiles', box:WIDE, body:`
    <g transform="rotate(-8 36 62)"><rect class="sa-i sa-p" x="14" y="38" width="42" height="48" rx="9"/><text x="35" y="72" text-anchor="middle" class="sa-txt">a</text></g>
    <rect class="sa-a" x="58" y="30" width="44" height="52" rx="9"/><rect class="sa-i" x="58" y="30" width="44" height="52" rx="9"/><text x="80" y="66" text-anchor="middle" class="sa-txt sa-txt--on">b</text>
    <g transform="rotate(8 124 62)"><rect class="sa-i sa-t" x="104" y="38" width="42" height="48" rx="9"/><text x="125" y="72" text-anchor="middle" class="sa-txt">c</text></g>
    <path class="sa-i" d="M24 98h112" stroke-dasharray="2 8"/>
    <circle class="sa-w" cx="140" cy="18" r="7"/>` }
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
