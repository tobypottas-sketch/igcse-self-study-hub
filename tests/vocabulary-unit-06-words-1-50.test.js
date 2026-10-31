// Unit 6 (Learning and Study Skills) · words 1–50 authored (batches 1–5, authoring complete, draft). Guards the contract with the real readiness evaluator and builders. All 50 words are authored, so the unit stays a draft: no releases/unit-06.js, no lock, no SQL, no artwork.
// Packaging note: the content pins below hash the audited content with the status normalised to 'draft', so promoting the unit to 'approved' does not change them: the packaged content is byte-identical to the audited draft apart from status.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import unit6 from '../content/vocabulary/units/unit-06.js';
import unit1 from '../content/vocabulary/units/unit-01.js';
import unit2 from '../content/vocabulary/units/unit-02.js';
import unit3 from '../content/vocabulary/units/unit-03.js';
import unit4 from '../content/vocabulary/units/unit-04.js';
import unit5 from '../content/vocabulary/units/unit-05.js';
import { LEXICAL_SPELLING_ERRORS } from '../content/vocabulary/lexical-spelling-errors.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';

const TERMS = ['absorb', 'confidence', 'dilemma', 'dramatically', 'equivalent', 'overload', 'stagnate', 'engage', 'participate', 'passive', 'active', 'evaluate', 'reflect', 'process', 'strategy', 'approach', 'revise', 'forecast', 'interfere', 'distract', 'evidence', 'guidance', 'academic', 'concentration', 'complex', 'motivation', 'curiosity', 'technique', 'effective', 'inefficient', 'struggle', 'awareness', 'capacity', 'feedback', 'respond', 'hesitation', 'independent', 'assumption', 'perspective', 'pressure', 'prioritise', 'retain', 'summarise', 'coordination', 'cognitive', 'achievement', 'outcome', 'focus', 'memorise', 'insight'];
// Exact earlier targets are isolated: evaluate (Units 3 and 5) -> vocab_evaluate_6 / u6_12_evaluate_6, struggle (Unit 1) -> vocab_struggle_6 / u6_31_struggle_6,
// pressure (Unit 3) -> vocab_pressure_6 / u6_40_pressure_6, achievement (Unit 1) -> vocab_achievement_6 / u6_46_achievement_6.
const ISOLATED = ['evaluate', 'struggle', 'pressure', 'achievement'];
const VOCAB_ID = term => (ISOLATED.includes(term) ? `vocab_${term}_6` : `vocab_${term}`);
const FAMILIES = ['confidence', 'stagnate', 'engage', 'participate', 'active', 'reflect', 'strategy', 'forecast', 'distract', 'evidence', 'concentration', 'motivation', 'effective', 'inefficient', 'awareness', 'respond', 'hesitation', 'independent', 'prioritise', 'coordination', 'achievement', 'memorise'];
const NO_FAMILY = TERMS.filter(term => !FAMILIES.includes(term));
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
// Same-POS pools across all 50 words: 19 verbs, 21 nouns, 9 adjectives (equivalent, passive, active, academic, complex, effective, inefficient, independent, cognitive) and 1 adverb
// (dramatically). Every pool of four or more gives each member the three other same-POS targets that Meaning Match and Context Recognise / Apply / Recall
// need. `dramatically` is the only adverb in the whole locked Unit 6 list, so it is permanently held back
// rather than padded with invalid distractors.
const LIMITED = { meaning: ['match'], context: ['recognise', 'apply', 'recall'] };
const POS_LIMITS = Object.fromEntries(['dramatically'].map(term => [term, LIMITED]));
const earlier = [unit1, unit2, unit3, unit4, unit5];
const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit6) });
const failed = (pathwayId, occurrenceId) => STAGES.filter(stage => (readiness.pathways[pathwayId].stageFailures[stage] ?? []).some(f => f.occurrenceId === occurrenceId));
const termOf = occurrence => unit6.items.find(item => item.vocabularyId === occurrence.vocabularyId).term;

