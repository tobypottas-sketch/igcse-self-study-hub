import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync(new URL('../src/admin/credential-print.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../credential-print.css', import.meta.url), 'utf8');

test('login cards contain only student identity and login credentials', () => {
  assert.match(js, /Email \/ username/);
  assert.match(js, /Password/);
  assert.doesNotMatch(js, /Website/);
  assert.doesNotMatch(js, /Keep this card safe/);
  assert.doesNotMatch(js, /Student login/);
});

test('login cards live in a closable modal that is also the print source', () => {
  assert.match(js, /student-login-modal/);
  assert.match(js, /admin-close-login-cards/);
  assert.match(css, /body>\*:not\(\.student-login-modal\)/);
  assert.doesNotMatch(js, /credential-print-root/);
  assert.doesNotMatch(js, /cloneNode\(true\)/);
});

test('A4 layout is a two-column five-row grid', () => {
  assert.match(css, /grid-template-columns:1fr 1fr/);
  assert.match(css, /grid-template-rows:repeat\(5,1fr\)/);
});
