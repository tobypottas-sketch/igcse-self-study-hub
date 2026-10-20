import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { markCuratedAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';
import { buildActivity } from '../src/vocabulary/activity-factory.js';
import { findAnswerLeak } from '../src/vocabulary/answer-leak-guard.js';

const item = unit1.items.find(row => row.term === 'permit');
const occurrence = unit1.occurrences.find(row => row.vocabularyId === item.vocabularyId);
const sense = item.senses.find(row => row.senseId === occurrence.senseId);
const mark = (questionType, rawAnswer, acceptedAnswers = ['permit']) =>
  markCuratedAnswer({ item:{ vocabularyId:item.vocabularyId }, sense, context:{ contextId:'ctx', acceptedAnswers }, questionType, rawAnswer });

test('Recall the Word: the headword is correct, case and trailing punctuation are tolerated', () => {
  assert.equal(mark('type_word_from_definition', 'permit').correct, true);
  assert.equal(mark('type_word_from_definition', 'Permit').correct, true);
  assert.equal(mark('type_word_from_definition', '  PERMIT. ').correct, true);
});

test('Recall the Word: a valid synonym is a different word, so "allow" is NOT correct for permit', () => {
  assert.ok(sense.acceptedParaphrases.includes('allow'), 'allow is a curated paraphrase of permit');
  assert.equal(mark('type_word_from_definition', 'allow').correct, false);
  for (const paraphrase of sense.acceptedParaphrases) assert.equal(mark('type_word_from_definition', paraphrase).correct, false, paraphrase);
});

test('paraphrase-oriented question types still accept the curated synonym (scope of the change)', () => {
  for (const type of ['paraphrase_match', 'meaning_match', 'context_inference']) {
    assert.equal(mark(type, 'allow', []).correct, true, `${type} should still accept the curated paraphrase`);
  }
});

test('the browser builder and the server derive the same exact answer for Recall the Word', () => {
  const question = buildActivity({ activityType:'type_word_from_definition', occurrence, item, contexts:[], unitActivities:unit1.activities, unitItems:unit1.items, mastery:{ status:'mastered' }, seed:'recall' });
  // Server itemMarking(): acceptedAnswers = [item.term]; client uses the builder's markingReference.
  assert.deepEqual(question.markingReference.acceptedAnswers, [item.term]);
  for (const answer of ['permit', 'allow']) {
    const client = markCuratedAnswer({ item:{ vocabularyId:item.vocabularyId }, sense, context:{ contextId:question.contentId, acceptedAnswers:question.markingReference.acceptedAnswers }, questionType:question.type, rawAnswer:answer });
    const server = markCuratedAnswer({ item:{ vocabularyId:item.vocabularyId }, sense, context:{ contextId:question.contentId, acceptedAnswers:[item.term] }, questionType:'type_word_from_definition', rawAnswer:answer });
    assert.equal(client.correct, server.correct);
    assert.equal(client.correct, answer === 'permit');
  }
});

test('the leak guard still keeps the headword out of every Recall the Word prompt', () => {
  const question = buildActivity({ activityType:'type_word_from_definition', occurrence, item, contexts:[], unitActivities:unit1.activities, unitItems:unit1.items, mastery:{ status:'mastered' }, seed:'recall' });
  assert.equal(findAnswerLeak(question, { item, occurrence }), null);
  const leaky = { ...question, prompt:'Type the word: permit (to allow).' };
  assert.deepEqual(findAnswerLeak(leaky, { item, occurrence }), { field:'prompt', answer:'permit' });
});

test('every Unit 1 target can serve Recall the Word with an exact headword answer and no leak', () => {
  const unserved = [];
  for (const target of unit1.occurrences) {
    const targetItem = unit1.items.find(row => row.vocabularyId === target.vocabularyId);
    try {
      const question = buildActivity({ activityType:'type_word_from_definition', occurrence:target, item:targetItem, contexts:[], unitActivities:unit1.activities, unitItems:unit1.items, mastery:{ status:'mastered' }, seed:'all' });
      assert.deepEqual(question.markingReference.acceptedAnswers, [targetItem.term]);
      assert.equal(findAnswerLeak(question, { item:targetItem, occurrence:target }), null);
    } catch (error) { unserved.push(`${targetItem.term}: ${error.message}`); }
  }
  assert.deepEqual(unserved, []);
});
