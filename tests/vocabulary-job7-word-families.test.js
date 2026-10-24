// Job 7, Part 10: Word Families structural audit. The eligibility rule is locked; the Unit 1 data cannot answer it yet.
import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateFamilyEligibility, familyEligibilityReport, FAMILY_STATUS } from '../src/vocabulary/word-family-eligibility.js';
import { content } from './support/vocabulary-contract/bank.js';

const form = (f, pos, extra = {}) => ({ form: f, pos, authentic: true, contextIds: [`ctx_${f}`], ...extra });
const word = (forms, term = 'avoid') => ({ term, wordFamilyForms: forms });

test('eligible: 3+ authentic, context-supported forms including the target across 2+ parts of speech', () => {
  const r = evaluateFamilyEligibility(word([form('avoid', 'verb'), form('avoidance', 'noun'), form('avoidable', 'adjective')]));
  assert.equal(r.status, FAMILY_STATUS.ELIGIBLE); assert.deepEqual(r.partsOfSpeech, ['adjective', 'noun', 'verb']);
});
test('ineligible: two forms; one part of speech; target missing; unauthentic form; form without a context; unknown part of speech', () => {
  const ok = [form('avoid', 'verb'), form('avoidance', 'noun'), form('avoidable', 'adjective')];
  assert.equal(evaluateFamilyEligibility(word(ok.slice(0, 2))).status, FAMILY_STATUS.INELIGIBLE);
  assert.equal(evaluateFamilyEligibility(word([form('afford', 'adjective'), form('affordable', 'adjective'), form('unaffordable', 'adjective')], 'afford')).status, FAMILY_STATUS.INELIGIBLE, 'one part of speech is not a family');
  assert.equal(evaluateFamilyEligibility(word(ok.slice(1))).status, FAMILY_STATUS.INELIGIBLE, 'the target must itself be an authored form');
  assert.equal(evaluateFamilyEligibility(word([ok[0], ok[1], form('avoidable', 'adjective', { authentic: false })])).status, FAMILY_STATUS.INELIGIBLE);
  assert.equal(evaluateFamilyEligibility(word([ok[0], ok[1], form('avoidable', 'adjective', { contextIds: [] })])).status, FAMILY_STATUS.INELIGIBLE);
  assert.equal(evaluateFamilyEligibility(word([ok[0], ok[1], form('avoidable', 'adjectival')])).status, FAMILY_STATUS.INELIGIBLE);
});
test('bare-string families are UNKNOWN - never eligible by inference from suffixes or counts', () => {
  const r = evaluateFamilyEligibility({ term: 'avoid', wordFamily: ['avoidance', 'avoidable'] });
  assert.equal(r.status, FAMILY_STATUS.UNKNOWN);
  assert.equal(evaluateFamilyEligibility({ term: 'x' }).status, FAMILY_STATUS.UNKNOWN);
});
test('Unit 1 today: every word with a family is UNKNOWN (no per-form metadata) - the documented content gap, not a guess', () => {
  const report = familyEligibilityReport(content.items);
  assert.equal(report.eligible.length, 0);
  assert.equal(report.ineligible.length, 0);
  assert.equal(report.unknown.length, content.items.length);
  assert.equal(content.items.filter(i => Array.isArray(i.wordFamily) && i.wordFamily.length).length, 37);
});
