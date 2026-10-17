import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const foundationPath = new URL('../supabase/migrations/20261017051500_vocabulary_builder_foundation.sql', import.meta.url);
const unitActivitiesPath = new URL('../supabase/migrations/20261017095000_vocabulary_unit_activities.sql', import.meta.url);

function source() {
  return fs.readFileSync(foundationPath, 'utf8');
}

function activitySource() {
  return fs.readFileSync(unitActivitiesPath, 'utf8');
}

const publicTables = [
  'vocabulary_items',
  'vocabulary_unit_occurrences',
  'vocabulary_contexts',
  'vocabulary_global_mastery',
  'vocabulary_unit_mastery',
  'learning_interventions',
  'learning_intervention_targets'
];

test('vocabulary foundation enables RLS on every new public table', () => {
  const sql = source();
  for (const table of publicTables) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
  }
});

test('unit activity content table has RLS and staff can preview non-live curated content', () => {
  const sql = activitySource();
  assert.match(sql, /create table public\.vocabulary_unit_activities/i);
  assert.match(sql, /alter table public\.vocabulary_unit_activities enable row level security/i);
  assert.match(sql, /create policy vocabulary_unit_activities_select/i);
  assert.match(sql, /status\s*=\s*'live'/i);
  assert.match(sql, /private\.current_role\(\).*teacher/is);
  assert.match(sql, /private\.current_role\(\).*admin/is);
});

test('unit activity table stores curated content only and has no student identity or answer columns', () => {
  const sql = activitySource().toLowerCase();
  assert.match(sql, /activity_content_id text primary key/);
  assert.match(sql, /activity_data jsonb not null/);
  for (const forbidden of ['student_id','answer_text','typed_answer','student_answer','free_text_answer']) {
    assert.equal(sql.includes(forbidden), false, `forbidden unit activity token: ${forbidden}`);
  }
});

test('mastery and intervention schema never adds free-text student answer columns', () => {
  const sql = source().toLowerCase();
  for (const forbidden of ['answer_text', 'typed_answer', 'student_answer', 'free_text_answer']) {
    assert.equal(sql.includes(forbidden), false, `forbidden column token: ${forbidden}`);
  }
});

test('teacher reads require existing teacher-to-student authorization helper', () => {
  const sql = source();
  assert.match(sql, /private\.teacher_can_access_student\s*\(student_id\)/i);
  assert.match(sql, /vocabulary_global_mastery_select/i);
  assert.match(sql, /vocabulary_unit_mastery_select/i);
});

test('students have no direct mastery update policy', () => {
  const sql = source().toLowerCase();
  assert.equal(/create policy[^;]+vocabulary_global_mastery[^;]+for update/s.test(sql), false);
  assert.equal(/create policy[^;]+vocabulary_unit_mastery[^;]+for update/s.test(sql), false);
});
