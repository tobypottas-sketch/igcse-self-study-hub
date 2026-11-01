import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const dir = new URL('../supabase/functions/eh-match/', import.meta.url);
const read = name => fs.readFileSync(new URL(name, dir), 'utf8');
const INDEX = read('index.ts');
const RUNBOOK = fs.readFileSync(new URL('../docs/eh-match-deployment.md', import.meta.url), 'utf8');

test('index.ts selects only id, display_name, school_email, role and active', () => {
  assert.match(INDEX, /\.select\('id, display_name, school_email, role, active'\)/);
  assert.equal((INDEX.match(/\.select\(/g) || []).length, 1);
});

test("index.ts filters role 'student' and active true in the query", () => {
  assert.match(INDEX, /\.eq\('role', 'student'\)/);
  assert.match(INDEX, /\.eq\('active', true\)/);
});

test('index.ts has no console calls and no CORS headers', () => {
  assert.doesNotMatch(INDEX, /console\./);
  assert.doesNotMatch(INDEX, /Access-Control/i);
});

test('index.ts reads only the profiles table (no learning tables)', () => {
  assert.equal((INDEX.match(/\.from\(/g) || []).length, 1);
  assert.match(INDEX, /\.from\('profiles'\)/);
  assert.doesNotMatch(INDEX, /vocabulary_|essay|merit|intervention|student_class_memberships/);
});

test('no eh-match source file contains a uuid, email or student-number literal', () => {
  for (const name of ['index.ts', 'handler.js', 'match.js']) {
    const text = read(name).replace(/^import .*$/gm, '');
    assert.doesNotMatch(text, /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, name);
    assert.doesNotMatch(text, /[\w.+-]+@[\w-]+\.[\w.-]+/, name);
    assert.doesNotMatch(text, /['"][0-9]{3,6}['"]/, name);
  }
});

test('runbook documents the --no-verify-jwt deploy flag and the 32-character minimum', () => {
  assert.match(RUNBOOK, /--no-verify-jwt/);
  assert.match(RUNBOOK, /32/);
  assert.match(RUNBOOK, /EH_SERVICE_KEY/);
  assert.match(RUNBOOK, /HUB_SERVICE_KEY/);
});
