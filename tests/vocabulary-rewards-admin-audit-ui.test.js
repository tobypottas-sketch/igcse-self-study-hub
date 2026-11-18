import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {aggregateCohortAudit,renderCohortAudit} from '../src/vocabulary/cohort-xp-audit-screen.js';

const summary={withMissions:6,zeroXp:2,timeZoneSensitive:1,missingWallets:8,walletDiscrepancies:0,earnedXpSum:1570};
const first={ok:true,auditOnly:true,readyForWalletFunding:false,page:0,examined:8,totalStudents:10,more:true,summary};
const second={ok:true,auditOnly:true,readyForWalletFunding:false,page:1,examined:2,totalStudents:10,more:false,
 summary:{withMissions:1,zeroXp:0,timeZoneSensitive:0,missingWallets:2,walletDiscrepancies:0,earnedXpSum:270}};
test('read-only scan aggregates complete student cohort',()=>{
 assert.deepEqual(aggregateCohortAudit([first,second]),{
 examined:10,totalStudents:10,withMissions:7,zeroXp:2,timeZoneSensitive:1,missingWallets:10,walletDiscrepancies:0,earnedXpSum:1840,pages:2
 });
});
test('refuses incomplete batches, invalid summary totals or funding-enabled responses',()=>{
 assert.throws(()=>aggregateCohortAudit([first]),/full student cohort/);
 assert.throws(()=>aggregateCohortAudit([{...first,readyForWalletFunding:true},second]),/unsafe/);
 assert.throws(()=>aggregateCohortAudit([{...first,summary:{...summary,zeroXp:-1}},second]),/invalid/);
});
test('admin screen renders a safe read-only audit, not a credit button',()=>{
 const root={innerHTML:''};
 renderCohortAudit(root,{pages:[first,second],complete:true});
 assert.match(root.innerHTML,/Student XP reconciliation/);
 assert.match(root.innerHTML,/10 of 10 students checked/);
 assert.match(root.innerHTML,/Wallets not initialised/);
 assert.match(root.innerHTML,/Run audit again/);
 assert.doesNotMatch(root.innerHTML,/data-action="fund-wallets"|data-action="credit-xp"/);
});
test('error states do not invent cohort totals',()=>{
 const root={innerHTML:''};renderCohortAudit(root,{pages:[first],error:'<script>x</script>'});
 assert.match(root.innerHTML,/&lt;script&gt;x&lt;\/script&gt;/);
 assert.doesNotMatch(root.innerHTML,/<script>/);
 assert.doesNotMatch(root.innerHTML,/Total lifetime XP/);
});
test('teacher navigation and router restrict admin audit path',()=>{
 const repoRoot=new URL('../',import.meta.url);
 const router=fs.readFileSync(new URL('src/vocabulary/router.js',repoRoot),'utf8');
 const teacher=fs.readFileSync(new URL('src/vocabulary/teacher-app.js',repoRoot),'utf8');
 assert.match(router,/cohortAuditRequested && profile.role === 'admin'/);
 assert.match(router,/cohortAuditRequested && profile.role !== 'admin'/);
 assert.match(teacher,/teacherState\.profile\?\.role==='admin'/);
 assert.match(teacher,/xp-cohort-audit=1/);
});
