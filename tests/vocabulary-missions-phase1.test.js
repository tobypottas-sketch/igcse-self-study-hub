import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateVocabularyAttempt, buildStoredAttemptMetadata } from '../supabase/functions/vocabulary-attempt-action/validation.js';

const base = { occurrenceId:'u1_01_leisure', contextId:'u1_01_leisure_meaning', contentSource:'context', questionType:'meaning_match', rawAnswer:'free time' };
const mission = { missionId:'22222222-2222-4222-8222-222222222222', missionSize:10, missionKind:'pathway', practiceFamily:'meaning:recognise' };

test('attempts without mission fields still validate (timed, legacy and preview clients)', () => {
  const parsed = validateVocabularyAttempt(base);
  assert.equal(parsed.missionId, null);
  assert.equal(parsed.missionKind, null);
});

test('mission fields validate together and are stored in the attempt metadata', () => {
  const parsed = validateVocabularyAttempt({ ...base, ...mission });
  assert.deepEqual([parsed.missionId, parsed.missionSize, parsed.missionKind, parsed.practiceFamily], [mission.missionId, 10, 'pathway', 'meaning:recognise']);
  const metadata = buildStoredAttemptMetadata({ ...parsed, unitNumber:1, correct:true, vocabularyId:'vocab_leisure' });
  assert.equal(metadata.mission_id, mission.missionId);
  assert.equal(metadata.mission_size, 10);
  assert.equal(metadata.mission_kind, 'pathway');
  assert.equal(metadata.practice_family, 'meaning:recognise');
  const plain = buildStoredAttemptMetadata({ ...validateVocabularyAttempt(base), unitNumber:1, correct:true, vocabularyId:'vocab_leisure' });
  assert.equal('mission_id' in plain, false);
});

test('partial, malformed or mismatched mission fields are rejected', () => {
  assert.throws(() => validateVocabularyAttempt({ ...base, missionId:mission.missionId }), /together/);
  assert.throws(() => validateVocabularyAttempt({ ...base, ...mission, missionId:'nope' }), /Mission ID/);
  assert.throws(() => validateVocabularyAttempt({ ...base, ...mission, missionSize:7 }), /size/);
  assert.throws(() => validateVocabularyAttempt({ ...base, ...mission, missionKind:'timed' }), /kind/);
  assert.throws(() => validateVocabularyAttempt({ ...base, ...mission, practiceFamily:'Bad Family!' }), /family/);
  assert.throws(() => validateVocabularyAttempt({ ...base, ...mission, missionKind:'mixed' }), /family/);
  assert.throws(() => validateVocabularyAttempt({ ...base, ...mission, practiceFamily:'mixed' }), /family/);
  assert.doesNotThrow(() => validateVocabularyAttempt({ ...base, ...mission, missionKind:'mixed', practiceFamily:'mixed' }));
});

test('the client never sends a score, streak or star count with a mission', () => {
  const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  const fields = app.slice(app.indexOf('function missionFields()'), app.indexOf('function persistVocabularyAttempt('));
  assert.match(fields, /missionId/);
  assert.doesNotMatch(fields, /score|streak|stars/i);
  assert.match(app, /\.\.\.pathwayFields, \.\.\.missionFields\(\)/);
});

const sql = fs.readFileSync(new URL('../supabase/migrations/20261023120000_vocabulary_missions.sql', import.meta.url), 'utf8');

test('migration closes direct attempt inserts and gives students no write path to missions', () => {
  assert.match(sql, /not \(app_key = 'vocabulary_paraphrase' and event_type = 'question_attempt'\)/);
  assert.match(sql, /grant select on public\.vocabulary_missions to authenticated/);
  assert.doesNotMatch(sql, /grant (insert|update|delete)[^;]*vocabulary_missions/i);
  assert.match(sql, /mission_id uuid primary key/);
});

test('the recording RPC takes only a mission id and derives the facts server-side', () => {
  assert.match(sql, /function public\.record_vocabulary_mission\(p_mission_id uuid\)/);
  assert.match(sql, /security definer/);
  assert.match(sql, /grant execute on function public\.record_vocabulary_mission\(uuid\) to authenticated/);
  assert.match(sql, /ten finished targets are required/);
  assert.match(sql, /ae\.user_id = v_student/);
});

test('the scenario script that exercises the RPC ships with the migration', () => {
  const scenarios = fs.readFileSync(new URL('../supabase/tests/vocabulary_missions_scenarios.sql', import.meta.url), 'utf8');
  for (const needle of ['Clean mission', 'Inventing a mission id', "Another student's mission", 'Students cannot insert question attempts']) assert.match(scenarios, new RegExp(needle));
});
