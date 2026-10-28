import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const js = fs.readFileSync(new URL('../src/admin/credential-print.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../credential-print.css', import.meta.url), 'utf8');

test('login cards omit website URLs', () => {
  assert.doesNotMatch(js, /<dt>Website<\/dt>/);
  assert.doesNotMatch(js, /student-login-card-url/);
});

test('printing uses an isolated print-only root', () => {
  assert.match(js, /credential-print-root/);
  assert.match(js, /cloneNode\(true\)/);
  assert.match(css, /body\s*>\s*\*:not\(\.credential-print-root\)/);
});

test('A4 layout is a two-column four-row grid', () => {
  assert.match(css, /grid-template-columns:\s*1fr 1fr/);
  assert.match(css, /grid-template-rows:\s*repeat\(4,\s*1fr\)/);
});
