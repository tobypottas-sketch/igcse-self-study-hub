import test from 'node:test';
import assert from 'node:assert/strict';
import { buildClassInsights, buildStudentProfile, buildProblemDrilldown } from '../src/vocabulary/analytics.js';

const students = [
  { id:'s1', displayName:'Student One' },
  { id:'s2', displayName:'Student Two' },
  { id:'s3', displayName:'Student Three' }
];

const targets = [
  { vocabularyId:'v1', term:'significant', unitNumber:7 },
  { vocabularyId:'v2', term:'proficiency', unitNumber:7 },
  { vocabularyId:'v3', term:'compromise', unitNumber:7 }
];

const mastery = [
  { studentId:'s1', vocabularyId:'v1', status:'building', strandEvidence:{ meaning:8, recognition:7, context:6, paraphrasing:1, production:0 }, recentErrorPattern:'retrieval_failure', updatedAt:'2026-10-16T10:00:00Z' },
  { studentId:'s1', vocabularyId:'v2', status:'building', strandEvidence:{ meaning:7, recognition:7, context:5, paraphrasing:1, production:1 }, recentErrorPattern:'related_but_inaccurate', updatedAt:'2026-10-16T10:00:00Z' },
  { studentId:'s2', vocabularyId:'v1', status:'building', strandEvidence:{ meaning:8, recognition:7, context:6, paraphrasing:1, production:0 }, recentErrorPattern:'retrieval_failure', updatedAt:'2026-10-16T11:00:00Z' },
  { studentId:'s2', vocabularyId:'v3', status:'secure', strandEvidence:{ meaning:8, recognition:7, context:6, paraphrasing:5, production:1 }, recentErrorPattern:null, updatedAt:'2026-10-16T11:00:00Z' }
];

const activity = [
  { studentId:'s1', occurredAt:'2026-10-16T10:00:00Z', eventType:'question_attempt', metadata:{ strand:'production' } },
  { studentId:'s2', occurredAt:'2026-10-16T11:00:00Z', eventType:'question_attempt', metadata:{ strand:'production' } }
];

test('class insights distinguish skill problems from difficult vocabulary and engagement gaps', () => {
  const result = buildClassInsights({ students, targets, mastery, activity, now:new Date('2026-10-17T00:00:00Z') });
  assert.equal(result.mainWeakness.strand, 'production');
  assert.equal(result.mainWeakness.problemType, 'skill');
  assert.equal(result.difficultWords[0].term, 'significant');
  assert.equal(result.engagement.practisedRecently, 2);
  assert.equal(result.engagement.notRecentlyPractised, 1);
  assert.ok(result.studentsNeedingAttention.some(row => row.studentId === 's1'));
});

test('absence of recent practice is an engagement signal, not automatic attainment weakness', () => {
  const result = buildClassInsights({
    students:[{ id:'s3', displayName:'Student Three' }], targets,
    mastery:[], activity:[], now:new Date('2026-10-17T00:00:00Z')
  });
  assert.equal(result.studentsNeedingAttention.length, 0);
  assert.equal(result.engagement.notRecentlyPractised, 1);
  assert.equal(result.mainWeakness, null);
});

test('problem drilldown groups affected students, targets, strands and failure categories', () => {
  const result = buildProblemDrilldown({ students, targets, mastery, strand:'production' });
  assert.equal(result.strand, 'production');
  assert.equal(result.affectedStudents.length, 2);
  assert.equal(result.words.find(row => row.vocabularyId === 'v1').affectedCount, 2);
  assert.equal(result.failureTypes.find(row => row.type === 'retrieval_failure').count, 2);
});

test('individual profile stays qualitative and surfaces persistent gaps', () => {
  const profile = buildStudentProfile({ student:students[0], targets, mastery:mastery.filter(row => row.studentId === 's1'), activity:activity.filter(row => row.studentId === 's1') });
  assert.equal(profile.studentId, 's1');
  assert.equal(profile.strongestStrand, 'meaning');
  assert.equal(profile.developmentArea, 'production');
  assert.ok(profile.persistentTargets.some(row => row.term === 'significant'));
  assert.equal(Object.values(profile.strands).every(value => ['Strong','Secure','Developing','Needs attention','Insufficient evidence'].includes(value)), true);
});
