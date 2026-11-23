import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const credentialPrint = fs.readFileSync(new URL('../src/admin/credential-print.js', import.meta.url), 'utf8');
const credentialCss = fs.readFileSync(new URL('../credential-print.css', import.meta.url), 'utf8');

test('class roster is generated from student records, never splitting student names at commas', () => {
  const view = fs.readFileSync(new URL('../src/views/admin.js', import.meta.url), 'utf8');
  assert.match(view, /class="admin-class-roster"/);
  assert.match(view, /data-student-id=/);
  assert.ok(view.includes('c.students.length'));
  assert.ok(!credentialPrint.includes("split(/,\\\\s*/)"), 'Do not split class rosters using commas');
  assert.ok(!credentialPrint.includes('enhanceClassRoster'), 'Legacy comma splitter must be removed');
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
