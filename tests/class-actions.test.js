import test from 'node:test';
import assert from 'node:assert/strict';
import { createClass, assignTeacherToClass, unassignTeacherFromClass, transferStudent } from '../src/admin/classes.js';

function fakeClient() {
  const calls = [];
  return { calls, functions: { invoke: async (name, options) => { calls.push([name, options]); return { data: { ok: true }, error: null }; } } };
}

test('createClass invokes protected class action', async () => {
  const client = fakeClient();
  await createClass(client, 'G10 English A');
  assert.deepEqual(client.calls[0], ['admin-class-action', { body: { action: 'create_class', className: 'G10 English A' } }]);
});

test('assignTeacherToClass invokes protected class action', async () => {
  const client = fakeClient();
  await assignTeacherToClass(client, 'teacher-id', 'class-id');
  assert.equal(client.calls[0][1].body.action, 'assign_teacher');
});

test('unassignTeacherFromClass invokes only the selected relationship action', async () => {
  const client = fakeClient();
  await unassignTeacherFromClass(client, 'teacher-id', 'class-id');
  assert.deepEqual(client.calls[0][1].body, { action: 'unassign_teacher', teacherId: 'teacher-id', classId: 'class-id' });
});

test('transferStudent invokes protected atomic transfer action', async () => {
  const client = fakeClient();
  await transferStudent(client, 'student-id', 'new-class-id');
  assert.deepEqual(client.calls[0][1].body, { action: 'transfer_student', studentId: 'student-id', newClassId: 'new-class-id' });
});
