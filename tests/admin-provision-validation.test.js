import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAdminProvisionRequest } from '../supabase/functions/admin-provision-user/validation.js';
import { createStudentAccount, resetAccountPassword, setAccountActive } from '../src/admin/accounts.js';

const userId = '11111111-1111-4111-8111-111111111111';
const classId = '22222222-2222-4222-8222-222222222222';

function fakeClient(response = { data: { ok:true, temporaryPassword:'OneTime123!' }, error:null }) {
  const calls = [];
  return {
    calls,
    functions: { invoke: async (name, options) => { calls.push([name, options]); return response; } }
  };
}

test('manual student provisioning no longer requires a browser-supplied password', () => {
  const out = validateAdminProvisionRequest({ action:'provision', role:'student', email:'s@school.edu', displayName:'Student', classId });
  assert.equal(out.action, 'provision');
  assert.equal(out.classId, classId);
  assert.equal('temporaryPassword' in out, false);
});

test('client student provisioning never sends a supplied temporary password', async () => {
  const client = fakeClient();
  await createStudentAccount(client, { email:'s@school.edu', displayName:'Student', classId, temporaryPassword:'SHOULD_NOT_SEND' });
  assert.deepEqual(client.calls[0][1].body, { action:'provision', role:'student', email:'s@school.edu', displayName:'Student', classId });
});

test('reset password validates target id and client action', async () => {
  assert.throws(() => validateAdminProvisionRequest({ action:'reset_password', userId:'bad' }), /user/i);
  const client = fakeClient();
  const result = await resetAccountPassword(client, userId);
  assert.equal(result.temporaryPassword, 'OneTime123!');
  assert.deepEqual(client.calls[0][1].body, { action:'reset_password', userId });
});

test('active state action accepts only boolean active values', async () => {
  assert.throws(() => validateAdminProvisionRequest({ action:'set_active', userId, active:'false' }), /boolean/i);
  const client = fakeClient({ data:{ ok:true }, error:null });
  await setAccountActive(client, userId, false);
  assert.deepEqual(client.calls[0][1].body, { action:'set_active', userId, active:false });
});
