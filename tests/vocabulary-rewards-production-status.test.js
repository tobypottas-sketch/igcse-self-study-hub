import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../supabase/functions/vocabulary-reward-production/index.ts',import.meta.url),'utf8');
test('real production shop requires an active authenticated student',()=>{
 assert.match(source,/auth\.getUser\(token\)/);
 assert.match(source,/profile\?\.role!=='student'/);
 assert.match(source,/profile\?\.active!==true/);
});
test('real purchase and equip use separate server-only atomic RPCs, never browser XP',()=>{
 assert.match(source,/\['status','buy','equip','unequip'\]/);
 assert.match(source,/redeem_vocabulary_reward/);
 assert.match(source,/equip_vocabulary_reward/);
 assert.match(source,/service\.rpc\(method,\{p_student_id:studentId,p_reward_id:rewardId\}\)/);
 assert.match(source,/listed\.enabled!==true/);
 assert.doesNotMatch(source,/body\.(studentId|student_id|xp|price)/);
 assert.doesNotMatch(source,/vocabulary_reward_sandbox_wallets|vocabulary_reward_sandbox_owned/);
});
test('catalogue release flag prevents purchase before a reward is enabled',()=>{
 assert.match(source,/\.eq\('enabled',true\)/);
 assert.match(source,/error:'Reward not available'/);
 assert.match(source,/purchasesEnabled:true/);
 assert.match(source,/walletStatus:wallet\.data\?'ready':'not_initialized'/);
 assert.match(source,/spent>earned/);
});
test('real shop never exposes privileged service secrets or student identities',()=>{
 assert.doesNotMatch(source,/display_name|school_email/);
 assert.match(source,/Cache-Control':'no-store'/);
 assert.match(source,/serviceKey=configuredKey/);
});
