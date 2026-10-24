// Word Families eligibility (locked rule; schema v2 = authored per-form records on the sense, Job 8 Part 6).
// Eligible = >=3 pedagogically useful forms including the target, >=2 distinct parts of speech, an authored example per form. Nothing is inferred.
import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateFamilyEligibility, familyEligibilityReport, FAMILY_STATUS } from '../src/vocabulary/word-family-eligibility.js';
import { content } from './support/vocabulary-contract/bank.js';

const form = (f, partOfSpeech, extra = {}) => ({ form: f, partOfSpeech, example: `A sentence that uses ${f} naturally here.`, pedagogicallyUseful: true, ...extra });
const run = (forms, term = 'avoid') => evaluateFamilyEligibility({ term }, { wordFamilyForms: forms });
const ok3 = [form('avoid', 'verb'), form('avoidance', 'noun'), form('avoidable', 'adjective')];

test('eligible: 3+ useful forms including the target, 2+ parts of speech, an example for each', () => {
  const r = run(ok3);
  assert.equal(r.status, FAMILY_STATUS.ELIGIBLE);
  assert.deepEqual(r.partsOfSpeech, ['adjective', 'noun', 'verb']);
});
test('ineligible: two forms; one part of speech; target missing; not useful; no example; unknown part of speech', () => {
  assert.equal(run(ok3.slice(0, 2)).status, FAMILY_STATUS.INELIGIBLE);
  assert.equal(run([form('afford', 'adjective'), form('affordable', 'adjective'), form('unaffordable', 'adjective')], 'afford').status, FAMILY_STATUS.INELIGIBLE, 'one part of speech');
  assert.equal(run(ok3.slice(1)).status, FAMILY_STATUS.INELIGIBLE, 'the target must be an authored form');
  assert.equal(run([ok3[0], ok3[1], form('avoidable', 'adjective', { pedagogicallyUseful: false })]).status, FAMILY_STATUS.INELIGIBLE);
  assert.equal(run([ok3[0], ok3[1], form('avoidable', 'adjective', { example: '' })]).status, FAMILY_STATUS.INELIGIBLE);
  assert.equal(run([ok3[0], ok3[1], form('avoidable', 'adjectival')]).status, FAMILY_STATUS.INELIGIBLE);
});
test('bare-string families are UNKNOWN - never eligible by inference from suffixes or counts', () => {
  assert.equal(evaluateFamilyEligibility({ term: 'avoid', wordFamily: ['avoidance', 'avoidable'] }, {}).status, FAMILY_STATUS.UNKNOWN);
});
test('Unit 1 today: no word has authored per-form metadata, so none is Mastery-eligible (documented content gap, not a guess)', () => {
  for (const item of content.items) assert.notEqual(evaluateFamilyEligibility(item, item.senses[0]).status, FAMILY_STATUS.ELIGIBLE, item.vocabularyId);
  const report = familyEligibilityReport(content.items);
  assert.ok(report);
});
