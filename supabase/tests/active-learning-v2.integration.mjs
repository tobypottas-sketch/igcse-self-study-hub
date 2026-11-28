import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import pg from 'pg';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { chromium } from 'playwright-core';
// Fresh local PostgreSQL cluster only. Never supply a hosted database URL.
const pool = new pg.Pool({host:'127.0.0.1',port:55432,user:process.env.ACTIVE_TIME_QA_PGUSER,database:'postgres',ssl:false});
assert(process.env.ACTIVE_TIME_QA_PGUSER, 'Set ACTIVE_TIME_QA_PGUSER for a fresh disposable local cluster');
assert(process.env.ACTIVE_TIME_QA_DENO && process.env.ACTIVE_TIME_QA_CHROME, 'Set native Deno and Chromium executable paths');
const q = (sql, args) => pool.query(sql,args);
const root = new URL('../migrations/',import.meta.url);
const apply = name => q(readFileSync(new URL(name,root),'utf8'));
const id = Object.fromEntries(['student','other','oldTeacher','newTeacher','admin','disabled','oldClass','newClass'].map(key=>[key,randomUUID()]));
const {student,other,oldTeacher,newTeacher,admin,disabled,oldClass,newClass}=id;
await q(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth; grant usage on schema auth to public;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`);
await apply('20261013101928_self_study_foundation.sql');
await apply('20261013102345_atomic_student_transfer.sql');
await apply('20261128090000_active_learning_time_v2.sql');
await q('grant select on profiles,student_class_memberships to service_role; grant update on profiles to service_role');
for(const [key,role] of [['student','student'],['other','student'],['oldTeacher','teacher'],['newTeacher','teacher'],['admin','admin'],['disabled','student']]){
 await q('insert into auth.users values($1)',[id[key]]);
 await q('insert into profiles(id,role,display_name,school_email,active,must_change_password) values($1,$2,$3,$4,$5,false)',[id[key],role,key,key+'@example.test',key!=='disabled']);
}
await q("insert into classes (id,class_name) values ($1,'Former'),($2,'Current')",[oldClass,newClass]);
await q('insert into teacher_classes(teacher_id,class_id) values ($1,$3),($2,$4)',[oldTeacher,newTeacher,oldClass,newClass]);
const boundary = Date.now()-120000;
const iso = t => new Date(t).toISOString();
await q("insert into student_class_memberships(student_id,class_id,started_at,ended_at) values ($1,$2,$4::timestamptz-interval '1 day',$4),($1,$3,$4,null)",[student,oldClass,newClass,iso(boundary)]);
const row=(a,b,pathway='meaning',index=0)=>({item_index:index,app_key:'vocabulary_paraphrase',unit_id:'1',pathway_id:pathway,activity_id:'item:fixture:s',mode:'practice',started_at:iso(boundary+a),ended_at:iso(boundary+b)});
async function as(role,user,query,values){
 const c=await pool.connect();
 try{await c.query('begin');await c.query('set local role '+role);await c.query("select set_config('request.jwt.claim.sub',$1,true)",[user??'']);return await c.query(query,values);}
 finally{await c.query('rollback');c.release();}
}
const rpc='select persist_active_learning_v2($1,$2,$3::jsonb) as n';
const put=(student,batch,rows)=>asCommitted(student,batch,rows);
async function asCommitted(student,batch,rows){
 const c=await pool.connect();
 try{await c.query('set role service_role');return (await c.query(rpc,[student,batch,JSON.stringify(rows)])).rows[0].n;}
 finally{await c.query('reset role');c.release();}
}
const batch=randomUUID(), primary=[row(0,20000)];
assert.deepEqual((await Promise.all([put(student,batch,primary),put(student,batch,primary)])).sort(),[0,1]);
await assert.rejects(put(student,batch,[row(0,21000)]),{code:'22023'});
const broken=randomUUID();
await assert.rejects(put(student,broken,[row(21000,22000),row(23000,23000,'meaning',1)]),{code:'22023'});
assert.equal((await q('select count(*) from active_learning_batches_v2 where batch_id=$1',[broken])).rows[0].count,'0');
assert.equal(await put(student,randomUUID(),[row(10000,25000,'context')]),1);
assert.equal(await put(student,randomUUID(),[row(10000,12000,'spelling_recall')]),1);
assert.equal(await put(student,randomUUID(),[row(25000,30000)]),1);
assert.equal(await put(student,randomUUID(),[row(-10000,-5000)]),1);
assert.equal(await put(student,randomUUID(),[row(-3000,1000)]),1);
assert.equal(await put(other,randomUUID(),[row(30000,31000)]),1);
await assert.rejects(put(disabled,randomUUID(),primary),{code:'42501'});
await assert.rejects(as('authenticated',student,rpc,[student,randomUUID(),'[]']),{code:'42501'});
await assert.rejects(as('authenticated',student,'insert into active_learning_intervals_v2 default values'),{code:'42501'});
await assert.rejects(as('anon',null,'select * from active_learning_intervals_v2'),{code:'42501'});
await assert.rejects(as('service_role',null,'update active_learning_batches_v2 set manifest=\'[]\''),{code:'42501'});
for(const [user,count] of [[student,6],[other,1],[oldTeacher,0],[newTeacher,6],[admin,7],[disabled,0]]){
 assert.equal(Number((await as('authenticated',user,'select count(*) from active_learning_intervals_v2')).rows[0].count),count);
}
const cross=(await q('select class_id from active_learning_intervals_v2 where started_at=$1',[iso(boundary-3000)])).rows;
assert.equal(cross[0].class_id,null);
assert.equal((await q('select class_id from active_learning_intervals_v2 where student_id=$1',[other])).rows[0].class_id,null);
const report=`select pathway_id,sum(extract(epoch from ended_at-started_at))::integer as seconds
 from active_learning_v2_segments($1,$2,$3) group by pathway_id order by pathway_id`;
const args=[iso(boundary+5000),iso(boundary+27000),student];
assert.deepEqual((await as('authenticated',newTeacher,report,args)).rows,[{pathway_id:'context',seconds:5},{pathway_id:'meaning',seconds:17}]);
assert.deepEqual((await as('authenticated',oldTeacher,report,args)).rows,[]);
async function total(){
 return (await as('authenticated',student,`select sum(extract(epoch from ended_at-started_at))::integer as seconds
  from active_learning_v2_segments($1,$2,$3)`,[iso(boundary),iso(boundary+30000),student])).rows[0].seconds;
}
assert.equal(await total(),30);
console.log('PostgreSQL: replay race, atomic failure, role isolation, transfer attribution and clipped union passed');

const fixtureItem = 'sandbox_word';
const fixtureOccurrence = 'u1_sandbox_word';
const sdk = new URL('../../node_modules/@supabase/supabase-js/dist/umd/supabase.js',import.meta.url);
const project = new URL('../../',import.meta.url);
const user = {id:student, aud:'authenticated', role:'authenticated', email:'synthetic@example.test'};
const jwt = `test.${Buffer.from(JSON.stringify({sub:student,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.test`;
let unavailable = false;

const gateway = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const respond = (status, data) => {
    res.writeHead(status, {'content-type':'application/json'});
    res.end(JSON.stringify(data));
  };
  try {
    if (url.pathname === '/idle') { res.end('<title>Other tab</title>'); return; }
    if (url.pathname === '/sdk.js') {
      res.writeHead(200, {'content-type':'text/javascript'}); res.end(readFileSync(sdk)); return;
    }
    if (/^\/src\/(tracking|vocabulary)\/[a-z-]+\.js$/.test(url.pathname)) {
      res.writeHead(200, {'content-type':'text/javascript'});
      res.end(readFileSync(new URL(url.pathname.slice(1),project))); return;
    }
    if (url.pathname === '/auth/v1/token') {
      respond(200,{access_token:jwt,refresh_token:'fixture',expires_in:3600,token_type:'bearer',user}); return;
    }
    if (url.pathname === '/auth/v1/user') {
      if(req.headers.authorization===`Bearer ${jwt}`)respond(200,user);
      else respond(401,{msg:'Invalid synthetic session'});
      return;
    }
    if (url.pathname === '/rest/v1/profiles') {
      const {rows}=await q('select id,role,active,must_change_password from profiles where id=$1',[student]);
      respond(200, rows[0]); return;
    }
    if (url.pathname === '/rest/v1/vocabulary_set_members') {
      respond(200,url.searchParams.get('occurrence_id')===`eq.${fixtureOccurrence}`?[{occurrence_id:fixtureOccurrence}]:[]); return;
    }
    if (url.pathname === '/rest/v1/vocabulary_unit_occurrences') {
      respond(200,{unit_number:1,vocabulary_id:fixtureItem,sense_id:'s',status:'live',active:true}); return;
    }
    if (url.pathname === '/rest/v1/vocabulary_items') {
      respond(200,{status:'live',senses:[{senseId:'s'}]}); return;
    }
    const chunks=[];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    if (url.pathname === '/rest/v1/rpc/persist_active_learning_v2') {
      if(unavailable) { respond(503,{message:'Synthetic persistence outage'}); return; }
      try {
        const args=JSON.parse(body);
        respond(200,await put(args.p_student,args.p_batch,args.p_rows));
      } catch (error) {
        respond(400,{message:'Persistence rejected',code:error.code});
      }
      return;
    }
    if (url.pathname === '/functions/v1/active-learning-ingest') {
      const upstream=await fetch('http://127.0.0.1:8000/',{method:'POST',headers:{
        authorization:req.headers.authorization??'', 'content-type':'application/json'
      },body});
      respond(upstream.status,await upstream.json()); return;
    }
    const html=`<!doctype html><title>Synthetic vocabulary timing fixture</title>
      <button id="start">Begin pathway</button><button id="finish">Finish</button><main></main>
      <script src="/sdk.js"></script><script type="module">
      import {installVocabularyTiming} from '/src/vocabulary/active-learning-browser.js';
      import {createActiveLearningTransport} from '/src/tracking/active-learning-transport.js';
      import {createDurableTimingOutbox} from '/src/tracking/durable-timing-outbox.js';
      import {createActiveLearningClock} from '/src/tracking/active-learning-clock.js';
      const client=supabase.createClient(location.origin,'synthetic-key');
      const {data,error}=await client.auth.signInWithPassword({email:'synthetic@example.test',password:'fixture'});
      if(error)throw error;
      const user=data.user.id;
      const root=document.querySelector('main');
      const state={currentUnitNumber:1,pathwayId:'meaning',session:{}};
      const transport=createActiveLearningTransport({client});
      const outbox=createDurableTimingOutbox({storage:localStorage,userId:user,currentUserId:()=>user,send:transport,id:()=>crypto.randomUUID()});
      let elapsed=0;
      const wall=Date.now()-15000;
      const clock=createActiveLearningClock({now:()=>elapsed,wallNow:()=>wall+elapsed});
      const bridge=installVocabularyTiming({enabled:true,root,state,doc:document,win:window,outbox,clock});
      window.qa={advance:ms=>{elapsed+=ms;},flush:()=>outbox.flush()};
      document.querySelector('#start').onclick=()=>{
        state.current={target:{occurrenceId:'${fixtureOccurrence}'},question:{contentId:'item:${fixtureItem}:s',type:'definition_to_word'}};
        root.innerHTML='<section data-study-question><button>Answer</button></section>';
        bridge.sync();
        root.querySelector('button').onclick=()=>{root.querySelector('button').textContent='Feedback';};
      };
      document.querySelector('#finish').onclick=()=>bridge.stop();
      </script>`;
    res.writeHead(200,{'content-type':'text/html'});res.end(html);
  } catch {
    respond(500,{error:'Synthetic fixture error'});
  }
});
gateway.listen(0,'127.0.0.1');
await once(gateway,'listening');
const origin=`http://127.0.0.1:${gateway.address().port}`;
const deno = spawn(process.env.ACTIVE_TIME_QA_DENO,['run','--allow-net=127.0.0.1,0.0.0.0:8000','--allow-env',
  new URL('../functions/active-learning-ingest/index.ts',import.meta.url).pathname],{
  cwd:project,
  env:{...process.env,ACTIVE_LEARNING_V2_ENABLED:'true',SUPABASE_URL:origin,
    SUPABASE_PUBLISHABLE_KEYS:'{"default":"fixture-publishable"}',SUPABASE_SECRET_KEYS:'{"default":"fixture-secret"}'},
  stdio:['ignore','pipe','pipe']
});
const running = new Promise((resolve,reject)=>{
  deno.stderr.on('data',data=>{if(data.toString().includes('Listening on'))resolve();});
  deno.stdout.on('data',data=>{if(data.toString().includes('Listening on'))resolve();});
  deno.once('exit',code=>reject(Error(`Deno stopped during startup (${code})`)));
});
let browser;
try {
  await running;
  const endpoint=origin+'/functions/v1/active-learning-ingest';
  async function submit(batch,token=jwt,expectedUserId=student){
    return fetch(endpoint,{method:'POST',headers:{authorization:`Bearer ${token}`},body:JSON.stringify({expectedUserId,batch})});
  }
  const now=Date.now();
  const batch={id:randomUUID(),createdAt:now,intervals:[{startMs:now-2000,endMs:now-1000,context:{
    module:'vocabulary_paraphrase',unit:1,pathway:'meaning',mode:'practice',occurrence:fixtureOccurrence,activity:`item:${fixtureItem}:s`,questionType:'definition_to_word',source:'item'
  }}]};
  assert.equal((await submit(batch,'other')).status,401);
  assert.equal((await submit(batch,jwt,other)).status,403);
  const invalid={...batch,intervals:[{...batch.intervals[0],startMs:now-86410000}]};
  const bad=await submit(invalid);
  assert.equal(bad.status,422); assert.equal((await bad.json()).batchId,batch.id);
  unavailable=true;
  assert.equal((await submit(batch)).status,503);
  unavailable=false;
  for(const inserted of [1,0]){
    const response=await submit(batch);
    assert.equal(response.status,200);
    assert.deepEqual(await response.json(),{batchId:batch.id,accepted:1,inserted});
  }
  console.log('Deno endpoint: session, identity, expiry, persistence failure, success and replay HTTP checks passed');

  const before=await q('select count(*) from active_learning_intervals_v2');
  browser=await chromium.launch({executablePath:process.env.ACTIVE_TIME_QA_CHROME,headless:true,args:['--no-sandbox']});
  for(const [width,height] of [[1280,840],[820,1080],[390,844]]){
    const context=await browser.newContext({viewport:{width,height}});
    const page=await context.newPage();
    page.setDefaultTimeout(7000);
    await page.goto(origin);
    await page.waitForFunction(()=>Boolean(window.qa));
    await page.evaluate(()=>qa.advance(2000)); // Access / pathway chooser.
    await page.click('#start');
    await page.evaluate(()=>qa.advance(3000));
    await page.getByText('Answer',{exact:true}).click();
    await page.evaluate(()=>qa.advance(2000)); // Feedback.
    const saved=page.waitForResponse(r=>r.url()===endpoint&&r.status()===200&&r.request().postDataJSON()?.batch?.intervals?.at(-1)?.endMs!=null);
    saved.catch(()=>{});
    if(width===390)await context.setOffline(true);
    await page.click('#finish');
    if(width===390){
      await page.waitForFunction(()=>Object.keys(localStorage).some(key=>key.startsWith('hub-active-v2:')));
      await context.setOffline(false);
      await page.evaluate(()=>qa.flush());
    }
    const acknowledgement = await (await saved).json();
    assert.equal(acknowledgement.inserted,acknowledgement.accepted);
    await page.evaluate(()=>qa.flush());
    const totals=(await q(`select sum(extract(epoch from ended_at-started_at))::integer as seconds
      from active_learning_intervals_v2 where batch_id=$1`,[acknowledgement.batchId])).rows;
    assert.equal(totals[0].seconds,5);
    await page.evaluate(()=>qa.advance(4000)); // Stale feedback DOM after stop.
    await page.evaluate(()=>qa.flush());
    await context.close();
  }
  const after=await q('select count(*) from active_learning_intervals_v2');
  assert(Number(after.rows[0].count)>Number(before.rows[0].count));
  console.log('Chromium: authenticated fixture → native Deno Edge code → PostgreSQL, exact five seconds across three viewport widths, including mobile offline recovery');
} finally {
  await browser?.close();
  deno.kill();
  gateway.close();
  await pool.end();
}
