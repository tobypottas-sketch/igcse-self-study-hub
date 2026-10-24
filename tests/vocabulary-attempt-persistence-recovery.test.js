import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createAttemptPersistence } from '../src/vocabulary/attempt-persistence.js';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

// A fake server that mimics vocabulary-attempt-action idempotency: a repeated attemptId is a duplicate
// that returns the already-persisted authoritative result, and never records evidence twice.
function fakeServer({ failures = [] } = {}) {
  const committed = new Map();
  const calls = [];
  let sequence = 0;
  const script = [...failures];
  return {
    committed, calls,
    async submit(payload) {
      calls.push(payload);
      const planned = script.shift();
      if (planned === 'network') throw new Error('Failed to fetch');
      if (planned === 'conflict') throw new Error('Unable to save vocabulary attempt after concurrent mastery changes.');
      if (planned === 'lost-response') {
        if (!committed.has(payload.attemptId)) committed.set(payload.attemptId, { ...payload, order:++sequence });
        throw new Error('Failed to fetch');
      }
      const duplicate = committed.has(payload.attemptId);
      if (!duplicate) committed.set(payload.attemptId, { ...payload, order:++sequence });
      return { ok:true, duplicate, correct:payload.rawAnswer === 'right', pathwayProgress:{ stage:committed.get(payload.attemptId).order } };
    }
  };
}
const noWait = async () => {};
function harness(server, options = {}) {
  const applied = []; const blocks = []; const recoveries = []; const mismatches = [];
  const controller = createAttemptPersistence({
    submit:payload => server.submit(payload),
    apply:(entry, result) => applied.push({ rawAnswer:entry.payload.rawAnswer, attemptId:entry.attemptId, result }),
    onBlocked:error => blocks.push(error.message),
    onRecovered:() => recoveries.push(true),
    onMismatch:(entry, result) => mismatches.push({ rawAnswer:entry.payload.rawAnswer, result }),
    wait:noWait,
    ...options
  });
  return { controller, applied, blocks, recoveries, mismatches };
}
const answer = (rawAnswer, correct = true) => ({ payload:{ occurrenceId:'o1', rawAnswer }, localCorrect:correct });

test('every answer gets its own stable attemptId, and a retry re-sends that same id', async () => {
  const server = fakeServer({ failures:['network','network','network'] });
  const { controller } = harness(server, { autoRetries:2 });
  await controller.enqueue(answer('right'));
  assert.equal(controller.blocked, true);
  const ids = new Set(server.calls.map(call => call.attemptId));
  assert.equal(server.calls.length, 3, 'one attempt plus two bounded automatic retries');
  assert.equal(ids.size, 1, 'automatic retries reuse the attemptId');
  await controller.retry();
  assert.equal(new Set(server.calls.map(call => call.attemptId)).size, 1, 'a manual retry reuses the attemptId');
  assert.ok([...ids][0], 'attemptId is present');
});

test('a transient failure recovers on its own without blocking the student', async () => {
  const server = fakeServer({ failures:['conflict'] });
  const { controller, applied, blocks } = harness(server);
  await controller.enqueue(answer('right'));
  assert.equal(controller.blocked, false);
  assert.deepEqual(blocks, []);
  assert.equal(applied.length, 1);
  assert.equal(server.committed.size, 1);
});

test('persistent failure blocks, keeps later answers in order, and one Retry flushes them all exactly once', async () => {
  const server = fakeServer({ failures:['network','network','network'] });
  const { controller, applied, blocks, recoveries } = harness(server, { autoRetries:2 });
  void controller.enqueue(answer('first'));
  void controller.enqueue(answer('second'));
  void controller.enqueue(answer('third'));
  await controller.settled();
  assert.equal(controller.blocked, true);
  assert.equal(blocks.length, 1);
  assert.equal(server.calls.length, 3, 'later answers wait behind the failed head instead of leaping ahead');
  assert.equal(applied.length, 0, 'the ladder state is not advanced client-side for unsaved answers');
  const saved = await controller.retry();
  assert.equal(saved, true);
  assert.equal(controller.blocked, false);
  assert.deepEqual(applied.map(row => row.rawAnswer), ['first', 'second', 'third'], 'server order is preserved');
  assert.deepEqual([...server.committed.values()].map(row => row.rawAnswer), ['first', 'second', 'third'], 'each answer is recorded exactly once');
  assert.equal(recoveries.length, 1);
});

