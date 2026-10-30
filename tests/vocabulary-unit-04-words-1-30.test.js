// Unit 4 (Transport) · words 1–30 authored (batches 1–3, draft). Guards the contract with the real readiness evaluator and builders. Words 31–50 are not
// authored yet, so the unit stays a draft: no releases/unit-04.js, no lock, no SQL.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit4 from '../content/vocabulary/units/unit-04-draft.js';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import unit3 from '../content/vocabulary/units/unit-03.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';

const TERMS = ['breathtaking', 'comfort', 'reality', 'toughest', 'storeys', 'accommodate', 'luxury', 'altitude', 'landscape', 'passenger', 'engineer', 'pilot', 'airship', 'launch', 'height', 'anxious', 'vehicle', 'pollution', 'destination', 'spacious', 'efficiently', 'demand', 'invention', 'machinery', 'advertisement', 'enormous', 'equipment', 'collision', 'organisation', 'participant'];
const NO_FAMILY = ['breathtaking', 'toughest', 'storeys', 'accommodate', 'altitude', 'landscape', 'passenger', 'engineer', 'pilot', 'airship', 'launch', 'height', 'vehicle', 'destination', 'spacious', 'demand', 'machinery', 'enormous', 'collision'];
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
// Same-part-of-speech pools: the five adjectives (breathtaking, toughest, anxious, spacious, enormous) support each other. The two verbs (accommodate,
// launch) and the lone adverb (efficiently) are still short of the three same-POS words the contract needs; no new verb arrived in words 21–30.
const POS_LIMITS = { accommodate: { meaning: ['match'], context: ['recognise', 'apply', 'recall'] }, launch: { meaning: ['match'], context: ['recognise', 'apply', 'recall'] }, efficiently: { meaning: ['match'], context: ['recognise', 'apply', 'recall'] } };
const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit4) });
const failed = (pathwayId, occurrenceId) => STAGES.filter(stage => (readiness.pathways[pathwayId].stageFailures[stage] ?? []).some(f => f.occurrenceId === occurrenceId));

test('Unit 4 batches 1–3 is exactly the thirty locked targets, as a draft with no release artefacts', () => {
  assert.deepEqual(unit4.items.map(item => item.term), TERMS);
  assert.equal(unit4.occurrences.length, 30);
  assert.equal(new Set(unit4.items.map(item => item.term)).size, 30);
  assert.equal(unit4.status, 'draft');
  assert.equal(unit4.unitNumber, 4);
  for (const name of ['releases/unit-04.js']) assert.ok(!fs.existsSync(new URL(`../content/vocabulary/${name}`, import.meta.url)), name);
});

test('IDs are Unit 4-specific, unique, and never collide with Units 1, 2 or 3', () => {
  const ids = [];
  unit4.items.forEach(row => ids.push(row.vocabularyId));
  unit4.occurrences.forEach(row => ids.push(row.occurrenceId));
  unit4.contexts.forEach(row => ids.push(row.contextId));
  unit4.activities.forEach(row => ids.push(row.activityContentId));
  assert.equal(new Set(ids).size, ids.length, 'duplicate ID inside Unit 4');
  const others = new Set();
  for (const unit of [unit1, unit2, unit3]) {
    unit.items.forEach(row => others.add(row.vocabularyId));
    unit.occurrences.forEach(row => others.add(row.occurrenceId));
    unit.contexts.forEach(row => others.add(row.contextId));
    unit.activities.forEach(row => others.add(row.activityContentId));
  }
  assert.deepEqual(ids.filter(id => others.has(id)), []);
  assert.ok(unit4.occurrences.every(row => /^u4_\d{2}_/.test(row.occurrenceId)));
  assert.ok(unit4.activities.every(row => /^u4_/.test(row.activityContentId) && row.unitNumber === 4));
});

test('every pathway stage is buildable for words 1–30, except the documented Word Family and same-POS pool limits', () => {
  for (const occurrence of unit4.occurrences) {
    const term = unit4.items.find(item => item.vocabularyId === occurrence.vocabularyId).term;
    for (const pathwayId of Object.keys(readiness.pathways)) {
      let expected = [];
      if (pathwayId === 'word_families' && NO_FAMILY.includes(term)) expected = STAGES;
      else if (POS_LIMITS[term]?.[pathwayId]) expected = POS_LIMITS[term][pathwayId];
      assert.deepEqual(failed(pathwayId, occurrence.occurrenceId), expected, `${term} / ${pathwayId}`);
    }
  }
});

