// Unit 2 (Digital Life) · words 1–10 authored. Guards the contract with the real readiness evaluator and builders, so a content change that
// breaks a pathway for these ten words fails here. Words 11–50 have their own test files; all 50 are authored; the source unit is approved and releases/unit-02.js promotes it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit2 from '../content/vocabulary/units/unit-02.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';

const TERMS = ['entertainment', 'access', 'device', 'digital', 'streaming', 'relevant', 'educator', 'afford', 'essential', 'current affairs'];
const NO_FAMILY = ['device', 'current affairs'];
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit2) });
const first = unit2.items.slice(0, 10);
const failed = (pathwayId, occurrenceId) => STAGES.filter(stage => (readiness.pathways[pathwayId].stageFailures[stage] ?? []).some(f => f.occurrenceId === occurrenceId));

test('the first ten Unit 2 words are the agreed targets, and the source unit is approved (the live release is releases/unit-02.js)', () => {
  assert.deepEqual(first.map(item => item.term), TERMS);
  assert.equal(unit2.status, 'approved');
  assert.ok(fs.existsSync(new URL('../content/vocabulary/releases/unit-02.js', import.meta.url)), 'Unit 2 release file must exist');
});

test('every pathway stage is buildable for every word 1–10, except Word Families for the two words with no family', () => {
  for (const occurrence of unit2.occurrences.slice(0, 10)) {
    const term = first.find(item => item.vocabularyId === occurrence.vocabularyId).term;
    for (const pathwayId of Object.keys(readiness.pathways)) {
      const expected = pathwayId === 'word_families' && NO_FAMILY.includes(term) ? STAGES : [];
      assert.deepEqual(failed(pathwayId, occurrence.occurrenceId), expected, `${term} / ${pathwayId}`);
    }
  }
});

test('words 1–10 satisfy the strict (approved) content schema; only the unauthored words 11–50 still fail it', () => {
  const approve = row => ({ ...row, status: 'approved' });
  const strict = { ...unit2, status: 'approved', items: unit2.items.map(approve), occurrences: unit2.occurrences.map(approve), contexts: unit2.contexts.map(approve), activities: unit2.activities.map(approve) };
  const errors = validateUnit(strict).errors;
  const named = new Set(TERMS);
  assert.deepEqual(errors.filter(error => named.has(error.split(' situationDistractors')[0]) || /vocab_(entertainment|access|device|digital|streaming|relevant|educator|afford_2|essential|current_affairs)\b/.test(error)), []);
});

test('all 50 Unit 2 words are authored; Unit 2 afford stays separate from Unit 1 afford', () => {
  for (const item of unit2.items) {
    const sense = item.senses[0];
    assert.ok(sense.masteryPassages?.length && sense.wrongParaphrases?.length, `${item.term} must be authored`);
  }
  const ids = new Set(unit2.items.map(item => item.vocabularyId));
  assert.ok(unit2.activities.every(activity => ids.has(activity.activityData.linkedVocabularyIds[0])));
  assert.equal(first[7].vocabularyId, 'vocab_afford_2');
});

test('words with no normal derivative have no family rather than a forced one', () => {
  for (const term of NO_FAMILY) {
    const item = first.find(row => row.term === term);
    assert.deepEqual(item.wordFamily, []);
    assert.ok(!item.senses[0].wordFamilyForms?.length);
  }
  for (const term of TERMS.filter(t => !NO_FAMILY.includes(t))) {
    const forms = first.find(row => row.term === term).senses[0].wordFamilyForms;
    assert.ok(forms.length >= 3 && new Set(forms.map(f => f.partOfSpeech)).size >= 2, term);
  }
});