test('Unit 6 batches 1–5 are exactly the fifty locked targets, in order, as an approved source with a release file and no draft', () => {
  assert.deepEqual(unit6.items.map(item => item.term), TERMS);
  assert.deepEqual(unit6.occurrences.map(row => row.positionInUnit), Array.from({ length: 50 }, (_, i) => i + 1));
  const suffix = term => (ISOLATED.includes(term) ? '_6' : '');
  assert.deepEqual(unit6.occurrences.map(row => row.occurrenceId), TERMS.map((term, i) => `u6_${String(i + 1).padStart(2, '0')}_${term}${suffix(term)}`));
  assert.deepEqual(unit6.occurrences.slice(30, 40).map(row => row.occurrenceId), ['u6_31_struggle_6', 'u6_32_awareness', 'u6_33_capacity', 'u6_34_feedback', 'u6_35_respond', 'u6_36_hesitation', 'u6_37_independent', 'u6_38_assumption', 'u6_39_perspective', 'u6_40_pressure_6']);
  assert.deepEqual(unit6.occurrences.slice(40).map(row => row.occurrenceId), ['u6_41_prioritise', 'u6_42_retain', 'u6_43_summarise', 'u6_44_coordination', 'u6_45_cognitive', 'u6_46_achievement_6', 'u6_47_outcome', 'u6_48_focus', 'u6_49_memorise', 'u6_50_insight']);
  assert.deepEqual(unit6.items.slice(40).map(row => row.vocabularyId), ['vocab_prioritise', 'vocab_retain', 'vocab_summarise', 'vocab_coordination', 'vocab_cognitive', 'vocab_achievement_6', 'vocab_outcome', 'vocab_focus', 'vocab_memorise', 'vocab_insight']);
  assert.deepEqual(unit6.items.slice(30, 40).map(row => row.vocabularyId), ['vocab_struggle_6', 'vocab_awareness', 'vocab_capacity', 'vocab_feedback', 'vocab_respond', 'vocab_hesitation', 'vocab_independent', 'vocab_assumption', 'vocab_perspective', 'vocab_pressure_6']);
  assert.deepEqual(unit6.items.map(row => row.vocabularyId), TERMS.map(VOCAB_ID));
  assert.equal(unit6.unitNumber, 6);
  assert.equal(unit6.unitTitle, 'Learning and Study Skills');
  assert.equal(unit6.status, 'approved');
  assert.ok(fs.existsSync(new URL('../content/vocabulary/releases/unit-06.js', import.meta.url)), 'Unit 6 release file must exist');
  assert.ok(!fs.existsSync(new URL('../content/vocabulary/units/unit-06-draft.js', import.meta.url)), 'the draft source is gone: one authoritative Unit 6 source');
  assert.ok(!fs.existsSync(new URL('../assets/vocabulary/units/unit-06.png', import.meta.url)), 'no artwork yet');
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
  // evaluate (Unit 3 vocab_evaluate, Unit 5 vocab_evaluate_5), struggle (Unit 1 vocab_struggle) and pressure (Unit 3 vocab_pressure) are the only exact overlaps:
  // Unit 6 gives each its own isolated id and never reuses the earlier one.
  assert.deepEqual(TERMS.filter(term => earlierTerms.has(term)), ISOLATED);
  assert.ok(others.has('vocab_evaluate') && others.has('vocab_evaluate_5') && !others.has('vocab_evaluate_6'));
  assert.ok(others.has('vocab_struggle') && others.has('u1_33_struggle') && !others.has('vocab_struggle_6') && !others.has('u6_31_struggle_6'));
  assert.ok(others.has('vocab_pressure') && others.has('u3_08_pressure') && !others.has('vocab_pressure_6') && !others.has('u6_40_pressure_6'));
  assert.ok(others.has('vocab_achievement') && others.has('u1_22_achievement') && !others.has('vocab_achievement_6') && !others.has('u6_46_achievement_6'));
  // focus and outcome are not earlier targets, so they need no isolation.
  assert.ok(!earlierTerms.has('focus') && !earlierTerms.has('outcome'));
  assert.ok(unit6.items.filter(row => !ISOLATED.includes(row.term)).every(row => !/_\d$/.test(row.vocabularyId)));
  assert.ok(unit6.occurrences.every(row => /^u6_\d{2}_/.test(row.occurrenceId)));
  assert.ok(unit6.activities.every(row => /^u6_/.test(row.activityContentId) && row.unitNumber === 6));
});

test('no Unit 6 target is a word-family form of an earlier unit, and earlier-unit content is untouched', () => {
  const forms = new Set();
  for (const unit of earlier) for (const item of unit.items) for (const form of item.wordFamily ?? []) forms.add(String(form).toLowerCase());
  // `participate` (Unit 3/4 `participant`), `process` (Unit 3 `processed`) and `reflect` (Unit 3 `reflection`) are listed family forms of earlier targets, but they were
  // never targets there, so none needs ID isolation. Only evaluate, struggle, pressure and achievement are exact earlier targets.
  // None of the Batch 4 targets (struggle, awareness, capacity, feedback, respond, hesitation, independent, assumption, perspective, pressure) is a listed family form of an earlier target.
  assert.deepEqual(TERMS.filter(term => forms.has(term)), ['participate', 'reflect', 'process', 'concentration']);
  // `concentration` (Batch 3) is a listed family form of the Unit 2 target `concentrate`; it is not itself a target there.
  assert.ok(unit2.items.some(row => row.term === 'concentrate'));
  assert.ok(unit3.items.concat(unit4.items).some(row => row.term === 'participant'));
  assert.deepEqual(earlier.map(unit => unit.status), ['approved', 'approved', 'approved', 'approved', 'approved']);
  assert.deepEqual(earlier.map(unit => unit.occurrences.length), [50, 50, 50, 50, 50]);
});