test('a lost response after a successful commit is recovered via idempotency: no double-recording', async () => {
  const server = fakeServer({ failures:['lost-response', 'lost-response', 'lost-response'] });
  const { controller, applied } = harness(server, { autoRetries:2 });
  await controller.enqueue(answer('right'));
  assert.equal(controller.blocked, true);
  assert.equal(server.committed.size, 1, 'the server did save it');
  await controller.retry();
  assert.equal(server.committed.size, 1, 'retry did not create a second evidence row');
  assert.equal(applied.length, 1);
  assert.equal(applied[0].result.duplicate, true, 'the duplicate path hands back the authoritative persisted state');
});

test('a server-saved answer whose correctness differs from the local mark is accepted as saved, not a dead end', async () => {
  const server = fakeServer();
  const { controller, applied, mismatches } = harness(server);
  await controller.enqueue({ payload:{ occurrenceId:'o1', rawAnswer:'wrong-locally-right' }, localCorrect:true });
  assert.equal(controller.blocked, false, 'the answer is already persisted; blocking would only trap the student');
  assert.equal(applied.length, 1, 'the authoritative result is applied');
  assert.equal(mismatches.length, 1, 'the disagreement is surfaced for diagnostics');
  assert.equal(server.committed.size, 1);
  await controller.retry();
  assert.equal(server.committed.size, 1, 'nothing is re-submitted');
});

test('settled() resolves when saved and when blocked, so Next never waits forever', async () => {
  const server = fakeServer({ failures:['network','network','network'] });
  const { controller } = harness(server, { autoRetries:2 });
  void controller.enqueue(answer('x'));
  await Promise.race([controller.settled(), new Promise((_, reject) => setTimeout(() => reject(new Error('settled() hung')), 500))]);
  assert.equal(controller.blocked, true);
  assert.equal(controller.pending, 1);
});

test('reset() refuses to discard an unsaved or blocked attempt; only an explicit force does', async () => {
  const server = fakeServer({ failures:['network','network','network'] });
  const { controller } = harness(server, { autoRetries:2 });
  await controller.enqueue(answer('x'));
  assert.equal(controller.reset(), false);
  assert.equal(controller.blocked, true);
  assert.equal(controller.pending, 1);
  assert.equal(controller.reset({ force:true }), true);
  assert.equal(controller.pending, 0);
  assert.equal(controller.reset(), true, 'an empty, settled queue may be reset');
});

