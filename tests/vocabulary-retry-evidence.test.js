import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { applyEvidence, successClearsRecentError } from '../supabase/functions/_shared/vocabulary-engine.js';

function source(path) { return fs.readFileSync(new URL(path, import.meta.url), 'utf8'); }
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
    strands:['context'], correct:false, evidenceStrength:'medium', supportLevel:'none',
    firstAttempt:true, retryUsed:false, activityType:'meaning_in_context'
  }, new Date('2026-10-18T00:00:00Z'));

  assert.equal(missed.recentErrorCount, 1);

  const retried = applyEvidence(missed, {
    strands:['context'], correct:true, evidenceStrength:'medium', supportLevel:'light',
    firstAttempt:false, retryUsed:true, activityType:'meaning_in_context'
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
    strands:['context'], correct:true, evidenceStrength:'medium', supportLevel:'none',
    firstAttempt:true, retryUsed:false, recoveredLater:false, activityType:'meaning_in_context'
  }, new Date('2026-10-18T00:05:00Z'));

  assert.equal(independentSuccess.recentErrorCount, 0);
});

test('the shared clearing rule distinguishes retry, recovery and independent success', () => {
  assert.equal(successClearsRecentError({ correct:true, firstAttempt:false, retryUsed:true, recoveredLater:false }), false);
  assert.equal(successClearsRecentError({ correct:true, firstAttempt:true, retryUsed:false, recoveredLater:true }), false);
  assert.equal(successClearsRecentError({ correct:true, firstAttempt:true, retryUsed:false, recoveredLater:false }), true);
  assert.equal(successClearsRecentError({ correct:false, firstAttempt:true, retryUsed:false, recoveredLater:false }), false);
});

test('authoritative server preserves separate global and unit error patterns through supported success', () => {
  const server = source('../supabase/functions/vocabulary-attempt-action/index.ts');
  assert.match(server, /successClearsRecentError/);
  assert.match(server, /nextErrorPattern\(globalRow\?\.recent_error_pattern, marked, evidence\)/);
  assert.match(server, /nextErrorPattern\(unitRow\?\.recent_error_pattern, marked, evidence\)/);
  assert.match(server, /p_global_error_pattern:globalRecentErrorPattern/);
  assert.match(server, /p_unit_error_pattern:unitRecentErrorPattern/);
  assert.match(server, /globalRecentErrorPattern, unitRecentErrorPattern/);
  assert.doesNotMatch(server, /const recentErrorPattern = errorPattern\(marked\)/);
});

test('student client syncs authoritative error state instead of clearing it merely because retry was correct', () => {
  const app = source('../src/vocabulary/app.js');
  assert.match(app, /recentErrorCount:result\.globalRecentErrorPattern \? 1 : 0/);
  assert.match(app, /recentErrorPattern:result\.globalRecentErrorPattern \?\? null/);
  assert.match(app, /recentErrorPattern:result\.unitRecentErrorPattern \?\? null/);
  assert.doesNotMatch(app, /recentErrorCount:result\.correct \? 0/);
  assert.doesNotMatch(app, /recentErrorPattern:result\.correct \? null/);
});
