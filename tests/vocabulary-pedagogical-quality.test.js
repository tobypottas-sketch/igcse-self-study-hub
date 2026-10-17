import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';

function target(vocabularyId) {
  const occurrence = unit1.occurrences.find(row => row.vocabularyId === vocabularyId);
  const item = unit1.items.find(row => row.vocabularyId === vocabularyId);
  const contexts = unit1.contexts.filter(row => row.occurrenceId === occurrence?.occurrenceId);
  assert.ok(occurrence, `missing occurrence ${vocabularyId}`);
  assert.ok(item, `missing item ${vocabularyId}`);
  return { occurrence, item, contexts };
}
function build(vocabularyId, activityType, status = 'new', seed = 'pedagogical-quality') {
  const { occurrence, item, contexts } = target(vocabularyId);
  return buildActivity({ activityType, occurrence, item, contexts, unitActivities:unit1.activities, unitItems:unit1.items, unitContexts:unit1.contexts, unitOccurrences:unit1.occurrences, mastery:{ status }, readinessStage:status, seed });
}
function words(value) { return String(value ?? '').trim().split(/\s+/).filter(Boolean).length; }
function assertFour(activity) { assert.equal(activity.options?.length, 4, `${activity.type}: ${activity.options?.join(' | ')}`); }
function assertNoLengthGiveaway(activity) {
  assertFour(activity);
  const correct = activity.markingReference.acceptedAnswers[0];
  const correctWords = words(correct);
  const distractorWords = activity.options.filter(option => option !== correct).map(words);
  const nearby = distractorWords.filter(count => Math.abs(count - correctWords) <= 2).length;
  assert.ok(nearby >= 2, `${activity.type} has a length giveaway: ${activity.options.join(' | ')}`);
}
const freshTargets = unit1.occurrences.map(row => row.vocabularyId);

test('all Unit 1 meaning choices use four parallel short meanings without a longest-answer giveaway', () => {
  for (const vocabularyId of freshTargets) {
    const meaning = build(vocabularyId, 'meaning_match', 'new', `${vocabularyId}:meaning_match`);
    assertNoLengthGiveaway(meaning);
    assert.ok(meaning.options.every(option => words(option) <= 8), `${vocabularyId} meaning_match: ${meaning.options.join(' | ')}`);
    const context = build(vocabularyId, 'meaning_in_context', 'building', `${vocabularyId}:meaning_in_context`);
    assertNoLengthGiveaway(context);
    assert.ok(context.options.every(option => words(option) <= 8), `${vocabularyId} meaning_in_context: ${context.options.join(' | ')}`);
  }
});
test('all Unit 1 Which Situation Fits choices are four target-free full situations of comparable length', () => {
  for (const vocabularyId of freshTargets) {
    const { item } = target(vocabularyId);
    const activity = build(vocabularyId, 'which_situation_fits', 'new', `${vocabularyId}:situation`);
    assertFour(activity);
    const counts = activity.options.map(words);
    assert.ok(activity.options.every(option => words(option) >= 6), `${vocabularyId}: ${activity.options.join(' | ')}`);
    assert.ok(activity.options.every(option => !option.toLocaleLowerCase('en').includes(item.term.toLocaleLowerCase('en'))), `${vocabularyId}: target leaked into ${activity.options.join(' | ')}`);
    assert.ok(Math.max(...counts) <= Math.min(...counts) * 2, `${vocabularyId}: unbalanced situations ${activity.options.join(' | ')}`);
  }
});
test('Unit 1 Same Idea activities always offer four sentence-level alternatives, not a 50/50 opposite pair', () => {
  const ideaTargets = unit1.activities.filter(row => row.contentType === 'idea_set').flatMap(row => row.activityData.linkedVocabularyIds ?? []);
  for (const vocabularyId of new Set(ideaTargets)) {
    const activity = build(vocabularyId, 'same_idea', 'building', `${vocabularyId}:same-idea`);
    assertFour(activity);
    assert.ok(activity.options.every(option => words(option) >= 6), `${vocabularyId}: ${activity.options.join(' | ')}`);
    assert.equal(activity.options.filter(option => activity.markingReference.acceptedAnswers.includes(option)).length, 1, vocabularyId);
  }
});
test('Unit 1 Phrase Match activities always offer four plausible phrase-level alternatives', () => {
  const phraseTargets = unit1.activities.filter(row => row.contentType === 'phrase_set').flatMap(row => row.activityData.linkedVocabularyIds ?? []);
  for (const vocabularyId of new Set(phraseTargets)) {
    const activity = build(vocabularyId, 'phrase_match', 'new', `${vocabularyId}:phrase-match`);
    assertFour(activity);
    assert.ok(activity.options.every(option => words(option) >= 2), `${vocabularyId}: ${activity.options.join(' | ')}`);
  }
});
test('Question ↔ Text Bridge gives four comparable question choices and never copied source wording as the answer', () => {
  const activity = build('vocab_leisure', 'question_text_bridge', 'building', 'bridge-quality');
  assertNoLengthGiveaway(activity);
  assert.ok(activity.options.every(option => option.endsWith('?')), activity.options.join('\n'));
  assert.deepEqual(activity.markingReference.acceptedAnswers, [activity.questionText]);
  assert.ok(!activity.sourceText.toLocaleLowerCase('en').includes(activity.questionText.toLocaleLowerCase('en')), 'correct bridge answer must not simply be copied from the source text');
});
test('Find Evidence gives four exact source-text choices rather than a two-option giveaway', () => {
  const activity = build('vocab_leisure', 'find_evidence', 'building', 'find-evidence-quality');
  const source = activity.sourceText.toLocaleLowerCase('en');
  assert.equal(activity.evidenceOptions.length, 4, activity.evidenceOptions.join(' | '));
  assert.ok(activity.evidenceOptions.every(answer => source.includes(answer.toLocaleLowerCase('en'))), activity.evidenceOptions.join(' | '));
  assert.ok(activity.markingReference.acceptedAnswers.every(answer => source.includes(answer.toLocaleLowerCase('en'))));
});
