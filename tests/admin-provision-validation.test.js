import test from 'node:test';
import assert from 'node:assert/strict';
import { safeAuthAccountError, validateAdminProvisionRequest } from '../supabase/functions/admin-provision-user/validation.js';
import * as accounts from '../src/admin/accounts.js';

const { createStudentAccount, resetAccountPassword, setAccountActive } = accounts;
const userId = '11111111-1111-4111-8111-111111111111';
const classId = '22222222-2222-4222-8222-222222222222';

function fakeClient(response = { data: { ok:true, temporaryPassword:'OneTime123!' }, error:null }) {
  const calls = [];
  return { calls, functions: { invoke: async (name, options) => { calls.push([name, options]); return response; } } };
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

test('class credential issuance validates class id and uses one explicit admin action', async () => {
  assert.throws(() => validateAdminProvisionRequest({ action:'issue_class_credentials', classId:'bad' }), /class/i);
  assert.deepEqual(validateAdminProvisionRequest({ action:'issue_class_credentials', classId }), { action:'issue_class_credentials', classId });
  assert.equal(typeof accounts.issueClassCredentials, 'function');
  const client = fakeClient({ data:{ ok:true, created:[], failed:[] }, error:null });
  await accounts.issueClassCredentials(client, classId);
  assert.deepEqual(client.calls[0][1].body, { action:'issue_class_credentials', classId });
});

test('active state action accepts only boolean active values', async () => {
  assert.throws(() => validateAdminProvisionRequest({ action:'set_active', userId, active:'false' }), /boolean/i);
  const client = fakeClient({ data:{ ok:true }, error:null });
  await setAccountActive(client, userId, false);
  assert.deepEqual(client.calls[0][1].body, { action:'set_active', userId, active:false });
});

test('bulk provision validates class and normalizes every row server-side', () => {
  const out = validateAdminProvisionRequest({ action:'bulk_provision_students', classId, rows:[{ displayName:' Student A ', email:' A@school.edu ' }] });
  assert.deepEqual(out, { action:'bulk_provision_students', classId, rows:[{ displayName:'Student A', email:'a@school.edu' }] });
  assert.throws(() => validateAdminProvisionRequest({ action:'bulk_provision_students', classId:'bad', rows:[{ displayName:'A', email:'a@school.edu' }] }), /class/i);
  assert.throws(() => validateAdminProvisionRequest({ action:'bulk_provision_students', classId, rows:[] }), /row/i);
});

test('bulk provision caps a launch batch at 100 rows', () => {
  const rows = Array.from({ length:101 }, (_, i) => ({ displayName:`Student ${i}`, email:`s${i}@school.edu` }));
  assert.throws(() => validateAdminProvisionRequest({ action:'bulk_provision_students', classId, rows }), /100/i);
});

test('duplicate auth emails become a safe useful account message', () => {
  assert.equal(
    safeAuthAccountError({ code:'email_exists', message:'A user with this email address has already been registered' }),
    'An account with this email already exists.'
  );
  assert.equal(
    safeAuthAccountError({ message:'A user with this email address has already been registered' }),
    'An account with this email already exists.'
  );
});
