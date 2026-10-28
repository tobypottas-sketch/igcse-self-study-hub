import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const adminCss = fs.readFileSync(new URL('../admin.css', import.meta.url), 'utf8');
const functionSource = fs.readFileSync(new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url), 'utf8');

test('legacy admin print rule does not hide the login-card modal', () => {
  assert.doesNotMatch(adminCss, /@media print\{body \*\{visibility:hidden\}/);
});

test('class credential issuance uses bounded concurrency instead of a serial student loop', () => {
  assert.match(functionSource, /mapWithConcurrency/);
  assert.match(functionSource, /const credentialResults = await mapWithConcurrency/);
});
