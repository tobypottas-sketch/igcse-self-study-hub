// Job 7, Parts 7-8: Match integrity and answer-leakage audit over the generated Unit 1 bank (every live target x 3 seeds).
import test from 'node:test';
import assert from 'node:assert/strict';
import { bank, buildQuestion, content } from './support/vocabulary-contract/bank.js';
import { assessQuestionQuality, solverReport, SOLVER_MARGIN } from './support/vocabulary-contract/quality-gate.js';

const { questions } = bank();
const MATCH = questions.filter(q => q.type === 'word_definition_match');
const wc = s => String(s).trim().split(/\s+/).filter(Boolean).length;
const norm = s => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

test('Match: the audit sample is non-trivial', () => assert.ok(MATCH.length >= 100, `got ${MATCH.length}`));
test('Match: every set has distinct terms, distinct definitions, no empty cell, and the cue maps to exactly one option', () => {
  for (const q of MATCH) {
    assert.ok(q.pairs.length >= 3, `${q.occ}: at least three pairs`);
    assert.equal(new Set(q.pairs.map(p => p.vocabularyId)).size, q.pairs.length, `${q.occ}: unique words`);
    assert.equal(new Set(q.pairs.map(p => norm(p.definition))).size, q.pairs.length, `${q.occ}: unique definitions (no one-to-many)`);
    assert.ok(q.pairs.every(p => norm(p.term) && norm(p.definition)), `${q.occ}: no empty cell`);
    assert.equal(q.matchOptions.filter(o => norm(o) === norm(q.answers[0])).length, 1, `${q.occ}: the cue has exactly one correct option`);
    assert.deepEqual([...q.matchOptions].map(norm).sort(), q.pairs.map(p => norm(p.definition)).sort(), `${q.occ}: options are exactly the pairs' definitions`);
  }
});
test('Match: the target word is always one of the pairs and no pair definition contains its own headword', () => {
  for (const q of MATCH) {
    assert.ok(q.pairs.some(p => norm(p.term) === norm(q.term)), `${q.occ}: target in the set`);
    for (const p of q.pairs) assert.ok(!new RegExp(`\\b${p.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(p.definition), `${q.occ}: "${p.term}" is inside its own definition`);
  }
});
test('Match: deterministic - the same inputs always build the same set in the same order', () => {
  const target = content.occurrences[7];
  const a = buildQuestion({ pathwayId: 'meaning', stageId: 'match', target, k: 2, nonce: 'n2' });
  const b = buildQuestion({ pathwayId: 'meaning', stageId: 'match', target, k: 2, nonce: 'n2' });
  assert.deepEqual(a, b);
});
test('Match: no set is exposed to the longest-definition shortcut by more than the locked rule (longest <= 2 x shortest + 1 words)', () => {
  const offenders = MATCH.filter(q => Math.max(...q.matchOptions.map(wc)) > 2 * Math.min(...q.matchOptions.map(wc)) + 1);
  assert.equal(offenders.length, 0, `${offenders.length} Match sets break the locked word-count rule, e.g. ${offenders[0]?.occ}`);
});
test('Match: gate-clean (MATCH_WORD_RATIO, blank, duplicate)', () => {
  const bad = MATCH.map(q => ({ q, r: assessQuestionQuality(q) })).filter(x => !x.r.ok);
  assert.equal(bad.length, 0, bad.slice(0, 3).map(x => `${x.q.occ}:${x.r.violations}`).join(' | '));
});
test('Match: the longest-definition solver stays within the margin of chance', () => {
  const rep = solverReport(MATCH);
  const s = rep.solvers.longest;
  assert.ok(s.accuracy <= rep.chance + SOLVER_MARGIN, `longest solves ${Math.round(s.accuracy * 100)}% (chance ${Math.round(rep.chance * 100)}%)`);
});

// ---- Part 8: leakage audit across builders. These are MEASUREMENTS held to a ceiling, not a claim of perfection. ----
const mcq = questions.filter(q => Array.isArray(q.options) && q.options.length >= 3);
test('Leakage: the correct option is not systematically in a fixed position (first / last / any slot) for any type', () => {
  const byType = new Map();
  for (const q of mcq) { const i = q.options.findIndex(o => norm(o) === norm(q.answers[0])); if (i < 0) continue; const e = byType.get(q.type) ?? { n: 0, pos: [0, 0, 0, 0, 0, 0] }; e.n += 1; e.pos[Math.min(i, 5)] += 1; byType.set(q.type, e); }
  for (const [type, { n, pos }] of byType) if (n >= 60) { const top = Math.max(...pos) / n; assert.ok(top <= 0.5, `${type}: one position holds ${Math.round(top * 100)}% of correct answers`); }
});
test('Leakage: no MCQ repeats an identical option set across more than 4% of a type (repeated distractor sets)', () => {
  const byType = new Map();
  for (const q of mcq) { const e = byType.get(q.type) ?? new Map(); const key = [...q.options].map(norm).sort().join('|'); e.set(key, (e.get(key) ?? 0) + 1); byType.set(q.type, e); }
  for (const [type, sets] of byType) { const total = [...sets.values()].reduce((a, b) => a + b, 0); if (total < 60) continue; const worst = Math.max(...sets.values()); assert.ok(worst / total <= 0.04 || worst <= 3, `${type}: an identical option set repeats ${worst}x of ${total}`); }
});
test('Leakage: the answer word never appears in the visible prompt of a typed-recall question', () => {
  for (const q of questions) {
    if (!['type_word_from_definition', 'spell_word'].includes(q.type)) continue;
    const text = `${q.prompt} ${q.sourceText ?? ''}`.toLowerCase();
    for (const a of q.answers) assert.ok(!new RegExp(`\\b${a.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text), `${q.type} ${q.occ}: "${a}" visible in the prompt`);
  }
});
