import test from 'node:test';
import assert from 'node:assert/strict';
import { renderAdmin } from '../src/views/admin.js';

function root() { return { innerHTML: '' }; }

test('admin shell renders Accounts, Classes, Bulk Import and Back to Hub', () => {
  const target = root();
  renderAdmin(target, { profile: { display_name: 'Admin <img src=x onerror=alert(1)>', role: 'admin' }, section: 'accounts' });
  assert.match(target.innerHTML, /Accounts/);
  assert.match(target.innerHTML, /Classes/);
  assert.match(target.innerHTML, /Bulk Import/);
  assert.match(target.innerHTML, /data-action="admin-back"/);
  assert.doesNotMatch(target.innerHTML, /<img src=x onerror=/);
  assert.match(target.innerHTML, /Admin &lt;img src=x onerror=alert\(1\)&gt;/);
});

test('admin shell marks only the selected section active', () => {
  const target = root();
  renderAdmin(target, { profile: { display_name: 'Admin', role: 'admin' }, section: 'classes' });
  assert.match(target.innerHTML, /data-action="admin-section-classes"[^>]*aria-current="page"/);
  assert.doesNotMatch(target.innerHTML, /data-action="admin-section-accounts"[^>]*aria-current="page"/);
});
