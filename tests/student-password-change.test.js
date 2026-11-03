import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderHome } from '../src/views/home.js';
import { renderChangePassword } from '../src/views/change-password.js';

const appSource = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');

const activeStudent = {
  display_name:'Student Example',
  role:'student',
  active:true,
  must_change_password:false
};

test('active student sees a self-service Change password control on the Hub home screen', () => {
  const root = { innerHTML:'' };
  renderHome(root, activeStudent, []);
  assert.match(root.innerHTML, /data-action="change-password"/);
  assert.match(root.innerHTML, />Change password<\/button>/);
});

test('voluntary student password change is cancellable but forced first-sign-in change is not', () => {
  const voluntaryRoot = { innerHTML:'' };
  renderChangePassword(voluntaryRoot, activeStudent);
  assert.match(voluntaryRoot.innerHTML, /Account settings/);
  assert.match(voluntaryRoot.innerHTML, /data-action="cancel-change-password"/);

  const forcedRoot = { innerHTML:'' };
  renderChangePassword(forcedRoot, { ...activeStudent, must_change_password:true });
  assert.match(forcedRoot.innerHTML, /First sign-in/);
  assert.doesNotMatch(forcedRoot.innerHTML, /data-action="cancel-change-password"/);
});

test('app password action, submit, and cancel guards include active students', () => {
  assert.match(appSource, /canSelfChangePassword\(currentState\.profile\)/);
  assert.match(appSource, /action === 'change-password'/);
  assert.match(appSource, /action === 'cancel-change-password'/);
  assert.match(appSource, /kind === 'change-password'/);
});
