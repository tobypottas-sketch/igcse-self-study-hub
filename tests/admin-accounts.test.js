import test from 'node:test';
import assert from 'node:assert/strict';
import { createStudentAccount, createTeacherAccount } from '../src/admin/accounts.js';

function fakeClient(response = { data: { ok: true }, error: null }) {
  const calls = [];
  return {
    calls,
    functions: {
      invoke: async (name, options) => {
        calls.push([name, options]);
        return response;
      }
    }
  };
}

test('createStudentAccount calls protected provision function with student role and class', async () => {
  const client = fakeClient();
  await createStudentAccount(client, { email: 's@school.edu', displayName: 'Student One', classId: 'class-1' });
  assert.deepEqual(client.calls[0], ['admin-provision-user', { body: { action: 'provision', role: 'student', email: 's@school.edu', displayName: 'Student One', classId: 'class-1' } }]);
});

test('createTeacherAccount calls protected provision function with teacher role', async () => {
  const client = fakeClient();
  await createTeacherAccount(client, { email: 't@school.edu', displayName: 'Teacher One' });
  assert.deepEqual(client.calls[0], ['admin-provision-user', { body: { action: 'provision', role: 'teacher', email: 't@school.edu', displayName: 'Teacher One' } }]);
});

test('provisioning surfaces ordinary client errors', async () => {
  const client = fakeClient({ data: null, error: new Error('Forbidden') });
  await assert.rejects(() => createTeacherAccount(client, { email: 't@school.edu', displayName: 'Teacher' }), /Forbidden/);
});

test('provisioning surfaces Edge Function JSON errors instead of the generic non-2xx message', async () => {
  const error = new Error('Edge Function returned a non-2xx status code');
  error.context = { json: async () => ({ error: 'An account with this email already exists.' }) };
  const client = fakeClient({ data: null, error });
  await assert.rejects(
    () => createTeacherAccount(client, { email: 't@school.edu', displayName: 'Teacher' }),
    /An account with this email already exists\./
  );
});
