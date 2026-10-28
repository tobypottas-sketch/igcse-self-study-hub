import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { renderLoginCards } from '../src/admin/credential-print.js';
import { validateAdminProvisionRequest } from '../supabase/functions/admin-provision-user/validation.js';

const credentialCss = fs.readFileSync(new URL('../credential-print.css', import.meta.url), 'utf8');
const functionSource = fs.readFileSync(new URL('../supabase/functions/admin-provision-user/index.ts', import.meta.url), 'utf8');

test('login-card modal explicitly overrides the legacy admin print visibility rule', () => {
  assert.match(credentialCss, /\.student-login-modal,\.student-login-modal \*\{visibility:visible!important\}/);
});

for (const [count, expectedPages] of [[0, []], [1, [1]], [10, [10]], [11, [10, 1]], [20, [10, 10]], [21, [10, 10, 1]], [24, [10, 10, 4]]]) {
  test(`${count} credentials paginate without losing or duplicating cards`, () => {
    const credentials = Array.from({ length:count }, (_, i) => ({ displayName:`Synthetic ${i}`, email:`student${i}@example.test`, temporaryPassword:`Synthetic${i}Pass` }));
    const html = renderLoginCards(credentials, 'Synthetic class');
    const pages = [...html.matchAll(/<section class="student-login-page">([\s\S]*?)<\/section>/g)].map(match => match[1]);
    assert.deepEqual(pages.map(page => [...page.matchAll(/<article class="student-login-card">/g)].length), expectedPages);
    assert.deepEqual([...html.matchAll(/<h3>(.*?)<\/h3>/g)].map(match => match[1]), credentials.map(row => row.displayName));
  });
}

test('class credentials run twelve at a time and retain per-student failures', async () => {
  const students = Array.from({ length:25 }, (_, i) => ({ id:`student-${i}`, display_name:`Synthetic ${i}`, school_email:`student${i}@example.test`, role:'student', active:true }));
  const releases = [];
  const flags = [];
  let active = 0, peak = 0, handler, clientCount = 0;
  const callerClient = { auth:{ getUser:async () => ({ data:{ user:{ id:'synthetic-admin' } }, error:null }) } };
  const adminClient = {
    auth:{ admin:{ updateUserById:async id => {
      active += 1; peak = Math.max(peak, active);
      await new Promise(resolve => releases.push(resolve));
      active -= 1;
      return { error:id === 'student-3' ? new Error('Synthetic failure') : null };
    } } },
    from(table) {
      let update;
      return {
        select() { return this; },
        eq(_key, id) { if (update) flags.push({ id, ...update }); return this; },
        single:async () => ({ data:table === 'classes' ? { active:true } : { role:'admin', active:true }, error:null }),
        is:async () => ({ data:students.map(student => ({ student_id:student.id })), error:null }),
        in:async () => ({ data:students, error:null }),
        update(value) { update = value; return this; },
        then(resolve, reject) { return Promise.resolve({ error:null }).then(resolve, reject); }
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
  const response = handler(new Request('https://example.test', { method:'POST', headers:{ Authorization:'Bearer synthetic', 'Content-Type':'application/json' }, body:JSON.stringify({ action:'issue_class_credentials', classId:'22222222-2222-4222-8222-222222222222' }) }));
  const flush = () => new Promise(resolve => setImmediate(resolve));
  try {
    await flush();
    assert.equal(active, 12, 'the first twelve students start together');
    releases.splice(0).forEach(resolve => resolve());
    await flush();
    assert.equal(active, 12, 'the next twelve students start as slots become free');
    releases.splice(0).forEach(resolve => resolve());
    await flush();
    assert.equal(active, 1);
    releases.splice(0).forEach(resolve => resolve());
    const result = await response;
    const payload = await result.json();
    assert.equal(result.status, 200);
    assert.equal(peak, 12);
    assert.equal(payload.ok, false);
    assert.deepEqual(payload.created.map(row => row.userId), students.filter(row => row.id !== 'student-3').map(row => row.id));
    assert.equal(new Set(payload.created.map(row => row.temporaryPassword)).size, 24);
    assert.deepEqual(payload.failed.map(row => row.userId), ['student-3']);
    assert.ok(flags.some(row => row.id === 'student-3' && row.must_change_password === true));
  } finally {
    for (let i = 0; i < 25; i += 1) { releases.splice(0).forEach(resolve => resolve()); await flush(); }
    await response;
  }
});
