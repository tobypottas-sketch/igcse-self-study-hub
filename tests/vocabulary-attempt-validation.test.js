import test from 'node:test';
import assert from 'node:assert/strict';
import { validateVocabularyAttempt, buildStoredAttemptMetadata } from '../supabase/functions/vocabulary-attempt-action/validation.js';

const valid = {
  occurrenceId:'u1_46_significant', contextId:'sig_ctx_3', questionType:'produce_paraphrase', rawAnswer:'a significant change',
  firstAttempt:true, retryUsed:false, recoveredLater:false, review:false, preview:false
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

test('attempt validator accepts redesigned activity evidence without accepting arbitrary fields', () => {
  const result = validateVocabularyAttempt({
    occurrenceId:'u1_46_significant', activityContentId:'u1_idea_significant', questionType:'rewrite_idea',
    rawAnswer:'The programme produced an important improvement in results.', strands:['paraphrasing','production'],
    evidenceStrength:'very_strong', supportLevel:'light', productive:true, repeatedGuess:false,
    firstAttempt:false, retryUsed:true, arbitrary:'nope'
  });
  assert.equal(result.activityContentId, 'u1_idea_significant');
  assert.equal(result.contextId, null);
  assert.deepEqual(result.strands, ['paraphrasing','production']);
  assert.equal(result.evidenceStrength, 'very_strong');
  assert.equal(result.supportLevel, 'light');
  assert.equal(result.productive, true);
  assert.equal(result.repeatedGuess, false);
  assert.equal('arbitrary' in result, false);
});

test('Question Text attempts accept only a bounded unit-activity variant identifier', () => {
  const result = validateVocabularyAttempt({
    occurrenceId:'u1_46_significant', activityContentId:'u1_qt_significant', activityVariantId:'q1',
    contentSource:'unit_activity', questionType:'find_evidence', rawAnswer:'during winter'
  });
  assert.equal(result.activityVariantId, 'q1');
  assert.throws(() => validateVocabularyAttempt({ ...valid, activityVariantId:'q1' }), /unit activity/i);
  assert.throws(() => validateVocabularyAttempt({ occurrenceId:'u1_46_significant', activityContentId:'u1_qt_significant', activityVariantId:'question-1', questionType:'find_evidence', rawAnswer:'during winter' }), /variant/i);
});

test('redesigned attempt validation rejects bad support strength strands and missing content IDs', () => {
  const base = { occurrenceId:'u1_46_significant', activityContentId:'u1_idea_significant', questionType:'rewrite_idea', rawAnswer:'answer' };
  assert.throws(() => validateVocabularyAttempt({ ...base, supportLevel:'endless' }), /support/i);
  assert.throws(() => validateVocabularyAttempt({ ...base, evidenceStrength:'huge' }), /evidence/i);
  assert.throws(() => validateVocabularyAttempt({ ...base, strands:['paraphrasing','secret'] }), /strand/i);
  assert.throws(() => validateVocabularyAttempt({ ...base, contextId:null, activityContentId:null }), /context|activity/i);
});

test('stored attempt metadata never contains raw or normalized answer text', () => {
  const metadata = buildStoredAttemptMetadata({
    unitNumber:1, strand:'production', questionType:'produce_paraphrase', firstAttempt:false, retryUsed:true,
    recoveredLater:true, correct:true, misconceptionCategory:null, vocabularyId:'vocab_significant',
    occurrenceId:'u1_46_significant', rawAnswer:'DO NOT STORE', normalizedAnswer:'do not store'
  });
  assert.deepEqual(metadata, {
    unit_number:1, strand:'production', question_type:'produce_paraphrase', attempt_number:2,
    outcome:'correct', retry_used:true, recovery:true, target_id:'vocab_significant', occurrence_id:'u1_46_significant'
  });
  assert.equal(JSON.stringify(metadata).includes('DO NOT STORE'), false);
});

test('stored redesigned metadata keeps only categorical evidence and semantic diagnosis', () => {
  const metadata = buildStoredAttemptMetadata({
    unitNumber:1, strand:'paraphrasing', questionType:'spot_meaning_change', firstAttempt:false,
    retryUsed:true, recoveredLater:false, correct:false, misconceptionCategory:'quantity_change',
    vocabularyId:'vocab_tournament', occurrenceId:'u1_18_tournament', evidenceStrength:'strong', supportLevel:'light',
    rawAnswer:'PRIVATE', prompt:'PRIVATE'
  });
  assert.equal(metadata.question_type, 'spot_meaning_change');
  assert.equal(metadata.evidence_strength, 'strong');
  assert.equal(metadata.support_level, 'light');
  assert.equal(metadata.misconception, 'quantity_change');
  assert.equal(JSON.stringify(metadata).includes('PRIVATE'), false);
});
