import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';

const ORIGIN='https://hub.example.invalid';
const AUTH_URL='https://synthetic.supabase.co';
const uid='11111111-1111-4111-8111-111111111111';
const submission={taskType:'review',task:'Write a review of a science museum for a school magazine. Describe the exhibits and recommend a visit. Write 120–160 words.',response:'The museum was fascinating because the interactive exhibits made science easy to understand. I recommend visiting with friends.',privacyConfirmed:true};
const evidence={requirements:[{taskQuote:'recommend a visit',quote:'I recommend visiting with friends'}],features:[{label:'reason',quote:'because the interactive exhibits made science easy to understand'}],errors:[]};
const assessment={contentMark:4,languageMark:6,contentReason:'The review gives a reason and recommendation but needs more development.',languageReason:'Clear vocabulary and a supported opinion, with limited structural variety.',strengths:[{quote:'the interactive exhibits made science easy to understand',advice:'Explains why the exhibits worked well.'}],improvements:[{quote:'I recommend visiting with friends',advice:'Explain why this would suit the audience.'}],missingRequirements:[],nextStep:'Develop the description of one exhibit.'};
function request(body=submission,{token='synthetic-token',origin=ORIGIN,method='POST',headers={}}={}) {
 return new Request('https://assessor.example.invalid/assess',{method,headers:{...(origin?{Origin:origin}:{}),...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json',...headers},...(method==='OPTIONS'?{}:{body:typeof body==='string'?body:JSON.stringify(body)})});
}
function setup(t,{role='teacher',active=true,mustChange=false,userStatus=200,profileStatus=200,replies=[evidence,assessment]}={}) {
 const calls={auth:[],ai:[]};
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  calls.auth.push({url:String(url),options});
  assert.equal(options.method,'GET');
  assert.equal(options.headers.Authorization,'Bearer synthetic-token');
  assert.equal(options.headers.apikey,'synthetic-publishable-key');
  assert.ok(!options.body);
  assert.equal(options.redirect,'manual'); // Workers implement only follow|manual; 'error' threw on the live runtime (staging, Nov 2026). Never follow redirects with a bearer token.
  return String(url).includes('/auth/v1/user')?Response.json(userStatus===200?{id:uid,user_metadata:{role:'admin'}}:{error:'synthetic'}, {status:userStatus}):Response.json([{role,active,must_change_password:mustChange}],{status:profileStatus});
 });
 const env={HUB_ORIGIN:ORIGIN,SUPABASE_URL:AUTH_URL,SUPABASE_PUBLISHABLE_KEY:'synthetic-publishable-key',ASSESSMENT_TEST_KEY:'never-send-this-key',AI:{run:async(model,args)=>{
  calls.ai.push({model,args});return {response:replies[calls.ai.length-1]};
 }}};
 return {calls,env};
}
for(const role of ['teacher','admin']) test('active '+role+' gets exactly two schema-constrained calls and task-specific feedback',async t=>{
 const {env,calls}=setup(t,{role});const res=await worker.fetch(request(),env);assert.equal(res.status,200);
 const body=await res.json();assert.equal(body.stages,2);assert.equal(body.result.contentMark,4);assert.equal(body.result.languageMark,6);assert.equal(body.result.totalMark,10);
 assert.equal(calls.auth.length,2);assert.match(calls.auth[1].url,/select=role/);assert.ok(calls.auth[1].url.includes(uid));
 assert.equal(calls.ai.length,2);
 for(const {model,args} of calls.ai){
  assert.equal(model,'@cf/meta/llama-3.3-70b-instruct-fp8-fast');assert.equal(args.stream,false);assert.equal(args.response_format.type,'json_schema');assert.ok(args.max_tokens<=1100);
  const text=JSON.stringify(args);assert.ok(text.includes('science museum'));assert.ok(text.includes('interactive exhibits'));
  for(const secret of [uid,'synthetic-token','never-send-this-key','synthetic-publishable-key','Green Garden','pizza'])assert.ok(!text.includes(secret),secret+' must not reach AI');
 }
 assert.equal(res.headers.get('cache-control'),'no-store');assert.equal(res.headers.get('access-control-allow-origin'),ORIGIN);
 assert.equal(body.result.missingRequirements.length,0);
});
for(const [role,active,mustChange] of [['student',true,false],['teacher',false,false],['admin',false,false],['teacher',true,true],['unknown',true,false]])test('rejects '+JSON.stringify([role,active,mustChange])+' before inference',async t=>{
 const {env,calls}=setup(t,{role,active,mustChange});const res=await worker.fetch(request(),env);assert.equal(res.status,403);assert.equal(calls.ai.length,0);
});
for(const [name,options] of [['missing token',{token:''}],['wrong origin',{origin:'https://evil.example.invalid'}],['missing origin',{origin:''}]])test(name+' cannot access assessment',async t=>{
 const {env,calls}=setup(t);const res=await worker.fetch(request(submission,options),env);assert.ok([401,403].includes(res.status));assert.equal(calls.ai.length,0);assert.equal(calls.auth.length,0);
});
for(const userStatus of [401,302,503])test('Supabase auth status '+userStatus+' fails closed',async t=>{
 const {env,calls}=setup(t,{userStatus});const res=await worker.fetch(request(),env);assert.equal(res.status,userStatus===503?503:401);assert.equal(calls.ai.length,0);assert.equal(calls.auth.length,1);
});
test('profile lookup failure fails closed without reflecting provider details',async t=>{
 const {env,calls}=setup(t,{profileStatus:503});const res=await worker.fetch(request(),env);assert.equal(res.status,503);assert.equal(calls.ai.length,0);assert.ok(!(await res.text()).includes('synthetic'));
});
for(const [name,body] of [['empty task',{...submission,task:''}],['empty writing',{...submission,response:'  '}],['oversized writing',{...submission,response:'a'.repeat(6001)}],['oversized task',{...submission,task:'a'.repeat(3001)}],['unknown type',{...submission,taskType:'story'}],['missing privacy confirmation',{...submission,privacyConfirmed:false}],['personal field',{...submission,studentName:'Synthetic Identifier'}],['email in text',{...submission,response:'Contact synthetic@example.invalid about this draft.'}],['malformed JSON','{'],['wrong body type',[]]])test('rejects '+name+' before AI',async t=>{
 const {env,calls}=setup(t);const res=await worker.fetch(request(body),env);assert.equal(res.status,400);assert.equal(calls.ai.length,0);assert.ok(!(await res.text()).includes('synthetic@example.invalid'));
});
test('oversized streamed body is rejected without trusting Content-Length',async t=>{
 const {env,calls}=setup(t);const res=await worker.fetch(request(' '.repeat(13000),{headers:{'Content-Length':'1'}}),env);assert.equal(res.status,413);assert.equal(calls.ai.length,0);
});
test('OPTIONS permits only the configured origin and does not call auth or AI',async t=>{
 const {env,calls}=setup(t);const res=await worker.fetch(request(null,{method:'OPTIONS',token:''}),env);assert.equal(res.status,204);assert.equal(calls.auth.length,0);assert.equal(calls.ai.length,0);assert.ok(!res.headers.get('access-control-allow-headers').toLowerCase().includes('assessment-test-key'));
});
test('absence of environment configuration fails closed',async t=>{
 const {env,calls}=setup(t);delete env.HUB_ORIGIN;const res=await worker.fetch(request(),env);assert.equal(res.status,503);assert.equal(calls.auth.length,0);assert.equal(calls.ai.length,0);
});
test('extractor error stops grading, reports a fixed diagnostic and never leaks raw output',async t=>{
 const {env,calls}=setup(t,{replies:['{"unfinished":']});const res=await worker.fetch(request(),env);assert.equal(res.status,503);const body=await res.json();assert.equal(body.stage,'evidence_model');assert.equal(body.reason,'invalid_ai_json');assert.equal(calls.ai.length,1);
});
test('unmatched evidence cannot justify a mark',async t=>{
 const {env,calls}=setup(t,{replies:[{requirements:[],features:[{label:'invented',quote:'a nonexistent passage'}],errors:[]},assessment]});const res=await worker.fetch(request(),env);assert.equal(res.status,503);assert.equal((await res.json()).stage,'evidence_validation');assert.equal(calls.ai.length,1);
});
test('invalid grading marks are withheld after two calls',async t=>{
 const {env,calls}=setup(t,{replies:[evidence,{...assessment,contentMark:7}]});const res=await worker.fetch(request(),env);assert.equal(res.status,503);assert.equal(calls.ai.length,2);
});
test('feedback with only fabricated quotes is withheld',async t=>{
 const {env}=setup(t,{replies:[evidence,{...assessment,strengths:[{quote:'nonexistent phrase',advice:'Invented'}],improvements:[]}]});const res=await worker.fetch(request(),env);assert.equal(res.status,503);assert.equal((await res.json()).stage,'assessment_validation');
});
test('zero marks remain possible with grounded improvement feedback',async t=>{
 const {env}=setup(t,{replies:[evidence,{...assessment,contentMark:0,languageMark:0,strengths:[]}]});const res=await worker.fetch(request(),env);assert.equal(res.status,200);assert.equal((await res.json()).result.totalMark,0);
});
test('model quota failures never retry or expose raw exception contents',async t=>{
 const {env,calls}=setup(t);env.AI.run=async()=>{calls.ai.push({});throw Object.assign(new Error('Private synthetic response text'),{code:3036});};
 const res=await worker.fetch(request(),env);assert.equal(res.status,503);const body=await res.json();assert.equal(body.category,'quota_or_rate_limit');assert.ok(!JSON.stringify(body).includes('Private synthetic'));assert.equal(calls.ai.length,1);
});

// ---- Evidence quote faithfulness (regression for the live `assessment_validation / evidence_checks_failed` refusal) ----
// Harmless model deviations (case, quote-mark style, wrapped quote marks/ellipses/end punctuation, whitespace runs) must be accepted and must
// return the EXACT span from the submission. Anything that changes the student's words must still be refused.
const messy = { ...submission, response:'The museum didn’t disappoint me.  It was “fascinating”\nbecause the interactive exhibits made science easy to understand.\n\nI recommend visiting with friends.' };
function withFeedback(strengthQuote, improvementQuote = null, extra = {}) {
 return [evidence, { ...assessment, strengths:[{ quote:strengthQuote, advice:'Specific advice.' }], improvements:improvementQuote ? [{ quote:improvementQuote, advice:'More advice.' }] : [], ...extra }];
}
async function run(t, replies, body = messy) { const { env, calls } = setup(t, { replies }); const res = await worker.fetch(request(body, {}), env); return { res, calls, body:await res.json() }; }

for (const [name, quote, expected] of [
 ['exact text', 'because the interactive exhibits made science easy to understand', 'because the interactive exhibits made science easy to understand'],
 ['capitalisation changed', 'Because The Interactive Exhibits made science easy to understand', 'because the interactive exhibits made science easy to understand'],
 ['curly quote marks wrapped round the quote', '“because the interactive exhibits made science easy to understand”', 'because the interactive exhibits made science easy to understand'],
 ['straight quote marks wrapped round the quote', '"because the interactive exhibits made science easy to understand"', 'because the interactive exhibits made science easy to understand'],
 ['leading ellipsis character', '…interactive exhibits made science easy to understand', 'interactive exhibits made science easy to understand'],
 ['trailing three dots', 'interactive exhibits made science easy to understand...', 'interactive exhibits made science easy to understand'],
 ['sentence punctuation added at the end', 'I recommend visiting with friends!', 'I recommend visiting with friends'],
 ['newline in the submission collapsed to a space', 'It was “fascinating” because the interactive exhibits', 'It was “fascinating”\nbecause the interactive exhibits'],
 ['double space and curly quotes in the submission', 'The museum didn\'t disappoint me. It was "fascinating"', 'The museum didn’t disappoint me.  It was “fascinating'],
 ['paragraph break collapsed', 'easy to understand. I recommend visiting with friends', 'easy to understand.\n\nI recommend visiting with friends'],
]) test('faithful quote accepted and replaced by the exact submitted span: ' + name, async t => {
 const { res, body, calls } = await run(t, withFeedback(quote));
 assert.equal(res.status, 200, JSON.stringify(body)); assert.equal(calls.ai.length, 2);
 assert.equal(body.result.strengths[0].quote, expected);
 assert.ok(messy.response.includes(body.result.strengths[0].quote), 'displayed quote is a verbatim substring of the submission');
});

for (const [name, quote] of [
 ['paraphrase', 'the exhibits made science simple to follow'],
 ['one word changed', 'because the interactive exhibits made science hard to understand'],
 ['word added inside', 'because the very interactive exhibits made science easy to understand'],
 ['word removed inside', 'because the exhibits made science easy to understand'],
 ['comma added inside', 'The museum didn’t disappoint, me'],
 ['ellipsis joining two fragments', 'The museum didn’t disappoint me … I recommend visiting with friends'],
 ['three dots joining two fragments', 'It was fascinating ... easy to understand'],
 ['words reordered', 'easy to understand because the interactive exhibits'],
 ['text taken from the task, not the writing', 'Write a review of a science museum for a school magazine'],
 ['too short once punctuation is stripped', '“...was!”'],
 ['empty', ''],
 ['wrapped punctuation only', '…'],
]) test('unfaithful quote refused, no mark issued: ' + name, async t => {
 const { res, body } = await run(t, withFeedback(quote));
 assert.equal(res.status, 503); assert.equal(body.stage, 'assessment_validation'); assert.equal(body.detail, 'no_verifiable_feedback_quotes');
 assert.ok(!('result' in body)); assert.ok(!JSON.stringify(body).includes('museum'));
});

test('a faithful quote beside an invented one: only the faithful quote is kept', async t => {
 const { res, body } = await run(t, withFeedback('“Because the interactive exhibits made science easy to understand.”', 'a sentence the student never wrote'));
 assert.equal(res.status, 200); assert.equal(body.result.strengths.length, 1); assert.equal(body.result.improvements.length, 0);
});

test('evidence stage: harmless variants count, invented evidence does not', async t => {
 const faithful = { requirements:[{ taskQuote:'Recommend a Visit', quote:'“I recommend visiting with friends.”' }], features:[], errors:[] };
 const { res, body } = await run(t, [faithful, assessment].map((x, i) => i ? { ...x, strengths:[{ quote:'I recommend visiting with friends', advice:'ok' }] } : x));
 assert.equal(res.status, 200); assert.equal(body.result.observedEvidence[0].taskQuote, 'recommend a visit'); assert.equal(body.result.observedEvidence[0].quote, 'I recommend visiting with friends');
 const invented = await run(t, [{ requirements:[{ taskQuote:'recommend a visit', quote:'I strongly urge a visit' }], features:[{ label:'x', quote:'a nonexistent passage' }], errors:[] }, assessment]);
 assert.equal(invented.res.status, 503); assert.equal(invented.body.stage, 'evidence_validation'); assert.equal(invented.body.detail, 'no_verifiable_evidence'); assert.equal(invented.calls.ai.length, 1);
});

// Marks that break the schema (out of range, non-integer, string, missing field) are stopped even earlier, by the local schema check on the model output.
for (const [name, extra] of [['mark above range', { contentMark:7 }], ['non-integer mark', { languageMark:5.5 }], ['string mark', { contentMark:'4' }], ['negative mark', { languageMark:-1 }], ['missing next step', { nextStep:undefined }]])
 test('schema-invalid assessment is refused before validation: ' + name, async t => {
  const { res, body } = await run(t, withFeedback('because the interactive exhibits made science easy to understand', null, extra));
  assert.equal(res.status, 503); assert.equal(body.stage, 'assessment_model'); assert.ok(!('result' in body));
 });
// Schema-valid but empty text is stopped by the validation stage with a fixed diagnostic code.
test('whitespace-only reason passes the schema but is refused by validation with a fixed code', async t => {
 const { res, body } = await run(t, withFeedback('because the interactive exhibits made science easy to understand', null, { contentReason:'   ' }));
 assert.equal(res.status, 503); assert.equal(body.stage, 'assessment_validation'); assert.equal(body.detail, 'missing_text'); assert.equal(body.reason, 'evidence_checks_failed'); assert.ok(!('result' in body));
});

test('diagnostic detail never contains student writing or model output', async t => {
 const { body } = await run(t, withFeedback('Private synthetic phrase the student never wrote'));
 assert.deepEqual(Object.keys(body).sort(), ['category', 'detail', 'error', 'reason', 'stage']);
 assert.match(body.detail, /^[a-z_]+$/);
});

test('an ellipsis the student actually wrote is a faithful, contiguous quote', async t => {
 const body = { ...submission, response:'I waited... and then the lights came on. I recommend visiting with friends.' };
 const { res, body:out } = await run(t, [{ ...evidence }, { ...assessment, strengths:[{ quote:'I waited... and then the lights came on', advice:'Vivid.' }], improvements:[] }], body);
 assert.equal(res.status, 200); assert.equal(out.result.strengths[0].quote, 'I waited... and then the lights came on');
});
