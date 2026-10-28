import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const credentialCss = fs.readFileSync(new URL('../credential-print.css', import.meta.url), 'utf8');
const functionSource = fs.readFileSync(new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url), 'utf8');

test('login-card modal explicitly overrides the legacy admin print visibility rule', () => {
  assert.match(credentialCss, /\.student-login-modal,\.student-login-modal \*\{visibility:visible!important\}/);
});

test('class credential issuance uses bounded concurrency instead of a serial student loop', () => {
  assert.match(functionSource, /mapWithConcurrency/);
  assert.match(functionSource, /const credentialResults = await mapWithConcurrency/);
  assert.match(functionSource, /mapWithConcurrency\(credentialPlans, 6/);
});
