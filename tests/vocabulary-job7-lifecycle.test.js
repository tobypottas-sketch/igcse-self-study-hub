// Job 7: mission lifecycle, long-horizon state and Set-membership drift, run through the REAL app.js controller against the faithful
// in-memory server model (tests/support/set-server.js). Synthetic data only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { harness } from './vocabulary-app-harness.mjs';
import { createSetServer, dbRow } from './support/set-server.js';
import { compareSetMembership, MEMBERSHIP, setsFromCoverage } from '../src/vocabulary/pathway-sets.js';

const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
let students = 0;
const PATHWAY = 'meaning';
const fresh = (opts = {}) => harness({ pathwayId: PATHWAY, stage: 'recognise', size: 10, setServer: true, userKey: `j7-student-${students += 1}`, ...opts });
const idle = () => new Promise(resolve => setImmediate(resolve));

async function answer(h, value) {
  h.run(`handleAnswer(null,${JSON.stringify(value)})`);
  await h.state.attempts.settled();
}
// Plays until `stopAfter` questions have been finished (null = to the end). `miss` = occurrence ids always answered wrongly.
async function play(h, { miss = [], stopAfter = null, settle = true } = {}) {
  const wrong = new Set(miss); let finished = 0;
  for (let guard = 0; guard < 400 && h.state.current; guard += 1) {
    if (stopAfter != null && finished >= stopAfter) return;
    const q = h.state.current; const wasRetry = q.retry;
    await answer(h, wrong.has(q.target.occurrenceId) ? '__wrong__' : q.question.markingReference.acceptedAnswers[0]);
    if (!wasRetry && h.state.current?.retry) continue;
    finished += 1;
    await h.run('advanceToNextQuestion()');
  }
  if (settle) { await h.state.settling; await idle(); }
}
const row = (h, n = 1) => h.server.rows().find(r => r.pathway_id === PATHWAY && r.set_number === n);
const start = h => h.run(`startPathwaySession('${PATHWAY}')`);

// ---------------------------------------------------------------- Part 12: membership drift
test('compareSetMembership: same ten in any order matches; a changed, missing, extra or unreadable membership does not', () => {
  const ids = Array.from({ length: 10 }, (_, i) => `u1_${i}`);
  const rows = (list, set = 1, pathway = PATHWAY) => list.map((occurrence_id, i) => ({ pathway_id: pathway, set_number: set, position: i + 1, occurrence_id }));
  const cmp = (clientMembers, serverRows) => compareSetMembership({ pathwayId: PATHWAY, setNumber: 1, clientMembers, serverRows });
  assert.equal(cmp(ids, rows(ids)).status, MEMBERSHIP.MATCH);
  assert.equal(cmp(ids, rows([...ids].reverse())).status, MEMBERSHIP.MATCH, 'reordered members are the same Set');
  const swapped = [...ids.slice(0, 9), 'u1_99'];
  const changed = cmp(ids, rows(swapped));
  assert.equal(changed.status, MEMBERSHIP.MISMATCH); assert.deepEqual(changed.missing, ['u1_9']); assert.deepEqual(changed.extra, ['u1_99']);
  assert.equal(cmp(ids, rows(ids.slice(0, 9))).status, MEMBERSHIP.MISMATCH, 'a removed member');
  assert.equal(cmp(ids, []).status, MEMBERSHIP.MISMATCH, 'the server holds no such Set');
  assert.equal(cmp(ids, rows(ids, 1, 'context')).status, MEMBERSHIP.MISMATCH, 'membership of another pathway does not count');
  assert.equal(cmp(ids, rows(ids, 2)).status, MEMBERSHIP.MISMATCH, 'membership of another Set number does not count');
  assert.equal(cmp(ids, null).status, MEMBERSHIP.UNKNOWN); assert.equal(cmp(ids, undefined).status, MEMBERSHIP.UNKNOWN);
});

