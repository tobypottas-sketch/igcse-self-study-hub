import test from 'node:test';
import assert from 'node:assert/strict';
import { signIn, changePassword, getCurrentProfile } from '../src/auth.js';
import { routeForProfile } from '../src/app.js';

test('valid login returns session data', async () => {
  const client = { auth: { signInWithPassword: async ({ email, password }) => ({ data: { user: { id: 'u1', email }, session: { access_token: 'x' } }, error: password === 'Temp123!' ? null : new Error('bad') }) } };
  const result = await signIn(client, 'student@school.edu', 'Temp123!');
  assert.equal(result.user.id, 'u1');
});

test('invalid login throws a friendly error', async () => {
  const client = { auth: { signInWithPassword: async () => ({ data: null, error: new Error('Invalid login credentials') }) } };
  await assert.rejects(() => signIn(client, 'x@y.com', 'wrong'), /email or password/i);
});

test('temporary-password profile is routed only to password change', () => {
  assert.equal(routeForProfile({ role: 'student', must_change_password: true }), 'change-password');
  assert.equal(routeForProfile({ role: 'student', must_change_password: false }), 'home');
});

test('password change updates auth and clears must_change_password', async () => {
  const calls = [];
  const client = {
    auth: {
      updateUser: async ({ password }) => { calls.push(['password', password]); return { data: { user: { id: 'u1' } }, error: null }; },
      getUser: async () => ({ data: { user: { id: 'u1' } }, error: null })
    },
    from: () => ({
      update: (value) => ({
        eq: async (column, id) => { calls.push(['profile', value, column, id]); return { error: null }; }
      })
    })
  };
  await changePassword(client, 'NewSecure123!');
  assert.deepEqual(calls[0], ['password', 'NewSecure123!']);
  assert.deepEqual(calls[1], ['profile', { must_change_password: false }, 'id', 'u1']);
});

test('getCurrentProfile rejects authenticated users without an approved profile', async () => {
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { code: 'PGRST116' } }) }) }) })
  };
  await assert.rejects(() => getCurrentProfile(client), /not authorised/i);
});
