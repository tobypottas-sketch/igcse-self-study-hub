import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const sql = fs.readFileSync(new URL('../supabase/migrations/20261013_teacher_activity_rpc_grant_hardening.sql', import.meta.url), 'utf8');
test('teacher analytics RPCs explicitly revoke anon execute', () => {
  for (const name of ['teacher_activity_classes','teacher_activity_overview','teacher_activity_student_summary','teacher_activity_student_recent']) {
    assert.match(sql, new RegExp(`revoke\\s+execute\\s+on\\s+function\\s+public\\.${name}[\\s\\S]*?from\\s+public,\\s*anon`, 'i'));
  }
});
