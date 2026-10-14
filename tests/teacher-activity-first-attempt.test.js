import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const path = new URL('../supabase/migrations/20261013141000_teacher_activity_first_attempt.sql', import.meta.url);
const sql = fs.readFileSync(path, 'utf8');

test('teacher analytics rank scored question attempts per unique question', () => {
  assert.match(sql, /row_number\(\)\s+over\s*\(/i);
  assert.match(sql, /partition\s+by\s+[^)]*user_id[^)]*app_key[^)]*activity_id/i);
  assert.match(sql, /order\s+by\s+[^)]*occurred_at/i);
  assert.match(sql, /where\s+[^;]*attempt_rank\s*=\s*1/i);
});

test('first-attempt rows drive question count, score and weakest-skill accuracy', () => {
  assert.match(sql, /count\(\*\).*attempts/i);
  assert.match(sql, /sum\([^)]*score[^)]*\).*correct_score/i);
  assert.match(sql, /sum\([^)]*max_score[^)]*\).*valid_max_score/i);
  assert.match(sql, /skill_stats/i);
});

test('raw events remain untouched', () => {
  assert.doesNotMatch(sql, /delete\s+from\s+public\.activity_events/i);
  assert.doesNotMatch(sql, /update\s+public\.activity_events/i);
});
