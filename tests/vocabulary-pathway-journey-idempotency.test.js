import test from 'node:test';
import assert from 'node:assert/strict';
import { submitVocabularyAttempt } from '../src/vocabulary/data.js';

test('duplicate authoritative attempt responses remain idempotent without a client pathway journey mirror', async () => {
  const calls = [];
  let invocation = 0;
  const client = {
    functions:{
      async invoke(name, { body }) {
        calls.push({ name, body:{ ...body } });
        invocation += 1;
        return {
          data:invocation === 1
            ? { ok:true, duplicate:false, pathwayProgress:{ currentStage:'match' } }
            : { ok:true, duplicate:true, pathwayProgress:{ currentStage:'match' } },
          error:null
        };
      }
    }
  };

  const input = {
    attemptId:'attempt-fixed-id',
    occurrenceId:'occ-1',
    questionType:'meaning_match',
    rawAnswer:'answer',
    pathwayId:'meaning',
    pathwayStage:'recognise',
    servedPathwayStage:'recognise',
    firstAttempt:true,
    retryUsed:false,
    supportLevel:'none'
  };

  const first = await submitVocabularyAttempt(client, input);
  const duplicate = await submitVocabularyAttempt(client, input);

  assert.equal(calls.length, 2);
  assert.equal(calls[0].name, 'vocabulary-attempt-action');
  assert.equal(calls[1].name, 'vocabulary-attempt-action');
  assert.equal(calls[0].body.attemptId, 'attempt-fixed-id');
  assert.equal(calls[1].body.attemptId, 'attempt-fixed-id');
  assert.deepEqual(first.pathwayProgress, { currentStage:'match' });
  assert.equal(duplicate.duplicate, true);
  assert.deepEqual(duplicate.pathwayProgress, { currentStage:'match' });
});
