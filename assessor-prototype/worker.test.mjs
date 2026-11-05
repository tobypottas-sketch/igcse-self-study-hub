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
 assert.ok(parseModel({response:{requirements:{}}}).requirements);
 assert.equal(parseModel({response:'{"contentMark":4}'}).contentMark,4);
 assert.equal(parseModel({response:'```json\n{"languageMark":6}\n```'}).languageMark,6);
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

test('protected diagnostic isolates model access without reading essay or using JSON schema',async()=>{
 const {worker}=harness();
 const calls=[];
 const env={ASSESSMENT_TEST_KEY:'test-key',AI:{run:async(model,args)=>{
  calls.push(args);
  return {response:'READY'};
 }}};
 const endpoint='https://example.workers.dev/diagnose';
 const denied=await worker.fetch(new Request(endpoint,{method:'POST'}),env);
 assert.equal(denied.status,401);
 assert.equal(calls.length,0);
 const accepted=await worker.fetch(new Request(endpoint,{method:'POST',headers:{'X-Assessment-Test-Key':'test-key'}}),env);
 assert.equal(accepted.status,200);
 const body=await accepted.json();
 assert.equal(body.diagnostic,'basic_model_access');
 assert.equal(body.ok,true);
 assert.equal(body.structuredOutputTested,false);
 assert.equal(calls.length,1);
 assert.equal(calls[0].max_tokens,20);
 assert.equal('response_format' in calls[0],false);
 assert.equal(JSON.stringify(calls[0]).includes('Green Garden'),false);
});
test('diagnostic reports known upstream JSON mode error without returning prompt or secret',async()=>{
 const {worker}=harness();
 const env={ASSESSMENT_TEST_KEY:'test-key',AI:{run:async()=>{
   const err=new Error("JSON Mode couldn't be met");
   err.code=400;
   throw err;
 }}};
 const response=await worker.fetch(new Request('https://example.workers.dev/diagnose',{
  method:'POST',headers:{'X-Assessment-Test-Key':'test-key'}
 }),env);
 assert.equal(response.status,503);
 const result=await response.json();
 assert.equal(result.category,'json_mode_or_schema');
 assert.equal(result.code,400);
 assert.ok(!JSON.stringify(result).includes('test-key'));
});

