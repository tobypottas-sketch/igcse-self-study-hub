// Unit 5 (Holidays) · words 1–20 authored (batches 1–2, draft). Guards the contract with the real readiness evaluator and builders. Words 21–50 are not
// authored yet, so the unit stays a draft: no releases/unit-05.js, no lock, no SQL, no artwork.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit5 from '../content/vocabulary/units/unit-05-draft.js';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import unit3 from '../content/vocabulary/units/unit-03.js';
import unit4 from '../content/vocabulary/units/unit-04.js';
import { LEXICAL_SPELLING_ERRORS } from '../content/vocabulary/lexical-spelling-errors.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';

const TERMS = ['aerial tourism', 'underwater photography', 'documentary', 'snorkelling', 'expedition', 'yacht', 'scenery', 'attractions', 'accommodation', 'adventurous', 'breathtaking', 'spectacular', 'dramatic', 'stunning', 'popular', 'static', 'ground-level', 'angle of view', 'ecological habitats', 'marine world'];
const FAMILIES = ['snorkelling', 'attractions', 'adventurous', 'spectacular', 'popular'];
const ISOLATED = { breathtaking: '_5' };
const vocabIdOf = term => `vocab_${term.replace(/[ -]/g, '_')}${ISOLATED[term] ?? ''}`;
const occIdOf = (term, position) => `u5_${String(position).padStart(2, '0')}_${term.replace(/[ -]/g, '_')}${ISOLATED[term] ?? ''}`;
const NO_FAMILY = TERMS.filter(term => !FAMILIES.includes(term));
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
// The adjective pool is now 8 and the noun pool 12, so no same-POS limit remains (Batch 1's adventurous limit is resolved).
const POS_LIMITS = {};
const earlier = [unit1, unit2, unit3, unit4];
const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit5) });
const failed = (pathwayId, occurrenceId) => STAGES.filter(stage => (readiness.pathways[pathwayId].stageFailures[stage] ?? []).some(f => f.occurrenceId === occurrenceId));
const termOf = occurrence => unit5.items.find(item => item.vocabularyId === occurrence.vocabularyId).term;

test('Unit 5 words 1–20 are exactly the twenty locked targets, in order, as a draft with no release artefacts', () => {
  assert.deepEqual(unit5.items.map(item => item.term), TERMS);
  assert.equal(unit5.items.length, 20);
  assert.deepEqual(unit5.occurrences.map(row => row.positionInUnit), Array.from({ length: 20 }, (_, i) => i + 1));
  assert.deepEqual(unit5.occurrences.map(row => row.occurrenceId), TERMS.map((term, i) => occIdOf(term, i + 1)));
  assert.deepEqual(unit5.items.map(row => row.vocabularyId), TERMS.map(vocabIdOf));
  assert.equal(unit5.occurrences[10].occurrenceId, 'u5_11_breathtaking_5');
  assert.equal(unit5.items[10].vocabularyId, 'vocab_breathtaking_5');
  assert.equal(unit5.unitNumber, 5);
  assert.equal(unit5.unitTitle, 'Holidays');
  assert.equal(unit5.status, 'draft');
  for (const name of ['releases/unit-05.js', 'units/unit-05.js', 'units/unit-05.content-lock.json']) assert.ok(!fs.existsSync(new URL(`../content/vocabulary/${name}`, import.meta.url)), name);
  assert.ok(!fs.existsSync(new URL('../assets/vocabulary/units/unit-05.png', import.meta.url)), 'no artwork yet');
  assert.ok(!fs.existsSync(new URL('../docs/vocabulary-content-updates/unit-05-sync-chunk-1.sql', import.meta.url)), 'no SQL yet');
});

test('multi-word targets keep their exact two-word form everywhere', () => {
  for (const term of ['aerial tourism', 'underwater photography']) {
    const item = unit5.items.find(row => row.term === term);
    assert.ok(item.senses[0].masteryContexts.every(context => context.text.includes(term)), term);
    const gaps = unit5.contexts.filter(context => context.vocabularyId === item.vocabularyId && /_gap_/.test(context.contextId));
    assert.equal(gaps.length, 3, term);
    assert.ok(gaps.every(context => context.text.includes(term)), term);
  }
});

