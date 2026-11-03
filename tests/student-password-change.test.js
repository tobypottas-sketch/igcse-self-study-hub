import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { renderHome } from '../src/views/home.js';
import { renderChangePassword } from '../src/views/change-password.js';

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

test('inactive student does not see the self-service password control', () => {
  const root = { innerHTML:'' };
  renderHome(root, { ...activeStudent, active:false }, []);
  assert.doesNotMatch(root.innerHTML, /data-action="change-password"/);
});

test('voluntary student password change is cancellable but forced first-sign-in change is not', () => {
  const voluntaryRoot = { innerHTML:'' };
  renderChangePassword(voluntaryRoot, activeStudent);
  assert.match(voluntaryRoot.innerHTML, /Account settings/);
  assert.match(voluntaryRoot.innerHTML, /data-action="cancel-change-password"/);
  assert.match(voluntaryRoot.innerHTML, /data-student-password-change/);

  const forcedRoot = { innerHTML:'' };
  renderChangePassword(forcedRoot, { ...activeStudent, must_change_password:true });
  assert.match(forcedRoot.innerHTML, /First sign-in/);
  assert.doesNotMatch(forcedRoot.innerHTML, /data-action="cancel-change-password"/);
  assert.doesNotMatch(forcedRoot.innerHTML, /data-student-password-change/);
});

test('student password controller exists, is loaded, and rechecks active student role', async () => {
  const controllerUrl = new URL('../src/student-password-controller.js', import.meta.url);
  assert.equal(existsSync(controllerUrl), true, 'student password controller should exist');
  const [controllerSource, indexSource] = await Promise.all([
    readFile(controllerUrl, 'utf8'),
    readFile(new URL('../index.html', import.meta.url), 'utf8')
  ]);
  assert.match(indexSource, /src\/student-password-controller\.js/);
  assert.match(controllerSource, /profile\?\.role === 'student'/);
  assert.match(controllerSource, /profile\?\.active !== false/);
  assert.match(controllerSource, /stopImmediatePropagation\(\)/);
  assert.match(controllerSource, /changePassword\(client, password\)/);
});

test('teacher/admin reset capability remains present', async () => {
  const accountsSource = await readFile(new URL('../src/admin/accounts.js', import.meta.url), 'utf8');
  assert.match(accountsSource, /export async function resetAccountPassword/);
  assert.match(accountsSource, /action: 'reset_password'/);
});
