// Reference solvers (Part 9). The gate itself is production code in src/vocabulary/question-quality-gate.js.
import { assessQuestionQuality, optionSetOf } from '../../../src/vocabulary/question-quality-gate.js';
export { assessQuestionQuality, optionSetOf, MATCH_TYPES, MATCH_RATIO, MATCH_SLACK_WORDS } from '../../../src/vocabulary/question-quality-gate.js';
const lc = s => String(s ?? '').toLowerCase();
const words = s => lc(s).match(/[a-z’']+/g) ?? [];
const wc = s => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;
const STOP = new Set(['the', 'a', 'an', 'to', 'of', 'and', 'in', 'on', 'for', 'that', 'it', 'is', 'was', 'be', 'are', 'she', 'he', 'they', 'we', 'i', 'you', 'her', 'his', 'their', 'our', 'my', 'at', 'by', 'with', 'but', 'so', 'as', 'which', 'what', 'does', 'mean', 'this', 'sentence', 'word', 'best', 'fits', 'these', 'from', 'match', 'each', 'with', 'into', 'gap', 'type', 'complete', 'completes', 'correct', 'drag']);
const content = s => words(s).filter(w => w.length >= 4 && !STOP.has(w));
// ---- Knowledge-free solvers ----
export const SOLVERS = Object.freeze({
  longest: (q, o) => { const m = Math.max(...o.map(x => x.length)); const t = o.filter(x => x.length === m); return t.length === 1 ? t[0] : null; },
  shortest: (q, o) => { const m = Math.min(...o.map(x => x.length)); const t = o.filter(x => x.length === m); return t.length === 1 ? t[0] : null; },
  oddWordCount: (q, o) => { const odd = o.filter(x => o.filter(y => wc(y) === wc(x)).length === 1); return odd.length === 1 ? odd[0] : null; },
  promptOverlap: (q, o) => { const stem = new Set(content(`${q.prompt ?? ''} ${q.sourceText ?? ''}`)); const s = o.map(x => [x, content(x).filter(w => stem.has(w)).length]).sort((a, b) => b[1] - a[1]); return s[0][1] > s[1][1] ? s[0][0] : null; }
});
export const SOLVER_MARGIN = 0.10;       // a knowledge-free solver may beat chance by at most 10 points
export const SOLVER_MIN_SAMPLE = 30;     // below this many firings the result is reported as insufficient, not as a pass

// Returns { n, chance, solvers: { name: { fired, correct, accuracy } } } for a list of questions of one type.
export function solverReport(questions) {
  const usable = questions.map(q => ({ q, o: optionSetOf(q) })).filter(({ q, o }) => o && o.filter(x => (q.answers ?? []).map(lc).includes(lc(x))).length === 1);
  const report = { n: usable.length, chance: usable.length ? usable.reduce((s, { o }) => s + 1 / o.length, 0) / usable.length : 0, solvers: {} };
  for (const [name, fn] of Object.entries(SOLVERS)) {
    let fired = 0; let right = 0;
    for (const { q, o } of usable) { const pick = fn(q, o); if (pick !== null) { fired += 1; if ((q.answers ?? []).map(lc).includes(lc(pick))) right += 1; } }
    report.solvers[name] = { fired, correct: right, accuracy: fired ? right / fired : 0 };
  }
  return report;
}