// Synthetic Workers binding contract: only the currently catalogued JSON Mode
// model is accepted. This reproduces the retired-model 503 without credentials.
const AVAILABLE_JSON_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const authorisedRequest = (path='/teacher-test') => new Request('https://example.workers.dev'+path, {
 method:'POST', headers:{'X-Assessment-Test-Key':'synthetic-key'}
});
test('assessment uses an available JSON Mode model and documented bounded requests',async()=>{
 const {worker}=harness(); const calls=[];
 const response=await worker.fetch(authorisedRequest(),{
  ASSESSMENT_TEST_KEY:'synthetic-key',AI:{run:async(model,args)=>{
   calls.push({model,args});
   if(model!==AVAILABLE_JSON_MODEL) throw Object.assign(new Error('No such model'),{code:5007});
   assert.equal(args.stream,false);
   assert.equal(args.temperature,0);
   assert.equal(args.response_format.type,'json_schema');
   assert.equal(args.response_format.json_schema.type,'object');
   assert.ok(args.max_tokens>0 && args.max_tokens<=1100);
   return {response:calls.length===1?extracted():marked()};
  }}
 });
 assert.equal(response.status,200);
 assert.equal(calls.length,2);
});
test('generation schemas bound output size and Cambridge mark ranges',()=>{
 const {evidenceSchema,assessmentSchema}=harness();
 assert.equal(evidenceSchema.properties.features.maxItems,8);
 assert.equal(evidenceSchema.properties.errors.maxItems,5);
 assert.equal(evidenceSchema.properties.requirements.properties.food.properties.quote.maxLength,180);
 assert.equal(assessmentSchema.properties.contentMark.minimum,0);
 assert.equal(assessmentSchema.properties.contentMark.maximum,6);
 assert.equal(assessmentSchema.properties.languageMark.maximum,9);
 assert.equal(assessmentSchema.properties.strengths.maxItems,2);
 assert.equal(assessmentSchema.properties.improvements.maxItems,3);
});
for(const [label,reply] of [
 ['missing evidence fields',{response:{}}],
 ['null evidence field',{response:{...extracted(),requirements:null}}],
 ['wrong evidence array type',{response:{...extracted(),features:'not an array'}}],
 ['inference error envelope',{error:'synthetic upstream failure'}],
 ['malformed JSON',{response:'{"requirements":'}]
]) test(label+' fails closed before the grading call, without retry',async()=>{
 const {worker}=harness();let calls=0;
 const response=await worker.fetch(authorisedRequest(),{
  ASSESSMENT_TEST_KEY:'synthetic-key',AI:{run:async()=>{calls++;return calls===1?reply:{response:marked()};}}
 });
 assert.equal(response.status,503);
 assert.equal(calls,1);
 const data=await response.json();
 assert.equal('result' in data,false);
 assert.ok(['invalid_ai_response','invalid_ai_json'].includes(data.reason));
});
for(const [code,message,category] of [
 [5007,'No such model','model_unavailable'],
 [5018,'The account is not allowed to access this model','model_permission'],
 [5035,'This model requires a Workers Paid plan','paid_model_not_allowed'],
 [3036,'You have used up your daily free allocation','quota_or_rate_limit'],
 [3040,'Capacity temporarily exceeded','quota_or_rate_limit'],
 [3007,'Request timeout','model_timeout']
]) test('documented Cloudflare error '+code+' is safe, precise and not retried',async()=>{
 const {worker}=harness();let calls=0;
 const response=await worker.fetch(authorisedRequest(),{
  ASSESSMENT_TEST_KEY:'synthetic-key',AI:{run:async()=>{
   calls++;throw Object.assign(new Error(message+' synthetic-private-marker'),{code});
  }}
 });
 assert.equal(response.status,503);assert.equal(calls,1);
 const body=await response.json();assert.equal(body.category,category);
 assert.equal(body.code,code);
 assert.ok(!JSON.stringify(body).includes('synthetic-private-marker'));
});
test('schema generation failure issues no mark and does not fall back to unconstrained text',async()=>{
 const {worker}=harness();let calls=0;
 const response=await worker.fetch(authorisedRequest(),{
  ASSESSMENT_TEST_KEY:'synthetic-key',AI:{run:async()=>{calls++;throw new Error("JSON Mode couldn't be met");}}
 });
 assert.equal(response.status,503);assert.equal(calls,1);
 assert.equal((await response.json()).category,'json_mode_or_schema');
});
test('wrong key, missing configured secret and other routes never invoke AI',async()=>{
 const {worker}=harness();let calls=0;const AI={run:async()=>{calls++;throw Error('must not run');}};
 for(const path of ['/teacher-test','/diagnose']) {
  const denied=await worker.fetch(authorisedRequest(path),{ASSESSMENT_TEST_KEY:'different-key',AI});
  assert.equal(denied.status,401);
  const unconfigured=await worker.fetch(authorisedRequest(path),{AI});assert.equal(unconfigured.status,401);
 }
 assert.equal((await worker.fetch(authorisedRequest('/assess'),{ASSESSMENT_TEST_KEY:'synthetic-key',AI})).status,404);
 assert.equal(calls,0);
});

