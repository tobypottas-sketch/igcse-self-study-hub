import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';

const source = readFileSync(new URL('./worker.js', import.meta.url),'utf8')
  .replace('export default {','const worker = {') +
  '\n;globalThis.__api={worker,verifyEvidence,verifyAssessment,countWords,ESSAY,TASK,parseModel,evidenceSchema,assessmentSchema};';

function harness() {
 const sandbox={crypto:webcrypto,TextEncoder,Response,Request,URL,console:undefined};
 vm.runInNewContext(source,sandbox);
 return sandbox.__api;
}
function extracted() {
 return { requirements:{
  subject:{quote:'Green Garden Restaurant'},
  food:{quote:'I ordered a pizza'},
  atmosphere:{quote:'relaxing atmosphere'},
  opinion:{quote:'In my opinion'},
  recommendation:{quote:'I would recommend'}
 },features:[{label:'relative clause',quote:'which was fresh and delicious'}],errors:[]};
}
function marked() {
 return {contentMark:4,languageMark:6,
 contentReason:'Task fulfilled; description could be developed.',
 languageReason:'Generally accurate writing and appropriate vocabulary.',
 strengths:[{quote:'I ordered a pizza',advice:'Includes a concrete detail'}],
 improvements:[{quote:'fresh and delicious',advice:'Explain what made the pizza memorable'}],
 missingRequirements:['food','recommendation'],nextStep:'Develop the pizza description in this draft.'};
}
test('example draft word count and verifiable evidence',()=>{
 const {countWords,ESSAY,verifyEvidence}=harness();
 assert.equal(countWords(ESSAY),93);
 const checked=verifyEvidence(extracted(),ESSAY);
 assert.equal(checked.requirements.food.present,true);
 assert.equal(checked.requirements.recommendation.present,true);
 assert.equal(checked.features[0].label,'relative clause');
});
test('unsupported quotations and unsupported grammar error are dropped',()=>{
 const {verifyEvidence,ESSAY}=harness();
 const input=extracted();
 input.features.push({label:'imaginary',quote:'excellent customer service'});
 input.errors.push({quote:'I have went yesterday',correction:'I went yesterday',explanation:'tense'});
 const checked=verifyEvidence(input,ESSAY);
 assert.equal(checked.features.length,1);
 assert.equal(checked.errors.length,0);
});
test('marks are within Cambridge bounds, and proven requirements cannot be missing',()=>{
 const {verifyEvidence,verifyAssessment,ESSAY}=harness();
 const result=verifyAssessment(marked(),ESSAY,verifyEvidence(extracted(),ESSAY));
 assert.equal(result.totalMark,10);
 assert.equal(result.missingRequirements.length,0);
 assert.equal(result.contentBand,'3–4');
 assert.equal(result.languageBand,'4–6');
});
test('fabricated evidence cannot appear as strengths or improvements',()=>{
 const {verifyEvidence,verifyAssessment,ESSAY}=harness();
 const draft=marked();
 draft.improvements.push({quote:'pasta with pesto',advice:'Replace this'});
 draft.strengths.push({quote:'nonexistent quote',advice:'Made up'});
 const result=verifyAssessment(draft,ESSAY,verifyEvidence(extracted(),ESSAY));
 assert.equal(result.strengths.length,1);
 assert.equal(result.improvements.length,1);
});
test('clear contradictions about the named pizza are rejected',()=>{
 const {verifyEvidence,verifyAssessment,ESSAY}=harness();
 const draft=marked();
 draft.contentReason='The writer failed to mention a specific dish.';
 assert.throws(()=>verifyAssessment(draft,ESSAY,verifyEvidence(extracted(),ESSAY)),/Contradicts/);
});
test('no estimate if AI gives unsupported only evidence or invalid scores',()=>{
 const {verifyEvidence,verifyAssessment,ESSAY}=harness();
 const evidence=verifyEvidence(extracted(),ESSAY);
 const invalid=marked(); invalid.contentMark=7;
 assert.throws(()=>verifyAssessment(invalid,ESSAY,evidence),/Invalid marks/);
 const noQuote=marked();noQuote.strengths=[{quote:'invisible pasta',advice:'invented'}];
 assert.throws(()=>verifyAssessment(noQuote,ESSAY,evidence),/Insufficient grounded feedback/);
});
test('only authenticated POST teacher-test runs AI; GET does not',async()=>{
 const {worker}=harness();
 let calls=0;
 const env={ASSESSMENT_TEST_KEY:'private-test-value', AI:{run:async()=>{calls++;return {response:JSON.stringify(calls===1?extracted():marked())};}}};
 const url='https://example.workers.dev';
 let res=await worker.fetch(new Request(url+'/'),env);
 assert.equal(res.status,200);assert.equal(calls,0);
 res=await worker.fetch(new Request(url+'/teacher-test',{method:'POST'}),env);
 assert.equal(res.status,401);assert.equal(calls,0);
 res=await worker.fetch(new Request(url+'/teacher-test',{method:'POST',headers:{'X-Assessment-Test-Key':'private-test-value'}}),env);
 assert.equal(res.status,200);assert.equal(calls,2);
 const data=await res.json();
 assert.equal(data.result.totalMark,10);
 assert.equal(data.result.observedEvidence.food.present,true);
});
test('failed assessment returns no invented marks',async()=>{
 const {worker}=harness();
 let calls=0;
 const env={ASSESSMENT_TEST_KEY:'private',AI:{run:async()=>{calls++;return {response:JSON.stringify(calls===1?extracted():{...marked(),contentMark:99})};}}};
 const res=await worker.fetch(new Request('https://example.workers.dev/teacher-test',{method:'POST',headers:{'X-Assessment-Test-Key':'private'}}),env);
 assert.equal(res.status,503);
 const data=await res.json();
 assert.equal(data.error,'Verification failed — no mark issued.');
 assert.equal('totalMark' in data,false);
});

