// Part 2: Sets of 10 per pathway, no incomplete Sets, no padding, per-pathway membership (Locked Decisions 1, 2, 6).
import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { computeSets, servedAtAllStages, familyCompleteForMastery, SET_SIZE } from './support/vocabulary-contract/reference-sets.js';
import { hook } from './support/vocabulary-contract/production-hooks.js';
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
const F = (form, partOfSpeech, extra = {}) => ({ form, partOfSpeech, authentic: true, authoredContext: true, ...extra });
test('LOCKED family rule: 3+ authentic, authored forms including the target across 2+ parts of speech', () => {
  assert.equal(familyCompleteForMastery([F('prefer', 'verb'), F('preference', 'noun'), F('preferable', 'adjective')], 'preference'), true);
  assert.equal(familyCompleteForMastery([F('avoid', 'verb'), F('avoidance', 'noun'), F('avoidable', 'adjective')], 'avoid'), true);
  assert.equal(familyCompleteForMastery([F('affordable', 'adjective'), F('afford', 'verb'), F('unaffordable', 'adjective')], 'afford'), true);
});
test('LOCKED family rule: noun + verb + adjective + adverb is NOT required (verb + noun + adjective suffices; so does two parts of speech)', () => {
  assert.equal(familyCompleteForMastery([F('decide', 'verb'), F('decision', 'noun'), F('decisive', 'adjective')]), true);
  assert.equal(familyCompleteForMastery([F('create', 'verb'), F('creation', 'noun'), F('creator', 'noun')]), true);
});
test('LOCKED family rule: fewer than 3 forms, a single part of speech, or a missing target is NOT complete', () => {
  assert.equal(familyCompleteForMastery([F('prefer', 'verb'), F('preference', 'noun')]), false);
  assert.equal(familyCompleteForMastery([F('avoidable', 'adjective'), F('unavoidable', 'adjective'), F('inevitable', 'adjective')]), false);
  assert.equal(familyCompleteForMastery([F('prefer', 'verb'), F('preference', 'noun'), F('preferable', 'adjective')], 'preferential'), false);
  assert.equal(familyCompleteForMastery([]), false);
});
test('LOCKED family rule: forms that are not authentic, or lack authored context, do not count (no rare or invented forms)', () => {
  assert.equal(familyCompleteForMastery([F('avoid', 'verb'), F('avoidance', 'noun'), F('avoidability', 'noun', { authentic: false })]), false);
  assert.equal(familyCompleteForMastery([F('avoid', 'verb'), F('avoidance', 'noun'), F('avoidable', 'adjective', { authoredContext: false })]), false);
  assert.equal(familyCompleteForMastery(['avoid', 'avoidance', 'avoidable']), false, 'a bare string list carries no part of speech or authoring evidence');
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

const authoring = readiness.authoring ?? {};

// Architecture (Job 8): the data model now carries authored per-form records and readiness evaluates the locked complete-family rule.
test('unit 1: Word Families Mastery eligibility is evaluated from the v2 data model and reported (eligible / ineligible / unknown)', () => {
  for (const key of ['wordFamilyEligible', 'wordFamilyIneligible', 'wordFamilyUnknown', 'wordFamilyNoFamily', 'wordFamilyBlockedTerms']) assert.ok(key in authoring, key);
  assert.equal(authoring.wordFamilyEligible + authoring.wordFamilyIneligible + authoring.wordFamilyUnknown + authoring.wordFamilyNoFamily, unit1.items.length);
  assert.equal(authoring.wordFamilyBlockedTerms.length, authoring.wordFamilyIneligible + authoring.wordFamilyUnknown);
});
test('unit 1: Word Families is never offered Mastery or served as ready while no family is authored', () => {
  const wf = readiness.pathways.word_families;
  if (authoring.wordFamilyEligible < 10) assert.equal(wf.setCount, 0, 'no Set may be offered without enough Mastery-eligible families');
});

// Content (class B): authoring the per-form metadata for enough Unit 1 families.
expectedFailure({
  rule: 'Word Families is live for Unit 1 only when enough families are authored to pass the locked complete-family rule at Mastery',
  today: `Unit 1 has ${authoring.wordFamilyEligible} of ${unit1.items.length} Mastery-eligible families (${authoring.wordFamilyUnknown} have no authored wordFamilyForms)`,
  turnsGreenWhen: 'Teachers author sense.wordFamilyForms ({ form, partOfSpeech, example, pedagogicallyUseful }) for at least 20 words'
}, 'unit 1: Word Families Mastery eligibility is authored for enough words to form Sets', () => assert.ok(authoring.wordFamilyEligible >= 20));

test('production readiness exposes Set count and held-back words per pathway', () => {
  for (const p of Object.values(readiness.pathways)) {
    assert.equal(typeof p.setCount, 'number', `${p.pathwayId}.setCount`);
    assert.ok(Array.isArray(p.heldBackOccurrenceIds), `${p.pathwayId}.heldBackOccurrenceIds`);
    assert.equal(p.setCount, Math.floor(p.servedCount / SET_SIZE), `${p.pathwayId}`);
  }
});

test('production Set selector satisfies the 50/47/40/9/0 fixtures', async () => {
  const fn = await hook('computePathwaySets');
  assert.equal(typeof fn, 'function', 'computePathwaySets is not exported');
  for (const [n, sets, held] of FIXTURES) { const r = fn(ids(n)); assert.equal(r.setCount, sets); assert.equal(r.heldBack.length, held); }
});
