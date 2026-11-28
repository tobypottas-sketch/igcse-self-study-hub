import test from 'node:test';
import assert from 'node:assert/strict';
import { buildActivityDashboard } from '../src/admin/activity-model.js';

const now = new Date('2026-11-27T06:00:00Z');
const student = { id:'uuid', displayName:'Synthetic', classId:'new', startedAt:'2026-11-26T00:00:00Z' };
const check = (unitNumber, attemptNumber, score, completedAt = '2026-11-26T08:00:00Z') => ({
  studentId:student.id, unitNumber, attemptNumber, score, maxScore:10,
  formId:['A','B','C'][attemptNumber-1], completedAt
});
const build = input => buildActivityDashboard({students:[student],now,...input}).students[0];

test('one check in each of three units leaves two attempts remaining in every unit', () => {
  const row = build({unitChecks:[check(1,1,3),check(2,1,8),check(3,1,9),check(1,1,3)]});
  assert.deepEqual(row.unitChecks.map(({unitNumber,attemptsUsed,attemptsRemaining}) =>
    [unitNumber,attemptsUsed,attemptsRemaining]),[[1,1,2],[2,1,2],[3,1,2]]);
  assert.equal(row.activeDays,1);
  assert.equal(row.unitChecks[0].rows[0].formId,'A');
});

test('improvement and earlier assessment history are visible without a struggle classification', () => {
  const row = build({unitChecks:[
    check(1,1,3,'2026-11-21T08:00:00Z'),check(1,2,4,'2026-11-22T08:00:00Z'),
    check(1,3,9),check(2,1,10,'2026-11-29T00:00:00Z')
  ]});
  assert.equal(row.unitChecks.length,1);
  assert.deepEqual(row.unitChecks[0].rows.map(row => row.score),[9,4,3]);
  assert.equal(row.unitChecks[0].latestScore,9);
  assert.equal(row.unitChecks[0].bestScore,9);
  assert.equal(Object.hasOwn(row,'needsAttention'),false);
});

test('Listening practice contributes engagement without fabricating Vocabulary progress, or exposing answers', () => {
  const row = build({activity:[{
    studentId:student.id,classId:'new',appKey:'listening',eventType:'question_attempt',
    occurredAt:'2026-11-26T08:00:00Z',metadata:{student_answer:'PRIVATE'}
  }]});
  assert.equal(row.activeDays,1);
  assert.deepEqual(row.learningAreas,['listening']);
  assert.deepEqual(row.unitPathways,[]);
  assert.doesNotMatch(JSON.stringify(row),/PRIVATE/);
});

test('an unavailable query cannot masquerade as zero days of practice', () => {
  assert.equal(build({}).practiceState,'no-records');
  const row = build({engagementAvailable:false});
  assert.equal(row.activeDays,null);
  assert.equal(row.practiceState,'retrieval-failure');
});

test('native mastery stays unit-specific and preserves existing awards after a transfer', () => {
  const occurrences = [
    { unitNumber:1, occurrenceId:'u1', vocabularyId:'word' },
    { unitNumber:2, occurrenceId:'u2', vocabularyId:'word2' }
  ];
  const unitMastery = [{
    studentId:student.id, occurrenceId:'u1', contextualEvidence:{pathwayProgress:{
      meaning:{completedStages:['recognise','match','apply','recall','mastery']}
    }}
  }];
  const awards = [{studentId:student.id,meritNumber:3}];
  const row = build({occurrences,unitMastery,awards,coverageByUnit:{1:{},2:{}}});
  assert.deepEqual(row.unitPathways.map(unit => unit.unitNumber),[1]);
  assert.equal(row.unitPathways[0].pathways.meaning.mastered,true);
  assert.equal(row.awardedMerits,1);
  assert.deepEqual(row.pendingMeritNumbers,[]);
  const limited = build({occurrences,unitMastery,awards,coverageByUnit:{1:{meaning:{available:false}},2:{}}});
  assert.equal(limited.unitPathways[0].pathways.meaning.available,false);
  assert.equal(limited.eligibleMerits,0);
  assert.equal(limited.awardedMerits,1);
});

test('progressive usage computes real awards and engagement but never invents pending merits or mastery',()=>{const row=build({detailsPending:true,awards:[{studentId:student.id,meritNumber:1},{studentId:student.id,meritNumber:1}],activity:[{studentId:student.id,classId:'new',appKey:'reading',eventType:'question_attempt',occurredAt:'2026-11-26T08:00:00Z'}]});assert.equal(row.awardedMerits,1);assert.equal(row.pendingMerits,null);assert.equal(row.unitPathways,null);assert.equal(row.activeDays,1)});

test('word-stage completion includes unstarted serviceable words and excludes unavailable targets',()=>{const occurrences=[{unitNumber:1,occurrenceId:'u1',vocabularyId:'w1'},{unitNumber:1,occurrenceId:'u2',vocabularyId:'w2'},{unitNumber:1,occurrenceId:'u3',vocabularyId:'w3'}];const row=build({occurrences,unitMastery:[{studentId:student.id,occurrenceId:'u1',contextualEvidence:{pathwayProgress:{meaning:{completedStages:['recognise','match','apply','recall','mastery']}}}}],coverageByUnit:{1:{meaning:{available:true,occurrenceIds:['u1','u2']}}}});const p=row.unitPathways[0].pathways.meaning;assert.equal(p.completedWordStages,5);assert.equal(p.totalWordStages,10);assert.equal(p.masteredWords,1);assert.equal(p.serviceableWords,2)});
