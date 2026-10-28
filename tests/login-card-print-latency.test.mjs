import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const credentialCss = fs.readFileSync(new URL('../credential-print.css', import.meta.url), 'utf8');
const credentialPrintSource = fs.readFileSync(new URL('../src/admin/credential-print.js', import.meta.url), 'utf8');
const functionSource = fs.readFileSync(new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url), 'utf8');

test('login-card modal explicitly overrides the legacy admin print visibility rule', () => {
  assert.match(credentialCss, /\.student-login-modal,\.student-login-modal \*\{visibility:visible!important\}/);
});

test('login-card print pages contain ten cards in a two by five grid', () => {
  assert.match(credentialPrintSource, /start \+= 10/);
  assert.match(credentialPrintSource, /slice\(start, start \+ 10\)/);
  assert.match(credentialCss, /grid-template-rows:repeat\(5,1fr\)!important/);
});

test('class credential issuance uses a larger bounded batch to reduce teacher wait time', () => {
  assert.match(functionSource, /mapWithConcurrency/);
  assert.match(functionSource, /const credentialResults = await mapWithConcurrency/);
  assert.match(functionSource, /mapWithConcurrency\(credentialPlans, 12/);
});
