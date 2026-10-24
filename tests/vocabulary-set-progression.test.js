// Job 6: server-held Sets-of-10 progression drives the visible student journey. Runs the REAL app.js controller against a faithful
// in-memory server (start_vocabulary_mission + record_vocabulary_mission + the Set trigger, using the production stage-progression.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import { harness } from './vocabulary-app-harness.mjs';
import { dbRow } from './support/set-server.js';

// The browser's mission cache (the same localStorage the app uses). Each test is its own student so caches never leak between tests.
const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
let students = 0;
const PATHWAY = 'meaning';
const fresh = (opts = {}) => harness({ pathwayId: PATHWAY, stage: 'recognise', size: 10, setServer: true, userKey: `student-${students += 1}`, ...opts });
const wrongSet = ids => new Set(ids);

// Plays the current mission to its end. `miss` = occurrence ids answered wrongly every time (first ask, retry and recovery re-ask).
async function play(h, miss = []) {
  const wrong = wrongSet(miss);
  for (let guard = 0; guard < 400 && h.state.current; guard += 1) {
    const q = h.state.current; const wasRetry = q.retry;
    const value = wrong.has(q.target.occurrenceId) ? '__wrong__' : q.question.markingReference.acceptedAnswers[0];
    h.run(`handleAnswer(null,${JSON.stringify(value)})`);
    await h.state.attempts.settled();
    if (!wasRetry && h.state.current?.retry) continue;                                  // a wrong first answer offers the same question once more
    await h.run('advanceToNextQuestion()');
  }
  await h.state.settling;
  await new Promise(resolve => setImmediate(resolve));
}
const row = (h, n = 1) => h.server.rows().find(r => r.pathway_id === PATHWAY && r.set_number === n);
const lastSummary = h => h.summaries.at(-1)?.finishModel;
async function start(h) { await h.run(`startPathwaySession('${PATHWAY}')`); }
async function cont(h) { await h.run('continuePractice()'); }
const targetsOf = h => [...h.state.session.targetIds];

test('Apply 10/10 → settle → completion screen names Recall → Continue studying launches SAME SET · Recall (the reported defect)', async () => {
  const h = fresh({ stage: 'apply' });
  await start(h);
  assert.equal(h.state.pathwayStage, 'apply');
  const setMembers = targetsOf(h);
  await play(h);
  const model = lastSummary(h);
  assert.equal(model.stageId ?? model.stage ?? 'apply', 'apply');
  assert.equal(model.nextStageId, 'recall');
  assert.match(model.nextLine, /Recall · Stage 4 of 5/);
  assert.equal(row(h).stage, 'recall');
  await cont(h);
  assert.equal(h.state.pathwayStage, 'recall', 'Continue studying must start Recall, not Recognise');
  assert.equal(h.state.setStep.setNumber, 1);
  assert.deepEqual([...targetsOf(h)].sort(), [...setMembers].sort(), 'same Set, same ten words');
  assert.equal(h.state.session.targetIds.length, 10);
});

test('Recall 10/10 → Mastery; Mastery 10/10 → Maintain (never falls back)', async () => {
  const h = fresh({ stage: 'recall' });
  await start(h); await play(h);
  assert.equal(row(h).stage, 'mastery'); assert.equal(row(h).status, 'active');
  await cont(h);
  assert.equal(h.state.pathwayStage, 'mastery');
  await play(h);
  assert.equal(row(h).status, 'maintain'); assert.equal(row(h).stage, 'mastery');
  assert.equal(lastSummary(h).variant, 'mastered');                       // the only Set: first pass complete
  await assert.rejects(() => cont(h), /Maintain|Mixed Practice/);
  assert.equal(row(h).status, 'maintain');
});

