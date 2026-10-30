// Unit 5 (Holidays) · all 50 words authored (batches 1–5, draft). Guards the contract with the real readiness evaluator and builders. The unit stays a
// draft until it is packaged in a separate job: no releases/unit-05.js, no units/unit-05.js, no lock, no SQL, no artwork, no Unit Check, no Games.
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

const TERMS = ['aerial tourism', 'underwater photography', 'documentary', 'snorkelling', 'expedition', 'yacht', 'scenery', 'attractions', 'accommodation', 'adventurous', 'breathtaking', 'spectacular', 'dramatic', 'stunning', 'popular', 'static', 'ground-level', 'angle of view', 'ecological habitats', 'marine world', 'coral', 'spellbound', 'wildlife', 'preservation', 'environmental impact', 'journey', 'licence', 'offer', 'guided tour', 'travel assistant', 'tourism industry', 'exploring', 'observation', 'relaxation', 'adventurous activities', 'memorable', 'recommendation', 'reservation', 'destination', 'availability', 'facilities', 'equipment', 'location', 'obtain', 'specialise', 'qualification', 'evaluate', 'itinerary', 'safety regulations', 'excursion'];
const FAMILIES = ['snorkelling', 'attractions', 'adventurous', 'spectacular', 'popular', 'preservation', 'exploring', 'observation', 'relaxation', 'recommendation', 'reservation', 'availability', 'specialise', 'qualification', 'location', 'equipment'];
const ISOLATED = { breathtaking: '_5', recommendation: '_5', destination: '_5', availability: '_5', equipment: '_5', evaluate: '_5' };
const vocabIdOf = term => `vocab_${term.replace(/[ -]/g, '_')}${ISOLATED[term] ?? ''}`;
const occIdOf = (term, position) => `u5_${String(position).padStart(2, '0')}_${term.replace(/[ -]/g, '_')}${ISOLATED[term] ?? ''}`;
const NO_FAMILY = TERMS.filter(term => !FAMILIES.includes(term));
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
// The adjective pool is 10 and the noun pool 37, so no noun or adjective is limited. The verb pool is only 3 (obtain, specialise, evaluate), so each verb has
// two other same-POS targets instead of the three the same-part-of-speech stages need: those three words are intentionally held back from Meaning Match
// and from Context Recognise, Apply and Recall. No verbs were added to pad the pool.
const VERB_LIMIT = { meaning: ['match'], context: ['recognise', 'apply', 'recall'] };
const POS_LIMITS = { obtain: VERB_LIMIT, specialise: VERB_LIMIT, evaluate: VERB_LIMIT };
const earlier = [unit1, unit2, unit3, unit4];
const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit5) });
const failed = (pathwayId, occurrenceId) => STAGES.filter(stage => (readiness.pathways[pathwayId].stageFailures[stage] ?? []).some(f => f.occurrenceId === occurrenceId));
const termOf = occurrence => unit5.items.find(item => item.vocabularyId === occurrence.vocabularyId).term;

