import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../supabase/functions/vocabulary-reward-production/index.ts',import.meta.url),'utf8');
test('production status checks authenticated active student account',()=>{
 assert.match(source,/auth\.getUser\(token\)/);
 assert.match(source,/profile\?\.role!=='student'/);
 assert.match(source,/profile\?\.active!==true/);
});
test('production release gate does not fund wallet or permit buying',()=>{
 assert.match(source,/if\(action!=='status'\)/);
 assert.match(source,/purchasesEnabled:false/);
 assert.match(source,/readOnly:true/);
 assert.doesNotMatch(source,/\.rpc\(|\.insert\(|\.update\(|\.upsert\(|redeem_vocabulary_reward\(/);
});
test('real wallet is distinct from sandbox and negative balances fail closed',()=>{
 assert.match(source,/from\('vocabulary_reward_wallets'\)/);
 assert.match(source,/from\('vocabulary_reward_owned'\)/);
 assert.match(source,/from\('vocabulary_reward_catalog'\)/);
 assert.doesNotMatch(source,/from\('vocabulary_reward_sandbox_wallets'\)/);
 assert.match(source,/spent>earned/);
 assert.match(source,/not_initialized/);
});
test('production endpoint never sends identifying account data or secret keys',()=>{
 assert.doesNotMatch(source,/display_name|school_email/);
 assert.doesNotMatch(source,/SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEYS/);
 assert.match(source,/Cache-Control':'no-store'/);
});
