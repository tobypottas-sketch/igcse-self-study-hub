import test from 'node:test';
import assert from 'node:assert/strict';
import { harness, correctAnswer } from './vocabulary-app-harness.mjs';
import { readFileSync } from 'node:fs';

// Cross-session hand-offs (start pathway / Mixed Practice / Continue Practice) are persistence-gated: a new session may
// start only when every earlier answer is saved. Next Question and the Q10 finish keep their own (unchanged) behaviour.
const sleep = ms => new Promise(done => setTimeout(done, ms));
const HANDOFFS = {
  pathway: "runAfterSaves(() => { state.starts = (state.starts ?? 0) + 1; startPathwaySession('context'); })",
  mixed: "runAfterSaves(() => { state.starts = (state.starts ?? 0) + 1; startMixedReview(); })",
  continue: "runAfterSaves(() => { state.starts = (state.starts ?? 0) + 1; continuePractice(); })"
};

// Answers `count` questions in a context/recognise mission while the network is controlled by `net.down`.
async function blockedHarness({ count = 2, delay = 2 } = {}) {
  const net = { down:true };
  const h = harness({ pathwayId:'context', stage:'recognise', size:10, deterministic:true, submitDelay:() => delay, fail:() => net.down });
  h.run("startPathwaySession('context')");
  for (let n = 0; n < count; n += 1) { h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`); await h.run('advanceToNextQuestion()'); }
  await h.state.attempts.settled();
  assert.equal(h.state.attempts.blocked, true, 'precondition: the head attempt is blocked');
  return { h, net };
}
const ids = h => h.requests.map(row => row.attemptId);

for (const [name, handoff] of Object.entries(HANDOFFS)) {
  test(`${name} hand-off: a blocked queue does not start a session; a failed retry keeps everything; success starts exactly once`, async () => {
    const { h, net } = await blockedHarness();
    const session = h.state.session; const pending = h.state.attempts.pending; const shown = h.state.current;
    const headId = ids(h)[0];
    assert.ok(pending >= 2);

    h.run(handoff);                                       // blocked -> settled(false) -> retry() -> still failing
    await sleep(40);
    assert.equal(h.state.starts ?? 0, 0, 'not started while the retry is still in flight');
    for (let i = 0; i < 300 && h.state.handoffPending; i += 1) await sleep(10);   // the retry runs its own 400 + 800 ms backoff
    assert.equal(h.state.starts ?? 0, 0, 'the new session did not start');
    assert.equal(h.state.session, session, 'still in the same session');
    assert.equal(h.state.current, shown, 'the learner stays on the current screen');
    assert.equal(h.state.attempts.pending, pending, 'no queued attempt was dropped or reset');
    assert.equal(h.state.attempts.blocked, true, 'still blocked, so the sync warning / Retry Save control stays');
    assert.equal(h.state.handoffPending, false, 'a later click is allowed to try again');

    net.down = false;                                     // the network returns; the hand-off is clicked again
    h.run(handoff);
    for (let i = 0; i < 40 && !h.state.starts; i += 1) await sleep(10);
    await sleep(30);
    assert.equal(h.state.starts, 1, 'started exactly once after the successful retry');
    assert.equal(h.state.attempts.pending, 0);
    assert.equal(h.state.attempts.blocked, false);
    assert.equal(h.saved[0].attemptId, headId, 'the blocked head attempt was retried with its original id, first');
    assert.equal(h.saved.length, pending, 'every queued attempt was saved, none dropped');
    assert.ok(ids(h).filter(id => id === headId).length > 1, 'the head was retried, not re-created');
    assert.equal(new Set(h.saved.map(row => row.attemptId)).size, h.saved.length, 'no duplicate persistence');
    assert.equal(h.rejected.length, 0);
  });

  test(`${name} hand-off: repeated clicks while blocked and recovering start one session only`, async () => {
    const { h, net } = await blockedHarness();
    net.down = false;
    h.run(handoff); h.run(handoff); h.run(handoff);
    for (let i = 0; i < 40 && !h.state.starts; i += 1) await sleep(10);
    await sleep(50);
    assert.equal(h.state.starts, 1);
    assert.equal(new Set(h.saved.map(row => row.attemptId)).size, h.saved.length);
  });

  test(`${name} hand-off: a healthy pending save lets the hand-off through once it completes`, async () => {
    const h = harness({ pathwayId:'context', stage:'recognise', size:10, deterministic:true, submitDelay:() => 60 });
    h.run("startPathwaySession('context')");
    h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
    await h.run('advanceToNextQuestion()');
    assert.ok(h.state.attempts.pending > 0);
    h.run(handoff);
    assert.equal(h.state.starts ?? 0, 0, 'held while the save is in flight');
    for (let i = 0; i < 60 && !h.state.starts; i += 1) await sleep(10);
    assert.equal(h.state.starts, 1);
    assert.equal(h.saved.length, 1, 'the earlier answer was saved before the new session began');
  });

  test(`${name} hand-off: with nothing pending it starts immediately`, async () => {
    const h = harness({ pathwayId:'context', stage:'recognise', size:10, deterministic:true });
    h.run("startPathwaySession('context')");
    h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
    await h.state.attempts.settled();
    h.run(handoff);
    assert.equal(h.state.starts, 1, 'synchronous, no await');
  });
}

test('the click handlers for all three hand-offs go through runAfterSaves, and no other path starts a session', () => {
  const app = readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  for (const action of ['start-recommended', 'start-practice-choice', 'start-mixed-review', 'continue-practice']) assert.match(app, new RegExp(`action === '${action}'\\)[^\\n]*runAfterSaves\\(`));
  const body = app.match(/function runAfterSaves\(start\) \{[\s\S]*?\n\}\n/)[0];
  assert.match(body, /await queue\.settled\(\)/);
  assert.match(body, /queue\.retry\(\)/);
  assert.match(body, /renderSyncWarning\(\)/);
  assert.doesNotMatch(body, /\.then\(go\)/, 'the settled() boolean is never ignored');
  const starters = [...app.matchAll(/^(?!(?:async )?function )[^\n]*\b(startPathwaySession|startMixedReview|startSession|continuePractice)\(/gm)].map(match => match[0].trim());
  for (const line of starters) assert.match(line, /runAfterSaves|^\s*if \(state\.(pathwayId|mixedReview|session|practiceFocus)/, `ungated session start: ${line}`);
});

test('Next Question stays optimistic with a blocked queue, and the Q10 finish is unchanged', async () => {
  const { h, net } = await blockedHarness({ count: 1 });
  const before = h.served.length; const t0 = performance.now();
  h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
  await h.run('advanceToNextQuestion()');
  assert.ok(performance.now() - t0 < 50, 'Next did not wait for the blocked queue');
  assert.ok(h.served.length > before);
  assert.equal(h.summaries.length, 0);
  net.down = false;

  const fin = harness({ pathwayId:'context', stage:'recognise', size:2, deterministic:true, submitDelay:() => 60 });
  fin.run("startPathwaySession('context')");
  for (let n = 0; n < 2; n += 1) { fin.run(`handleAnswer(null,${JSON.stringify(correctAnswer(fin))})`); await fin.run('advanceToNextQuestion()'); }
  assert.equal(fin.summaries.length, 0, 'results still held until saves land');
  await fin.state.attempts.settled(); await sleep(20);
  assert.equal(fin.summaries.length, 1);
});