test('every pathway stage is buildable for all 50 words, except the documented Word Family and same-POS pool limits', () => {
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

test('all 50 words satisfy the strict (approved) content schema; only whole-unit count rules remain', () => {
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

test('Word Families: only the twenty-two genuine families are authored; the twenty-eight others are left unavailable rather than padded', () => {
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
  assert.equal(familyItems.length, 66);
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
    const errors = item.senses[0].spellingErrors;
    assert.equal(errors.length, 6, item.term);
    assert.equal(new Set(errors).size, 6, item.term);
    for (const error of errors) {
      assert.notEqual(error, item.term);
      assert.equal(error, error.toLowerCase());
      if (item.term.includes(' ')) assert.equal(error.split(' ').length, 2, `${item.term}: ${error} keeps both words`);
    }
  }
  for (const item of unit6.items) assert.ok(!item.senses[0].spellingErrors.includes(item.term));
  // evaluate_6, struggle_6 and pressure_6 share the existing lists, as Unit 5 does for evaluate; the earlier lists themselves are unchanged.
  assert.deepEqual(unit6.items.find(i => i.term === 'evaluate').senses[0].spellingErrors, LEXICAL_SPELLING_ERRORS.vocab_evaluate);
  assert.deepEqual(unit6.items.find(i => i.term === 'struggle').senses[0].spellingErrors, ['strugle', 'struggel', 'strugel', 'struggal', 'strugal', 'struggol']);
  assert.deepEqual(unit6.items.find(i => i.term === 'pressure').senses[0].spellingErrors, ['presure', 'pressur', 'pressher', 'preshure', 'presssure', 'pressere']);
  assert.deepEqual(unit6.items.find(i => i.term === 'achievement').senses[0].spellingErrors, LEXICAL_SPELLING_ERRORS.vocab_achievement);
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

test('Precision & Use: two items for each of the fifty words, weak wording once and not first, accepted answers never in the distractors', () => {
  const rows = unit6.activities.filter(a => a.activityData.taskType === 'improve_vocabulary');
  assert.equal(rows.length, 100);
  for (const row of rows) {
    const d = row.activityData;
    const weak = d.prompt.match(/“(.+)”/)[1];
    assert.equal(d.sourceText.split(weak).length - 1, 1, d.prompt);
    assert.ok(!d.sourceText.startsWith(weak), d.prompt);
    assert.ok(d.distractors.length >= 3 && d.distractors.every(x => !d.acceptedAnswers.includes(x)));
  }
});

test('Paraphrasing: each word has a phrase set and an idea set with three accurate paraphrases and three tagged distractors', () => {
  assert.equal(unit6.activities.filter(a => a.contentType === 'phrase_set').length, 50);
  const ideas = unit6.activities.filter(a => a.contentType === 'idea_set');
  assert.equal(ideas.length, 50);
  for (const idea of ideas) {
    assert.equal(idea.activityData.accurateParaphrases.length, 3);
    assert.equal(idea.activityData.distractors.length, 3);
    assert.ok(idea.activityData.distractors.every(x => x.misconceptionCategory));
  }
});

test('Batch 1 content and spelling entries are unchanged by later batches', () => {
  const batch1 = {
    vocab_absorb:['absorbe', 'abzorb', 'absorbb', 'absob', 'absorbt', 'absorp'],
    vocab_confidence:['confidance', 'confedence', 'confidense', 'confidnce', 'conffidence', 'confindence'],
    vocab_dilemma:['dilema', 'dillemma', 'dilemna', 'dilemmar', 'dillema', 'dilemmer'],
    vocab_dramatically:['dramaticly', 'dramaticaly', 'dramatikally', 'dramaticlly', 'dramatticaly', 'dramatcally'],
    vocab_equivalent:['equivelent', 'equivalant', 'equivilent', 'equivalet', 'equivalnet', 'equivallent'],
    vocab_overload:['overlode', 'overlod', 'overloade', 'overlaod', 'ovreload', 'overlowd'],
    vocab_stagnate:['stagnat', 'stagnait', 'stagnete', 'stangate', 'stagante', 'stagnatte'],
    vocab_engage:['enguage', 'engege', 'engaje', 'ingage', 'engadge', 'engaige'],
    vocab_participate:['particpate', 'partisipate', 'participat', 'partcipate', 'participete', 'particapate'],
    vocab_passive:['pasive', 'passiv', 'passsive', 'passeve', 'pessive', 'pasiv']
  };
  for (const [id, errors] of Object.entries(batch1)) assert.deepEqual(LEXICAL_SPELLING_ERRORS[id], errors, id);
  assert.deepEqual(unit6.items.slice(0, 10).map(i => i.vocabularyId), TERMS.slice(0, 10).map(VOCAB_ID));
});

test('sense boundaries for words 11–30: learning senses only, and the active/passive pair stays distinct', () => {
  const sense = term => unit6.items.find(i => i.term === term).senses[0];
  assert.doesNotMatch(JSON.stringify([sense('process').meaning, sense('process').masteryContexts.map(c => [c.text, c.meaning])]).toLowerCase(), /factory|manufactur/);
  assert.doesNotMatch(JSON.stringify([sense('reflect').meaning, sense('reflect').masteryContexts.map(c => [c.text, c.meaning]), sense('reflect').acceptedParaphrases]).toLowerCase(), /mirror|light|glass/);
  assert.doesNotMatch(JSON.stringify([sense('approach').meaning, sense('approach').masteryContexts.map(c => [c.text, c.meaning])]).toLowerCase(), /moving closer|train|plane/);
  assert.match(sense('revise').meaning, /examination/);
  assert.doesNotMatch(JSON.stringify(sense('revise').masteryContexts.map(c => [c.text, c.meaning])).toLowerCase(), /\bedit/);
  assert.match(sense('forecast').teacherNote, /not a guess|different from a guess/);
  assert.equal(unit6.items.find(i => i.term === 'active').partOfSpeech, 'adjective');
});

test('Batches 1–2 (words 1–20) are pinned: their items, occurrences, contexts and linked activities are byte-identical to the merged content', () => {
  const ids = new Set(unit6.items.slice(0, 20).map(row => row.vocabularyId));
  const linked = activity => (activity.activityData.linkedVocabularyIds ?? []).some(id => ids.has(id));
  const payload = {
    items: unit6.items.slice(0, 20),
    occurrences: unit6.occurrences.slice(0, 20),
    contexts: unit6.contexts.filter(context => ids.has(context.vocabularyId)),
    activities: unit6.activities.filter(linked)
  };
  assert.equal(payload.contexts.length, 120);
  assert.equal(payload.activities.length, 107);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(payload).replace(/"status":"approved"/g, '"status":"draft"')).digest('hex'), '5b78965de254ae150c4fafbe50ec231158dedc2e8eb8097dcd42c2b2c0d7e5d8');
});

test('Batch 2 spelling entries are unchanged by Batch 3', () => {
  const batch2 = {
    vocab_active:['activ', 'acitve', 'actve', 'aktive', 'activee', 'actieve'],
    vocab_reflect:['reflet', 'reflact', 'relfect', 'reflecct', 'refelct', 'reflekt'],
    vocab_process:['proces', 'procces', 'prosess', 'proccess', 'processs', 'procass'],
    vocab_strategy:['stratagy', 'stratergy', 'strategi', 'stradegy', 'startegy', 'stategy'],
    vocab_approach:['aproach', 'approch', 'apprach', 'approatch', 'appraoch', 'approche'],
    vocab_revise:['revize', 'revice', 'revies', 'reviese', 'revisse', 'rivise'],
    vocab_forecast:['forcast', 'forecest', 'foracast', 'forekast', 'forecasst', 'fourcast'],
    vocab_interfere:['interfear', 'interfer', 'intefere', 'interfeer', 'intarfere', 'interfeare'],
    vocab_distract:['distrct', 'distrack', 'disstract', 'distracct', 'destract', 'distarct']
  };
  for (const [id, errors] of Object.entries(batch2)) assert.deepEqual(LEXICAL_SPELLING_ERRORS[id], errors, id);
});

test('Batch 3 sense boundaries: evidence is not proof, guidance is not an order, complex is not merely difficult, technique is not strategy, effective is not efficient', () => {
  const sense = term => unit6.items.find(i => i.term === term).senses[0];
  const text = term => JSON.stringify([sense(term).meaning, sense(term).masteryContexts.map(c => [c.text, c.meaning])]).toLowerCase();
  assert.match(sense('evidence').teacherNote, /not the same as proof/);
  assert.doesNotMatch(text('evidence'), /\bproof\b|proves? /);
  assert.match(sense('guidance').teacherNote, /not an order or a rule/);
  assert.match(sense('academic').teacherNote, /theoretical rather than practical/);
  assert.doesNotMatch(text('concentration'), /chemical|solution|liquid/);
  assert.match(sense('complex').teacherNote, /not the same as difficult/);
  assert.match(sense('concentration').teacherNote, /not motivation/);
  assert.match(sense('technique').teacherNote, /narrower than a strategy/);
  assert.match(sense('effective').teacherNote, /efficient/);
  assert.match(sense('inefficient').teacherNote, /not the same as ineffective/);
  assert.doesNotMatch(text('curiosity'), /nosy|nosi|private lives/);
  for (const term of ['evidence', 'guidance', 'academic', 'concentration', 'complex', 'motivation', 'curiosity', 'technique', 'effective', 'inefficient']) {
    assert.equal(unit6.items.find(i => i.term === term).vocabularyId, `vocab_${term}`, 'no isolation needed: not an earlier target');
  }
  const partOfSpeech = Object.fromEntries(unit6.items.map(i => [i.term, i.partOfSpeech]));
  assert.deepEqual(['academic', 'complex', 'effective', 'inefficient'].map(t => partOfSpeech[t]), ['adjective', 'adjective', 'adjective', 'adjective']);
});

test('same-POS pool recalculation across all 50 words: every noun, verb and adjective is ready, dramatically stays the only held-back target', () => {
  const pools = {};
  for (const item of unit6.items) (pools[item.partOfSpeech] ??= []).push(item.term);
  assert.deepEqual(Object.fromEntries(Object.entries(pools).map(([pos, list]) => [pos, list.length])), { verb: 19, noun: 21, adjective: 9, adverb: 1 });
  for (const term of TERMS.filter(t => t !== 'dramatically')) {
    const occurrence = unit6.occurrences.find(row => unit6.items.find(i => i.vocabularyId === row.vocabularyId).term === term);
    assert.deepEqual(failed('meaning', occurrence.occurrenceId), [], `${term} meaning`);
    assert.deepEqual(failed('context', occurrence.occurrenceId), [], `${term} context`);
  }
  const dramatically = unit6.occurrences.find(row => row.occurrenceId === 'u6_04_dramatically');
  assert.deepEqual(failed('meaning', dramatically.occurrenceId), ['match']);
  assert.deepEqual(failed('context', dramatically.occurrenceId), ['recognise', 'apply', 'recall']);
});

test('Batch 3 spelling entries are unchanged by Batch 4', () => {
  const batch3 = {
    vocab_evidence:['evidance', 'evidense', 'evedence', 'evidnce', 'evidencee', 'eveidence'],
    vocab_guidance:['guidence', 'gidance', 'guidanse', 'guadance', 'guidanc', 'guiadance'],
    vocab_academic:['academmic', 'acadamic', 'academik', 'accademic', 'academc', 'acedemic'],
    vocab_concentration:['concentraton', 'consentration', 'concentrasion', 'concentation', 'concentratoin', 'concentrashun'],
    vocab_complex:['complx', 'complax', 'compleks', 'comlex', 'complexx', 'compelx'],
    vocab_motivation:['motivasion', 'motivaton', 'mottivation', 'motovation', 'motivatoin', 'motivashun'],
    vocab_curiosity:['curiousity', 'curosity', 'curiosty', 'curiocity', 'cuirosity', 'curiossity'],
    vocab_technique:['technic', 'techneque', 'tecnique', 'techniqe', 'techinique', 'tehnique'],
    vocab_effective:['effectve', 'efective', 'effektive', 'effecttive', 'effectiv', 'effectave'],
    vocab_inefficient:['inefficeint', 'inefficent', 'inneficient', 'ineficient', 'inefficiant', 'inefisient']
  };
  for (const [id, errors] of Object.entries(batch3)) assert.deepEqual(LEXICAL_SPELLING_ERRORS[id], errors, id);
  // Earlier-unit lists that Batch 4 aliases are unchanged.
  assert.deepEqual(LEXICAL_SPELLING_ERRORS.vocab_struggle, ['strugle', 'struggel', 'strugel', 'struggal', 'strugal', 'struggol']);
  assert.deepEqual(LEXICAL_SPELLING_ERRORS.vocab_pressure, ['presure', 'pressur', 'pressher', 'preshure', 'presssure', 'pressere']);
  assert.ok(!('vocab_struggle_6' in LEXICAL_SPELLING_ERRORS) && !('vocab_pressure_6' in LEXICAL_SPELLING_ERRORS), 'aliases are added in the Unit 6 unit source only');
});

test('Batches 1–3 (words 1–30) are pinned: their items, occurrences, contexts and linked activities are byte-identical to the merged content', () => {
  const ids = new Set(unit6.items.slice(0, 30).map(row => row.vocabularyId));
  const linked = activity => (activity.activityData.linkedVocabularyIds ?? []).some(id => ids.has(id));
  const payload = {
    items: unit6.items.slice(0, 30),
    occurrences: unit6.occurrences.slice(0, 30),
    contexts: unit6.contexts.filter(context => ids.has(context.vocabularyId)),
    activities: unit6.activities.filter(linked)
  };
  assert.equal(payload.contexts.length, 180);
  assert.equal(payload.activities.length, 162);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(payload).replace(/"status":"approved"/g, '"status":"draft"')).digest('hex'), '6929008ac2672547c237966330ccd8a1b81d32902772c37556882c22d6a9fbe4');
});

test('Batch 4 spelling entries: six distinct lower-case misspellings for each new target (struggle and pressure alias their earlier lists)', () => {
  const batch4 = {
    vocab_awareness:['awarness', 'awereness', 'awearness', 'awarenes', 'aweraness', 'awarenness'],
    vocab_capacity:['capasity', 'capacitty', 'capacety', 'cappacity', 'capaciti', 'capacty'],
    vocab_feedback:['feedbak', 'fedback', 'feadback', 'feedbac', 'feed-bak', 'feebback'],
    vocab_respond:['responed', 'respnd', 'resbond', 'respund', 'resspond', 'respont'],
    vocab_hesitation:['hesitaton', 'hesitasion', 'hesistation', 'hessitation', 'hesitashun', 'hesatation'],
    vocab_independent:['independant', 'indipendent', 'independint', 'independet', 'indepedent', 'independnt'],
    vocab_assumption:['assumtion', 'asumption', 'assumpsion', 'assuption', 'asumsion', 'assumtpion'],
    vocab_perspective:['perspectiv', 'perspektive', 'persepctive', 'perspectve', 'prespective', 'perpective']
  };
  for (const [id, errors] of Object.entries(batch4)) assert.deepEqual(LEXICAL_SPELLING_ERRORS[id], errors, id);
});

test('Batch 4 sense boundaries: each target keeps its learning sense and the nine distinctions are recorded and exercised', () => {
  const sense = term => unit6.items.find(i => i.term === term).senses[0];
  const text = term => JSON.stringify([sense(term).meaning, sense(term).masteryContexts.map(c => [c.text, c.meaning]), sense(term).acceptedParaphrases]).toLowerCase();
  assert.doesNotMatch(text('struggle'), /fight|battle|wrestl|violen/);
  assert.match(sense('awareness').teacherNote, /not concentration/);
  assert.match(sense('capacity').teacherNote, /not current performance/);
  assert.doesNotMatch(text('capacity'), /litre|tank|stadium|seats/);
  assert.match(sense('feedback').teacherNote, /not the same as criticism/);
  assert.doesNotMatch(text('feedback'), /microphone|speaker|loud|noise/);
  assert.match(sense('respond').teacherNote, /not the same as obey/);
  assert.match(sense('hesitation').teacherNote, /not the same as refusal/);
  assert.match(sense('independent').teacherNote, /does not mean isolated/);
  assert.doesNotMatch(text('independent'), /countr|government|financial|income/);
  assert.match(sense('assumption').teacherNote, /not evidence/);
  assert.match(sense('perspective').teacherNote, /not an opinion with no basis/);
  assert.doesNotMatch(text('perspective'), /draw|paint|vanishing/);
  assert.match(sense('pressure').teacherNote, /different from motivation/);
  assert.doesNotMatch(text('pressure'), /air|tyre|water|weight|force/);
  // Precision & Use tests the distinctions with distractors from the contrasted word.
  const precision = id => unit6.activities.find(a => a.activityContentId === `u6_writing_precision_${id}`).activityData;
  assert.ok(precision('awareness_a').distractors.includes('concentration'));
  assert.ok(precision('independent_a').distractors.includes('isolated'));
  assert.ok(precision('pressure_a').distractors.includes('motivation'));
  assert.ok(precision('hesitation_a').distractors.includes('refusal'));
  // Isolated entries record their separation from the earlier item.
  assert.match(sense('struggle').teacherNote, /^Unit 6 item \(struggle_6\), separate from the Unit 1 struggle item/);
  assert.match(sense('pressure').teacherNote, /^Unit 6 item \(pressure_6\), separate from the Unit 3 pressure item/);
  assert.deepEqual(['struggle', 'respond'].map(t => unit6.items.find(i => i.term === t).partOfSpeech), ['verb', 'verb']);
  assert.deepEqual(['independent'].map(t => unit6.items.find(i => i.term === t).partOfSpeech), ['adjective']);
});

test('Batch 4 Word Families: awareness, respond, hesitation and independent are authored; the six others are rejected with written reasons', () => {
  const forms = term => unit6.items.find(i => i.term === term).senses[0].wordFamilyForms.map(f => f.form);
  assert.deepEqual(forms('awareness'), ['awareness', 'aware', 'unaware']);
  assert.deepEqual(forms('respond'), ['respond', 'response', 'responsive']);
  assert.deepEqual(forms('hesitation'), ['hesitation', 'hesitate', 'hesitant']);
  assert.deepEqual(forms('independent'), ['independent', 'independence', 'independently']);
  for (const term of ['struggle', 'capacity', 'feedback', 'assumption', 'perspective', 'pressure']) assert.deepEqual(unit6.items.find(i => i.term === term).wordFamily, [], term);
});

test('Batches 1–4 (words 1–40) are pinned: their items, occurrences, contexts and linked activities are byte-identical to the merged content', () => {
  const ids = new Set(unit6.items.slice(0, 40).map(row => row.vocabularyId));
  const linked = activity => (activity.activityData.linkedVocabularyIds ?? []).some(id => ids.has(id));
  const payload = {
    items: unit6.items.slice(0, 40),
    occurrences: unit6.occurrences.slice(0, 40),
    contexts: unit6.contexts.filter(context => ids.has(context.vocabularyId)),
    activities: unit6.activities.filter(linked)
  };
  assert.equal(payload.contexts.length, 240);
  assert.equal(payload.activities.length, 214);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(payload).replace(/"status":"approved"/g, '"status":"draft"')).digest('hex'), '7212611d4ca7f5579579db7117f293ab91ea0da32d8e8873394f79ae992d2136');
});