test('IDs are Unit 5-specific, unique, and never collide with Units 1–4; only breathtaking repeats an earlier target and is isolated with _5', () => {
  const ids = [];
  unit5.items.forEach(row => ids.push(row.vocabularyId));
  unit5.occurrences.forEach(row => ids.push(row.occurrenceId));
  unit5.contexts.forEach(row => ids.push(row.contextId));
  unit5.activities.forEach(row => ids.push(row.activityContentId));
  assert.equal(new Set(ids).size, ids.length, 'duplicate ID inside Unit 5');
  const others = new Set();
  const earlierTerms = new Set();
  for (const unit of earlier) {
    unit.items.forEach(row => { others.add(row.vocabularyId); earlierTerms.add(row.term.toLowerCase()); });
    unit.occurrences.forEach(row => others.add(row.occurrenceId));
    unit.contexts.forEach(row => others.add(row.contextId));
    unit.activities.forEach(row => others.add(row.activityContentId));
  }
  assert.deepEqual(ids.filter(id => others.has(id)), []);
  assert.deepEqual(TERMS.filter(term => earlierTerms.has(term)), ['breathtaking'], 'breathtaking is the only exact earlier-unit target');
  assert.deepEqual(unit5.items.filter(row => /_5$/.test(row.vocabularyId)).map(row => row.term), ['breathtaking']);
  assert.deepEqual(unit5.occurrences.filter(row => /_5$/.test(row.occurrenceId)).map(row => row.occurrenceId), ['u5_11_breathtaking_5']);
  const u4 = unit4.items.find(row => row.term === 'breathtaking');
  assert.equal(u4.vocabularyId, 'vocab_breathtaking');
  assert.ok(unit4.occurrences.some(row => row.occurrenceId === 'u4_01_breathtaking' && row.vocabularyId === 'vocab_breathtaking'));
  assert.notEqual(unit5.items[10].senses[0].meaning, u4.senses[0].meaning, 'Unit 5 sense is tourism-specific');
  assert.ok(unit5.occurrences.every(row => /^u5_\d{2}_/.test(row.occurrenceId)));
  assert.ok(unit5.activities.every(row => /^u5_/.test(row.activityContentId) && row.unitNumber === 5));
});

test('no Unit 5 target is a word-family form of an earlier unit, and earlier-unit content is untouched', () => {
  const forms = new Set();
  for (const unit of earlier) for (const item of unit.items) for (const form of item.wordFamily ?? []) forms.add(String(form).toLowerCase());
  assert.deepEqual(TERMS.filter(term => forms.has(term)), []);
  assert.deepEqual(earlier.map(unit => unit.status), ['approved', 'approved', 'approved', 'approved']);
  assert.deepEqual(earlier.map(unit => unit.occurrences.length), [50, 50, 50, 50]);
  assert.equal(JSON.stringify(unit4).includes('breathtaking_5'), false, 'Unit 4 untouched by the Unit 5 isolation');
});

test('every pathway stage is buildable for words 1–20, except the documented Word Family limit (no same-POS limit remains)', () => {
  for (const occurrence of unit5.occurrences) {
    const term = termOf(occurrence);
    for (const pathwayId of Object.keys(readiness.pathways)) {
      let expected = [];
      if (pathwayId === 'word_families' && NO_FAMILY.includes(term)) expected = STAGES;
      else if (POS_LIMITS[term]?.[pathwayId]) expected = POS_LIMITS[term][pathwayId];
      assert.deepEqual(failed(pathwayId, occurrence.occurrenceId), expected, `${term} / ${pathwayId}`);
    }
  }
});

test('words 1–20 satisfy the strict (approved) content schema; only whole-unit count rules remain', () => {
  const approve = row => ({ ...row, status: 'approved' });
  const strict = { ...unit5, status: 'approved', items: unit5.items.map(approve), occurrences: unit5.occurrences.map(approve), contexts: unit5.contexts.map(approve), activities: unit5.activities.map(approve) };
  const errors = validateUnit(strict).errors;
  assert.deepEqual(errors.filter(error => !/exactly 50 occurrences|exactly ten targets/.test(error)), []);
});

