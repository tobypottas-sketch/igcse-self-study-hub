import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrackingEvent } from '../src/tracking/core.js';
import {
  buildListeningAttempt,
  buildListeningExamResult,
  buildListeningSupportEvent,
  buildListeningSectionEvent
} from '../src/tracking/listening-core.js';

test('practice listening attempts carry scored outcome without answer content', () => {
  const event = buildTrackingEvent(buildListeningAttempt({ sectionId:'ex1', questionNumber:1, mode:'practice', attemptNumber:2, correct:false }));
  assert.equal(event.app_key, 'listening');
  assert.equal(event.event_type, 'question_attempt');
  assert.equal(event.set_id, 'ex1');
  assert.equal(event.score, 0);
  assert.equal(event.max_score, 1);
  assert.equal(event.strong, false);
  assert.equal(event.metadata.outcome, 'try_again');
  assert.equal(event.metadata.attempt_number, 2);
});

test('exam pre-submit attempt deliberately omits correctness', () => {
  const event = buildTrackingEvent(buildListeningAttempt({ sectionId:'ex4', questionNumber:17, mode:'exam', attemptNumber:1 }));
  assert.equal(event.event_type, 'question_attempt');
  assert.equal(event.mode, 'exam');
  assert.equal(event.score, undefined);
  assert.equal(event.max_score, undefined);
  assert.equal(event.strong, undefined);
  assert.equal(event.metadata.outcome, undefined);
});

test('exam reconciliation uses exercise_result rather than a second attempt', () => {
  const event = buildTrackingEvent(buildListeningExamResult({ sectionId:'ex4', questionNumber:17, correct:true }));
  assert.equal(event.event_type, 'exercise_result');
  assert.equal(event.score, 1);
  assert.equal(event.max_score, 1);
  assert.equal(event.strong, true);
  assert.equal(event.metadata.result_type, 'exam_reconciliation');
});

test('support and section events use bounded categorical metadata', () => {
  const support = buildTrackingEvent(buildListeningSupportEvent({ sectionId:'ex2', supportType:'transcript' }));
  const section = buildTrackingEvent(buildListeningSectionEvent({ sectionId:'ex2', mode:'practice' }));
  assert.equal(support.event_type, 'support_use');
  assert.deepEqual(support.metadata, { section_id:'ex2', support_type:'transcript' });
  assert.equal(section.event_type, 'section_use');
  assert.deepEqual(section.metadata, { section_id:'ex2' });
});

test('shared privacy boundary strips listening free text and answer choice', () => {
  const event = buildTrackingEvent({
    ...buildListeningAttempt({ sectionId:'ex5', questionNumber:25, mode:'practice', attemptNumber:1, correct:true }),
    metadata:{
      attempt_number:1,
      outcome:'correct',
      question_type:'listening_interview',
      section_id:'ex5',
      answer_choice:'C',
      prompt:'SECRET PROMPT',
      explanation:'SECRET EXPLANATION',
      hint:'SECRET HINT',
      transcript_text:'SECRET TRANSCRIPT',
      arbitrary:'SECRET'
    }
  });
  const json = JSON.stringify(event);
  assert.doesNotMatch(json,/SECRET|answer_choice|prompt|explanation|hint|transcript_text|arbitrary/);
  assert.equal(event.metadata.section_id, 'ex5');
});