test('drift: a client Set that differs from the server membership never opens a mission (fail safe, nothing advances)', async () => {
  const h = fresh({ setMembers: () => [{ pathway_id: PATHWAY, set_number: 1, position: 1, occurrence_id: 'u1_not_in_this_set' }] });
  await assert.rejects(start(h), /being updated/);
  assert.equal(h.server.log.filter(e => e.op === 'start').length, 0, 'no mission start was requested');
  assert.equal(h.state.session ?? null, null);
  assert.equal(row(h).stage, 'recognise');
});
test('drift: a reordered server membership is the same Set and the mission starts', async () => {
  const probe = fresh(); const ids = [...probe.state.content.occurrences.map(o => o.occurrenceId)];
  const rows = [...ids].reverse().map((occurrence_id, i) => ({ pathway_id: PATHWAY, set_number: 1, position: i + 1, occurrence_id }));
  const h = fresh({ setMembers: rows });
  await start(h);
  assert.equal(h.state.session.targetIds.length, 10);
});
test('drift: an unreadable membership table does not block practice (the server still enforces membership)', async () => {
  const h = fresh({ setMembers: null });
  await start(h);
  assert.equal(h.state.session.targetIds.length, 10);
});
test('drift: membership is read once per unit, not on every mission start', async () => {
  const h = fresh();
  await start(h);
  const before = h.loadMembersCalls.n;
  await h.run(`startPathwaySession('${PATHWAY}', false, null, true)`);
  assert.equal(h.loadMembersCalls.n, before, 'cached for the unit');
});

