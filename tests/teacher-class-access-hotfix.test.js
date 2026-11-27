import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildHomeModel,renderHome} from '../src/views/home.js';
import {renderAdmin} from '../src/views/admin.js';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('teacher home has Student Progress and no schoolwide account administration',()=>{
 const teacher={role:'teacher',display_name:'Colleague',active:true};
 const model=buildHomeModel(teacher,[]);
 assert.equal(model.showAdminControls,false);
 assert.equal(model.showActivityControls,true);
 assert.equal(model.showStaffTools,true);
 const root={innerHTML:''};renderHome(root,teacher,[]);
 assert.doesNotMatch(root.innerHTML,/Manage accounts/);
 assert.match(root.innerHTML,/data-action="student-progress"/);
 assert.match(root.innerHTML,/Writing assessor/);
});
test('admin retains account management',()=>{
 const admin={role:'admin',display_name:'Admin',active:true};
 const root={innerHTML:''};renderHome(root,admin,[]);
 assert.match(root.innerHTML,/Manage accounts/);
 assert.equal(buildHomeModel(admin,[]).showAdminControls,true);
});
test('forced classes section falls back to scoped activity for teacher',()=>{
 const root={innerHTML:''};
 renderAdmin(root,{profile:{role:'teacher',display_name:'Colleague'},section:'classes',
   classes:[{id:'foreign',className:'Foreign Class',active:true,students:[],teachers:[]}]});
 assert.doesNotMatch(root.innerHTML,/admin-section-classes|admin-section-accounts|admin-section-import|Foreign Class|admin-create-class/);
 assert.match(root.innerHTML,/admin-section-activity/);
});
test('frontend rejects teacher administration requests even when synthetic controls are clicked',()=>{
 const app=source('src/app.js');
 assert.match(app,/currentState\.profile\?\.role !== 'admin' \|\| currentState\.profile\?\.active !== true/);
 assert.match(app,/action\?\.startsWith\?\.\('admin-'\)/);
 assert.match(app,/currentState\.profile\?\.role !== 'admin'\) return/);
 assert.match(app,/const renderActivitySection = async[\s\S]*?\['admin','teacher'\]/);
});
test('privileged account administration remains admin-only except owned-student password help',()=>{
 const classServer=source('supabase/functions/admin-class-action/index.ts');
 assert.match(classServer,/callerProfile\.role !== 'admin'/);
 assert.match(classServer,/!callerProfile\?\.active/);
 const accounts=source('supabase/functions/admin-provision-user/index.ts');
 assert.match(accounts,/!callerProfile\?\.active/);
 assert.match(accounts,/!isAdmin && !\['teacher_list_students','reset_password','issue_class_credentials'\]\.includes\(input\.action\)/);
 assert.match(accounts,/You can issue login cards only for your assigned classes/);
 assert.match(accounts,/Selected students must belong to this active class/);
 assert.match(accounts,/teacher_classes/);
 assert.match(accounts,/student_class_memberships/);
 assert.match(accounts,/student\.role!=='student'/);
 assert.match(accounts,/!assignments\?\.length/);
});
test('database policies use assigned class and student helpers, not all-staff SELECT',()=>{
 const sql=source('supabase/sql/hotfix-teacher-class-row-access.sql');
 assert.match(sql,/teacher_has_class\(classes\.id\)/);
 assert.match(sql,/teacher_has_class\(student_class_memberships\.class_id\)/);
 assert.match(sql,/teacher_can_access_student\(profiles\.id\)/);
 assert.match(sql,/teacher_id = \(SELECT auth\.uid\(\)\)/);
 assert.doesNotMatch(sql,/ANY\s*\(ARRAY\['admin'[^\n]*'teacher'/);
 const revoke=source('supabase/sql/hotfix-retire-class-privilege.sql');
 assert.match(revoke,/REVOKE ALL[\s\S]*FROM PUBLIC, anon, authenticated/);
 assert.match(revoke,/GRANT EXECUTE[\s\S]*TO service_role/);
});
