import assert from 'node:assert/strict';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { performance } from 'node:perf_hooks';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import unit from '../../content/vocabulary/releases/unit-02.js';
import { releasePlannerContent } from '../../content/vocabulary/readiness-report.js';
import { buildPathwayCoverage } from '../../src/vocabulary/pathway-coverage.js';
import { setsFromCoverage } from '../../src/vocabulary/pathway-sets.js';
import { serve } from '../../tests/helpers/pathway-geometry-harness.mjs';
import { FAKE_SUPABASE } from '../../tests/helpers/question-latency-harness.mjs';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

// Disposable loopback cluster only. Secrets below are generated per test.
const {ACTIVE_TIME_QA_PGUSER:user, ACTIVE_TIME_QA_AUTH:authBin,
  ACTIVE_TIME_QA_POSTGREST:restBin, ACTIVE_TIME_QA_DENO:deno} = process.env;
assert(user && authBin && restBin && deno, 'Provide disposable PostgreSQL, Auth, PostgREST and Deno executables');
const db = `postgresql://${encodeURIComponent(user)}@127.0.0.1:55432/postgres?sslmode=disable`;
const pool = new pg.Pool({connectionString:db});
const q = (sql, values) => pool.query(sql,values);
const migration = file => readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8');
const secret = randomBytes(48).toString('hex');
const token = (role, extra={}) => {
  const payload = Buffer.from(JSON.stringify({role,exp:Math.floor(Date.now()/1000)+3600,...extra})).toString('base64url');
  const unsigned = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'+payload;
  return unsigned+'.'+createHmac('sha256',secret).update(unsigned).digest('base64url');
};
const anon = token('anon'), service = token('service_role');
const children=[];
const origins = {auth:'http://127.0.0.1:55434',rest:'http://127.0.0.1:55435',edge:'http://127.0.0.1:8000'};
let gateway, web, browser;
function launch(label, command, args, env){
  const child=spawn(command,args,{env:{...process.env,...env},stdio:'ignore'});
  child.on('error',error=>{child.startupError=error;});
  children.push(child);
  return {child,label};
}
async function waitHTTP({child,label},url,init){
  for(let i=0;i<100;i++){
    if(child.startupError||child.exitCode!==null)throw Error(label+' stopped before readiness');
    const response=await fetch(url,init).catch(()=>null);
    if(response?.ok)return;
    await delay(100);
  }
  throw Error(label+' startup timed out');
}
try {
  await q(`do $$ begin
    if not exists (select 1 from pg_roles where rolname='postgres') then create role postgres nologin; end if;
  end $$;
    create role supabase_auth_admin nologin; create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; grant usage on schema auth to authenticated;`);
  const authEnv={
    GOTRUE_DB_DRIVER:'postgres',GOTRUE_DB_DATABASE_URL:db+'&search_path=auth,public',GOTRUE_DB_NAMESPACE:'auth',
    GOTRUE_DB_MIGRATIONS_PATH:new URL('.',`file://${authBin}`).pathname+'migrations',
    GOTRUE_SITE_URL:'http://127.0.0.1:55434',API_EXTERNAL_URL:origins.auth,
    GOTRUE_API_HOST:'127.0.0.1',GOTRUE_API_PORT:'55434',
    GOTRUE_JWT_SECRET:secret,GOTRUE_JWT_AUD:'authenticated',GOTRUE_JWT_DEFAULT_GROUP_NAME:'authenticated',
    GOTRUE_JWT_ADMIN_ROLES:'service_role',GOTRUE_EXTERNAL_EMAIL_ENABLED:'true',GOTRUE_MAILER_AUTOCONFIRM:'true'
  };
  const migrate=launch('Auth migrations',authBin,['migrate'],authEnv);
  assert.equal((await once(migrate.child,'exit'))[0],0,'Auth migrations failed');
  const auth=launch('Supabase Auth',authBin,['serve'],authEnv);
  await waitHTTP(auth,origins.auth+'/health');
  for(const name of ['20261013101928_self_study_foundation.sql','20261013102345_atomic_student_transfer.sql',
    '20261017051500_vocabulary_builder_foundation.sql','20261017095000_vocabulary_unit_activities.sql']){
    await q(migration(name));
  }
  await q(migration('20261024170000_vocabulary_set_membership.sql').split('-- BEGIN GENERATED MEMBERS')[0]);
  await q(migration('20261128090000_active_learning_time_v2.sql'));
  await q(`grant select,update on profiles to service_role;
    grant select on student_class_memberships,vocabulary_set_members,vocabulary_items,
    vocabulary_unit_occurrences,vocabulary_contexts,vocabulary_unit_activities to service_role;
    insert into vocabulary_items(vocabulary_id,term,part_of_speech,core_meaning,senses,status)
    values ('synthetic','synthetic','adjective','fixture','[{"senseId":"s"}]','live');
    insert into vocabulary_unit_occurrences(occurrence_id,vocabulary_id,unit_number,unit_title,set_number,position_in_unit,sense_id,status)
    values ('u1_synthetic','synthetic',1,'Synthetic',1,1,'s','live');
    insert into vocabulary_set_members(unit_number,pathway_id,set_number,position,occurrence_id)
    values (1,'meaning',1,1,'u1_synthetic');`);
  const rest=launch('PostgREST',restBin,[],{PGRST_DB_URI:db,PGRST_DB_SCHEMAS:'public',
    PGRST_DB_ANON_ROLE:'anon',PGRST_SERVER_HOST:'127.0.0.1',PGRST_SERVER_PORT:'55435',PGRST_JWT_SECRET:secret});
  await waitHTTP(rest,origins.rest+'/',{headers:{Authorization:`Bearer ${service}`}});

  // Lightweight loopback router. Auth and PostgREST validate real JWTs.
  gateway=createServer(async(req,res)=>{
    try {
      const match=/^\/(auth|rest|functions)\/v1(\/.*)$/.exec(req.url);
      if(!match){ res.writeHead(404).end(); return; }
      const [,part,path]=match;
      const upstream=await fetch(origins[part==='functions'?'edge':part]+(part==='functions'?'/':path),{
        method:req.method,headers:Object.fromEntries(Object.entries(req.headers).filter(([key])=>key!=='host')),
        ...(['GET','HEAD'].includes(req.method)?{}:{body:req,duplex:'half'})
      });
      const headers=Object.fromEntries(upstream.headers);
      delete headers['content-encoding']; delete headers['content-length'];
      res.writeHead(upstream.status,headers).end(Buffer.from(await upstream.arrayBuffer()));
    } catch { res.writeHead(502).end(); }
  });
  gateway.listen(0,'127.0.0.1');
  await once(gateway,'listening');
  const url=`http://127.0.0.1:${gateway.address().port}`;
  const edge=launch('Deno Edge',deno,['run','--allow-net=127.0.0.1,0.0.0.0:8000','--allow-env',
    'supabase/functions/active-learning-ingest/index.ts'],{
    ACTIVE_LEARNING_V2_ENABLED:'true',SUPABASE_URL:url,
    SUPABASE_PUBLISHABLE_KEYS:JSON.stringify({default:anon}),SUPABASE_SECRET_KEYS:JSON.stringify({default:service})
  });
  await waitHTTP(edge,origins.edge+'/',{method:'OPTIONS'});

  const options={auth:{persistSession:false,autoRefreshToken:false}};
  const admin=createClient(url,service,options);
  async function createAccount(role='student',eligible=true,active=true,passwordRequired=false){
    const email=randomUUID()+'@example.test', password=randomBytes(24).toString('hex');
    const created=await admin.auth.admin.createUser({email,password,email_confirm:true});
    assert(created.data.user && !created.error,'Synthetic user creation failed');
    const id=created.data.user.id;
    await q('insert into profiles(id,role,active,must_change_password,school_email,display_name) values($1,$2,$3,$4,$5,$2::public.user_role::text)',
      [id,role,active,passwordRequired,email]);
    if(eligible)await q("insert into active_learning_v2_pilot_windows(student_id,starts_at) values($1,now()-interval '1 minute')",[id]);
    const client=createClient(url,anon,options);
    const signed=await client.auth.signInWithPassword({email,password});
    assert(signed.data.session&&!signed.error,'Synthetic password sign-in failed');
    return {client,id,token:signed.data.session.access_token,refresh:signed.data.session.refresh_token};
  }
  function request(account,bearer=account.token){
    const startMs=Date.now()-3000;
    return fetch(url+'/functions/v1/active-learning-ingest',{
      method:'POST',headers:{Authorization:`Bearer ${bearer}`,'Content-Type':'application/json'},
      body:JSON.stringify({expectedUserId:account.id,batch:{id:randomUUID(),createdAt:Date.now(),intervals:[
        {startMs,endMs:startMs+1000,context:{module:'vocabulary_paraphrase',mode:'practice',unit:1,
          pathway:'meaning',occurrence:'u1_synthetic',questionType:'definition_to_word',source:'item',activity:'item:synthetic:s'}}
      ]}})
    });
  }
  const [student,uncovered,staff,adminAccount,disabled,reset]=await Promise.all([
    createAccount(),createAccount('student',false),createAccount('teacher'),
    createAccount('admin'),createAccount('student',true,false),createAccount('student',true,true,true)
  ]);
  assert.equal((await student.client.rpc('active_learning_v2_pilot_enabled',{p_student:student.id})).data,true);
  assert.equal((await uncovered.client.rpc('active_learning_v2_pilot_enabled',{p_student:student.id})).data,false);
  for(const account of [uncovered,staff,adminAccount,disabled,reset])assert.equal((await request(account)).status,403);
  assert.equal((await request(student,token('authenticated',{sub:student.id,exp:1}))).status,401);
  assert.equal((await request(student)).status,200);
  await q('update active_learning_v2_pilot_windows set ends_at=statement_timestamp() where student_id=$1',[student.id]);
  const revoked=await request(student);
  assert.equal(revoked.status,403);
  assert.equal((await revoked.json()).code,'pilot_access_required');
  const report=await student.client.rpc('active_learning_v2_segments',{
    p_from:new Date(Date.now()-60000).toISOString(),p_to:new Date().toISOString(),p_student:student.id
  });
  assert.equal(report.error,null);
  assert.equal(report.data.length,1);
  assert.equal(Date.parse(report.data[0].ended_at)-Date.parse(report.data[0].started_at),1000);
  console.log('Native Auth, PostgREST, Deno and PostgreSQL passed password, pilot, role, expiry and reporting checks.');
  if(process.env.ACTIVE_TIME_QA_CHROME){
    const coverage=buildPathwayCoverage({content:releasePlannerContent(unit)});
    const members=Object.entries(coverage).flatMap(([pathway,row])=>
      setsFromCoverage(pathway,row,unit.occurrences.map(o=>o.occurrenceId)).setList.flatMap(set=>
        set.members.map((occurrence,index)=>({unit_number:2,pathway_id:pathway,set_number:set.setNumber,
          position:index+1,occurrence_id:occurrence}))
      )
    );
    const catalogue=execFileSync(process.execPath,
      ['scripts/export-vocabulary-sql.mjs','content/vocabulary/releases/unit-02.js'],{encoding:'utf8'});
    await q(catalogue.replace(/^---(?:BEGIN|END) VOCAB SQL CHUNK [0-9]+---$/gm,''));
    await q('insert into vocabulary_set_members select * from jsonb_populate_recordset(null::vocabulary_set_members,$1::jsonb)',
      [JSON.stringify(members)]);
    web=await serve(fileURLToPath(new URL('../../',import.meta.url)));
    browser=await chromium.launch({executablePath:process.env.ACTIVE_TIME_QA_CHROME,headless:true});
    const sdk=readFileSync(new URL('../../node_modules/@supabase/supabase-js/dist/umd/supabase.js',import.meta.url),'utf8');
    const entrypoint=readFileSync(new URL('../../src/vocabulary/active-learning-browser.js',import.meta.url),'utf8');
    const legacy=FAKE_SUPABASE.replace('unit-01.js','unit-02.js').replace('unit_number:1, set_number:1, stage:', 'unit_number:2, set_number:1, stage:')
      .replace('export async function getSupabaseClient','async function fakeClient');
    const exercises=[...Object.keys(coverage).map(pathway=>[pathway,'recognise']),
      ['context','match'],['spelling_recall','recall']];
    for(const [index,[pathway,stage]] of exercises.entries()){
      const width=[1280,820,390][index%3];
      const account=await createAccount();
      const page=await browser.newPage({viewport:{width,height:900}});
      page.setDefaultTimeout(9000);
      try {
        // Real Hub router and app. Only unrelated legacy mission/attempt/reward
        // APIs use fixtures. Auth, catalogue, membership and timing are native.
        if(stage!=='recognise')await page.addInitScript(value=>{window.__fakeStage=value;},{pathway,stage});
        await page.addInitScript({content:sdk+';globalThis.__qaSdk=supabase;'});
        await page.route('**/src/supabase.js',route=>route.fulfill({contentType:'text/javascript',body:legacy+
          `let pending;
          export function getSupabaseClient(){
            return pending??=(async()=>{
              const actual=globalThis.__qaSdk.createClient(location.origin,${JSON.stringify(anon)},{auth:{persistSession:false,autoRefreshToken:false}});
              const {error}=await actual.auth.setSession(${JSON.stringify({access_token:account.token,refresh_token:account.refresh})});
              if(error)throw error;
              const fallback=await fakeClient();
              return {auth:actual.auth,
                from:table=>table==='profiles'||table==='vocabulary_set_members'||['vocabulary_unit_occurrences','vocabulary_items','vocabulary_contexts','vocabulary_unit_activities'].includes(table)
                  ? actual.from(table):fallback.from(table),
                rpc:(name,args)=>name==='active_learning_v2_pilot_enabled'?actual.rpc(name,args)
                  : name==='start_vocabulary_mission'
                    ? Promise.resolve({data:{mission_id:'synthetic-mission',mission_seed:'synthetic-seed',pathway_stage:${JSON.stringify(stage)},set_number:1,set_phase:'stage',weak_target_ids:[]},error:null})
                    : Promise.resolve({data:null,error:{message:'Unsupported fixture RPC'}}),
                functions:{invoke:(name,opts)=>name==='active-learning-ingest'?actual.functions.invoke(name,opts)
                  : name==='vocabulary-diagnostic'?Promise.resolve({data:{completed:true},error:null}):fallback.functions.invoke(name,opts)}};
            })();
          }`}));
        await page.route('**/src/vocabulary/active-learning-browser.js',route=>route.fulfill({
          contentType:'text/javascript',body:entrypoint.replace('VOCABULARY_ACTIVE_TIME_V2_ENABLED=false','VOCABULARY_ACTIVE_TIME_V2_ENABLED=true')
        }));
        await page.route(/\/(auth|rest|functions)\/v1\//,async route=>{
          const request=new URL(route.request().url());
          const response=await route.fetch({url:url+request.pathname+request.search});
          await route.fulfill({response});
        });
        await page.goto(web.origin+'/vocabulary.html');
        await page.locator('.vocab-unit-card[data-unit="2"]').click();
        await page.locator(`.vocab-pathway-card[data-pathway="${pathway}"]`).click();
        await page.locator(`[data-action="start-recommended"][data-pathway="${pathway}"]`).click();
        const question=page.locator('[data-study-question]');
        await question.waitFor();
        if(stage==='match'){
          await question.locator('[data-match-card]').first().click();
          await question.locator('button[type="submit"]').click();
        } else if(stage==='recall'){
          await question.locator('input[name="answer"]').fill('synthetic');
          await page.keyboard.press('Enter');
        } else {
          const choice=question.locator('button[data-choice-answer]').first();
          if(width===1280){ await choice.focus(); await page.keyboard.press('Enter'); }
          else await choice.click();
        }
        await question.locator('[data-study-feedback]').waitFor();
        await page.locator('[data-action="leave-session"]').click();
        const rows=await q('select student_id,unit_id,pathway_id from active_learning_intervals_v2 where student_id=$1',[account.id]);
        // Saving runs asynchronously after leave. Poll only the disposable DB.
        const credited=rows.rows.length?rows.rows:await (async()=>{
          for(let i=0;i<35;i++){
            await delay(100);
            const result=await q('select student_id,unit_id,pathway_id from active_learning_intervals_v2 where student_id=$1',[account.id]);
            if(result.rows.length)return result.rows;
          }
          return [];
        })();
        assert(credited.length>0,`No stored timing for ${pathway}`);
        assert(credited.every(row=>row.student_id===account.id&&row.unit_id==='2'&&row.pathway_id===pathway));
        const authoritative=await account.client.rpc('active_learning_v2_segments',{
          p_from:new Date(Date.now()-60000).toISOString(),p_to:new Date().toISOString(),p_student:account.id
        });
        assert.equal(authoritative.error,null);
        assert(authoritative.data.length>0&&authoritative.data.every(row=>row.unit_id==='2'&&row.pathway_id===pathway));
        console.log(`Vocabulary browser ${pathway}/${stage} (${width}px) stored attributed timing.`);
      } finally { await page.close(); }
    }
  }
  const accounts=[];
  while(accounts.length<100){
    accounts.push(...await Promise.all(Array.from({length:Math.min(10,100-accounts.length)},()=>createAccount())));
  }
  for(const size of [20,50,100]){
    const start=performance.now();
    const elapsed=await Promise.all(accounts.slice(0,size).map(async account=>{
      const begin=performance.now();
      const result=await request(account);
      assert.equal(result.status,200);
      assert.equal((await result.json()).inserted,1);
      return performance.now()-begin;
    }));
    elapsed.sort((a,b)=>a-b);
    const p95=elapsed[Math.ceil(.95*size)-1];
    console.log(`${size}/${size} students accepted; wall ${Math.round(performance.now()-start)} ms, p95 ${Math.round(p95)} ms`);
  }
} finally {
  await browser?.close();
  web?.server.close();
  for(const child of children.reverse())child.kill();
  gateway?.close();
  await pool.end();
}
