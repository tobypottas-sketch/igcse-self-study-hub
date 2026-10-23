// Mission identity (server-issued missionId + missionSeed) and the content-seed contract. The SQL itself was exercised on a throwaway
// local Postgres (tests/db/*), and its rules are pinned statically in test 11.
import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveContentSeed } from '../src/vocabulary/mission-seed.js';
import { newStore, startMission, resumeMission, abandonMission, completeMission, refresh } from './support/vocabulary-contract/reference-mission-identity.js';

const base = { missionSeed: '8f14e45f-ceea-467a-9575-1e5e7a1e1c11', occurrenceId: 'u1_leisure', slot: 3, activityType: 'definition_to_word' };

test('content seed is deterministic for the same mission seed, occurrence, slot and activity type', () => assert.equal(deriveContentSeed(base), deriveContentSeed({ ...base })));
test('content seed changes when ANY of mission seed, occurrence, slot or activity type changes', () => {
  const seeds = new Set([base, { ...base, missionSeed: 'another-seed-value-123' }, { ...base, occurrenceId: 'u1_avoid' }, { ...base, slot: 4 }, { ...base, activityType: 'meaning_match' }].map(deriveContentSeed));
  assert.equal(seeds.size, 5);
});
test('content seed has no presentation-nonce input: extra fields are ignored', () => {
  assert.equal(deriveContentSeed({ ...base, optionNonce: 'a' }), deriveContentSeed({ ...base, optionNonce: 'b' }));
  assert.equal(deriveContentSeed({ ...base, presentationNonce: 'a' }), deriveContentSeed(base));
});
test('a content seed cannot be derived without a server mission seed (no silent fallback)', () => {
  for (const bad of [{ ...base, missionSeed: '' }, { ...base, missionSeed: undefined }, { ...base, occurrenceId: ' ' }, { ...base, activityType: null }, { ...base, slot: -1 }, { ...base, slot: 'x' }]) assert.throws(() => deriveContentSeed(bad));
});
test('across 1,000 mission seeds the same word and slot get well-spread content seeds (no collisions in the sample)', () => {
  const seen = new Set(); for (let i = 0; i < 1000; i += 1) seen.add(deriveContentSeed({ ...base, missionSeed: `seed-${i}-xxxxxxxxxxxx` }));
  assert.equal(seen.size, 1000);
});
test('seed format is a fixed-length opaque token', () => assert.match(deriveContentSeed(base), /^cs_[0-9a-f]{16}$/));

// The lifecycle the SQL implements, as an executable specification (the real SQL is exercised in tests/db).
test('lifecycle: new → resume → refresh → abandon → new → complete → new', () => {
  const s = newStore(); const a = startMission(s, { pathwayId: 'meaning', stageId: 'recognise' });
  assert.deepEqual(resumeMission(s), a); assert.equal(refresh(s).current.missionSeed, a.missionSeed);
  abandonMission(s); const b = startMission(s, { pathwayId: 'meaning', stageId: 'recognise' });
  assert.notEqual(b.missionSeed, a.missionSeed); assert.notEqual(b.missionId, a.missionId);
  completeMission(s); const c = startMission(s, { pathwayId: 'meaning', stageId: 'recognise' });
  assert.notEqual(c.missionSeed, b.missionSeed); assert.notEqual(c.missionId, b.missionId);
});
