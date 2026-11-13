import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildFollowUpPlan, teamsFollowUpMessage } from '../src/vocabulary/follow-up-plan.js';
import { renderTeacherOverview, renderProblemArea, renderStudentVocabularyProfile, renderFollowUpPlan } from '../src/vocabulary/teacher-views.js';

const data = {
  className:'G9 ESL 4',
  students:[{id:'s1',displayName:'Student One'},{id:'s2',displayName:'Student Two'},{id:'s3',displayName:'Student Three'}],
  targets:[{vocabularyId:'v1',term:'majority'},{vocabularyId:'v2',term:'harmless'},{vocabularyId:'v3',term:'outlet'}],
  mastery:[
    {studentId:'s1',vocabularyId:'v1',status:'building',recentErrorPattern:null},
    {studentId:'s1',vocabularyId:'v2',status:'building',recentErrorPattern:'retrieval_failure'},
    {studentId:'s2',vocabularyId:'v1',status:'secure',recentErrorPattern:null},
    {studentId:'s2',vocabularyId:'v3',status:'building',recentErrorPattern:'retrieval_failure'},
    {studentId:'s3',vocabularyId:'v2',status:'mastered',recentErrorPattern:null}
  ]
};

test('groups developing vocabulary by student once and excludes secure/mastered rows', () => {
  const plan=buildFollowUpPlan({classData:data,currentInsights:{mainWeakness:{skillId:'idea_paraphrasing'}}});
  assert.equal(plan.students.length,2);
  assert.equal(plan.students[0].id,'s1');
  assert.equal(plan.students[0].totalTargets,2);
  assert.deepEqual(plan.students[0].words,['majority','harmless']);
  assert.deepEqual(plan.students[1].words,['outlet']);
  assert.equal(plan.wordBank.length,3);
  assert.match(plan.focusSource,/Class-level/);
  assert.match(plan.limitation,/not proof/);
});

test('drilldown and individual profile restrict the selected students without inventing evidence', () => {
  const drill=buildFollowUpPlan({classData:data,currentDrilldown:{affectedStudents:[{studentId:'s2'},{studentId:'s3'}],skillId:'idea_paraphrasing'}});
  assert.deepEqual(drill.students.map(s=>s.id),['s2']);
  const single=buildFollowUpPlan({classData:data,currentStudent:{studentId:'s1',developmentSkill:'idea_paraphrasing'}});
  assert.deepEqual(single.students.map(s=>s.id),['s1']);
  assert.equal(buildFollowUpPlan({classData:{...data,mastery:[]}}).students.length,0);
});

test('Teams draft is student-facing and does not expose student names or internal strand codes',()=>{
  const plan=buildFollowUpPlan({classData:data,currentInsights:{mainWeakness:{skillId:'idea_paraphrasing'}}});
  const draft=teamsFollowUpMessage(plan);
  assert.match(draft,/Vocabulary follow-up \| 10 minutes/);
  assert.match(draft,/majority/);
  assert.match(draft,/rewrite each sentence/);
  assert.doesNotMatch(draft,/Student One|Student Two|idea_paraphrasing|Failure type/);
  assert.equal(teamsFollowUpMessage({...plan,students:[]}), '');
});

test('teacher surfaces offer a practical follow-up, with the old export removed',()=>{
  const view=readFileSync(new URL('../src/vocabulary/teacher-views.js',import.meta.url),'utf8');
  const app=readFileSync(new URL('../src/vocabulary/teacher-app.js',import.meta.url),'utf8');
  assert.doesNotMatch(view,/Create Teams Target List|teacher-teams-targets/);
  assert.doesNotMatch(app,/copyTeamsTargets|targetRowsForTeams|teacher-teams-targets/);
  assert.match(view,/Plan follow-up practice/);
  assert.match(app,/teacher-follow-up-back/);
  assert.match(app,/teacher-copy-follow-up/);
  assert.match(app,/teacher-recommend-practice/);
  assert.match(app,/await navigator\.clipboard\.writeText\(text\)/);
});

test('the plan renders an auditable focus and the exact copyable Teams draft',()=>{
  const target={innerHTML:''};
  const plan=buildFollowUpPlan({classData:data,currentInsights:{mainWeakness:{skillId:'idea_paraphrasing'}}});
  renderFollowUpPlan(target,plan);
  assert.match(target.innerHTML,/Students to check in with/);
  assert.match(target.innerHTML,/Student One/);
  assert.match(target.innerHTML,/10-minute classroom follow-up/);
  assert.match(target.innerHTML,/class="vocab-follow-up__draft"/);
  assert.match(target.innerHTML,/data-action="teacher-copy-follow-up"/);
  assert.match(target.innerHTML,/data-action="teacher-recommend-practice"/);
});