test('protected structured diagnostic tests the real JSON request contract without essay data',async()=>{
 const {worker}=harness();const calls=[];
 const env={ASSESSMENT_TEST_KEY:'synthetic-key',AI:{run:async(model,args)=>{
  calls.push({model,args});return {response:{ready:true}};
 }}};
 const response=await worker.fetch(authorisedRequest('/diagnose?mode=json'),env);
 assert.equal(response.status,200);
 const body=await response.json();
 assert.equal(body.structuredOutputTested,true);
 assert.equal(body.ok,true);
 assert.equal(calls.length,1);
 assert.equal(calls[0].model,AVAILABLE_JSON_MODEL);
 assert.equal(calls[0].args.response_format.type,'json_schema');
 assert.equal(calls[0].args.max_tokens,32);
 assert.ok(!JSON.stringify(calls).includes('Green Garden'));
 assert.ok(!JSON.stringify(calls).includes('synthetic-key'));
});
test('structured diagnostic rejects an invalid response rather than reporting success',async()=>{
 const {worker}=harness();
 const response=await worker.fetch(authorisedRequest('/diagnose?mode=json'),{
  ASSESSMENT_TEST_KEY:'synthetic-key',AI:{run:async()=>({response:{}})}
 });
 assert.equal(response.status,503);
 assert.equal((await response.json()).ok,false);
});

test('upstream string error codes cannot leak credentials or arbitrary data',async()=>{
 const {worker}=harness();
 for(const path of ['/teacher-test','/diagnose']) {
  const response=await worker.fetch(authorisedRequest(path),{
   ASSESSMENT_TEST_KEY:'synthetic-key',AI:{run:async()=>{
    throw Object.assign(new Error('synthetic confidential error'),{code:'synthetic-key'});
   }}
  });
  assert.equal(response.status,503);
  const body=await response.json();assert.equal(body.code,null);
  assert.ok(!JSON.stringify(body).includes('synthetic-key'));
  assert.equal(response.headers.get('cache-control'),'no-store');
 }
});
for(const [label,mark] of [
 ['fractional mark',{...marked(),contentMark:4.5}],
 ['negative mark',{...marked(),languageMark:-1}],
 ['out of range mark',{...marked(),languageMark:10}],
 ['missing language reason',Object.fromEntries(Object.entries(marked()).filter(([key])=>key!=='languageReason'))],
 ['oversized feedback',{...marked(),nextStep:'x'.repeat(231)}],
 ['too many feedback points',{...marked(),strengths:Array(3).fill(marked().strengths[0])}]
]) test(label+' is rejected after exactly two calls',async()=>{
 const {worker}=harness();let calls=0;
 const response=await worker.fetch(authorisedRequest(),{
  ASSESSMENT_TEST_KEY:'synthetic-key',AI:{run:async()=>({response:++calls===1?extracted():mark})}
 });
 assert.equal(response.status,503);assert.equal(calls,2);
 assert.equal('result' in await response.json(),false);
});
test('grading JSON failure reports the grading stage and never retries evidence',async()=>{
 const {worker}=harness();let calls=0;
 const response=await worker.fetch(authorisedRequest(),{
  ASSESSMENT_TEST_KEY:'synthetic-key',AI:{run:async()=>({response:++calls===1?extracted():'{"contentMark":'})}
 });
 assert.equal(response.status,503);assert.equal(calls,2);
 const body=await response.json();assert.equal(body.stage,'assessment_model');
 assert.equal(body.reason,'invalid_ai_json');
});

test('ES module entry point handles teacher routes with Web Request/Response APIs',async()=>{
 const {default:worker}=await import('./worker.js');
 let calls=0;
 const env={ASSESSMENT_TEST_KEY:'synthetic-key',AI:{run:async()=>({response:++calls===1?extracted():marked()})}};
 const denied=await worker.fetch(new Request('https://example.workers.dev/teacher-test',{method:'POST'}),env);
 assert.equal(denied.status,401);assert.equal(calls,0);
 const response=await worker.fetch(authorisedRequest(),env);
 assert.equal(response.status,200);assert.equal(calls,2);
 assert.equal((await response.json()).result.totalMark,10);
 assert.equal(response.headers.get('cache-control'),'no-store');
 assert.equal(response.headers.get('access-control-allow-origin'),null);
});
