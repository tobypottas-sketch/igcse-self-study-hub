import test from 'node:test';
import assert from 'node:assert/strict';

async function engine() {
  return import('../supabase/functions/_shared/vocabulary-engine.js');
}

function fresh(overrides = {}) {
  return {
    status:'new',
    strandEvidence:{ meaning:0, recognition:0, context:0, paraphrasing:0, production:0 },
    successfulProductions:0,
    productionContextIds:[],
    recentErrorCount:0,
    reviewStage:0,
    reviewFailureCount:0,
    reviewDueAt:null,
    ...overrides
  };
}

test('production evidence strengthens production paraphrasing recognition and meaning but not context', async () => {
  const { applyEvidence } = await engine();
  const result = applyEvidence(fresh(), { strand:'production', correct:true, firstAttempt:true, contextId:'ctx-a', questionType:'produce_paraphrase' }, new Date('2026-10-17T00:00:00Z'));
  assert.ok(result.strandEvidence.production > 0);
  assert.ok(result.strandEvidence.paraphrasing > 0);
  assert.ok(result.strandEvidence.recognition > 0);
  assert.ok(result.strandEvidence.meaning > 0);
  assert.equal(result.strandEvidence.context, 0);
});

test('easier evidence cannot leak upward into production', async () => {
  const { applyEvidence } = await engine();
  const recognition = applyEvidence(fresh(), { strand:'recognition', correct:true, firstAttempt:true, contextId:'ctx-a', questionType:'meaning_match' }, new Date());
  assert.ok(recognition.strandEvidence.recognition > 0);
  assert.ok(recognition.strandEvidence.meaning > 0);
  assert.equal(recognition.strandEvidence.production, 0);

  const context = applyEvidence(fresh(), { strand:'context', correct:true, firstAttempt:true, contextId:'ctx-a', questionType:'context_inference' }, new Date());
  assert.ok(context.strandEvidence.context > 0);
  assert.ok(context.strandEvidence.meaning > 0);
  assert.equal(context.strandEvidence.production, 0);
});

test('secure requires multi-strand evidence including context or paraphrasing', async () => {
  const { deriveStatus } = await engine();
  assert.equal(deriveStatus(fresh({ strandEvidence:{ meaning:6, recognition:6, context:0, paraphrasing:0, production:0 } })), 'building');
  assert.equal(deriveStatus(fresh({ strandEvidence:{ meaning:6, recognition:6, context:4, paraphrasing:0, production:0 } })), 'secure');
});

test('mastered requires secure plus two successful productions in different contexts', async () => {
  const { deriveStatus } = await engine();
  const secureBase = fresh({ strandEvidence:{ meaning:8, recognition:7, context:5, paraphrasing:6, production:6 }, successfulProductions:2 });
  assert.equal(deriveStatus({ ...secureBase, productionContextIds:['ctx-a'] }), 'secure');
  assert.equal(deriveStatus({ ...secureBase, productionContextIds:['ctx-a','ctx-b'] }), 'mastered');
});

test('supported retry is positive but weaker than first-attempt success', async () => {
  const { applyEvidence } = await engine();
  const direct = applyEvidence(fresh(), { strand:'context', correct:true, firstAttempt:true, retryUsed:false, contextId:'a', questionType:'context_inference' }, new Date());
  const retry = applyEvidence(fresh(), { strand:'context', correct:true, firstAttempt:false, retryUsed:true, contextId:'a', questionType:'context_inference' }, new Date());
  assert.ok(retry.strandEvidence.context > 0);
  assert.ok(direct.strandEvidence.context > retry.strandEvidence.context);
});

test('later recovery adds positive evidence without erasing the original error signal', async () => {
  const { applyEvidence } = await engine();
  const missed = applyEvidence(fresh(), { strand:'paraphrasing', correct:false, firstAttempt:true, retryUsed:false, contextId:'a', questionType:'paraphrase_match' }, new Date());
  assert.equal(missed.recentErrorCount, 1);
  const recovered = applyEvidence(missed, { strand:'paraphrasing', correct:true, firstAttempt:true, recoveredLater:true, contextId:'b', questionType:'replace_phrase' }, new Date());
  assert.ok(recovered.strandEvidence.paraphrasing > missed.strandEvidence.paraphrasing);
  assert.equal(recovered.recentErrorCount, 1);
  assert.equal(recovered.recoveryCount, 1);
});

test('deterministic marking uses exact production answers and keeps recognition-only equivalents scoped', async () => {
  const { markCuratedAnswer } = await engine();
  const item = { vocabularyId:'vocab_significant' };
  const sense = {
    senseId:'significant_1',
    acceptedParaphrases:['important','notable'],
    contextDependentParaphrases:[{ contextId:'ctx-a', answers:['substantial'] }],
    misleadingDistractors:['famous']
  };
  const contextA = { contextId:'ctx-a', acceptedAnswers:['significant'] };
  const contextB = { contextId:'ctx-b', acceptedAnswers:['significant'] };

  assert.equal(markCuratedAnswer({ item, sense, context:contextA, questionType:'produce_paraphrase', rawAnswer:' Significant! ' }).correct, true);
  assert.equal(markCuratedAnswer({ item, sense, context:contextA, questionType:'produce_paraphrase', rawAnswer:'important' }).correct, false);
  assert.equal(markCuratedAnswer({ item, sense, context:contextA, questionType:'meaning_match', rawAnswer:'substantial' }).correct, true);
  assert.equal(markCuratedAnswer({ item, sense, context:contextB, questionType:'meaning_match', rawAnswer:'substantial' }).correct, false);

  const marked = markCuratedAnswer({ item, sense, context:contextA, questionType:'produce_paraphrase', rawAnswer:'FAMOUS' });
  assert.equal(marked.correct, false);
  assert.equal(marked.misconceptionCategory, 'related_but_inaccurate');
  assert.equal('rawAnswer' in marked.evidence, false);
});