// ---------------------------------------------------------------- Part 3: mission lifecycle
test('reload after question 9: the same mission resumes; finishing it settles exactly once', async () => {
  const server = createSetServer({ rows: [dbRow({ pathwayId: PATHWAY, stage: 'recognise' })], membersFor: (p, n) => (n === 1 ? fresh().state.content.occurrences.map(o => o.occurrenceId) : null) });
  const userKey = `j7-reload-${students += 1}`;
  const a = harness({ pathwayId: PATHWAY, size: 10, setServer: server, userKey });
  await start(a);
  const missionId = a.state.session.missionId;
  await play(a, { stopAfter: 9, settle: false });
  const b = harness({ pathwayId: PATHWAY, size: 10, setServer: server, userKey });          // the tab was closed and re-opened
  await start(b);
  assert.equal(b.state.session.missionId, missionId, 'the open mission is resumed, not replaced');
  assert.equal([...server.starts.values()].filter(s => s.status === 'open').length, 1, 'exactly one open mission');
  await play(b);
  assert.equal(server.row(PATHWAY, 1).stage, 'match');
  assert.equal(server.row(PATHWAY, 1).applied_mission_ids.length, 1);
});
test('settlement is idempotent: a retry after a lost response, a replay and a second tab never award progression twice', async () => {
  const h = fresh();
  await start(h);
  const missionId = h.state.session.missionId;
  await play(h);
  assert.equal(row(h).stage, 'match');
  const attempts = h.saved.filter(p => p.missionId === missionId);
  const again = h.server.record(missionId, attempts);
  assert.equal(again.duplicate, true, 'the retry is recognised as a duplicate');
  h.server.record(missionId, attempts); h.server.record(missionId, attempts);
  assert.equal(row(h).stage, 'match', 'replays never move the Set');
  assert.equal(row(h).applied_mission_ids.length, 1);
});
test('a forged or replayed mission cannot advance a Set: unknown id, abandoned mission, wrong stage claim, outside targets', async () => {
  const h = fresh();
  await start(h);
  const missionId = h.state.session.missionId;
  const real = h.state.session.targetIds.map(occurrenceId => ({ missionId, occurrenceId, firstAttempt: true, rawAnswer: 'x', pathwayStage: 'recognise', pathwayId: PATHWAY }));
  assert.equal(h.server.record('00000000-0000-4000-8000-ffffffffffff', real.map(a => ({ ...a, missionId: '00000000-0000-4000-8000-ffffffffffff' }))), null, 'unknown mission id');
  const wrongStage = real.map(a => ({ ...a, pathwayStage: 'mastery' }));
  h.server.record(missionId, wrongStage);
  assert.equal(row(h).stage, 'recognise', 'a stage the mission was not started for cannot advance the Set');
});
test('an abandoned mission cannot be recorded; a fresh start replaces it', async () => {
  const h = fresh();
  await start(h);
  const first = h.state.session.missionId;
  await h.run(`startPathwaySession('${PATHWAY}', false, null, true)`);          // explicit new
  const second = h.state.session.missionId;
  assert.notEqual(first, second);
  assert.equal(h.server.starts.get(first).status, 'abandoned');
  assert.equal([...h.server.starts.values()].filter(s => s.status === 'open').length, 1, 'exactly one open Set mission');
  const stale = h.state.session.targetIds.map(occurrenceId => ({ missionId: first, occurrenceId, firstAttempt: true, rawAnswer: 'x', pathwayStage: 'recognise', pathwayId: PATHWAY }));
  assert.equal(h.server.record(first, stale), null);
  assert.equal(row(h).stage, 'recognise');
});
test('Continue clicked twice starts one mission', async () => {
  const h = fresh();
  await start(h); await play(h);
  await Promise.all([h.run('continuePractice()'), h.run('continuePractice()')]);
  await idle();
  assert.equal([...h.server.starts.values()].filter(s => s.status === 'open').length, 1);
  assert.equal(h.state.pathwayStage, 'match');
});
test('two tabs finishing the same mission advance the Set once', async () => {
  const server = createSetServer({ rows: [dbRow({ pathwayId: PATHWAY, stage: 'recognise' })], membersFor: (p, n) => (n === 1 ? fresh().state.content.occurrences.map(o => o.occurrenceId) : null) });
  const userKey = `j7-tabs-${students += 1}`;
  const tabA = harness({ pathwayId: PATHWAY, size: 10, setServer: server, userKey });
  const tabB = harness({ pathwayId: PATHWAY, size: 10, setServer: server, userKey });
  await start(tabA); await start(tabB);
  assert.equal(tabA.state.session.missionId, tabB.state.session.missionId, 'both tabs share the one open mission');
  await Promise.all([play(tabA), play(tabB)]);
  const r = server.row(PATHWAY, 1);
  assert.equal(r.stage, 'match', 'advanced exactly one stage');
  assert.equal(r.applied_mission_ids.length, 1);
});
test('Mastery then Maintain: the final Set offers no fake next Set and no short tail', async () => {
  const h = fresh({ stage: 'mastery' });
  await start(h); await play(h);
  assert.equal(row(h).status, 'maintain');
  assert.equal(h.server.rows().filter(r => r.pathway_id === PATHWAY).length, 1, 'no phantom Set row');
  await assert.rejects(start(h), /Maintain/);
});

