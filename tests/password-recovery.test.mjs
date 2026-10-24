import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { requestPasswordReset, updateRecoveredPassword } from '../src/auth.js';

const login = fs.readFileSync(new URL('../src/views/login.js', import.meta.url), 'utf8');
const recovery = fs.readFileSync(new URL('../src/password-recovery.js', import.meta.url), 'utf8');
const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('login exposes a forgot-password action', () => {
  assert.match(login, /data-action=["']forgot-password["']/);
  assert.match(login, /data-form=["']forgot-password["']/);
  assert.match(login, /data-form=["']recovery-password["']/);
});

test('password reset email uses the supplied Hub redirect URL', async () => {
  const calls = [];
  const client = {
    auth: {
      resetPasswordForEmail: async (email, options) => {
        calls.push({ email, options });
        return { error:null };
      }
    }
  };
  await requestPasswordReset(client, 'admin@school.edu', 'https://example.test/hub/');
  assert.deepEqual(calls, [{ email:'admin@school.edu', options:{ redirectTo:'https://example.test/hub/' } }]);
});

test('recovered password updates auth and clears forced-change state', async () => {
  const calls = [];
  const client = {
    auth: {
      updateUser: async ({ password }) => { calls.push(['password', password]); return { error:null }; },
      getUser: async () => ({ data:{ user:{ id:'u1' } }, error:null })
    },
    from: () => ({
      update: (value) => ({
        eq: async (column, id) => { calls.push(['profile', value, column, id]); return { error:null }; }
      })
    })
  };
  await updateRecoveredPassword(client, 'NewSecure123!');
  assert.deepEqual(calls[0], ['password', 'NewSecure123!']);
  assert.deepEqual(calls[1], ['profile', { must_change_password:false }, 'id', 'u1']);
});

test('recovery controller handles Supabase recovery events and reset forms', () => {
  assert.match(recovery, /PASSWORD_RECOVERY/);
  assert.match(recovery, /forgot-password/);
  assert.match(recovery, /recovery-password/);
  assert.match(recovery, /window\.location\.replace/);
  assert.match(index, /src\/password-recovery\.js/);
});
