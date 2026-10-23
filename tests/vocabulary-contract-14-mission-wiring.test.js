// Job 4: the REAL app.js controller started against a fake start_vocabulary_mission server. Covers the live mission lifecycle:
// new / resume / refresh-resume / explicit new / completed -> fresh, the server-wins rule, offline behaviour, content + presentation
// derivation from the mission seed, and the recovery path when the server says a mission is closed. Synthetic data only.
import test from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { harness, correctAnswer, settle } from './vocabulary-app-harness.mjs';
import { slotKey } from '../src/vocabulary/mission-cache.js';
import { derivePresentationNonce, orderMissionTargets } from '../src/vocabulary/mission-seed.js';
import { isSolvedOrder } from '../src/vocabulary/tile-order.js';

// A browser-like localStorage shared by every "page load" in a test (this is what survives a refresh).
function installStorage() {
  const data = new Map();
  globalThis.localStorage = { getItem: key => (data.has(key) ? data.get(key) : null), setItem: (key, value) => { data.set(key, String(value)); }, removeItem: key => { data.delete(key); }, clear: () => data.clear() };
  return data;
}
// The server side of start_vocabulary_mission: one open mission per slot, new ones get a fresh id + seed.
function fakeServer() {
  const open = new Map(); const log = []; let minted = 0; let down = false;
  const api = async args => {
    log.push({ ...args });
    if (down) throw Object.assign(new Error('Failed to fetch'), { code: 'rpc_error' });
    const key = slotKey({ unitNumber: args.unitNumber, kind: args.kind, pathwayId: args.pathwayId, stageId: args.stageId });
    const existing = open.get(key);
    if (existing && !args.forceNew) return { ...existing, resumed: true };
    if (existing) existing.status = 'abandoned';
    minted += 1;
    const row = { missionId: `00000000-0000-4000-8000-${String(minted).padStart(12, '0')}`, missionSeed: `seed${String(minted).padStart(3, '0')}-${'x'.repeat(24)}`, resumed: false, status: 'open', startedAt: new Date().toISOString() };
    open.set(key, row); return { ...row };
  };
  api.log = log; api.open = open; api.minted = () => minted; api.setDown = value => { down = value; };
  api.complete = () => { for (const row of open.values()) row.status = 'completed'; open.clear(); };
  return api;
}
const options = (server, extra = {}) => ({ pathwayId: 'meaning', stage: 'recognise', size: 10, missionServer: server, ...extra });
const view = q => ({ target: q.target, type: q.type, contentId: q.contentId, prompt: q.prompt, options: q.options });
async function answerAll(h, count) {
  for (let i = 0; i < count; i += 1) {
    h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
    await settle(h);
    if (i < count - 1) await h.run('advanceToNextQuestion()');
  }
}

