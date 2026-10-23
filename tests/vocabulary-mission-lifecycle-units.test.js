// Unit tests for the mission cache, the lifecycle decision and the seed helpers. Synthetic ids only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadMission, saveMission, clearMission, markTargetComplete, slotKey, MISSION_CACHE_MAX_AGE_MS, usedToObject, usedFromObject } from '../src/vocabulary/mission-cache.js';
import { acquireMission } from '../src/vocabulary/mission-lifecycle.js';
import { orderMissionTargets, derivePresentationNonce, deriveContentSeed } from '../src/vocabulary/mission-seed.js';

const store = () => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), raw: m }; };
const slot = { unitNumber: 1, kind: 'pathway', pathwayId: 'meaning', stageId: 'recognise' };
const entry = (over = {}) => ({ missionId: 'm1', missionSeed: 's1-xxxxxxxxxxxxxxxxxxxx', familyId: null, targetIds: ['a', 'b', 'c'], completedTargetIds: [], usedAtStart: {}, ...over });
const server = row => async request => ({ ...row, resumed: false, seen: request });

test('cache round-trips ids and counters only', () => {
  const storage = store(); assert.ok(saveMission('u', slot, entry(), { storage, now: 1000 }));
  assert.deepEqual(Object.keys(loadMission('u', slot, { storage, now: 1500 })).sort(), ['asks', 'completedTargetIds', 'familyId', 'missionId', 'missionSeed', 'savedAt', 'targetIds', 'usedAtStart']);
  assert.equal(JSON.stringify([...storage.raw.values()]).includes('rawAnswer'), false);
});
test('cache entries expire with the server stale horizon and are per-user and per-slot', () => {
  const storage = store(); saveMission('u', slot, entry(), { storage, now: 0 });
  assert.ok(loadMission('u', slot, { storage, now: MISSION_CACHE_MAX_AGE_MS }));
  assert.equal(loadMission('u', slot, { storage, now: MISSION_CACHE_MAX_AGE_MS + 1 }), null);
  assert.equal(loadMission('other', slot, { storage, now: 1 }), null);
  assert.equal(loadMission('u', { ...slot, stageId: 'match' }, { storage, now: 1 }), null);
  assert.notEqual(slotKey(slot), slotKey({ ...slot, kind: 'mixed' }));
});
test('cache survives corrupt storage and storage that throws', () => {
  const storage = store(); storage.setItem('vocab.mission.v1.u', '{not json'); assert.equal(loadMission('u', slot, { storage }), null);
  const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  assert.equal(loadMission('u', slot, { storage: broken }), null); assert.equal(saveMission('u', slot, entry(), { storage: broken }), false);
  assert.doesNotThrow(() => clearMission('u', slot, { storage: broken }));
});
test('markTargetComplete is idempotent and only touches an existing entry', () => {
  const storage = store(); assert.equal(markTargetComplete('u', slot, 'a', { storage }), false);
  saveMission('u', slot, entry(), { storage }); assert.ok(markTargetComplete('u', slot, 'a', { storage })); assert.equal(markTargetComplete('u', slot, 'a', { storage }), false);
  assert.deepEqual(loadMission('u', slot, { storage }).completedTargetIds, ['a']);
});
test('used-content snapshots convert to and from objects', () => {
  const map = new Map([['o1', ['x', 'y']]]); assert.deepEqual(usedFromObject(usedToObject(map)), map); assert.deepEqual([...usedFromObject(null)], []);
});

test('lifecycle: no cache -> server mission, not resumed', async () => {
  const r = await acquireMission({ start: server({ missionId: 'm9', missionSeed: 'seed9' }), userKey: 'u', slot, storage: store() });
  assert.equal(r.status, 'ready'); assert.equal(r.missionId, 'm9'); assert.equal(r.extras, null); assert.equal(r.resumed, false);
});
test('lifecycle: cache + same server mission -> resume with the cache extras', async () => {
  const storage = store(); saveMission('u', slot, entry({ completedTargetIds: ['a'] }), { storage });
  const r = await acquireMission({ start: async () => ({ missionId: 'm1', missionSeed: 's1-xxxxxxxxxxxxxxxxxxxx', resumed: true }), userKey: 'u', slot, storage });
  assert.equal(r.resumed, true); assert.deepEqual(r.extras.completedTargetIds, ['a']);
});
test('lifecycle: server disagrees with the cache -> server wins and the cache is cleared', async () => {
  const storage = store(); saveMission('u', slot, entry(), { storage });
  const r = await acquireMission({ start: server({ missionId: 'm2', missionSeed: 'seed2' }), userKey: 'u', slot, storage });
  assert.equal(r.missionId, 'm2'); assert.equal(r.extras, null); assert.equal(r.discardedCache, true); assert.equal(loadMission('u', slot, { storage }), null);
});
test('lifecycle: explicit new and a changed activity family both ask the server for a NEW mission', async () => {
  const storage = store(); saveMission('u', slot, entry({ familyId: 'f1' }), { storage });
  const seen = []; const start = async request => { seen.push(request.forceNew); return { missionId: `m${seen.length + 5}`, missionSeed: 'seedN' }; };
  await acquireMission({ start, userKey: 'u', slot, storage, forceNew: true });
  saveMission('u', slot, entry({ familyId: 'f1' }), { storage });
  await acquireMission({ start, userKey: 'u', slot, storage, familyId: 'f2' });
  assert.deepEqual(seen, [true, true]);
});
test('lifecycle: RPC failure with a cached open mission resumes it; without one it is unavailable (never a new mission)', async () => {
  const down = async () => { throw new Error('offline'); };
  const storage = store(); saveMission('u', slot, entry(), { storage });
  const resumed = await acquireMission({ start: down, userKey: 'u', slot, storage }); assert.equal(resumed.status, 'ready'); assert.equal(resumed.source, 'cache'); assert.equal(resumed.missionId, 'm1');
  const none = await acquireMission({ start: down, userKey: 'u', slot, storage: store() }); assert.equal(none.status, 'unavailable');
  const forced = await acquireMission({ start: down, userKey: 'u', slot, storage, forceNew: true }); assert.equal(forced.status, 'unavailable', 'an explicit NEW must not fall back to the old mission');
});

test('orderMissionTargets: deterministic, a permutation, input-order independent, seed-sensitive', () => {
  const ids = Array.from({ length: 10 }, (_, i) => `u1_${i}`);
  const a = orderMissionTargets(ids, 'seed-A-xxxxxxxxxxxx');
  assert.deepEqual(a, orderMissionTargets([...ids].reverse(), 'seed-A-xxxxxxxxxxxx'));
  assert.deepEqual([...a].sort(), [...ids].sort());
  assert.notDeepEqual(a, orderMissionTargets(ids, 'seed-B-xxxxxxxxxxxx'));
});
test('presentation nonce and content seed are domain-separated', () => {
  const args = { missionSeed: 'seed-A-xxxxxxxxxxxx', occurrenceId: 'o1', slot: 2 };
  assert.notEqual(derivePresentationNonce(args), deriveContentSeed({ ...args, activityType: 'meaning_match' }));
  assert.notEqual(derivePresentationNonce(args), derivePresentationNonce({ ...args, slot: 3 }));
});
