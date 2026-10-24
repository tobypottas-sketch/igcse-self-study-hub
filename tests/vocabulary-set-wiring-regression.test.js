// Live-defect regression: a normal Set-based pathway mission must reach start_vocabulary_mission WITH Set identity, and Continue studying must
// start the SAME Set at the NEXT stage (Context Set 1 Recognise 10/10 -> Context Set 1 Match, Stage 2 of 5). Runs the real app.js controller
// against the faithful in-memory server; the RPC arguments are captured to prove p_set_progression is always requested for Set missions.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { harness } from './vocabulary-app-harness.mjs';
import { startVocabularyMission } from '../src/vocabulary/data.js';
import { activityFamilies } from '../src/vocabulary/activity-families.js';
const LIVE = ['meaning', 'context', 'word_families', 'precision_use', 'spelling_recall'];

const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
let students = 0;
const WF_SET_1 = ['preference', 'avoid', 'afford', 'deny', 'arrange', 'recommend', 'threaten', 'resent', 'regret', 'unfamiliar'];   // the real Unit 1 Word Families Set 1
function fresh(pathwayId, stage = 'recognise') {
  const h = harness({ pathwayId, stage, size: 10, setServer: true, userKey: `wiring-${students += 1}`, ...(pathwayId === 'word_families' ? { terms: WF_SET_1 } : {}) });
  h.asks = []; const start = h.server.start; h.issued = []; h.server.start = args => { h.asks.push(args); const issued = start(args); h.issued.push(issued); return issued; };
  return h;
}
async function play(h, miss = []) {
  const wrong = new Set(miss);
  for (let guard = 0; guard < 400 && h.state.current; guard += 1) {
    const q = h.state.current; const wasRetry = q.retry;
    h.run(`handleAnswer(null,${JSON.stringify(wrong.has(q.target.occurrenceId) ? '__wrong__' : q.question.markingReference.acceptedAnswers[0])})`);
    await h.state.attempts.settled();
    if (!wasRetry && h.state.current?.retry) continue;
    await h.run('advanceToNextQuestion()');
  }
  await h.state.settling; await new Promise(resolve => setImmediate(resolve));
}
const setRow = (h, pathwayId, n = 1) => h.server.rows().find(r => r.pathway_id === pathwayId && r.set_number === n);

test('Context Set 1 Recognise 10/10 pass -> settles with set_number 1 -> Continue studying starts Context Set 1 Match (Stage 2 of 5)', async () => {
  const h = fresh('context');
  await h.run(`startPathwaySession('context')`);
  assert.equal(h.state.pathwayStage, 'recognise'); assert.equal(h.state.setStep.setNumber, 1);
  assert.equal(h.asks[0].setProgression, true, 'the first mission asks the server for Set progression');
  const firstMembers = [...h.state.session.targetIds];
  await play(h);
  const finish = h.summaries.at(-1).finishModel;
  assert.equal(finish.nextStageId, 'match'); assert.match(finish.nextLine, /Match · Stage 2 of 5/);
  assert.equal(setRow(h, 'context').stage, 'match'); assert.equal(setRow(h, 'context').phase, 'stage');
  await h.run('continuePractice()');
  assert.equal(h.asks.at(-1).setProgression, true, 'Continue studying also asks for Set progression');
  assert.equal(h.state.pathwayStage, 'match'); assert.equal(h.state.setStep.setNumber, 1);
  assert.deepEqual([...h.state.session.targetIds].sort(), [...firstMembers].sort(), 'same Set, same ten words');
  // What the server issued for the two missions: Set 1 both times, Recognise then Match, never a null Set.
  const issued = h.issued.filter(row => row.resumed !== true);
  assert.deepEqual(issued.map(row => [row.setNumber, row.pathwayStage]), [[1, 'recognise'], [1, 'match']]);
  assert.ok(h.issued.every(row => row.setNumber === 1 && row.setPhase === 'stage'));
});

