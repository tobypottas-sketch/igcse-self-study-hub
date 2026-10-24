// Part 9: question-quality contract. Gate fixtures prove the gate; solver tests hold today's generated bank against it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { assessQuestionQuality, solverReport, SOLVER_MARGIN, SOLVER_MIN_SAMPLE, optionSetOf } from './support/vocabulary-contract/quality-gate.js';
import { bank, buildQuestion, content } from './support/vocabulary-contract/bank.js';
import { hook, hookLocation } from './support/vocabulary-contract/production-hooks.js';
import { expectedFailure } from './support/vocabulary-contract/xfail.js';

const fixture = (type, correct, wrong, extra = {}) => ({ type, prompt: 'Which meaning fits?', sourceText: null, options: [correct, ...wrong], answers: [correct], distractorSource: 'reviewed', ...extra });
const PREFERENCE = fixture('meaning_in_context', 'favouring one option over another', ['permission', 'requirement', 'result']);
const AVOID = fixture('meaning_in_context', 'deliberately stay away from something', ['join', 'permit', 'encourage']);
const BALANCED = fixture('meaning_in_context', 'favouring one option over another', ['allowing someone to do something', 'something that must be done', 'what happens after an action']);

// ---------- the gate itself ----------
test('gate: the live Meaning Mastery examples preference and avoid MUST be rejected', () => {
  for (const f of [PREFERENCE, AVOID]) { const r = assessQuestionQuality(f); assert.equal(r.ok, false); assert.ok(r.violations.includes('PHRASE_AMONG_WORDS') && r.violations.includes('WORD_COUNT_SPREAD'), r.violations.join()); }
});
test('gate: a balanced phrase set is accepted', () => assert.equal(assessQuestionQuality(BALANCED).ok, true));
test('gate: blank, duplicate and ambiguous option sets are rejected', () => {
  assert.ok(assessQuestionQuality(fixture('definition_to_word', 'avoid', ['', 'join', 'permit'])).violations.includes('BLANK_OPTION'));
  assert.ok(assessQuestionQuality(fixture('definition_to_word', 'avoid', ['join', 'join', 'permit'])).violations.includes('DUPLICATE_OPTION'));
  assert.ok(assessQuestionQuality({ ...fixture('definition_to_word', 'avoid', ['join', 'permit', 'allow']), answers: ['avoid', 'join'] }).violations.includes('NOT_EXACTLY_ONE_ANSWER'));
});
test('gate: article giveaway (only the correct option agrees with a/an) is rejected', () => {
  const q = fixture('gap_fill_bank', 'enormous', ['big', 'small', 'tall'], { sourceText: 'The team built an ____ stadium.', prompt: 'Complete the sentence.' });
  assert.ok(assessQuestionQuality(q).violations.includes('ARTICLE_LEAK'));
  assert.equal(assessQuestionQuality(fixture('gap_fill_bank', 'enormous', ['impressive', 'unusual', 'ancient'], { sourceText: 'The team built an ____ stadium.', prompt: 'Complete the sentence.' })).violations.includes('ARTICLE_LEAK'), false);
});
test('gate: verb-form giveaway (the only -ed form among base forms) is rejected', () => {
  const q = fixture('choose_word_sentence', 'admitted', ['join', 'permit', 'allow'], { prompt: 'Choose the word.', sourceText: 'She ____ the mistake.' });
  assert.ok(assessQuestionQuality(q).violations.includes('FORM_LEAK'));
});
test('gate: generated fallback distractors are rejected on strict reviewed types', () => {
  assert.ok(assessQuestionQuality(fixture('meaning_in_context', 'favouring one option over another', ['allowing someone to do something', 'something that must be done', 'what happens after an action'], { distractorSource: 'generated_semantic' })).violations.includes('GENERATED_FALLBACK'));
});
test('LOCKED: Match sets use the Match rule (<= ~2x the shortest option), not the strict MCQ word-count spread', () => {
  const m = (opts, type = 'word_definition_match') => ({ type, prompt: 'Match.', matchCue: 'leisure time', matchOptions: opts, options: null, answers: [opts[0]], distractorSource: 'reviewed' });
  const natural = m(['time when you can relax and enjoy activities', 'a person or team you compete against', 'a range of things available to choose from', 'an answer to a problem or a difficulty']);
  assert.equal(assessQuestionQuality(natural).ok, true, assessQuestionQuality(natural).violations.join());
  const giant = m(['time off', 'rival', 'choice', 'the particular period of free time that a person has after finishing all of their daily work or study']);
  assert.ok(assessQuestionQuality(giant).violations.includes('MATCH_WORD_RATIO'));
  assert.equal(assessQuestionQuality(giant).violations.includes('WORD_COUNT_SPREAD'), false);
  // the same four options as a standard MCQ keep the tighter gate
  assert.ok(assessQuestionQuality({ ...giant, type: 'definition_to_word' }).violations.includes('WORD_COUNT_SPREAD'));
});
test('gate: spelling and word-family items are exempt from grammar-shape rules (form is the skill)', () => {
  assert.equal(assessQuestionQuality(fixture('spelling_choice', 'admitted', ['admited', 'admitt', 'ammited'], { prompt: 'Which is spelled correctly?', distractorSource: 'reviewed' })).ok, true);
});

