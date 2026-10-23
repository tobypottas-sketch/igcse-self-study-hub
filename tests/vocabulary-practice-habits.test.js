import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPracticeHabits, buildStudentHabits, habitsLastPractice } from '../src/vocabulary/practice-habits.js';
import { renderTeacherOverview, renderStudentVocabularyProfile } from '../src/vocabulary/teacher-views.js';
import { normalizeTeacherVocabularyData } from '../src/vocabulary/teacher-data.js';

const now = new Date(2026, 9, 23, 12, 0, 0); // Fri 23 Oct 2026, local
const at = (month, day, hour = 10) => new Date(2026, month, day, hour).toISOString();
const students = [{ id:'a', displayName:'Ana' }, { id:'b', displayName:'Ben' }, { id:'c', displayName:'Cy' }];
const missions = [
  ...[19, 20, 21, 22].map(day => ({ studentId:'a', completedAt:at(9, day) })),   // Mon-Thu this week: goal met
  { studentId:'b', completedAt:at(9, 21) },
  { studentId:'b', completedAt:at(9, 10) },
  { studentId:'c', completedAt:at(8, 20) }                                       // a month ago
];
const attempts = (studentId, first, second) => [
  ...Array.from({ length:first }, () => ({ studentId, occurredAt:at(9, 21), eventType:'question_attempt', metadata:{ attempt_number:1 } })),
  ...Array.from({ length:second }, () => ({ studentId, occurredAt:at(9, 21), eventType:'question_attempt', metadata:{ attempt_number:2 } }))
];

test('weekly missions and goal use Monday-to-Sunday and the fixed goal of four', () => {
  const habits = buildPracticeHabits({ students, missions, activity:[], now });
  const ana = habits.rows.find(row => row.studentId === 'a');
  assert.equal(ana.missionsThisWeek, 4);
  assert.equal(ana.goalMet, true);
  assert.equal(habits.missionsThisWeek, 5);
  assert.equal(habits.studentsMetGoal, 1);
  assert.equal(habits.studentsActiveThisWeek, 2);
  assert.equal(habits.rows.find(row => row.studentId === 'b').goalMet, false);
});

test('a mission before Monday does not count toward this week', () => {
  const row = buildStudentHabits({ student:students[0], missions:[{ completedAt:at(9, 18, 23) }], now });
  assert.equal(row.missionsThisWeek, 0);
});

test('quiet students are those with no mission for 14 days or never, longest first', () => {
  const habits = buildPracticeHabits({ students:[...students, { id:'d', displayName:'Dee' }], missions, activity:[], now });
  assert.deepEqual(habits.quiet.map(row => row.displayName), ['Dee', 'Cy']);
  assert.equal(habitsLastPractice(habits.rows.find(row => row.studentId === 'd')), 'No mission yet');
  assert.equal(habitsLastPractice(habits.rows.find(row => row.studentId === 'b')), '2 days ago');
});

test('second-try rate needs enough attempts and is never shown for thin data', () => {
  const thin = buildStudentHabits({ student:students[0], activity:attempts('a', 5, 3), now });
  assert.equal(thin.secondTryPercent, null);
  const enough = buildStudentHabits({ student:students[0], activity:attempts('a', 40, 10), now });
  assert.equal(enough.secondTryPercent, 25);
});

test('habits carry no answers, scores, stars or mastery fields', () => {
  const habits = buildPracticeHabits({ students, missions, activity:attempts('a', 40, 10), now });
  const text = JSON.stringify(habits);
  for (const word of ['score', 'stars', 'answer', 'mastery', 'evidence', 'streak']) assert.equal(text.toLowerCase().includes(word), false, word);
});

test('overview shows the habits panel with the not-mastery label and links quiet students', () => {
  const target = { innerHTML:'' };
  renderTeacherOverview(target, { className:'11A', habits:{ available:true, ...buildPracticeHabits({ students, missions, activity:[], now }) } });
  assert.match(target.innerHTML, /data-habits-panel/);
  assert.match(target.innerHTML, /not evidence of mastery/i);
  assert.match(target.innerHTML, /1 of 3/);
  assert.match(target.innerHTML, /data-action="teacher-open-student" data-student-id="c"/);
});

test('overview says so plainly when mission records are unavailable', () => {
  const target = { innerHTML:'' };
  renderTeacherOverview(target, { className:'11A', habits:{ available:false } });
  assert.match(target.innerHTML, /Mission records are not available yet/);
});

test('student profile shows a habits card only when habits are supplied', () => {
  const target = { innerHTML:'' };
  const habit = buildStudentHabits({ student:students[0], missions:missions.filter(row => row.studentId === 'a'), activity:attempts('a', 40, 10), now });
  renderStudentVocabularyProfile(target, { className:'11A', profile:{ displayName:'Ana' }, habit });
  assert.match(target.innerHTML, /data-habits-student/);
  assert.match(target.innerHTML, /4 of 4 ✓/);
  assert.match(target.innerHTML, /25% of first answers needed a second try/);
  renderStudentVocabularyProfile(target, { className:'11A', profile:{ displayName:'Ana' } });
  assert.doesNotMatch(target.innerHTML, /data-habits-student/);
});

test('teacher data keeps only mission timing per class student and marks missing table', () => {
  const raw = {
    profiles:[{ id:'a', role:'student', display_name:'Ana' }, { id:'z', role:'student', display_name:'Zed' }],
    memberships:[{ student_id:'a', class_id:'k1', ended_at:null }],
    classes:[{ id:'k1', class_name:'11A' }],
    missions:[{ student_id:'a', completed_at:at(9, 21), mission_kind:'pathway', score:9, stars:3 }, { student_id:'z', completed_at:at(9, 21), mission_kind:'mixed' }]
  };
  const klass = normalizeTeacherVocabularyData(raw).classes[0];
  assert.equal(klass.missions.length, 1);
  assert.deepEqual(Object.keys(klass.missions[0]).sort(), ['completedAt', 'kind', 'studentId']);
  assert.equal(klass.missionsAvailable, true);
  assert.equal(normalizeTeacherVocabularyData({ ...raw, missions:null }).classes[0].missionsAvailable, false);
});
