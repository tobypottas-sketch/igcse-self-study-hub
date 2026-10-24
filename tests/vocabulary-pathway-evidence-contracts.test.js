import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateVocabularyAttempt,
  buildStoredAttemptMetadata,
  assertPathwayQuestionMatchesStage
} from '../supabase/functions/vocabulary-attempt-action/validation.js';

const base = {
  attemptId:'11111111-1111-4111-8111-111111111111',
  occurrenceId:'occ-1',
  contentSource:'item',
  questionType:'definition_to_word',
  rawAnswer:'urge',
  firstAttempt:true,
  retryUsed:false
};

test('accepts valid fixed-pathway metadata', () => {
  const input = validateVocabularyAttempt({
    ...base,
    pathwayId:'meaning',
    pathwayStage:'recognise',
    servedPathwayStage:'recognise'
  });
  assert.equal(input.pathwayId,'meaning');
  assert.equal(input.pathwayStage,'recognise');
  assert.equal(input.servedPathwayStage,'recognise');
});

test('pathway metadata is all-or-nothing', () => {
  assert.throws(() => validateVocabularyAttempt({...base,pathwayId:'meaning'}), /Pathway metadata is incomplete/);
  assert.throws(() => validateVocabularyAttempt({...base,pathwayId:'meaning',pathwayStage:'recognise'}), /Pathway metadata is incomplete/);
});

test('rejects unknown pathway and stage identifiers', () => {
  assert.throws(() => validateVocabularyAttempt({...base,pathwayId:'random',pathwayStage:'recognise',servedPathwayStage:'recognise'}), /Vocabulary pathway is invalid/);
  assert.throws(() => validateVocabularyAttempt({...base,pathwayId:'meaning',pathwayStage:'random',servedPathwayStage:'random'}), /Vocabulary pathway stage is invalid/);
});

test('server rejects a question type that does not belong to the served pathway stage', () => {
  assert.throws(() => assertPathwayQuestionMatchesStage('meaning','recognise','rewrite_idea'), /does not match pathway stage/);
  assert.equal(assertPathwayQuestionMatchesStage('meaning','recognise','definition_to_word'), true);
});

test('served support stage may be current or exactly one stage lower, never lower than that', () => {
  assert.doesNotThrow(() => validateVocabularyAttempt({
    ...base,
    contentSource:'context', contextId:'ctx-1', questionType:'drag_word_sentence',
    pathwayId:'context', pathwayStage:'recall', servedPathwayStage:'apply', retryUsed:true, firstAttempt:false, supportLevel:'light'
  }));
  assert.throws(() => validateVocabularyAttempt({
    ...base,
    contentSource:'context', contextId:'ctx-1', questionType:'choose_word_sentence',
    pathwayId:'context', pathwayStage:'recall', servedPathwayStage:'recognise', retryUsed:true, firstAttempt:false, supportLevel:'light'
  }), /Served pathway stage is invalid/);
});

test('an easier served stage requires supported/retry evidence', () => {
  assert.throws(() => validateVocabularyAttempt({
    ...base,
    contentSource:'context', contextId:'ctx-1', questionType:'drag_word_sentence',
    pathwayId:'context', pathwayStage:'recall', servedPathwayStage:'apply', retryUsed:false, firstAttempt:true, supportLevel:'none'
  }), /Served pathway stage requires support/);
});

test('stored attempt metadata contains pathway coordinates but never raw answer text', () => {
  const metadata = buildStoredAttemptMetadata({
    unitNumber:1, vocabularyId:'v1', occurrenceId:'occ-1', questionType:'definition_to_word',
    rawAnswer:'THIS MUST NOT BE STORED', correct:true, firstAttempt:true,
    pathwayId:'meaning', pathwayStage:'recognise', servedPathwayStage:'recognise'
  });
  assert.equal(metadata.pathway_id,'meaning');
  assert.equal(metadata.pathway_stage,'recognise');
  assert.equal(metadata.served_pathway_stage,'recognise');
  assert.equal(JSON.stringify(metadata).includes('THIS MUST NOT BE STORED'), false);
});

test('non-pathway Mixed Practice attempts remain valid without pathway metadata', () => {
  const input = validateVocabularyAttempt(base);
  assert.equal(input.pathwayId,null);
  assert.equal(input.pathwayStage,null);
  assert.equal(input.servedPathwayStage,null);
});
