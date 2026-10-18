import test from 'node:test';
import assert from 'node:assert/strict';

import { applyEvidence } from '../supabase/functions/_shared/vocabulary-engine.js';

function fresh(overrides = {}) {
  return {
    status:'new',
    strandEvidence:{ meaning:0, recognition:0, context:0, paraphrasing:0, production:0 },
    successfulProductions:0,
    productionContextIds:[],
    productionActivityTypes:[],
    unscaffoldedProductions:0,
    recentErrorCount:0,
    recoveryCount:0,
    reviewStage:0,
    reviewFailureCount:0,
    reviewDueAt:null,
    ...overrides
  };
}

test('supported retry success adds learning evidence without erasing the initial miss', () => {
  const missed = applyEvidence(fresh(), {
    strands:['context'],
    correct:false,
    evidenceStrength:'medium',
    supportLevel:'none',
    firstAttempt:true,
    retryUsed:false,
    activityType:'meaning_in_context'
  }, new Date('2026-10-18T00:00:00Z'));

  assert.equal(missed.recentErrorCount, 1);

  const retried = applyEvidence(missed, {
    strands:['context'],
    correct:true,
    evidenceStrength:'medium',
    supportLevel:'light',
    firstAttempt:false,
    retryUsed:true,
    activityType:'meaning_in_context'
  }, new Date('2026-10-18T00:01:00Z'));

  assert.ok(retried.strandEvidence.context > missed.strandEvidence.context);
  assert.equal(retried.recentErrorCount, 1);
});

test('later independent first-attempt success may clear a previous error signal', () => {
  const withError = fresh({
    strandEvidence:{ meaning:2, recognition:0, context:2, paraphrasing:0, production:0 },
    recentErrorCount:1
  });

  const independentSuccess = applyEvidence(withError, {
    strands:['context'],
    correct:true,
    evidenceStrength:'medium',
    supportLevel:'none',
    firstAttempt:true,
    retryUsed:false,
    recoveredLater:false,
    activityType:'meaning_in_context'
  }, new Date('2026-10-18T00:05:00Z'));

  assert.equal(independentSuccess.recentErrorCount, 0);
});
