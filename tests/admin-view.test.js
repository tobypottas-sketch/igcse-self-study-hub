import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessAdmin, renderAdminAccounts } from '../src/views/admin.js';

test('admin accounts access is admin only', () => {
  assert.equal(canAccessAdmin({ role: 'admin' }), true);
  assert.equal(canAccessAdmin({ role: 'teacher' }), false);
  assert.equal(canAccessAdmin({ role: 'student' }), false);
});

test('admin screen renders class and student forms with escaped class labels', () => {
  const root = { innerHTML: '' };
  renderAdminAccounts(root, { role: 'admin', display_name: 'Admin' }, [
    { class_id: 'class-1', class_name: '<script>bad()</script>' }
  ]);

  assert.match(root.innerHTML, /data-form="admin-create-class"/);
  assert.match(root.innerHTML, /data-form="admin-create-student"/);
  assert.match(root.innerHTML, /name="displayName"/);
  assert.match(root.innerHTML, /name="email"/);
  assert.match(root.innerHTML, /name="temporaryPassword"/);
  assert.match(root.innerHTML, /name="classId"/);
  assert.match(root.innerHTML, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.doesNotMatch(root.innerHTML, /<script>/i);
  assert.match(root.innerHTML, /data-action="admin-home"/);
});

test('admin screen shows friendly success feedback without echoing passwords', () => {
  const root = { innerHTML: '' };
  renderAdminAccounts(root, { role: 'admin' }, [], { message: 'Student account created.', tone: 'success' });
  assert.match(root.innerHTML, /Student account created\./);
  assert.doesNotMatch(root.innerHTML, /temporaryPassword/);
});
