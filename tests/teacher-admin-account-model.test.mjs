import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildHomeModel, renderHome } from '../src/views/home.js';
import { renderAdmin } from '../src/views/admin.js';
import { renderChangePassword } from '../src/views/change-password.js';
import { bootApp } from '../src/app.js';
import { stripTypeScriptTypes } from 'node:module';
import { validateAdminProvisionRequest, safeAuthAccountError } from '../supabase/functions/admin-provision-user/validation.js';
import { validateClassAction } from '../supabase/functions/admin-class-action/validation.js';
import { loadAdminData } from '../src/admin/data.js';

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
  const sections = [...root.innerHTML.matchAll(/<section class="admin-directory-section">([\s\S]*?)<\/section>/g)].map(match => match[1]);
  assert.equal(sections.length, 2);
  assert.match(sections[0], /<td>Synthetic Student<\/td>/);
  assert.doesNotMatch(sections[0], /<td>Synthetic (Teacher|Admin)<\/td>/);
  assert.match(sections[1], /<td>Synthetic Teacher<\/td>/);
  assert.match(sections[1], /<td>Synthetic Admin<\/td>/);
  assert.doesNotMatch(sections[1], /<td>Synthetic Student<\/td>/);
  assert.equal((root.innerHTML.match(/<td>Synthetic Admin<\/td>/g) ?? []).length, 1);
});

test('optional staff password change has a cancel control and optional wording', () => {
  const root = { innerHTML:'' };
  renderChangePassword(root, staffProfile('teacher'));
  assert.match(root.innerHTML, /data-action="cancel-change-password"/);
  assert.doesNotMatch(root.innerHTML, /First sign-in|before continuing/);
});

async function appHarness(t, role, { mustChange = false, holdActivity = false } = {}) {
  const oldDocument = globalThis.document, oldFormData = globalThis.FormData;
  t.after(() => { globalThis.document = oldDocument; globalThis.FormData = oldFormData; });
  const profile = { id:'synthetic-caller', ...staffProfile(role), must_change_password:mustChange };
  let resolveActivity;
  const pendingActivity = new Promise(resolve => { resolveActivity = resolve; });
  const listeners = new Map(), calls = [];
  const root = { innerHTML:'', addEventListener:(type, listener) => listeners.set(type, listener) };
  globalThis.document = { getElementById:() => root };
  globalThis.FormData = class { constructor(form) { this.values = form.values; } get(key) { return this.values[key]; } };
  const client = {
    auth:{ getUser:async () => ({ data:{ user:{ id:profile.id } }, error:null }), updateUser:async value => { calls.push(value); return { error:null }; } },
    rpc:() => ({ range:async () => holdActivity ? pendingActivity : { data:[], error:null } }),
    from(table) { return { select() { return this; }, eq() { return this; }, order() { return this; }, update(value) { Object.assign(profile,value); return this; }, single:async () => ({ data:profile, error:null }), then(resolve, reject) { return Promise.resolve({ data:table === 'profiles' ? [profile] : [], error:null }).then(resolve, reject); } }; }
  };
  await bootApp(client);
  const click = async action => { const target = { dataset:{ action }, closest() { return this; } }; await listeners.get('click')({ target }); };
  const submit = async () => listeners.get('submit')({ preventDefault() {}, target:{ dataset:{ form:'change-password' }, values:{ password:'MapleRiver47', confirmPassword:'MapleRiver47' } } });
  return { root, click, submit, calls, resolveActivity:() => resolveActivity({ data:[], error:null }) };
}

test('finishing a delayed activity preload does not close optional staff password settings', async t => {
  const h = await appHarness(t,'teacher',{ holdActivity:true });
  await h.click('change-password');
  h.resolveActivity();
  await new Promise(resolve => setImmediate(resolve));
  assert.match(h.root.innerHTML,/data-form="change-password"/);
});

test('legacy required student password setup remains usable without adding an optional student control', async t => {
  const h = await appHarness(t,'student',{ mustChange:true });
  assert.match(h.root.innerHTML,/data-form="change-password"/);
  assert.doesNotMatch(h.root.innerHTML,/data-action="cancel-change-password"/);
  await h.submit();
  assert.deepEqual(h.calls,[{ password:'MapleRiver47' }]);
  assert.doesNotMatch(h.root.innerHTML,/data-form="change-password"|data-action="change-password"/);
});

test('inactive admins remain visible for reactivation but cannot be assigned to classes', async () => {
  const profiles = [
    { id:'inactive-admin',role:'admin',display_name:'Synthetic Inactive Admin',school_email:'inactive@example.invalid',active:false },
    { id:'active-admin',role:'admin',display_name:'Synthetic Active Admin',school_email:'active@example.invalid',active:true }
  ];
  const client = { from:table => ({ select:async () => ({ data:table === 'profiles' ? profiles : [],error:null }) }) };
  const data = await loadAdminData(client);
  const root = { innerHTML:'' };
  renderAdmin(root,{ ...data,profile:staffProfile('teacher'),section:'accounts' });
  assert.match(root.innerHTML,/data-user-id="inactive-admin" data-next-active="true"/);
  renderAdmin(root,{ ...data,profile:staffProfile('teacher'),section:'classes' });
  const choices = root.innerHTML.match(/<select name="teacherId" required>([\s\S]*?)<\/select>/)?.[1] ?? '';
  assert.doesNotMatch(choices,/inactive-admin/);
  assert.match(choices,/active-admin/);
});

