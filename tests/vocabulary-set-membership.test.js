// Hardening: Set progression is verified against the Set's authoritative membership, held server-side (vocabulary_set_members).
// The behaviour is proven on a real Postgres by tests/db/set-membership.scenario.sql (26 checks); this file guards the pieces that live in the repo.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { membershipRows as allMembershipRows, membershipSql, baselineRows, changedSets, removedSets, deltaSql } from '../scripts/generate-set-membership-sql.mjs';
// These tests cover Unit 1's seeded + delta membership; Unit 2's Sets have their own release test (vocabulary-unit-02-release.test.js).
const membershipRows = (...args) => (args.length ? allMembershipRows(...args) : allMembershipRows().filter(r => r.unit === 1));
import { harness } from './vocabulary-app-harness.mjs';

const migration = fs.readFileSync(new URL('../supabase/migrations/20261024170000_vocabulary_set_membership.sql', import.meta.url), 'utf8');
const generated = migration.match(/-- BEGIN GENERATED MEMBERS[^\n]*\n([\s\S]*?)\n-- END GENERATED MEMBERS/)[1];

const delta = fs.readFileSync(new URL('../supabase/migrations/20261025130000_vocabulary_set_membership_v2.sql', import.meta.url), 'utf8');
const generatedDelta = delta.match(/-- BEGIN GENERATED DELTA[^\n]*\n([\s\S]*?)\n-- END GENERATED DELTA/)[1];
const key = r => `${r.unit}|${r.pathway}|${r.set}|${r.position}|${r.occurrenceId}`;

