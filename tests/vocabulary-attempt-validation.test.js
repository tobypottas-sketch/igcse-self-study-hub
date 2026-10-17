import test from 'node:test';
import assert from 'node:assert/strict';
import { validateVocabularyAttempt, buildStoredAttemptMetadata } from '../supabase/functions/vocabulary-attempt-action/validation.js';

const valid = {
  occurrenceId:'u1_46_significant',
  contextId:'sig_ctx_3',
  questionType:'produce_paraphrase',
  rawAnswer:'a significant change',
  firstAttempt:true,
  retryUsed:false,
  recoveredLater:false,
  review:false,
  preview:false
};

test('attempt validator accepts only the bounded mastery-critical request shape', () => {
  const result = validateVocabularyAttempt({ ...valid, studentId:'attacker-selected-user', arbitrary:'nope' });
  assert.equal(result.occurrenceId, valid.occurrenceId);
  assert.equal(result.rawAnswer, valid.rawAnswer);
  assert.equal('studentId' in result, false);
  assert.equal('arbitrary' in result, false);
  assert.throws(() => validateVocabularyAttempt({ ...valid, rawAnswer:'x'.repeat(501) }), /answer/i);
  assert.throws(() => validateVocabularyAttempt({ ...valid, questionType:'hangman' }), /question/i);
});

test('stored attempt metadata never contains raw or normalized answer text', () => {
  const metadata = buildStoredAttemptMetadata({
    unitNumber:1,
    strand:'production',
    questionType:'produce_paraphrase',
    firstAttempt:false,
    retryUsed:true,
    recoveredLater:true,
    correct:true,
    misconceptionCategory:null,
    vocabularyId:'vocab_significant',
    occurrenceId:'u1_46_significant',
    rawAnswer:'DO NOT STORE',
    normalizedAnswer:'do not store'
  });
  assert.deepEqual(metadata, {
    unit_number:1,
    strand:'production',
    question_type:'produce_paraphrase',
    attempt_number:2,
    outcome:'correct',
    retry_used:true,
    recovery:true,
    target_id:'vocab_significant',
    occurrence_id:'u1_46_significant'
  });
  assert.equal(JSON.stringify(metadata).includes('DO NOT STORE'), false);
});
