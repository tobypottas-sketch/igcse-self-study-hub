import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQuestion } from '../src/vocabulary/questions.js';

const item = {
  vocabularyId:'vocab_significant', term:'significant',
  senses:[{ senseId:'significant_1', meaning:'important enough to matter', acceptedParaphrases:['important','notable'], contextDependentParaphrases:[], misleadingDistractors:['ordinary','famous'] }]
};
const occurrence = { occurrenceId:'u1_46_significant', vocabularyId:'vocab_significant', senseId:'significant_1' };
const contexts = [
  { contextId:'meaning', type:'meaning_context', text:'What does significant mean here?', acceptedAnswers:['important'] },
  { contextId:'para', type:'paraphrase_context', text:'Which expression could replace significant?', acceptedAnswers:['important','notable'] },
  { contextId:'prod', type:'production_context', text:'Rewrite “an important change” using the target word.', acceptedAnswers:['significant'] }
];

test('new targets begin with accessible meaning or recognition evidence', () => {
  const question = buildQuestion({ occurrence, item, contexts, mastery:{ status:'new', strandEvidence:{ meaning:0, recognition:0, context:0, paraphrasing:0, production:0 } } });
  assert.ok(['meaning_match','paraphrase_match','identify_inaccurate_paraphrase'].includes(question.type));
});

test('building targets with meaning evidence but no context are moved into contextual understanding', () => {
  const question = buildQuestion({ occurrence, item, contexts, mastery:{ status:'building', strandEvidence:{ meaning:3, recognition:0, context:0, paraphrasing:0, production:0 } } });
  assert.ok(['context_inference','question_text_bridge','context_gap_fill'].includes(question.type), question.type);
});

test('targets with secure context/paraphrase evidence but missing production are pushed to production', () => {
  const question = buildQuestion({ occurrence, item, contexts, mastery:{ status:'building', strandEvidence:{ meaning:6, recognition:3, context:3, paraphrasing:3, production:0 } } });
  assert.ok(['replace_phrase','produce_paraphrase','use_target'].includes(question.type), question.type);
  assert.equal(question.strand, 'production');
});

test('secure targets with one production context prefer an unused context for the next productive demonstration', () => {
  const question = buildQuestion({
    occurrence, item, contexts,
    mastery:{ status:'secure', strandEvidence:{ meaning:8, recognition:6, context:4, paraphrasing:4, production:3 }, productionContextIds:['para'] },
    usedContextIds:['para']
  });
  assert.equal(question.strand, 'production');
  assert.notEqual(question.contextId, 'para');
});