test('NEW mission: the app asks the server; the session carries the server\'s id and seed; every attempt names that id', async () => {
  installStorage(); const server = fakeServer(); const h = harness(options(server));
  await h.run("startPathwaySession('meaning')");
  assert.equal(server.log.length, 1);
  assert.equal(h.state.session.missionId, '00000000-0000-4000-8000-000000000001');
  assert.equal(h.state.session.missionSeed, `seed001-${'x'.repeat(24)}`);
  await answerAll(h, 2);
  assert.ok(h.requests.length >= 2 && h.requests.every(r => r.missionId === h.state.session.missionId), 'attempts must reference the server-issued id');
});
test('the client never invents a mission id: no id appears unless the server issued it', async () => {
  installStorage(); const server = fakeServer(); server.setDown(true); const h = harness(options(server));
  await assert.rejects(() => h.run("startPathwaySession('meaning')"), /could not start this mission/i);
  assert.equal(h.state.session, undefined, 'no session may start without a server mission');
  assert.equal(h.requests.length, 0);
});
test('RPC failure never silently creates a mission; a retry after recovery gets exactly one', async () => {
  installStorage(); const server = fakeServer(); const h = harness(options(server));
  server.setDown(true); await assert.rejects(() => h.run("startPathwaySession('meaning')"));
  server.setDown(false); await h.run("startPathwaySession('meaning')");
  assert.equal(server.minted(), 1);
});
test('RESUME (same page): starting the same slot again returns the same id and seed', async () => {
  installStorage(); const server = fakeServer(); const h = harness(options(server));
  await h.run("startPathwaySession('meaning')"); const first = { ...h.state.session };
  await h.run("startPathwaySession('meaning')");
  assert.equal(h.state.session.missionId, first.missionId); assert.equal(h.state.session.missionSeed, first.missionSeed);
  assert.equal(server.minted(), 1);
});
test('REFRESH-RESUME: a new page load resumes the same mission and serves exactly the question that was next', async () => {
  installStorage(); const server = fakeServer();
  const a = harness(options(server)); await a.run("startPathwaySession('meaning')");
  await answerAll(a, 3);
  const planned = a.state.session.targetIds.slice();
  await a.run('advanceToNextQuestion()');
  const expectedNext = view(a.served.at(-1)); const expectedTarget = a.state.current.target.occurrenceId;
  const missionId = a.state.session.missionId; const seed = a.state.session.missionSeed;
  // "refresh": brand new vm + state, same localStorage, same server
  const b = harness(options(server)); await b.run("startPathwaySession('meaning')");
  assert.equal(b.state.session.missionId, missionId); assert.equal(b.state.session.missionSeed, seed);
  assert.deepEqual(b.state.session.targetIds, planned, 'same planned order');
  assert.equal(b.state.session.completedTargetIds.length, 3, 'the three answered targets are not asked again');
  assert.equal(b.state.current.target.occurrenceId, expectedTarget);
  assert.deepEqual(view(b.served.at(-1)), { ...expectedNext, target: b.served.at(-1).target }, 'identical question, options in identical order');
  assert.equal(server.minted(), 1);
});
test('REFRESH-RESUME reproduces the whole remaining sequence question-for-question', async () => {
  installStorage(); const server = fakeServer();
  const a = harness(options(server)); await a.run("startPathwaySession('meaning')"); await answerAll(a, 2);
  await a.run('advanceToNextQuestion()');
  const b = harness(options(server)); await b.run("startPathwaySession('meaning')");
  const shape = h => { const q = h.state.current.question; return JSON.stringify({ target: h.state.current.target.occurrenceId, type: q.type, contentId: q.contentId, prompt: q.prompt, options: q.options, tiles: q.tiles ?? null }); };
  const seqA = []; const seqB = [];
  for (let i = 0; i < 7; i += 1) {
    seqA.push(shape(a)); seqB.push(shape(b));
    a.run(`handleAnswer(null,${JSON.stringify(correctAnswer(a))})`); await settle(a);
    b.run(`handleAnswer(null,${JSON.stringify(correctAnswer(b))})`); await settle(b);
    if (i < 6) { await a.run('advanceToNextQuestion()'); await b.run('advanceToNextQuestion()'); }
  }
  assert.deepEqual(seqB, seqA);
  assert.equal(new Set(seqA).size, 7, 'seven distinct questions');
});
test('EXPLICIT NEW abandons the open mission and issues a fresh id + seed', async () => {
  installStorage(); const server = fakeServer(); const h = harness(options(server));
  await h.run("startPathwaySession('meaning')"); const first = { ...h.state.session };
  await h.run("startPathwaySession('meaning', false, null, true)");
  assert.notEqual(h.state.session.missionId, first.missionId); assert.notEqual(h.state.session.missionSeed, first.missionSeed);
  assert.equal(server.minted(), 2);
  assert.equal(h.state.session.completedTargetIds.length, 0);
});
test('COMPLETED mission: the next start gets a fresh id + seed, a different target order, and a different question set', async () => {
  installStorage(); const server = fakeServer(); const a = harness(options(server));
  await a.run("startPathwaySession('meaning')");
  const orderA = a.state.session.targetIds.slice(); const firstA = view(a.served.at(-1));
  server.complete();                                       // settlement closes the start row on the server
  const b = harness(options(server)); await b.run("startPathwaySession('meaning')");
  assert.notEqual(b.state.session.missionId, a.state.session.missionId); assert.notEqual(b.state.session.missionSeed, a.state.session.missionSeed);
  assert.notDeepEqual(b.state.session.targetIds, orderA, 'target order must not be a carbon copy');
  assert.notDeepEqual({ ...view(b.served.at(-1)), target: null }, { ...firstA, target: null });
});
test('SERVER WINS: a cached mission the server no longer holds open is discarded', async () => {
  const storage = installStorage(); const server = fakeServer();
  const a = harness(options(server)); await a.run("startPathwaySession('meaning')"); await answerAll(a, 2);
  server.complete();                                       // e.g. settled/abandoned from another device
  const b = harness(options(server)); await b.run("startPathwaySession('meaning')");
  assert.notEqual(b.state.session.missionId, a.state.session.missionId);
  assert.equal(b.state.session.completedTargetIds.length, 0, 'the old mission\'s progress must not leak into the new one');
  const cached = JSON.parse([...storage.values()].find(v => v.includes('missionId')));
  assert.ok(Object.values(cached).every(entry => entry.missionId === b.state.session.missionId));
});
test('OFFLINE with a cached open mission: the same mission resumes (no second mission)', async () => {
  installStorage(); const server = fakeServer();
  const a = harness(options(server)); await a.run("startPathwaySession('meaning')"); await answerAll(a, 2);
  server.setDown(true);
  const b = harness(options(server)); await b.run("startPathwaySession('meaning')");
  assert.equal(b.state.session.missionId, a.state.session.missionId); assert.equal(b.state.session.completedTargetIds.length, 2);
  assert.equal(server.minted(), 1);
});
test('OFFLINE with no cache: nothing starts and no mission exists', async () => {
  installStorage(); const server = fakeServer(); server.setDown(true);
  const h = harness(options(server)); await assert.rejects(() => h.run("startPathwaySession('meaning')"));
  assert.equal(server.minted(), 0);
});
test('a different chosen activity family starts a new mission (cache is not reused across families)', async () => {
  installStorage(); const server = fakeServer(); const h = harness(options(server));
  await h.run("startPathwaySession('meaning')");
  const id = h.state.session.missionId;
  await h.run("startPathwaySession('meaning', false, null, true)");
  assert.notEqual(h.state.session.missionId, id);
});