for (const pathwayId of LIVE) test(`${pathwayId}: 7/10 -> Consolidate -> failed Consolidate -> Recovery -> fresh full stage; every mission request carries Set identity`, async () => {
  const h = fresh(pathwayId);
  await h.run(`startPathwaySession('${pathwayId}')`);
  await play(h, [h.state.setStep.members[0], h.state.setStep.members[1], h.state.setStep.members[2]]);   // 7/10 -> Consolidate
  assert.equal(setRow(h, pathwayId).phase, 'consolidate');
  await h.run('continuePractice()'); assert.equal(h.state.setStep.missionKind, 'consolidate');
  await play(h, [...h.state.setStep.weakTargetIds]);                                                       // failed Consolidate -> Recovery
  assert.equal(setRow(h, pathwayId).phase, 'recovery');
  await h.run('continuePractice()'); assert.equal(h.state.setStep.missionKind, 'recovery');
  await play(h);
  await h.run('continuePractice()');                                                                      // post-Recovery fresh attempt
  assert.equal(h.state.setStep.missionKind, 'stage');
  await play(h);
  assert.ok(h.asks.length >= 4);
  for (const ask of h.asks) { assert.equal(ask.setProgression, true); assert.equal(ask.kind, 'pathway'); }
  assert.ok(h.asks.every(ask => ask.setNumber === null || Number.isInteger(ask.setNumber)));
});

for (const pathwayId of LIVE) test(`${pathwayId}: Mastery 10/10 -> Maintain, and the next Set (when one exists) opens at Recognise with non-null Set identity`, async () => {
  const h = fresh(pathwayId, 'mastery');
  await h.run(`startPathwaySession('${pathwayId}')`);
  assert.equal(h.state.pathwayStage, 'mastery'); assert.equal(h.state.setStep.setNumber, 1);
  await play(h);
  assert.equal(setRow(h, pathwayId).status, 'maintain');
  assert.ok(h.asks.every(ask => ask.setProgression === true));
  assert.ok(h.issued.every(row => row.setNumber === 1));
});

test('a refresh/resume of the open Set mission keeps the same Set identity', async () => {
  const h = fresh('context');
  await h.run(`startPathwaySession('context')`);
  const missionId = h.state.session.missionId ?? h.state.session.mission?.missionId;
  await h.run(`startPathwaySession('context')`);
  assert.equal(h.state.setStep.setNumber, 1); assert.equal(h.state.pathwayStage, 'recognise');
  assert.equal(h.asks.every(ask => ask.setProgression === true), true);
  if (missionId) assert.equal(h.state.session.missionId ?? h.state.session.mission?.missionId, missionId);
});

test('a normal Set-based pathway mission cannot start with null Set metadata (no Set step and no chosen activity is refused)', async () => {
  const src = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  assert.match(src, /kind === 'pathway' && !request\.setStep && !familyId\) throw/);
  const h = fresh('context');
  await h.run(`startPathwaySession('context')`);
  h.state.session = null;
  assert.throws(() => h.run(`beginSession(pathwayRequest({ pathwayId:'context', stageId:'recognise', pathwayChoice:null, selected:state.content.occurrences.slice(0,10), setStep:null, forceNew:false, continueHistory:false }))`), /has no Set/);
});

test('the real startVocabularyMission sends p_set_progression for a Set mission and omits it for mixed/free practice', async () => {
  const calls = [];
  const client = { rpc: async (name, args) => { calls.push({ name, args }); return { data: { mission_id: 'm', mission_seed: 's', set_number: 1, set_phase: 'fresh', pathway_stage: 'match' } }; } };
  const set = await startVocabularyMission(client, { unitNumber: 1, kind: 'pathway', pathwayId: 'context', pathwayStage: 'recognise', setProgression: true, setNumber: null });
  assert.equal(calls[0].name, 'start_vocabulary_mission'); assert.equal(calls[0].args.p_set_progression, true); assert.equal(set.setNumber, 1); assert.equal(set.pathwayStage, 'match');
  await startVocabularyMission(client, { unitNumber: 1, kind: 'mixed' });
  assert.equal('p_set_progression' in calls[1].args, false, 'mixed practice is intentionally non-Set');
});

