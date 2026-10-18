import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { activityDefinition } from '../src/vocabulary/activity-catalogue.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';
import {
  markCuratedAnswer, isSpotMeaningChangeReady, spotMeaningChangeMarking
} from '../supabase/functions/_shared/vocabulary-engine.js';

const TYPE = 'spot_meaning_change';
const SEEDS = Array.from({ length: 12 }, (_, index) => `seed-${index}`);
const ideaRecords = unit1.activities.filter(activity => activity.contentType === 'idea_set');

function words(value) { return String(value ?? '').trim().split(/\s+/).filter(Boolean).length; }
function source(path) { return fs.readFileSync(new URL(path, import.meta.url), 'utf8'); }
function targetFor(record) {
  const vocabularyId = record.activityData.linkedVocabularyIds[0];
  const item = unit1.items.find(row => row.vocabularyId === vocabularyId);
  const occurrence = unit1.occurrences.find(row => row.vocabularyId === vocabularyId);
  const contexts = unit1.contexts.filter(row => row.occurrenceId === occurrence.occurrenceId);
  return { item, occurrence, contexts, sense:item.senses.find(sense => sense.senseId === occurrence.senseId) ?? item.senses[0] };
}
function build(record, activityType, seed, extra = {}) {
  const { item, occurrence, contexts } = targetFor(record);
  return buildActivity({ activityType, occurrence, item, contexts, unitActivities:[record], unitItems:unit1.items, unitContexts:unit1.contexts, unitOccurrences:unit1.occurrences, mastery:{ status:'secure' }, readinessStage:'secure', seed, ...extra });
}
// Mirrors markVocabularyAttemptLocally() in src/vocabulary/app.js (used identically by student sessions and Staff Preview).
function markLikeClient(question, sense, vocabularyId, rawAnswer) {
  const reference = question.markingReference ?? {};
  const context = { contextId:question.contentId, activityContentId:null, acceptedAnswers:reference.acceptedAnswers ?? [], distractors:reference.distractors ?? [] };
  return markCuratedAnswer({ item:{ vocabularyId }, sense, context, questionType:question.type, rawAnswer });
}
// Mirrors unitActivityMarking() + markCuratedAnswer() in supabase/functions/vocabulary-attempt-action/index.ts.
function markLikeServer(record, activityVariantId, sense, vocabularyId, rawAnswer) {
  const marking = spotMeaningChangeMarking(record.activityData, activityVariantId);
  const context = { contextId:record.activityContentId, activityContentId:record.activityContentId, ...marking };
  return markCuratedAnswer({ item:{ vocabularyId }, sense, context, questionType:TYPE, rawAnswer });
}
function correctOptions(question, sense, vocabularyId) {
  return question.options.filter(option => markLikeClient(question, sense, vocabularyId, option).correct);
}
function assertExactlyOneCorrect(question, sense, vocabularyId) {
  const accepted = correctOptions(question, sense, vocabularyId);
  if (accepted.length !== 1) throw new Error(`Expected exactly one accepted option but ${accepted.length} are accepted: ${accepted.join(' | ')}`);
}

test('Unit 1 idea bank exists and every idea set can support Spot the Meaning Change', () => {
  assert.equal(ideaRecords.length, 12);
  for (const record of ideaRecords) assert.equal(isSpotMeaningChangeReady(record.activityData), true, record.activityContentId);
});

test('approved Unit 1 same-meaning replacements preserve intensity and estimation', () => {
  const intense = ideaRecords.find(row => row.activityContentId === 'u1_idea_intense');
  const estimated = ideaRecords.find(row => row.activityContentId === 'u1_idea_estimated');
  assert.ok(intense.activityData.accurateParaphrases.includes('The final ten minutes of the game were extremely demanding.'));
  assert.equal(intense.activityData.accurateParaphrases.includes('The final ten minutes of the game were extremely hard-fought.'), false);
  assert.ok(estimated.activityData.accurateParaphrases.includes('The expected cost of the new sports centre is roughly five million dollars.'));
  assert.equal(estimated.activityData.accurateParaphrases.includes('The new sports centre costs roughly five million dollars.'), false);
});

