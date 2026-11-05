import test from 'node:test';
import assert from 'node:assert/strict';
import { renderHome } from '../src/views/home.js';
const input={taskType:'review',task:'Review a fictional museum and recommend a visit.',response:'The museum was fascinating because its exhibits made science clear.',privacyConfirmed:true};
const result={contentMark:4,languageMark:6,totalMark:10,wordCount:11,contentReason:'Relevant with room for development.',languageReason:'Clear language.',strengths:[{quote:'science clear',advice:'Conveys meaning.'}],improvements:[],nextStep:'Develop one example.',warning:'Experimental estimate.'};
for(const role of ['teacher','admin','student'])test(role+' sees only its permitted assessor entry',()=>{
 const root={innerHTML:''};renderHome(root,{role,active:true,display_name:'Synthetic'},[]);
 assert.equal(root.innerHTML.includes('data-action="writing-assessor"'),role!=='student');
});
test('inactive staff do not get an assessor entry',()=>{
 const root={innerHTML:''};renderHome(root,{role:'teacher',active:false,display_name:'Synthetic'},[]);assert.ok(!root.innerHTML.includes('data-action="writing-assessor"'));
});
test('assessor view refuses students and inactive staff',async()=>{
 const {renderAssessor}=await import('../src/assessor/view.js');
 for(const profile of [{role:'student',active:true},{role:'teacher',active:false},{role:'admin',active:true,must_change_password:true}]){
  const root={innerHTML:''};assert.equal(renderAssessor(root,profile),false);assert.ok(!root.innerHTML.includes('<textarea'));
 }
});
test('staff form is labelled and has privacy confirmation, free-plan guidance and no identity field',async()=>{
 const {renderAssessor}=await import('../src/assessor/view.js');const root={innerHTML:''};assert.equal(renderAssessor(root,{role:'teacher',active:true,must_change_password:false}),true);
 assert.match(root.innerHTML,/Content.*6/);assert.match(root.innerHTML,/Language.*9/);assert.match(root.innerHTML,/name="task"/);assert.match(root.innerHTML,/name="response"/);assert.match(root.innerHTML,/name="privacyConfirmed"/);assert.match(root.innerHTML,/Free/);assert.doesNotMatch(root.innerHTML,/name="(?:student|email|class|candidate)/i);
});
test('feedback is escaped and rendered without executable model HTML',async()=>{
 const {renderAssessmentResult}=await import('../src/assessor/view.js');const root={innerHTML:''};renderAssessmentResult(root,{...result,nextStep:'<img src=x onerror=alert(1)>',strengths:[{quote:'<script>secret()</script>',advice:'<b>example</b>'}]});
 assert.ok(!root.innerHTML.includes('<script>'));assert.ok(!root.innerHTML.includes('<img'));assert.match(root.innerHTML,/&lt;img/);assert.match(root.innerHTML,/10/);
});
test('client sends only task and writing with the existing Hub session, once',async()=>{
 const {assessWriting}=await import('../src/assessor/client.js');let calls=0;
 const client={auth:{getSession:async()=>({data:{session:{access_token:'synthetic-session-token'}}})}};
 const response=await assessWriting(client,input,{fetcher:async(url,options)=>{
  calls++;assert.equal(url,'https://igcse-writing-assessor.toby-pottas.workers.dev/assess');assert.equal(options.headers.Authorization,'Bearer synthetic-session-token');assert.equal(options.redirect,'error');assert.equal(options.credentials,'omit');assert.equal(options.cache,'no-store');assert.deepEqual(JSON.parse(options.body),input);assert.ok(!JSON.stringify(options).includes('Assessment-Test-Key'));
  return Response.json({stages:2,result});
 }});assert.equal(calls,1);assert.equal(response.totalMark,10);
});
test('client requires a session and never invokes network when signed out',async()=>{
 const {assessWriting}=await import('../src/assessor/client.js');let calls=0;
 await assert.rejects(assessWriting({auth:{getSession:async()=>({data:{session:null}})}},input,{fetcher:async()=>{calls++;}}),/Sign in/);assert.equal(calls,0);
});
test('invalid input cannot send requests',async()=>{
 const {assessWriting}=await import('../src/assessor/client.js');let calls=0;
 for(const value of [{...input,task:''},{...input,response:''},{...input,privacyConfirmed:false},{...input,studentId:'synthetic-id'}])await assert.rejects(assessWriting({},value,{fetcher:async()=>{calls++;}}));
 assert.equal(calls,0);
});
for(const status of [401,403,503])test('client error '+status+' is explicit, private and not retried',async()=>{
 const {assessWriting}=await import('../src/assessor/client.js');let calls=0;
 await assert.rejects(assessWriting({auth:{getSession:async()=>({data:{session:{access_token:'synthetic-session-token'}}})}},input,{fetcher:async()=>{calls++;return Response.json({error:'DO NOT DISPLAY synthetic writing',stage:'evidence_model',category:'quota_or_rate_limit'},{status});}}),error=>!error.message.includes('DO NOT DISPLAY') && (status===503||error.code==='access_denied'));assert.equal(calls,1);
});
test('client rejects malformed assessment output and inconsistent totals',async()=>{
 const {assessWriting}=await import('../src/assessor/client.js');const client={auth:{getSession:async()=>({data:{session:{access_token:'synthetic-session-token'}}})}};
 for(const body of [{stages:1,result},{stages:2,result:{...result,totalMark:15}},{stages:2,result:{...result,languageMark:12}}])await assert.rejects(assessWriting(client,input,{fetcher:async()=>Response.json(body)}),/valid assessment/);
});
