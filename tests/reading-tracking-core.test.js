import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrackingEvent } from '../src/tracking/core.js';

test('reading tracking uses the reading app key and strips free text', () => {
  const event = buildTrackingEvent({
    app_key: 'reading',
    event_type: 'question_attempt',
    activity_id: 'paper1:p1e1q1',
    skill: 'short answers',
    set_id: 'paper1',
    mode: 'practice',
    strong: true,
    score: 1,
    max_score: 1,
    metadata: {
      attempt_number: 1,
      outcome: 'correct',
      question_type: 'short_answers',
      answer_text: 'DO NOT STORE THIS',
      prompt: 'DO NOT STORE THIS EITHER'
    }
  });

  assert.equal(event.app_key, 'reading');
  assert.deepEqual(event.metadata, {
    attempt_number: 1,
    outcome: 'correct',
    question_type: 'short_answers'
  });
});

test('reading question types are accepted', () => {
  for (const questionType of ['short_answers', 'matching', 'notes', 'mcq']) {
    const event = buildTrackingEvent({
      app_key: 'reading',
      event_type: 'question_attempt',
      metadata: { question_type: questionType }
    });
    assert.equal(event.metadata.question_type, questionType);
  }
});

test('unknown app keys are rejected', () => {
  assert.throws(() => buildTrackingEvent({ app_key: 'unknown_app', event_type: 'app_open' }));
});