test('1. exactly 4 options are displayed for every idea and seed', () => {
  for (const record of ideaRecords) for (const seed of SEEDS) {
    const question = build(record, TYPE, seed);
    assert.equal(question.options.length, 4, `${record.activityContentId}/${seed}`);
    assert.equal(new Set(question.options).size, 4, `${record.activityContentId}/${seed}: duplicate options`);
  }
});

test('2. exactly 1 displayed option is accepted (client marking)', () => {
  for (const record of ideaRecords) for (const seed of SEEDS) {
    const question = build(record, TYPE, seed);
    const { sense, item } = targetFor(record);
    assert.deepEqual(correctOptions(question, sense, item.vocabularyId).length, 1, `${record.activityContentId}/${seed}`);
    assert.equal(question.markingReference.acceptedAnswers.length, 1, 'acceptedAnswers holds only the single selected option');
    assert.equal(question.markingReference.distractors.length, 1, 'only the selected distractor is in the marking reference');
  }
});

test('3. the accepted option is a curated meaning-changing distractor with a curated misconception category', () => {
  for (const record of ideaRecords) for (const seed of SEEDS) {
    const question = build(record, TYPE, seed);
    const accepted = question.markingReference.acceptedAnswers[0];
    const curated = record.activityData.distractors.find(row => row.text === accepted);
    assert.ok(curated, `${record.activityContentId}/${seed}: accepted option is not a curated distractor`);
    assert.ok(question.options.includes(accepted));
    assert.equal(question.markingReference.distractors[0].misconceptionCategory, curated.misconceptionCategory);
    assert.ok(['degree_change','time_change','cause_effect_change','contrast_change','quantity_change','added_information','omitted_information','meaning_confusion'].includes(curated.misconceptionCategory), curated.misconceptionCategory);
    assert.equal(question.activityVariantId, `q${record.activityData.distractors.indexOf(curated)}`);
  }
});

test('4. the other 3 displayed options are curated same-meaning rewrites and never a distractor', () => {
  for (const record of ideaRecords) for (const seed of SEEDS) {
    const question = build(record, TYPE, seed);
    const accepted = question.markingReference.acceptedAnswers[0];
    const others = question.options.filter(option => option !== accepted);
    assert.equal(others.length, 3);
    for (const option of others) {
      assert.ok(record.activityData.accurateParaphrases.includes(option), `${record.activityContentId}: ${option}`);
      assert.equal(record.activityData.distractors.some(row => row.text === option), false);
    }
  }
});