test('Batch 4 spelling entries are unchanged by Batch 5, and Batch 5 spelling is complete with British spellings only', () => {
  const batch4 = {
    vocab_awareness:['awarness', 'awereness', 'awearness', 'awarenes', 'aweraness', 'awarenness'],
    vocab_capacity:['capasity', 'capacitty', 'capacety', 'cappacity', 'capaciti', 'capacty'],
    vocab_feedback:['feedbak', 'fedback', 'feadback', 'feedbac', 'feed-bak', 'feebback'],
    vocab_respond:['responed', 'respnd', 'resbond', 'respund', 'resspond', 'respont'],
    vocab_hesitation:['hesitaton', 'hesitasion', 'hesistation', 'hessitation', 'hesitashun', 'hesatation'],
    vocab_independent:['independant', 'indipendent', 'independint', 'independet', 'indepedent', 'independnt'],
    vocab_assumption:['assumtion', 'asumption', 'assumpsion', 'assuption', 'asumsion', 'assumtpion'],
    vocab_perspective:['perspectiv', 'perspektive', 'persepctive', 'perspectve', 'prespective', 'perpective']
  };
  for (const [id, errors] of Object.entries(batch4)) assert.deepEqual(LEXICAL_SPELLING_ERRORS[id], errors, id);
  const batch5 = {
    vocab_prioritise:['priotise', 'prioritice', 'prioratise', 'prioritiese', 'priortise', 'prioritis'],
    vocab_retain:['retane', 'reatain', 'retian', 'retaine', 'ritain', 'retayn'],
    vocab_summarise:['sumarise', 'summerise', 'summarice', 'summarrise', 'summariese', 'sumerise'],
    vocab_coordination:['cooordination', 'coordenation', 'cordination', 'coordinaton', 'coordinasion', 'coordnation'],
    vocab_cognitive:['cognative', 'cogntive', 'cognitiv', 'cognetive', 'conitive', 'cognitve'],
    vocab_outcome:['outcom', 'outcum', 'outkome', 'autcome', 'outcomme', 'outcame'],
    vocab_focus:['focuss', 'fokus', 'focous', 'focas', 'fcous', 'foccus'],
    vocab_memorise:['memorice', 'memoriese', 'memerise', 'memmorise', 'memorrise', 'momorise'],
    vocab_insight:['insite', 'insihgt', 'insigt', 'insightt', 'insaight', 'inzight']
  };
  for (const [id, errors] of Object.entries(batch5)) assert.deepEqual(LEXICAL_SPELLING_ERRORS[id], errors, id);
  // The British forms are the only accepted targets; no US spelling appears as a target, a spelling error or anywhere in the unit.
  for (const term of ['prioritise', 'summarise', 'memorise']) {
    const item = unit6.items.find(i => i.term === term);
    assert.equal(item.term, term);
    assert.ok(!item.senses[0].spellingErrors.some(error => /(prioritize|summarize|memorize)/.test(error)), term);
  }
  assert.ok(!unit6.items.some(i => /(prioritize|summarize|memorize)/.test(i.term)));
  assert.ok(!('vocab_achievement_6' in LEXICAL_SPELLING_ERRORS), 'alias is added in the Unit 6 unit source only');
  assert.deepEqual(LEXICAL_SPELLING_ERRORS.vocab_achievement, unit6.items.find(i => i.term === 'achievement').senses[0].spellingErrors);
});

