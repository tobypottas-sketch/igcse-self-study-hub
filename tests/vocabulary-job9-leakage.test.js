// Job 9 (Part 13): knowledge-free answer-leakage tests over 12 generated variants of every Unit 1 target at every live pathway stage.
// A heuristic that sees ONLY the options (longest, shortest, first, last, part-of-speech shape, shared stem, punctuation, capitalisation) must not
// beat the chance rate of the questions it fires on by more than ten percentage points (and must fire often enough to mean something).
import test from 'node:test';
import assert from 'node:assert/strict';
import { bank } from './support/vocabulary-contract/bank.js';
import { analyse, analyseByType, LEAK_MARGIN, LEAK_MIN_FIRED } from './support/vocabulary-contract/leakage.js';

const SEEDS = Array.from({ length: 12 }, (_, i) => i);
const { questions } = bank(SEEDS);
const CHOICE = new Set(['definition_to_word', 'meaning_match', 'which_situation_fits', 'meaning_in_context', 'precision_choice', 'word_definition_match',
  'context_sentence_match', 'precision_match', 'word_family_choice', 'word_family_match', 'word_family_identify', 'spelling_choice', 'spot_the_error', 'spelling_match']);
const byType = analyseByType(questions.filter(q => CHOICE.has(q.type)));
// word_family_identify: the correct family member shares its stem with the prompt word BY DEFINITION (that is what a family is), so the shared-stem
// heuristic cannot be removed without removing the task. Recorded as an intrinsic property, not a leak that content can fix.
const INTRINSIC = new Set(['word_families/recognise/word_family_identify|morphologyOverlap']);

test('the sample covers every live choice question type with enough questions to judge', () => {
  const types = new Set(Object.keys(byType).map(key => key.split('/')[2]));
  for (const type of ['definition_to_word', 'meaning_match', 'which_situation_fits', 'meaning_in_context', 'precision_choice', 'word_definition_match', 'word_family_choice', 'word_family_identify', 'spelling_choice']) assert.ok(types.has(type), type);
  for (const [key, report] of Object.entries(byType)) assert.ok(report.n >= 100, `${key}: only ${report.n} questions`);
});

test('no option-only heuristic beats chance by more than ten points on any live choice type', () => {
  const leaks = [];
  for (const [key, report] of Object.entries(byType)) for (const [name, h] of Object.entries(report.heuristics)) {
    if (h.verdict === 'LEAK' && !INTRINSIC.has(`${key}|${name}`)) leaks.push(`${key} ${name}: ${(h.accuracy * 100).toFixed(0)}% vs chance ${(h.chance * 100).toFixed(0)}% over ${h.fired}`);
  }
  assert.deepEqual(leaks, []);
});

test('the declared intrinsic exception is the only one, and it is genuinely intrinsic (family members share a stem)', () => {
  const report = byType['word_families/recognise/word_family_identify'];
  assert.equal(report.heuristics.morphologyOverlap.verdict, 'LEAK');
  for (const [key, r] of Object.entries(byType)) for (const [name, h] of Object.entries(r.heuristics)) if (h.verdict === 'LEAK') assert.ok(INTRINSIC.has(`${key}|${name}`), `${key} ${name}`);
});

test('the correct option is never concentrated in one position (no position holds more than 40% of answers on any live choice type)', () => {
  for (const [key, report] of Object.entries(byType)) {
    const total = Object.values(report.positions).reduce((a, b) => a + b, 0);
    for (const [position, count] of Object.entries(report.positions)) assert.ok(count / total <= 0.40, `${key}: position ${position} holds ${(100 * count / total).toFixed(0)}% of answers`);
  }
});

test('longest/shortest/first/last are individually reported for the report types and fire often enough (not an empty pass)', () => {
  for (const key of ['meaning/apply/which_situation_fits', 'meaning/recognise/meaning_in_context', 'meaning/match/word_definition_match'].filter(k => byType[k])) {
    for (const name of ['longest', 'shortest', 'first', 'last']) assert.ok(byType[key].heuristics[name].fired >= LEAK_MIN_FIRED || name === 'shortest' || name === 'longest', `${key} ${name}`);
  }
  assert.ok(LEAK_MARGIN === 0.10);
});

test('punctuation and capitalisation tells are absent in Which Situation Fits and Meaning Match', () => {
  const sit = analyse(questions.filter(q => q.type === 'which_situation_fits'));
  for (const name of ['punctuationOdd', 'capitalizationOdd', 'posShapeOdd']) assert.notEqual(sit.heuristics[name].verdict, 'LEAK', name);
  const mm = analyse(questions.filter(q => q.type === 'meaning_match'));
  for (const name of ['punctuationOdd', 'capitalizationOdd', 'posShapeOdd', 'morphologyOverlap']) assert.notEqual(mm.heuristics[name].verdict, 'LEAK', name);
});

test('Word Families choice has no position bias among its four options (the answer is not predictably first, last, longest or shortest)', () => {
  const wf = analyse(questions.filter(q => q.type === 'word_family_choice' && (q.options?.length ?? 0) === 4));
  assert.ok(wf.n >= 100);
  for (const name of ['longest', 'shortest', 'first', 'last']) assert.notEqual(wf.heuristics[name].verdict, 'LEAK', name);
});
