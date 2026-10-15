import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderAdmin } from '../src/views/admin.js';

const root = () => ({ innerHTML:'' });

test('admin view escapes hostile names, emails, class names and server messages', () => {
  const target = root();
  renderAdmin(target, {
    profile:{ display_name:'Admin', role:'admin' }, section:'accounts',
    notice:'Bad <img src=x onerror=alert(1)>',
    classes:[{ id:'c1', className:'<img src=x onerror=1>', active:true }],
    accounts:[{ id:'s1', displayName:'<script>alert(1)</script>', email:'<img src=x onerror=2>@x.test', role:'student', active:true, currentClass:'<b>Class</b>', assignedClasses:[] }]
  });
  assert.doesNotMatch(target.innerHTML, /<script>|<img src=x|<b>Class<\/b>/);
  assert.match(target.innerHTML, /&lt;script&gt;/);
  assert.match(target.innerHTML, /&lt;img src=x/);
});

test('bulk credential state is not written to browser persistence or URL storage', async () => {
  const [app, adminView, importer] = await Promise.all([
    readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/admin.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/admin/import.js', import.meta.url), 'utf8')
  ]);
  const combined = `${app}\n${adminView}\n${importer}`;
  assert.doesNotMatch(combined, /localStorage|sessionStorage/);
  assert.doesNotMatch(combined, /location\.(hash|search).*temporaryPassword|URLSearchParams.*temporaryPassword/s);
});

test('admin Edge Functions independently enforce active admin authorization', async () => {
  const [accountsFn, classFn] = await Promise.all([
    readFile(new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/functions/admin-class-action/index.ts', import.meta.url), 'utf8')
  ]);
  for (const source of [accountsFn, classFn]) {
    assert.match(source, /callerProfile\?\.active/);
    assert.match(source, /callerProfile\.role !== 'admin'/);
    assert.match(source, /Admin access required/);
  }
});

test('student provisioning checks the target class is active on the server', async () => {
  const accountsFn = await readFile(new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url), 'utf8');
  assert.match(accountsFn, /input\.action === 'provision' && input\.role === 'student'/);
  assert.match(accountsFn, /Class is not active/);
});

test('bulk existing-email detection normalizes stored profile emails case-insensitively', async () => {
  const accountsFn = await readFile(new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url), 'utf8');
  assert.match(accountsFn, /select\('school_email'\)/);
  assert.match(accountsFn, /String\(item\.school_email\)\.toLowerCase\(\)/);
  assert.doesNotMatch(accountsFn, /\.in\('school_email', emails\)/);
});

test('bulk import sends identity rows, not uploaded file contents or learning work fields', async () => {
  const importer = await readFile(new URL('../src/admin/import.js', import.meta.url), 'utf8');
  assert.match(importer, /displayName/);
  assert.match(importer, /email/);
  assert.doesNotMatch(importer, /essay|answer|teacherNote|studentNote|promptText/i);
});
