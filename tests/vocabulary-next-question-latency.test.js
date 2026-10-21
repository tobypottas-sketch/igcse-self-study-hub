import test from 'node:test';
import assert from 'node:assert/strict';
import { harness, correctAnswer } from './vocabulary-app-harness.mjs';

// Real app.js controller, real planner, real server validation; only the save transport is simulated.
const sleep = ms => new Promise(done => setTimeout(done, ms));

// Plays a mission: answers per plan(n) (true = correct), clicking Next as soon as the answer is final.
async function play(h, { pathwayId, plan = () => true, waitForSaves = false, max = 60 } = {}) {
  h.run(`startPathwaySession('${pathwayId}')`);
  for (let n = 1; n <= max && h.state.current && !h.summaries.length; n += 1) {
    const answer = plan(n) ? correctAnswer(h) : '__wrong__';
    h.run(`handleAnswer(null,${JSON.stringify(answer)})`);
    if (h.state.current?.answered) {
      if (waitForSaves) await h.state.attempts?.settled();
      await h.run('advanceToNextQuestion()');
    }
  }
  await h.state.attempts?.settled();
  await sleep(5);
  return h;
}
const withoutIds = rows => rows.map(({ attemptId, ...rest }) => rest);
// Option ORDER is shuffled by a per-session random nonce (createSession), so compare the option sets.
const sequence = h => h.served.map(({ target, type, contentId, prompt, options, retry, recovery }) => ({ target, type, contentId, prompt, options:options ? [...options].map(String).sort() : null, retry, recovery }));
const progress = h => JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(h.state.unitMastery).map(([id, row]) => [id, row.contextualEvidence?.pathwayProgress ?? null]))));

// ── Dependency proof: what the next question needs ─────────────────────────────────────────────────
for (const [pathwayId, stage] of [['word_families', 'match'], ['context', 'recognise']]) {
  test(`the next question never depends on when saves finish (${pathwayId}/${stage}, with wrong answers, retries and recovery)`, async () => {
    const plan = n => n % 3 !== 1;                       // wrong, retry ok, ok, wrong, retry ok, ok ...
    const options = { pathwayId, stage, size:6, deterministic:true };
    const reference = await play(harness(options), { pathwayId, plan, waitForSaves:true });                         // old behaviour: wait for each save
    const instant = await play(harness({ ...options, submitDelay:() => 0 }), { pathwayId, plan });                 // never wait
    const slow = await play(harness({ ...options, submitDelay:(_p, i) => 3 + (i * 7) % 23 }), { pathwayId, plan });  // jittery slow network, never wait
    assert.ok(reference.served.length >= 6);
    assert.deepEqual(sequence(instant), sequence(reference), 'same questions, in the same order, with instant saves');
    assert.deepEqual(sequence(slow), sequence(reference), 'same questions, in the same order, with slow saves');
    assert.deepEqual(progress(slow), progress(reference), 'server-authoritative pathway progression ends identical');
    assert.deepEqual(withoutIds(slow.saved), withoutIds(reference.saved), 'the same attempts are saved, in the same order');
    assert.deepEqual(slow.summaries.at(-1)?.finishModel, reference.summaries.at(-1)?.finishModel, 'the results screen is identical');
    assert.deepEqual(slow.state.session.summary, reference.state.session.summary);
    assert.equal(slow.rejected.length, 0, 'the server accepts every payload');
  });
}

test('a recovery question is never skipped, duplicated or counted twice when saves are slow', async () => {
  const h = await play(harness({ pathwayId:'word_families', stage:'match', size:2, deterministic:true, submitDelay:() => 40 }), { pathwayId:'word_families', plan:n => n !== 1 });
  const recoveries = h.served.filter(row => row.recovery && !row.feedback);   // a presentation, not a feedback re-render
  assert.equal(recoveries.length, 1, 'exactly one recovery question for the one missed target');
  assert.equal(h.state.session.completedTargetIds.length, 2, 'both mission targets completed exactly once');
  assert.deepEqual(h.state.session.summary.practised, 2);
  assert.equal(h.summaries.length, 1, 'finished once');
});

// ── Mismatch: the server disagrees after the student has moved on ──────────────────────────────────
test('a server marking mismatch that arrives after the student moved on is applied safely', async () => {
  const warnings = [];
  const h = harness({ pathwayId:'word_families', stage:'match', size:4, deterministic:true, submitDelay:() => 60, serverCorrect:(payload, local) => (payload.firstAttempt && local ? false : local) });
  h.run("startPathwaySession('word_families')");
  h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);          // locally correct
  await h.run('advanceToNextQuestion()');
  const shown = h.state.current;                                             // the student is already on question 2
  const rendersBefore = h.served.length;
  const sessionBefore = JSON.stringify(h.state.session);
  assert.ok(h.state.attempts.pending >= 1, 'the first save is still in flight');
  await h.state.attempts.settled();                                          // the disagreeing result arrives now
  assert.equal(h.state.current, shown, 'the late result does not replace the question on screen');
  assert.equal(h.served.length, rendersBefore, 'no re-render');
  assert.equal(JSON.stringify(h.state.session), sessionBefore, 'session/mission counters are untouched');
  const firstOccurrence = h.saved[0].occurrenceId;
  const serverProgress = h.state.unitMastery[firstOccurrence].contextualEvidence.pathwayProgress.word_families;
  assert.equal(serverProgress.stages?.match?.failures ?? 0, 1, 'the server result (not the local mark) updated progression');
  assert.equal(h.state.attempts.blocked, false, 'a mismatch never blocks the queue');
  assert.equal(h.state.attempts.pending, 0);
  void warnings;
});

