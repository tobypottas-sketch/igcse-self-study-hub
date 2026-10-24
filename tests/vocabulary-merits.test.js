import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMeritStatus, countPassedStages, SKILLS_PER_MERIT } from '../src/vocabulary/merits.js';
import { renderTeacherOverview } from '../src/vocabulary/teacher-views.js';
import { normalizeTeacherVocabularyData } from '../src/vocabulary/teacher-data.js';

const IDS = ['recognise','match','apply','recall','mastery'];
const occurrences = [{ occurrenceId:'o1', vocabularyId:'v1', unitNumber:1 }];
const students = [{ id:'s1', displayName:'Ava' }, { id:'s2', displayName:'Ben' }];
const pathwayIds = ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall'];
function progress(done) { return { stages:Object.fromEntries(IDS.map(id => [id,{ completed:done.includes(id), needsPractice:false }])) }; }
function unitRow(studentId, perPathway) {
  return { studentId, occurrenceId:'o1', contextualEvidence:{ pathwayProgress:Object.fromEntries(Object.entries(perPathway).map(([id,done]) => [id,progress(done)])) } };
}

test('a student with no saved progress has earned no merit', () => {
  const [row] = buildMeritStatus({ students:[students[0]], occurrences, unitMastery:[], globalMastery:[] });
  assert.equal(row.skillsPassed, 0);
  assert.equal(row.earned, 0);
  assert.deepEqual(row.pendingNumbers, []);
});

test('ten passed pathway stages earn one merit; fewer do not', () => {
  const four = ['recognise','match','apply','recall'];
  const nine = unitRow('s1', { meaning:four, context:four, word_families:['recognise']  });
  const ten = unitRow('s2', { meaning:four, context:four, word_families:['recognise','match'] });
  const rows = buildMeritStatus({ students, occurrences, unitMastery:[nine, ten], globalMastery:[] });
  assert.equal(rows[0].skillsPassed, 9);
  assert.equal(rows[0].earned, 0);
  assert.equal(rows[0].skillsToNext, 1);
  assert.equal(rows[1].skillsPassed, 10);
  assert.equal(rows[1].earned, 1);
  assert.deepEqual(rows[1].pendingNumbers, [1]);
  assert.equal(SKILLS_PER_MERIT, 10);
});

test('awarded merits are not offered again, and later merits still are', () => {
  const four = ['recognise','match','apply','recall'];
  const row = unitRow('s1', Object.fromEntries(pathwayIds.slice(0,5).map(id => [id,four])));
  const [first] = buildMeritStatus({ students:[students[0]], occurrences, unitMastery:[row], globalMastery:[], awards:[{ studentId:'s1', meritNumber:1 }] });
  assert.equal(first.skillsPassed, 20);
  assert.equal(first.earned, 2);
  assert.deepEqual(first.pendingNumbers, [2]);
  assert.equal(first.awarded, 1);
  const [done] = buildMeritStatus({ students:[students[0]], occurrences, unitMastery:[row], globalMastery:[], awards:[{ studentId:'s1', meritNumber:1 }, { studentId:'s1', meritNumber:2 }] });
  assert.deepEqual(done.pendingNumbers, []);
});

test('only the student’s own progress counts', () => {
  const four = ['recognise','match','apply','recall'];
  const theirs = unitRow('s2', { meaning:four, context:four, word_families:four });
  const passed = countPassedStages({ occurrences, unitMastery:{ o1:theirs }, globalMastery:{} });
  assert.equal(passed, 12);
  const [ava] = buildMeritStatus({ students:[students[0]], occurrences, unitMastery:[theirs], globalMastery:[] });
  assert.equal(ava.skillsPassed, 0);
});

test('teacher overview lists merits to award with a mark-awarded button', () => {
  const root = { innerHTML:'' };
  renderTeacherOverview(root, { className:'11A', merits:{ available:true, skillsPerMerit:10, rows:[{ studentId:'s1', displayName:'Ava', skillsPassed:12, earned:1, pendingNumbers:[1] }, { studentId:'s2', displayName:'Ben', skillsPassed:3, earned:0, pendingNumbers:[] }] } });
  assert.match(root.innerHTML, /Merits to award \(1\)/);
  assert.match(root.innerHTML, /data-action="teacher-award-merit" data-student-id="s1"/);
  assert.doesNotMatch(root.innerHTML, /data-student-id="s2"/);
});

test('teacher overview explains when the merit table is not installed yet', () => {
  const root = { innerHTML:'' };
  renderTeacherOverview(root, { className:'11A', merits:{ available:false, skillsPerMerit:10, rows:[] } });
  assert.match(root.innerHTML, /not switched on yet/);
});

test('missing merit table does not break the teacher data', () => {
  const data = normalizeTeacherVocabularyData({ profiles:[{ id:'s1', role:'student', display_name:'Ava' }], memberships:[{ student_id:'s1', class_id:'c1', ended_at:null }], classes:[{ id:'c1', class_name:'11A' }], awards:null });
  assert.equal(data.classes[0].meritsAvailable, false);
  const ok = normalizeTeacherVocabularyData({ profiles:[], memberships:[], classes:[{ id:'c1', class_name:'11A' }], awards:[{ student_id:'s1', merit_number:1 }] });
  assert.equal(ok.classes[0].meritsAvailable, true);
});
