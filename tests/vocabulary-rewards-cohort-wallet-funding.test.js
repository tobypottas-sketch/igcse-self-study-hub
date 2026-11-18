import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {aggregateCohortAudit,renderCohortAudit,startVocabularyCohortAudit} from '../src/vocabulary/cohort-xp-audit-screen.js';

const backend=readFileSync(new URL('../supabase/functions/vocabulary-reward-cohort-fund/index.ts',import.meta.url),'utf8');
const component=n=>({missions:n,personalBests:0,weeklyGoals:0,achievements:0,stageClears:0,pathwayMasteries:0,unitMasteries:0});
const page={ok:true,auditOnly:true,readyForWalletFunding:false,page:0,examined:2,totalStudents:2,more:false,
 summary:{withMissions:1,zeroXp:1,timeZoneSensitive:0,missingWallets:2,walletDiscrepancies:0,earnedXpSum:160,
  withoutMissionsWithXp:0,masteryWithoutMissions:0,components:component(160)}};
test('wallet initializer is admin-only, derives identity and XP from trusted records',()=>{
 assert.match(backend,/auth\.getUser\(token\)/);
 assert.match(backend,/profile\?\.role!=='admin'/);
 assert.match(backend,/profile\?\.active!==true/);
 assert.match(backend,/fundPlans\.push\(\{studentId:id,earnedXp:china\}\)/);
 assert.match(backend,/p_student_id:plan\.studentId,p_verified_earned_xp:plan\.earnedXp/);
 assert.doesNotMatch(backend,/p_verified_earned_xp:payload|p_student_id:payload|payload\.student_id/);
});
test('every batch is checked against the full audit before any RPC write',()=>{
 assert.match(backend,/expected\.totalStudents===profiles\.count/);
 assert.match(backend,/expected\.examined===ids\.length/);
 assert.match(backend,/expected\.earnedXpSum===summary\.earnedXpSum/);
 assert.match(backend,/expected\.components\[key\]===summary\.components\[key\]/);
 assert.ok(backend.indexOf('if(!snapshotMatches)')<backend.indexOf('for(const plan of fundPlans)'));
 assert.match(backend,/409\)/);
});
test('all writes use idempotent verified-XP RPC rather than direct table updates',()=>{
 assert.match(backend,/sync_verified_vocabulary_reward_wallet/);
 assert.match(backend,/admin\.rpc/);
 assert.doesNotMatch(backend,/\.from\('vocabulary_reward_wallets'\)\.upsert\(/);
 assert.doesNotMatch(backend,/\.from\('vocabulary_reward_wallets'\)\.update\(/);
 assert.match(backend,/synchronised\+\+/);
});
test('admin UI exposes separate wallet initialization after complete, safe audit',()=>{
 const root={innerHTML:''};renderCohortAudit(root,{pages:[page],complete:true});
 assert.match(root.innerHTML,/Initialize verified wallets/);
 assert.match(root.innerHTML,/data-action="initialize-cohort-wallets"/);
 assert.match(root.innerHTML,/Run audit again/);
 assert.match(root.innerHTML,/separate confirmation/i);
});
test('failed or incomplete audit cannot expose a wallet initialization button',()=>{
 const root={innerHTML:''};
 renderCohortAudit(root,{pages:[page],error:'Network unavailable'});
 assert.doesNotMatch(root.innerHTML,/data-action="initialize-cohort-wallets"/);
 renderCohortAudit(root,{pages:[{...page,summary:{...page.summary,timeZoneSensitive:1}}],complete:true});
 assert.doesNotMatch(root.innerHTML,/data-action="initialize-cohort-wallets"/);
});
test('screen requires admin profile before registering handlers',async()=>{
 const root={textContent:'',innerHTML:'',addEventListener(){throw new Error('unexpected handler')}};
 await startVocabularyCohortAudit({root,client:{},profile:{role:'teacher'}});
 assert.match(root.textContent,/Administrator access required/);
});
