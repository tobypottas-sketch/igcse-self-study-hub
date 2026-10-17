import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuestion } from '../src/vocabulary/questions.js';
import { renderVocabularyQuestion } from '../src/vocabulary/views.js';
import { markCuratedAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';

const item = {
  vocabularyId:'vocab_significant',
  term:'significant',
  senses:[{
    senseId:'significant_1',
    meaning:'important or noticeable enough to matter',
    acceptedParaphrases:['important','notable'],
    contextDependentParaphrases:[],
    misleadingDistractors:['famous','ordinary']
  }]
};
const occurrence = { occurrenceId:'u1_46_significant', vocabularyId:item.vocabularyId, senseId:'significant_1' };
const contexts = [
  { contextId:'ctx-meaning', type:'meaning_context', text:'The result was significant.', acceptedAnswers:['important'] },
  { contextId:'ctx-para', type:'paraphrase_context', text:'Choose the expression closest in meaning to significant.', acceptedAnswers:['important','notable'] },
  { contextId:'ctx-prod', type:'production_context', text:'Rewrite “a major change” using the target word.', acceptedAnswers:['a significant change'] }
];

function root() { return { innerHTML:'' }; }

test('recognition-family questions are choice-response tasks with curated options', () => {
  for (const type of ['meaning_match','paraphrase_match','identify_inaccurate_paraphrase']) {
    const question = buildQuestion({ occurrence, item, contexts, mastery:{ status:'building', strandEvidence:{} }, forceQuestionType:type });
    assert.equal(question.responseMode, 'choice');
    assert.ok(question.options.length >= 2);
    assert.equal(new Set(question.options).size, question.options.length);
    assert.ok(question.options.some(option => ['important','notable','famous','ordinary'].includes(option)));
  }
});

test('production and transfer questions remain typed-response tasks', () => {
  for (const type of ['replace_phrase','produce_paraphrase','use_target','context_gap_fill']) {
    const question = buildQuestion({ occurrence, item, contexts, mastery:{ status:'secure', strandEvidence:{} }, forceQuestionType:type });
    assert.equal(question.responseMode, 'text');
    assert.deepEqual(question.options, []);
  }
});

test('choice-response view renders selectable options and no free-text input', () => {
  const target = root();
  const question = buildQuestion({ occurrence, item, contexts, mastery:{ status:'building', strandEvidence:{} }, forceQuestionType:'paraphrase_match' });
  renderVocabularyQuestion(target, { unitNumber:1, unitTitle:'Sports and Free Time', question, term:item.term, sessionLabel:'1 / 10 words' });
  assert.match(target.innerHTML, /data-choice-answer=/);
  assert.doesNotMatch(target.innerHTML, /name="answer"/);
  assert.match(target.innerHTML, />significant</);
});

test('typed-response view keeps the answer input', () => {
  const target = root();
  const question = buildQuestion({ occurrence, item, contexts, mastery:{ status:'secure', strandEvidence:{} }, forceQuestionType:'produce_paraphrase' });
  renderVocabularyQuestion(target, { unitNumber:1, unitTitle:'Sports and Free Time', question, term:item.term });
  assert.match(target.innerHTML, /name="answer"/);
  assert.doesNotMatch(target.innerHTML, /data-choice-answer=/);
});

test('retrieval and production questions do not reveal the target word before answering', () => {
  for (const type of ['replace_phrase','produce_paraphrase','use_target','context_gap_fill']) {
    const target = root();
    const question = buildQuestion({ occurrence, item, contexts, mastery:{ status:'secure', strandEvidence:{} }, forceQuestionType:type });
    renderVocabularyQuestion(target, { unitNumber:1, unitTitle:'Sports and Free Time', question, term:item.term });
    assert.doesNotMatch(target.innerHTML, /class="vocab-target-pill">significant</);
  }
});

test('identify-inaccurate marking rewards a curated distractor and rejects a valid paraphrase', () => {
  const sense = item.senses[0];
  const context = contexts[1];
  assert.equal(markCuratedAnswer({ item, sense, context, questionType:'identify_inaccurate_paraphrase', rawAnswer:'famous' }).correct, true);
  assert.equal(markCuratedAnswer({ item, sense, context, questionType:'identify_inaccurate_paraphrase', rawAnswer:'important' }).correct, false);
});

test('ordinary recognition marking still rewards accepted meaning and rejects distractor', () => {
  const sense = item.senses[0];
  const context = contexts[0];
  assert.equal(markCuratedAnswer({ item, sense, context, questionType:'meaning_match', rawAnswer:'important' }).correct, true);
  assert.equal(markCuratedAnswer({ item, sense, context:contexts[0], questionType:'meaning_match', rawAnswer:'famous' }).correct, false);
});
