import test from 'node:test';
import assert from 'node:assert/strict';
import { harness, correctAnswer, settle, advanceToRecovery } from './vocabulary-app-harness.mjs';
import { completeAttempt, createSession, missionProgress } from '../src/vocabulary/session.js';

const ids = ['t1', 't2'];
const newSession = () => createSession({ mode:'adaptive', unitNumber:1, targetIds:ids });
const parse = label => { const m = /^(\d+) \/ (\d+) activities$/.exec(label); assert.ok(m, `unexpected label ${label}`); return { done:Number(m[1]), total:Number(m[2]) }; };

test('missionProgress counts completed planned targets, not raw submissions', () => {
  let session = newSession();
  assert.deepEqual(missionProgress(session), { done:0, total:2 });
  // wrong first answer: the attempt is recorded but the target is not complete
  session = completeAttempt(session, { targetId:'t1', completeTarget:false });
  assert.deepEqual(missionProgress(session), { done:0, total:2 });
  // supported retry answered correctly: still not complete (recovery owed)
  session = completeAttempt(session, { targetId:'t1', completeTarget:false });
  assert.equal(session.completedAttempts.length, 2);
  assert.deepEqual(missionProgress(session), { done:0, total:2 });
  // recovery question answered correctly: complete
  session = completeAttempt(session, { targetId:'t1', completeTarget:true });
  assert.equal(session.completedAttempts.length, 3, 'raw submissions are now 3 …');
  assert.deepEqual(missionProgress(session), { done:1, total:2 }, '… but progress is 1 / 2, never 3 / 2');
  // completing the same target twice never double-counts; unknown ids are ignored
  session = completeAttempt(session, { targetId:'t1', completeTarget:true });
  session = completeAttempt(session, { targetId:'stranger', completeTarget:true });
  assert.deepEqual(missionProgress(session), { done:1, total:2 });
  session = completeAttempt(session, { targetId:'t2', completeTarget:true });
  assert.deepEqual(missionProgress(session), { done:2, total:2 });
});

test('the numerator is exactly the set isSessionComplete uses, and handles empty/invalid sessions', () => {
  assert.deepEqual(missionProgress(null), { done:0, total:0 });
  assert.deepEqual(missionProgress({ targetIds:[], completedTargetIds:['x'] }), { done:0, total:0 });
});

test('live label for a 2-activity mission: clean, wrong + supported retry, then recovery never exceeds the total', async () => {
  const h = harness({ pathwayId:'word_families', stage:'match', size:2 });
  await h.run("startPathwaySession('word_families')");
  const labels = [parse(h.run('remainingLabel()'))];
  const seen = () => labels.push(parse(h.run('remainingLabel()')));
  h.run('handleAnswer(null,"__wrong__")'); seen();                       // wrong
  h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`); seen(); // supported retry
  // The other target is answered cleanly (attempt 2), then the recovery question arrives (attempt 3).
  await settle(h); await h.run('advanceToNextQuestion()');
  h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`); seen();
  assert.equal(h.state.session.completedAttempts.length, 2);
  assert.equal(parse(h.run('remainingLabel()')).done, 1, 'the old numerator would already read 2 / 2');
  await advanceToRecovery(h);
  h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);          // recovery: raw attempt #3 of a 2-activity mission
  await settle(h);
  assert.equal(h.state.session.completedAttempts.length, 3, 'the exact production sequence: 3 attempts for 2 activities');
  assert.deepEqual(missionProgress(h.state.session), { done:2, total:2 }, 'and the mission shows 2 / 2, never 3 / 2');
  for (const { done, total } of labels) { assert.equal(total, 2); assert.ok(done <= total, `${done} / ${total}`); }
  assert.deepEqual(labels.map(row => row.done), [0, 0, 0, 1]);
});

test('a 10-question mission still shows a sensible, monotone x / 10', async () => {
  const h = harness({ pathwayId:'context', stage:'recognise', size:10 });
  await h.run("startPathwaySession('context')");
  const shown = []; let wrongOnce = 0;
  for (let step = 0; step < 40 && h.state.current; step += 1) {
    const { done, total } = parse(h.run('remainingLabel()'));
    assert.equal(total, 10); assert.ok(done <= total, `${done} / ${total}`);
    shown.push(done);
    if (wrongOnce < 3 && step % 3 === 0 && !h.state.current.retry) { wrongOnce += 1; h.run('handleAnswer(null,"__wrong__")'); h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`); }
    else h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
    await settle(h); await h.run('advanceToNextQuestion()');
  }
  assert.ok(h.state.session.completedAttempts.length > 10, 'extra attempts happened (wrong answers + recovery)');
  assert.deepEqual(shown, [...shown].sort((a, b) => a - b), 'progress never goes backwards');
  assert.ok(shown.at(-1) <= 10);
  assert.ok(shown.every(n => Number.isInteger(n)));
});
