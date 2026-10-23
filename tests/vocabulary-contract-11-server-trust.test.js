// Part 10: server trust. Variation (seed, nonce, order) must never become a client-controlled input to grading or progression.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { markCuratedAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';
import { expectedFailure } from './support/vocabulary-contract/xfail.js';

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const edge = read('supabase/functions/vocabulary-attempt-action/index.ts');
const migration = read('supabase/migrations/20261023120000_vocabulary_missions.sql');
const foundation = read('supabase/migrations/20261013111500_activity_events_foundation.sql');

// ---- grading is a pure function of question identity + typed answer ----
const sense = { acceptedParaphrases: ['stay away from'], masteryContexts: [], misleadingDistractors: ['join'] };
const grade = extra => markCuratedAnswer({ item: { vocabularyId: 'v1' }, sense, context: { contextId: 'c1', acceptedAnswers: ['avoid'] }, questionType: 'type_word_from_definition', rawAnswer: 'avoid', ...extra });
test('same question identity grades identically regardless of mission seed, nonce, option order and tile order', () => {
  const base = grade({});
  for (const noise of [{ missionSeed: 's1' }, { optionNonce: 'zzz' }, { options: ['join', 'avoid'] }, { options: ['avoid', 'join'] }, { tiles: ['a', 'v', 'o', 'i', 'd'] }, { presentationNonce: 'p' }])
    assert.deepEqual(grade(noise), base, JSON.stringify(noise));
  assert.equal(base.correct, true);
});
test('a wrong answer stays wrong whatever the presentation', () => {
  for (const noise of [{}, { missionSeed: 'x' }, { optionNonce: 'y' }]) assert.equal(grade({ ...noise, rawAnswer: 'join' }).correct, false);
});
test('marking is case/space-insensitive but never depends on position', () => assert.equal(grade({ rawAnswer: '  Avoid ' }).correct, true));

// ---- the Edge Function: what the client may and may not influence ----
const markingCall = /markCuratedAnswer\(.*\)(?=;)/.exec(edge)?.[0] ?? '';
test('Edge Function marks from server-loaded content: only questionType and rawAnswer come from the client', () => {
  assert.ok(markingCall, 'markCuratedAnswer call not found');
  for (const banned of ['seed', 'nonce', 'Nonce', 'tiles', 'options', 'score', 'passed']) assert.equal(markingCall.includes(banned), false, `marking call references ${banned}`);
  assert.match(markingCall, /rawAnswer:input\.rawAnswer/); assert.match(markingCall, /questionType:input\.questionType/);
});
test('Edge Function loads occurrence, item, sense and context/activity from the database (IDs are authoritative)', () => {
  for (const table of ['vocabulary_unit_occurrences', 'vocabulary_items', 'vocabulary_contexts', 'vocabulary_unit_activities']) assert.match(edge, new RegExp(`from\\('${table}'\\)`));
  assert.match(edge, /context\.occurrence_id !== occurrence\.occurrence_id/);
  assert.match(edge, /Vocabulary unit activity is not linked to this target/);
});
test('Edge Function has no client-reported score, pass flag, stage or star input', () => {
  assert.equal(/input\.(score|passed|stars|advance|stageComplete|missionScore)\b/.test(edge), false);
});
test('Edge Function treats a repeated attempt id as a duplicate and does not double-count', () => {
  assert.match(edge, /commitResult\.duplicate === true/); assert.match(edge, /attemptId = input\.attemptId \?\? crypto\.randomUUID\(\)/);
});

