import test from 'node:test';
import assert from 'node:assert/strict';
import { validateVocabularyAttempt, assertContextQuestionMatchesContextType, assertUnitActivityQuestionMatchesContentType, assertWritingTaskMatchesQuestionType, buildStoredAttemptMetadata } from '../supabase/functions/vocabulary-attempt-action/validation.js';
import { markCuratedAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';
import { submitVocabularyAttempt } from '../src/vocabulary/data.js';

const ITEM_TYPES = ['definition_to_word','word_definition_match','drag_word_definition','drag_definition_word','spell_word'];
const CONTEXT_TYPES = ['gap_fill_bank','drag_word_sentence','type_missing_word','choose_word_sentence'];

test('foundational item-backed question types are bounded and need no client answer bank', () => {
  for (const questionType of ITEM_TYPES) {
    const result = validateVocabularyAttempt({ occurrenceId:'u1_1_leisure', contentSource:'item', questionType, rawAnswer:'leisure' });
    assert.equal(result.contentSource, 'item');
    assert.equal(result.contextId, null);
    assert.equal(result.activityContentId, null);
  }
  assert.throws(() => validateVocabularyAttempt({ occurrenceId:'u1_1_leisure', contentSource:'item', contextId:'ctx1', questionType:'spell_word', rawAnswer:'leisure' }), /item|context|source/i);
  assert.throws(() => validateVocabularyAttempt({ occurrenceId:'u1_1_leisure', contentSource:'made_up', questionType:'spell_word', rawAnswer:'leisure' }), /source/i);
});

test('context-backed retrieval types are restricted to curated paraphrase or production contexts', () => {
  for (const questionType of CONTEXT_TYPES) {
    assert.doesNotThrow(() => assertContextQuestionMatchesContextType('paraphrase_context', questionType));
    assert.doesNotThrow(() => assertContextQuestionMatchesContextType('production_context', questionType));
    assert.throws(() => assertContextQuestionMatchesContextType('meaning_context', questionType), /context type|question type/i);
  }
});

test('word family choice is bounded to curated word-family writing content', () => {
  assert.doesNotThrow(() => assertUnitActivityQuestionMatchesContentType('writing_set', 'word_family_choice'));
  assert.doesNotThrow(() => assertWritingTaskMatchesQuestionType('word_family', 'word_family_choice'));
  assert.throws(() => assertWritingTaskMatchesQuestionType('improve_vocabulary', 'word_family_choice'), /writing activity|question type/i);
});

test('foundational recognition and retrieval marking never claims independent production', () => {
  const item = { vocabularyId:'v1' };
  const sense = { acceptedParaphrases:['free time'] };
  const recognition = markCuratedAnswer({ item, sense, context:{ acceptedAnswers:['free time'] }, questionType:'word_definition_match', rawAnswer:'free time' });
  assert.equal(recognition.correct, true);
  assert.deepEqual(recognition.evidence.strands, ['meaning','recognition']);
  assert.equal(recognition.evidence.strands.includes('production'), false);

  const retrieval = markCuratedAnswer({ item, sense, context:{ acceptedAnswers:['leisure'] }, questionType:'type_missing_word', rawAnswer:'leisure' });
  assert.equal(retrieval.correct, true);
  assert.deepEqual(retrieval.evidence.strands, ['context','recognition']);
  assert.equal(retrieval.evidence.strands.includes('production'), false);

  const spelling = markCuratedAnswer({ item, sense, context:{ acceptedAnswers:['leisure'] }, questionType:'spell_word', rawAnswer:'leisure' });
  assert.deepEqual(spelling.evidence.strands, ['recognition','meaning']);
});

test('stored foundational metadata remains categorical and contains no answer text', () => {
  const metadata = buildStoredAttemptMetadata({ unitNumber:1, strand:'recognition', questionType:'spell_word', firstAttempt:true, correct:true, vocabularyId:'v1', occurrenceId:'u1_1_leisure', rawAnswer:'PRIVATE', evidenceStrength:'medium', supportLevel:'none' });
  assert.equal(metadata.question_type, 'spell_word');
  assert.equal(metadata.evidence_strength, 'medium');
  assert.equal(JSON.stringify(metadata).includes('PRIVATE'), false);
});

test('browser can submit item-backed attempts without identity or answer-bank leakage', async () => {
  let invocation;
  const client = { functions:{ invoke:async (name, options) => { invocation = { name, options }; return { data:{ ok:true }, error:null }; } } };
  await submitVocabularyAttempt(client, { occurrenceId:'u1_1_leisure', contentSource:'item', questionType:'spell_word', rawAnswer:'leisure', studentId:'never-send-this' });
  assert.equal(invocation.options.body.contentSource, 'item');
  assert.equal(invocation.options.body.contextId, null);
  assert.equal(invocation.options.body.activityContentId, null);
  assert.equal('studentId' in invocation.options.body, false);
  assert.equal('acceptedAnswers' in invocation.options.body, false);
});
