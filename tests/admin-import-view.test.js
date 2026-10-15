import test from 'node:test';
import assert from 'node:assert/strict';
import { renderAdmin } from '../src/views/admin.js';

const root = () => ({ innerHTML:'' });

test('bulk import section requires class selection and CSV upload', () => {
  const target = root();
  renderAdmin(target, { profile:{display_name:'Admin', role:'admin'}, section:'import', classes:[{id:'c1', className:'G9 ESL', active:true}], accounts:[] });
  assert.match(target.innerHTML, /data-form="admin-preview-import"/);
  assert.match(target.innerHTML, /accept="\.csv,text\/csv"/);
  assert.match(target.innerHTML, /G9 ESL/);
});

test('validated preview shows all errors and only enables provisioning when clean', () => {
  const target = root();
  renderAdmin(target, {
    profile:{display_name:'Admin', role:'admin'}, section:'import', classes:[], accounts:[],
    importPreview:{ classId:'c1', fileName:'class.csv', validRows:[{displayName:'Good', email:'good@x', sourceRow:2}], errors:[{displayName:'Bad', email:'bad', sourceRow:3, reason:'A valid school email is required.'}] }
  });
  assert.match(target.innerHTML, /Row 3/);
  assert.match(target.innerHTML, /valid school email/i);
  assert.doesNotMatch(target.innerHTML, /data-action="admin-run-import"/);
});

test('bulk result renders one-time credential sheet with copy and print controls', () => {
  const target = root();
  renderAdmin(target, {
    profile:{display_name:'Admin', role:'admin'}, section:'import', classes:[], accounts:[],
    bulkResult:{ created:[{userId:'u1', displayName:'Student One', email:'s@x', temporaryPassword:'Secret123!'}], failed:[{displayName:'Two', email:'two@x', reason:'Email already exists.'}] }
  });
  assert.match(target.innerHTML, /Secret123!/);
  assert.match(target.innerHTML, /data-action="admin-copy-credentials"/);
  assert.match(target.innerHTML, /data-action="admin-print-credentials"/);
  assert.match(target.innerHTML, /Email already exists/);
});
