import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { validateClassAction } from '../supabase/functions/admin-class-action/validation.js';

const CLASS_ID = '11111111-1111-4111-8111-111111111111';
// Run the real Edge handler, replacing only its SDK/environment boundaries.
const source = stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/admin-class-action/index.ts', import.meta.url), 'utf8'))
  .replace(/^import .*;\n/gm, '');

async function renameRequest({ writeError = null, active = true } = {}) {
  const row = { id:CLASS_ID, class_name:'Old class', active };
  const memberships = [{ student_id:'synthetic-student', class_id:CLASS_ID }];
  const assignments = [{ teacher_id:'synthetic-teacher', class_id:CLASS_ID }];
  const writes = [];
  let handler;
  const client = {
    auth:{ getUser:async () => ({ data:{ user:{ id:'synthetic-admin' } }, error:null }) },
    from(table) {
      if (table === 'profiles') return { select() { return this; }, eq() { return this; }, single:async () => ({ data:{ role:'admin', active:true }, error:null }) };
      assert.equal(table, 'classes', 'rename must not mutate membership or assignment tables');
      let patch;
      const filters = new Map();
      return {
        update(value) { patch = value; return this; },
        eq(key, value) { filters.set(key,value); return this; },
        select() { return this; },
        maybeSingle:async () => {
          if (writeError) return { data:null, error:writeError };
          assert.deepEqual([...filters], [['id',CLASS_ID],['active',true]]);
          if (!row.active) return { data:null, error:null };
          assert.deepEqual(patch, { class_name:'New class' });
          Object.assign(row,patch); writes.push(patch);
          return { data:{ ...row }, error:null };
        }
      };
    }
  };
  const env = { SUPABASE_URL:'https://example.test', SUPABASE_PUBLISHABLE_KEYS:'{"default":"test-public"}', SUPABASE_SECRET_KEYS:'{"default":"test-secret"}' };
  new Function('createClient', 'validateClassAction', 'Deno', source)(() => client, validateClassAction, { env:{ get:key => env[key] }, serve:fn => { handler = fn; } });
  const response = await handler(new Request('https://example.test', { method:'POST', headers:{ Authorization:'Bearer synthetic', 'Content-Type':'application/json' }, body:JSON.stringify({ action:'rename_class', classId:CLASS_ID, className:'New class' }) }));
  return { response, payload:await response.json(), row, writes, memberships, assignments };
}

test('backend rename updates only class_name on the existing active class and returns the saved row', async () => {
  const result = await renameRequest();
  assert.equal(result.response.status, 200);
  assert.deepEqual(result.payload, { ok:true, class:{ id:CLASS_ID, class_name:'New class', active:true } });
  assert.equal(result.row.class_name, 'New class');
  assert.equal(result.writes.length, 1);
  assert.deepEqual(result.memberships, [{ student_id:'synthetic-student', class_id:CLASS_ID }]);
  assert.deepEqual(result.assignments, [{ teacher_id:'synthetic-teacher', class_id:CLASS_ID }]);
});

test('backend rename reports database errors and missing/inactive rows without claiming success', async () => {
  for (const [input, status, error] of [[{ writeError:{ message:'Synthetic database error' } },400,'Synthetic database error'], [{ active:false },404,'Class not found or inactive']]) {
    const result = await renameRequest(input);
    assert.equal(result.response.status,status);
    assert.deepEqual(result.payload,{ error });
    assert.equal(result.row.class_name,'Old class');
    assert.deepEqual(result.writes,[]);
  }
});