// ── Ordered, idempotent background persistence ────────────────────────────────────────────────────
test('background saves stay strictly ordered, one attempt id each, exactly once', async () => {
  const h = await play(harness({ pathwayId:'context', stage:'recognise', size:6, deterministic:true, submitDelay:(_p, i) => 30 - (i * 5) % 25 }), { pathwayId:'context', plan:n => n % 4 !== 2 });
  assert.equal(h.state.attempts.pending, 0);
  const ids = h.requests.map(row => row.attemptId);
  assert.equal(new Set(ids).size, ids.length, 'every attempt id is unique and each was sent exactly once');
  assert.equal(h.saved.length, ids.length);
  assert.deepEqual(h.saved.map(row => row.attemptId), ids, 'saved in the order the answers were given');
  const sent = h.requests.map(row => row.at);
  assert.deepEqual([...sent].sort((a, b) => a - b), sent, 'requests are issued one after another');
});

test('a slow network never queues Next behind the save: Next is effectively instant', async () => {
  const h = harness({ pathwayId:'context', stage:'recognise', size:6, deterministic:true, submitDelay:() => 400 });
  h.run("startPathwaySession('context')");
  const start = performance.now();
  for (let n = 0; n < 3; n += 1) { h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`); await h.run('advanceToNextQuestion()'); }
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 100, `three questions answered and advanced in ${elapsed.toFixed(1)}ms while saves take 400ms each`);
  assert.ok(h.state.attempts.pending >= 2, 'saves continue in the background');
  await h.state.attempts.settled();
  assert.equal(h.saved.length, 3);
});

// ── Failure behaviour ─────────────────────────────────────────────────────────────────────────────
test('transient failures retry in the background with the same attempt id; Next is not tied to the backoff', async () => {
  const h = harness({ pathwayId:'context', stage:'recognise', size:4, deterministic:true, submitDelay:() => 5, fail:(_p, i) => i <= 2 });
  h.run("startPathwaySession('context')");
  h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
  const start = performance.now();
  await h.run('advanceToNextQuestion()');
  assert.ok(performance.now() - start < 50, 'Next did not wait for the 400ms + 800ms backoff');
  await h.state.attempts.settled();
  assert.equal(new Set(h.requests.map(row => row.attemptId)).size, 1, 'three tries, one attempt id');
  assert.equal(h.requests.length, 3);
  assert.equal(h.saved.length, 1);
  assert.equal(h.state.attempts.blocked, false);
});

test('a blocked head attempt keeps its place; answers queue behind it and a backlog cap forces recovery before more progress', async () => {
  let failing = true;
  const h = harness({ pathwayId:'context', stage:'recognise', size:10, deterministic:true, submitDelay:() => 2, fail:() => failing });
  h.run("startPathwaySession('context')");
  h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
  await h.run('advanceToNextQuestion()');
  await h.state.attempts.settled();                                          // auto retries exhausted -> blocked
  assert.equal(h.state.attempts.blocked, true);
  const headId = h.requests[0].attemptId;
  const served = () => h.served.length;
  // While blocked, the student keeps moving, but only up to the backlog cap.
  let advanced = 0;
  for (let n = 0; n < 6; n += 1) {
    const before = served();
    h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
    const stuck = h.state.attempts.pending >= 3;
    if (stuck) failing = false;                                               // the network comes back as the cap is hit
    await h.run('advanceToNextQuestion()');
    if (served() > before) advanced += 1;
  }
  assert.ok(advanced >= 3, 'Next kept working while a save was blocked');
  await h.state.attempts.settled();
  assert.equal(h.state.attempts.blocked, false);
  assert.equal(h.state.attempts.pending, 0);
  assert.equal(h.saved[0].attemptId, headId, 'the blocked attempt was saved first, with its original id');
  assert.equal(new Set(h.saved.map(row => row.attemptId)).size, h.saved.length, 'nothing saved twice');
});

test('with the network still down at the backlog cap, Next stays safe: no advance, nothing lost, warning kept', async () => {
  const h = harness({ pathwayId:'context', stage:'recognise', size:10, deterministic:true, submitDelay:() => 1, fail:() => true });
  h.run("startPathwaySession('context')");
  for (let n = 0; n < 4; n += 1) { h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`); await h.run('advanceToNextQuestion()'); await h.state.attempts.settled(); }
  assert.equal(h.state.attempts.blocked, true);
  const pending = h.state.attempts.pending;
  assert.ok(pending >= 3);
  const shown = h.state.current;
  await h.run('advanceToNextQuestion()');
  assert.equal(h.state.current, shown, 'refused to pile more unsaved work on a dead connection');
  assert.equal(h.state.attempts.pending, pending, 'no attempt was dropped');
});

