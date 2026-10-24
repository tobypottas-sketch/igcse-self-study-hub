// Production question-quality gate. Pure and dependency-free. The planner uses it to PREFER a clean candidate (it re-rolls content
// and option order deterministically) but never strands a Set member: if no candidate passes, the first built question is served
// and the miss is counted as a documented content gap. Heuristics are deliberately conservative.
const STOP = new Set(['the', 'a', 'an', 'to', 'of', 'and', 'in', 'on', 'for', 'that', 'it', 'is', 'was', 'be', 'are', 'she', 'he', 'they', 'we', 'i', 'you', 'her', 'his', 'their', 'our', 'my', 'at', 'by', 'with', 'but', 'so', 'as', 'which', 'what', 'does', 'mean', 'this', 'sentence', 'word', 'best', 'fits', 'these', 'from', 'match', 'each', 'with', 'into', 'gap', 'type', 'complete', 'completes', 'correct', 'drag']);
const lc = s => String(s ?? '').toLowerCase();
const words = s => lc(s).match(/[a-z’']+/g) ?? [];
const content = s => words(s).filter(w => w.length >= 4 && !STOP.has(w));
const wc = s => String(s ?? '').trim().split(/\s+/).filter(Boolean).length;
// Spelling and word-family tasks test form, so grammar/shape differences between options are the skill, not a leak.
const FORM_IS_THE_SKILL = new Set(['spelling_choice', 'spelling_cue_match', 'word_family_choice', 'word_family_match']);
// LOCKED Match-specific rule: set-level matching does NOT use the strict MCQ word-count rule. Instead no option may be more than about
// twice the word count of the shortest (one word of slack for tiny labels), so one giant option never sits among tiny ones.
export const MATCH_TYPES = new Set(['word_definition_match', 'context_sentence_match', 'word_family_match', 'precision_match', 'spelling_cue_match']);
export const MATCH_RATIO = 2; export const MATCH_SLACK_WORDS = 1;
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
    const counts = options.map(wc);
    if (MATCH_TYPES.has(q.type)) {
      if (Math.max(...counts) > MATCH_RATIO * Math.min(...counts) + MATCH_SLACK_WORDS) violations.push('MATCH_WORD_RATIO');
    } else {
      if (wc(correct) >= 3 && wrong.filter(o => wc(o) >= 2).length < 2) violations.push('PHRASE_AMONG_WORDS');
      if (Math.max(...counts) >= 3 && Math.max(...counts) - Math.min(...counts) > 2) violations.push('WORD_COUNT_SPREAD');
    }
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

// Adapter from a built pathway question to the gate's shape.
export function assessBuiltQuestion(question) {
  return assessQuestionQuality({
    type:question?.type, prompt:question?.prompt, sourceText:question?.sourceText ?? null,
    options:question?.options ?? null, matchCue:question?.matchCue ?? null, matchOptions:question?.matchOptions ?? null,
    answers:question?.markingReference?.acceptedAnswers ?? question?.answers ?? [], distractorSource:question?.distractorSource ?? null
  });
}
