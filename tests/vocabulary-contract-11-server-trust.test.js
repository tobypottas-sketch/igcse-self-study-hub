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

// ---- not yet true ----
expectedFailure({ rule: 'Server, not client, decides pass/fail (8/10 pass, 6-7 Consolidate, <=5 Recovery)',
  today: 'record_vocabulary_mission stores score and stars (stars thresholds 9/7/5) but no pass/consolidate/recovery outcome; the 8/10 line exists nowhere on the server',
  turnsGreenWhen: 'the mission function (or a successor) writes an outcome column from the locked 8/6 thresholds' },
'record_vocabulary_mission derives a pass / consolidate / recovery outcome', () => assert.match(migration, /consolidate/i));
expectedFailure({ rule: 'Server-owned visible-stage advancement: one passed mission advances once; replay of a passed stage does not double-advance',
  today: 'visible stage is derived on the client from per-word pathwayProgress (Math.max over words); no server table records which stage a learner has advanced to',
  turnsGreenWhen: 'a server-side Set/stage state row is advanced inside the mission-recording transaction, keyed by mission_id' },
'mission recording advances a server-held Set stage exactly once', () => assert.match(migration, /advance|set_stage|current_stage/i));
expectedFailure({ rule: 'Mission seed is server-issued so a client cannot choose easier content',
  today: 'there is no mission seed at all; the question seed is client-derived from occurrence id and index',
  turnsGreenWhen: 'start-mission issues missionId + missionSeed server-side and attempts must quote that missionId' },
'mission_seed is stored on a server mission row', () => assert.match(migration, /mission_seed/));
