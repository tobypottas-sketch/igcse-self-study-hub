import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const edge = fs.readFileSync(path.join(here, '../supabase/functions/vocabulary-attempt-action/index.ts'), 'utf8');
const migrationsDir = path.join(here, '../supabase/migrations');
const migrations = fs.readdirSync(migrationsDir)
  .filter(name => name.endsWith('.sql'))
  .map(name => fs.readFileSync(path.join(migrationsDir, name), 'utf8'))
  .join('\n');

test('database commit serializes mastery writes for the same student and vocabulary target', () => {
  assert.match(migrations, /pg_advisory_xact_lock/i);
  assert.match(migrations, /expected_global_updated_at/i);
  assert.match(migrations, /expected_unit_updated_at/i);
  assert.match(migrations, /mastery_conflict/i);
});

test('Edge Function retries a stale mastery calculation against freshly-read state', () => {
  assert.match(edge, /expected_global_updated_at/);
  assert.match(edge, /expected_unit_updated_at/);
  assert.match(edge, /commitResult\.conflict/);
  assert.match(edge, /MAX_MASTERY_COMMIT_ATTEMPTS/);
  assert.match(edge, /for \(let commitAttempt = 0;/);
});
