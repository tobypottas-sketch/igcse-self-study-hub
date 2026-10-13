import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql = fs.readFileSync(new URL('../supabase/migrations/20261013_teacher_activity_private_implementation.sql', import.meta.url), 'utf8');
test('public analytics RPCs become security-invoker wrappers over private implementations', () => {
  assert.match(sql, /set schema private/i);
  assert.match(sql, /security invoker/i);
  assert.match(sql, /private\.teacher_activity_overview/i);
  assert.doesNotMatch(sql, /create function public\.teacher_activity_overview[\s\S]*?security definer/i);
});