test('Cloudflare JSON Mode returns valid structured objects or valid JSON text',()=>{
 const {parseModel,evidenceSchema,assessmentSchema}=harness();
 assert.equal(parseModel({response:{requirements:{}}}).requirements.constructor,Object);
 assert.equal(parseModel({response:'{"contentMark":4}'}).contentMark,4);
 assert.equal(parseModel({response:'```json\\n{"languageMark":6}\\n```'}).languageMark,6);
 assert.ok(evidenceSchema.required.includes('requirements'));
 assert.ok(assessmentSchema.required.includes('contentMark'));
 assert.throws(()=>parseModel({response:'{"unfinished":'}),/Invalid AI JSON/);
});
test('JSON Mode is requested for both stages without exposing extra submissions',async()=>{
 const {worker}=harness();
 const received=[];
 const input={requirements:{
  subject:{quote:'Green Garden Restaurant'},food:{quote:'I ordered a pizza'},
  atmosphere:{quote:'relaxing atmosphere'},opinion:{quote:'In my opinion'},
  recommendation:{quote:'I would recommend'}
 },features:[],errors:[]};
 const mark={contentMark:4,languageMark:6,
  contentReason:'Covers the task with reasonable detail.',
  languageReason:'Language is appropriate and clear.',
  strengths:[{quote:'I ordered a pizza',advice:'Specific detail'}],
  improvements:[{quote:'fresh and delicious',advice:'Develop the description'}],
  missingRequirements:[],nextStep:'Improve this review'};
 const env={ASSESSMENT_TEST_KEY:'test-secret',AI:{run:async(model,args)=>{
   received.push({model,args});
   return {response:received.length===1?input:mark};
 }}};
 const response=await worker.fetch(new Request('https://example.workers.dev/teacher-test',{
   method:'POST',headers:{'X-Assessment-Test-Key':'test-secret'},body:'ignored student text'
 }),env);
 assert.equal(response.status,200);
 assert.equal(received.length,2);
 assert.ok(received.every(call=>call.args.response_format.type==='json_schema'));
 assert.ok(received.every(call=>!JSON.stringify(call).includes('ignored student text')));
});