test('Batch 5 sense boundaries: each target keeps its intended sense and the ten distinctions are recorded and exercised', () => {
  const sense = term => unit6.items.find(i => i.term === term).senses[0];
  const text = term => JSON.stringify([sense(term).meaning, sense(term).masteryContexts.map(c => [c.text, c.meaning]), sense(term).acceptedParaphrases]).toLowerCase();
  assert.match(sense('prioritise').teacherNote, /not the same as organise/);
  assert.match(sense('retain').teacherNote, /not the same as understand/);
  assert.doesNotMatch(text('retain'), /\b(shop|retail|hold(ing)? an object)\b/);
  assert.match(sense('summarise').teacherNote, /not copying/);
  assert.match(sense('summarise').teacherNote, /does not give your own opinion/);
  assert.match(sense('coordination').teacherNote, /more than cooperation alone/);
  assert.doesNotMatch(text('coordination'), /balance|clumsy|dance|catch a ball/);
  assert.match(sense('cognitive').teacherNote, /not the same as academic/);
  assert.doesNotMatch(text('cognitive'), /neuron|synapse|cortex|neuroscience/);
  assert.match(sense('achievement').teacherNote, /not the same as outcome/);
  assert.match(sense('achievement').teacherNote, /^Unit 6 item \(achievement_6\), separate from the Unit 1 achievement item/);
  assert.match(sense('outcome').teacherNote, /not a goal/);
  assert.match(sense('outcome').teacherNote, /not a prediction/);
  assert.match(sense('focus').teacherNote, /not the same as concentration/);
  assert.doesNotMatch(text('focus'), /camera|lens|picture|blur|sharp/);
  assert.match(sense('memorise').teacherNote, /not the same as understand/);
  assert.match(sense('insight').teacherNote, /more than basic information or simple awareness/);
  const partOfSpeech = Object.fromEntries(unit6.items.map(i => [i.term, i.partOfSpeech]));
  assert.deepEqual(['prioritise', 'retain', 'summarise', 'focus', 'memorise'].map(t => partOfSpeech[t]), Array(5).fill('verb'));
  assert.deepEqual(['coordination', 'achievement', 'outcome', 'insight'].map(t => partOfSpeech[t]), Array(4).fill('noun'));
  assert.equal(partOfSpeech.cognitive, 'adjective');
  // Precision & Use contrasts the confusable pairs through the weak wording or the distractors.
  const precision = id => unit6.activities.find(a => a.activityContentId === `u6_writing_precision_${id}`).activityData;
  assert.match(precision('prioritise_a').prompt, /organise/);
  assert.match(precision('retain_a').prompt, /understand/);
  assert.match(precision('summarise_a').prompt, /write out/);
  assert.match(precision('coordination_a').prompt, /cooperation/);
  assert.match(precision('cognitive_a').prompt, /academic/);
  assert.match(precision('achievement_a').prompt, /result/);
  assert.match(precision('outcome_a').prompt, /goal/);
  assert.match(precision('focus_a').prompt, /concentration/);
  assert.match(precision('memorise_a').prompt, /understand/);
  assert.match(precision('insight_a').prompt, /information about/);
  assert.deepEqual(precision('focus_a').acceptedAnswers, ['focus on']);
  assert.deepEqual(precision('insight_a').acceptedAnswers, ['insight into']);
});