test('gap-fill: target inside the blankable sentence (not first), three distinct wrong options that never equal the answer', () => {
  for (const item of unit5.items) {
    const sense = item.senses[0];
    const gapContexts = unit5.contexts.filter(c => c.vocabularyId === item.vocabularyId && /_gap_/.test(c.contextId));
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
  for (const item of unit5.items) {
    const rows = item.senses[0].situationDistractors;
    assert.ok(new Set(rows).size >= 4, item.term);
    const stem = item.term.slice(0, Math.max(4, item.term.length - 3)).toLowerCase();
    for (const row of rows) assert.ok(!row.toLowerCase().includes(stem), `${item.term}: ${row}`);
  }
});

test('wrong situations are not repeated inside Unit 5 or from Units 1–4', () => {
  const seen = unit5.items.flatMap(item => item.senses[0].situationDistractors.map(row => row.trim().toLowerCase()));
  assert.equal(new Set(seen).size, seen.length);
  const earlierSituations = new Set(earlier.flatMap(unit => unit.items.flatMap(item => item.senses[0].situationDistractors ?? [])).map(row => row.trim().toLowerCase()));
  assert.deepEqual(seen.filter(row => earlierSituations.has(row)), []);
});

test('Word Families: only the five genuine families are authored; the fifteen others are left unavailable rather than padded', () => {
  for (const item of unit5.items) {
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
  const familyItems = unit5.activities.filter(a => a.activityData.taskType === 'word_family');
  assert.equal(familyItems.length, 15);
  assert.ok(familyItems.every(a => a.activityData.sourceText.split('____').length === 2 && !a.activityData.sourceText.startsWith('____')));
});

test('Mastery sentences never begin with the target, and mastery passages have one gap and never repeat the target', () => {
  for (const item of unit5.items) {
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
  for (const item of unit5.items) {
    const errors = item.senses[0].spellingErrors;
    assert.deepEqual(errors, LEXICAL_SPELLING_ERRORS[item.vocabularyId.replace(/_5$/, '')], `${item.term} uses the reviewed lexical list`);
    assert.equal(errors.length, 6, item.term);
    assert.equal(new Set(errors).size, 6, item.term);
    for (const error of errors) {
      assert.notEqual(error, item.term);
      assert.equal(error, error.toLowerCase());
      if (item.term.includes(' ')) assert.equal(error.split(' ').length, item.term.split(' ').length, `${item.term}: ${error} keeps every word`);
      if (item.term.includes(' ') || item.term.includes('-')) assert.notEqual(error.replace(/[ -]/g, ''), item.term.replace(/[ -]/g, ''), `${item.term}: ${error} is not just a separator change`);
    }
  }
  assert.ok(!LEXICAL_SPELLING_ERRORS.vocab_snorkelling.includes('snorkelling'));
  assert.deepEqual(unit5.items[10].senses[0].spellingErrors, unit4.items.find(row => row.term === 'breathtaking').senses[0].spellingErrors, 'isolated breathtaking shares the reviewed spelling list');
});

test('no target leakage in paraphrases and no repeated sentences inside the batch or against Units 1–4', () => {
  const stemOf = term => term.split(' ').filter(word => word.length > 3).map(word => word.slice(0, Math.max(5, word.length - 3)).toLowerCase());
  for (const activity of unit5.activities) {
    const data = activity.activityData;
    if (activity.contentType === 'idea_set') {
      const linked = unit5.items.find(item => item.vocabularyId === data.linkedVocabularyIds[0]);
      for (const text of data.accurateParaphrases) for (const stem of stemOf(linked.term)) assert.ok(!text.toLowerCase().includes(stem), `${linked.term} leaks in "${text}"`);
    }
  }
  for (const item of unit5.items) {
    const sense = item.senses[0];
    for (const text of [...sense.acceptedParaphrases, sense.paraphraseSentence ?? '', sense.productionSentence ?? '']) {
      for (const stem of stemOf(item.term)) assert.ok(!String(text).toLowerCase().includes(stem), `${item.term} leaks in "${text}"`);
    }
  }
  const sentences = [];
  for (const context of unit5.contexts) sentences.push(context.text);
  for (const item of unit5.items) for (const context of item.senses[0].masteryContexts) sentences.push(context.text);
  for (const activity of unit5.activities) if (activity.activityData.sourceText) sentences.push(activity.activityData.sourceText);
  const lower = sentences.map(text => text.trim().toLowerCase());
  assert.equal(new Set(lower).size, lower.length, 'a sentence is repeated inside Unit 5');
  const earlierSentences = new Set();
  for (const unit of earlier) {
    for (const context of unit.contexts) earlierSentences.add(context.text.trim().toLowerCase());
    for (const item of unit.items) for (const context of item.senses[0].masteryContexts ?? []) earlierSentences.add(context.text.trim().toLowerCase());
  }
  assert.deepEqual(lower.filter(text => earlierSentences.has(text)), []);
});

test('countability and articles: "accommodation" and "scenery" are never used with a/an or in the plural', () => {
  const text = JSON.stringify(unit5).toLowerCase();
  assert.doesNotMatch(text, /\ban? (accommodation|scenery)\b|\b(accommodations|sceneries)\b/);
  assert.doesNotMatch(text, /\b(traveling|licensing|colorful|organized|neighbors)\b/, 'British spelling');
});
