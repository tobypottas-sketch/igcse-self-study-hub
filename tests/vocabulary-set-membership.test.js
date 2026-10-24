// Hardening: Set progression is verified against the Set's authoritative membership, held server-side (vocabulary_set_members).
// The behaviour is proven on a real Postgres by tests/db/set-membership.scenario.sql (26 checks); this file guards the pieces that live in the repo.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { membershipRows, membershipSql, baselineRows, changedSets, deltaSql } from '../scripts/generate-set-membership-sql.mjs';
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
  assert.equal(generatedDelta.trim(), deltaSql().trim());
  const effective = new Map(baselineRows().map(r => [`${r.unit}|${r.pathway}|${r.set}|${r.position}`, r]));
  for (const { now } of changedSets()) {
    for (const k of [...effective.keys()]) if (k.startsWith(`${now[0].unit}|${now[0].pathway}|${now[0].set}|`)) effective.delete(k);
    for (const r of now) effective.set(`${r.unit}|${r.pathway}|${r.set}|${r.position}`, r);
  }
  const live = new Set(membershipRows().map(r => `${r.unit}|${r.pathway}`));
  const applied = [...effective.values()].filter(r => live.has(`${r.unit}|${r.pathway}`)).map(key).sort();
  assert.deepEqual(applied, membershipRows().map(key).sort());
});
test('Set stability: the only Unit 1 membership change is Meaning Set 4 (competitor, historic -> selection, produce); Word Families seed rows are left, never deleted', () => {
  const changed = changedSets();
  assert.deepEqual(changed.map(c => c.key), ['1|meaning|4']);
  assert.deepEqual(changed[0].was.map(r => r.occurrenceId).filter(id => !changed[0].now.some(n => n.occurrenceId === id)), ['u1_36_competitor', 'u1_42_historic']);
  assert.deepEqual(changed[0].now.map(r => r.occurrenceId).filter(id => !changed[0].was.some(n => n.occurrenceId === id)), ['u1_43_selection', 'u1_44_produce']);
  assert.doesNotMatch(delta, /vocabulary_set_members[^;]*word_families/i);
});
test('the delta is guarded: it raises (never silently skips or reshuffles) if the Set was started; no student data is touched', () => {
  assert.match(delta, /from public\.vocabulary_pathway_sets where unit_number = 1 and pathway_id = 'meaning' and set_number = 4/);
  assert.match(delta, /raise exception/);
  assert.doesNotMatch(delta, /\b(drop table|drop column|truncate)\b/i);
  assert.doesNotMatch(delta, /(update|delete from) public\.(?!vocabulary_set_members)/i);
  assert.doesNotMatch(delta, /\bgrant\b|\bcreate policy\b|\bdisable row level security\b/i);
});
test('every live Set has exactly ten distinct members; only live pathways are in the current membership; Unit 1 matches the Job 8 Set counts', () => {
  const rows = membershipRows();
  const bySet = new Map();
  for (const r of rows) { const k = `${r.unit}|${r.pathway}|${r.set}`; (bySet.get(k) ?? bySet.set(k, []).get(k)).push(r.occurrenceId); }
  for (const [k, ids] of bySet) { assert.equal(ids.length, 10, k); assert.equal(new Set(ids).size, 10, k); }
  const counts = {}; for (const k of bySet.keys()) { const p = k.split('|')[1]; counts[p] = (counts[p] ?? 0) + 1; }
  assert.deepEqual(counts, { meaning: 4, context: 4, precision_use: 5, spelling_recall: 5 });
  assert.equal(rows.some(r => r.pathway === 'paraphrasing' || r.pathway === 'word_families'), false, 'a pathway that is not live has no current Set');
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
