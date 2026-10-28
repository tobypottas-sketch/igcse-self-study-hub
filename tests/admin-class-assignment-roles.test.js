import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { validateClassAction } from '../supabase/functions/admin-class-action/validation.js';

const TARGET = '11111111-1111-4111-8111-111111111111';
const CLASS = '22222222-2222-4222-8222-222222222222';
const source = stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/admin-class-action/index.ts', import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');

test('assignment handler accepts active teachers/admins through existing links and rejects inactive accounts/students', async () => {
  for (const [role, active, expectedStatus] of [['teacher',true,200],['admin',true,200],['teacher',false,400],['admin',false,400],['student',true,400]]) {
    const writes = [];
    const account = { id:TARGET, role, active };
    let handler;
    const client = {
      auth:{ getUser:async () => ({ data:{ user:{ id:'synthetic-caller' } }, error:null }) },
      from(table) {
        if (table === 'teacher_classes') return { upsert:async (value, options) => { writes.push({ value, options }); return { error:null }; } };
        assert.ok(['profiles','classes'].includes(table), 'no account or membership mutation');
        let id;
        return { select() { return this; }, eq(_key,value) { id = value; return this; }, single:async () => ({ data:table === 'classes' ? { id:CLASS, active:true } : id === TARGET ? account : { role:'admin', active:true }, error:null }) };
      }
    };
    const env = { SUPABASE_URL:'https://example.test', SUPABASE_PUBLISHABLE_KEYS:'{"default":"test-public"}', SUPABASE_SECRET_KEYS:'{"default":"test-secret"}' };
    new Function('createClient','validateClassAction','Deno',source)(() => client,validateClassAction,{ env:{ get:key => env[key] }, serve:fn => { handler = fn; } });
    const response = await handler(new Request('https://example.test',{ method:'POST', headers:{ Authorization:'Bearer synthetic', 'Content-Type':'application/json' }, body:JSON.stringify({ action:'assign_teacher', teacherId:TARGET, classId:CLASS }) }));
    assert.equal(response.status,expectedStatus,`${active ? 'active' : 'inactive'} ${role}`);
    if (expectedStatus === 200) {
      assert.deepEqual(await response.json(),{ ok:true });
      assert.deepEqual(writes,[{ value:{ teacher_id:TARGET, class_id:CLASS, assigned_by:'synthetic-caller' }, options:{ onConflict:'teacher_id,class_id' } }]);
    } else assert.deepEqual(writes,[]);
    assert.deepEqual(account,{ id:TARGET, role, active },'assignment preserves the account role and privileges');
  }
});