test('the seed migration is immutable history: it still equals the seed it shipped with (never regenerated)', () => {
  assert.equal(generated.trim(), baselineRows().map(r => `  (${r.unit}, '${r.pathway}', ${r.set}, ${r.position}, '${r.occurrenceId}')`).join(',\n').replace(/^/, 'insert into public.vocabulary_set_members (unit_number, pathway_id, set_number, position, occurrence_id) values\n').concat('\non conflict do nothing;').trim());
});
test('seed + the guarded v2 delta equals the membership the app computes from the Unit 1 release (re-run scripts/generate-set-membership-sql.mjs --write if this fails)', () => {
  assert.equal(generatedDelta.replace(/^-- CONTENT LOCK[^\n]*\n/, '').trim(), deltaSql().trim());
  const effective = new Map(baselineRows().map(r => [`${r.unit}|${r.pathway}|${r.set}|${r.position}`, r]));
  const drop = set => { for (const k of [...effective.keys()]) if (k.startsWith(`${set.unit}|${set.pathway}|${set.set}|`)) effective.delete(k); };
  for (const { now } of changedSets()) { drop(now[0]); for (const r of now) effective.set(`${r.unit}|${r.pathway}|${r.set}|${r.position}`, r); }
  for (const { was } of removedSets()) drop(was[0]);
  // Job 9 follow-up: NOTHING obsolete survives. The authoritative table after seed + delta is exactly the release membership.
  const applied = [...effective.values()].map(key).sort();
  assert.deepEqual(applied, membershipRows().map(key).sort());
  assert.equal(applied.length, 200);
});
test('Set stability: the only Unit 1 membership changes are Word Families Sets 1-2 (re-packed to the 29 eligible families); Set 3 is REMOVED; every other Set equals the seed', () => {
  const changed = changedSets();
  assert.deepEqual(changed.map(c => c.key), ['1|word_families|1', '1|word_families|2']);
  assert.deepEqual(removedSets().map(c => c.key), ['1|word_families|3']);
  // Meaning Set 4 is NOT changed: Job 9 authored the missing Meaning Mastery contexts, so competitor and historic stay where the seed put them.
  const meaning4 = membershipRows().filter(r => r.pathway === 'meaning' && r.set === 4).map(r => r.occurrenceId);
  assert.deepEqual(meaning4, baselineRows().filter(r => r.pathway === 'meaning' && r.set === 4).map(r => r.occurrenceId));
  assert.ok(meaning4.includes('u1_36_competitor') && meaning4.includes('u1_42_historic'));
  // an unchanged Set is never rewritten
  assert.doesNotMatch(delta, /'(meaning|context|precision_use|spelling_recall)'/);
});
test('the delta is guarded: it raises (never silently skips or reshuffles) if a Set was started; no student data is touched', () => {
  for (const set of [1, 2, 3]) assert.match(delta, new RegExp(`from public\\.vocabulary_pathway_sets where unit_number = 1 and pathway_id = 'word_families' and set_number = ${set}`));
  assert.equal([...delta.matchAll(/raise exception/g)].length, 3, 'one guard per replaced or removed Set');
  assert.doesNotMatch(delta, /\b(drop table|drop column|truncate)\b/i);
  assert.doesNotMatch(delta, /(update|delete from) public\.(?!vocabulary_set_members)/i);
  assert.doesNotMatch(delta, /\bgrant\b|\bcreate policy\b|\bdisable row level security\b/i);
});
test('every live Set has exactly ten distinct members; only live pathways are in the current membership; Unit 1 matches the Job 9 Set counts', () => {
  const rows = membershipRows();
  const bySet = new Map();
  for (const r of rows) { const k = `${r.unit}|${r.pathway}|${r.set}`; (bySet.get(k) ?? bySet.set(k, []).get(k)).push(r.occurrenceId); }
  for (const [k, ids] of bySet) { assert.equal(ids.length, 10, k); assert.equal(new Set(ids).size, 10, k); }
  const counts = {}; for (const k of bySet.keys()) { const p = k.split('|')[1]; counts[p] = (counts[p] ?? 0) + 1; }
  assert.deepEqual(counts, { meaning: 4, context: 4, word_families: 2, precision_use: 5, spelling_recall: 5 });
  assert.equal(rows.some(r => r.pathway === 'paraphrasing'), false, 'a pathway that is not live has no current Set');
});
test('the settlement trigger advances only when attempted = finished = Set members, read from the protected table', () => {
  assert.match(migration, /from public\.vocabulary_set_members m/);
  assert.match(migration, /v_attempted is distinct from v_members/);
  assert.match(migration, /v_finished is distinct from v_members/);
  assert.match(migration, /array_length\(v_members, 1\) is distinct from 10/);
  assert.match(migration, /targets_not_set_members/);
  assert.doesNotMatch(migration, /set_members\b[^;]*(p_|new\.)members/i, 'membership is never taken from a caller argument');
});
test('a Set cannot exist without its members, and students cannot write members', () => {
  assert.match(migration, /before insert on public\.vocabulary_pathway_sets/i);
  assert.match(migration, /revoke all on public\.vocabulary_set_members from anon, authenticated/i);
  assert.match(migration, /grant select on public\.vocabulary_set_members to authenticated/i);
  assert.doesNotMatch(migration, /grant (insert|update|delete|all)[^;]*vocabulary_set_members/i);
});
test('the new migration is additive: no drop table/column, no delete or update of existing data', () => {
  const body = migration.replace(/-- BEGIN GENERATED MEMBERS[\s\S]*?-- END GENERATED MEMBERS/, '');
  assert.doesNotMatch(body, /\bdrop table\b|\bdrop column\b|\bdelete from\b|\btruncate\b/i);
  assert.doesNotMatch(body, /\bupdate public\.(activity_events|vocabulary_global_mastery|vocabulary_unit_mastery)\b/i);
  assert.equal([...body.matchAll(/\bupdate public\.vocabulary_missions\b[^;]*/gi)].every(m => /set set_number = v_start\.set_number, set_phase = v_start\.set_phase where mission_id = new\.mission_id/.test(m[0])), true, 'the only write to a mission row stamps its own Set label');
});

