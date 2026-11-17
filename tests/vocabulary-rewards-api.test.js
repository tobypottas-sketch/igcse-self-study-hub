import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const api=fs.readFileSync(new URL('../supabase/functions/vocabulary-reward-shop/index.ts',import.meta.url),'utf8');
const audit=fs.readFileSync(new URL('../supabase/functions/vocabulary-reward-xp-audit/index.ts',import.meta.url),'utf8');
const sql=fs.readFileSync(new URL('../docs/vocabulary-rewards/phase-2-wallet-schema.sql',import.meta.url),'utf8');

test('both Edge endpoints require verified user tokens and active student accounts',()=>{
  for(const source of [api,audit]){
    assert.match(source,/\.auth\.getUser\(/);
    assert.match(source,/profile\?\.role\s*!==\s*'student'/);
    assert.match(source,/profile\?\.active\s*!==\s*true/);
    assert.match(source,/['"]Cache-Control['"]\s*:\s*['"]no-store['"]/);
  }
});

test('shop never accepts a browser-provided student or purchase price',()=>{
  assert.match(api,/const userId=identity\.user\.id/);
  assert.match(api,/p_student_id:userId,p_reward_id:rewardId/);
  assert.doesNotMatch(api,/p_student_id\s*:\s*body/);
  assert.doesNotMatch(api,/p_(?:price|xp|amount)\s*:/i);
  assert.doesNotMatch(api,/\.insert\(|\.update\(|\.delete\(/);
});

test('no service-role access or purchases unless server flag is explicitly true',()=>{
  assert.match(api,/Deno\.env\.get\('VOCAB_REWARDS_ENABLE_PURCHASES'\)!=='true'/);
  const flagAt=api.indexOf("Deno.env.get('VOCAB_REWARDS_ENABLE_PURCHASES')!=='true'");
  const keyAt=api.indexOf("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')");
  const rpcAt=api.indexOf('await admin.rpc(');
  assert.ok(flagAt>=0 && keyAt>flagAt && rpcAt>keyAt);
  assert.match(sql,/grant execute on function public\.redeem_vocabulary_reward\(uuid,text\) to service_role/);
  assert.match(sql,/grant execute on function public\.equip_vocabulary_reward\(uuid,text\) to service_role/);
  assert.doesNotMatch(sql,/grant execute on function public\.redeem_vocabulary_reward\([^)]*\) to authenticated/);
  assert.doesNotMatch(sql,/returns jsonb language plpgsql security definer/);
});

test('audit cannot fund the wallet or spend from it',()=>{
  assert.match(audit,/auditOnly:true/);
  assert.doesNotMatch(audit,/\.rpc\(|\.insert\(|\.update\(|\.delete\(/);
  assert.doesNotMatch(audit,/SERVICE_ROLE_KEY|redeem_vocabulary_reward/);
});
