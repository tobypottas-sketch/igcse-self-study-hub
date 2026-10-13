import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const path = new URL('../supabase/migrations/20261013_teacher_activity_analytics.sql', import.meta.url);
const sql = fs.readFileSync(path, 'utf8');

for (const name of [
  'teacher_activity_classes',
  'teacher_activity_overview',
  'teacher_activity_student_summary',
  'teacher_activity_student_recent'
]) {
  test(`defines ${name}`, () => assert.match(sql, new RegExp(`create\\s+(?:or\\s+replace\\s+)?function\\s+public\\.${name}`, 'i')));
}

test('checks caller role and blocks students', () => {
  assert.match(sql, /private\.current_role\(\)/i);
  assert.match(sql, /admin/i);
  assert.match(sql, /teacher/i);
  assert.match(sql, /student/i);
});

test('uses membership windows for historical teacher visibility', () => {
  assert.match(sql, /student_class_memberships/i);
  assert.match(sql, /started_at/i);
  assert.match(sql, /ended_at/i);
  assert.match(sql, /occurred_at\s*>=\s*scm\.started_at/i);
  assert.match(sql, /scm\.ended_at\s+is\s+null\s+or\s+[^\n]*occurred_at\s*<\s*scm\.ended_at/i);
});

test('accuracy is based only on valid question attempts', () => {
  assert.match(sql, /event_type\s*=\s*'question_attempt'/i);
  assert.match(sql, /score\s+is\s+not\s+null/i);
  assert.match(sql, /max_score\s+is\s+not\s+null/i);
});

test('recent activity does not expose raw answers or prompts', () => {
  assert.doesNotMatch(sql, /answer_text/i);
  assert.doesNotMatch(sql, /prompt\b/i);
  assert.match(sql, /metadata\s*->>\s*'outcome'/i);
});