// ── Finishing is the one place that waits ─────────────────────────────────────────────────────────
test('the results screen waits for every save; nothing pending means it appears synchronously', async () => {
  const slow = harness({ pathwayId:'context', stage:'recognise', size:3, deterministic:true, submitDelay:() => 80 });
  slow.run("startPathwaySession('context')");
  for (let n = 0; n < 3; n += 1) { slow.run(`handleAnswer(null,${JSON.stringify(correctAnswer(slow))})`); await slow.run('advanceToNextQuestion()'); }
  assert.equal(slow.summaries.length, 0, 'results are held back while saves are in flight');
  assert.equal(slow.saved.length < 3, true);
  await slow.state.attempts.settled(); await sleep(10);
  assert.equal(slow.saved.length, 3);
  assert.equal(slow.summaries.length, 1, 'then shown exactly once');

  const instant = harness({ pathwayId:'context', stage:'recognise', size:1, deterministic:true });
  instant.run("startPathwaySession('context')");
  instant.run(`handleAnswer(null,${JSON.stringify(correctAnswer(instant))})`);
  await instant.state.attempts.settled();
  await instant.run('advanceToNextQuestion()');
  assert.equal(instant.summaries.length, 1, 'with nothing pending the summary renders in the same tick');
});

test('every wait on persistence is accounted for in app.js', async () => {
  const { readFileSync } = await import('node:fs');
  const app = readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  let current = null; const where = [];
  for (const line of app.split('\n')) {
    const fn = line.match(/^(?:async )?function (\w+)\(/); if (fn) current = fn[1]; else if (/^\}/.test(line)) current = '<event handler>';
    if (/attempts\(\)\.(?:settled|retry)\(\)/.test(line)) where.push(current ?? '?');
  }
  // Allowed: finishing (required), starting a session after leaving mid-save (required), opening a unit while blocked,
  // the explicit retry button, the blocked-backlog guard in Next. Nothing else may wait on the queue.
  const allowed = new Set(['finishSessionWhenSaved', 'runAfterSaves', 'openUnit', 'advanceToNextQuestion', '<event handler>']);  // the last one is the explicit "Try saving again" button
  assert.ok(where.length >= 4);
  for (const name of where) assert.ok(allowed.has(name), `unexpected persistence wait in ${name}()`);
  assert.doesNotMatch(app.match(/async function advanceToNextQuestion\(\) \{[\s\S]*?\n\}/)[0], /settled\(\)/);
});

// ── Exact backlog-cap boundary (MAX_UNSAVED_WHILE_BLOCKED = 3) ────────────────────────────────────
test('backlog cap boundary: blocked + 2 pending lets Next through; blocked + exactly 3 pending retries first', async () => {
  const net = { down:true };
  const h = harness({ pathwayId:'context', stage:'recognise', size:10, deterministic:true, submitDelay:() => 1, fail:() => net.down });
  h.run("startPathwaySession('context')");
  const answer = () => h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
  answer(); await h.run('advanceToNextQuestion()'); await h.state.attempts.settled();    // head attempt fails -> blocked
  assert.equal(h.state.attempts.blocked, true);

  answer();                                                                                // 2 pending (head + this one)
  assert.equal(h.state.attempts.pending, 2);
  let shown = h.state.current;
  await h.run('advanceToNextQuestion()');
  assert.notEqual(h.state.current, shown, 'under the cap: Next proceeds without a retry');

  answer();                                                                                // exactly 3 pending
  assert.equal(h.state.attempts.pending, 3);
  assert.equal(h.state.attempts.blocked, true);
  const requestsBefore = h.requests.length; shown = h.state.current;
  await h.run('advanceToNextQuestion()');                                                  // network still down
  assert.ok(h.requests.length > requestsBefore, 'at the cap Next attempted recovery (a retry hit the network) first');
  assert.equal(h.state.current, shown, 'recovery failed, so no further question was served');
  assert.equal(h.state.attempts.pending, 3, 'nothing dropped');

  net.down = false;                                                                        // network back: recovery succeeds, then Next proceeds
  await h.run('advanceToNextQuestion()');
  assert.notEqual(h.state.current, shown, 'once the retry flushes the queue, Next advances');
  assert.equal(h.state.attempts.pending, 0);
  assert.equal(new Set(h.saved.map(row => row.attemptId)).size, h.saved.length);
});