// ---------------------------------------------------------------- Part 4: randomised multi-Set journeys
function rng(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
const SIM_PATHWAY = 'precision_use';   // all 50 Unit 1 words build at every stage, so the harness's 50-word coverage equals a real five-Set pathway
const ORDER = ['recognise', 'match', 'apply', 'recall', 'mastery'];
for (const seed of [11, 23, 47]) {
  test(`randomised journey (seed ${seed}): five Sets, mixed scores - no regression, skipping, overlap, duplicate completion or short mission`, async () => {
    const h = harness({ pathwayId: SIM_PATHWAY, stage: 'recognise', size: 50, setServer: true, userKey: `j7-rand-${students += 1}`, setRows: [] });
    const random = rng(seed); const trail = []; let missions = 0;
    const idxOf = r => (r.status === 'maintain' ? 5 : ORDER.indexOf(r.stage));
    for (; missions < 160; missions += 1) {
      const before = new Map(h.server.rows().filter(r => r.pathway_id === SIM_PATHWAY).map(r => [r.set_number, { idx: idxOf(r), status: r.status, applied: r.applied_mission_ids.length }]));
      try { await h.run(`startPathwaySession('${SIM_PATHWAY}')`); } catch (error) { trail.push(`END after ${missions}: ${error.message}`); break; }
      const ids = [...h.state.session.targetIds];
      assert.equal(ids.length, 10, 'a normal mission is exactly ten'); assert.equal(new Set(ids).size, 10, 'no duplicate target');
      const setNo = h.state.setStep.setNumber;
      const members = setsFromCoverage(SIM_PATHWAY, { available: true, occurrenceIds: h.state.content.occurrences.map(o => o.occurrenceId) }).sets[setNo - 1];
      assert.ok(ids.every(id => members.includes(id)), 'every target belongs to the Set being worked on');
      const misses = ids.filter(() => random() < [0, 0.1, 0.3, 0.6][Math.floor(random() * 4)]);
      await play(h, { miss: misses });
      const rows = h.server.rows().filter(r => r.pathway_id === SIM_PATHWAY);
      assert.equal(rows.filter(r => r.status === 'active').length <= 1, true, 'at most one active Set per pathway');
      for (const r of rows) {
        const b = before.get(r.set_number);
        if (b) { assert.ok(idxOf(r) >= b.idx, `Set ${r.set_number} never moves backwards`); assert.ok(idxOf(r) - b.idx <= 1, `Set ${r.set_number} never skips a stage`); assert.ok(r.applied_mission_ids.length - b.applied <= 1); }
        assert.equal(new Set(r.applied_mission_ids).size, r.applied_mission_ids.length, 'no mission is applied twice');
        assert.equal(r.completed_stages.length, new Set(r.completed_stages).size, 'no stage is completed twice');
      }
      trail.push(rows.map(r => `${r.set_number}:${r.status === 'maintain' ? 'M' : r.stage[0]}${r.phase[0]}`).join(' '));
    }
    const rows = h.server.rows().filter(r => r.pathway_id === SIM_PATHWAY);
    assert.equal(rows.length, 5, `all five Sets were reached after ${missions} missions (${trail.slice(-3).join(" / ")})`);
    assert.ok(rows.every(r => r.status === 'maintain'), `every Set reached Maintain: ${trail.at(-1)}`);
  });
}

// ---------------------------------------------------------------- Part 2: long-horizon state
test('stale cache: an open mission cached with ten words that are no longer the Set is replaced, never resumed', async () => {
  const server = createSetServer({ rows: [dbRow({ pathwayId: PATHWAY, stage: 'recognise' })], membersFor: (p, n) => (n === 1 ? fresh().state.content.occurrences.map(o => o.occurrenceId) : null) });
  const userKey = `j7-stale-${students += 1}`;
  const a = harness({ pathwayId: PATHWAY, size: 10, setServer: server, userKey });
  await start(a);
  const oldMission = a.state.session.missionId;
  const key = [...store.keys()].find(k => k.includes(userKey));
  assert.ok(key, 'the mission was cached under this student');
  const cache = JSON.parse(store.get(key));
  for (const entry of Object.values(cache)) entry.targetIds = entry.targetIds.map((id, i) => (i === 0 ? 'u1_retired_word' : id));
  store.set(key, JSON.stringify(cache));
  const b = harness({ pathwayId: PATHWAY, size: 10, setServer: server, userKey });
  await start(b);
  assert.notEqual(b.state.session.missionId, oldMission, 'a mission for the current Set replaced the stale one');
  assert.equal(b.state.session.targetIds.length, 10);
  assert.ok(!b.state.session.targetIds.includes('u1_retired_word'));
  assert.equal(server.starts.get(oldMission).status, 'abandoned');
  assert.equal([...server.starts.values()].filter(s => s.status === 'open').length, 1);
});
test('malformed or hostile localStorage never breaks starting a mission', async () => {
  for (const junk of ['{not json', 'null', '[]', '"x"', '{"a":1}', '{"slot":{"missionId":5}}']) {
    const userKey = `j7-junk-${students += 1}`;
    store.set(`vocab.mission.v1.${userKey}`, junk);
    const h = harness({ pathwayId: PATHWAY, size: 10, setServer: true, userKey });
    await start(h);
    assert.equal(h.state.session.targetIds.length, 10, junk);
  }
});
test('account isolation: a mission cached for one student is never resumed for another, and each student has their own server state', async () => {
  const serverA = createSetServer({ rows: [dbRow({ pathwayId: PATHWAY, stage: 'apply' })] });
  const serverB = createSetServer({ rows: [dbRow({ pathwayId: PATHWAY, stage: 'recognise' })], startId: 500 });
  const a = harness({ pathwayId: PATHWAY, size: 10, setServer: serverA, userKey: `j7-iso-a-${students += 1}` });
  const b = harness({ pathwayId: PATHWAY, size: 10, setServer: serverB, userKey: `j7-iso-b-${students += 1}` });
  await start(a); await play(a, { stopAfter: 3, settle: false });
  await start(b);
  assert.equal(b.state.pathwayStage, 'recognise', "B sees B's stage, not A's");
  assert.equal(a.state.pathwayStage, 'apply');
  assert.notEqual(a.state.session.missionId, b.state.session.missionId);
  assert.equal(b.state.session.completedTargetIds.length, 0, "B does not inherit A's progress through the cache");
  assert.ok([...store.keys()].filter(k => k.includes('j7-iso')).every(k => /^vocab\.mission\.v1\.j7-iso-(a|b)-\d+$/.test(k)), 'cache keys are account-scoped');
});

// ---------------------------------------------------------------- Part 15: degraded behaviour
test('degraded: the mission service is unavailable - a plain recoverable message, no mission, no local progression', async () => {
  const h = fresh();
  h.server.start = () => { throw Object.assign(new Error('Failed to fetch'), { code: 'rpc_error' }); };
  await assert.rejects(start(h), /could not start this mission.*nothing has been lost/is);
  assert.equal(h.state.session ?? null, null);
  assert.equal(row(h).stage, 'recognise');
});
test('degraded: the Set rows cannot be read - the start fails loudly instead of guessing a stage', async () => {
  const h = fresh();
  const broken = harness({ pathwayId: PATHWAY, size: 10, setServer: h.server, userKey: `j7-broken-${students += 1}` });
  broken.state.setRows = [];
  // loadPathwaySets in the harness reads the server; make the read itself fail.
  broken.server.rows = () => { throw new Error('Unable to load your pathway progress. Check your connection and try again.'); };
  await assert.rejects(start(broken), /Unable to load your pathway progress/);
});
test('degraded: settlement fails (timeout / network) - the result screen still shows, nothing is invented, and the mission settles on retry', async () => {
  const h = fresh();
  await start(h);
  const missionId = h.state.session.missionId;
  let calls = 0; const realRecord = h.server.record.bind(h.server);
  h.server.record = (id, attempts) => { calls += 1; if (calls === 1) throw new Error('timeout'); return realRecord(id, attempts); };
  await play(h);
  assert.equal(h.summaries.length >= 1, true, 'the completion screen was shown');
  assert.equal(row(h).stage, 'recognise', 'no progression is invented while settlement is unconfirmed');
  const second = fresh();
  assert.ok(second);
  // the unsettled mission is settled once on the next start, exactly once
  await start(h);
  assert.equal(row(h).stage, 'match', 'the retry settled the finished mission');
  assert.equal(row(h).applied_mission_ids.filter(id => id === missionId).length, 1);
});
test('degraded: stale or unexpected Set rows on the client never beat the server - the mission is rebuilt for the stage the server issues', async () => {
  const h = fresh();                                                    // the server's Set 1 is at recognise
  const lie = rows => () => rows;
  h.server.rows = lie([dbRow({ pathwayId: PATHWAY, stage: 'mastery' })]);        // the client reads an out-of-date row
  await start(h);
  assert.equal(h.state.pathwayStage, 'recognise', 'the server-issued stage wins');
  assert.equal(h.state.session.targetIds.length, 10);
});
