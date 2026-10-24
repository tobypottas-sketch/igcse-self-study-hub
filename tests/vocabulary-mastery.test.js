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
    productionActivityTypes:[],
    unscaffoldedProductions:0,
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

test('secure requires at least three strands including context or paraphrasing', async () => {
  const { deriveStatus } = await engine();
  assert.equal(deriveStatus(fresh({ strandEvidence:{ meaning:6, recognition:6, context:0, paraphrasing:0, production:0 } })), 'building');
  assert.equal(deriveStatus(fresh({ strandEvidence:{ meaning:6, recognition:0, context:4, paraphrasing:0, production:0 } })), 'building');
  assert.equal(deriveStatus(fresh({ strandEvidence:{ meaning:6, recognition:6, context:4, paraphrasing:0, production:0 } })), 'secure');
});

test('mastered requires context paraphrasing two diverse productive demonstrations and an unscaffolded production', async () => {
  const { deriveStatus } = await engine();
  const base = fresh({
    strandEvidence:{ meaning:8, recognition:7, context:5, paraphrasing:6, production:6 },
    successfulProductions:2,
    productionContextIds:['ctx-a','ctx-b'],
    productionActivityTypes:['rewrite_phrase'],
    unscaffoldedProductions:1,
    recentErrorCount:0
  });
  assert.equal(deriveStatus(base), 'mastered');
  assert.equal(deriveStatus({ ...base, strandEvidence:{ ...base.strandEvidence, context:0 } }), 'secure');
  assert.equal(deriveStatus({ ...base, strandEvidence:{ ...base.strandEvidence, paraphrasing:0 } }), 'secure');
  assert.equal(deriveStatus({ ...base, productionContextIds:['ctx-a'], productionActivityTypes:['rewrite_phrase'] }), 'secure');
  assert.equal(deriveStatus({ ...base, unscaffoldedProductions:0 }), 'secure');
  assert.equal(deriveStatus({ ...base, recentErrorCount:1 }), 'secure');
});

test('different productive activity types can provide diversity even in the same curated context', async () => {
  const { deriveStatus } = await engine();
  const mastery = fresh({
    strandEvidence:{ meaning:8, recognition:7, context:5, paraphrasing:6, production:6 },
    successfulProductions:2,
    productionContextIds:['ctx-a'],
    productionActivityTypes:['complete_paraphrase','rewrite_phrase'],
    unscaffoldedProductions:1
  });
  assert.equal(deriveStatus(mastery), 'mastered');
});

test('applyEvidence records productive activity diversity and only counts unscaffolded production when support is none', async () => {
  const { applyEvidence } = await engine();
  const first = applyEvidence(fresh(), {
    strands:['paraphrasing','production'], correct:true, evidenceStrength:'strong', supportLevel:'light', productive:true,
    firstAttempt:false, retryUsed:true, contextId:'ctx-a', activityType:'complete_paraphrase'
  }, new Date());
  assert.deepEqual(first.productionActivityTypes, ['complete_paraphrase']);
  assert.equal(first.unscaffoldedProductions, 0);

  const second = applyEvidence(first, {
    strands:['paraphrasing','production'], correct:true, evidenceStrength:'very_strong', supportLevel:'none', productive:true,
    firstAttempt:true, contextId:'ctx-b', activityType:'rewrite_phrase'
  }, new Date());
  assert.deepEqual(second.productionActivityTypes.sort(), ['complete_paraphrase','rewrite_phrase']);
  assert.equal(second.unscaffoldedProductions, 1);
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

test('new multi-strand evidence uses graded strength and support rather than treating every success equally', async () => {
  const { applyEvidence } = await engine();
  const full = applyEvidence(fresh(), {
    strands:['paraphrasing','production'], correct:true, evidenceStrength:'very_strong', supportLevel:'none', productive:true,
    firstAttempt:true, contextId:'idea-a', activityType:'rewrite_idea'
  }, new Date());
  const lightSupport = applyEvidence(fresh(), {
    strands:['paraphrasing','production'], correct:true, evidenceStrength:'very_strong', supportLevel:'light', productive:true,
    firstAttempt:false, retryUsed:true, contextId:'idea-a', activityType:'rewrite_idea'
  }, new Date());
  const majorSupport = applyEvidence(fresh(), {
    strands:['paraphrasing','production'], correct:true, evidenceStrength:'very_strong', supportLevel:'major', productive:true,
    firstAttempt:false, retryUsed:true, contextId:'idea-a', activityType:'rewrite_idea'
  }, new Date());

  assert.ok(full.strandEvidence.production > lightSupport.strandEvidence.production);
  assert.ok(lightSupport.strandEvidence.production > majorSupport.strandEvidence.production);
  assert.ok(majorSupport.strandEvidence.production > 0);
  assert.ok(full.strandEvidence.paraphrasing > 0);
});

test('repeated guessing earns no positive mastery evidence', async () => {
  const { applyEvidence } = await engine();
  const result = applyEvidence(fresh(), {
    strands:['meaning'], correct:true, evidenceStrength:'light', supportLevel:'major', repeatedGuess:true,
    firstAttempt:false, retryUsed:true, contextId:'ctx-a', activityType:'meaning_match'
  }, new Date());
  assert.equal(result.strandEvidence.meaning, 0);
  assert.equal(result.status, 'new');
});

test('major-supported productive recovery is learning evidence but not an independent production proof', async () => {
  const { applyEvidence } = await engine();
  const result = applyEvidence(fresh(), {
    strands:['paraphrasing','production'], correct:true, evidenceStrength:'strong', supportLevel:'major', productive:true,
    firstAttempt:false, retryUsed:true, contextId:'ctx-supported', activityType:'rewrite_phrase'
  }, new Date());
  assert.ok(result.strandEvidence.production > 0);
  assert.equal(result.successfulProductions, 0);
  assert.deepEqual(result.productionContextIds, []);
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

test('semantic marking preserves curated misconception categories for whole-idea distortions', async () => {
  const { markCuratedAnswer } = await engine();
  const marked = markCuratedAnswer({
    item:{ vocabularyId:'vocab_tournament' },
    sense:{ acceptedParaphrases:[], contextDependentParaphrases:[], misleadingDistractors:[] },
    context:{
      contextId:'u1_idea_quantity',
      acceptedAnswers:['Eight schools sent teams to take part in the regional competition.'],
      distractors:[{ text:'All schools in the region sent teams.', misconceptionCategory:'quantity_change' }]
    },
    questionType:'same_idea',
    rawAnswer:'All schools in the region sent teams.'
  });
  assert.equal(marked.correct, false);
  assert.equal(marked.misconceptionCategory, 'quantity_change');
});

test('spot-meaning-change rewards the curated distorted rewrite and keeps its diagnosis', async () => {
  const { markCuratedAnswer } = await engine();
  const marked = markCuratedAnswer({
    item:{ vocabularyId:'vocab_estimated' },
    sense:{ acceptedParaphrases:[], contextDependentParaphrases:[], misleadingDistractors:[] },
    context:{
      contextId:'u1_idea_estimated',
      acceptedAnswers:['The centre is expected to cost about five million dollars.'],
      distractors:[{ text:'The centre definitely cost exactly five million dollars.', misconceptionCategory:'degree_change' }]
    },
    questionType:'spot_meaning_change',
    rawAnswer:'The centre definitely cost exactly five million dollars.'
  });
  assert.equal(marked.correct, true);
  assert.equal(marked.misconceptionCategory, 'degree_change');
});
