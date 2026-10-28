import test from 'node:test';
import assert from 'node:assert/strict';
import { bootApp } from '../src/app.js';

const CLASS_ID = '11111111-1111-4111-8111-111111111111';
const flush = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

async function harness(t, { rejectRename = false } = {}) {
  const oldDocument = globalThis.document, oldPrompt = globalThis.prompt, oldConfirm = globalThis.confirm;
  t.after(() => { globalThis.document = oldDocument; globalThis.prompt = oldPrompt; globalThis.confirm = oldConfirm; });
  let savedName = 'Old class', staleNext = false;
  const stale = deferred(), rename = deferred(), renders = [];
  const listeners = new Map();
  const root = { set innerHTML(html) { this.html = html; renders.push(html); }, get innerHTML() { return this.html; }, addEventListener:(type, fn) => listeners.set(type, fn) };
  globalThis.document = { getElementById:() => root };
  globalThis.prompt = () => 'New class'; globalThis.confirm = () => true;
  const profiles = [{ id:'admin', role:'admin', active:true, display_name:'Synthetic Admin' }, { id:'student', role:'student', active:true, display_name:'Synthetic Student', school_email:'student@example.test' }, { id:'teacher', role:'teacher', active:true, display_name:'Synthetic Teacher', school_email:'teacher@example.test' }];
  const memberships = [{ student_id:'student', class_id:CLASS_ID, ended_at:null }];
  const assignments = [{ teacher_id:'teacher', class_id:CLASS_ID }];
  const rows = () => [{ id:CLASS_ID, class_name:savedName, active:true }];
  const client = {
    auth:{ getUser:async () => ({ data:{ user:{ id:'admin' } }, error:null }) },
    rpc:() => { throw new Error('Activity is outside this test'); },
    from(table) {
      return {
        select() { return this; }, eq() { return this; }, order() { return this; },
        single:async () => ({ data:profiles[0], error:null }),
        then(resolve, reject) {
          const data = table === 'profiles' ? profiles : table === 'classes' ? rows() : table === 'student_class_memberships' ? memberships : table === 'teacher_classes' ? assignments : [];
          if (table === 'classes' && staleNext) { staleNext = false; return stale.promise.then(resolve,reject); }
          return Promise.resolve({ data, error:null }).then(resolve,reject);
        }
      };
    },
    functions:{ async invoke(_name, { body }) {
      if (body.action !== 'rename_class') return { data:{ ok:true }, error:null };
      await rename.promise;
      if (rejectRename) return { data:null, error:Object.assign(new Error('Edge Function returned a non-2xx status code'), { context:new Response(JSON.stringify({ error:'Unsupported class action.' }), { status:400 }) }) };
      assert.equal(body.classId, CLASS_ID); savedName = body.className;
      return { data:{ ok:true, class:rows()[0] }, error:null };
    } }
  };
  const click = async (action, data = {}) => { const target = { dataset:{ action, ...data }, closest() { return this; } }; await listeners.get('click')({ target }); };
  await bootApp(client); await flush(); await click('admin'); await click('admin-section-classes');
  return { root, click, renders, rename, stale, staleNext:() => { staleNext = true; }, reboot:async () => { await bootApp(client); await flush(); await click('admin'); await click('admin-section-classes'); }, memberships, assignments };
}

test('successful rename survives a late stale refresh, tab navigation and full app reboot', async t => {
  const h = await harness(t);
  assert.match(h.root.innerHTML, /<h3>Old class<\/h3>/);
  h.staleNext();
  await h.click('admin-set-active', { userId:'student', nextActive:'true' }); await flush();
  await h.click('admin-section-classes');
  const pending = h.click('admin-edit-class', { classId:CLASS_ID });
  assert.match(h.root.innerHTML, /<h3>New class<\/h3>/);
  h.rename.resolve(); await pending; await flush();
  const afterSave = h.renders.length;
  h.stale.resolve({ data:[{ id:CLASS_ID, class_name:'Old class', active:true }], error:null }); await flush();
  await h.click('admin-section-accounts'); await h.click('admin-section-classes');
  await h.click('admin-back'); await h.click('admin'); await h.click('admin-section-classes');
  await h.reboot();
  assert.match(h.root.innerHTML, /<h3>New class<\/h3>/);
  assert.ok(h.renders.slice(afterSave).every(html => !html.includes('<h3>Old class</h3>')));
  assert.match(h.root.innerHTML, /Synthetic Student/); assert.match(h.root.innerHTML, /Synthetic Teacher/);
  assert.deepEqual(h.memberships, [{ student_id:'student', class_id:CLASS_ID, ended_at:null }]);
  assert.deepEqual(h.assignments, [{ teacher_id:'teacher', class_id:CLASS_ID }]);
});

test('unsupported deployed rename rolls back optimistic name and shows the backend reason', async t => {
  const h = await harness(t, { rejectRename:true });
  const pending = h.click('admin-edit-class', { classId:CLASS_ID });
  assert.match(h.root.innerHTML, /<h3>New class<\/h3>/);
  h.rename.resolve(); await pending;
  assert.match(h.root.innerHTML, /<h3>Old class<\/h3>/);
  assert.match(h.root.innerHTML, /Unsupported class action\./);
  assert.doesNotMatch(h.root.innerHTML, /Class name updated/);
});
