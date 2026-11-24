import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
let PGlite;
try { ({PGlite}=require('@electric-sql/pglite')); } catch (error) {
  if (error.code!=='MODULE_NOT_FOUND') throw error;
}
const fixture='10000000-0000-4000-8000-000000000001';
const other='10000000-0000-4000-8000-000000000002';
const starter='avatar-pixel-bot';
const premium='avatar-voxel-architect';

test('Avatar migration preserves server-only, isolated wallet and equipment transactions', {skip:!PGlite}, async t=>{
  const db=new PGlite();
  t.after(()=>db.close());
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role;
    create schema auth;
    create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid$$;
    grant usage on schema auth to authenticated;
    create table public.profiles(id uuid primary key,role text not null,active boolean not null);
  `);
  for (const path of ['docs/vocabulary-rewards/phase-2-wallet-schema.sql',
    'docs/vocabulary-rewards/phase-3-sandbox.sql',
    'supabase/sql/premium-collections-five-slot-foundation.sql',
    'supabase/migrations/20261124120000_vocabulary_player_avatars.sql']) {
    const sql=readFileSync(new URL('../'+path,import.meta.url),'utf8');
    // The historical foundation seeds Pixel Badge before adding its category.
    const bootstrap=path.endsWith('phase-2-wallet-schema.sql')
      ? sql.replace("('pixel-badge','Pixel Badge','badges'", "('pixel-badge','Pixel Badge','frames'") : sql;
    await db.exec(bootstrap);
  }
  const scalar=async (sql,args=[]) => Object.values((await db.query(sql,args)).rows[0])[0];
  const rpc=(fn,id=fixture,value=starter)=>scalar(`select public.${fn}($1::uuid,$2::text)`,[id,value]);
  const equipment=table=>scalar(`select array_agg(reward_id order by reward_id)
    from public.${table} where student_id=$1 and equipped`,[fixture]);
  await db.exec(`
    insert into public.profiles values ('${fixture}','student',true), ('${other}','student',true);
    insert into public.vocabulary_reward_wallets(student_id) values ('${fixture}'), ('${other}');
    insert into public.vocabulary_reward_sandbox_wallets(student_id,granted_xp,enabled)
      values ('${fixture}',1200,true), ('${other}',1200,false);
    update public.vocabulary_reward_catalog set enabled=true where reward_id='gold-frame';
  `);
  assert.deepEqual(await rpc('redeem_vocabulary_reward'),{status:'purchased',balance:0});
  assert.deepEqual(await rpc('redeem_vocabulary_reward'),{status:'owned',balance:0});
  assert.equal(await scalar('select count(*)::int from public.vocabulary_reward_purchases'),1);
  await assert.rejects(rpc('redeem_vocabulary_reward',fixture,premium),/Not enough available XP/);
  await assert.rejects(rpc('equip_vocabulary_reward',other,starter),/not owned/i);
  await assert.rejects(rpc('equip_vocabulary_reward',fixture,premium),/not owned/i);
  await assert.rejects(rpc('redeem_vocabulary_sandbox_reward',other),/Sandbox unavailable/);
  assert.deepEqual(await rpc('redeem_vocabulary_sandbox_reward'),{status:'purchased',balance:1200});
  assert.deepEqual(await rpc('redeem_vocabulary_sandbox_reward'),{status:'owned',balance:1200});
  assert.deepEqual(await rpc('redeem_vocabulary_sandbox_reward',fixture,premium),{status:'purchased',balance:0});
  await rpc('equip_vocabulary_sandbox_reward',fixture,premium);
  assert.equal(await scalar('select spent_xp::int from public.vocabulary_reward_wallets where student_id=$1',[fixture]),0);
  assert.equal(await equipment('vocabulary_reward_owned'),null);

  await db.query('update public.vocabulary_reward_wallets set verified_earned_xp=2000 where student_id=$1',[fixture]);
  await rpc('redeem_vocabulary_reward',fixture,'gold-frame');
  await rpc('equip_vocabulary_reward',fixture,'gold-frame');
  await rpc('equip_vocabulary_reward');
  assert.deepEqual(await rpc('redeem_vocabulary_reward',fixture,premium),{status:'purchased',balance:0});
  assert.deepEqual(await rpc('redeem_vocabulary_reward',fixture,premium),{status:'owned',balance:0});
  await rpc('equip_vocabulary_reward',fixture,premium);
  assert.deepEqual(await equipment('vocabulary_reward_owned'),[premium,'gold-frame']);
  await rpc('unequip_vocabulary_reward',fixture,'avatars');
  assert.deepEqual(await equipment('vocabulary_reward_owned'),['gold-frame']);
  assert.deepEqual(await equipment('vocabulary_reward_sandbox_owned'),[premium]);
  await rpc('unequip_vocabulary_sandbox_reward',fixture,'avatars');
  assert.equal(await equipment('vocabulary_reward_sandbox_owned'),null);

  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${other}',false);`);
  assert.equal(await scalar('select count(*)::int from public.vocabulary_reward_owned'),0);
  await assert.rejects(rpc('equip_vocabulary_reward',fixture,premium),/permission denied/);
  await assert.rejects(rpc('unequip_vocabulary_reward',fixture,'avatars'),/permission denied/);
  await assert.rejects(rpc('redeem_vocabulary_sandbox_reward',fixture,premium),/permission denied/);
});
