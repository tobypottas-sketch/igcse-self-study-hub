import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAnswerEventFromState,
  buildExamReconciliationEvents,
  createOncePerKeyGate,
  safeWrapAfter
} from '../src/tracking/listening-wrapper.js';

test('practice answers expose correctness but not selected option', () => {
  const state = { mode:'practice', answers:{ 3:{ choice:'B', correct:false, attempts:2 } } };
  const event = buildAnswerEventFromState({ state, sectionId:'ex1', questionNumber:3, attemptNumber:2 });
  assert.equal(event.event_type, 'question_attempt');
  assert.equal(event.score, 0);
  assert.equal(event.metadata.outcome, 'try_again');
  assert.doesNotMatch(JSON.stringify(event), /"B"|choice/);
});

test('exam answers before submission are unscored completion evidence', () => {
  const state = { mode:'exam', examSubmitted:false, answers:{ 17:{ choice:'C', correct:true, attempts:1 } } };
  const event = buildAnswerEventFromState({ state, sectionId:'ex4', questionNumber:17, attemptNumber:1 });
  assert.equal(event.event_type, 'question_answered');
  assert.equal(event.mode, 'exam');
  assert.equal(event.score, undefined);
  assert.equal(event.metadata.outcome, undefined);
  assert.doesNotMatch(JSON.stringify(event), /"C"|choice/);
});

test('exam reconciliation returns the single scored question attempts', () => {
  const state = { mode:'exam', examSubmitted:true, answers:{ 17:{ choice:'A', correct:true }, 18:{ choice:'B', correct:false } } };
  const events = buildExamReconciliationEvents(state, new Map([[17,'ex4'],[18,'ex4']]));
  assert.equal(events.length, 2);
  assert.ok(events.every(event => event.event_type === 'question_attempt'));
  assert.deepEqual(events.map(event => event.score), [1,0]);
  assert.doesNotMatch(JSON.stringify(events), /choice|"A"|"B"/);
});

test('once-per-key gate suppresses duplicate section/support noise', () => {
  const gate = createOncePerKeyGate();
  assert.equal(gate('section:ex1'), true);
  assert.equal(gate('section:ex1'), false);
  assert.equal(gate('transcript:ex1'), true);
  assert.equal(gate('transcript:ex1'), false);
});

test('safe wrapper preserves original return value when tracking callback throws', () => {
  const target = { fn(value){ return value * 2; } };
  safeWrapAfter(target, 'fn', () => { throw new Error('tracking broke'); }, () => {});
  assert.equal(target.fn(4), 8);
});
