import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, completeAttempt } from '../src/vocabulary/session.js';

test('supported retry plus later recovery cannot produce more successful targets than completed targets', () => {
  let session = createSession({
    unitNumber:1,
    mode:'adaptive',
    practiceMode:'adaptive',
    targetIds:['occ-1'],
    now:new Date('2026-10-18T00:00:00Z')
  });

  // A correct supported retry is useful evidence, but the target is deliberately
  // recycled for an independent recovery before it counts as complete.
  session = completeAttempt(session, {
    targetId:'occ-1',
    evidence:{ correct:true, recovery:false, activityType:'meaning_match' },
    completeTarget:false,
    strengthened:true
  });

  assert.equal(session.summary.practised, 0);
  assert.equal(session.summary.strengthened, 0, 'an incomplete supported retry must not inflate the session score');

  session = completeAttempt(session, {
    targetId:'occ-1',
    evidence:{ correct:true, recovery:true, activityType:'which_situation_fits' },
    completeTarget:true,
    strengthened:true
  });

  assert.equal(session.summary.practised, 1);
  assert.equal(session.summary.strengthened, 1);
  assert.ok(session.summary.strengthened <= session.summary.practised, 'session score must never exceed its max score');
});

test('a completed unsuccessful target still counts as practised without counting as strengthened', () => {
  let session = createSession({
    unitNumber:1,
    mode:'adaptive',
    practiceMode:'adaptive',
    targetIds:['occ-1'],
    now:new Date('2026-10-18T00:00:00Z')
  });

  session = completeAttempt(session, {
    targetId:'occ-1',
    evidence:{ correct:false, recovery:false, activityType:'meaning_match' },
    completeTarget:true,
    strengthened:false,
    needsAnotherLook:true
  });

  assert.equal(session.summary.practised, 1);
  assert.equal(session.summary.strengthened, 0);
  assert.equal(session.summary.needsAnotherLook, 1);
});
