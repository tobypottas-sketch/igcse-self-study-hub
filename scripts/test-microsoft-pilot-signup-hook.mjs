import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('Auth signup hook denies Azure account creation and preserves existing provisioning paths', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role; create role supabase_auth_admin;');
    await db.exec(await readFile(new URL('../supabase/migrations/20261126160000_microsoft_pilot_signup_hook.sql', import.meta.url), 'utf8'));
    for (const role of ['anon', 'authenticated', 'service_role']) {
      await db.exec('set role ' + role);
      await assert.rejects(db.query("select public.microsoft_pilot_before_user_created('{}')"), { code: '42501' });
      await db.exec('reset role');
    }
    await db.exec('set role supabase_auth_admin');
    async function invoke(app_metadata, user_metadata = {}) {
      const { rows } = await db.query('select public.microsoft_pilot_before_user_created($1::jsonb) as result',
        [{ user: { app_metadata, user_metadata } }]);
      return rows[0].result;
    }
    assert.equal((await invoke({ provider: 'azure' })).error.http_code, 403);
    assert.equal((await invoke({ providers: ['azure'] })).error.http_code, 403);
    assert.deepEqual(await invoke({ provider: 'email' }, { provider: 'azure' }), {});
    assert.deepEqual(await invoke({ provider: 'email' }), {});
    assert.deepEqual(await invoke({}), {});
  } finally {
    await db.close();
  }
});
