import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../supabase/functions/vocabulary-reward-cohort-audit/index.ts',import.meta.url),'utf8');
test('cohort audit only accepts active admins and never trusts request student ids',()=>{
 assert.match(source,/auth\.getUser\(token\)/);
 assert.match(source,/profile\?\.role!=='admin'/);
 assert.match(source,/profile\?\.active!==true/);
 assert.match(source,/\.order\('id'\)\.range\(page\*size/);
 assert.doesNotMatch(source,/payload\.studentId|payload\.student_id/);
});
test('cohort audit is read only and uses canonical vocabulary engagement engine',()=>{
 assert.match(source,/computeXp/);
 assert.match(source,/progressSnapshot/);
 assert.match(source,/clearPathwayCoverage/);
 assert.match(source,/coverageFromServerSetMembers/);
 assert.match(source,/readyForWalletFunding:false/);
 assert.doesNotMatch(source,/\.rpc\(|\.insert\(|\.update\(|\.upsert\(|\.delete\(/);
});
test('cohort audit returns aggregate results without student identifiers',()=>{
 assert.match(source,/summary,\s*note:/);
 assert.match(source,/timeZoneSensitive/);
 assert.match(source,/walletDiscrepancies/);
 assert.match(source,/missingWallets/);
 assert.doesNotMatch(source,/display_name|school_email/);
});
test('cohort audit paginates safely and calculates both China and UTC totals',()=>{
 assert.match(source,/const size=20/);
 assert.match(source,/Number\.isInteger\(page\)/);
 assert.match(source,/Asia\/Shanghai/);
 assert.match(source,/'UTC'/);
 assert.match(source,/count:'exact'/);
 assert.match(source,/fetchAllRows/);
});