test('Maintain → next Set starts at Recognise; the last Set stays complete', async () => {
  const h = fresh({ stage: 'mastery', size: 20 });
  await start(h); await play(h);
  assert.equal(row(h, 1).status, 'maintain');
  assert.equal(lastSummary(h).variant, 'set-complete');
  assert.match(lastSummary(h).nextLine, /Set 2 · Recognise/);
  await cont(h);
  assert.equal(h.state.setStep.setNumber, 2);
  assert.equal(h.state.pathwayStage, 'recognise');
  assert.equal(row(h, 1).status, 'maintain', 'Set 1 stays Maintain while Set 2 begins');
  // Walk Set 2 to the end: nothing returns to Set 1 or to an earlier stage.
  const seen = [];
  for (let i = 0; i < 6 && row(h, 2)?.status !== 'maintain'; i += 1) { await play(h); seen.push(row(h, 2).stage); if (row(h, 2).status !== 'maintain') await cont(h); }
  assert.equal(row(h, 2).status, 'maintain');
  assert.equal(lastSummary(h).variant, 'mastered');
  assert.equal(row(h, 1).status, 'maintain');
});

test('6–7 correct stays on the stage with a pending Consolidate; ≤5 stays with pending Recovery', async () => {
  const h = fresh({ stage: 'apply' });
  await start(h);
  const ids = targetsOf(h);
  await play(h, ids.slice(0, 3));                                            // 7/10
  assert.equal(row(h).stage, 'apply'); assert.equal(row(h).phase, 'consolidate');
  assert.deepEqual([...row(h).weak_target_ids].sort(), ids.slice(0, 3).sort());
  assert.match(lastSummary(h).nextLine, /Consolidate|Apply/i);
  await cont(h);
  assert.equal(h.state.pathwayStage, 'apply'); assert.equal(h.state.setStep.missionKind, 'consolidate');
  assert.equal(h.state.session.targetIds.length, 10, 'Consolidate is a full ten-question mission');
  await play(h);                                                              // passes Consolidate
  assert.equal(row(h).stage, 'recall'); assert.equal(row(h).phase, 'stage');

  const g = fresh({ stage: 'apply' });
  await start(g);
  await play(g, targetsOf(g).slice(0, 5));                                    // 5/10
  assert.equal(row(g).stage, 'apply'); assert.equal(row(g).phase, 'recovery');
  await cont(g);
  assert.equal(g.state.setStep.missionKind, 'recovery');
  assert.equal(g.state.session.targetIds.length, 10, 'Recovery is a full ten-question mission');
});

test('failed recovery → finite escape: a fresh stage mission advances regardless of score, flagged advanced-with-support', async () => {
  const h = fresh({ stage: 'apply' });
  await start(h);
  const all = targetsOf(h);
  await play(h, all);                                                         // 0/10 → recovery pending
  assert.equal(row(h).phase, 'recovery');
  await cont(h); await play(h, all);                                          // recovery never advances
  assert.equal(row(h).stage, 'apply'); assert.equal(row(h).phase, 'fresh');
  await cont(h); assert.equal(h.state.setStep.phase, 'fresh');
  await play(h, all);                                                         // fresh mission: advances at any score
  assert.equal(row(h).stage, 'recall'); assert.equal(row(h).phase, 'stage');
  assert.ok(row(h).advanced_with_support.length >= 1);
  assert.equal(row(h).support_flags.at(-1).blocksProgression, false);
  assert.ok(row(h).support_flags.at(-1).targetIds.length > 0);
});

test('refresh / resume preserves the Set and stage: a new session of the app reads the server state, not the browser', async () => {
  const h = fresh({ stage: 'match' });
  await start(h);
  const missionId = h.state.session.missionId, ids = targetsOf(h);
  h.state.attempts && await h.state.attempts.settled();
  // "Refresh": all in-browser state is lost; only the server remains.
  h.state.session = null; h.state.setRows = []; h.state.setStep = null; h.state.pathwayId = null; h.state.pathwayStage = null; h.state.current = null;
  await start(h);
  assert.equal(h.state.pathwayStage, 'match');
  assert.equal(h.state.session.missionId, missionId, 'the open mission is resumed');
  assert.deepEqual(targetsOf(h), ids);
});