test('free practice (a student-chosen activity) is the ONLY pathway route without Set identity; it is explicit and never reached by Continue from a Set mission', async () => {
  const h = fresh('context');
  await h.run(`startPathwaySession('context')`);
  assert.equal(h.state.pathwayChoice, null, 'the recommended route carries no chosen activity, so Continue stays on the Set route');
  await play(h);
  await h.run('continuePractice()');
  assert.equal(h.asks.at(-1).setProgression, true);
});

for (const pathwayId of LIVE) {
  for (const route of ['recommended', 'chosen activity']) {
    test(`${pathwayId} via ${route}: Set 1 Recognise 10/10 -> non-null Set identity -> Continue studying -> SAME Set 1 Match (Stage 2 of 5)`, async () => {
      const h = fresh(pathwayId);
      const family = activityFamilies(pathwayId).find(f => f.stageIds.includes('recognise'));
      const choice = route === 'chosen activity' ? `{ familyId:'${family.id}' }` : 'null';
      await h.run(`startPathwaySession('${pathwayId}', false, ${choice})`);
      assert.equal(h.state.pathwayStage, 'recognise'); assert.equal(h.state.setStep.setNumber, 1);
      const members = [...h.state.session.targetIds];
      await play(h);
      assert.match(h.summaries.at(-1).finishModel.nextLine, /Match · Stage 2 of 5/);
      assert.equal(setRow(h, pathwayId).stage, 'match');
      await h.run('continuePractice()');
      assert.equal(h.state.pathwayStage, 'match'); assert.equal(h.state.setStep.setNumber, 1);
      assert.deepEqual([...h.state.session.targetIds].sort(), [...members].sort());
      const fresh1 = h.issued.filter(row => row.resumed !== true);
      assert.deepEqual(fresh1.map(row => [row.setNumber, row.setPhase, row.pathwayStage]), [[1, 'stage', 'recognise'], [1, 'stage', 'match']]);
      assert.ok(h.asks.every(ask => ask.setProgression === true), 'every pathway mission asks for Set progression');
    });
  }
}

test('a chosen activity records as the Set stage, only serves that activity, and is refused when the stage does not offer it (never swapped)', async () => {
  const h = fresh('context', 'match');
  await h.run(`startPathwaySession('context', false, { familyId:'context:match' })`);
  assert.equal(h.state.setStep.setNumber, 1);
  const types = new Set(); for (let n = 0; n < 3; n += 1) { types.add(h.state.current.question.type); h.run(`handleAnswer(null,${JSON.stringify(h.state.current.question.markingReference.acceptedAnswers[0])})`); await h.state.attempts.settled(); await h.run('advanceToNextQuestion()'); }
  assert.deepEqual([...types], ['context_sentence_match']);
  const other = fresh('context', 'match');
  await assert.rejects(() => other.run(`startPathwaySession('context', false, { familyId:'context:recognise' })`), /not part of this stage/);
  assert.equal(other.asks.length, 0, 'a refused activity creates no mission');
});

test('fail closed: a server answer without Set identity for a Set-based mission does not start a legacy mission', async () => {
  const h = fresh('context');
  h.server.start = args => ({ missionId: 'x', missionSeed: 'seed-0123456789-abcdef', resumed: false, startedAt: null, pathwayStage: 'recognise', setNumber: null, setPhase: null, weakTargetIds: [] });
  await assert.rejects(() => h.run(`startPathwaySession('context')`), /could not start this mission/);
  assert.ok(!h.state.session, 'no session started');
});