test('5. all displayed options are sentence-level and shaped alike (no length giveaway)', () => {
  for (const record of ideaRecords) for (const seed of SEEDS) {
    const question = build(record, TYPE, seed);
    for (const option of question.options) {
      assert.ok(words(option) >= 6, `too short for a sentence: ${option}`);
      assert.match(option, /^[A-Z“"].*[.!?]$/u, `not a complete sentence: ${option}`);
      assert.notEqual(option, record.activityData.originalIdea, 'an option must not repeat the original idea verbatim');
    }
    const correct = question.markingReference.acceptedAnswers[0];
    const nearby = question.options.filter(option => option !== correct && Math.abs(words(option) - words(correct)) <= 2).length;
    assert.ok(nearby >= 2, `${record.activityContentId}/${seed}: length giveaway ${question.options.map(words)}`);
    assert.ok(Math.max(...question.options.map(words)) - Math.min(...question.options.map(words)) <= 5, `${record.activityContentId}/${seed}: option lengths vary too much`);
  }
});

test('every possible distractor choice (not just sampled seeds) yields a fair, single-answer question', () => {
  for (const record of ideaRecords) {
    const { sense, item } = targetFor(record);
    record.activityData.distractors.forEach((row, index) => {
      const accurate = record.activityData.accurateParaphrases.slice(0, 3);
      const counts = [row.text, ...accurate].map(words);
      assert.ok(accurate.filter(option => Math.abs(words(option) - words(row.text)) <= 2).length >= 2, `${record.activityContentId} q${index} would be a length giveaway`);
      const server = spotMeaningChangeMarking(record.activityData, `q${index}`);
      assert.deepEqual(server.acceptedAnswers, [row.text]);
      for (const option of accurate) assert.equal(markLikeServer(record, `q${index}`, sense, item.vocabularyId, option).correct, false);
      assert.ok(Math.max(...counts) - Math.min(...counts) <= 5);
    });
  }
});

test('6. deterministic seeds stay deterministic, and different seeds still vary the displayed distractor', () => {
  for (const record of ideaRecords) {
    for (const seed of SEEDS) assert.deepEqual(build(record, TYPE, seed), build(record, TYPE, seed), `${record.activityContentId}/${seed}`);
    const chosen = new Set(Array.from({ length: 40 }, (_, index) => build(record, TYPE, `vary-${index}`).activityVariantId));
    assert.ok(chosen.size >= 2, `${record.activityContentId} always shows the same distractor`);
  }
});

test('7. local (client/preview) and server marking agree exactly for every option', () => {
  for (const record of ideaRecords) for (const seed of SEEDS) {
    const question = build(record, TYPE, seed);
    const { sense, item } = targetFor(record);
    for (const option of question.options) {
      const client = markLikeClient(question, sense, item.vocabularyId, option);
      const server = markLikeServer(record, question.activityVariantId, sense, item.vocabularyId, option);
      assert.equal(client.correct, server.correct, `${record.activityContentId}/${seed}: ${option}`);
      assert.equal(client.misconceptionCategory, server.misconceptionCategory, `${record.activityContentId}/${seed}: ${option}`);
      assert.deepEqual(client.evidence.strands, server.evidence.strands);
    }
    assert.deepEqual(spotMeaningChangeMarking(record.activityData, question.activityVariantId).acceptedAnswers, question.markingReference.acceptedAnswers);
  }
});

test('the server edge function really uses the shared single-answer contract for this activity', () => {
  const server = source('../supabase/functions/vocabulary-attempt-action/index.ts');
  assert.match(server, /import \{[^}]*spotMeaningChangeMarking[^}]*\} from '\.\.\/_shared\/vocabulary-engine\.js'/);
  assert.match(server, /content_type === 'idea_set' && questionType === 'spot_meaning_change'\) return spotMeaningChangeMarking\(data, activityVariantId\)/);
  assert.ok(server.indexOf("questionType === 'spot_meaning_change') return spotMeaningChangeMarking") < server.indexOf("content_type === 'idea_set') return ideaMarking(data)"), 'specific branch must precede the generic idea_set branch');
  assert.match(server, /spot_meaning_change:\{ strands:\['paraphrasing','context'\], evidenceStrength:'medium', productive:false \}/);
});

test('8. a second inaccurate distractor that was NOT selected for the question is rejected (client and server)', () => {
  for (const record of ideaRecords) for (const seed of SEEDS) {
    const question = build(record, TYPE, seed);
    const { sense, item } = targetFor(record);
    const selected = question.markingReference.acceptedAnswers[0];
    const others = record.activityData.distractors.filter(row => row.text !== selected);
    assert.ok(others.length >= 1);
    for (const row of others) {
      assert.equal(markLikeClient(question, sense, item.vocabularyId, row.text).correct, false, `client accepted unselected distractor: ${row.text}`);
      assert.equal(markLikeServer(record, question.activityVariantId, sense, item.vocabularyId, row.text).correct, false, `server accepted unselected distractor: ${row.text}`);
    }
  }
});

