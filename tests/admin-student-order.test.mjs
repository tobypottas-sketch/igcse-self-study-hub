import test from 'node:test';
import assert from 'node:assert/strict';
import { renderAdmin } from '../src/views/admin.js';

const student = (id, displayName, currentClass, active = true) => ({ id, role:'student', displayName, currentClass, email:`${id}@example.invalid`, active });
const accounts = [
  student('sarah','Sarah Tan',''),
  student('mia','Mia Wong','G10 ESL 5'),
  { id:'teacher', role:'teacher', displayName:'Synthetic Teacher', email:'teacher@example.invalid', active:true },
  student('zoe','Zoe Smith','G9 ESL 4'),
  student('chris','Chris Jones',null),
  student('ben','Ben Carter','G9 ESL 4'),
  student('adam','Adam Lee','G10 ESL 5'),
  student('alice','Alice Brown','G9 ESL 4')
];
const expectedNames = ['Alice Brown','Ben Carter','Zoe Smith','Adam Lee','Mia Wong','Chris Jones','Sarah Tan'];
const staff = [{ id:'admin', role:'admin', displayName:'Synthetic Admin', email:'admin@example.invalid', active:true }];
const model = section => ({ profile:{ role:'admin',display_name:'Synthetic Admin' }, section,accounts,teachingAdmins:staff,classes:[] });
const render = value => { const root = { innerHTML:'' }; renderAdmin(root,value); return root.innerHTML; };
const directories = html => [...html.matchAll(/<section class="admin-directory-section">([\s\S]*?)<\/section>/g)].map(match => match[1]);
const rowNames = html => [...html.matchAll(/<tr data-account-role="\w+"[^>]*><td>(.*?)<\/td>/g)].map(match => match[1]);

test('Students directory groups natural class names, alphabetizes names, and puts unassigned last', () => {
  const sections = directories(render(model('accounts')));
  assert.deepEqual(rowNames(sections[0]),expectedNames);
  assert.deepEqual(rowNames(sections[1]),['Synthetic Teacher','Synthetic Admin']);
  assert.doesNotMatch(sections[0],/data-account-role="(?:teacher|admin)"/);
  assert.doesNotMatch(sections[1],/data-account-role="student"/);
});

test('student ordering is case-insensitive and treats blank or missing class names as unassigned', () => {
  const rows = [student('unassigned-z','Zoe','   '),student('lower','ben','G9 ESL 4'),student('upper','Alice','g9 esl 4'),student('unassigned-a','Adam',undefined)];
  const html = render({ ...model('accounts'),accounts:rows });
  assert.deepEqual(rowNames(directories(html)[0]),['Alice','ben','Adam','Zoe']);
});

test('Move student choices use the same ordering and continue to exclude inactive students and staff', () => {
  const html = render({ ...model('classes'),accounts:[...accounts,student('inactive','Aardvark','G9 ESL 4',false)] });
  const select = html.match(/<select name="studentId" required>([\s\S]*?)<\/select>/)[1];
  const choices = [...select.matchAll(/<option value="([^"]+)">([^<]*)<\/option>/g)].filter(match => match[1]);
  assert.deepEqual(choices.map(match => match[1]),['alice','ben','zoe','adam','mia','chris','sarah']);
  assert.deepEqual(choices.map(match => match[2]),expectedNames.map((name,index) => `${name} — ${index < 3 ? 'G9 ESL 4' : index < 5 ? 'G10 ESL 5' : 'Unassigned'}`));
});

test('each class roster alphabetizes student names without changing its membership', () => {
  const students = [student('zoe','Zoe Smith','G9 ESL 4'),student('alice','Alice Brown','G9 ESL 4'),student('ben','Ben Carter','G9 ESL 4')];
  const html = render({ ...model('classes'),classes:[{ id:'g9',className:'G9 ESL 4',active:true,students,teachers:[] }] });
  assert.match(html,/<strong>Students<\/strong><p class="muted">Alice Brown, Ben Carter, Zoe Smith<\/p>/);
  assert.deepEqual(students.map(row => row.id),['zoe','alice','ben']);
});

test('rendering leaves account objects and input order unchanged and handles an empty directory', () => {
  const original = structuredClone(accounts);
  render(model('accounts'));
  render(model('classes'));
  assert.deepEqual(accounts,original);
  assert.match(render({ ...model('accounts'),accounts:[],teachingAdmins:[] }),/No student accounts found yet/);
});
