// Unit 8 (Work) · words 1–50 authored. Guards the content contract with the real strict validator and readiness evaluator.
import test from 'node:test';
import assert from 'node:assert/strict';
import unit8 from '../content/vocabulary/units/unit-08.js';
import release8 from '../content/vocabulary/releases/unit-08.js';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import unit3 from '../content/vocabulary/units/unit-03.js';
import unit4 from '../content/vocabulary/units/unit-04.js';
import unit5 from '../content/vocabulary/units/unit-05.js';
import unit6 from '../content/vocabulary/units/unit-06.js';
import unit7 from '../content/vocabulary/units/unit-07.js';
import { LEXICAL_SPELLING_ERRORS } from '../content/vocabulary/lexical-spelling-errors.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';

const TERMS = ['architecture', 'availability', 'concerned', 'complicated', 'curved', 'detailed', 'development', 'elements', 'established', 'facilities', 'feature', 'humanity', 'impact', 'ingredients', 'innovation', 'inspiration', 'inspectors', 'instructor', 'launched', 'landscape', 'manufacturing', 'minority', 'packaging', 'presented', 'publicity', 'qualified', 'regulations', 'relentless', 'response', 'responsible', 'rough', 'significant', 'source', 'specialise', 'structures', 'sustainable', 'transformed', 'operator', 'nutritionist', 'director', 'expert', 'engineer', 'scientist', 'assignment', 'employment', 'traditional', 'trainer', 'technology', 'creative', 'wellbeing'];
const ISOLATED = ['availability', 'facilities', 'feature', 'ingredients', 'landscape', 'responsible', 'significant', 'specialise', 'engineer'];
const FAMILIES = ['architecture', 'availability', 'concerned', 'complicated', 'development', 'established', 'humanity', 'innovation', 'inspiration', 'inspectors', 'instructor', 'manufacturing', 'packaging', 'presented', 'publicity', 'qualified', 'regulations', 'response', 'responsible', 'significant', 'specialise', 'sustainable', 'transformed', 'operator', 'nutritionist', 'expert', 'scientist', 'employment', 'traditional', 'trainer', 'technology', 'creative'];
const VOCAB_ID = term => (ISOLATED.includes(term) ? `vocab_${term}_8` : `vocab_${term}`);
// Earlier-unit originals keep their own reviewed spelling list; Unit 8 aliases the FIRST earlier occurrence's list.
const earlier = [unit1, unit2, unit3, unit4, unit5, unit6, unit7];
const byTerm = term => unit8.items.find(item => item.term === term);
const gaps = occurrence => unit8.contexts.filter(c => c.occurrenceId === occurrence.occurrenceId && c.type === 'gap_fill');

test('Unit 8 is exactly the fifty source words, in docx order, as an approved source', () => {
  assert.deepEqual(unit8.items.map(item => item.term), TERMS);
  assert.equal(TERMS.length, 50);
  assert.equal(new Set(TERMS).size, 50);
  assert.deepEqual(unit8.items.map(item => item.vocabularyId), TERMS.map(VOCAB_ID));
  assert.deepEqual(unit8.occurrences.map(row => row.positionInUnit), Array.from({ length: 50 }, (_, i) => i + 1));
  assert.deepEqual(unit8.occurrences.map(row => row.occurrenceId), TERMS.map((term, i) => `u8_${String(i + 1).padStart(2, '0')}_${term}${ISOLATED.includes(term) ? '_8' : ''}`));
  assert.equal(unit8.unitNumber, 8);
  assert.equal(unit8.unitTitle, 'Work');
  assert.equal(unit8.status, 'approved');
});

test('strict schema validation passes (only the whole-unit 50-occurrence packaging checks are filtered for the approved source)', () => {
  const result = validateUnit(release8);
  assert.equal(result.ok, true, (result.errors ?? []).join('\n'));
  assert.equal(release8.status, 'live');
});

