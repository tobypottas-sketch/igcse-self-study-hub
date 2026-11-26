import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('Auth signup hook denies Azure account creation and preserves existing provisioning paths', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role; create role supabase_auth_admin;
      create schema auth;
      create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
      create table auth.identities (user_id uuid references auth.users, provider text, identity_data jsonb);
      create table public.profiles (id uuid primary key, school_email text, role text, active boolean, must_change_password boolean);
      grant usage on schema auth to supabase_auth_admin;
      grant insert, update, select on auth.identities to supabase_auth_admin;
    `);
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
    await db.exec('reset role');
    const approved = '1d440a5c-35f2-48b4-8fd4-5042af992eac';
    const unapproved = 'c2c5bdfd-e91e-4d46-bb14-91bb839ab007';
    for (const id of [approved, unapproved]) {
      await db.query("insert into auth.users values ($1,'admin@example.test',now())", [id]);
      await db.query("insert into public.profiles values ($1,'admin@example.test','admin',true,false)", [id]);
    }
    await db.query("insert into microsoft_pilot_private.allowed_accounts values ($1,'admin@example.test')", [approved]);
    await db.exec('set role supabase_auth_admin');
    const addIdentity = (id, email, verified, provider = 'azure') =>
      db.query('insert into auth.identities values ($1,$2,$3)', [id, provider, { email, email_verified: verified }]);
    await assert.rejects(addIdentity(unapproved, 'admin@example.test', true), { code: '42501' });
    await assert.rejects(addIdentity(approved, 'other@example.test', true), { code: '42501' });
    await assert.rejects(addIdentity(approved, 'admin@example.test', false), { code: '42501' });
    await addIdentity(approved, 'admin@example.test', true);
    await addIdentity(unapproved, 'admin@example.test', true, 'email');
    await assert.rejects(db.query("update auth.identities set user_id=$1 where provider='azure'", [unapproved]), { code: '42501' });
  } finally {
    await db.close();
  }
});
