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
  assert.equal((root.innerHTML.replace(/<[^>]*>/g, '').match(new RegExp(escaped, 'g')) ?? []).length, 1, 'source sentence should appear exactly once in the rendered question');
}

test('Word Family Switch renders its source sentence once', () => {
  assertSourceShownOnce(buildFor('vocab_competitor', 'word_family_switch', 'building'));
});

test('Improve the Vocabulary renders its source sentence once', () => {
  assertSourceShownOnce(buildFor('vocab_intense', 'improve_vocabulary', 'secure'));
});

test('legacy newline prompts render the question and context sentence as separate blocks', () => {
  const root = { innerHTML:'' };
  const question = {
    type:'meaning_match',
    responseMode:'choice',
    options:['free time','salary','training','deadline'],
    prompt:'What does “leisure” mean in this context?\nMany students use their leisure to play sport or meet friends.'
  };

  renderVocabularyQuestion(root, {
    unitNumber:1,
    unitTitle:'Sports and free time',
    question,
    term:'leisure',
    sessionLabel:'1 / 10 activities'
  });

  assert.match(root.innerHTML, /<h1 class="vocab-question-prompt">What does “leisure” mean in this context\?<\/h1>/);
  assert.match(root.innerHTML, /<aside class="vocab-question-context vocab-source-text">/);
  assert.match(root.innerHTML, /<p>Many students use their <strong class="vocab-target-language">leisure<\/strong> to play sport or meet friends\.<\/p>/);
  assert.doesNotMatch(root.innerHTML, /<h1 class="vocab-question-prompt">[^<]*Many students use their leisure/);
});
