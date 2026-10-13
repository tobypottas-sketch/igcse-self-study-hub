import test from 'node:test';
import assert from 'node:assert/strict';
import { renderLogin } from '../src/views/login.js';
import { renderChangePassword } from '../src/views/change-password.js';

test('login view contains email and password fields only, with no signup control', () => {
  const root = { innerHTML: '' };
  renderLogin(root);
  assert.match(root.innerHTML, /type="email"/);
  assert.match(root.innerHTML, /type="password"/);
  assert.doesNotMatch(root.innerHTML, /sign up/i);
});

test('change-password view clearly requires a new password', () => {
  const root = { innerHTML: '' };
  renderChangePassword(root, { display_name: 'Student One' });
  assert.match(root.innerHTML, /change your password/i);
  assert.match(root.innerHTML, /new password/i);
});
