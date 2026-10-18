import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSupportStep } from '../src/vocabulary/scaffolding.js';

test('tile retry fixes the first correct multi-word chunk, not an arbitrary shuffled tile', () => {
  const activity = {
    responseMode:'tiles',
    tiles:['sessions','of three','a minimum'],
    markingReference:{ acceptedAnswers:['a minimum of three sessions'] }
  };

  const support = buildSupportStep(activity, { correct:false, attemptNumber:1 });

  assert.equal(support.kind, 'partial_build');
  assert.deepEqual(support.fixedChunks, ['a minimum']);
  assert.deepEqual(support.remainingTiles, ['sessions','of three']);
});

test('tile retry fixes a single-word first chunk when that is the correct start', () => {
  const activity = {
    responseMode:'tiles',
    tiles:['time','a great deal of','demand'],
    markingReference:{ acceptedAnswers:['demand a great deal of time'] }
  };

  const support = buildSupportStep(activity, { correct:false, attemptNumber:1 });

  assert.deepEqual(support.fixedChunks, ['demand']);
  assert.deepEqual(support.remainingTiles, ['time','a great deal of']);
});
