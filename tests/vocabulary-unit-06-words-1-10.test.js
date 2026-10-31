// Unit 6 (Learning and Study Skills) · words 1–10 authored (batch 1, draft). Guards the contract with the real readiness evaluator and builders. Words 11–50 are not
// authored yet, so the unit stays a draft: no releases/unit-06.js, no lock, no SQL, no artwork.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit6 from '../content/vocabulary/units/unit-06-draft.js';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import unit3 from '../content/vocabulary/units/unit-03.js';
import unit4 from '../content/vocabulary/units/unit-04.js';
import unit5 from '../content/vocabulary/units/unit-05.js';
import { LEXICAL_SPELLING_ERRORS } from '../content/vocabulary/lexical-spelling-errors.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';

const TERMS = ['absorb', 'confidence', 'dilemma', 'dramatically', 'equivalent', 'overload', 'stagnate', 'engage', 'participate', 'passive'];
const FAMILIES = ['confidence', 'stagnate', 'engage', 'participate'];
const NO_FAMILY = TERMS.filter(term => !FAMILIES.includes(term));
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
// Same-POS pools: only 5 verbs, 2 nouns (confidence, dilemma), 2 adjectives (equivalent, passive) and 1 adverb (dramatically) are authored, so the
// non-verbs lack the 3 other same-POS targets that Meaning Match and Context Recognise / Apply / Recall need. `dramatically` is the only adverb in
// the whole locked Unit 6 list, so it is permanently held back from those stages rather than padded with invalid distractors.
const LIMITED = { meaning: ['match'], context: ['recognise', 'apply', 'recall'] };
const POS_LIMITS = Object.fromEntries(['confidence', 'dilemma', 'dramatically', 'equivalent', 'passive'].map(term => [term, LIMITED]));
const earlier = [unit1, unit2, unit3, unit4, unit5];
const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit6) });
const failed = (pathwayId, occurrenceId) => STAGES.filter(stage => (readiness.pathways[pathwayId].stageFailures[stage] ?? []).some(f => f.occurrenceId === occurrenceId));
const termOf = occurrence => unit6.items.find(item => item.vocabularyId === occurrence.vocabularyId).term;