test('Batch 5 Word Families: prioritise, coordination, achievement and memorise are authored; the six others are rejected with written reasons', () => {
  const forms = term => unit6.items.find(i => i.term === term).senses[0].wordFamilyForms.map(f => f.form);
  assert.deepEqual(forms('prioritise'), ['prioritise', 'priority', 'prioritisation']);
  assert.deepEqual(forms('coordination'), ['coordination', 'coordinate', 'coordinated']);
  assert.deepEqual(forms('achievement'), ['achievement', 'achieve', 'achievable']);
  assert.deepEqual(forms('memorise'), ['memorise', 'memory', 'memorable']);
  for (const term of ['retain', 'summarise', 'cognitive', 'outcome', 'focus', 'insight']) assert.deepEqual(unit6.items.find(i => i.term === term).wordFamily, [], term);
  // The achievement family overlaps the forms Unit 1 lists for its own, separate item (achieve, achievable); that is a family-form overlap, not a target overlap.
  assert.deepEqual(unit1.items.find(i => i.term === 'achievement').wordFamily.slice().sort(), ['achievable', 'achieve']);
  assert.equal(unit6.items.filter(i => i.senses[0].wordFamilyForms?.length).length, 22, 'Word Families meets the release threshold of 20');
  assert.equal(readiness.pathways.word_families.live, true);
  assert.deepEqual(readiness.pathways.word_families.stageCounts, { recognise: 22, match: 22, apply: 22, recall: 22, mastery: 22 });
});