// ── Wiring in the live app ─────────────────────────────────────────────────────────────────────
test('app.js never resets the attempt queue when a unit is opened or reloaded', () => {
  assert.doesNotMatch(app, /attempts\(\)\.reset\(/);
  assert.doesNotMatch(app, /\.reset\(\{\s*force/);
});

test('app.js persists through the recovery controller and not a latch that can never clear', () => {
  assert.match(app, /createAttemptPersistence\(/);
  assert.doesNotMatch(app, /persistenceBlocked\s*=\s*true/, 'the one-way persistenceBlocked latch is gone');
  assert.doesNotMatch(app, /state\.persistenceChain\s*=\s*state\.persistenceChain\.then/);
});

test('Next never waits on the queue, but a blocked backlog is retried with the same attempt ids before advancing', () => {
  const helper = app.match(/async function advanceToNextQuestion\(\) \{([\s\S]*?)\n\}/);
  assert.ok(helper);
  assert.doesNotMatch(helper[1], /attempts\(\)\.settled\(\)/);
  assert.match(helper[1], /attempts\(\)\.retry\(\)/);
  assert.match(helper[1], /nextQuestion\(\)/);
});

test('the yellow warning offers a Retry action wired to the controller', () => {
  assert.match(app, /data-action="retry-save"/);
  assert.match(app, /action === 'retry-save'/);
  assert.match(app, /function clearSyncWarning/);
});

test('running out of buildable questions after real progress ends the session gracefully instead of the error page', () => {
  const next = app.match(/function nextQuestion\(\) \{([\s\S]*?)\n\}/);
  assert.ok(next);
  assert.match(next[1], /summary\?\.practised|completedTargetIds\?\.length/);
  assert.match(next[1], /finishSessionWhenSaved\(\)/);
});

// ── openUnit() data-loss regression: runs the REAL app.js openUnit/attempts code ───────────────
import vm from 'node:vm';
const helper = name => app.match(new RegExp(`(?:async )?function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n\\}`))[0];

test('an unsaved attempt survives opening a unit while saving keeps failing, then saves once with the same attemptId', async () => {
  const server = fakeServer({ failures:['network', 'network', 'network', 'network', 'network', 'network'] });
  let warnings = 0;
  const state = {
    preview:false, client:{}, units:[{ unitNumber:1, unitTitle:'U1' }], currentUnitNumber:null, content:null, finishPending:false,
    dashboard:null, globalMastery:{}, unitMastery:{}, unitCache:new Map(), attempts:null, unitRequest:0, loadingUnit:null
  };
  const context = vm.createContext({
    state, root:{}, createAttemptPersistence, console:{ error() {}, warn() {} },
    submitVocabularyAttempt:async (_client, payload) => server.submit(payload),
    freshMastery:() => ({ status:'new' }), loadPathwaySets:async () => [], refreshSetRows:async () => {},
    clearClock() {}, renderCurrentUnit() {}, clearSyncWarning() {},
    showSyncWarning() { warnings += 1; },
    loadVocabularyUnit:async () => ({ occurrences:[], items:[], contexts:[], activities:[] }),
    loadStudentMastery:async () => ({ global:[], unit:[] }),
    mapBy:(rows, key, transform = row => row) => Object.fromEntries(rows.map(row => [row[key], transform(row)])),
    occurrence:row => row, item:row => row, context:row => row, unitActivity:row => row, mastery:row => row
  });
  // Real helpers from app.js. Speed up the controller's backoff for the test.
  vm.runInContext(`${helper('submitAttempt')}\n${helper('attempts')}\n${helper('applyServerAttemptResult')}\n${helper('setUnitLoading')}\n${helper('openUnit')}`, context);
  const controller = vm.runInContext('attempts()', context);

  // 1-2. answer queued; save fails; controller is blocked.
  await controller.enqueue({ payload:{ occurrenceId:'o1', rawAnswer:'right' }, localCorrect:true, context:{ occurrenceId:'o1', vocabularyId:'v1' } });
  assert.equal(controller.blocked, true);
  const originalId = server.calls[0].attemptId;
  const callsBefore = server.calls.length;

  // 3-4. unit navigation / reload while saving still fails.
  await vm.runInContext('openUnit(1)', context);
  assert.ok(server.calls.length > callsBefore, 'openUnit tried to recover the unsaved attempt');
  assert.equal(controller.blocked, true, 'retry failed again');

  // 5. the queued attempt and its attemptId are still there; the warning is still shown.
  assert.equal(controller.pending, 1);
  assert.ok(server.calls.every(call => call.attemptId === originalId), 'every retry used the original attemptId');
  assert.ok(warnings >= 1, 'the warning/retry route is still available');
  assert.equal(server.committed.size, 0);

  // 6-7. a later retry succeeds with that same ID and records the evidence exactly once.
  assert.equal(await controller.retry(), true);
  assert.equal(server.calls.at(-1).attemptId, originalId);
  assert.equal(server.committed.size, 1);
  assert.equal(controller.pending, 0);
  await controller.retry();
  assert.equal(server.committed.size, 1, 'nothing is recorded twice');
});