test('Unit 6 batch 1 is exactly the ten locked targets, in order, as a draft with no release artefacts', () => {
  assert.deepEqual(unit6.items.map(item => item.term), TERMS);
  assert.deepEqual(unit6.occurrences.map(row => row.positionInUnit), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(unit6.occurrences.map(row => row.occurrenceId), ['u6_01_absorb', 'u6_02_confidence', 'u6_03_dilemma', 'u6_04_dramatically', 'u6_05_equivalent', 'u6_06_overload', 'u6_07_stagnate', 'u6_08_engage', 'u6_09_participate', 'u6_10_passive']);
  assert.deepEqual(unit6.items.map(row => row.vocabularyId), TERMS.map(term => `vocab_${term.replace(/ /g, '_')}`));
  assert.equal(unit6.unitNumber, 6);
  assert.equal(unit6.unitTitle, 'Learning and Study Skills');
  assert.equal(unit6.status, 'draft');
  for (const name of ['releases/unit-06.js', 'units/unit-06.js', 'units/unit-06.content-lock.json']) assert.ok(!fs.existsSync(new URL(`../content/vocabulary/${name}`, import.meta.url)), name);
  assert.ok(!fs.existsSync(new URL('../assets/vocabulary/units/unit-06.png', import.meta.url)), 'no artwork yet');
  assert.ok(!fs.existsSync(new URL('../docs/vocabulary-content-updates/unit-06-sync-chunk-1.sql', import.meta.url)), 'no SQL yet');
});

test('IDs are Unit 6-specific, unique, and never collide with Units 1–5; no exact earlier target is repeated', () => {
  const ids = [];
  unit6.items.forEach(row => ids.push(row.vocabularyId));
  unit6.occurrences.forEach(row => ids.push(row.occurrenceId));
  unit6.contexts.forEach(row => ids.push(row.contextId));
  unit6.activities.forEach(row => ids.push(row.activityContentId));
  assert.equal(new Set(ids).size, ids.length, 'duplicate ID inside Unit 6');
  const others = new Set();
  const earlierTerms = new Set();
  for (const unit of earlier) {
    unit.items.forEach(row => { others.add(row.vocabularyId); earlierTerms.add(row.term.toLowerCase()); });
    unit.occurrences.forEach(row => others.add(row.occurrenceId));
    unit.contexts.forEach(row => others.add(row.contextId));
    unit.activities.forEach(row => others.add(row.activityContentId));
  }
  assert.deepEqual(ids.filter(id => others.has(id)), []);
  assert.deepEqual(TERMS.filter(term => earlierTerms.has(term)), [], 'no exact earlier-unit target, so no _5 isolation is needed');
  assert.ok(unit6.items.every(row => !/_5$/.test(row.vocabularyId)));
  assert.ok(unit6.occurrences.every(row => /^u6_\d{2}_/.test(row.occurrenceId)));
  assert.ok(unit6.activities.every(row => /^u6_/.test(row.activityContentId) && row.unitNumber === 6));
});

test('no Unit 6 target is a word-family form of an earlier unit, and earlier-unit content is untouched', () => {
  const forms = new Set();
  for (const unit of earlier) for (const item of unit.items) for (const form of item.wordFamily ?? []) forms.add(String(form).toLowerCase());
  // `participate` is a listed family form of the Unit 3 / Unit 4 target `participant`, but it was never a target there, so it needs no ID isolation.
  assert.deepEqual(TERMS.filter(term => forms.has(term)), ['participate']);
  assert.ok(unit3.items.concat(unit4.items).some(row => row.term === 'participant'));
  assert.deepEqual(earlier.map(unit => unit.status), ['approved', 'approved', 'approved', 'approved', 'approved']);
  assert.deepEqual(earlier.map(unit => unit.occurrences.length), [50, 50, 50, 50, 50]);
});

test('every pathway stage is buildable for words 1–10, except the documented Word Family and same-POS pool limits', () => {
  for (const occurrence of unit6.occurrences) {
    const term = termOf(occurrence);
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
  const strict = { ...unit6, status: 'approved', items: unit6.items.map(approve), occurrences: unit6.occurrences.map(approve), contexts: unit6.contexts.map(approve), activities: unit6.activities.map(approve) };
  const errors = validateUnit(strict).errors;
  assert.deepEqual(errors.filter(error => !/exactly 50 occurrences|exactly ten targets/.test(error)), []);
});

test('gap-fill: target inside the blankable sentence (not first), three distinct wrong options that never equal the answer', () => {
  for (const item of unit6.items) {
    const sense = item.senses[0];
    const gapContexts = unit6.contexts.filter(c => c.vocabularyId === item.vocabularyId && /_gap_/.test(c.contextId));
    assert.equal(gapContexts.length, 3, item.term);
    for (const context of gapContexts) assert.ok(!context.text.toLowerCase().startsWith(item.term), `${item.term} gap starts the sentence`);
    assert.ok(sense.gapDistractors.length >= 3, item.term);
    for (const gap of sense.gapDistractors) {
      const options = gap.wrong ?? gap.distractors ?? [];
      assert.equal(new Set(options).size, options.length, `${item.term} duplicate wrong options`);
      assert.ok(options.length >= 3 && !options.includes(gap.answer), item.term);
    }
  }
});

test('wrong situations: at least four distinct, target-free situations per word', () => {
  for (const item of unit6.items) {
    const rows = item.senses[0].situationDistractors;
    assert.ok(new Set(rows).size >= 4, item.term);
    const stem = item.term.slice(0, Math.max(4, item.term.length - 3)).toLowerCase();
    for (const row of rows) assert.ok(!row.toLowerCase().includes(stem), `${item.term}: ${row}`);
  }
});

test('Word Families: only the four genuine families are authored; the six others are left unavailable rather than padded', () => {
  for (const item of unit6.items) {
    const forms = item.senses[0].wordFamilyForms;
    if (NO_FAMILY.includes(item.term)) {
      assert.deepEqual(item.wordFamily, [], item.term);
      assert.ok(!forms?.length, item.term);
    } else {
      assert.ok(forms.length >= 3 && new Set(forms.map(f => f.partOfSpeech)).size >= 2, item.term);
      assert.ok(forms.some(f => f.form === item.term), `${item.term} headword present`);
      for (const form of forms) {
        assert.equal(form.example.split(form.form).length - 1, 1, `${form.form} appears exactly once in its example`);
        assert.ok(!form.example.startsWith(form.form[0].toUpperCase() + form.form.slice(1)), `${form.form} does not open its example`);
      }
      if (forms.length === 3) assert.ok(forms.filter(f => f.form !== item.term).every(f => f.altExample), `${item.term} alternates`);
    }
  }
  const familyItems = unit6.activities.filter(a => a.activityData.taskType === 'word_family');
  assert.equal(familyItems.length, 12);
  assert.ok(familyItems.every(a => a.activityData.sourceText.split('____').length === 2 && !a.activityData.sourceText.startsWith('____')));
});

test('Mastery sentences never begin with the target, and mastery passages have one gap and never repeat the target', () => {
  for (const item of unit6.items) {
    for (const ctx of item.senses[0].masteryContexts) assert.ok(!ctx.text.toLowerCase().startsWith(item.term), item.term);
    for (const passage of item.senses[0].masteryPassages ?? []) {
      assert.equal(passage.text.split('____').length, 2, `${item.term} one gap`);
      assert.ok(!passage.text.startsWith('____'), item.term);
      assert.equal(passage.answer, item.term);
      assert.ok(!passage.text.toLowerCase().includes(item.term), `${item.term} leaks inside its own passage`);
    }
  }
});

test('Spelling & Recall: six distinct, lower-case, wrong spellings for every target (multi-word targets keep the full phrase)', () => {
  for (const item of unit6.items) {
    const errors = LEXICAL_SPELLING_ERRORS[item.vocabularyId];
    assert.equal(errors.length, 6, item.term);
    assert.equal(new Set(errors).size, 6, item.term);
    for (const error of errors) {
      assert.notEqual(error, item.term);
      assert.equal(error, error.toLowerCase());
      if (item.term.includes(' ')) assert.equal(error.split(' ').length, 2, `${item.term}: ${error} keeps both words`);
    }
  }
  for (const item of unit6.items) assert.ok(!LEXICAL_SPELLING_ERRORS[item.vocabularyId].includes(item.term));
});

test('no target leakage in paraphrases and no repeated sentences inside the batch or against Units 1–5', () => {
  const stemOf = term => term.split(' ').map(word => word.slice(0, Math.max(5, word.length - 3)).toLowerCase());
  for (const activity of unit6.activities) {
    const data = activity.activityData;
    if (activity.contentType === 'idea_set') {
      const linked = unit6.items.find(item => item.vocabularyId === data.linkedVocabularyIds[0]);
      for (const text of data.accurateParaphrases) for (const stem of stemOf(linked.term)) assert.ok(!text.toLowerCase().includes(stem), `${linked.term} leaks in "${text}"`);
    }
  }
  for (const item of unit6.items) {
    const sense = item.senses[0];
    for (const text of [...sense.acceptedParaphrases, sense.paraphraseSentence ?? '', sense.productionSentence ?? '']) {
      for (const stem of stemOf(item.term)) assert.ok(!String(text).toLowerCase().includes(stem), `${item.term} leaks in "${text}"`);
    }
  }
  const sentences = [];
  for (const context of unit6.contexts) sentences.push(context.text);
  for (const item of unit6.items) for (const context of item.senses[0].masteryContexts) sentences.push(context.text);
  for (const activity of unit6.activities) if (activity.activityData.sourceText) sentences.push(activity.activityData.sourceText);
  const lower = sentences.map(text => text.trim().toLowerCase());
  assert.equal(new Set(lower).size, lower.length, 'a sentence is repeated inside Unit 6');
  const earlierSentences = new Set();
  for (const unit of earlier) {
    for (const context of unit.contexts) earlierSentences.add(context.text.trim().toLowerCase());
    for (const item of unit.items) for (const context of item.senses[0].masteryContexts ?? []) earlierSentences.add(context.text.trim().toLowerCase());
  }
  assert.deepEqual(lower.filter(text => earlierSentences.has(text)), []);
});

test('British English and sense boundaries: no US spellings; "dramatically" stays an adverb; "overload" is a study sense', () => {
  const text = JSON.stringify(unit6).toLowerCase();
  assert.doesNotMatch(text, /\b(traveling|organized|organize|prioritize|summarize|memorize|behavior|color|center)\b/);
  assert.equal(unit6.items.find(i => i.term === 'dramatically').partOfSpeech ?? unit6.items.find(i => i.term === 'dramatically').senses[0].partOfSpeech, 'adverb');
  const engage = unit6.items.find(i => i.term === 'engage').senses[0];
  assert.doesNotMatch(JSON.stringify([engage.meaning, engage.masteryContexts, engage.acceptedParaphrases]).toLowerCase(), /\bhire|engaged to|wedding|marry/);
});

test('Precision & Use: two items per word, weak wording once and not first, accepted answers never in the distractors', () => {
  const rows = unit6.activities.filter(a => a.activityData.taskType === 'improve_vocabulary');
  assert.equal(rows.length, 20);
  for (const row of rows) {
    const d = row.activityData;
    const weak = d.prompt.match(/“(.+)”/)[1];
    assert.equal(d.sourceText.split(weak).length - 1, 1, d.prompt);
    assert.ok(!d.sourceText.startsWith(weak), d.prompt);
    assert.ok(d.distractors.length >= 3 && d.distractors.every(x => !d.acceptedAnswers.includes(x)));
  }
});

test('Paraphrasing: each word has a phrase set and an idea set with three accurate paraphrases and three tagged distractors', () => {
  assert.equal(unit6.activities.filter(a => a.contentType === 'phrase_set').length, 10);
  const ideas = unit6.activities.filter(a => a.contentType === 'idea_set');
  assert.equal(ideas.length, 10);
  for (const idea of ideas) {
    assert.equal(idea.activityData.accurateParaphrases.length, 3);
    assert.equal(idea.activityData.distractors.length, 3);
    assert.ok(idea.activityData.distractors.every(x => x.misconceptionCategory));
  }
});
