// Part 2: Sets of 10 per pathway, no incomplete Sets, no padding, per-pathway membership (Locked Decisions 1, 2, 6).
import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { computeSets, servedAtAllStages, familyCompleteForMastery, SET_SIZE } from './support/vocabulary-contract/reference-sets.js';
import { hook, hookLocation } from './support/vocabulary-contract/production-hooks.js';
import { expectedFailure } from './support/vocabulary-contract/xfail.js';

const ids = n => Array.from({ length: n }, (_, i) => `w${String(i + 1).padStart(2, '0')}`);
const FIXTURES = [[50, 5, 0], [47, 4, 7], [40, 4, 0], [9, 0, 9], [0, 0, 0], [10, 1, 0], [19, 1, 9], [20, 2, 0]];

test('reference: Set count is floor(serviceable / 10) with the remainder held back', () => {
  for (const [n, sets, held] of FIXTURES) {
    const r = computeSets(ids(n));
    assert.equal(r.setCount, sets, `${n} serviceable`);
    assert.equal(r.heldBack.length, held, `${n} serviceable`);
    assert.equal(r.serviceableCount, n);
  }
  assert.deepEqual([50, 47, 40, 9, 0].map(n => computeSets(ids(n)).setCount), [5, 4, 4, 0, 0]);
});
test('reference: every Set has exactly 10 distinct targets, none repeated across Sets, no padding', () => {
  for (const [n] of FIXTURES) {
    const { sets, heldBack } = computeSets(ids(n));
    for (const set of sets) { assert.equal(set.length, SET_SIZE); assert.equal(new Set(set).size, SET_SIZE); }
    const all = [...sets.flat(), ...heldBack];
    assert.equal(new Set(all).size, all.length, 'a word appears twice');
    assert.equal(all.length, n, 'words were invented or dropped');
  }
});
test('reference: 47 serviceable words give 4 visible Sets and 7 held-back words that stay visible to diagnostics', () => {
  const r = computeSets(ids(47));
  assert.equal(r.sets.length, 4); assert.deepEqual(r.heldBack, ids(47).slice(40));
});
test('reference: duplicate ids never create a fake Set', () => {
  assert.equal(computeSets([...ids(9), ...ids(9)]).setCount, 0);
});
test('reference: Set 1 membership is calculated per pathway and may differ', () => {
  const a = computeSets(ids(50)); const b = computeSets(ids(50).filter(id => id !== 'w03'));
  assert.notDeepEqual(a.sets[0], b.sets[0]);
});
test('reference: a word enters a pathway Set only if serviceable at all five stages', () => {
  const stages = { recognise: ids(10), match: ids(10).slice(1), apply: ids(10), recall: ids(10), mastery: ids(10) };
  assert.deepEqual(servedAtAllStages(stages), ids(10).slice(1));
  assert.deepEqual(servedAtAllStages({ ...stages, mastery: [] }), []);
});
test('reference: Word Families Mastery excludes incomplete genuine families', () => {
  assert.equal(familyCompleteForMastery(['avoidance', 'avoidable']), true);
  assert.equal(familyCompleteForMastery(['prefer']), false);
  assert.equal(familyCompleteForMastery([]), false);
});

// ---------- Unit 1 as it is today ----------
const content = releasePlannerContent(unit1);
const readiness = evaluateUnitReadiness({ content });

test('unit 1: complete Sets derived from today\'s served words obey the rule for every live pathway', t => {
  for (const p of Object.values(readiness.pathways)) {
    const r = computeSets(p.servedOccurrenceIds ?? []);
    // A locked pathway (Paraphrasing for Unit 1) reports candidate counts but serves no ids, so it offers no Set.
    assert.equal(r.setCount, Math.floor((p.servedOccurrenceIds ?? []).length / SET_SIZE), p.pathwayId);
    for (const set of r.sets) assert.equal(set.length, SET_SIZE);
    t.diagnostic(`${p.pathwayId}: served ${p.servedCount} → ${r.setCount} Sets, ${r.heldBack.length} held back`);
  }
});

const incompleteFamilyServed = (() => {
  const wf = readiness.pathways.word_families;
  const byOcc = Object.fromEntries(unit1.occurrences.map(o => [o.occurrenceId, o]));
  const byItem = Object.fromEntries(unit1.items.map(i => [i.vocabularyId, i]));
  return (wf.servedOccurrenceIds ?? []).filter(id => !familyCompleteForMastery(byItem[byOcc[id].vocabularyId]?.wordFamily ?? []));
})();

expectedFailure({
  rule: 'Word Families Mastery excludes incomplete genuine families (Locked Decision 6)',
  today: `Unit 1 readiness serves ${incompleteFamilyServed.length} Word Families word(s) whose recorded family has fewer than 2 other forms through Mastery: ${incompleteFamilyServed.join(', ') || 'none'}`,
  turnsGreenWhen: 'Readiness computes Word Families Mastery eligibility from family completeness, so such words stop at Recall'
}, 'unit 1: Word Families serves no word without a complete family at Mastery', () => assert.deepEqual(incompleteFamilyServed, []));

expectedFailure({
  rule: 'Readiness exposes complete Sets per pathway and the held-back remainder (Locked Decisions 1-2)',
  today: 'evaluateUnitReadiness returns servedCount only; there is no setCount / heldBack / Set membership, so a 48-word pathway looks like a full pathway',
  turnsGreenWhen: 'readiness (or a pure selector it calls) exposes setCount, set membership and heldBack for each pathway'
}, 'production readiness exposes Set count and held-back words per pathway', () => {
  for (const p of Object.values(readiness.pathways)) {
    assert.equal(typeof p.setCount, 'number', `${p.pathwayId}.setCount`);
    assert.ok(Array.isArray(p.heldBackOccurrenceIds), `${p.pathwayId}.heldBackOccurrenceIds`);
    assert.equal(p.setCount, Math.floor(p.servedCount / SET_SIZE), `${p.pathwayId}`);
  }
});

expectedFailure({
  rule: 'A pure Set selector returns the approved Set counts for the five fixtures',
  today: `no module exports ${hookLocation('computePathwaySets')}`,
  turnsGreenWhen: `${hookLocation('computePathwaySets')} is implemented to return { setCount, sets, heldBack } for a list of serviceable ids`
}, 'production Set selector satisfies the 50/47/40/9/0 fixtures', async () => {
  const fn = await hook('computePathwaySets');
  assert.equal(typeof fn, 'function', 'computePathwaySets is not exported');
  for (const [n, sets, held] of FIXTURES) { const r = fn(ids(n)); assert.equal(r.setCount, sets); assert.equal(r.heldBack.length, held); }
});