test('server rejects forged answers: legacy single-word sense distractors and arbitrary text never count as correct', () => {
  for (const record of ideaRecords) {
    const { sense, item } = targetFor(record);
    for (const forged of [...sense.misleadingDistractors, 'anything at all', record.activityData.originalIdea]) {
      assert.equal(markLikeServer(record, 'q0', sense, item.vocabularyId, forged).correct, false, `${record.activityContentId}: ${forged}`);
    }
  }
});

test('a wrong answer (a same-meaning rewrite) is marked incorrect and records no correct evidence', () => {
  const record = ideaRecords[0];
  const question = build(record, TYPE, 'evidence');
  const { sense, item } = targetFor(record);
  const wrong = question.options.filter(option => option !== question.markingReference.acceptedAnswers[0]);
  assert.equal(wrong.length, 3);
  for (const option of wrong) {
    const result = markLikeClient(question, sense, item.vocabularyId, option);
    assert.equal(result.correct, false);
    assert.equal(result.evidence.correct, false);
  }
});

test('9. Staff Preview and the student flow share one marking contract', () => {
  const app = source('../src/vocabulary/app.js');
  assert.equal((app.match(/markCuratedAnswer\(/g) ?? []).length, 1, 'one marking call site, shared by preview and students');
  assert.equal((app.match(/function markVocabularyAttemptLocally\(/g) ?? []).length, 1);
  assert.match(app, /acceptedAnswers:reference\.acceptedAnswers \?\? \[\], distractors:reference\.distractors \?\? \[\]/);
  assert.match(app, /if\s*\(!state\.preview\)\s+void\s+persistVocabularyAttempt\(/);
  assert.doesNotMatch(app, /state\.preview[^;\n]{0,80}markCuratedAnswer|markCuratedAnswer[^;\n]{0,80}state\.preview/);
  assert.match(app, /activityVariantId:current\.question\.activityVariantId \?\? null/);
});

test('app only offers Spot the Meaning Change where the idea bank can support it', () => {
  const app = source('../src/vocabulary/app.js');
  assert.doesNotMatch(app, /\['same_idea','spot_meaning_change'/);
  assert.match(app, /isSpotMeaningChangeReady\(row\.activityData\)\)\) available\.add\('spot_meaning_change'\)/);
});

test('10. existing idea activities still work: same_idea, build_same_idea, rewrite_idea (and explain_another_way)', () => {
  for (const record of ideaRecords) {
    const { sense, item } = targetFor(record);
    const [reference] = record.activityData.accurateParaphrases;

    const same = build(record, 'same_idea', 'idea-regression');
    assert.equal(same.options.length, 4);
    assert.deepEqual(same.markingReference.acceptedAnswers, [reference]);
    assert.equal(same.options.filter(option => markLikeClient(same, sense, item.vocabularyId, option).correct).length, 1, `${record.activityContentId} same_idea`);

    const tiles = build(record, 'build_same_idea', 'idea-regression');
    assert.ok(tiles.tiles.length >= 2);
    assert.ok(tiles.markingReference.acceptedAnswers.includes(reference), 'first curated paraphrase is still an accepted build');
    assert.equal(markLikeClient(tiles, sense, item.vocabularyId, reference).correct, true);

    const rewrite = build(record, 'rewrite_idea', 'idea-regression');
    assert.deepEqual(rewrite.markingReference.acceptedAnswers, record.activityData.accurateParaphrases);
    for (const accurate of record.activityData.accurateParaphrases) assert.equal(markLikeClient(rewrite, sense, item.vocabularyId, accurate).correct, true, accurate);
    for (const row of record.activityData.distractors) assert.equal(markLikeClient(rewrite, sense, item.vocabularyId, row.text).correct, false, row.text);

    assert.ok(build(record, 'explain_another_way', 'idea-regression', { mastery:{ status:'mastered' }, readinessStage:'mastered' }).markingReference.acceptedAnswers.length >= 1);
  }
});

test('REGRESSION FIXTURE: the old behaviour (all inaccurate distractors accepted) is rejected by the invariant', () => {
  const record = ideaRecords.find(row => row.activityContentId === 'u1_idea_preference');
  const { sense, item } = targetFor(record);
  const data = record.activityData;
  const inaccurate = data.distractors.map(row => row.text);
  const legacy = {
    type:TYPE, contentId:record.activityContentId,
    options:[data.accurateParaphrases[0], ...inaccurate].slice(0, 4),
    markingReference:{ acceptedAnswers:inaccurate, distractors:data.distractors }
  };
  assert.equal(correctOptions(legacy, sense, item.vocabularyId).length, 3, 'fixture reproduces the defect: three answers are accepted');
  assert.throws(() => assertExactlyOneCorrect(legacy, sense, item.vocabularyId), /exactly one accepted option but 3/);
  for (const seed of SEEDS) assert.doesNotThrow(() => assertExactlyOneCorrect(build(record, TYPE, seed), sense, item.vocabularyId));
});

test('readiness gate: banks with fewer than three same-meaning rewrites are not offered, built, or marked', () => {
  const record = ideaRecords[0];
  const thin = { ...record, activityData:{ ...record.activityData, accurateParaphrases:record.activityData.accurateParaphrases.slice(0, 1) } };
  assert.equal(isSpotMeaningChangeReady(thin.activityData), false);
  assert.throws(() => build(thin, TYPE, 'thin'), /three curated same-meaning rewrites/);
  assert.throws(() => spotMeaningChangeMarking(thin.activityData, 'q0'), /not ready/);
  const duplicated = { ...record.activityData, accurateParaphrases:[...record.activityData.accurateParaphrases.slice(0, 1), record.activityData.accurateParaphrases[0], record.activityData.accurateParaphrases[0]] };
  assert.equal(isSpotMeaningChangeReady(duplicated), false, 'duplicates do not count as distinct rewrites');
  const overlapping = { ...record.activityData, distractors:record.activityData.accurateParaphrases.map(text => ({ text, misconceptionCategory:'meaning_confusion' })) };
  assert.equal(isSpotMeaningChangeReady(overlapping), false, 'a distractor identical to a same-meaning rewrite is unusable');
});

test('server contract requires a valid variant: missing, malformed or out-of-range variants are refused', () => {
  const data = ideaRecords[0].activityData;
  for (const variant of [null, undefined, '', 'q', 'x1', 'q-1', 'q1.5', `q${data.distractors.length}`, 'q999']) {
    assert.throws(() => spotMeaningChangeMarking(data, variant), /variant/i, String(variant));
  }
  data.distractors.forEach((_, index) => assert.doesNotThrow(() => spotMeaningChangeMarking(data, `q${index}`)));
});

test('catalogue classifies Spot the Meaning Change as medium recognition evidence, not productive proof', () => {
  const definition = activityDefinition(TYPE);
  assert.deepEqual(definition.strands, ['paraphrasing', 'context']);
  assert.equal(definition.evidenceStrength, 'medium');
  assert.equal(definition.productive, false);
  const question = build(ideaRecords[0], TYPE, 'catalogue');
  assert.deepEqual(question.strands, definition.strands);
  assert.equal(question.evidenceStrength, definition.evidenceStrength);
  assert.equal(question.responseMode, 'choice');
});

test('Unit 1 idea bank integrity: distinct same-meaning rewrites that never collide with a distractor', () => {
  for (const record of ideaRecords) {
    const { accurateParaphrases, distractors, originalIdea } = record.activityData;
    assert.ok(accurateParaphrases.length >= 3, record.activityContentId);
    assert.equal(new Set(accurateParaphrases.map(text => text.toLowerCase())).size, accurateParaphrases.length, `${record.activityContentId}: duplicate accurate paraphrase`);
    for (const text of accurateParaphrases) {
      assert.notEqual(text, originalIdea);
      assert.equal(distractors.some(row => row.text.toLowerCase() === text.toLowerCase()), false, `${record.activityContentId}: accurate paraphrase equals a distractor`);
    }
  }
});