import test from 'node:test';
import assert from 'node:assert/strict';
import { renderLoginCards } from '../src/admin/credential-print.js';
import { renderLogin } from '../src/views/login.js';

test('printable login cards contain only the student login details needed for handout', () => {
  const html = renderLoginCards([
    { displayName:'Synthetic Student', email:'student@example.test', temporaryPassword:'TigerRiver42' }
  ], 'G9 ESL', 'https://hub.example.test/');
  assert.match(html, /iGCSE Self-Study Hub/);
  assert.match(html, /Synthetic Student/);
  assert.match(html, /student@example\.test/);
  assert.match(html, /TigerRiver42/);
  assert.match(html, /https:\/\/hub\.example\.test\//);
  assert.match(html, /Keep this card safe/);
  assert.match(html, /Print class login cards/);
  assert.doesNotMatch(html, /teacher note|admin note/i);
});

test('printable login cards escape credential text before rendering', () => {
  const html = renderLoginCards([{ displayName:'<img src=x onerror=1>', email:'safe@example.test', temporaryPassword:'CloudRiver42' }], 'Class', 'https://hub.example.test/');
  assert.doesNotMatch(html, /<img src=x onerror=1>/);
  assert.match(html, /&lt;img src=x onerror=1&gt;/);
});

test('partial class credential issuance clearly lists failed students outside the printable cards', () => {
  const html = renderLoginCards(
    [{ displayName:'Created Student', email:'created@example.test', temporaryPassword:'CloudRiver42' }],
    'G9 ESL',
    'https://hub.example.test/',
    [{ displayName:'Failed Student', email:'failed@example.test', reason:'Unable to set student password.' }]
  );
  assert.match(html, /1 login card created; 1 student failed/i);
  assert.match(html, /Failed Student/);
  assert.match(html, /Unable to set student password/);
  assert.match(html, /data-credential-failures/);
  const printableGrid = html.match(/<div class="student-login-grid">([\s\S]*?)<\/div>\s*<\/section>/)?.[1] ?? '';
  assert.doesNotMatch(printableGrid, /Failed Student/);
});

test('normal login tells students to ask their teacher instead of offering self-service reset', () => {
  const root = { innerHTML:'' };
  renderLogin(root);
  assert.match(root.innerHTML, /Lost your login details\? Ask your teacher\./);
  assert.doesNotMatch(root.innerHTML, /data-action="forgot-password"/);
});
