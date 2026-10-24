// Job 9 (Part 13): knowledge-free leakage heuristics over the generated Unit 1 question bank.
// Each heuristic looks ONLY at the option strings (and the prompt/sentence for stem overlap). A heuristic "fires" when it can single out
// one option; its accuracy over the questions it fired on is compared with the chance rate of those same questions (1 / option count).
import { optionSetOf } from '../../../src/vocabulary/question-quality-gate.js';

const lc = s => String(s ?? '').toLowerCase();
const wc = s => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;
const words = s => lc(s).match(/[a-z’']+/g) ?? [];
const uniqueOdd = (options, keyOf) => {
  const keys = options.map(keyOf);
  const odd = options.filter((_, i) => keys.filter(k => k === keys[i]).length === 1);
  // "Odd one out" only means something when every other option shares one key.
  const rest = new Set(keys);
  return odd.length === 1 && rest.size === 2 ? odd[0] : null;
};
const extremum = (options, pick) => { const lens = options.map(o => o.length); const m = pick(...lens); const hit = options.filter(o => o.length === m); return hit.length === 1 ? hit[0] : null; };
const shape = o => { const t = lc(o).trim(); const w = wc(t); return [/^to /.test(t) ? 'to' : /^(a|an|the) /.test(t) ? 'art' : '', /ly$/.test(t) ? 'ly' : /ing$/.test(t) ? 'ing' : /ed$/.test(t) ? 'ed' : '', w === 1 ? 'one' : w === 2 ? 'two' : 'many'].join('|'); };
const terminal = o => (String(o).trim().match(/[.!?…]$/) ?? [''])[0];
const innerPunct = o => (String(o).match(/[-,;:’'()]/g) ?? []).join('') ? 'p' : '';
const caps = o => (/^[A-Z]/.test(String(o).trim()) ? 'C' : 'l') + (/\s[A-Z]/.test(String(o)) ? 'M' : '');
const stem5 = w => w.slice(0, 5);
// The question's own content: the quoted target, any sentence under the instruction line, the source text and the match cue. The instruction
// line itself ("What does … mean in this context?", "Match each word with its definition.") is boilerplate shared by every question of the
// type, so its words ("context", "match") are not clues about one option.
const promptContent = prompt => { const s = String(prompt ?? ''); return `${[...s.matchAll(/“([^”]*)”/g)].map(m => m[1]).join(' ')} ${s.includes('\n') ? s.split('\n').slice(1).join(' ') : ''}`; };
const morphology = (q, options) => {
  const source = new Set(words(`${promptContent(q.prompt)} ${q.sourceText ?? ''} ${q.matchCue ?? ''}`).filter(w => w.length >= 5).map(stem5));
  const scores = options.map(o => words(o).filter(w => w.length >= 5 && source.has(stem5(w))).length);
  const top = Math.max(...scores);
  return top > 0 && scores.filter(s => s === top).length === 1 ? options[scores.indexOf(top)] : null;
};

export const HEURISTICS = Object.freeze({
  longest: (q, o) => extremum(o, Math.max),
  shortest: (q, o) => extremum(o, Math.min),
  first: (q, o) => o[0],
  last: (q, o) => o[o.length - 1],
  posShapeOdd: (q, o) => uniqueOdd(o, shape),
  morphologyOverlap: (q, o) => morphology(q, o),
  punctuationOdd: (q, o) => uniqueOdd(o, o2 => terminal(o2) + innerPunct(o2)),
  capitalizationOdd: (q, o) => uniqueOdd(o, caps)
});

export const LEAK_MARGIN = 0.10;   // a heuristic may beat the chance rate of the questions it fired on by at most 10 points
export const LEAK_MIN_FIRED = 30;  // below this many firings the result is "insufficient sample", never a pass

export function analyse(questions) {
  const usable = questions.map(q => ({ q, o: optionSetOf(q) })).filter(({ q, o }) => o && o.filter(x => (q.answers ?? []).map(lc).includes(lc(x))).length === 1);
  const report = { n: usable.length, heuristics: {} };
  for (const [name, fn] of Object.entries(HEURISTICS)) {
    let fired = 0; let right = 0; let chance = 0;
    for (const { q, o } of usable) {
      const pick = fn(q, o);
      if (pick == null) continue;
      fired += 1; chance += 1 / o.length;
      if ((q.answers ?? []).map(lc).includes(lc(pick))) right += 1;
    }
    const accuracy = fired ? right / fired : 0; const chanceRate = fired ? chance / fired : 0;
    // `inverse` is informational: an extreme option that is almost NEVER correct can be eliminated, which is also a (weaker) shortcut.
    report.heuristics[name] = { fired, correct: right, accuracy, chance: chanceRate, advantage: accuracy - chanceRate, inverse: fired >= LEAK_MIN_FIRED && chanceRate - accuracy > LEAK_MARGIN ? 'ANTI' : null, verdict: fired < LEAK_MIN_FIRED ? 'insufficient' : (accuracy - chanceRate > LEAK_MARGIN ? 'LEAK' : 'ok') };
  }
  // Positional distribution of the correct option (a stable bias would show as a heavy position).
  const positions = {};
  for (const { q, o } of usable) { const i = o.findIndex(x => (q.answers ?? []).map(lc).includes(lc(x))); positions[i] = (positions[i] ?? 0) + 1; }
  report.positions = positions;
  return report;
}

export function analyseByType(questions) {
  const groups = {};
  for (const q of questions) (groups[`${q.pathwayId}/${q.stageId}/${q.type}`] ??= []).push(q);
  return Object.fromEntries(Object.entries(groups).map(([k, qs]) => [k, analyse(qs)]));
}
