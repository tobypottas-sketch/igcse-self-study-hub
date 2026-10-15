import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateClassAction } from '../supabase/functions/admin-class-action/validation.js';
import { retireClass } from '../src/admin/classes.js';
import { renderAdmin } from '../src/views/admin.js';

const classId = '22222222-2222-4222-8222-222222222222';

test('retire_class validates the target class UUID', () => {
  assert.deepEqual(validateClassAction({ action:'retire_class', classId }), { action:'retire_class', classId });
  assert.throws(() => validateClassAction({ action:'retire_class', classId:'bad' }), /UUID/i);
});

test('retireClass invokes protected class action', async () => {
  const calls = [];
  const client = { functions:{ invoke: async (name, options) => { calls.push([name, options]); return { data:{ ok:true }, error:null }; } } };
  await retireClass(client, classId);
  assert.deepEqual(calls[0], ['admin-class-action', { body:{ action:'retire_class', classId } }]);
});

test('classes view exposes a delete action for active classes', () => {
  const root = { innerHTML:'' };
  renderAdmin(root, {
    profile:{ display_name:'Admin', role:'admin' },
    section:'classes',
    accounts:[],
    classes:[{ id:classId, className:'Pilot Class A', active:true, students:[], teachers:[] }]
  });
  assert.match(root.innerHTML, /data-action="admin-delete-class"/);
  assert.match(root.innerHTML, /data-class-id="22222222-2222-4222-8222-222222222222"/);
  assert.match(root.innerHTML, /data-class-name="Pilot Class A"/);
  assert.match(root.innerHTML, />Delete class</);
});

test('server retire action preserves history while removing active relationships', async () => {
  const source = await readFile(new URL('../supabase/functions/admin-class-action/index.ts', import.meta.url), 'utf8');
  assert.match(source, /input\.action === 'retire_class'/);
  assert.match(source, /student_class_memberships/);
  assert.match(source, /ended_at/);
  assert.match(source, /teacher_classes/);
  assert.match(source, /\.update\(\{ active: false \}\)/);
  assert.doesNotMatch(source, /from\('student_class_memberships'\)\s*\.delete\(\)/);
});

test('app confirms and refreshes after class deletion', async () => {
  const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(source, /admin-delete-class/);
  assert.match(source, /Delete .*class/i);
  assert.match(source, /retireClass/);
  assert.match(source, /Class deleted\./);
});
