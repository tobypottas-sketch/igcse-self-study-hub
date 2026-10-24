import test from 'node:test';
import assert from 'node:assert/strict';
import { buildActivity } from '../src/vocabulary/activity-factory.js';
import { assertContextQuestionMatchesContextType } from '../supabase/functions/vocabulary-attempt-action/validation.js';

const item = {
  vocabularyId:'v1', term:'leisure', partOfSpeech:'noun', coreMeaning:'free time',
  senses:[{ senseId:'s1', meaning:'free time', acceptedParaphrases:['spare time'] }]
};
const occurrence = { occurrenceId:'o1', vocabularyId:'v1', senseId:'s1', unitNumber:1 };
const contexts = [
  { contextId:'c1', occurrenceId:'o1', vocabularyId:'v1', type:'gap_fill', text:'Many teenagers use their leisure to play sport.', targetRewrite:'leisure', acceptedAnswers:['leisure'] },
  { contextId:'c2', occurrenceId:'o1', vocabularyId:'v1', type:'gap_fill', text:'Reading is a popular leisure activity for students.', targetRewrite:'leisure', acceptedAnswers:['leisure'] }
];

function build(overrides = {}) {
  return buildActivity({
    activityType:'spelling_choice',
    occurrence,
    item,
    contexts,
    unitItems:[item],
    seed:'spelling-recognise',
    ...overrides
  });
}

test('Spelling Recognise first uses the stable definition cue', () => {
  const question = build();
  assert.equal(question.contentSource,'item');
  assert.match(question.contentId,/^item:/);
  assert.match(question.prompt,/correct spelling/i);
  assert.ok(question.options.includes('leisure'));
});

test('Spelling Recognise can serve a genuinely different curated sentence cue after the item cue is used', () => {
  const first = build();
  const second = build({ usedContentIds:[first.contentId], seed:'spelling-recognise-second' });
  assert.equal(second.contentSource,'context');
  assert.notEqual(second.contentId,first.contentId);
  assert.ok(['c1','c2'].includes(second.contentId));
  assert.ok(second.sourceText.includes('____'));
  assert.ok(!second.sourceText.toLowerCase().includes('leisure'));
  assert.ok(second.options.includes('leisure'));
});

test('server context contract accepts spelling recognition only for curated paraphrase/production contexts', () => {
  assert.doesNotThrow(() => assertContextQuestionMatchesContextType('paraphrase_context','spelling_choice'));
  assert.doesNotThrow(() => assertContextQuestionMatchesContextType('production_context','spelling_choice'));
  assert.throws(() => assertContextQuestionMatchesContextType('meaning_context','spelling_choice'), /context type|question type/i);
});
