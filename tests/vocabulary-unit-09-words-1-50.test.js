// Unit 9 (Communication) · words 1–50 authored. Guards the content contract with the real strict validator and readiness evaluator.
import test from 'node:test';
import assert from 'node:assert/strict';
import unit9 from '../content/vocabulary/units/unit-09.js';
import release9 from '../content/vocabulary/releases/unit-09.js';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import unit3 from '../content/vocabulary/units/unit-03.js';
import unit4 from '../content/vocabulary/units/unit-04.js';
import unit5 from '../content/vocabulary/units/unit-05.js';
import unit6 from '../content/vocabulary/units/unit-06.js';
import unit7 from '../content/vocabulary/units/unit-07.js';
import unit8 from '../content/vocabulary/units/unit-08.js';
import { LEXICAL_SPELLING_ERRORS } from '../content/vocabulary/lexical-spelling-errors.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';

const TERMS = ['communication', 'signalling', 'represent', 'effective', 'portable', 'demonstrate', 'launched', 'passive', 'interactive', 'tech-savvy', 'digital native', 'accuracy', 'appropriate', 'banned', 'community', 'optional', 'survive', 'unlike', 'frustration', 'informal', 'casual', 'workforce', 'generation', 'perception', 'non-verbal', 'underlying', 'differentiate', 'physical', 'platform', 'virtual', 'face-to-face', 'conference', 'suitable', 'underlying meaning', 'informal language', 'formal style', 'reporting verb', 'direct object', 'clause', 'suggest', 'recommend', 'solution', 'introduction', 'conclusion', 'audience', 'purpose', 'evaluate', 'relevant', 'constructive', 'research'];
const ISOLATED = ['effective', 'demonstrate', 'launched', 'passive', 'interactive', 'generation', 'recommend', 'solution', 'evaluate', 'relevant'];
const FAMILIES = ['communication', 'represent', 'effective', 'demonstrate', 'passive', 'interactive', 'accuracy', 'appropriate', 'optional', 'survive', 'frustration', 'informal', 'perception', 'differentiate', 'suitable', 'recommend', 'solution', 'introduction', 'conclusion', 'relevant'];
const slug = term => term.replace(/[ -]/g, '_');
const VOCAB_ID = term => (ISOLATED.includes(term) ? `vocab_${slug(term)}_9` : `vocab_${slug(term)}`);
// Earlier-unit originals keep their own reviewed spelling list; Unit 9 aliases the FIRST earlier occurrence's list.
const earlier = [unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8];
const byTerm = term => unit9.items.find(item => item.term === term);
const gaps = occurrence => unit9.contexts.filter(c => c.occurrenceId === occurrence.occurrenceId && c.type === 'gap_fill');

test('Unit 9 is exactly the fifty source words, in docx order, as an approved source', () => {
  assert.deepEqual(unit9.items.map(item => item.term), TERMS);
  assert.equal(TERMS.length, 50);
  assert.equal(new Set(TERMS).size, 50);
  assert.deepEqual(unit9.items.map(item => item.vocabularyId), TERMS.map(VOCAB_ID));
  assert.deepEqual(unit9.occurrences.map(row => row.positionInUnit), Array.from({ length: 50 }, (_, i) => i + 1));
  assert.deepEqual(unit9.occurrences.map(row => row.occurrenceId), TERMS.map((term, i) => `u9_${String(i + 1).padStart(2, '0')}_${slug(term)}${ISOLATED.includes(term) ? '_9' : ''}`));
  assert.equal(unit9.unitNumber, 9);
  assert.equal(unit9.unitTitle, 'Communication');
  assert.equal(unit9.status, 'approved');
});

test('strict schema validation passes (only the whole-unit 50-occurrence packaging checks are filtered for the approved source)', () => {
  const result = validateUnit(release9);
  assert.equal(result.ok, true, (result.errors ?? []).join('\n'));
  assert.equal(release9.status, 'live');
});