test('Unit 5 words 1–50 are exactly the fifty locked targets, in order, as a draft with no release artefacts', () => {
  assert.deepEqual(unit5.items.map(item => item.term), TERMS);
  assert.equal(unit5.items.length, 50);
  assert.deepEqual(unit5.occurrences.map(row => row.positionInUnit), Array.from({ length: 50 }, (_, i) => i + 1));
  assert.deepEqual(unit5.occurrences.map(row => row.occurrenceId), TERMS.map((term, i) => occIdOf(term, i + 1)));
  assert.deepEqual(unit5.items.map(row => row.vocabularyId), TERMS.map(vocabIdOf));
  assert.equal(unit5.occurrences[10].occurrenceId, 'u5_11_breathtaking_5');
  assert.equal(unit5.items[10].vocabularyId, 'vocab_breathtaking_5');
  assert.equal(unit5.unitNumber, 5);
  assert.equal(unit5.unitTitle, 'Holidays');
  assert.equal(unit5.status, 'draft');
  assert.ok(fs.existsSync(new URL('../content/vocabulary/units/unit-05-draft.js', import.meta.url)), 'unit-05-draft.js is still the only source');
  for (const name of ['units/unit-05-unit-check.js', 'units/unit-05-games.js']) assert.ok(!fs.existsSync(new URL(`../content/vocabulary/${name}`, import.meta.url)), name);
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

test('IDs are Unit 5-specific, unique, and never collide with Units 1–4; only breathtaking, recommendation, destination, availability, equipment and evaluate repeat an earlier target and are isolated with _5', () => {
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
  assert.deepEqual(TERMS.filter(term => earlierTerms.has(term)), ['breathtaking', 'recommendation', 'destination', 'availability', 'equipment', 'evaluate'], 'the only exact earlier-unit targets');
  assert.deepEqual(unit5.items.filter(row => /_5$/.test(row.vocabularyId)).map(row => row.term), ['breathtaking', 'recommendation', 'destination', 'availability', 'equipment', 'evaluate']);
  assert.deepEqual(unit5.occurrences.filter(row => /_5$/.test(row.occurrenceId)).map(row => row.occurrenceId), ['u5_11_breathtaking_5', 'u5_37_recommendation_5', 'u5_39_destination_5', 'u5_40_availability_5', 'u5_42_equipment_5', 'u5_47_evaluate_5']);
  const u4 = unit4.items.find(row => row.term === 'breathtaking');
  assert.equal(u4.vocabularyId, 'vocab_breathtaking');
  assert.ok(unit4.occurrences.some(row => row.occurrenceId === 'u4_01_breathtaking' && row.vocabularyId === 'vocab_breathtaking'));
  assert.notEqual(unit5.items[10].senses[0].meaning, u4.senses[0].meaning, 'Unit 5 sense is tourism-specific');
  assert.ok(unit5.occurrences.every(row => /^u5_\d{2}_/.test(row.occurrenceId)));
  assert.ok(unit5.activities.every(row => /^u5_/.test(row.activityContentId) && row.unitNumber === 5));
});

test('no Unit 5 target is a word-family form of an earlier unit (except recommendation, which is isolated), and earlier-unit content is untouched', () => {
  const forms = new Set();
  for (const unit of earlier) for (const item of unit.items) for (const form of item.wordFamily ?? []) forms.add(String(form).toLowerCase());
  assert.deepEqual(TERMS.filter(term => forms.has(term)), ['recommendation'], 'recommendation is a family form of Unit 1 recommend and an exact Unit 3 target, so it is isolated as recommendation_5');
  assert.deepEqual(earlier.map(unit => unit.status), ['approved', 'approved', 'approved', 'approved']);
  assert.deepEqual(earlier.map(unit => unit.occurrences.length), [50, 50, 50, 50]);
  assert.equal(JSON.stringify(unit4).includes('breathtaking_5'), false, 'Unit 4 untouched by the Unit 5 isolation');
});

test('every pathway stage is buildable for all 50 words, except the documented Word Family limit and the three-verb same-POS limit', () => {
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

test('words 1–50 satisfy the strict (approved) content schema; only whole-unit count rules remain', () => {
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

test('wrong situations are not near-duplicates of each other inside Unit 5', () => {
  const rows = unit5.items.flatMap(item => item.senses[0].situationDistractors.map(text => ({ term: item.term, text })));
  const words = text => new Set(text.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(word => word.length > 3));
  const close = [];
  for (let i = 0; i < rows.length; i += 1) for (let j = i + 1; j < rows.length; j += 1) {
    const a = words(rows[i].text), b = words(rows[j].text);
    const shared = [...a].filter(word => b.has(word)).length;
    if (shared / (a.size + b.size - shared) > 0.6) close.push(`${rows[i].term} / ${rows[j].term}`);
  }
  assert.deepEqual(close, []);
});

test('Word Families: only the sixteen genuine families are authored; the thirty-four others are left unavailable rather than padded', () => {
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
  assert.equal(familyItems.length, 48);
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

test('Batch 3 (words 21–30): exact forms, IDs, no "(job title)" label, noun senses only', () => {
  const batch = ['coral', 'spellbound', 'wildlife', 'preservation', 'environmental impact', 'journey', 'licence', 'offer', 'guided tour', 'travel assistant'];
  assert.deepEqual(unit5.items.slice(20, 30).map(item => item.term), batch);
  assert.deepEqual(unit5.occurrences.slice(20, 30).map(row => row.occurrenceId), ['u5_21_coral', 'u5_22_spellbound', 'u5_23_wildlife', 'u5_24_preservation', 'u5_25_environmental_impact', 'u5_26_journey', 'u5_27_licence', 'u5_28_offer', 'u5_29_guided_tour', 'u5_30_travel_assistant']);
  assert.ok(unit5.items.every(item => !/job title/i.test(item.term)));
  assert.deepEqual(unit5.items.slice(20, 30).map(item => item.partOfSpeech), ['noun', 'adjective', 'noun', 'noun', 'noun', 'noun', 'noun', 'noun', 'noun', 'noun']);
  assert.equal(unit5.items.slice(20, 30).filter(item => /_5$/.test(item.vocabularyId)).length, 0, 'no other collision, so no further _5 isolation');
});

test('licence is the British noun spelling everywhere except the spelling-error data and the teacher note; offer is the noun only', () => {
  const texts = [];
  for (const context of unit5.contexts) texts.push(context.text);
  for (const item of unit5.items) {
    const sense = item.senses[0];
    texts.push(sense.meaning, sense.meaningSentence ?? '', ...sense.masteryContexts.map(c => `${c.text} ${c.meaning}`), ...(sense.masteryPassages ?? []).map(p => p.text), ...(sense.acceptedParaphrases ?? []));
  }
  for (const activity of unit5.activities) texts.push(JSON.stringify(activity.activityData));
  assert.doesNotMatch(texts.join('\n').toLowerCase(), /\blicen[sz]e[sd]?\b|\blicensing\b/);
  const offerItem = unit5.items.find(item => item.term === 'offer');
  assert.equal(offerItem.partOfSpeech, 'noun');
  const offerText = [...unit5.contexts.filter(c => c.vocabularyId === offerItem.vocabularyId).map(c => c.text), ...offerItem.senses[0].masteryContexts.map(c => c.text), ...(offerItem.senses[0].masteryPassages ?? []).map(p => p.text)].join(' ');
  assert.doesNotMatch(offerText, /\b(to offer|we offer|they offer|offers (a|an|the)|offered)\b/i, 'offer is used as a noun only');
});

test('close neighbours are not blurred: preservation vs conservation, journey vs expedition', () => {
  const pick = term => JSON.stringify(unit5.items.find(item => item.term === term).senses[0]).toLowerCase();
  assert.doesNotMatch(pick('preservation'), /conservation/);
  assert.doesNotMatch(pick('journey'), /expedition/);
  assert.doesNotMatch(pick('guided tour'), /sightseeing/);
  assert.doesNotMatch(pick('expedition'), /"[^"]*\bjourney\b[^"]*"\s*,\s*"acceptedParaphrases"/);
});

test('gap-fill: when the gap follows "a"/"an", every option starts with the same kind of letter (no article giveaway)', () => {
  const vowel = word => /^[aeiou]/i.test(word);
  for (const item of unit5.items) {
    const sense = item.senses[0];
    for (const [index, gap] of sense.gapDistractors.entries()) {
      const context = unit5.contexts.find(c => c.vocabularyId === item.vocabularyId && c.contextId.endsWith(`_gap_${gap.id}`)) ?? unit5.contexts.filter(c => c.vocabularyId === item.vocabularyId && /_gap_/.test(c.contextId))[index];
      const match = context.text.match(new RegExp(`\\b(a|an) ${item.term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i'));
      if (!match) continue;
      const options = [gap.answer, ...(gap.wrong ?? gap.distractors)];
      assert.equal(new Set(options.map(option => vowel(option))).size, 1, `${item.term}: "${match[0]}" gives the answer away through a/an`);
    }
  }
});

test('no stale "not locked" or "not authored" draft comments; the 50-word list is described as locked', () => {
  for (const name of ['draft', 'activities', 'collocations', 'context-passages', 'meaning-mastery', 'meaning-match', 'precision-use', 'situation-extras', 'word-families', 'word-family-alternates', 'word-family-items']) {
    const text = fs.readFileSync(new URL(`../content/vocabulary/units/unit-05-${name}.js`, import.meta.url), 'utf8');
    assert.doesNotMatch(text, /not locked yet|Words 21–50|Words 31–50|WORDS 1–30|words 1–30|WORDS 1–40|words 1–40|WORDS 1–20|words 1–20|batches 1–[234]\b|not authored yet/, name);
  }
  assert.match(fs.readFileSync(new URL('../content/vocabulary/units/unit-05-draft.js', import.meta.url), 'utf8'), /full 50-word list is locked/);
});

test('Batch 4 (words 31–40): exact forms, IDs, three _5 isolations, earlier-unit items untouched', () => {
  const batch = ['tourism industry', 'exploring', 'observation', 'relaxation', 'adventurous activities', 'memorable', 'recommendation', 'reservation', 'destination', 'availability'];
  assert.deepEqual(unit5.items.slice(30, 40).map(item => item.term), batch);
  assert.deepEqual(unit5.occurrences.slice(30, 40).map(row => row.occurrenceId), ['u5_31_tourism_industry', 'u5_32_exploring', 'u5_33_observation', 'u5_34_relaxation', 'u5_35_adventurous_activities', 'u5_36_memorable', 'u5_37_recommendation_5', 'u5_38_reservation', 'u5_39_destination_5', 'u5_40_availability_5']);
  assert.deepEqual(unit5.items.slice(30, 40).map(item => item.vocabularyId), ['vocab_tourism_industry', 'vocab_exploring', 'vocab_observation', 'vocab_relaxation', 'vocab_adventurous_activities', 'vocab_memorable', 'vocab_recommendation_5', 'vocab_reservation', 'vocab_destination_5', 'vocab_availability_5']);
  assert.deepEqual(unit5.items.slice(30, 40).map(item => item.partOfSpeech), ['noun', 'noun', 'noun', 'noun', 'noun', 'adjective', 'noun', 'noun', 'noun', 'noun']);
  // Each isolated item keeps its earlier-unit original exactly where it was, with its own sense.
  const checks = [[unit3, 'recommendation', 'vocab_recommendation', 'vocab_recommendation_5'], [unit4, 'destination', 'vocab_destination', 'vocab_destination_5'], [unit2, 'availability', 'vocab_availability', 'vocab_availability_5']];
  for (const [unit, term, oldId, newId] of checks) {
    const original = unit.items.find(row => row.term === term);
    assert.equal(original.vocabularyId, oldId);
    assert.ok(unit.occurrences.some(row => row.vocabularyId === oldId), `${term} occurrence still in its own unit`);
    const isolated = unit5.items.find(row => row.vocabularyId === newId);
    assert.equal(isolated.term, term);
    assert.notEqual(isolated.senses[0].meaning, original.senses[0].meaning, `${term}: Unit 5 sense is tourism-specific`);
    assert.ok(unit5.items.every(row => row.vocabularyId !== oldId), `${oldId} is never reused in Unit 5`);
    assert.ok(isolated.senses[0].teacherNote.includes(oldId), `${term} teacher note names the earlier item`);
    assert.deepEqual(isolated.senses[0].spellingErrors, original.senses[0].spellingErrors, `${term} shares the reviewed spelling list`);
  }
  assert.ok(!unit5.items.some(row => row.term === 'recommend'), 'the related Unit 1 word "recommend" is not an exact duplicate and is not isolated');
  const ids = new Set(unit5.items.map(row => row.vocabularyId));
  for (const activity of unit5.activities) for (const linked of activity.activityData.linkedVocabularyIds) assert.ok(ids.has(linked), `${activity.activityContentId} links to a Unit 5 item`);
  for (const activity of unit5.activities.filter(row => row.activityData.taskType === 'word_family')) assert.ok(!['vocab_recommendation', 'vocab_destination', 'vocab_availability'].includes(activity.activityData.linkedVocabularyIds[0]));
  assert.deepEqual(unit5.items.slice(30, 40).filter(item => item.senses[0].wordFamilyForms?.length).map(item => item.term), ['exploring', 'observation', 'relaxation', 'recommendation', 'reservation', 'availability']);
  for (const term of ['recommendation', 'availability']) assert.ok(unit5.items.find(item => item.term === term).senses[0].wordFamilyForms.every(form => form.form), term);
});

test('Unit 5 gap sentences, mastery sentences, passages and wrong situations are not near-copies of Units 1–4', () => {
  const words = text => new Set(text.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(word => word.length > 3));
  const earlierRows = [];
  for (const unit of earlier) {
    for (const context of unit.contexts) earlierRows.push(context.text);
    for (const item of unit.items) {
      for (const context of item.senses[0].masteryContexts ?? []) earlierRows.push(context.text);
      earlierRows.push(...(item.senses[0].situationDistractors ?? []), ...(item.senses[0].masteryPassages ?? []).map(passage => passage.text));
    }
  }
  const earlierSets = earlierRows.map(words);
  const rows = [];
  for (const item of unit5.items) {
    rows.push(...unit5.contexts.filter(context => context.vocabularyId === item.vocabularyId && /_gap_/.test(context.contextId)).map(context => [item.term, context.text]));
    rows.push(...item.senses[0].masteryContexts.map(context => [item.term, context.text]), ...item.senses[0].situationDistractors.map(text => [item.term, text]), ...(item.senses[0].masteryPassages ?? []).map(passage => [item.term, passage.text]));
  }
  const close = [];
  for (const [term, text] of rows) {
    const a = words(text);
    if (earlierSets.some(b => { const shared = [...a].filter(word => b.has(word)).length; return shared / (a.size + b.size - shared) > 0.6; })) close.push(`${term}: ${text}`);
  }
  assert.deepEqual(close, []);
});

test('Batch 4 sense boundaries: reservation vs confirmation, destination vs journey, availability vs popularity, recommendation vs advertisement, memorable vs the visual adjectives', () => {
  const sense = term => unit5.items.find(item => item.term === term).senses[0];
  assert.doesNotMatch(JSON.stringify([sense('reservation').meaning, sense('reservation').acceptedParaphrases]), /confirm/i);
  assert.doesNotMatch(JSON.stringify([sense('destination').meaning, sense('destination').acceptedParaphrases]), /journey|\btrip\b/i);
  assert.doesNotMatch(JSON.stringify([sense('availability').meaning, sense('availability').acceptedParaphrases]), /popular/i);
  assert.doesNotMatch(JSON.stringify([sense('recommendation').meaning, sense('recommendation').acceptedParaphrases]), /advert|promot/i);
  assert.match(sense('recommendation').meaning, /experience/);
  assert.doesNotMatch(JSON.stringify(sense('memorable')), /spectacular|stunning|breathtaking|dramatic/i);
  for (const item of unit5.items.slice(0, 30)) assert.doesNotMatch(JSON.stringify(item.senses[0].gapDistractors), /"(memorable|availability|reservation|destination)"/, `${item.term}: a Batch 4 target is not used as a wrong option in earlier items`);
  assert.equal(unit5.items.find(item => item.term === 'adventurous activities').partOfSpeech, 'noun');
  assert.doesNotMatch(JSON.stringify(unit5).toLowerCase(), /availabilities/);
});

test('Batch 5 (words 41–50): exact forms, IDs and parts of speech; only equipment and evaluate are new exact collisions', () => {
  const batch = ['facilities', 'equipment', 'location', 'obtain', 'specialise', 'qualification', 'evaluate', 'itinerary', 'safety regulations', 'excursion'];
  assert.deepEqual(unit5.items.slice(40).map(item => item.term), batch);
  assert.deepEqual(unit5.occurrences.slice(40).map(row => row.occurrenceId), ['u5_41_facilities', 'u5_42_equipment_5', 'u5_43_location', 'u5_44_obtain', 'u5_45_specialise', 'u5_46_qualification', 'u5_47_evaluate_5', 'u5_48_itinerary', 'u5_49_safety_regulations', 'u5_50_excursion']);
  assert.deepEqual(unit5.items.slice(40).map(item => item.vocabularyId), ['vocab_facilities', 'vocab_equipment_5', 'vocab_location', 'vocab_obtain', 'vocab_specialise', 'vocab_qualification', 'vocab_evaluate_5', 'vocab_itinerary', 'vocab_safety_regulations', 'vocab_excursion']);
  assert.deepEqual(unit5.items.slice(40).map(item => item.partOfSpeech), ['noun', 'noun', 'noun', 'verb', 'verb', 'noun', 'verb', 'noun', 'noun', 'noun']);
  assert.equal(unit5.items.filter(item => /_5$/.test(item.vocabularyId)).length, 6);
  // The other eight have no exact earlier-unit target; related words (equip, safety, regulation, accommodate, licence) are not isolated.
  const earlierTerms = new Set(earlier.flatMap(unit => unit.items.map(item => item.term.toLowerCase())));
  assert.deepEqual(batch.filter(term => earlierTerms.has(term)), ['equipment', 'evaluate']);
});

test('Batch 5 isolation: Unit 2 and Unit 4 equipment and Unit 3 evaluate stay exactly where they were, and Unit 5 never reuses their IDs', () => {
  const eq2 = unit2.items.find(row => row.term === 'equipment');
  const eq4 = unit4.items.find(row => row.term === 'equipment');
  const ev3 = unit3.items.find(row => row.term === 'evaluate');
  assert.equal(eq2.vocabularyId, 'vocab_equipment');
  assert.equal(eq4.vocabularyId, 'vocab_equipment_4');
  assert.equal(ev3.vocabularyId, 'vocab_evaluate');
  assert.ok(unit2.occurrences.some(row => row.vocabularyId === 'vocab_equipment'));
  assert.ok(unit4.occurrences.some(row => row.vocabularyId === 'vocab_equipment_4'));
  assert.ok(unit3.occurrences.some(row => row.vocabularyId === 'vocab_evaluate'));
  assert.equal(JSON.stringify(unit2).includes('equipment_5') || JSON.stringify(unit3).includes('evaluate_5') || JSON.stringify(unit4).includes('equipment_5'), false, 'earlier units untouched by the Unit 5 isolation');
  const ids = new Set(unit5.items.map(row => row.vocabularyId));
  for (const old of ['vocab_equipment', 'vocab_equipment_4', 'vocab_evaluate']) assert.ok(!ids.has(old), `${old} is never reused in Unit 5`);
  for (const [term, original, isolated] of [['equipment', eq2, 'vocab_equipment_5'], ['evaluate', ev3, 'vocab_evaluate_5']]) {
    const item = unit5.items.find(row => row.vocabularyId === isolated);
    assert.equal(item.term, term);
    assert.notEqual(item.senses[0].meaning, original.senses[0].meaning, `${term}: Unit 5 has its own sense`);
    assert.ok(item.senses[0].teacherNote.includes(`${term}_5`), `${term} teacher note names the isolated id`);
    assert.deepEqual(item.senses[0].spellingErrors, original.senses[0].spellingErrors, `${term} shares the reviewed spelling list`);
  }
  assert.ok(unit5.items.find(row => row.term === 'equipment').senses[0].teacherNote.includes('Unit 2'));
  assert.ok(unit5.items.find(row => row.term === 'evaluate').senses[0].teacherNote.includes('Unit 3'));
  for (const activity of unit5.activities) for (const linked of activity.activityData.linkedVocabularyIds) assert.ok(ids.has(linked), `${activity.activityContentId} links to a Unit 5 item`);
  assert.deepEqual(unit5.activities.filter(row => row.activityData.taskType === 'word_family' && /equipment/.test(row.activityContentId)).map(row => row.activityData.linkedVocabularyIds[0]), ['vocab_equipment_5', 'vocab_equipment_5', 'vocab_equipment_5']);
  for (const id of ['vocab_equipment_5', 'vocab_evaluate_5']) {
    const linked = unit5.activities.filter(row => row.activityData.linkedVocabularyIds.includes(id));
    assert.ok(linked.length >= 4, `${id} has phrase, idea and precision content`);
  }
});

test('Batch 5 Word Families: only specialise, qualification, location and equipment are genuine; the six others are rejected with a reason', () => {
  assert.deepEqual(unit5.items.slice(40).filter(item => item.senses[0].wordFamilyForms?.length).map(item => item.term), ['equipment', 'location', 'specialise', 'qualification'].sort((a, b) => TERMS.indexOf(a) - TERMS.indexOf(b)));
  const forms = term => unit5.items.find(item => item.term === term).senses[0].wordFamilyForms.map(form => form.form);
  assert.deepEqual(forms('specialise'), ['specialise', 'specialist', 'specialisation']);
  assert.deepEqual(forms('qualification'), ['qualification', 'qualify', 'qualified']);
  assert.deepEqual(forms('location'), ['location', 'locate', 'located']);
  assert.deepEqual(forms('equipment'), ['equipment', 'equip', 'equipped']);
  for (const term of ['facilities', 'obtain', 'evaluate', 'itinerary', 'safety regulations', 'excursion']) {
    const item = unit5.items.find(row => row.term === term);
    assert.deepEqual(item.wordFamily, [], term);
    assert.ok(!item.senses[0].wordFamilyForms?.length, term);
  }
  assert.ok(!JSON.stringify(unit5.items.map(item => item.senses[0].wordFamilyForms ?? [])).match(/excursionist|obtainable|evaluator|safely|regulate/), 'no padded or fixed-phrase forms');
});

test('Batch 5 countability and number: equipment is uncountable, facilities and safety regulations are plural, itinerary and excursion are countable', () => {
  const text = JSON.stringify(unit5, (key, value) => (key === 'teacherNote' ? undefined : value)).toLowerCase();
  assert.doesNotMatch(text, /\ban equipment\b|\bequipments\b|\ba facilities\b|\bfacility\b|\ban? safety regulations\b|\bsafety regulation\b|\bitineraries\b|\ban? itinerary of\b|\bsafety regulation s\b/);
  const sentencesOf = term => {
    const item = unit5.items.find(row => row.term === term);
    return [...unit5.contexts.filter(context => context.vocabularyId === item.vocabularyId).map(context => context.text), ...item.senses[0].masteryContexts.map(context => context.text), ...(item.senses[0].masteryPassages ?? []).map(passage => passage.text)];
  };
  assert.ok(sentencesOf('equipment').every(sentence => !/\bequipment (are|were)\b|\bmany equipment\b|\bfew equipment\b/i.test(sentence)));
  assert.ok(sentencesOf('facilities').some(sentence => /\bfacilities (are|include)\b|, including/i.test(sentence)));
  assert.ok(sentencesOf('itinerary').every(sentence => !/\bitinerary (are|were)\b/i.test(sentence)));
  assert.ok(sentencesOf('excursion').every(sentence => !/\bexcursion (are|were)\b/i.test(sentence)));
  assert.ok(unit5.items.find(row => row.term === 'safety regulations').senses[0].masteryContexts.every(context => /safety regulations/i.test(context.text)));
  assert.doesNotMatch(JSON.stringify(unit5.contexts.map(context => context.text)), /\bspecialize|\bspecialization|\bcolour(?!s)\b.{0,0}\bnever\b/i, 'British -ise in context sentences');
});

test('Batch 5 spelling: specialise, qualification, itinerary and regulations are British and spelt correctly in every learner-facing sentence; multi-word misspellings keep both words', () => {
  const learnerFacing = JSON.stringify(unit5, (key, value) => (key === 'teacherNote' || key === 'spellingErrors' ? undefined : value)).toLowerCase();
  assert.doesNotMatch(learnerFacing, /specialize|specialization|organize|recognize|qualifcation|itinary|regulashion/);
  const safety = unit5.items.find(item => item.term === 'safety regulations');
  assert.equal(safety.senses[0].spellingErrors.length, 6);
  assert.ok(safety.senses[0].spellingErrors.every(error => error.split(' ').length === 2 && error !== 'safety regulations'));
  assert.ok(unit5.items.find(item => item.term === 'specialise').senses[0].spellingErrors.includes('specialize'), 'the American spelling is a taught error');
  for (const term of ['facilities', 'equipment', 'location', 'obtain', 'specialise', 'qualification', 'evaluate', 'itinerary', 'safety regulations', 'excursion']) {
    assert.equal(unit5.items.find(item => item.term === term).senses[0].spellingErrors.length, 6, term);
  }
  assert.deepEqual(LEXICAL_SPELLING_ERRORS.vocab_equipment_5 ?? null, null, 'the lexical list itself is untouched; _5 aliases live in the draft only');
  assert.deepEqual(unit5.items.find(item => item.term === 'equipment').senses[0].spellingErrors, LEXICAL_SPELLING_ERRORS.vocab_equipment);
  assert.deepEqual(unit5.items.find(item => item.term === 'evaluate').senses[0].spellingErrors, LEXICAL_SPELLING_ERRORS.vocab_evaluate);
});

test('Batch 5 sense boundaries: facilities vs equipment, excursion vs expedition/journey/guided tour, evaluate vs recommend, qualification vs licence, itinerary vs timetable, safety regulations vs advice, obtain vs buy', () => {
  const sense = term => unit5.items.find(item => item.term === term).senses[0];
  const core = term => JSON.stringify([sense(term).meaning, sense(term).acceptedParaphrases, sense(term).paraphraseSentence, sense(term).productionSentence]).toLowerCase();
  assert.doesNotMatch(core('facilities'), /equipment|\bitems\b|\btools\b/, 'facilities are buildings and services');
  assert.doesNotMatch(core('equipment'), /building|service|\broom/, 'equipment is physical items');
  assert.doesNotMatch(core('excursion'), /journey|expedition|guided tour|\btour\b/);
  assert.match(sense('excursion').meaning, /short/);
  assert.doesNotMatch(core('evaluate'), /recommend|advise|worth choosing/);
  assert.match(sense('evaluate').meaning, /evidence|criteria/);
  assert.doesNotMatch(core('qualification'), /licen[cs]e|permission/);
  assert.doesNotMatch(core('itinerary'), /timetable|\btimes? when\b/);
  assert.doesNotMatch(core('safety regulations'), /\badvice\b|\bsuggestion/);
  assert.match(sense('safety regulations').meaning, /official rules/);
  assert.doesNotMatch(core('obtain'), /\bbuy\b|\bpurchase|\bpay\b/);
  assert.doesNotMatch(core('location'), /destination/);
  assert.equal(sense('location').teacherNote.includes('destination'), true);
  assert.match(sense('specialise').teacherNote, /British/);
});

test('Batch 5 readiness: Meaning, Context, Paraphrasing, Precision & Use and Spelling & Recall are LIVE for all 50 words (verbs held from the same-part-of-speech stages); Word Families stays locked at 16 words', () => {
  const live = id => readiness.pathways[id].live;
  for (const id of ['meaning', 'context', 'paraphrasing', 'precision_use', 'spelling_recall']) assert.equal(live(id), true, id);
  assert.equal(live('word_families'), false);
  assert.equal(readiness.pathways.word_families.servedCount, 16);
  assert.equal(readiness.pathways.paraphrasing.servedCount, 50);
  assert.equal(readiness.pathways.precision_use.servedCount, 50);
  assert.equal(readiness.pathways.spelling_recall.servedCount, 50);
  assert.equal(readiness.pathways.meaning.servedCount, 47);
  assert.equal(readiness.pathways.context.servedCount, 47);
  assert.deepEqual([readiness.pathways.paraphrasing.setCount, readiness.pathways.precision_use.setCount, readiness.pathways.spelling_recall.setCount], [5, 5, 5]);
  const verbs = unit5.items.filter(item => item.partOfSpeech === 'verb').map(item => item.term);
  assert.deepEqual(verbs, ['obtain', 'specialise', 'evaluate'], 'the verb pool is three, so no verb can have three same-POS distractors; none were added to pad it');
});
