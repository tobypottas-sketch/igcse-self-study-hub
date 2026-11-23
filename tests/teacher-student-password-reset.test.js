import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {validateAdminProvisionRequest} from '../supabase/functions/admin-provision-user/validation.js';

const src=readFileSync(new URL('../supabase/functions/admin-provision-user/index.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../src/vocabulary/teacher-password-manager.js',import.meta.url),'utf8');
const teacher=readFileSync(new URL('../src/vocabulary/teacher-app.js',import.meta.url),'utf8');
const audit=readFileSync(new URL('../supabase/sql/teacher_student_password_reset_audit.sql',import.meta.url),'utf8');
const ACTOR='11111111-1111-4111-8111-111111111111', STUDENT='33333333-3333-4333-8333-333333333333';
const CLASS='22222222-2222-4222-8222-222222222222';
const runSource=stripTypeScriptTypes(src).replace(/^import .*;\n/gm,'');

async function request({role='teacher',assigned=true,studentRole='student',action='reset_password',active=true}={}){
 let handler,resetCalls=0,auditCalls=0,flagCalls=0;
 const actor={role,active};
 const student={id:STUDENT,role:studentRole,active:true,display_name:'Example Student',school_email:'example@example.test'};
 function makeQuery(table){
  const filters={};let operation='read',insertValue=null,head=false;
  const q={
   select(_fields,opts){head=Boolean(opts?.head);return this;},
   eq(k,v){filters[k]=v;return this;},
   in(k,v){filters[k]=v;return this;},
   is(k,v){filters[k]=v;return this;},
   gte(){return this;},range(){return this;},
   insert(v){operation='insert';insertValue=v;return this;},
   update(v){operation='update';insertValue=v;return this;},
   single(){return Promise.resolve(get(true));},
   maybeSingle(){return Promise.resolve(get(true));},
   then(resolve,reject){return Promise.resolve(get(false)).then(resolve,reject);}
  };
  function get(single){
   if(table==='profiles'){
    if(operation==='update'){flagCalls++;return {error:null};}
    return {data:filters.id===ACTOR?actor:student,error:null};
   }
   if(table==='student_class_memberships')return {data:[{class_id:CLASS,student_id:STUDENT}],error:null};
   if(table==='teacher_classes')return {data:assigned?[{class_id:CLASS}]:[],error:null};
   if(table==='teacher_student_password_reset_events'){
    if(head)return {count:0,error:null};
    if(operation==='insert'){auditCalls++;return {data:{id:1},error:null};}
    return {error:null};
   }
   throw new Error('Unexpected table '+table);
  }
  return q;
 }
 const adminClient={from:makeQuery,auth:{admin:{updateUserById:async()=>{resetCalls++;return {error:null};}}}};
 const callerClient={auth:{getUser:async()=>({data:{user:{id:ACTOR}},error:null})}};
 let called=0;
 const createClient=()=>++called===1?callerClient:adminClient;
 const env={SUPABASE_URL:'https://example.test',SUPABASE_PUBLISHABLE_KEYS:'{"default":"public"}',SUPABASE_SECRET_KEYS:'{"default":"secret"}'};
 const Deno={env:{get:key=>env[key]},serve:fn=>{handler=fn;}};
 new Function('createClient','safeAuthAccountError','validateAdminProvisionRequest','Deno',runSource)(createClient,err=>err?.message??'error',validateAdminProvisionRequest,Deno);
 const body=action==='teacher_list_students'?{action}:{action,userId:STUDENT};
 const response=await handler(new Request('https://example.test',{method:'POST',headers:{Authorization:'Bearer synthetic','Content-Type':'application/json'},body:JSON.stringify(body)}));
 return {status:response.status,payload:await response.json(),resetCalls,auditCalls,flagCalls};
}

test('teacher reset and roster actions are individually validated',()=>{
 assert.deepEqual(validateAdminProvisionRequest({action:'teacher_list_students'}),{action:'teacher_list_students'});
 assert.deepEqual(validateAdminProvisionRequest({action:'reset_password',userId:STUDENT}),{action:'reset_password',userId:STUDENT});
});
test('assigned teacher can reset one student with audited event',async()=>{
 const r=await request();
 assert.equal(r.status,200);
 assert.equal(r.resetCalls,1);
 assert.equal(r.auditCalls,1);
 assert.match(r.payload.temporaryPassword,/^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/);
});
test('unassigned teacher cannot change student password',async()=>{
 const r=await request({assigned:false});
 assert.equal(r.status,403);assert.equal(r.resetCalls,0);assert.equal(r.auditCalls,0);
});
test('teacher cannot reset another teacher account',async()=>{
 const r=await request({studentRole:'teacher'});
 assert.equal(r.status,403);assert.equal(r.resetCalls,0);
});
test('student cannot use staff reset endpoint',async()=>{
 const r=await request({role:'student'});
 assert.equal(r.status,403);assert.equal(r.resetCalls,0);
});
test('teacher is still forbidden from all other account admin actions',async()=>{
 const r=await request({action:'delete_account'});
 assert.equal(r.status,403);assert.equal(r.resetCalls,0);
});
test('audit table denies ordinary users and keeps no password plaintext',()=>{
 assert.match(audit,/enable row level security/i);
 assert.match(audit,/revoke all on public\.teacher_student_password_reset_events from public,anon,authenticated/);
 assert.doesNotMatch(audit,/temporary_password|password text/i);
});
test('teacher interface uses the existing account service',()=>{
 assert.match(ui,/functions\.invoke\('admin-provision-user'/);
 assert.match(ui,/action:'teacher_list_students'/);
 assert.match(ui,/action:'reset_password',userId:selected\.id/);
 assert.match(ui,/navigator\.clipboard\.writeText/);
 assert.match(teacher,/teacher-manage-student-passwords/);
});

test('teacher sees the same one-time name, email and password details as an admin',()=>{
 assert.match(ui,/data-pw-credential/);
 assert.match(ui,/credential=\{name:selected\.name,email:selected\.email,password:result\.temporaryPassword\}/);
 assert.match(ui,/data-pw-hide/);
 assert.match(ui,/data-pw-copy/);
 assert.match(ui,/card\.querySelector\('\[data-pw-credential\]'\)\?\.focus\(\)/);
 assert.doesNotMatch(ui,/e\(result\.name\)/);
});
test('teacher hourly allowance supports classroom resets, with per-student protection',()=>{
 assert.match(src,/\(actorCount\?\?0\)>=30/);
 assert.match(src,/\(studentCount\?\?0\)>=3/);
 assert.match(src,/Teacher reset limit reached \(30 in a rolling hour\)/);
});