for (const role of ['teacher','admin']) {
  test(`${role} can open all administration sections and optionally change password`, async t => {
    const h = await appHarness(t, role);
    await h.click('admin');
    for (const section of ['accounts','classes','import','activity']) {
      await h.click(`admin-section-${section}`);
      assert.match(h.root.innerHTML, new RegExp(`data-admin-section="${section}"`));
    }
    await h.click('admin-back');
    await h.click('change-password');
    assert.match(h.root.innerHTML, /data-form="change-password"/);
    await h.click('cancel-change-password');
    assert.doesNotMatch(h.root.innerHTML, /data-form="change-password"/);
    await h.click('change-password');
    await h.submit();
    assert.deepEqual(h.calls, [{ password:'MapleRiver47' }]);
    assert.doesNotMatch(h.root.innerHTML, /data-form="change-password"/);
  });
}

test('student cannot open staff administration or invoke optional password change through delegated events', async t => {
  const h = await appHarness(t, 'student');
  await h.click('admin');
  assert.doesNotMatch(h.root.innerHTML, /data-admin-section=/);
  await h.click('change-password');
  assert.doesNotMatch(h.root.innerHTML, /data-form="change-password"/);
  await h.submit();
  assert.deepEqual(h.calls, []);
});

function edgeHarness(path, callerRole = 'teacher', active = true) {
  let handler, clientCount = 0;
  const writes = [], passwords = [];
  const adminClient = {
    auth:{ admin:{ createUser:async value => { passwords.push(value.password); return { data:{ user:{ id:'33333333-3333-4333-8333-333333333333' } }, error:null }; }, updateUserById:async (_id, value) => { passwords.push(value.password); return { error:null }; } } },
    from(table) { return { select() { return this; }, eq() { return this; }, order() { return this; }, single:async () => ({ data:table === 'profiles' ? { role:callerRole, active } : { id:'22222222-2222-4222-8222-222222222222', active:true }, error:null }), insert(value) { writes.push({ table, value }); return this; }, update(value) { writes.push({ table, value }); return this; }, then(resolve, reject) { return Promise.resolve({ error:null }).then(resolve, reject); } }; }
  };
  const callerClient = { auth:{ getUser:async () => ({ data:{ user:{ id:'synthetic-caller' } }, error:null }) } };
  const env = { SUPABASE_URL:'https://example.invalid', SUPABASE_PUBLISHABLE_KEYS:'{"default":"synthetic-public"}', SUPABASE_SECRET_KEYS:'{"default":"synthetic-secret"}' };
  const source = stripTypeScriptTypes(read(path)).replace(/^import .*;\n/gm, '');
  new Function('createClient','safeAuthAccountError','validateAdminProvisionRequest','validateClassAction','Deno',source)(
    () => ++clientCount === 1 ? callerClient : adminClient,
    safeAuthAccountError, validateAdminProvisionRequest, validateClassAction,
    { env:{ get:key => env[key] }, serve:fn => { handler = fn; } }
  );
  return { writes, passwords, invoke:body => handler(new Request('https://example.invalid',{ method:'POST', headers:{ Authorization:'Bearer synthetic', 'Content-Type':'application/json' }, body:JSON.stringify(body) })) };
}

for (const name of ['admin-provision-user','admin-class-action','admin-merit-settings']) {
  test(`${name} allows active staff and rejects students and inactive staff at runtime`, async () => {
    for (const [role, active, allowed] of [['teacher',true,true],['admin',true,true],['student',true,false],['teacher',false,false],['admin',false,false]]) {
      const h = edgeHarness(`supabase/functions/${name}/index.ts`,role,active);
      const response = await h.invoke({});
      if (allowed) assert.notEqual(response.status,403,`${role} reaches request validation`);
      else assert.equal(response.status,403,`${role}, active=${active} is denied`);
      assert.deepEqual(h.writes,[]);
    }
  });
}

test('teacher creation retains teacher role with readable credentials and no forced change', async () => {
  const h = edgeHarness('supabase/functions/admin-provision-user/index.ts');
  const response = await h.invoke({ action:'provision',role:'teacher',email:'teacher@example.invalid',displayName:'Synthetic Teacher' });
  assert.equal(response.status,200);
  const result = await response.json();
  assert.equal(result.role,'teacher');
  assert.match(result.temporaryPassword,/^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/);
  assert.deepEqual(h.passwords,[result.temporaryPassword]);
  assert.equal(h.writes.find(write => write.table === 'profiles').value.role,'teacher');
  assert.equal(h.writes.find(write => write.table === 'profiles').value.must_change_password,false);
});

test('staff reset generates a readable fixed password without forcing a change', async () => {
  const h = edgeHarness('supabase/functions/admin-provision-user/index.ts');
  const response = await h.invoke({ action:'reset_password',userId:'33333333-3333-4333-8333-333333333333' });
  assert.equal(response.status,200);
  assert.match((await response.json()).temporaryPassword,/^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/);
  assert.equal(h.writes[0].value.must_change_password,false);
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
