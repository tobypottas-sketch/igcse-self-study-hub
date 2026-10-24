import test from 'node:test';
import assert from 'node:assert/strict';
import { harness } from './vocabulary-app-harness.mjs';

test('timed Mixed Practice runs a timed session through the review-only planner', () => {
  const h = harness({ pathwayId:'context', stage:'recognise', size:10, deterministic:true });
  try {
    h.run('startMixedReview(false, 5)');
    assert.equal(h.state.session.mode, 'timed');
    assert.equal(h.state.session.durationMinutes, 5);
    assert.equal(h.state.mixedReview, true);
    const plan = h.state.current.pathwayPlan;
    assert.ok(plan?.pathwayId && plan?.learnerStage, 'question comes from a pathway stage');
    assert.equal(plan.servedStage, plan.learnerStage);
  } finally { h.run('clearClock()'); }
});

test('untimed Mixed Practice stays an adaptive-length review session', () => {
  const h = harness({ pathwayId:'context', stage:'recognise', size:10, deterministic:true });
  h.run('startMixedReview()');
  assert.equal(h.state.session.mode, 'adaptive');
  assert.ok(h.state.current.pathwayPlan?.pathwayId);
});
