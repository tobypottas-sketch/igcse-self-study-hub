import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';

function buildFor(vocabularyId, activityType, status) {
  const occurrence = unit1.occurrences.find(row => row.vocabularyId === vocabularyId);
  const item = unit1.items.find(row => row.vocabularyId === vocabularyId);
  assert.ok(occurrence, `missing occurrence for ${vocabularyId}`);
  assert.ok(item, `missing item for ${vocabularyId}`);
  return buildActivity({
    activityType,
    occurrence,
    item,
    contexts:unit1.contexts.filter(row => row.occurrenceId === occurrence.occurrenceId),
    unitActivities:unit1.activities,
    unitItems:unit1.items,
    unitContexts:unit1.contexts,
    unitOccurrences:unit1.occurrences,
    mastery:{ status },
    seed:`source-text:${activityType}:${vocabularyId}`
  });
}

function assertSourceShownOnce(question) {
  assert.ok(question.sourceText, 'question should expose sourceText for the dedicated source-text panel');
  assert.equal(question.prompt.includes(question.sourceText), false, 'sourceText must not also be duplicated inside the prompt');
}

test('Word Family Switch keeps the source sentence out of the prompt', () => {
  const question = buildFor('vocab_competitor', 'word_family_switch', 'building');
  assertSourceShownOnce(question);
  assert.equal(question.prompt, 'Use the correct form from the compete word family.');
});

test('Improve the Vocabulary keeps the source sentence out of the prompt', () => {
  const question = buildFor('vocab_intense', 'improve_vocabulary', 'secure');
  assertSourceShownOnce(question);
  assert.equal(question.prompt, 'Replace the repeated general adjective with a more precise Unit 1 word.');
});
