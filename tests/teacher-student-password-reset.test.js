import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateTeacherPasswordAction,canManageStudent,createReadablePassword} from '../supabase/functions/teacher-student-password/validation.js';
const src=readFileSync(new URL('../supabase/functions/teacher-student-password/index.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../src/vocabulary/teacher-password-manager.js',import.meta.url),'utf8');
const teacher=readFileSync(new URL('../src/vocabulary/teacher-app.js',import.meta.url),'utf8');
const sql=readFileSync(new URL('../supabase/sql/teacher_student_password_reset_audit.sql',import.meta.url),'utf8');
const uuid='33333333-3333-4333-8333-333333333333';
test('strictly validates teacher reset API payload',()=>{
 assert.deepEqual(validateTeacherPasswordAction({action:'list'}),{action:'list'});
 assert.deepEqual(validateTeacherPasswordAction({action:'reset',studentId:uuid}),{action:'reset',studentId:uuid});
 for(const invalid of [{action:'reset',studentId:uuid,role:'admin'},{action:'reset',studentId:'x'},{action:'list',all:true},{action:'delete',studentId:uuid}])
 assert.throws(()=>validateTeacherPasswordAction(invalid),/Invalid/);
});
test('only active staff and active students with real owned membership qualify',()=>{
 const teacher={role:'teacher',active:true},admin={role:'admin',active:true};
 const student={role:'student',active:true},member={ended_at:null};
 assert.equal(canManageStudent({actor:teacher,student,membership:member,assigned:true}),true);
 assert.equal(canManageStudent({actor:teacher,student,membership:member,assigned:false}),false);
 assert.equal(canManageStudent({actor:teacher,student,membership:null,assigned:true}),false);
 assert.equal(canManageStudent({actor:teacher,student:{role:'teacher',active:true},membership:member,assigned:true}),false);
 assert.equal(canManageStudent({actor:{role:'student',active:true},student,membership:member,assigned:true}),false);
 assert.equal(canManageStudent({actor:{...teacher,active:false},student,membership:member,assigned:true}),false);
 assert.equal(canManageStudent({actor:admin,student,membership:member,assigned:false}),true);
});
test('temporary password uses readable words and numeric suffix',()=>{
 const password=createReadablePassword(bytes=>bytes.set([0,1,2,1234]));
 assert.equal(password,'AppleBeachBerry1234');
});
test('password changes remain server-authorised, audited, bounded and student-only',()=>{
 assert.match(src,/auth\.getUser\(token\)/);
 assert.match(src,/actor\.role==='admin'/);
 assert.match(src,/teacher_classes/);
 assert.match(src,/student_class_memberships/);
 assert.match(src,/canManageStudent/);
 assert.match(src,/student\.role!=='student'/);
 assert.match(src,/auth\.admin\.updateUserById\(input\.studentId,\{password\}\)/);
 assert.match(src,/actorCount\?\?0\)>=8/);
 assert.match(src,/studentCount\?\?0\)>=3/);
 assert.match(src,/teacher_student_password_reset_events/);
 assert.match(sql,/enable row level security/);
 assert.match(sql,/revoke all on public\.teacher_student_password_reset_events from public,anon,authenticated/);
 assert.doesNotMatch(sql,/password text|temporary_password/);
});
test('teacher app exposes scoped manager with explicit confirmation and one-time copy',()=>{
 assert.match(teacher,/teacher-manage-student-passwords/);
 assert.match(ui,/action:'list'/);
 assert.match(ui,/action:'reset',studentId:selected\.id/);
 assert.match(ui,/Generate new password/);
 assert.match(ui,/navigator\.clipboard\.writeText/);
 assert.match(ui,/This password will disappear/);
});
