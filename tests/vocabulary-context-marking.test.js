import test from 'node:test';
import assert from 'node:assert/strict';
import { markCuratedAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';

const item = { vocabularyId:'vocab_significant' };
const sense = {
  senseId:'significant_1',
  acceptedParaphrases:['important','notable'],
  contextDependentParaphrases:[{ contextId:'ctx-effect', answers:['substantial'] }],
  misleadingDistractors:['famous']
};

test('production marking obeys the exact curated prompt answers instead of every global synonym', () => {
  const context = { contextId:'ctx-target', acceptedAnswers:['a significant change'] };
  assert.equal(markCuratedAnswer({ item, sense, context, questionType:'use_target', rawAnswer:'a significant change' }).correct, true);
  assert.equal(markCuratedAnswer({ item, sense, context, questionType:'use_target', rawAnswer:'important' }).correct, false);
  assert.equal(markCuratedAnswer({ item, sense, context, questionType:'replace_phrase', rawAnswer:'notable' }).correct, false);
});

test('paraphrase production can accept global equivalents only when the context explicitly permits them', () => {
  const explicit = { contextId:'ctx-para', acceptedAnswers:['important','notable'] };
  const narrow = { contextId:'ctx-narrow', acceptedAnswers:['important'] };
  assert.equal(markCuratedAnswer({ item, sense, context:explicit, questionType:'produce_paraphrase', rawAnswer:'notable' }).correct, true);
  assert.equal(markCuratedAnswer({ item, sense, context:narrow, questionType:'produce_paraphrase', rawAnswer:'notable' }).correct, false);
});

test('recognition questions may use the sense-level paraphrase bank plus context-scoped equivalents', () => {
  const ordinary = { contextId:'ctx-other', acceptedAnswers:[] };
  const scoped = { contextId:'ctx-effect', acceptedAnswers:[] };
  assert.equal(markCuratedAnswer({ item, sense, context:ordinary, questionType:'meaning_match', rawAnswer:'notable' }).correct, true);
  assert.equal(markCuratedAnswer({ item, sense, context:ordinary, questionType:'meaning_match', rawAnswer:'substantial' }).correct, false);
  assert.equal(markCuratedAnswer({ item, sense, context:scoped, questionType:'meaning_match', rawAnswer:'substantial' }).correct, true);
});
