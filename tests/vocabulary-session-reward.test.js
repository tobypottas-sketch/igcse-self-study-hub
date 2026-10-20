import test from 'node:test';
import assert from 'node:assert/strict';

import { starCountFor, buildSessionRewardSummary } from '../src/vocabulary/session-reward.js';

for (const [correct, expected] of [[10,3],[9,3],[8,2],[7,2],[6,1],[5,1],[4,0],[0,0]]) {
  test(`starCountFor(${correct}) returns ${expected}`, () => {
    assert.equal(starCountFor(correct), expected);
  });
}

test('retry recovery is acknowledged without inflating first-attempt accuracy', () => {
  const completedAttempts = [
    { targetId:'a', evidence:{ firstAttemptCorrect:true, correctedAfterRetry:false } },
    { targetId:'b', evidence:{ firstAttemptCorrect:false, correctedAfterRetry:true } },
    ...Array.from({ length:8 }, (_, index) => ({ targetId:`x${index}`, evidence:{ firstAttemptCorrect:true, correctedAfterRetry:false } }))
  ];
  const summary = buildSessionRewardSummary({
    completedAttempts,
    sessionSummary:{ practised:10, strengthened:10, needsAnotherLook:0 },
    totalQuestions:10,
    pathwayId:'meaning',
    pathwayStage:'match'
  });

  assert.equal(summary.firstAttemptCorrect, 9);
  assert.equal(summary.correctedMistakes, 1);
  assert.equal(summary.stars, 3);
  assert.equal(summary.practised, 10);
  assert.equal(summary.strengthened, 10);
  assert.equal(summary.needsAnotherLook, 0);
  assert.equal(summary.pathwayId, 'meaning');
  assert.equal(summary.pathwayStage, 'match');
});

test('two recovered mistakes reduce stars even when both are eventually corrected', () => {
  const completedAttempts = [
    ...Array.from({ length:8 }, (_, index) => ({ targetId:`ok${index}`, evidence:{ firstAttemptCorrect:true } })),
    { targetId:'retry-1', evidence:{ firstAttemptCorrect:false, correctedAfterRetry:true } },
    { targetId:'retry-2', evidence:{ firstAttemptCorrect:false, correctedAfterRetry:true } }
  ];
  const summary = buildSessionRewardSummary({ completedAttempts, sessionSummary:{ practised:10 }, totalQuestions:10 });
  assert.equal(summary.firstAttemptCorrect, 8);
  assert.equal(summary.correctedMistakes, 2);
  assert.equal(summary.stars, 2);
});
