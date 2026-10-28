import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { bulkProvisionStudents } from '../src/admin/import.js';
import { validateAdminProvisionRequest } from '../supabase/functions/admin-provision-user/validation.js';

test('concurrent identical bulk imports share one Edge Function request', async () => {
  let resolveInvoke;
  const calls = [];
  const client = {
    functions:{
      invoke(name, options) {
        calls.push([name, options]);
        return new Promise(resolve => { resolveInvoke = resolve; });
      }
    }
  };
  const rows = [
    { displayName:'Synthetic One', email:'one@example.test' },
    { displayName:'Synthetic Two', email:'two@example.test' }
  ];

  const first = bulkProvisionStudents(client, 'class-1', rows);
  const second = bulkProvisionStudents(client, 'class-1', rows);

  assert.equal(calls.length, 1, 'only one network request should be in flight for the same import');
  resolveInvoke({ data:{ created:[{ userId:'one' }, { userId:'two' }], failed:[] }, error:null });
  const [firstResult, secondResult] = await Promise.all([first, second]);
  assert.deepEqual(secondResult, firstResult);

  await bulkProvisionStudents(client, 'class-1', rows);
  assert.equal(calls.length, 2, 'a later intentional import should not be permanently cached');
});

test('bulk student provisioning uses bounded concurrency while preserving result order', async () => {
  const functionSource = fs.readFileSync(new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url), 'utf8');
  const students = Array.from({ length:25 }, (_, i) => ({ displayName:`Synthetic ${i}`, email:`student${i}@example.test` }));
  const releases = [];
  let active = 0;
  let peak = 0;
  let handler;
  let clientCount = 0;

  const callerClient = { auth:{ getUser:async () => ({ data:{ user:{ id:'11111111-1111-4111-8111-111111111111' } }, error:null }) } };
  const adminClient = {
    auth:{
      admin:{
        createUser:async ({ email }) => {
          active += 1;
          peak = Math.max(peak, active);
          await new Promise(resolve => releases.push(resolve));
          active -= 1;
          return { data:{ user:{ id:email.split('@')[0] } }, error:null };
        },
        deleteUser:async () => ({ error:null })
      }
    },
    from(table) {
      return {
        select() { return this; },
        eq() { return this; },
        single:async () => ({ data:table === 'classes' ? { id:'22222222-2222-4222-8222-222222222222', active:true } : { role:'admin', active:true }, error:null }),
        insert:async () => ({ error:null }),
        then(resolve, reject) {
          const value = table === 'profiles' ? { data:[], error:null } : { data:null, error:null };
          return Promise.resolve(value).then(resolve, reject);
        }
      };
    }
  };

  const source = stripTypeScriptTypes(functionSource).replace(/^import .*;\n/gm, '');
  const env = { SUPABASE_URL:'https://example.test', SUPABASE_PUBLISHABLE_KEYS:'{"default":"synthetic-public"}', SUPABASE_SECRET_KEYS:'{"default":"synthetic-secret"}' };
  new Function('createClient', 'safeAuthAccountError', 'validateAdminProvisionRequest', 'Deno', source)(
    () => ++clientCount === 1 ? callerClient : adminClient,
    error => error?.message,
    validateAdminProvisionRequest,
    { env:{ get:key => env[key] }, serve:fn => { handler = fn; } }
  );

  const responsePromise = handler(new Request('https://example.test', {
    method:'POST',
    headers:{ Authorization:'Bearer synthetic', 'Content-Type':'application/json' },
    body:JSON.stringify({ action:'bulk_provision_students', classId:'22222222-2222-4222-8222-222222222222', rows:students })
  }));
  const flush = () => new Promise(resolve => setImmediate(resolve));

  try {
    await flush();
    assert.equal(active, 12, 'the first twelve student accounts should start together');
    releases.splice(0).forEach(resolve => resolve());
    await flush();
    assert.equal(active, 12, 'the next twelve should fill the released worker slots');
    releases.splice(0).forEach(resolve => resolve());
    await flush();
    assert.equal(active, 1, 'the final student should run after the first 24');
    releases.splice(0).forEach(resolve => resolve());

    const response = await responsePromise;
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(peak, 12);
    assert.equal(payload.created.length, 25);
    assert.deepEqual(payload.created.map(row => row.email), students.map(row => row.email));
    assert.equal(payload.failed.length, 0);
  } finally {
    for (let i = 0; i < 30; i += 1) {
      releases.splice(0).forEach(resolve => resolve());
      await flush();
    }
    await responsePromise;
  }
});
