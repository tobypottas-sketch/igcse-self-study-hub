import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migrationPath = new URL('../supabase/migrations/20261017051500_vocabulary_builder_foundation.sql', import.meta.url);

function source() {
  return fs.readFileSync(migrationPath, 'utf8');
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
