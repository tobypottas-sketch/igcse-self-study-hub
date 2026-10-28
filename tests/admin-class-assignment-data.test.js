import test from 'node:test';
import assert from 'node:assert/strict';
import { bootApp } from '../src/app.js';

test('Classes receives active teacher/admin candidates from the real admin loader without adding admins to Accounts', async t => {
  const profiles = [
    { id:'caller', display_name:'Synthetic Caller', school_email:'caller@example.test', role:'admin', active:true },
    { id:'teacher', display_name:'Synthetic Teacher', school_email:'teacher@example.test', role:'teacher', active:true },
    { id:'admin', display_name:'Synthetic Admin', school_email:'admin@example.test', role:'admin', active:true },
    { id:'inactive-teacher', display_name:'Inactive Teacher', role:'teacher', active:false },
    { id:'inactive-admin', display_name:'Inactive Admin', role:'admin', active:false },
    { id:'student', display_name:'Synthetic Student', school_email:'student@example.test', role:'student', active:true }
  ];
  const listeners = new Map();
  let holdRefresh = false;
  const root = { innerHTML:'', addEventListener:(type, fn) => listeners.set(type,fn) };
  const previous = globalThis.document;
  t.after(() => { globalThis.document = previous; });
  globalThis.document = { getElementById:() => root };
  const client = {
    auth:{ getUser:async () => ({ data:{ user:{ id:'caller' } }, error:null }) },
    rpc() { throw new Error('Activity is outside this test'); },
    functions:{ invoke:async () => ({ data:{ ok:true }, error:null }) },
    from(table) { return {
      select() { return this; }, eq() { return this; }, order() { return this; },
      single:async () => ({ data:profiles[0], error:null }),
      then(resolve,reject) { return (holdRefresh ? new Promise(() => {}) : Promise.resolve({ data:table === 'profiles' ? profiles : [], error:null })).then(resolve,reject); }
    }; }
  };
  const click = async (action, data = {}) => { const target = { dataset:{ action, ...data }, closest() { return this; } }; await listeners.get('click')({ target }); };
  await bootApp(client);
  await click('admin');
  await click('admin-section-classes');
  const options = root.innerHTML.match(/<select name="teacherId" required>([\s\S]*?)<\/select>/)?.[1] ?? '';
  assert.match(options, /value="teacher"/);
  assert.match(options, /value="admin">Synthetic Admin — admin@example\.test \(Admin\)/);
  assert.doesNotMatch(options, /value="(?:inactive-teacher|inactive-admin|student)"/);
  await click('admin-section-accounts');
  assert.doesNotMatch(root.innerHTML, /data-user-id="(?:caller|admin|inactive-admin)"/);
  holdRefresh = true;
  await click('admin-set-active', { userId:'teacher', nextActive:'false' });
  await click('admin-section-classes');
  const updatedOptions = root.innerHTML.match(/<select name="teacherId" required>([\s\S]*?)<\/select>/)?.[1] ?? '';
  assert.doesNotMatch(updatedOptions, /value="teacher"/, 'deactivation takes effect before the background refresh resolves');
  assert.match(updatedOptions, /value="admin"/);
});
