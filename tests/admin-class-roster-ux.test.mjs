import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const credentialPrint = fs.readFileSync(new URL('../src/admin/credential-print.js', import.meta.url), 'utf8');
const credentialCss = fs.readFileSync(new URL('../credential-print.css', import.meta.url), 'utf8');

test('class cards replace the long names paragraph with a collapsible roster', () => {
  assert.match(credentialPrint, /function enhanceClassRoster/);
  assert.match(credentialPrint, /createElement\('details'\)/);
  assert.match(credentialPrint, /admin-class-roster/);
  assert.match(credentialPrint, /View \$\{names\.length\} student/);
});

test('generated login cards use a modal with an explicit close action', () => {
  assert.match(credentialPrint, /student-login-modal/);
  assert.match(credentialPrint, /admin-close-login-cards/);
  assert.match(credentialPrint, /removeGeneratedLoginCards/);
  assert.match(credentialPrint, /aria-label="Close login cards"/);
});

test('class rosters and modal have dedicated styling', () => {
  assert.match(credentialCss, /\.admin-class-roster/);
  assert.match(credentialCss, /\.admin-class-roster__list/);
  assert.match(credentialCss, /\.student-login-modal/);
  assert.match(credentialCss, /\.student-login-modal__close/);
});
