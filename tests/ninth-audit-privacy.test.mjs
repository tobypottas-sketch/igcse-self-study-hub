import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migrationPath = new URL('../supabase/migrations/20261016090000_ninth_audit_privacy_hardening.sql', import.meta.url);
const provisionPath = new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url);

test('analytics metadata is constrained at the database boundary', () => {
  assert.equal(fs.existsSync(migrationPath), true, 'Audit #9 privacy-hardening migration is missing');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  for (const key of ['attempt_number','word_count','overlap_count','outcome','question_type','section_id','support_type','result_type']) {
    assert.match(sql, new RegExp(`\\b${key}\\b`), `database allowlist must cover ${key}`);
  }
  assert.match(sql, /jsonb_object_keys/i, 'database must reject unexpected metadata keys');
  assert.match(sql, /activity_events_metadata_privacy_check/i, 'privacy check constraint must be named and explicit');
});

test('deleting a teacher cannot be blocked by controlled Essay task history', () => {
  assert.equal(fs.existsSync(migrationPath), true, 'Audit #9 privacy-hardening migration is missing');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  assert.match(sql, /essay_tasks_created_by_fkey/i);
  assert.match(sql, /ON DELETE SET NULL/i, 'controlled task creator must be anonymisable on account deletion');

  const source = fs.readFileSync(provisionPath, 'utf8');
  assert.match(source, /from\('essay_tasks'\)[\s\S]*?update\(\{\s*active\s*:\s*false\s*\}\)[\s\S]*?eq\('created_by',\s*input\.userId\)/,
    'teacher deletion must retire that teacher’s controlled Essay links before deleting the account');
});
