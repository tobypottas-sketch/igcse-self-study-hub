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