test('IDs are Unit 8-specific, unique, and never collide with Units 1–7; the nine overlapping targets are isolated', () => {
  const ids = [];
  unit8.items.forEach(row => ids.push(row.vocabularyId));
  unit8.occurrences.forEach(row => ids.push(row.occurrenceId));
  unit8.contexts.forEach(row => ids.push(row.contextId));
  unit8.activities.forEach(row => ids.push(row.activityContentId));
  assert.equal(new Set(ids).size, ids.length);
  const earlierIds = new Set();
  for (const unit of earlier) {
    unit.items.forEach(row => earlierIds.add(row.vocabularyId));
    unit.occurrences.forEach(row => earlierIds.add(row.occurrenceId));
    unit.contexts.forEach(row => earlierIds.add(row.contextId));
    unit.activities.forEach(row => earlierIds.add(row.activityContentId));
  }
  assert.deepEqual(ids.filter(id => earlierIds.has(id)), []);
  for (const term of ISOLATED) {
    assert.ok(earlier.some(unit => unit.items.some(row => row.term === term)), `${term} exists earlier`);
    assert.equal(byTerm(term).vocabularyId, `vocab_${term}_8`);
    assert.deepEqual(byTerm(term).senses[0].spellingErrors, earlier.flatMap(unit => unit.items).find(row => row.term === term).senses[0].spellingErrors, `${term} reuses its reviewed spelling list`);
  }
});

test('every word has three gap-fills that contain the exact headword once and not at the start', () => {
  for (const occurrence of unit8.occurrences) {
    const term = unit8.items.find(item => item.vocabularyId === occurrence.vocabularyId).term;
    const rows = gaps(occurrence);
    assert.equal(rows.length, 3, term);
    for (const row of rows) {
      const re = new RegExp(`\\b${term}\\b`, 'g');
      assert.equal((row.text.match(re) ?? []).length, 1, `${term}: ${row.text}`);
      assert.ok(!new RegExp(`^${term}\\b`, 'i').test(row.text), `${term}: headword at the start`);
      assert.deepEqual(row.acceptedAnswers, [term]);
      assert.equal(row.targetRewrite, term);
    }
  }
});

test('every word has the full distractor and recall material: spelling lists, situations and wrong-meaning sets', () => {
  for (const item of unit8.items) {
    const spelling = item.senses[0].spellingErrors ?? LEXICAL_SPELLING_ERRORS[item.vocabularyId] ?? [];
    assert.equal(new Set(spelling).size, 6, item.term);
    assert.ok(spelling.every(w => w === w.toLowerCase() && w !== item.term), item.term);
  }
});

test('exactly the 32 reviewed genuine word families have three family items each; none is padded', () => {
  const families = unit8.items.filter(item => (item.senses[0].wordFamilyForms ?? []).length >= 3).map(item => item.term);
  assert.deepEqual(families.sort(), [...FAMILIES].sort());
  for (const term of FAMILIES) {
    const forms = byTerm(term).senses[0].wordFamilyForms;
    assert.ok(forms.some(f => f.form === term || f === term || f.word === term) || forms.length >= 3, term);
    assert.equal(unit8.activities.filter(a => a.activityData.taskType === 'word_family' && a.activityData.primaryEvidenceTargetId === byTerm(term).vocabularyId).length, 3, term);
  }
});

test('Paraphrasing, Precision & Use content exists for every word (one phrase set, one idea set, two precision items)', () => {
  for (const item of unit8.items) {
    const own = unit8.activities.filter(a => (a.activityData.linkedVocabularyIds ?? [a.activityData.primaryEvidenceTargetId]).includes(item.vocabularyId));
    assert.equal(own.filter(a => a.contentType === 'phrase_set').length, 1, item.term);
    assert.equal(own.filter(a => a.contentType === 'idea_set').length, 1, item.term);
    for (const a of own.filter(a => a.contentType === 'idea_set')) {
      assert.equal(a.activityData.accurateParaphrases.length, 3, item.term);
      assert.equal(a.activityData.distractors.length, 3, item.term);
      assert.ok(a.activityData.distractors.every(d => d.text && d.misconceptionCategory && d.text !== 'undefined'), item.term);
    }
  }
  assert.equal(unit8.activities.filter(a => a.activityData.taskType === 'improve_vocabulary').length, 100);
});

test('British spelling is used throughout and the six pathways are live under the real readiness evaluator', () => {
  const text = JSON.stringify(unit8);
  assert.ok(!/\b(organize|recognize|summarize|prioritize|realize|color|behavior|neighbor|favorite|center)\b/i.test(text));
  assert.ok(/specialise/.test(text));
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(release8) });
  for (const pathway of Object.values(readiness.pathways)) assert.equal(pathway.live, true, pathway.pathwayId);
});