// ---------- today's generated bank, held against the gate ----------
// Job 9: 12 variants per target (not 3), so a solver's rate is measured on enough questions that it is not sampling noise.
const { questions } = bank(Array.from({ length: 12 }, (_, i) => i));
const byType = new Map();
for (const q of questions) { const key = `${q.pathwayId}/${q.stageId}/${q.type}`; if (!byType.has(key)) byType.set(key, []); byType.get(key).push(q); }

const gateFailures = new Map();
for (const q of questions) { const r = assessQuestionQuality(q); if (r.applicable && !r.ok) { const key = `${q.pathwayId}/${q.stageId}/${q.type}`; const e = gateFailures.get(key) ?? { n: 0, total: 0, codes: new Map() }; e.n += 1; for (const c of r.violations) e.codes.set(c, (e.codes.get(c) ?? 0) + 1); gateFailures.set(key, e); } }
for (const [key, list] of byType) {
  const applicable = list.filter(q => assessQuestionQuality(q).applicable);
  if (!applicable.length) continue;
  const f = gateFailures.get(key);
  const label = `bank ${key}: every option set passes the quality gate`;
  if (f) {
    const codes = [...f.codes.entries()].map(([c, n]) => `${c}×${n}`).join(', ');
    expectedFailure({ rule: 'Question-quality contract: shape, grammar and provenance gates on every served MCQ', today: `${f.n} of ${applicable.length} generated questions fail the gate (${codes})`, turnsGreenWhen: 'Builders fail closed on gate violations (no question is served unless three credible, shape-compatible, reviewed distractors exist)' },
      label, () => assert.equal(f.n, 0));
  } else test(label, () => assert.equal(list.filter(q => !assessQuestionQuality(q).ok && assessQuestionQuality(q).applicable).length, 0));
}

// Solver thresholds: a solver that knows no vocabulary may beat chance by at most SOLVER_MARGIN.
for (const [key, list] of byType) {
  const rep = solverReport(list);
  if (rep.n === 0) continue;
  for (const [name, s] of Object.entries(rep.solvers)) {
    if (s.fired < SOLVER_MIN_SAMPLE) continue;
    const limit = rep.chance + SOLVER_MARGIN;
    const label = `solver "${name}" on ${key} stays within ${Math.round(SOLVER_MARGIN * 100)} points of chance`;
    if (s.accuracy > limit) {
      expectedFailure({ rule: 'No knowledge-free solver may beat chance by more than 10 points (answer must not be inferable from option shape)', today: `"${name}" fires on ${s.fired}/${rep.n} questions and is right ${Math.round(s.accuracy * 100)}% of the time (chance ${Math.round(rep.chance * 100)}%)`, turnsGreenWhen: 'Distractor generation enforces shape-matched, reviewed option sets so the cue loses its signal' },
        label, () => assert.ok(s.accuracy <= limit));
    } else test(label, () => assert.ok(s.accuracy <= limit));
  }
}

// ---------- the known live examples, built by production ----------
function builtMasteryFor(term) {
  const target = content.occurrences.find(o => content.itemsById[o.vocabularyId].term === term);
  return buildQuestion({ pathwayId: 'meaning', stageId: 'mastery', target, k: 0 });
}
// Job 9: Meaning Mastery is a typed gloss task (STAGE_CONTRACT v2), so there are no options whose phrase-vs-word shape could give the answer away.
for (const term of ['preference', 'avoid']) {
  test(`production Meaning Mastery for "${term}" is typed with no options (nothing to infer from option shape)`, () => {
    const q = builtMasteryFor(term);
    assert.equal(q.type, 'gloss_in_context_type');
    assert.ok(!q.options?.length, 'no options are shown');
    assert.equal(assessQuestionQuality(q).applicable, false);
  });
}

test('production assessQuestionQuality exists, rejects preference and avoid, accepts a balanced set, and the planner prefers clean candidates', async () => {
  const fn = await hook('assessQuestionQuality');
  assert.equal(typeof fn, 'function', 'assessQuestionQuality is not exported');
  assert.equal(fn(PREFERENCE).ok, false); assert.equal(fn(AVOID).ok, false); assert.equal(fn(BALANCED).ok, true);
  const planner = (await import('node:fs')).readFileSync(new URL('../src/vocabulary/pathway-planner.js', import.meta.url), 'utf8');
  assert.match(planner, /assessBuiltQuestion/); assert.match(planner, /buildCandidateGated/);
});
test('bank: no generated question has a blank meaning or empty option', () => {
  for (const q of questions) { const o = optionSetOf(q); if (o) for (const x of o) assert.ok(String(x ?? '').trim().length > 0, `${q.type} ${q.occ}`); for (const a of q.answers) assert.ok(String(a ?? '').trim().length > 0, `${q.type} ${q.occ}: blank answer`); }
});
