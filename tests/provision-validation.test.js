import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProvisionInput } from '../supabase/functions/admin-provision-user/validation.js';

test('student provisioning requires a class UUID', () => {
  assert.throws(() => validateProvisionInput({ role:'student', email:'s@school.edu', displayName:'Student', temporaryPassword:'Temp123456!' }), /class/i);
});

test('teacher provisioning does not require a class', () => {
  const out = validateProvisionInput({ role:'teacher', email:'t@school.edu', displayName:' Teacher ', temporaryPassword:'Temp123456!' });
  assert.equal(out.displayName, 'Teacher');
  assert.equal(out.classId, null);
});

test('only student or teacher accounts can be provisioned', () => {
  assert.throws(() => validateProvisionInput({ role:'admin', email:'a@school.edu', displayName:'Admin', temporaryPassword:'Temp123456!' }), /role/i);
});