test('words 1–30 satisfy the strict (approved) content schema; only whole-unit count rules remain', () => {
  const approve = row => ({ ...row, status: 'approved' });
  const strict = { ...unit4, status: 'approved', items: unit4.items.map(approve), occurrences: unit4.occurrences.map(approve), contexts: unit4.contexts.map(approve), activities: unit4.activities.map(approve) };
  const errors = validateUnit(strict).errors;
  assert.deepEqual(errors.filter(error => !/exactly 50 occurrences|exactly ten targets/.test(error)), []);
});

test('gap-fill: target inside the blankable sentence (not first), three distinct wrong options that never equal the answer', () => {
  for (const item of unit4.items) {
    const sense = item.senses[0];
    const gapContexts = unit4.contexts.filter(c => c.vocabularyId === item.vocabularyId && /_gap_/.test(c.contextId));
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
  for (const item of unit4.items) {
    const rows = item.senses[0].situationDistractors;
    assert.ok(new Set(rows).size >= 4, item.term);
    const stem = item.term.slice(0, Math.max(4, item.term.length - 3)).toLowerCase();
    for (const row of rows) assert.ok(!row.toLowerCase().includes(stem), `${item.term}: ${row}`);
  }
});

test('Word Families: only genuine families are authored, each with >=3 forms, >=2 parts of speech and alternates; the nineteen others are left unavailable', () => {
  for (const item of unit4.items) {
    const forms = item.senses[0].wordFamilyForms;
    if (NO_FAMILY.includes(item.term)) {
      assert.deepEqual(item.wordFamily, [], item.term);
      assert.ok(!forms?.length, item.term);
    } else {
      assert.ok(forms.length >= 3 && new Set(forms.map(f => f.partOfSpeech)).size >= 2, item.term);
      assert.ok(forms.some(f => f.form === item.term), `${item.term} headword present`);
      if (forms.length === 3) assert.ok(forms.filter(f => f.form !== item.term).every(f => f.altExample), `${item.term} alternates`);
    }
  }
  const familyItems = unit4.activities.filter(a => a.activityData.taskType === 'word_family');
  assert.equal(familyItems.length, 33);
  assert.ok(familyItems.every(a => a.activityData.sourceText.split('____').length === 2 && !a.activityData.sourceText.startsWith('____')));
});

test('Mastery sentences never begin with the target and Unit 1/2 sources are untouched by Unit 4', () => {
  for (const item of unit4.items) for (const ctx of item.senses[0].masteryContexts) assert.ok(!ctx.text.toLowerCase().startsWith(item.term.toLowerCase()), item.term);
  assert.equal(unit1.status, 'approved');
  assert.equal(unit2.status, 'approved');
  assert.equal(unit2.occurrences.length, 50);
  assert.equal(unit3.status, 'approved');
  assert.equal(unit3.occurrences.length, 50);
});

test('duplicate lexical terms are isolated as Unit 4 items and never reuse or touch an earlier-unit ID', () => {
  const isolated = { demand: unit1, advertisement: unit3, equipment: unit2, participant: unit3 };
  const expected = {
    demand: ['vocab_demand_4', 'u4_22_demand_4'],
    advertisement: ['vocab_advertisement_4', 'u4_25_advertisement_4'],
    equipment: ['vocab_equipment_4', 'u4_27_equipment_4'],
    participant: ['vocab_participant_4', 'u4_30_participant_4']
  };
  for (const [term, earlier] of Object.entries(isolated)) {
    const item = unit4.items.find(row => row.term === term);
    const occurrence = unit4.occurrences.find(row => row.vocabularyId === item.vocabularyId);
    assert.deepEqual([item.vocabularyId, occurrence.occurrenceId], expected[term], term);
    const earlierItem = earlier.items.find(row => row.term === term);
    assert.ok(earlierItem, `${term} exists in an earlier unit`);
    assert.notEqual(item.vocabularyId, earlierItem.vocabularyId, term);
    // Every Unit 4 record linked to the word points at the _4 id, never at the earlier id.
    for (const activity of unit4.activities) assert.ok(!(activity.activityData.linkedVocabularyIds ?? []).includes(earlierItem.vocabularyId), `${term}: ${activity.activityContentId}`);
    // Family content belongs to the Unit 4 target only.
    for (const form of item.senses[0].wordFamilyForms ?? []) assert.ok(form.form && form.example, term);
    assert.deepEqual(unit4.lexicalSpelling?.[item.vocabularyId] ?? unit4.items.find(row => row.vocabularyId === item.vocabularyId).senses[0].spellingErrors, earlierItem.senses[0].spellingErrors, `${term} shares the reviewed spelling list`);
  }
  assert.equal(unit4.items.filter(row => row.term === 'organisation').length, 1);
  assert.ok(unit4.items.some(row => row.term === 'organisation' && !row.term.includes('z')), 'British spelling organisation');
  assert.ok(!unit4.items.some(row => /organization/i.test(row.term)));
});
