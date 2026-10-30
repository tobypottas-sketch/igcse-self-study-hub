// Unit 3 (Food) · words 1–10 authored (batch 1, draft). Guards the contract with the real readiness evaluator and builders. Words 11–50 are not
// authored yet, so the unit stays a draft: no releases/unit-03.js, no lock, no SQL.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit3 from '../content/vocabulary/units/unit-03-draft.js';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';

const TERMS = ['participant', 'outlet', 'sprinkled', 'underestimate', 'considerably', 'guaranteed', 'harmless', 'pressure', 'fooled', 'majority'];
const NO_FAMILY = ['outlet', 'considerably', 'guaranteed', 'pressure', 'fooled', 'majority'];
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
// Same-part-of-speech pools: the lone adjective (harmless) and lone adverb (considerably) cannot build Meaning Match / Context Recognise,
// Apply and Recall until more same-POS words are authored. This is a structural contract limit, not a content gap.
const POS_LIMITS = { considerably: { meaning: ['match'], context: ['recognise', 'apply', 'recall'] }, harmless: { meaning: ['match'], context: ['recognise', 'apply', 'recall'] } };
const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit3) });
const failed = (pathwayId, occurrenceId) => STAGES.filter(stage => (readiness.pathways[pathwayId].stageFailures[stage] ?? []).some(f => f.occurrenceId === occurrenceId));

test('Unit 3 batch 1 is exactly the ten locked targets, as a draft with no release artefacts', () => {
  assert.deepEqual(unit3.items.map(item => item.term), TERMS);
  assert.equal(unit3.occurrences.length, 10);
  assert.equal(unit3.status, 'draft');
  assert.equal(unit3.unitNumber, 3);
  for (const name of ['releases/unit-03.js']) assert.ok(!fs.existsSync(new URL(`../content/vocabulary/${name}`, import.meta.url)), name);
});

test('IDs are Unit 3-specific, unique, and never collide with Units 1 or 2', () => {
  const ids = [];
  unit3.items.forEach(row => ids.push(row.vocabularyId));
  unit3.occurrences.forEach(row => ids.push(row.occurrenceId));
  unit3.contexts.forEach(row => ids.push(row.contextId));
  unit3.activities.forEach(row => ids.push(row.activityContentId));
  assert.equal(new Set(ids).size, ids.length, 'duplicate ID inside Unit 3');
  const others = new Set();
  for (const unit of [unit1, unit2]) {
    unit.items.forEach(row => others.add(row.vocabularyId));
    unit.occurrences.forEach(row => others.add(row.occurrenceId));
    unit.contexts.forEach(row => others.add(row.contextId));
    unit.activities.forEach(row => others.add(row.activityContentId));
  }
  assert.deepEqual(ids.filter(id => others.has(id)), []);
  assert.ok(unit3.occurrences.every(row => /^u3_\d{2}_/.test(row.occurrenceId)));
  assert.ok(unit3.activities.every(row => /^u3_/.test(row.activityContentId) && row.unitNumber === 3));
});

test('every pathway stage is buildable for words 1–10, except the documented Word Family and same-POS pool limits', () => {
  for (const occurrence of unit3.occurrences) {
    const term = unit3.items.find(item => item.vocabularyId === occurrence.vocabularyId).term;
    for (const pathwayId of Object.keys(readiness.pathways)) {
      let expected = [];
      if (pathwayId === 'word_families' && NO_FAMILY.includes(term)) expected = STAGES;
      else if (POS_LIMITS[term]?.[pathwayId]) expected = POS_LIMITS[term][pathwayId];
      assert.deepEqual(failed(pathwayId, occurrence.occurrenceId), expected, `${term} / ${pathwayId}`);
    }
  }
});

test('words 1–10 satisfy the strict (approved) content schema; only whole-unit count rules remain', () => {
  const approve = row => ({ ...row, status: 'approved' });
  const strict = { ...unit3, status: 'approved', items: unit3.items.map(approve), occurrences: unit3.occurrences.map(approve), contexts: unit3.contexts.map(approve), activities: unit3.activities.map(approve) };
  const errors = validateUnit(strict).errors;
  assert.deepEqual(errors.filter(error => !/exactly 50 occurrences|exactly ten targets/.test(error)), []);
});

test('gap-fill: target inside the blankable sentence (not first), three distinct wrong options that never equal the answer', () => {
  for (const item of unit3.items) {
    const sense = item.senses[0];
    const gapContexts = unit3.contexts.filter(c => c.vocabularyId === item.vocabularyId && /_gap_/.test(c.contextId));
    assert.equal(gapContexts.length, 3, item.term);
    for (const context of gapContexts) assert.ok(!context.text.toLowerCase().startsWith(context.acceptedAnswers?.[0]?.toLowerCase() ?? item.term), `${item.term} gap starts the sentence`);
    assert.ok(sense.gapDistractors.length >= 3, item.term);
    for (const gap of sense.gapDistractors) {
      const options = gap.wrong ?? gap.distractors ?? [];
      assert.equal(new Set(options).size, options.length, `${item.term} duplicate wrong options`);
      assert.ok(options.length >= 3 && !options.includes(gap.answer), item.term);
    }
  }
});

test('wrong situations: at least four distinct, target-free situations per word', () => {
  for (const item of unit3.items) {
    const rows = item.senses[0].situationDistractors;
    assert.ok(new Set(rows).size >= 4, item.term);
    const stem = item.term.slice(0, Math.max(4, item.term.length - 3)).toLowerCase();
    for (const row of rows) assert.ok(!row.toLowerCase().includes(stem), `${item.term}: ${row}`);
  }
});

test('Word Families: only genuine families are authored, each with >=3 forms, >=2 parts of speech and alternates; the six others are left unavailable', () => {
  for (const item of unit3.items) {
    const forms = item.senses[0].wordFamilyForms;
    if (NO_FAMILY.includes(item.term)) {
      assert.deepEqual(item.wordFamily, [], item.term);
      assert.ok(!forms?.length, item.term);
    } else {
      assert.ok(forms.length >= 3 && new Set(forms.map(f => f.partOfSpeech)).size >= 2, item.term);
      assert.ok(forms.some(f => f.form === item.term), `${item.term} headword present`);
      assert.ok(forms.filter(f => f.form !== item.term).every(f => f.altExample), `${item.term} alternates`);
    }
  }
  const familyItems = unit3.activities.filter(a => a.activityData.taskType === 'word_family');
  assert.equal(familyItems.length, 12);
  assert.ok(familyItems.every(a => a.activityData.sourceText.split('____').length === 2 && !a.activityData.sourceText.startsWith('____')));
});

test('Mastery sentences never begin with the target and Unit 1/2 sources are untouched by Unit 3', () => {
  for (const item of unit3.items) for (const ctx of item.senses[0].masteryContexts) assert.ok(!ctx.text.toLowerCase().startsWith(item.term.toLowerCase()), item.term);
  assert.equal(unit1.status, 'approved');
  assert.equal(unit2.status, 'approved');
  assert.equal(unit2.occurrences.length, 50);
});
