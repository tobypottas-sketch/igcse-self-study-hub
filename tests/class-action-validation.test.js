import test from 'node:test';
import assert from 'node:assert/strict';
import { validateClassAction } from '../supabase/functions/admin-class-action/validation.js';

const teacherId = '11111111-1111-4111-8111-111111111111';
const classId = '22222222-2222-4222-8222-222222222222';

test('create_class trims class name', () => {
  assert.deepEqual(validateClassAction({ action:'create_class', className:' G10 English A ' }), { action:'create_class', className:'G10 English A' });
});

test('assign_teacher requires UUIDs', () => {
  assert.throws(() => validateClassAction({ action:'assign_teacher', teacherId:'bad', classId:'bad' }), /UUID/i);
});

test('unassign_teacher validates both UUIDs', () => {
  assert.deepEqual(validateClassAction({ action:'unassign_teacher', teacherId, classId }), { action:'unassign_teacher', teacherId, classId });
  assert.throws(() => validateClassAction({ action:'unassign_teacher', teacherId:'bad', classId }), /UUID/i);
});

test('transfer_student requires student and class UUIDs', () => {
  assert.throws(() => validateClassAction({ action:'transfer_student', studentId:'bad', newClassId:'bad' }), /UUID/i);
});
