// Reference question-quality gate and knowledge-free solvers (Part 9). Test infrastructure: it defines WHAT the production
// gate must reject; it is not wired into any builder. Heuristics are deliberately conservative and documented.
const STOP = new Set(['the', 'a', 'an', 'to', 'of', 'and', 'in', 'on', 'for', 'that', 'it', 'is', 'was', 'be', 'are', 'she', 'he', 'they', 'we', 'i', 'you', 'her', 'his', 'their', 'our', 'my', 'at', 'by', 'with', 'but', 'so', 'as', 'which', 'what', 'does', 'mean', 'this', 'sentence', 'word', 'best', 'fits', 'these', 'from', 'match', 'each', 'with', 'into', 'gap', 'type', 'complete', 'completes', 'correct', 'drag']);
const lc = s => String(s ?? '').toLowerCase();
const words = s => lc(s).match(/[a-z’']+/g) ?? [];
const content = s => words(s).filter(w => w.length >= 4 && !STOP.has(w));
const wc = s => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;
// Spelling and word-family tasks test form, so grammar/shape differences between options are the skill, not a leak.
const FORM_IS_THE_SKILL = new Set(['spelling_choice', 'spelling_cue_match', 'word_family_choice', 'word_family_match']);
const STRICT_REVIEWED = new Set(['which_situation_fits', 'meaning_in_context', 'choose_word_sentence', 'context_sentence_match', 'gap_fill_bank', 'drag_word_sentence']);

export function optionSetOf(q) {
  if (Array.isArray(q.options) && q.options.length >= 3) return q.options;
  if (Array.isArray(q.matchOptions) && q.matchCue && q.matchOptions.length >= 3) return q.matchOptions;
  return null;
}

const formClass = w => (/ing$/.test(w) ? 'ing' : /ed$/.test(w) ? 'ed' : /[^s]s$/.test(w) ? 's' : 'base');

export function assessQuestionQuality(q) {
  const options = optionSetOf(q); const violations = [];
  if (!options) return { ok: true, applicable: false, violations };
  const answers = (q.answers ?? []).map(lc);
  const key = options.filter(o => answers.includes(lc(o)));
  const correct = key[0]; const wrong = options.filter(o => !key.includes(o));
  if (options.some(o => !String(o ?? '').trim() || /^(\.\.\.|…|—|-|n\/a|none)$/i.test(String(o).trim()))) violations.push('BLANK_OPTION');
  if (new Set(options.map(lc)).size !== options.length) violations.push('DUPLICATE_OPTION');
  if (key.length !== 1) violations.push('NOT_EXACTLY_ONE_ANSWER');
  if (correct != null) {
    if (wc(correct) >= 3 && wrong.filter(o => wc(o) >= 2).length < 2) violations.push('PHRASE_AMONG_WORDS');
    const counts = options.map(wc);
    if (Math.max(...counts) >= 3 && Math.max(...counts) - Math.min(...counts) > 2) violations.push('WORD_COUNT_SPREAD');
    if (!FORM_IS_THE_SKILL.has(q.type)) {
      const gap = /\b(a|an)\s+_{2,}/i.exec(q.sourceText ?? '');
      if (gap) {
        const vowel = o => /^[aeiou]/i.test(String(o).trim());
        const agree = options.filter(o => (gap[1].toLowerCase() === 'an') === vowel(o));
        if (agree.length === 1 && agree[0] === correct) violations.push('ARTICLE_LEAK');
      }
      if (options.every(o => wc(o) === 1) && options.length >= 4) {
        const classes = options.map(o => formClass(lc(o))); const c = formClass(lc(correct));
        const others = classes.filter((_, i) => options[i] !== correct);
        if (others.every(x => x === others[0]) && others[0] !== c) violations.push('FORM_LEAK');
      }
    }
    const stem = new Set(content(`${q.prompt ?? ''} ${q.sourceText ?? ''}`));
    const overlap = options.map(o => content(o).filter(w => stem.has(w)).length);
    const top = Math.max(...overlap);
    if (top > 0 && overlap.filter(n => n === top).length === 1 && options[overlap.indexOf(top)] === correct && STRICT_REVIEWED.has(q.type)) violations.push('PROMPT_OVERLAP_LEAK');
  }
  if (STRICT_REVIEWED.has(q.type) && q.distractorSource && q.distractorSource !== 'reviewed') violations.push('GENERATED_FALLBACK');
  return { ok: violations.length === 0, applicable: true, violations };
}

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
