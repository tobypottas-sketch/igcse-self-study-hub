import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const auth = fs.readFileSync(new URL('../src/auth.js', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const login = fs.readFileSync(new URL('../src/views/login.js', import.meta.url), 'utf8');

test('login exposes a forgot-password action', () => {
  assert.match(login, /data-action=["']forgot-password["']/);
});

test('auth module supports reset email and recovered password update', () => {
  assert.match(auth, /export async function requestPasswordReset/);
  assert.match(auth, /resetPasswordForEmail/);
  assert.match(auth, /export async function updateRecoveredPassword/);
});

test('app handles password recovery mode and form submission', () => {
  assert.match(app, /PASSWORD_RECOVERY/);
  assert.match(app, /data-form=["']recovery-password["']/);
  assert.match(app, /forgot-password/);
});