// ---- content comes from the mission seed; presentation comes from the separate nonce ----
test('target order is derived from the mission seed (and the same seed always gives the same order)', async () => {
  installStorage(); const server = fakeServer(); const h = harness(options(server));
  await h.run("startPathwaySession('meaning')");
  const ids = h.state.session.targetIds;
  assert.deepEqual(ids, orderMissionTargets([...ids], h.state.session.missionSeed));
});
test('question seed is mission-scoped: two missions differ, the SAME mission re-served is identical', async () => {
  installStorage(); const s1 = fakeServer(); const a = harness(options(s1)); await a.run("startPathwaySession('meaning')");
  const first = view(a.served.at(-1));
  installStorage(); const s2 = fakeServer(); const b = harness(options(s2)); await b.run("startPathwaySession('meaning')");
  assert.deepEqual(view(b.served.at(-1)), first, 'same server mission => same first question');
});
test('presentation nonce is derived per mission, occurrence and slot and is not the content seed', () => {
  const a = derivePresentationNonce({ missionSeed: 's1-xxxxxxxxxxxxxxxxxxxx', occurrenceId: 'o1', slot: 0 });
  assert.equal(a, derivePresentationNonce({ missionSeed: 's1-xxxxxxxxxxxxxxxxxxxx', occurrenceId: 'o1', slot: 0 }));
  assert.notEqual(a, derivePresentationNonce({ missionSeed: 's2-xxxxxxxxxxxxxxxxxxxx', occurrenceId: 'o1', slot: 0 }));
  assert.notEqual(a, derivePresentationNonce({ missionSeed: 's1-xxxxxxxxxxxxxxxxxxxx', occurrenceId: 'o1', slot: 10 }));
  assert.match(a, /^pn_[0-9a-f]{16}$/);
});

