import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { validateAdminProvisionRequest } from '../supabase/functions/admin-provision-user/validation.js';

const CLASS_ID = '22222222-2222-4222-8222-222222222222';
const STUDENT_ID = '33333333-3333-4333-8333-333333333333';
const source = stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url), 'utf8'))
  .replace(/^import .*;\n/gm, '');

async function provisionStudent() {
  let handler;
  let passwordUsed = '';
  let profileInsert = null;
  let createClientCount = 0;
  const callerClient = {
    auth:{ getUser:async () => ({ data:{ user:{ id:'synthetic-admin' } }, error:null }) }
  };
  const adminClient = {
    auth:{ admin:{
      createUser:async ({ password }) => { passwordUsed = password; return { data:{ user:{ id:STUDENT_ID } }, error:null }; },
      deleteUser:async () => ({ error:null })
    } },
    from(table) {
      if (table === 'profiles' && profileInsert == null) {
        let mode = 'caller';
        return {
          select() { return this; },
          eq() { return this; },
          single:async () => ({ data:{ role:'admin', active:true }, error:null }),
          insert(value) { mode = 'insert'; profileInsert = value; return Promise.resolve({ error:null }); }
        };
      }
      if (table === 'classes') return { select() { return this; }, eq() { return this; }, single:async () => ({ data:{ id:CLASS_ID, active:true }, error:null }) };
      if (table === 'profiles') return { insert:async value => { profileInsert = value; return { error:null }; } };
      if (table === 'student_class_memberships') return { insert:async () => ({ error:null }) };
      throw new Error(`Unexpected table ${table}`);
    }
  };
  const createClient = () => (++createClientCount === 1 ? callerClient : adminClient);
  const env = { SUPABASE_URL:'https://example.test', SUPABASE_PUBLISHABLE_KEYS:'{"default":"test-public"}', SUPABASE_SECRET_KEYS:'{"default":"test-secret"}' };
  new Function('createClient', 'safeAuthAccountError', 'validateAdminProvisionRequest', 'Deno', source)(createClient, error => error?.message ?? 'error', validateAdminProvisionRequest, { env:{ get:key => env[key] }, serve:fn => { handler = fn; } });
  const response = await handler(new Request('https://example.test', { method:'POST', headers:{ Authorization:'Bearer synthetic', 'Content-Type':'application/json' }, body:JSON.stringify({ action:'provision', role:'student', email:'student@example.test', displayName:'Synthetic Student', classId:CLASS_ID }) }));
  return { payload:await response.json(), passwordUsed, profileInsert };
}

test('new student gets a readable permanent password and no forced first-login change', async () => {
  const result = await provisionStudent();
  assert.match(result.payload.temporaryPassword, /^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/);
  assert.equal(result.passwordUsed, result.payload.temporaryPassword);
  assert.equal(/[!@#$%*_-]/.test(result.payload.temporaryPassword), false);
  assert.equal(result.profileInsert.must_change_password, false);
});
