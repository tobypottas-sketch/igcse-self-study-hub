import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTrackingEvent,
  shouldCountActiveTime,
  parseExercise3Feedback,
  parseExercise4Feedback
} from '../src/tracking/core.js';

test('tracking payload never includes free-text answers', () => {
  const event = buildTrackingEvent({
    event_type: 'question_attempt',
    activity_id: 'starter:phrase_match:1',
    skill: 'phrase_match',
    mode: 'practice',
    strong: true,
    score: 1,
    max_score: 1,
    metadata: {
      attempt_number: 2,
      outcome: 'correct',
      answer_text: 'DO NOT STORE ME',
      prompt: 'DO NOT STORE ME EITHER'
    }
  });

  assert.equal(event.app_key, 'paraphrasing');
  assert.deepEqual(event.metadata, { attempt_number: 2, outcome: 'correct' });
});

test('vocabulary tracking accepts only structured categorical metadata', () => {
  const event = buildTrackingEvent({
    app_key: 'vocabulary_paraphrase',
    event_type: 'question_attempt',
    activity_id: 'unit7:target42:production',
    skill: 'production',
    mode: 'practice',
    strong: false,
    metadata: {
      unit_number: 7,
      strand: 'production',
      question_type: 'produce_paraphrase',
      attempt_number: 2,
      outcome: 'try_again',
      retry_used: true,
      recovery: false,
      misconception: 'related_but_inaccurate',
      target_id: 'vocab_significant',
      occurrence_id: 'u7_significant',
      answer_text: 'DO NOT STORE ME',
      typed_answer: 'DO NOT STORE ME EITHER',
      prompt: 'DO NOT STORE PROMPTS',
      arbitrary_field: 'NOPE'
    }
  });

  assert.equal(event.app_key, 'vocabulary_paraphrase');
  assert.deepEqual(event.metadata, {
    attempt_number: 2,
    outcome: 'try_again',
    question_type: 'produce_paraphrase',
    unit_number: 7,
    strand: 'production',
    retry_used: true,
    recovery: false,
    misconception: 'related_but_inaccurate',
    target_id: 'vocab_significant',
    occurrence_id: 'u7_significant'
  });
});

test('active time only counts while visible and recently active', () => {
  const now = 1_000_000;
  assert.equal(shouldCountActiveTime({ visible: true, lastInteractionAt: now - 30_000, now }), true);
  assert.equal(shouldCountActiveTime({ visible: false, lastInteractionAt: now - 30_000, now }), false);
  assert.equal(shouldCountActiveTime({ visible: true, lastInteractionAt: now - 180_000, now }), false);
});

test('exercise 3 feedback becomes numeric score data', () => {
  assert.deepEqual(
    parseExercise3Feedback('You found 4/5 acceptable notes under A and 3/4 under B.'),
    { score: 7, maxScore: 9 }
  );
});

test('exercise 4 feedback becomes points and word count only', () => {
  assert.deepEqual(
    parseExercise4Feedback('You included about 6 useful points. Word count: 82.'),
    { score: 6, wordCount: 82 }
  );
});

test('invalid tracking values are rejected', () => {
  assert.throws(() => buildTrackingEvent({ event_type: 'active_time', active_seconds: 0 }));
  assert.throws(() => buildTrackingEvent({ event_type: 'app_open', mode: 'other' }));
});