// ---- spelling tiles ----
test('spelling_rebuild: tiles are never the solved word, differ across missions, and a resume reproduces them', async () => {
  const run = async (server, extra) => { const h = harness({ pathwayId: 'spelling_recall', stage: 'apply', size: 10, missionServer: server, ...extra }); await h.run("startPathwaySession('spelling_recall')"); return h; };
  installStorage(); const server = fakeServer(); const a = await run(server);
  const tiles = h => { const q = h.state.current.question; return q.tiles ? { occ: h.state.current.target.occurrenceId, tiles: q.tiles.join('|'), solved: isSolvedOrder(q.tiles, q.markingReference.acceptedAnswers[0]) } : null; };
  const ta = tiles(a); assert.ok(ta, 'the first question is a tile question'); assert.equal(ta.solved, false);
  const b = await run(server);                              // same mission => same tiles (refresh)
  assert.deepEqual(tiles(b), ta);
  server.complete(); const c = await run(server);           // new mission
  const tc = tiles(c); assert.ok(tc); assert.equal(tc.solved, false);
  assert.notEqual(`${tc.occ}${tc.tiles}`, `${ta.occ}${ta.tiles}`, 'a fresh mission must not repeat the previous tile sequence');
});

// ---- closed / forged missions never block the student's evidence ----
for (const code of ['mission_not_open', 'mission_not_issued']) {
  test(`server says ${code}: the SAME attempt is re-sent as ordinary practice (no mission fields), the queue is not blocked`, async () => {
    installStorage(); const server = fakeServer();
    const h = harness(options(server, { rejectMissionAttempts: code }));
    await h.run("startPathwaySession('meaning')");
    h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`); await settle(h);
    assert.equal(h.state.attempts.blocked, false);
    const sent = h.requests.filter(r => r.attemptId === h.requests[0].attemptId);
    assert.equal(sent.length, 2, 'rejected once, then re-sent'); assert.ok(sent[0].missionId && !sent[1].missionId);
    assert.equal(h.saved.length, 1); assert.equal(h.saved[0].missionId, undefined);
    // later attempts of this mission stop naming it
    await h.run('advanceToNextQuestion()'); h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`); await settle(h);
    assert.ok(h.requests.at(-1).missionId == null);
  });
}

// ---- sessions that cannot have a server mission keep the legacy behaviour and send no mission fields ----
test('a short (<10 target) session starts synchronously with no mission and no RPC', async () => {
  installStorage(); const server = fakeServer(); const h = harness(options(server, { size: 2 }));
  h.run("startPathwaySession('meaning')");
  assert.equal(server.log.length, 0); assert.equal(h.state.session.missionId, undefined);
});

test('starting the next mission waits for the previous mission\'s settlement, so Continue cannot resume the mission just finished', async () => {
  installStorage(); const server = fakeServer(); const h = harness(options(server));
  let release; h.state.settling = new Promise(done => { release = done; });
  const started = h.run("startPathwaySession('meaning')");
  await new Promise(done => setTimeout(done, 20));
  assert.equal(server.log.length, 0, 'no RPC while the previous settlement is in flight');
  release(); await started;
  assert.equal(server.log.length, 1);
});
test('Continue practice returns the start promise (so a failed mission start is reported, not dropped)', () => {
  const app = readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  assert.match(app, /return startPathwaySession\(state\.pathwayId, true, state\.pathwayChoice\)/);
  assert.match(app, /return startMixedReview\(true,/);
});
