import test from 'node:test';
import assert from 'node:assert/strict';
import { PATHWAY_ACTIVITY_MAP } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';
import { activityDefinition } from '../src/vocabulary/activity-catalogue.js';
import { buildActivity } from '../src/vocabulary/activity-factory.js';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';

const item = {
  vocabularyId:'v1', term:'leisure', partOfSpeech:'noun', coreMeaning:'free time',
  senses:[{ senseId:'s1', meaning:'free time' }]
};
const occurrence = { occurrenceId:'o1', vocabularyId:'v1', senseId:'s1', unitNumber:1 };
const contexts = [
  { contextId:'c1', occurrenceId:'o1', vocabularyId:'v1', type:'production_context', text:'Many teenagers use their leisure to play sport.', targetRewrite:'leisure', acceptedAnswers:['leisure'] },
  { contextId:'c2', occurrenceId:'o1', vocabularyId:'v1', type:'paraphrase_context', text:'Reading is a popular leisure activity for students.', targetRewrite:'leisure', acceptedAnswers:['leisure'] }
];

function build(overrides = {}) {
  return buildActivity({
    activityType:'spell_in_context', occurrence, item, contexts, unitItems:[item], seed:'spell-mastery', ...overrides
  });
}

test('Spelling Recall and Mastery use different operations', () => {
  assert.deepEqual(PATHWAY_ACTIVITY_MAP.spelling_recall.recall,['spell_word']);
  assert.deepEqual(PATHWAY_ACTIVITY_MAP.spelling_recall.mastery,['spell_in_context']);
  const definition = activityDefinition('spell_in_context');
  assert.ok(definition);
  assert.equal(definition.skillFamily,'spelling_recall');
  assert.equal(definition.responseMode,'spelling');
});

test('Spelling Mastery uses a curated sentence cue and hides the target word', () => {
  const question = build({ seed:'spell-mastery-1' });
  assert.equal(question.contentSource,'context');
  assert.ok(['c1','c2'].includes(question.contextId));
  assert.match(question.prompt,/spell|complete|word/i);
  assert.ok(question.sourceText.includes('____'));
  assert.ok(!question.sourceText.toLowerCase().includes('leisure'));
  assert.deepEqual(question.markingReference.acceptedAnswers,['leisure']);
});

test('Spelling Mastery can move to a different curated context instead of repeating the same prompt', () => {
  const first = build({ seed:'spell-mastery-1' });
  const second = build({ usedContentIds:[first.contentId], seed:'spell-mastery-2' });
  assert.notEqual(second.contentId,first.contentId);
  assert.notEqual(second.sourceText,first.sourceText);
});

test('Spelling Mastery allows the third check to reuse a curated prompt only after distinct prompts are exhausted', () => {
  const first = build({ seed:'spell-mastery-1' });
  const second = build({ usedContentIds:[first.contentId], seed:'spell-mastery-2' });
  const third = build({ usedContentIds:[first.contentId,second.contentId], seed:'spell-mastery-3' });
  assert.ok([first.contentId,second.contentId].includes(third.contentId));
  assert.equal(new Set([first.contentId,second.contentId]).size,2);
});

test('Spelling Mastery renderer never reveals the target word above the cue', () => {
  const question = build({ seed:'spell-mastery-render' });
  const root = { innerHTML:'' };
  renderVocabularyQuestion(root, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    question,
    term:'leisure',
    sessionLabel:'Mastery'
  });
  assert.ok(!root.innerHTML.includes('<div class="vocab-target-pill">leisure</div>'));
  assert.ok(root.innerHTML.includes('____'));
});