test('server authority: the browser cannot choose or regress the stage; a forged start still opens the authoritative stage', () => {
  const h = fresh({ stage: 'apply' });
  const a = h.server.start({ unitNumber: 1, kind: 'pathway', pathwayId: PATHWAY, pathwayStage: 'mastery', phase: 'stage', forceNew: false, setProgression: true, setNumber: null });
  assert.equal(a.pathwayStage, 'apply', 'claimed Mastery ignored');
  const b = h.server.start({ unitNumber: 1, kind: 'pathway', pathwayId: PATHWAY, pathwayStage: 'recognise', phase: 'stage', forceNew: false, setProgression: true, setNumber: null });
  assert.equal(b.pathwayStage, 'apply', 'claimed Recognise ignored (no regression)');
  const c = h.server.start({ unitNumber: 1, kind: 'pathway', pathwayId: PATHWAY, pathwayStage: 'apply', phase: 'stage', forceNew: false, setProgression: true, setNumber: 3 });
  assert.equal(c.setNumber, 1, 'asking for a later Set while one is active is ignored');
  const done = fresh({ stage: 'mastery', setRows: [dbRow({ pathwayId: PATHWAY, setNumber: 1, stage: 'mastery', status: 'maintain' })] });
  const ask = n => () => done.server.start({ unitNumber: 1, kind: 'pathway', pathwayId: PATHWAY, pathwayStage: 'recognise', phase: 'stage', forceNew: false, setProgression: true, setNumber: n });
  assert.throws(ask(3), /No further Set/, 'cannot skip a Set');
  assert.equal(ask(2)().setNumber, 2); assert.equal(ask(2)().pathwayStage, 'recognise');
});

test('server authority: replay/duplicate settlement is idempotent and a forged attempt stage cannot advance the Set', async () => {
  const h = fresh({ stage: 'apply' });
  await start(h);
  const missionId = h.state.session.missionId;
  await play(h);
  assert.equal(row(h).stage, 'recall');
  const again = h.server.record(missionId, h.saved);
  assert.equal(again.duplicate, true);
  assert.equal(row(h).stage, 'recall', 'replay did not advance twice');

  const f = fresh({ stage: 'apply' });
  await start(f);
  const forged = f.state.session.missionId;
  const forgedAttempts = [];
  for (const id of targetsOf(f)) forgedAttempts.push({ missionId: forged, occurrenceId: id, firstAttempt: true, rawAnswer: 'x', pathwayStage: 'mastery', pathwayId: PATHWAY });
  f.server.record(forged, forgedAttempts);
  assert.equal(row(f).stage, 'apply', 'a forged mission stage cannot move the Set');
});

test('server authority: an abandoned mission cannot advance a Set; another student\'s Set is untouched', async () => {
  const h = fresh({ stage: 'apply' });
  await start(h);
  const first = h.state.session.missionId;
  h.server.start({ unitNumber: 1, kind: 'pathway', pathwayId: PATHWAY, pathwayStage: 'apply', phase: 'stage', forceNew: true, setProgression: true, setNumber: null });
  const attempts = targetsOf(h).map(id => ({ missionId: first, occurrenceId: id, firstAttempt: true, rawAnswer: 'x', pathwayStage: 'apply', pathwayId: PATHWAY }));
  assert.equal(h.server.record(first, attempts), null);
  assert.equal(row(h).stage, 'apply');
  const other = fresh({ stage: 'apply' });
  assert.equal(row(other).stage, 'apply', 'a separate student server is independent');
});

test('every visible-stage reader follows the server Set: pathway card, Stage X of 5 and Continue destination agree', async () => {
  const h = fresh({ stage: 'apply' });
  await start(h);
  await play(h);
  const model = lastSummary(h);
  const server = row(h);
  assert.equal(model.nextStageId, server.stage);
  const states = h.run('setPathwayStates()');
  assert.equal(states[PATHWAY].currentStage, server.stage);
});

test('hidden per-word evidence is still recorded for every answer of a Set mission', async () => {
  const h = fresh({ stage: 'apply' });
  await start(h); await play(h);
  assert.ok(h.saved.length >= 10);
  for (const payload of h.saved) {
    assert.equal(payload.pathwayId, PATHWAY); assert.equal(payload.pathwayStage, 'apply');
    assert.ok(payload.attemptId && payload.occurrenceId && payload.missionId);
  }
});
