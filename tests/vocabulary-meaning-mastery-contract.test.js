import test from 'node:test';
import assert from 'node:assert/strict';

import { markCuratedAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';

test('Meaning Mastery accepts only the meaning designated for the served context', () => {
  const item = { vocabularyId:'vocab_deny' };
  const sense = {
    senseId:'deny_1',
    acceptedParaphrases:['say is not true','reject a claim'],
    contextDependentParaphrases:[],
    misleadingDistractors:['confirm','admit','allow'],
    masteryContexts:[
      { contextId:'u1_05_deny_meaning', meaning:'state that a claim is false' },
      { contextId:'u1_05_deny_paraphrase', meaning:'refuse to accept that something is true' }
    ]
  };
  const context = {
    contextId:'u1_05_deny_meaning',
    acceptedAnswers:['deny','say is not true']
  };

  const mark = rawAnswer => markCuratedAnswer({
    item,
    sense,
    context,
    questionType:'meaning_in_context',
    rawAnswer
  }).correct;

  assert.equal(mark('state that a claim is false'), true);
  assert.equal(mark('deny'), false);
  assert.equal(mark('  DENY  '), false);
  assert.equal(mark('say is not true'), false);
  assert.equal(mark('reject a claim'), false);
  assert.equal(mark('confirm'), false);
  assert.equal(mark(''), false);
});

test('Meaning Mastery fails closed when the served context has no designated mastery meaning', () => {
  const marked = markCuratedAnswer({
    item:{ vocabularyId:'vocab_deny' },
    sense:{
      senseId:'deny_1',
      acceptedParaphrases:['say is not true'],
      masteryContexts:[{ contextId:'another-context', meaning:'state that a claim is false' }]
    },
    context:{ contextId:'missing-context', acceptedAnswers:['say is not true'] },
    questionType:'meaning_in_context',
    rawAnswer:'say is not true'
  });

  assert.equal(marked.correct, false);
});

test('non-Mastery meaning activities retain their existing curated-answer semantics', () => {
  const sense = {
    senseId:'deny_1',
    acceptedParaphrases:['say is not true','reject a claim'],
    contextDependentParaphrases:[],
    misleadingDistractors:['confirm']
  };
  const context = { contextId:'ctx', acceptedAnswers:['say is not true'] };

  assert.equal(markCuratedAnswer({
    item:{ vocabularyId:'vocab_deny' }, sense, context,
    questionType:'meaning_match', rawAnswer:'reject a claim'
  }).correct, true);
});