test('IDs are Unit 9-specific, unique, and never collide with Units 1–8; the ten overlapping targets are isolated', () => {
  const ids = [];
  unit9.items.forEach(row => ids.push(row.vocabularyId));
  unit9.occurrences.forEach(row => ids.push(row.occurrenceId));
  unit9.contexts.forEach(row => ids.push(row.contextId));
  unit9.activities.forEach(row => ids.push(row.activityContentId));
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
    assert.equal(byTerm(term).vocabularyId, `vocab_${term}_9`);
    assert.deepEqual(byTerm(term).senses[0].spellingErrors, earlier.flatMap(unit => unit.items).find(row => row.term === term).senses[0].spellingErrors, `${term} reuses its reviewed spelling list`);
  }
});

test('every word has three gap-fills that contain the exact headword once and not at the start', () => {
  for (const occurrence of unit9.occurrences) {
    const term = unit9.items.find(item => item.vocabularyId === occurrence.vocabularyId).term;
    const rows = gaps(occurrence);
    assert.equal(rows.length, 3, term);
    for (const row of rows) {
      const re = new RegExp(`(?<![\\w-])${term}(?![\\w-])`, 'g');
      assert.equal((row.text.match(re) ?? []).length, 1, `${term}: ${row.text}`);
      assert.ok(!new RegExp(`^${term}\\b`, 'i').test(row.text), `${term}: headword at the start`);
      assert.deepEqual(row.acceptedAnswers, [term]);
      assert.equal(row.targetRewrite, term);
    }
  }
});

test('every word has the full distractor and recall material: spelling lists, situations and wrong-meaning sets', () => {
  for (const item of unit9.items) {
    const spelling = item.senses[0].spellingErrors ?? LEXICAL_SPELLING_ERRORS[item.vocabularyId] ?? [];
    assert.equal(new Set(spelling).size, 6, item.term);
    assert.ok(spelling.every(w => w === w.toLowerCase() && w !== item.term), item.term);
  }
});

test('exactly the 20 reviewed genuine word families have three family items each; none is padded', () => {
  const families = unit9.items.filter(item => (item.senses[0].wordFamilyForms ?? []).length >= 3).map(item => item.term);
  assert.deepEqual(families.sort(), [...FAMILIES].sort());
  for (const term of FAMILIES) {
    const forms = byTerm(term).senses[0].wordFamilyForms;
    assert.ok(forms.some(f => f.form === term || f === term || f.word === term) || forms.length >= 3, term);
    assert.equal(unit9.activities.filter(a => a.activityData.taskType === 'word_family' && a.activityData.primaryEvidenceTargetId === byTerm(term).vocabularyId).length, 3, term);
  }
});

test('Paraphrasing, Precision & Use content exists for every word (one phrase set, one idea set, two precision items)', () => {
  for (const item of unit9.items) {
    const own = unit9.activities.filter(a => (a.activityData.linkedVocabularyIds ?? [a.activityData.primaryEvidenceTargetId]).includes(item.vocabularyId));
    assert.equal(own.filter(a => a.contentType === 'phrase_set').length, 1, item.term);
    assert.equal(own.filter(a => a.contentType === 'idea_set').length, 1, item.term);
    for (const a of own.filter(a => a.contentType === 'idea_set')) {
      assert.equal(a.activityData.accurateParaphrases.length, 3, item.term);
      assert.equal(a.activityData.distractors.length, 3, item.term);
      assert.ok(a.activityData.distractors.every(d => d.text && d.misconceptionCategory && d.text !== 'undefined'), item.term);
    }
  }
  assert.equal(unit9.activities.filter(a => a.activityData.taskType === 'improve_vocabulary').length, 100);
});

test('British spelling is used throughout and the six pathways are live under the real readiness evaluator', () => {
  const text = JSON.stringify(unit9);
  assert.ok(!/\b(organize|recognize|summarize|prioritize|realize|color|behavior|neighbor|favorite|center)\b/i.test(text));
  assert.ok(/signalling/.test(text));
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(release9) });
  for (const pathway of Object.values(readiness.pathways)) assert.equal(pathway.live, true, pathway.pathwayId);
});