// ---- mission recording ----
test('record_vocabulary_mission accepts only a mission id and derives everything from stored attempts', () => {
  assert.match(migration, /function public\.record_vocabulary_mission\(p_mission_id uuid\)/);
  assert.match(migration, /from public\.activity_events ae[\s\S]*ae\.user_id = v_student/);
  assert.match(migration, /metadata->>'mission_id' = p_mission_id::text/);
});
test('incomplete missions cannot be recorded (ten finished targets required)', () => {
  assert.match(migration, /v_targets <> 10 or v_completed <> 10[\s\S]*Mission is not complete: ten finished targets are required/);
});
test('mission size is pinned to 10 by metadata validation and by a table check constraint', () => {
  assert.match(migration, /mission_size integer not null check \(mission_size = 10\)/);
  assert.match(migration, /when 'mission_size' then not \(jsonb_typeof\(val\) = 'number' and val::text = '10'\)/);
});
test('recording is idempotent: a second call returns the stored row flagged duplicate', () => {
  assert.match(migration, /on conflict \(mission_id\) do nothing/); assert.match(migration, /'duplicate', true/);
  assert.match(migration, /Mission cannot be recorded/); // another student's mission id is refused
});
test('students cannot write activity_events directly (the Edge Function service role is the only writer)', () => {
  assert.match(migration, /drop policy if exists activity_events_insert_own/);
  assert.match(migration, /create policy activity_events_insert_own[\s\S]*?(false|with check \()/);
  assert.match(foundation, /before insert on public\.activity_events/);
});

// ---- mission identity and server-derived outcome (migration 20261024120000) ----
const identity = read('supabase/migrations/20261024120000_vocabulary_mission_identity.sql');
test('the mission seed never reaches grading: the Edge Function does not read it', () => {
  assert.equal(/mission_?seed|missionSeed|content_?seed/i.test(edge), false);
  assert.equal(/mission_?seed|missionSeed/i.test(readFileSync(new URL('../supabase/functions/_shared/vocabulary-engine.js', import.meta.url), 'utf8')), false);
});
test('missionId and missionSeed are minted by the database (column defaults), never supplied by the caller', () => {
  assert.match(identity, /mission_id uuid primary key default gen_random_uuid\(\)/);
  assert.match(identity, /mission_seed text not null default gen_random_uuid\(\)::text/);
  const signature = /function public\.start_vocabulary_mission\(([\s\S]*?)\)\s*returns/.exec(identity)?.[1] ?? '';
  assert.ok(signature); assert.equal(/seed|mission_id|score|outcome|stage_passed/i.test(signature.replace(/p_pathway_stage|p_mission_phase/g, '')), false, `start signature accepts: ${signature}`);
  assert.match(identity, /values \(v_student, p_unit_number/); // the owner is always auth.uid(), never a parameter
});
test('students cannot write mission starts or missions directly; only the definer RPCs and triggers do', () => {
  assert.match(identity, /revoke all on public\.vocabulary_mission_starts from anon, authenticated;\s*grant select on public\.vocabulary_mission_starts to authenticated;/);
  assert.match(identity, /revoke all on function public\.start_vocabulary_mission\([^)]*\) from public, anon;/);
  assert.equal(/grant (insert|update|delete)[^;]*vocabulary_mission/i.test(identity), false);
});
test('lifecycle: resume returns the same row, NEW abandons the open one and mints another, one open mission per slot', () => {
  assert.match(identity, /if found and not coalesce\(p_new, false\) then[\s\S]*v_resumed := true;/);
  assert.match(identity, /set status = 'abandoned', ended_at = now\(\)/);
  assert.match(identity, /create unique index if not exists vocabulary_mission_starts_one_open_idx[\s\S]*where status = 'open'/);
  assert.match(identity, /pg_advisory_xact_lock/);
});
test('settlement closes the start row, so the next start is a new mission', () => {
  assert.match(identity, /after insert on public\.vocabulary_missions[\s\S]*vocabulary_mission_close_start/);
  assert.match(identity, /set status = 'completed'/);
});
test('LOCKED: the database derives pass / consolidate / recovery (8 / 6) from the server-derived score and discards any supplied value', () => {
  assert.match(identity, /new\.outcome := case when new\.score >= 8 then 'pass' when new\.score >= 6 then 'consolidate' else 'recovery' end/);
  assert.match(identity, /before insert on public\.vocabulary_missions/);
  assert.match(identity, /check \(outcome is null or outcome in \('pass','consolidate','recovery'\)\)/);
});
test('the existing record_vocabulary_mission body and its anti-tamper rules are untouched by this migration', () => {
  assert.equal(/function public\.record_vocabulary_mission/.test(identity), false);
  assert.match(migration, /function public\.record_vocabulary_mission\(p_mission_id uuid\)/);
});

// ---- not yet true (blocked on wiring the app) ----
expectedFailure({ rule: 'Server-owned visible-stage advancement: one passed mission advances once; replay of a passed stage does not double-advance',
  today: 'the server now records the mission outcome, but nothing applies it to a stored Set stage: src/vocabulary/stage-progression.js is pure and not wired, and the app still derives the visible stage from per-word evidence',
  turnsGreenWhen: 'a server-side Set state row (using the stage-progression rules) is advanced in the mission-recording transaction, keyed by mission_id' },
'mission recording advances a server-held Set stage exactly once', () => assert.match(migration + identity, /set_stage|current_stage|advance_set/i));

// ---- server enforcement (migration 20261024140000 + the attempt Edge Function). Behaviour is exercised on local Postgres by tests/db/mission-enforcement.scenario.sql (12 checks). ----
const enforcement = read('supabase/migrations/20261024140000_vocabulary_mission_enforcement.sql');
test('attempts naming a mission must reference a server-issued, open mission owned by the caller (Edge Function)', () => {
  assert.match(edge, /from\('vocabulary_mission_starts'\)/);
  assert.match(edge, /mission_not_issued/); assert.match(edge, /mission_not_open/);
  assert.match(edge, /start\.student_id !== callerData\.user\.id/);
  assert.match(edge, /status !== 'open'/);
});
test('an attempt WITHOUT a mission id is unaffected by enforcement (ordinary practice keeps working)', () => {
  assert.match(edge, /if \(input\.missionId && !input\.preview\)/);
});
test('settlement requires an open start row owned by the student; closed, abandoned, forged and other-student ids are refused', () => {
  assert.match(enforcement, /raise exception 'Mission was not issued by the server'/);
  assert.match(enforcement, /s\.mission_id = new\.mission_id and s\.student_id = new\.student_id and s\.status = 'open'/);
  assert.match(enforcement, /new\.outcome := case when new\.score >= 8 then 'pass' when new\.score >= 6 then 'consolidate' else 'recovery' end/);
});
test('a mission untouched for 12 hours is replaced, never resumed (record_vocabulary_mission refuses missions that old)', () => {
  assert.match(enforcement, /last_resumed_at < now\(\) - interval '12 hours'/);
  assert.match(enforcement, /p_new := true/);
});
test('enforcement does not redefine record_vocabulary_mission or weaken any grant', () => {
  assert.equal(/function public\.record_vocabulary_mission/.test(enforcement), false);
  assert.equal(/grant (insert|update|delete)/i.test(enforcement), false);
  assert.match(enforcement, /revoke all on function private\.vocabulary_mission_derive_outcome\(\) from public, anon, authenticated/);
});
test('the client no longer mints mission ids', () => {
  const app = read('src/vocabulary/app.js');
  assert.equal(/newMissionUuid|withMissionId|randomUUID\(\)[^\n]*mission/i.test(app), false);
  assert.match(app, /startVocabularyMission\(state\.client/);
});
