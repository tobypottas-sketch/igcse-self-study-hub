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
  await createStudentAccount(client, { email: 's@school.edu', displayName: 'Student One', temporaryPassword: 'Temp123!', classId: 'class-1' });
  assert.deepEqual(client.calls[0], ['admin-provision-user', { body: { role: 'student', email: 's@school.edu', displayName: 'Student One', temporaryPassword: 'Temp123!', classId: 'class-1' } }]);
});

test('createTeacherAccount calls protected provision function with teacher role', async () => {
  const client = fakeClient();
  await createTeacherAccount(client, { email: 't@school.edu', displayName: 'Teacher One', temporaryPassword: 'Temp123!' });
  assert.equal(client.calls[0][1].body.role, 'teacher');
});

test('provisioning surfaces server errors', async () => {
  const client = fakeClient({ data: null, error: new Error('Forbidden') });
  await assert.rejects(() => createTeacherAccount(client, { email: 't@school.edu', displayName: 'Teacher', temporaryPassword: 'Temp123!' }), /Forbidden/);
});