// ---- the same rule in the in-memory server model used by the browser-free app tests ----
async function playToEnd(h) {
  for (let guard = 0; guard < 400 && h.state.current; guard += 1) {
    const q = h.state.current;
    h.run(`handleAnswer(null,${JSON.stringify(q.question.markingReference.acceptedAnswers[0])})`);
    await h.state.attempts.settled();
    await h.run('advanceToNextQuestion()');
  }
  await h.state.settling;
}
test('model: a mission that finished ten targets from outside the Set does not advance it; the real Set mission does', async () => {
  const h = harness({ pathwayId: 'meaning', stage: 'apply', size: 10, setServer: true, userKey: 'membership-model' });
  await h.run("startPathwaySession('meaning')");
  const missionId = h.state.session.missionId;
  const forged = Array.from({ length: 10 }, (_, i) => ({ missionId, occurrenceId: `outsider-${i}`, firstAttempt: true, rawAnswer: 'x', pathwayStage: 'apply', pathwayId: 'meaning' }));
  assert.ok(h.server.record(missionId, forged), 'the mission settles as ordinary evidence');
  assert.equal(h.server.rows()[0].stage, 'apply', 'but the Set does not move');
  assert.equal(h.server.rows()[0].history.at(-1).rejected, 'targets_not_set_members');

  const g = harness({ pathwayId: 'meaning', stage: 'apply', size: 10, setServer: true, userKey: 'membership-model-2' });
  await g.run("startPathwaySession('meaning')");
  await playToEnd(g);
  assert.equal(g.server.rows()[0].stage, 'recall', 'a real Set mission still advances');
});

// ---- Job 9 follow-up: removed Sets ----
const row = (set, position, occurrenceId, pathway = 'word_families') => ({ unit: 1, pathway, set, position, occurrenceId });
const setOf = (set, ids, pathway) => ids.map((id, i) => row(set, i + 1, id, pathway));
test('removed Sets are detected: a Set in the baseline that is absent from the current membership', () => {
  const base = [...setOf(1, ['a', 'b']), ...setOf(2, ['c', 'd']), ...setOf(3, ['e', 'f'])];
  const now = [...setOf(1, ['a', 'b']), ...setOf(2, ['c', 'd'])];
  assert.deepEqual(removedSets(now, base).map(r => r.key), ['1|word_families|3']);
  assert.deepEqual(changedSets(now, base), [], 'a removed Set is not a changed Set');
  assert.deepEqual(removedSets(base, base), []);
  assert.deepEqual(removedSets(now, []), []);
  // the real Unit 1 case
  assert.deepEqual(removedSets().map(r => r.key), ['1|word_families|3']);
  assert.equal(removedSets()[0].was.length, 10);
});
test('a removed Set is guarded like a changed Set, then deleted with no replacement', () => {
  const base = [...setOf(1, ['a', 'b']), ...setOf(2, ['c', 'd'])];
  const sql = deltaSql(setOf(1, ['a', 'b']), base);
  const guard = sql.indexOf("set_number = 2) then"); const del = sql.indexOf('delete from public.vocabulary_set_members');
  assert.ok(guard > -1 && del > guard, 'guard runs before any delete');
  assert.match(sql, /raise exception 'Set 1\/word_families\/2 has already been started/);
  assert.match(sql, /delete from public\.vocabulary_set_members where unit_number = 1 and pathway_id = 'word_families' and set_number = 2;/);
  assert.doesNotMatch(sql, /insert into/, 'a removal has no replacement rows');
  assert.equal(deltaSql(base, base), '', 'nothing removed or changed gives no delta');
});
test('the generated v2 migration guards and deletes Word Families Set 3 without replacement, and does so atomically after all guards', () => {
  assert.match(delta, /set_number = 3\) then\n\s+raise exception/);
  assert.match(delta, /delete from public\.vocabulary_set_members where unit_number = 1 and pathway_id = 'word_families' and set_number = 3;/);
  assert.equal([...delta.matchAll(/'word_families', 3, /g)].length, 0, 'no Set 3 rows are inserted');
  const lastGuard = delta.lastIndexOf('raise exception'); const firstDelete = delta.indexOf('delete from public.vocabulary_set_members');
  assert.ok(firstDelete > lastGuard, 'every guard precedes the first delete');
  assert.equal([...delta.matchAll(/\bdo \$\$/g)].length, 1, 'one atomic block');
});
