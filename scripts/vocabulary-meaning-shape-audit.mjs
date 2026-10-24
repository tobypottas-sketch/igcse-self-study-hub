// Job 9: shape audit of every Meaning Mastery context (correct gloss + three authored wrong meanings).
// Fails (exit 1) on: word-count spread > 2 (the production gate's WORD_COUNT_SPREAD), a wrong option that repeats a content word of the
// sentence more than the correct one does (PROMPT_OVERLAP), a gloss that shows the target (cue exposure), duplicates, or not exactly three wrongs.
import unit from '../content/vocabulary/units/unit-01.js';
import { cueExposesAnswer } from '../supabase/functions/_shared/vocabulary-typed-forms.js';
import { assessQuestionQuality } from '../src/vocabulary/question-quality-gate.js';
const wc = s => s.trim().split(/\s+/).length;
let bad = 0;
for (const item of unit.items) for (const [i, m] of (item.senses[0].masteryContexts ?? []).entries()) {
  const options = [m.meaning, ...(m.wrongMeanings ?? [])];
  const problems = [];
  if ((m.wrongMeanings ?? []).length !== 3) problems.push('needs exactly three wrong meanings');
  if (new Set(options.map(x => x.toLowerCase())).size !== options.length) problems.push('duplicate option');
  const counts = options.map(wc); if (Math.max(...counts) >= 3 && Math.max(...counts) - Math.min(...counts) > 2) problems.push(`word-count spread ${counts.join('/')}`);
  const q = { type: 'meaning_in_context', prompt: `In this sentence, which meaning best fits “${item.term}”?\n${m.text}`, options, answers: [m.meaning], distractorSource: 'reviewed' };
  const verdict = assessQuestionQuality(q); if (!verdict.ok) problems.push(...verdict.violations);
  if (cueExposesAnswer(m.meaning, [item.term])) problems.push('correct gloss shows the target');
  for (const wrong of m.wrongMeanings ?? []) if (cueExposesAnswer(wrong, [item.term])) problems.push(`wrong option shows the target: ${wrong}`);
  if (problems.length) { bad++; console.log(`${item.term} [${i}] ${[...new Set(problems)].join('; ')}  ::  ${counts.join('/')}  ${m.meaning}`); }
}
console.log(bad ? `${bad} context(s) need work` : 'all Meaning Mastery contexts pass the shape audit');
process.exit(bad ? 1 : 0);
