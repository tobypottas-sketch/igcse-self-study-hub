import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.resolve('supabase/migrations/20261027190000_teacher_activity_dashboard.sql');

function migrationSql() {
  assert.equal(
    fs.existsSync(migrationPath),
    true,
    'teacher Activity migration must define the scoped read boundary'
  );
  return fs.readFileSync(migrationPath, 'utf8').toLowerCase();
}

test('teacher Activity read boundary is role scoped and does not trust a caller supplied teacher id', () => {
  const sql = migrationSql();
  assert.match(sql, /auth\.uid\(\)/);
  assert.match(sql, /current_role\(\)/);
  assert.match(sql, /teacher_classes/);
  assert.match(sql, /student_class_memberships/);
  assert.match(sql, /ended_at\s+is\s+null/);
  assert.match(sql, /role[^\n]+admin|admin[^\n]+role/);
  assert.match(sql, /role[^\n]+teacher|teacher[^\n]+role/);
  assert.doesNotMatch(sql, /p_teacher_id|teacher_id\s+uuid\s+default/);
});

test('teacher Activity read boundary contains only safe analytics sources and unit-check score metadata', () => {
  const sql = migrationSql();
  for (const source of [
    'activity_events',
    'vocabulary_global_mastery',
    'vocabulary_unit_mastery',
    'vocabulary_unit_check_attempts',
    'vocabulary_merit_awards'
  ]) assert.match(sql, new RegExp(source));

  assert.match(sql, /score/);
  assert.match(sql, /max_score/);
  assert.match(sql, /attempt_number/);
  assert.doesNotMatch(sql, /raw_answer|typed_answer|student_answer|essay_text|teacher_note|student_note/);
});

test('students are explicitly rejected from the teacher Activity read boundary', () => {
  const sql = migrationSql();
  assert.match(sql, /teacher[^;]+admin|admin[^;]+teacher/);
  assert.match(sql, /raise\s+exception|insufficient_privilege|not authorised|not authorized/);
});

test('a missing derived role is explicitly rejected from the teacher Activity read boundary', () => {
  const sql = migrationSql();
  assert.match(sql, /actor_role\s+is\s+null/);
  assert.match(sql, /actor_role\s+not\s+in/);
});
