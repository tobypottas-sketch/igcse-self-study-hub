// Unit 2 (Digital Life) · words 1–10 authored. Guards the contract with the real readiness evaluator and builders, so a content change that
// breaks a pathway for these ten words fails here. Words 11–20 have their own test file; words 21–50 are intentionally NOT authored and the unit stays a draft.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit2 from '../content/vocabulary/units/unit-02-draft.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';

const TERMS = ['entertainment', 'access', 'device', 'digital', 'streaming', 'relevant', 'educator', 'afford', 'essential', 'current affairs'];
const NO_FAMILY = ['device', 'current affairs'];
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit2) });
const first = unit2.items.slice(0, 10);
const failed = (pathwayId, occurrenceId) => STAGES.filter(stage => (readiness.pathways[pathwayId].stageFailures[stage] ?? []).some(f => f.occurrenceId === occurrenceId));

test('the first ten Unit 2 words are the agreed targets, and the unit is still an unreleased draft', () => {
  assert.deepEqual(first.map(item => item.term), TERMS);
  assert.equal(unit2.status, 'draft');
  assert.ok(!fs.existsSync(new URL('../content/vocabulary/releases/unit-02.js', import.meta.url)), 'Unit 2 must not be released yet');
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

test('words 21–50 are not authored yet; Unit 2 afford stays separate from Unit 1 afford', () => {
  for (const item of unit2.items.slice(20)) {
    const sense = item.senses[0];
    assert.ok(!sense.masteryPassages?.length && !sense.wordFamilyForms?.length && !sense.wrongParaphrases?.length, `${item.term} must not be authored yet`);
  }
  const authoredIds = new Set(unit2.items.slice(0, 20).map(item => item.vocabularyId));
  assert.ok(unit2.activities.every(activity => authoredIds.has(activity.activityData.linkedVocabularyIds[0])));
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
