import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const adminView = fs.readFileSync(new URL('../src/views/admin.js', import.meta.url), 'utf8');
const credentialPrint = fs.readFileSync(new URL('../src/admin/credential-print.js', import.meta.url), 'utf8');
const adminCss = fs.readFileSync(new URL('../admin.css', import.meta.url), 'utf8');

test('class cards use a collapsible roster instead of a comma-separated paragraph', () => {
  assert.match(adminView, /admin-class-roster/);
  assert.match(adminView, /<details/);
  assert.doesNotMatch(adminView, /c\.students\.map\(s => escapeHtml\(s\.displayName\)\)\.join\(', '\)/);
});

test('generated login card sheets can be dismissed', () => {
  assert.match(credentialPrint, /admin-close-login-cards/);
  assert.match(credentialPrint, /removeGeneratedLoginCards/);
});

test('class rosters have dedicated compact styling', () => {
  assert.match(adminCss, /\.admin-class-roster/);
  assert.match(adminCss, /\.admin-class-roster__list/);
});
