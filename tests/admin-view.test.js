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

test('accounts section renders manual create forms and lifecycle controls', () => {
  const target = root();
  renderAdmin(target, {
    profile: { display_name: 'Admin', role: 'admin' },
    section: 'accounts',
    classes: [{ id:'c1', className:'G9 ESL', active:true }],
    accounts: [
      { id:'s1', displayName:'Student <script>x</script>', email:'s@example.com', role:'student', active:true, currentClass:'G9 ESL', assignedClasses:[] },
      { id:'t1', displayName:'Teacher', email:'t@example.com', role:'teacher', active:false, currentClass:'', assignedClasses:[] }
    ]
  });
  assert.match(target.innerHTML, /data-form="admin-create-student"/);
  assert.match(target.innerHTML, /data-form="admin-create-teacher"/);
  assert.match(target.innerHTML, /data-action="admin-reset-password"/);
  assert.match(target.innerHTML, /data-action="admin-set-active"/);
  assert.match(target.innerHTML, /G9 ESL/);
  assert.doesNotMatch(target.innerHTML, /<script>x<\/script>/);
});

test('accounts section shows a one-time credential without persisting it into navigation controls', () => {
  const target = root();
  renderAdmin(target, {
    profile: { display_name:'Admin', role:'admin' },
    section:'accounts',
    accounts: [],
    classes: [],
    credential: { displayName:'Student One', email:'s@example.com', temporaryPassword:'OneTime123!' }
  });
  assert.match(target.innerHTML, /OneTime123!/);
  assert.match(target.innerHTML, /one-time/i);
  assert.doesNotMatch(target.innerHTML, /data-action="admin-back"[^>]*OneTime123!/);
});
