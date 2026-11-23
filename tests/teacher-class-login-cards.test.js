import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {validateAdminProvisionRequest} from '../supabase/functions/admin-provision-user/validation.js';

const ACTOR='11111111-1111-4111-8111-111111111111';
const CLASS='22222222-2222-4222-8222-222222222222';
const OTHER_CLASS='55555555-5555-4555-8555-555555555555';
const STUDENT='33333333-3333-4333-8333-333333333333';
const OUTSIDER='44444444-4444-4444-8444-444444444444';
const source=stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/admin-provision-user/index.ts',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');

async function attempt({role='teacher',assigned=true,classId=CLASS,studentIds=[STUDENT],members=[STUDENT],active=true}={}){
 let handler,changed=[];
 const callerClient={auth:{getUser:async()=>({data:{user:{id:ACTOR}},error:null})}};
 const adminClient={
  auth:{admin:{updateUserById:async(id,{password})=>{changed.push({id,password});return {error:null};}}},
  from(table){
   const filters={};let mode='read';
   const query={
    select(){return this;},eq(key,val){filters[key]=val;return this;},
    is(key,val){filters[key]=val;return this;},
    in(key,val){filters[key]=val;return this;},
    update(){mode='update';return this;},
    maybeSingle:async()=>result(),
    single:async()=>result(),
    then:(resolve,reject)=>Promise.resolve(result()).then(resolve,reject)
   };
   function result(){
    if(table==='profiles'){
      if(mode==='update')return {error:null};
      if(filters.id===ACTOR)return {data:{role,active:true},error:null};
      return {data:members.map(id=>({id,role:'student',active,display_name:'Synthetic '+id,school_email:id+'@example.test'})),error:null};
    }
    if(table==='teacher_classes')return {data:assigned&&filters.class_id===CLASS?{class_id:CLASS}:null,error:null};
    if(table==='classes')return {data:{id:classId,active:true},error:null};
    if(table==='student_class_memberships')return {data:members.map(student_id=>({student_id})),error:null};
    throw Error('Unexpected table: '+table);
   }
   return query;
  }
 };
 let calls=0;
 const env={SUPABASE_URL:'https://example.test',SUPABASE_PUBLISHABLE_KEYS:'{"default":"public"}',SUPABASE_SECRET_KEYS:'{"default":"secret"}'};
 new Function('createClient','safeAuthAccountError','validateAdminProvisionRequest','Deno',source)(
  ()=>++calls===1?callerClient:adminClient,error=>error?.message,validateAdminProvisionRequest,
  {env:{get:key=>env[key]},serve:fn=>{handler=fn;}}
 );
 const response=await handler(new Request('https://example.test',{
  method:'POST',headers:{Authorization:'Bearer synthetic','Content-Type':'application/json'},
  body:JSON.stringify({action:'issue_class_credentials',classId,studentIds})
 }));
 return {status:response.status,payload:await response.json(),changed};
}

test('selection validation refuses duplicate, wrong-form and excessive student IDs',()=>{
 assert.deepEqual(validateAdminProvisionRequest({action:'issue_class_credentials',classId:CLASS,studentIds:[STUDENT]}),{action:'issue_class_credentials',classId:CLASS,studentIds:[STUDENT]});
 assert.throws(()=>validateAdminProvisionRequest({action:'issue_class_credentials',classId:CLASS,studentIds:[STUDENT,STUDENT]}),/Duplicate/);
 assert.throws(()=>validateAdminProvisionRequest({action:'issue_class_credentials',classId:CLASS,studentIds:[]}),/Select/);
 assert.throws(()=>validateAdminProvisionRequest({action:'issue_class_credentials',classId:CLASS,studentIds:['bad']}),/student ID/);
 assert.throws(()=>validateAdminProvisionRequest({action:'issue_class_credentials',classId:CLASS,studentIds:Array(101).fill(STUDENT)}),/100/);
});
test('assigned teacher can reset selected class student and retrieve one-time credentials',async()=>{
 const r=await attempt();
 assert.equal(r.status,200);assert.equal(r.changed.length,1);assert.equal(r.changed[0].id,STUDENT);
 assert.equal(r.payload.created[0].temporaryPassword,r.changed[0].password);
 assert.match(r.payload.created[0].temporaryPassword,/^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/);
});
test('teacher without class assignment cannot issue cards or reset any password',async()=>{
 const r=await attempt({assigned:false});
 assert.equal(r.status,403);assert.equal(r.changed.length,0);
});
test('teacher cannot issue cards for a student outside assigned class',async()=>{
 const r=await attempt({studentIds:[OUTSIDER]});
 assert.equal(r.status,403);assert.equal(r.changed.length,0);
});
test('teacher cannot issue cards for inactive student',async()=>{
 const r=await attempt({active:false});
 assert.equal(r.status,409);assert.equal(r.changed.length,0);
});
test('teacher cannot issue cards for another class even when knowing a student ID',async()=>{
 const r=await attempt({classId:OTHER_CLASS});
 assert.equal(r.status,403);assert.equal(r.changed.length,0);
});
test('teacher interface scopes selection and requires explicit acknowledgement',()=>{
 const ui=readFileSync(new URL('../src/vocabulary/teacher-login-cards.js',import.meta.url),'utf8');
 const app=readFileSync(new URL('../src/vocabulary/teacher-app.js',import.meta.url),'utf8');
 const view=readFileSync(new URL('../src/vocabulary/teacher-views.js',import.meta.url),'utf8');
 assert.match(ui,/row\.classId===classId/);
 assert.match(ui,/data-card-student/);
 assert.match(ui,/data-card-consent/);
 assert.match(ui,/studentIds/);
 assert.match(ui,/action:'issue_class_credentials'/);
 assert.match(ui,/renderLoginCards\(result\.created/);
 assert.match(app,/teacher-create-login-cards/);
 assert.match(view,/Create student login cards/);
});
