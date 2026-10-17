import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTION_TYPES, buildQuestion } from '../src/vocabulary/questions.js';

const item = { vocabularyId:'vocab_significant', term:'significant' };
const occurrence = { occurrenceId:'u1_significant', vocabularyId:item.vocabularyId, senseId:'significant_1' };
const contexts = [
  { contextId:'ctx-1', type:'meaning_context', text:'The result was significant.', activityTypes:['meaning_match','context_inference','identify_inaccurate_paraphrase'] },
  { contextId:'ctx-2', type:'paraphrase_context', text:'The change had an important impact.', targetRewrite:'important', activityTypes:['paraphrase_match','question_text_bridge','replace_phrase'] },
  { contextId:'ctx-3', type:'production_context', text:'The discovery caused a ___ change in the sport.', targetRewrite:'major', activityTypes:['context_gap_fill','produce_paraphrase','use_target','mini_mixed_check'] }
];

test('question catalogue contains the ten approved 0511 activity families', () => {
  assert.deepEqual([...QUESTION_TYPES].sort(), [
    'meaning_match','paraphrase_match','context_inference','question_text_bridge','context_gap_fill',
    'replace_phrase','produce_paraphrase','use_target','identify_inaccurate_paraphrase','mini_mixed_check'
  ].sort());
});

test('question builder can construct every approved activity type from curated contexts', () => {
  for (const type of QUESTION_TYPES) {
    const question = buildQuestion({ occurrence, item, contexts, mastery:{ status:'building', strandEvidence:{} }, usedContextIds:[], forceQuestionType:type });
    assert.equal(question.type, type);
    assert.ok(contexts.some(context => context.contextId === question.contextId));
    assert.equal(question.vocabularyId, item.vocabularyId);
  }
});

test('question builder adds activity-specific instructions around clean curated context', () => {
  const meaning = buildQuestion({ occurrence, item, contexts, mastery:{ status:'building', strandEvidence:{} }, forceQuestionType:'meaning_match' });
  assert.match(meaning.prompt, /What does “significant” mean/i);
  assert.match(meaning.prompt, /The result was significant/);

  const inaccurate = buildQuestion({ occurrence, item, contexts, mastery:{ status:'building', strandEvidence:{} }, forceQuestionType:'identify_inaccurate_paraphrase' });
  assert.match(inaccurate.prompt, /does NOT match/i);

  const replacement = buildQuestion({ occurrence, item, contexts, mastery:{ status:'secure', strandEvidence:{} }, forceQuestionType:'replace_phrase' });
  assert.match(replacement.prompt, /Replace “important”/i);
  assert.match(replacement.prompt, /The change had an important impact/);

  const gap = buildQuestion({ occurrence, item, contexts, mastery:{ status:'secure', strandEvidence:{} }, forceQuestionType:'context_gap_fill' });
  assert.match(gap.prompt, /Complete the gap/i);
  assert.match(gap.prompt, /___/);
});

test('question builder avoids reused context when an unused compatible context exists', () => {
  const question = buildQuestion({ occurrence, item, contexts, mastery:{ status:'building', strandEvidence:{} }, usedContextIds:['ctx-1'], previousQuestionType:'meaning_match' });
  assert.notEqual(question.contextId, 'ctx-1');
});

test('recycled mistakes prefer a different context and question type', () => {
  const question = buildQuestion({ occurrence, item, contexts, mastery:{ status:'building', strandEvidence:{} }, usedContextIds:['ctx-1'], previousQuestionType:'meaning_match', recycle:true });
  assert.notEqual(question.contextId, 'ctx-1');
  assert.notEqual(question.type, 'meaning_match');
});

test('secure and review-due targets prefer transfer or production over easy meaning matching', () => {
  const secure = buildQuestion({ occurrence, item, contexts, mastery:{ status:'secure', strandEvidence:{ production:1, paraphrasing:4 }, reviewDueAt:null }, usedContextIds:[] });
  assert.ok(['replace_phrase','produce_paraphrase','use_target','question_text_bridge','mini_mixed_check'].includes(secure.type));

  const review = buildQuestion({ occurrence, item, contexts, mastery:{ status:'mastered', strandEvidence:{ production:6, paraphrasing:6 }, reviewDueAt:'2026-10-16T00:00:00Z' }, usedContextIds:[], now:new Date('2026-10-17T00:00:00Z') });
  assert.notEqual(review.type, 'meaning_match');
});
