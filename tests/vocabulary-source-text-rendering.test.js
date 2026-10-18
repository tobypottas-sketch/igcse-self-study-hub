import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';

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
  const root = { innerHTML:'' };
  renderVocabularyQuestion(root, { unitNumber:1, unitTitle:'Sports and free time', question, term:'test', sessionLabel:'1 / 10 activities' });
  const escaped = question.sourceText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.equal((root.innerHTML.match(new RegExp(escaped, 'g')) ?? []).length, 1, 'source sentence should appear exactly once in the rendered question');
}

test('Word Family Switch renders its source sentence once', () => {
  assertSourceShownOnce(buildFor('vocab_competitor', 'word_family_switch', 'building'));
});

test('Improve the Vocabulary renders its source sentence once', () => {
  assertSourceShownOnce(buildFor('vocab_intense', 'improve_vocabulary', 'secure'));
});
