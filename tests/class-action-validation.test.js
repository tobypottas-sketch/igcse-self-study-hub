import test from 'node:test';
import assert from 'node:assert/strict';
import { validateClassAction } from '../supabase/functions/admin-class-action/validation.js';

test('create_class trims class name', () => {
  assert.deepEqual(validateClassAction({ action:'create_class', className:' G10 English A ' }), { action:'create_class', className:'G10 English A' });
});

test('assign_teacher requires UUIDs', () => {
  assert.throws(() => validateClassAction({ action:'assign_teacher', teacherId:'bad', classId:'bad' }), /UUID/i);
});

test('transfer_student requires student and class UUIDs', () => {
  assert.throws(() => validateClassAction({ action:'transfer_student', studentId:'bad', newClassId:'bad' }), /UUID/i);
});
