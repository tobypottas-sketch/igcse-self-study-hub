import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { completeParaphraseBlank } from '../supabase/functions/_shared/vocabulary-phrase-blank.js';
import { buildActivity } from '../src/vocabulary/activity-factory.js';
import { findAnswerLeak, normalizeForLeak } from '../src/vocabulary/answer-leak-guard.js';
import { markCuratedAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';

const phrases = unit1.activities.filter(row => row.contentType === 'phrase_set');

test('blank rule: require → demand tests the changed word, not the unchanged tail "time"', () => {
  const blank = completeParaphraseBlank({ originalPhrase:'require a great deal of time', equivalentPhrase:'demand a great deal of time', chunks:['demand','a great deal of','time'] });
  assert.equal(blank.answer, 'demand');
  assert.equal(blank.stem, '___ a great deal of time');
  assert.equal(blank.changed, true);
});

test('blank rule ignores function-word shifts (an → a) and finds the real lexical change', () => {
  const blank = completeParaphraseBlank({ originalPhrase:'an important accomplishment', chunks:['a','major','achievement'] });
  assert.equal(blank.answer, 'major');
});

test('blank rule falls back to the last chunk only when nothing changed, leaving the guard to decide', () => {
  const blank = completeParaphraseBlank({ originalPhrase:'a b c', chunks:['a','b','c'] });
  assert.equal(blank.changed, false);
  assert.equal(blank.answer, 'c');
});

test('all 12 Unit 1 phrase records can serve Complete the Paraphrase, test changed language, and never expose the answer', () => {
  assert.equal(phrases.length, 12);
  const problems = [];
  for (const record of phrases) {
    const vocabularyId = record.activityData.linkedVocabularyIds[0];
    const item = unit1.items.find(row => row.vocabularyId === vocabularyId);
    const occurrence = unit1.occurrences.find(row => row.vocabularyId === vocabularyId);
    let question;
    try {
      question = buildActivity({ activityType:'complete_paraphrase', occurrence, item, contexts:[], unitActivities:[record], unitItems:unit1.items, unitContexts:unit1.contexts, unitOccurrences:unit1.occurrences, mastery:{ status:'secure' }, readinessStage:'secure', seed:'blank-audit' });
    } catch (error) { problems.push(`${record.activityContentId}: not served (${error.message})`); continue; }
    const [answer] = question.markingReference.acceptedAnswers;
    const original = normalizeForLeak(record.activityData.originalPhrase);
    if (!record.activityData.chunks.includes(answer)) problems.push(`${record.activityContentId}: answer is not a curated chunk`);
    if (` ${original} `.includes(` ${normalizeForLeak(answer)} `)) problems.push(`${record.activityContentId}: answer “${answer}” is copied from the source phrase`);
    if (findAnswerLeak(question, { item, occurrence })) problems.push(`${record.activityContentId}: answer visible`);
    if (!question.prompt.includes('___')) problems.push(`${record.activityContentId}: no blank`);
    // server marks the same chunk
    const serverAnswer = completeParaphraseBlank(record.activityData).answer;
    if (serverAnswer !== answer) problems.push(`${record.activityContentId}: client/server blank differ`);
    const sense = item.senses.find(row => row.senseId === occurrence.senseId);
    const marked = markCuratedAnswer({ item:{ vocabularyId }, sense, context:{ contextId:record.activityContentId, acceptedAnswers:[serverAnswer] }, questionType:'complete_paraphrase', rawAnswer:answer });
    if (!marked.correct) problems.push(`${record.activityContentId}: curated answer not marked correct`);
  }
  assert.deepEqual(problems, []);
});
