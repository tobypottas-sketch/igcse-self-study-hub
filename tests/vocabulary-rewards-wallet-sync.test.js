import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../supabase/sql/rewards-verified-wallet-sync.sql',import.meta.url),'utf8');
test('wallet synchronization uses one row lock across concurrent purchases and funding',()=>{
 assert.match(source,/for update/i);
 assert.match(source,/on conflict \(student_id\) do nothing/i);
 assert.match(source,/insert into public\.vocabulary_reward_wallets/);
 assert.match(source,/update public\.vocabulary_reward_wallets/);
});
test('wallet credit is a cumulative absolute total, not an additive grant',()=>{
 assert.match(source,/set verified_earned_xp\s*=\s*p_verified_earned_xp/i);
 assert.doesNotMatch(source,/verified_earned_xp\s*=\s*verified_earned_xp\s*\+/i);
 assert.match(source,/verified_earned_xp <= p_verified_earned_xp/i);
});
test('wallet will not decrease earned XP, remove spent XP, or fund inactive students',()=>{
 assert.match(source,/p_verified_earned_xp < v_spent/i);
 assert.match(source,/p_verified_earned_xp < v_current/i);
 assert.match(source,/role = 'student' and active = true/i);
 assert.doesNotMatch(source,/set\s+spent_xp\s*=/i);
});
test('wallet sync cannot be invoked by normal students or anonymous users',()=>{
 assert.match(source,/revoke all on function[\s\S]*from public, anon, authenticated/i);
 assert.match(source,/grant execute on function[\s\S]*to service_role/i);
 assert.doesNotMatch(source,/security definer/i);
});
test('migration does not directly fund existing student wallets',()=>{
 assert.doesNotMatch(source,/insert into public\.vocabulary_reward_wallets\s*\([^)]*\)\s*select/i);
 assert.doesNotMatch(source,/update public\.profiles/i);
});
