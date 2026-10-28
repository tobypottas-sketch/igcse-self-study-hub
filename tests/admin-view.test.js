import test from 'node:test';
import assert from 'node:assert/strict';
import { renderAdmin } from '../src/views/admin.js';

function root() { return { innerHTML: '' }; }

test('admin shell renders Accounts, Classes, Bulk Import and Back to Hub', () => {
  const target = root();
  renderAdmin(target, { profile: { display_name: 'Admin <img src=x onerror=alert(1)>', role: 'admin' }, section: 'accounts' });
  assert.match(target.innerHTML, /Accounts/);
  assert.match(target.innerHTML, /Classes/);
  assert.match(target.innerHTML, /Bulk Import/);
  assert.match(target.innerHTML, /data-action="admin-back"/);
  assert.doesNotMatch(target.innerHTML, /<img src=x onerror=/);
  assert.match(target.innerHTML, /Admin &lt;img src=x onerror=alert\(1\)&gt;/);
});

test('admin shell marks only the selected section active', () => {
  const target = root();
  renderAdmin(target, { profile: { display_name: 'Admin', role: 'admin' }, section: 'classes' });
  assert.match(target.innerHTML, /data-action="admin-section-classes"[^>]*aria-current="page"/);
  assert.doesNotMatch(target.innerHTML, /data-action="admin-section-accounts"[^>]*aria-current="page"/);
});

test('accounts section renders manual create forms and lifecycle controls', () => {
  const target = root();
  renderAdmin(target, {
    profile: { display_name: 'Admin', role: 'admin' },
    section: 'accounts',
    classes: [{ id:'c1', className:'G9 ESL', active:true }],
    accounts: [
      { id:'s1', displayName:'Student <script>x</script>', email:'s@example.com', role:'student', active:true, currentClass:'G9 ESL', assignedClasses:[] },
      { id:'t1', displayName:'Teacher', email:'t@example.com', role:'teacher', active:false, currentClass:'', assignedClasses:[] }
    ]
  });
  assert.match(target.innerHTML, /data-form="admin-create-student"/);
  assert.match(target.innerHTML, /data-form="admin-create-teacher"/);
  assert.match(target.innerHTML, /data-action="admin-reset-password"/);
  assert.match(target.innerHTML, /data-action="admin-set-active"/);
  assert.match(target.innerHTML, /G9 ESL/);
  assert.doesNotMatch(target.innerHTML, /<script>x<\/script>/);
});

test('staff directory presents teachers as Teacher / Admin and admins as Admin', () => {
  const target = root();
  renderAdmin(target, {
    profile:{ display_name:'Synthetic Admin', role:'admin' },
    section:'accounts',
    classes:[],
    accounts:[
      { id:'teacher-1', displayName:'Synthetic Teacher', email:'teacher@example.test', role:'teacher', active:true, assignedClasses:[] }
    ],
    teachingAdmins:[
      { id:'admin-1', displayName:'Synthetic Admin', email:'admin@example.test', role:'admin', active:true, assignedClasses:[] }
    ]
  });
  assert.match(target.innerHTML, /<td>Teacher \/ Admin<\/td>/);
  assert.match(target.innerHTML, /<td>Admin<\/td>/);
});

test('accounts section shows a one-time credential without persisting it into navigation controls', () => {
  const target = root();
  renderAdmin(target, {
    profile: { display_name:'Admin', role:'admin' },
    section:'accounts',
    accounts: [],
    classes: [],
    credential: { displayName:'Student One', email:'s@example.com', temporaryPassword:'OneTime123!' }
  });
  assert.match(target.innerHTML, /OneTime123!/);
  assert.match(target.innerHTML, /one-time/i);
  assert.doesNotMatch(target.innerHTML, /data-action="admin-back"[^>]*OneTime123!/);
});

test('classes section renders create, assign, unassign and student transfer controls', () => {
  const target = root();
  renderAdmin(target, {
    profile:{ display_name:'Admin', role:'admin' },
    section:'classes',
    accounts:[
      { id:'t1', displayName:'Teacher One', email:'t@x', role:'teacher', active:true, assignedClasses:[] },
      { id:'s1', displayName:'Student One', email:'s@x', role:'student', active:true, currentClass:'G9 ESL', currentClassId:'c1', assignedClasses:[] }
    ],
    classes:[
      { id:'c1', className:'G9 <img src=x onerror=1>', active:true, students:[{id:'s1', displayName:'Student One', email:'s@x'}], teachers:[{id:'t1', displayName:'Teacher One', email:'t@x'}] },
      { id:'c2', className:'G10 ESL', active:true, students:[], teachers:[] }
    ]
  });
  assert.match(target.innerHTML, /data-form="admin-create-class"/);
  assert.match(target.innerHTML, /data-form="admin-assign-teacher"/);
  assert.match(target.innerHTML, /data-action="admin-unassign-teacher"/);
  assert.match(target.innerHTML, /data-form="admin-transfer-student"/);
  assert.doesNotMatch(target.innerHTML, /<img src=x onerror=1>/);
});

test('Assign teacher includes active teachers and labelled admins, excluding inactive accounts and students', () => {
  const target = root();
  renderAdmin(target, {
    profile:{ display_name:'Synthetic Admin', role:'admin' }, section:'classes', classes:[],
    accounts:[
      { id:'active-teacher', displayName:'Test Teacher', email:'teacher@example.test', role:'teacher', active:true },
      { id:'active-admin', displayName:'Test Admin', email:'admin@example.test', role:'admin', active:true },
      { id:'inactive-teacher', displayName:'Inactive Teacher', email:'inactive-teacher@example.test', role:'teacher', active:false },
      { id:'inactive-admin', displayName:'Inactive Admin', email:'inactive-admin@example.test', role:'admin', active:false },
      { id:'active-student', displayName:'Test Student', email:'student@example.test', role:'student', active:true }
    ]
  });
  const options = target.innerHTML.match(/<select name="teacherId" required>([\s\S]*?)<\/select>/)?.[1];
  assert.ok(options, 'Assign teacher dropdown exists');
  assert.match(options, /<option value="active-teacher">Test Teacher — teacher@example\.test<\/option>/);
  assert.match(options, /<option value="active-admin">Test Admin — admin@example\.test \(Admin\)<\/option>/);
  assert.doesNotMatch(options, /inactive-teacher|inactive-admin|active-student/);
});

test('activity renders never-started students without fake progression or inactivity', () => {
  const target = root();
  renderAdmin(target, {
    profile:{ display_name:'Admin', role:'admin' }, section:'activity',
    activityDashboard:{ pendingMerits:0, needsAttention:0, students:[{
      studentId:'fresh', displayName:'Fresh Student', classId:'c1', className:'9 ESL 2',
      hasStarted:false, lastActive:null, activityThisWeek:0, pathways:{},
      unitCheck:{ attemptsUsed:0 }, pendingMerits:0, attention:[], needsAttention:false
    }] }
  });
  assert.match(target.innerHTML, />Not started<\/td>/);
  assert.match(target.innerHTML, /class="activity-progression">Not started<\/td>/);
  assert.doesNotMatch(target.innerHTML, /Inactive 7\+ days/);
  assert.doesNotMatch(target.innerHTML, /Meaning: recognise/);
});
