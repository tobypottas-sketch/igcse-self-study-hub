import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, completeAttempt, expireSession, isSessionComplete } from '../src/vocabulary/session.js';

const NOW = new Date('2026-10-17T00:00:00Z');

test('adaptive sessions are fixed-target untimed sessions', () => {
  const session = createSession({ unitNumber:7, mode:'adaptive', targetIds:Array.from({ length:10 },(_,i)=>`v${i+1}`), now:NOW });
  assert.equal(session.mode, 'adaptive');
  assert.equal(session.practiceMode, 'adaptive');
  assert.equal(session.durationMinutes, null);
  assert.equal(session.targetIds.length, 10);
  assert.equal(isSessionComplete(session, NOW), false);
  const finished = { ...session, completedTargetIds:[...session.targetIds] };
  assert.equal(isSessionComplete(finished, NOW), true);
});

test('sessions preserve the chosen 0511 practice mode independently of timed or untimed delivery', () => {
  const untimed = createSession({ unitNumber:1, mode:'adaptive', practiceMode:'phrase_paraphrase', targetIds:['v1'], now:NOW });
  assert.equal(untimed.practiceMode, 'phrase_paraphrase');
  const timed = createSession({ unitNumber:1, mode:'timed', practiceMode:'question_text', durationMinutes:10, now:NOW });
  assert.equal(timed.practiceMode, 'question_text');
  assert.throws(() => createSession({ unitNumber:1, mode:'adaptive', practiceMode:'hangman', targetIds:['v1'], now:NOW }), /practice mode/i);
});

test('timed sessions accept only 5 10 15 or 20 minutes', () => {
  for (const durationMinutes of [5,10,15,20]) {
    assert.equal(createSession({ unitNumber:1, mode:'timed', durationMinutes, now:NOW }).durationMinutes, durationMinutes);
  }
  assert.throws(() => createSession({ unitNumber:1, mode:'timed', durationMinutes:7, now:NOW }), /duration/i);
});

test('timed sessions remain open until expiry regardless of target count', () => {
  const session = createSession({ unitNumber:1, mode:'timed', durationMinutes:5, now:NOW });
  const withWork = { ...session, completedTargetIds:Array.from({ length:30 },(_,i)=>`v${i}`) };
  assert.equal(isSessionComplete(withWork, new Date(NOW.getTime() + 4 * 60 * 1000)), false);
  assert.equal(isSessionComplete(withWork, new Date(NOW.getTime() + 5 * 60 * 1000)), true);
});

test('timer expiry during feedback preserves earned evidence and does not record unfinished question as wrong', () => {
  const session = createSession({ unitNumber:1, mode:'timed', durationMinutes:5, now:NOW });
  const afterCorrect = completeAttempt(session, { targetId:'v1', evidence:{ correct:true }, strengthened:true });
  const duringFeedback = { ...afterCorrect, phase:'feedback', activeQuestion:{ targetId:'v2', questionId:'q2' } };
  const expired = expireSession(duringFeedback, new Date(NOW.getTime() + 5 * 60 * 1000));
  assert.equal(expired.completedAttempts.length, 1);
  assert.equal(expired.completedAttempts[0].targetId, 'v1');
  assert.equal(expired.completedAttempts.some(attempt => attempt.targetId === 'v2'), false);
  assert.equal(expired.summary.strengthened, 1);
});
