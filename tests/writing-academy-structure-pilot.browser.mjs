import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHmac,randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {Client} from 'pg';
import {chromium} from 'playwright';
import {build} from 'esbuild';

const dbUrl = new URL(process.env.WRITING_PILOT_TEST_DATABASE_URL);
assert.equal(dbUrl.hostname,'127.0.0.1');
assert.equal(dbUrl.pathname,'/writing_structure_pilot_test');
const restPort=56542;
const sitePort=8768;
const restOrigin='http://127.0.0.1:'+restPort;
const siteOrigin='http://127.0.0.1:'+sitePort;
const secret=randomBytes(40).toString('hex');
const [student, other, unenrolled, teacher, otherTeacher, inactive, pending, classId] = Array.from({length:8},(_,n)=>
  '00000000-0000-4000-8000-'+String(n+1).padStart(12,'0'));
const database=new Client({connectionString:dbUrl.href});
let rest,site,browser;

const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
function token(user) {
  const body=encode({alg:'HS256',typ:'JWT'})+'.'+encode({role:'authenticated',sub:user,exp:Math.floor(Date.now()/1000)+900});
  return body+'.'+createHmac('sha256',secret).update(body).digest('base64url');
}
async function request(path,{user,payload}={}) {
  const response=await fetch(restOrigin+'/'+path,{
    method:payload?'POST':'GET',
    headers:{'Content-Type':'application/json','Connection':'close',...(user?{Authorization:'Bearer '+token(user)}:{})},
    body:payload?JSON.stringify(payload):undefined
  });
  return {status:response.status,data:await response.json()};
}
async function waitFor(url) {
  for(let n=0;n<60;n++){
    try { if ((await fetch(url)).ok) return; } catch { /* service still starting */ }
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  throw Error('Test service did not become ready '+url);
}

try {
  await database.connect();
  assert.equal((await database.query("select count(*)::int n from information_schema.tables where table_schema='public'")).rows[0].n,0);
  for(const file of [
    'supabase/tests/writing_persistence_baseline.sql',
    'supabase/migrations/20261013101928_self_study_foundation.sql',
    'supabase/migrations/20261124130000_student_writing_submissions.sql',
    'supabase/migrations/20261126090000_writing_academy_persistence.sql',
    'supabase/migrations/20261126150000_writing_structure_progress_pilot.sql'
  ]) await database.query(await readFile(file,'utf8'));
  await database.query(`
    create role authenticator login noinherit;
    grant anon,authenticated to authenticator;
    create or replace function auth.uid() returns uuid language sql stable as $$
      select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid
    $$;
    insert into public.apps(app_key,display_name,launch_url) values ('review_writing','Review Writing','review-writing.html');
    insert into auth.users(id) values ${[student,other,unenrolled,teacher,otherTeacher,inactive,pending].map(id=>"('"+id+"')").join(',')};
    insert into public.profiles(id,role,active,must_change_password,display_name,school_email) values
      ('${student}','student',true,false,'Pilot Student','student@example.invalid'),
      ('${other}','student',true,false,'Other Student','other@example.invalid'),
      ('${unenrolled}','student',true,false,'Unenrolled','unenrolled@example.invalid'),
      ('${teacher}','teacher',true,false,'Class Teacher','teacher@example.invalid'),
      ('${otherTeacher}','teacher',true,false,'Other Teacher','other-teacher@example.invalid'),
      ('${inactive}','student',false,false,'Inactive','inactive@example.invalid'),
      ('${pending}','student',true,true,'Pending Setup','pending@example.invalid');
    insert into public.classes(id,class_name) values ('${classId}','Pilot Class');
    insert into public.teacher_classes(teacher_id,class_id) values ('${teacher}','${classId}');
    insert into public.student_class_memberships(student_id,class_id) values ('${student}','${classId}');
    insert into private.writing_structure_progress_pilot values ('${student}'),('${other}'),('${inactive}'),('${pending}');
  `);
  const restUrl=new URL(dbUrl);
  restUrl.username='authenticator';
  rest=spawn(process.env.WRITING_PILOT_POSTGREST_BIN,{
    env:{...process.env,PGRST_DB_URI:restUrl.href,PGRST_DB_ANON_ROLE:'anon',PGRST_DB_CHANNEL_ENABLED:'false',
      PGRST_JWT_SECRET:secret,PGRST_SERVER_HOST:'127.0.0.1',PGRST_SERVER_PORT:String(restPort)}
  });
  rest.stderr.pipe(process.stderr);
  site=spawn('python3',['-m','http.server',String(sitePort),'--bind','127.0.0.1']);
  await Promise.all([waitFor(restOrigin),waitFor(siteOrigin)]);
  const rpc='rpc/save_writing_structure_pilot_stage';
  const payload={p_stage:'apply',p_expected_revision:0};
  assert.equal((await request(rpc,{payload})).status,401);
  for (const user of [unenrolled,inactive,pending,teacher,otherTeacher]) {
    assert.equal((await request(rpc,{user,payload})).status,403);
  }

  const bundle=(await build({stdin:{resolveDir:process.cwd(),contents:"export {createClient} from '@supabase/supabase-js'"},
    write:false,bundle:true,format:'esm',platform:'browser'})).outputFiles[0].text;
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE});
  async function device(user) {
    const context=await browser.newContext();
    const page=await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror',error=>console.error(error));
    await page.route('**/test-supabase-client.js',route=>route.fulfill({contentType:'application/javascript',body:bundle}));
    await page.route('**/src/supabase.js',route=>route.fulfill({contentType:'application/javascript',body:`
      import {createClient} from '/test-supabase-client.js';
      export async function getSupabaseClient(){
        const client=createClient(location.origin,'local-test-key',{
          accessToken:async()=>${JSON.stringify(token(user))}
        });
        client.auth={
          getUser:async()=>({data:{user:{id:${JSON.stringify(user)}}}}),
          onAuthStateChange(){}
        };
        return client;
      }
    `}));
    // Same-origin proxy serves only the local PostgREST API. Auth identity is synthetic.
    await page.route('**/rest/v1/**',async route=>{
      const original=route.request();
      const headers=await original.allHeaders();
      const upstream=await fetch(original.url().replace(siteOrigin+'/rest/v1',restOrigin),{
        method:original.method(),
        headers:{connection:'close',...Object.fromEntries(['accept','authorization','content-type','content-profile'].filter(key=>headers[key]).map(key=>[key,headers[key]]))},
        body:original.postData()??undefined
      });
      const body=await upstream.text();

      await route.fulfill({status:upstream.status,headers:Object.fromEntries(upstream.headers),body});
    });
    await page.goto(siteOrigin+'/review-structure-pilot.html');
    await page.locator('#writingAcademy[aria-busy=false]').waitFor();
    if(user!==unenrolled) assert.equal(await page.getByRole('alert').count(),0,await page.locator('#writingAcademy').innerText());
    return {context,page};
  }
  const first=await device(student);
  await first.page.locator('.wa-stage-tab[data-stage=apply]').click();
  await first.page.getByText('Your place is saved.',{exact:true}).waitFor();
  const second=await device(student);
  assert.equal(await second.page.locator('.wa-stage-tab[aria-current=step]').getAttribute('data-stage'),'apply');
  assert.equal(await second.page.locator('.wa-apply-desk textarea').inputValue(),'');
  const isolated=await device(other);
  assert.equal(await isolated.page.locator('.wa-stage-tab[aria-current=step]').getAttribute('data-stage'),'discover');
  const locked=await device(unenrolled);
  await locked.page.getByText('This account is not enrolled in the Structure pilot.',{exact:false}).waitFor();
  assert.equal(await locked.page.locator('.wa-stage-tab').count(),0);

  const progress='writing_pathway_progress?student_id=eq.'+student;
  assert.deepEqual((await request(progress,{user:other})).data,[]);
  assert.deepEqual((await request(progress,{user:otherTeacher})).data,[]);
  const teacherRows=(await request(progress,{user:teacher})).data;
  assert.equal(teacherRows.length,1);
  assert.equal(teacherRows[0].current_stage,'apply');
  assert.deepEqual(teacherRows[0].completed_stages,[]);
  assert.equal(teacherRows[0].completed_at,null);
  assert.equal((await request(rpc,{user:student,payload})).data[0].revision_number,1);
  await second.page.locator('.wa-stage-tab[data-stage=master]').click();
  await second.page.getByText('Your place is saved.',{exact:true}).waitFor();
  await first.page.locator('.wa-stage-tab[data-stage=explore]').click();
  await first.page.getByText('Your place changed in another window.',{exact:false}).waitFor();
  await first.page.reload();
  assert.equal(await first.page.locator('.wa-stage-tab[aria-current=step]').getAttribute('data-stage'),'master');
  console.log('Structure pilot passed with real PostgreSQL and PostgREST and isolated Chromium contexts with synthetic identities.');
} finally {
  await browser?.close();
  site?.kill();
  rest?.kill();
  await database.end();
}
