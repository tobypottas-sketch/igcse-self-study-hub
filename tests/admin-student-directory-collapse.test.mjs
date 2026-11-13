import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderAdmin } from '../src/views/admin.js';

const student = (id, displayName, currentClass, active=true) => ({
  id, displayName, currentClass, active, role:'student', email:`${id}@school.test`
});
const model = {
  profile:{ role:'admin', display_name:'Synthetic Admin' }, section:'accounts',
  classes:[],
  accounts:[
    student('a','Alice','G9 ESL 1'), student('b','Bob','G9 ESL 1',false),
    student('c','Carlos','G9 ESL 2'), student('d','Dana','')
  ],
  teachingAdmins:[]
};
const render = value => { const root={innerHTML:''}; renderAdmin(root,value); return root.innerHTML; };

test('student directory is collapsed by default into named class sections including Unassigned', () => {
  const html=render(model);
  const details=[...html.matchAll(/<details class="admin-student-group" data-admin-student-group>/g)];
  assert.equal(details.length,3);
  assert.match(html,/<strong>G9 ESL 1<\/strong><span class="admin-student-group__count">2 students/);
  assert.match(html,/<strong>G9 ESL 2<\/strong><span class="admin-student-group__count">1 student/);
  assert.match(html,/<strong>Unassigned<\/strong>/);
  assert.doesNotMatch(html,/<details[^>]* data-admin-student-group[^>]* open/);
});

test('all account actions and active status remain within each class', () => {
  const html=render(model);
  assert.equal((html.match(/data-action="admin-reset-password"/g)||[]).length,4);
  assert.equal((html.match(/data-action="admin-set-active"/g)||[]).length,4);
  assert.equal((html.match(/data-action="admin-delete-account"/g)||[]).length,4);
  assert.match(html,/data-account-active="false"/);
  assert.match(html,/data-admin-filter="account-search"/);
  assert.match(html,/data-admin-filter="account-status"/);
});

test('empty directories preserve the existing empty-state message', () => {
  assert.match(render({ ...model, accounts:[] }), /No student accounts found yet\./);
});

test('class names and student data are escaped in new disclosure headings', () => {
  const html=render({...model,accounts:[student('x','<script>unsafe</script>','G9 <img src=x>')]});
  assert.match(html,/G9 &lt;img src=x&gt;/);
  assert.doesNotMatch(html,/<img src=x>|<script>unsafe<\/script>/);
});

test('controller searches class-contained rows, reveals matches, and keeps manual disclosures exclusive', () => {
  const app=readFileSync(new URL('../src/app.js', import.meta.url),'utf8');
  assert.match(app,/querySelectorAll\?\.\('\[data-admin-student-group\]'\)/);
  assert.match(app,/if \(filtered && visible\) group\.open = true/);
  assert.match(app,/group\.hidden = filtered && visible === 0/);
  assert.match(app,/event\.target\?\.closest\?\.\('\[data-admin-student-group\] > summary'\)/);
  assert.match(app,/group !== selected\) group\.open = false/);
  assert.match(app,/data-admin-student-no-matches/);
});
