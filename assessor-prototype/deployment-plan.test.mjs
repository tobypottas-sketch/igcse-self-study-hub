import test from 'node:test';
import assert from 'node:assert/strict';
const active='11111111-1111-4111-8111-111111111111';
const staged='22222222-2222-4222-8222-222222222222';
const parameters=()=>({accountId:'a'.repeat(32),workerName:'igcse-writing-assessor',activeDeployment:{versions:[{version_id:active,percentage:100}]},expectedActiveVersion:active,activeVersion:{id:active,resources:{script_runtime:{compatibility_date:'2026-11-05'},bindings:[{name:'AI',type:'ai'},{name:'ASSESSMENT_TEST_KEY',type:'secret_text'}]}},configuration:{hubOrigin:'https://hub.example.invalid',supabaseUrl:'https://synthetic.supabase.co',publishableKey:'synthetic-public-key'},modules:[{name:'worker.js',content:'export default {};'}, {name:'staff-assessment.js',content:'export {};'}]});
test('production plan explicitly inherits the active secret and never deploys or uses latest',async()=>{
 const {buildProductionPlan}=await import('./deployment-plan.mjs');const p=buildProductionPlan(parameters());
 assert.match(p.url,/\/workers\/workers\/igcse-writing-assessor\/versions\?deploy=false$/);assert.equal(p.method,'POST');
 const secret=p.body.bindings.find(b=>b.name==='ASSESSMENT_TEST_KEY');assert.deepEqual(secret,{name:'ASSESSMENT_TEST_KEY',type:'inherit',version_id:active});
 assert.ok(!JSON.stringify(p).includes('"latest"'));assert.ok(!JSON.stringify(p).includes(staged));assert.ok(!('text' in secret));assert.equal(p.body.modules.length,2);
 assert.ok(p.preflight.some(v=>v.includes('logging')));
});
for(const [name,change] of [['no expected active ID',p=>delete p.expectedActiveVersion],['latest inheritance',p=>p.expectedActiveVersion='latest'],['staged selected as active',p=>p.expectedActiveVersion=staged],['split deployment',p=>p.activeDeployment.versions.push({version_id:staged,percentage:50})],['wrong Worker',p=>p.workerName='student-app'],['unknown bindings',p=>p.activeVersion.resources.bindings.push({name:'WRITING_DB',type:'d1'})],['untrusted active metadata',p=>p.activeVersion.id=staged]])test('plan rejects '+name,async()=>{
 const {buildProductionPlan}=await import('./deployment-plan.mjs');const p=parameters();change(p);assert.throws(()=>buildProductionPlan(p));
});

test('legacyKey "omit" stages the version with NO secret binding: nothing inherited, copied or replaced',async()=>{
 const {buildProductionPlan}=await import('./deployment-plan.mjs');const p=buildProductionPlan({...parameters(),legacyKey:'omit'});
 const names=p.body.bindings.map(b=>b.name).sort();
 assert.deepEqual(names,['AI','HUB_ORIGIN','SUPABASE_PUBLISHABLE_KEY','SUPABASE_URL']);
 const body=JSON.stringify(p.body);for(const forbidden of ['ASSESSMENT_TEST_KEY','inherit','secret_text','version_id',active,staged,'latest'])assert.ok(!body.includes(forbidden),'request body must not contain '+forbidden);
 assert.ok(!p.body.bindings.some(b=>b.version_id||b.type==='inherit'||b.type==='secret_text'));
 assert.match(p.url,/\?deploy=false$/);assert.ok(p.preflight.some(v=>/legacy .*(diagnostic|routes?).* disabled|401/i.test(v)),'plan tells the operator the legacy routes will be closed');
});
test('legacyKey defaults to the explicit active-version inheritance and rejects any other value',async()=>{
 const {buildProductionPlan}=await import('./deployment-plan.mjs');
 assert.equal(buildProductionPlan(parameters()).body.bindings.find(b=>b.name==='ASSESSMENT_TEST_KEY').type,'inherit');
 for(const bad of ['latest','copy','staged',true,'','OMIT'])assert.throws(()=>buildProductionPlan({...parameters(),legacyKey:bad}),/legacyKey/);
});
for(const [name,change] of [['split deployment',p=>p.activeDeployment.versions.push({version_id:staged,percentage:50})],['wrong Worker',p=>p.workerName='student-app'],['staged selected as active',p=>p.expectedActiveVersion=staged],['unknown bindings',p=>p.activeVersion.resources.bindings.push({name:'WRITING_DB',type:'d1'})],['secret key as publishable key',p=>p.configuration.publishableKey='sb_secret_x']])test('omit mode still verifies production state first: rejects '+name,async()=>{
 const {buildProductionPlan}=await import('./deployment-plan.mjs');const p={...parameters(),legacyKey:'omit'};change(p);assert.throws(()=>buildProductionPlan(p));
});