test('final authoring totals: 50 items, 50 occurrences, 300 contexts and 266 activities, approved source (released by releases/unit-06.js)', () => {
  assert.equal(unit6.items.length, 50);
  assert.equal(unit6.occurrences.length, 50);
  assert.equal(unit6.contexts.length, 300);
  assert.equal(unit6.activities.length, 266);
  const byType = {};
  for (const activity of unit6.activities) { const key = `${activity.contentType}:${activity.activityData.taskType ?? ''}`; byType[key] = (byType[key] ?? 0) + 1; }
  assert.deepEqual(byType, { 'phrase_set:': 50, 'idea_set:': 50, 'writing_set:improve_vocabulary': 100, 'writing_set:word_family': 66 });
  assert.equal(unit6.status, 'approved');
});

// ---------------------------------------------------------------------------------------------
// Pre-release audit/polish. The pins for words 1–20/1–30/1–40 above were intentionally re-pinned
// after the audit changed: the process definition (absorb/process boundary), the concentration
// definition (concentration/focus boundary) and the matching teacher notes.
// ---------------------------------------------------------------------------------------------
test('audit: locked order, positions and isolated duplicate IDs are intact', () => {
  assert.deepEqual(unit6.items.map(i => i.term), TERMS);
  assert.equal(new Set(unit6.items.map(i => i.vocabularyId)).size, 50);
  for (const w of ISOLATED) assert.ok(unit6.items.some(i => i.vocabularyId === `vocab_${w}_6`), w);
  for (const earlier of [unit1, unit2, unit3, unit4, unit5]) {
    const ids = new Set(earlier.items.map(i => i.vocabularyId));
    assert.deepEqual(unit6.items.filter(i => ids.has(i.vocabularyId)).map(i => i.term), []);
  }
});

