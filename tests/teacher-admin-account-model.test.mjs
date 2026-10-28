import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildHomeModel, renderHome } from '../src/views/home.js';
import { renderAdmin } from '../src/views/admin.js';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const staffProfile = role => ({ role, display_name:'Synthetic Staff', active:true, must_change_password:false });

function account(id, role, name) {
  return { id, role, displayName:name, email:`${id}@example.invalid`, active:true, currentClass:'', assignedClasses:[] };
}

test('teachers receive admin controls while students do not', () => {
  assert.equal(buildHomeModel(staffProfile('teacher'), []).showAdminControls, true);
  assert.equal(buildHomeModel(staffProfile('admin'), []).showAdminControls, true);
  assert.equal(buildHomeModel(staffProfile('student'), []).showAdminControls, false);
});

test('teachers and admins get an optional change-password control but students do not', () => {
  for (const role of ['teacher','admin']) {
    const root = { innerHTML:'' };
    renderHome(root, staffProfile(role), []);
    assert.match(root.innerHTML, /data-action="change-password"/);
  }
  const studentRoot = { innerHTML:'' };
  renderHome(studentRoot, staffProfile('student'), []);
  assert.doesNotMatch(studentRoot.innerHTML, /data-action="change-password"/);
});

test('teacher admin view separates students from teachers and admins', () => {
  const root = { innerHTML:'', ownerDocument:{ defaultView:{ scrollTo(){} } } };
  renderAdmin(root, {
    profile:staffProfile('teacher'),
    section:'accounts',
    accounts:[account('student-1','student','Synthetic Student'), account('teacher-1','teacher','Synthetic Teacher')],
    teachingAdmins:[account('admin-1','admin','Synthetic Admin')],
    classes:[]
  });
  assert.match(root.innerHTML, /data-admin-section="accounts"/);
  assert.match(root.innerHTML, />Students</);
  assert.match(root.innerHTML, />Teachers \/ Admins</);
  assert.equal((root.innerHTML.match(/Synthetic Student/g) ?? []).length, 1);
  assert.equal((root.innerHTML.match(/Synthetic Teacher/g) ?? []).length, 1);
  assert.equal((root.innerHTML.match(/Synthetic Admin/g) ?? []).length, 1);
});

test('app routing allows active teachers into administration and exposes staff password change', () => {
  const source = read('src/app.js');
  assert.match(source, /\['admin','teacher'\]\.includes\(currentState\?\.profile\?\.role\)/);
  assert.match(source, /action === 'change-password'/);
});

test('staff provisioning uses readable passwords and does not force immediate password change', () => {
  const source = read('supabase/functions/admin-provision-user/index.ts');
  assert.match(source, /const temporaryPassword = generateStudentPassword\(\);/);
  assert.doesNotMatch(source, /must_change_password:role === 'teacher'/);
  assert.match(source, /\['teacher','admin'\]\.includes\(callerProfile\.role\)/);
});

test('all privileged Edge Functions accept active teachers and admins', () => {
  for (const path of [
    'supabase/functions/admin-provision-user/index.ts',
    'supabase/functions/admin-class-action/index.ts',
    'supabase/functions/admin-merit-settings/index.ts'
  ]) {
    assert.match(read(path), /\['teacher','admin'\]\.includes/);
  }
});

test('migration gives teachers the same administration read scope as admins', () => {
  const sql = read('supabase/migrations/20261028205000_teacher_admin_read_access.sql');
  for (const policy of ['profiles_select','classes_select','memberships_select','teacher_classes_select']) {
    assert.match(sql, new RegExp(policy));
  }
  assert.match(sql, /current_role\(\).*in \('admin'::user_role, 'teacher'::user_role\)/is);
});
