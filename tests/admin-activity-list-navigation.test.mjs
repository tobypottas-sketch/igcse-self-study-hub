import test from 'node:test';
import assert from 'node:assert/strict';
import { renderAdmin } from '../src/views/admin.js';

function student(index) {
  return {
    studentId:`student-${index}`,
    displayName:`Synthetic Student ${index}`,
    classId:'class-1',
    className:'Synthetic Class',
    hasStarted:false,
    activityThisWeek:0,
    pathways:{},
    unitCheck:{ attemptsUsed:0, rows:[] },
    pendingMerits:0,
    pendingMeritNumbers:[],
    needsAttention:false,
    attention:[],
    recentActivity:[]
  };
}

function model(students, selectedStudentId = null) {
  return {
    profile:{ role:'teacher', display_name:'Synthetic Teacher' },
    section:'activity',
    selectedStudentId,
    activityDashboard:{ students, pendingMerits:0, needsAttention:0 }
  };
}

test('Student Activity renders every student instead of capping the class list', () => {
  const root = { innerHTML:'' };
  const students = Array.from({ length:18 }, (_, index) => student(index + 1));
  renderAdmin(root, model(students));
  assert.equal((root.innerHTML.match(/data-activity-row/g) ?? []).length, 18);
  assert.match(root.innerHTML, /Synthetic Student 18/);
});

test('Student Activity groups students by class and then sorts names within each class', () => {
  const root = { innerHTML:'' };
  const students = [
    { ...student(1), displayName:'Yue Yuliana LIU', classId:'class-10', className:'10 ESL 5' },
    { ...student(2), displayName:'Zixuan Catherine Liu', classId:'class-9', className:'9 ESL 4' },
    { ...student(3), displayName:'Haoxuan Cason ZHANG', classId:'class-11', className:'11 ESL 2' },
    { ...student(4), displayName:'Youran Yura Jiang', classId:'class-9', className:'9 ESL 4' },
    { ...student(5), displayName:'Jingqi Qiora ZHANG', classId:'class-10', className:'10 ESL 5' }
  ];

  renderAdmin(root, model(students));

  const names = [...root.innerHTML.matchAll(/data-action="activity-student"[^>]*>([^<]+)<\/button>/g)].map(match => match[1]);
  assert.deepEqual(names, [
    'Zixuan Catherine Liu',
    'Youran Yura Jiang',
    'Jingqi Qiora ZHANG',
    'Yue Yuliana LIU',
    'Haoxuan Cason ZHANG'
  ]);
});

test('opening a student Activity profile resets the page to the top', () => {
  const scrollCalls = [];
  const root = {
    innerHTML:'',
    ownerDocument:{ defaultView:{ scrollTo:(...args) => scrollCalls.push(args) } }
  };
  const students = [student(1)];
  renderAdmin(root, model(students, students[0].studentId));
  assert.deepEqual(scrollCalls, [[0,0]]);
});
