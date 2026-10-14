import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadActivityClasses,
  loadClassActivity,
  loadStudentActivitySummary,
  loadStudentRecentActivity
} from '../src/api.js';

function fakeClient(result = { data: [], error: null }) {
  const calls = [];
  return {
    calls,
    rpc(name, args) {
      calls.push({ name, args });
      return Promise.resolve(result);
    }
  };
}

test('loadActivityClasses calls the classes RPC', async () => {
  const client = fakeClient({ data: null, error: null });
  assert.deepEqual(await loadActivityClasses(client), []);
  assert.deepEqual(client.calls, [{ name: 'teacher_activity_classes', args: undefined }]);
});

test('loadClassActivity sends class and since args', async () => {
  const client = fakeClient();
  await loadClassActivity(client, 'c1', '2026-10-01T00:00:00.000Z');
  assert.deepEqual(client.calls[0], { name: 'teacher_activity_overview', args: { p_class_id: 'c1', p_since: '2026-10-01T00:00:00.000Z' } });
});

test('loadStudentActivitySummary returns object data', async () => {
  const client = fakeClient({ data: { student_id: 's1' }, error: null });
  assert.deepEqual(await loadStudentActivitySummary(client, 's1', null), { student_id: 's1' });
});

test('loadStudentRecentActivity applies default limit', async () => {
  const client = fakeClient({ data: null, error: null });
  assert.deepEqual(await loadStudentRecentActivity(client, 's1', null), []);
  assert.deepEqual(client.calls[0], { name: 'teacher_activity_student_recent', args: { p_student_id: 's1', p_since: null, p_limit: 40 } });
});

test('helpers throw stable friendly errors', async () => {
  const client = fakeClient({ data: null, error: { message: 'sensitive database detail' } });
  await assert.rejects(() => loadActivityClasses(client), /Unable to load activity classes\./);
});