test('audit: absorb/process and concentration/focus boundaries are written into the definitions', () => {
  const sense = t => unit6.items.find(i => i.term === t).senses[0];
  assert.equal(sense('process').meaning, 'to think about new information until you can make sense of it');
  assert.equal(sense('concentration').meaning, 'the ability to keep your full attention on one thing for a period of time');
  assert.match(sense('process').teacherNote, /absorb is taking information in/);
  assert.match(sense('concentration').teacherNote, /focus \(verb\) is the act of directing attention/);
});

test('audit: no sentence is reused anywhere in Unit 6 content outside the fixed task prompts, and no US spellings appear', () => {
  const counts = new Map();
  for (const m of JSON.stringify(unit6).matchAll(/"([^"]{40,}?[.?!])"/g)) counts.set(m[1], (counts.get(m[1]) ?? 0) + 1);
  const repeated = [...counts].filter(([text, n]) => n > 1 && !/^(Use the correct form from the|Replace “)/.test(text));
  assert.deepEqual(repeated, []);
  assert.doesNotMatch(JSON.stringify(unit6), /prioritize|summarize|memorize|organize|recognize/i);
});

test('audit: gap-fill distractors that gave an accidental second answer have been replaced', () => {
  const wrong = term => unit6.items.find(i => i.term === term).senses[0].gapDistractors.map(g => g.wrong.join(','));
  assert.deepEqual(wrong('reflect')[0], 'insist,agree,vote');
  assert.deepEqual(wrong('academic'), ['seasonal,tropical,metallic', 'tropical,frozen,seasonal', 'tropical,metallic,frozen']);
  assert.deepEqual(wrong('pressure'), ['hunger,thirst,warmth', 'distance,colour,tradition', 'budget,distance,schedule']);
  assert.deepEqual(wrong('focus'), ['depend,vote,insist', 'rely,agree,insist', 'depend,agree,vote']);
});

test('audit: planner decision — whole sets of 10 are preserved and the exact served and held-back membership is pinned', () => {
  const sets = id => readiness.pathways[id].setMembers.map(s => s.map(x => x.replace(/^u6_\d+_/, '')));
  const held = id => readiness.pathways[id].heldBackOccurrenceIds.map(x => x.replace(/^u6_\d+_/, ''));
  for (const id of ['meaning', 'context']) {
    assert.equal(readiness.pathways[id].servedCount, 49);
    assert.equal(readiness.pathways[id].setCount, 4);
    assert.ok(sets(id).every(s => s.length === 10));
    assert.deepEqual(held(id), ['retain', 'summarise', 'coordination', 'cognitive', 'achievement_6', 'outcome', 'focus', 'memorise', 'insight']);
    assert.ok(!sets(id).flat().includes('dramatically'));
  }
  assert.equal(readiness.pathways.word_families.setCount, 2);
  assert.ok(sets('word_families').every(s => s.length === 10));
  assert.deepEqual(held('word_families'), ['achievement_6', 'memorise']);
  for (const id of ['paraphrasing', 'precision_use', 'spelling_recall']) {
    assert.equal(readiness.pathways[id].setCount, 5);
    assert.equal(readiness.pathways[id].heldBackCount, 0);
  }
  // Unit 4 has the identical Meaning/Context shape under the same planner, so the behaviour is not Unit 6-specific.
  const r4 = evaluateUnitReadiness({ content: releasePlannerContent(unit4) });
  assert.deepEqual([r4.pathways.meaning.servedCount, r4.pathways.meaning.setCount, r4.pathways.meaning.heldBackCount], [49, 4, 9]);
});
