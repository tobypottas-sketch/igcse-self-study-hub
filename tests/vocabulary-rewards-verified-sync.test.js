import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const source=stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/vocabulary-reward-wallet-sync/index.ts',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
const app=readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
function harness({role='student',active=true,total=320}={}){
 let handler=null,serviceCalls=0,serviceClientCount=0;
 const studentId='synthetic-student-id';
 const student={
  auth:{getUser:async()=>({data:{user:{id:studentId}},error:null})},
  from(table){
   if(table==='profiles')return {select(){return this},eq(){return this},single:async()=>({data:{role,active},error:null})};
   return {select(){return this},eq(){return this},order(){return this},range:async()=>({data:[],count:0,error:null})};
  }
 };
 const service={
  rpc:async(name,args)=>{
   assert.equal(name,'sync_verified_vocabulary_reward_wallet');
   assert.deepEqual(args,{p_student_id:studentId,p_verified_earned_xp:total});
   serviceCalls++;
   return {data:{verifiedEarned:total,spent:0,available:total,status:'synchronised'},error:null};
  }
 };
 const createClient=()=>++serviceClientCount===1?student:service;
 const env={SUPABASE_URL:'https://example.test',SUPABASE_ANON_KEY:'test-public',SUPABASE_SERVICE_ROLE_KEY:'test-secret'};
 const engine={computeXp:()=>({total,parts:{missions:total}}),
  progressSnapshot:()=>({passedStages:0,masteredPathwayCount:0,unitsMastered:0})};
 const Deno={env:{get:key=>env[key]},serve:fn=>{handler=fn}};
 new Function('createClient','computeXp','progressSnapshot','buildUnitPathwayStates','clearPathwayCoverage',
 'registerPathwayCoverage','coverageFromServerSetMembers','fetchAllRows','Deno',source)(
 createClient,engine.computeXp,engine.progressSnapshot,()=>({meaning:{mastered:false}}),()=>{},()=>{},()=>({}),
 async()=>[],Deno);
 const call=(action,body={})=>handler(new Request('https://example.test',{
  method:'POST',headers:{Authorization:'Bearer test', 'Content-Type':'application/json'},
  body:JSON.stringify({action,...body})}));
 return {call,read:()=>serviceCalls};
}
test('sync ignores student-supplied XP and identity; credits authenticated account only',async()=>{
 const h=harness();
 const res=await h.call('sync',{xp:999999,studentId:'other-account',timeZone:'Pacific/Honolulu'});
 assert.equal(res.status,200);
 assert.equal((await res.json()).verifiedLifetimeXp,320);
 assert.equal(h.read(),1);
});
test('preview is read-only and never creates a wallet',async()=>{
 const h=harness();const res=await h.call('preview');
 assert.equal(res.status,200);assert.equal((await res.json()).readOnly,true);assert.equal(h.read(),0);
});
test('teachers, inactive users and arbitrary actions cannot fund wallets',async()=>{
 for(const options of [{role:'teacher'},{role:'student',active:false}]){
  const h=harness(options);assert.equal((await h.call('sync')).status,403);assert.equal(h.read(),0);
 }
 const h=harness();assert.equal((await h.call('buy')).status,400);assert.equal(h.read(),0);
});
test('student app triggers sync after loading, without changing local learning XP',()=>{
 assert.match(app,/void refreshVerifiedRewardWallet\(\)/);
 assert.match(app,/functions\.invoke\('vocabulary-reward-wallet-sync',\{body:\{action:'sync'\}\}\)/);
 assert.match(app,/state\.profile\?\.role!=='student'/);
 assert.doesNotMatch(app,/state\.engagementSnapshot\s*=\s*data\./);
});
test('server uses canonical score, complete server rows, and atomic service-only wallet rpc',()=>{
 assert.match(source,/fetchAllRows\(/);
 assert.match(source,/timeZone:'Asia\/Shanghai'/);
 assert.match(source,/computeXp/);
 assert.match(source,/sync_verified_vocabulary_reward_wallet/);
 assert.match(source,/service\.rpc/);
 assert.match(source,/auth\.getUser\(token\)/);
 assert.doesNotMatch(source,/body\.(xp|studentId|student_id)/);
});
