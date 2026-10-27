import test from 'node:test';
import assert from 'node:assert/strict';
import { buildActivityDashboard } from '../src/admin/activity-model.js';

const now = new Date('2026-10-27T12:00:00Z');
const students = [
  { id:'s1', displayName:'Amina', classId:'c1', className:'Grade 9' },
  { id:'s2', displayName:'Leo', classId:'c1', className:'Grade 9' }
];
const occurrences = [
  { occurrenceId:'u1:w1', vocabularyId:'w1', unitNumber:1 },
  { occurrenceId:'u1:w2', vocabularyId:'w2', unitNumber:1 }
];
const unitMastery = [
  {
    studentId:'s1', occurrenceId:'u1:w1', status:'building',
    contextualEvidence:{ pathwayProgress:{
      meaning:{ completedStages:['recognise','match'], currentStage:'apply' },
      context:{ completedStages:['recognise'], currentStage:'match' },
      word_families:{ completedStages:[], currentStage:'recognise' },
      paraphrasing:{ completedStages:['recognise','match','apply'], currentStage:'recall' },
      precision_use:{ completedStages:['recognise'], currentStage:'match' },
      spelling_recall:{ completedStages:['recognise','match'], currentStage:'apply' }
    }}
  }
];
const globalMastery = [{ studentId:'s1', vocabularyId:'w1', status:'building', strandEvidence:{} }];
const activity = [
  { studentId:'s1', appKey:'vocabulary_paraphrase', eventType:'attempt_completed', occurredAt:'2026-10-27T10:00:00Z', metadata:{ pathway_id:'meaning', pathway_stage:'match' } },
  { studentId:'s1', appKey:'vocabulary_paraphrase', eventType:'attempt_completed', occurredAt:'2026-10-25T10:00:00Z', metadata:{ pathway_id:'context', pathway_stage:'recognise' } },
  { studentId:'s2', appKey:'vocabulary_paraphrase', eventType:'attempt_completed', occurredAt:'2026-10-15T10:00:00Z', metadata:{} }
];
const unitChecks = [
  { studentId:'s1', unitNumber:1, attemptNumber:1, score:4, maxScore:10, completedAt:'2026-10-26T09:00:00Z' },
  { studentId:'s1', unitNumber:1, attemptNumber:2, score:3, maxScore:10, completedAt:'2026-10-27T09:00:00Z' }
];

function input(overrides = {}) {
  return { students, occurrences, globalMastery, unitMastery, activity, unitChecks, awards:[], now, ...overrides };
}

test('builds compact student usage, six-pathway progression and Unit Check summaries', () => {
  const dashboard = buildActivityDashboard(input());
  const amina = dashboard.students.find(row => row.studentId === 's1');
  assert.equal(amina.lastActive, '2026-10-27T10:00:00Z');
  assert.equal(amina.activityThisWeek, 2);
  assert.equal(amina.recentApp, 'vocabulary_paraphrase');
  assert.deepEqual(Object.keys(amina.pathways), ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']);
  assert.equal(amina.pathways.meaning.currentStage, 'apply');
  assert.equal(amina.unitCheck.latestScore, 3);
  assert.equal(amina.unitCheck.bestScore, 4);
  assert.equal(amina.unitCheck.attemptsUsed, 2);
  assert.equal(amina.unitCheck.attemptsRemaining, 1);
});

test('uses existing merit semantics and exposes earned-but-unawarded merits as alerts', () => {
  const progressed = unitMastery.map(row => ({
    ...row,
    contextualEvidence:{ pathwayProgress:Object.fromEntries(
      ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall'].map(id => [id,{ completedStages:['recognise','match'], currentStage:'apply' }])
    ) }
  }));
  const dashboard = buildActivityDashboard(input({ unitMastery:progressed }));
  const amina = dashboard.students.find(row => row.studentId === 's1');
  assert.equal(amina.pendingMerits, 1);
  assert.equal(dashboard.pendingMerits, 1);

  const acknowledged = buildActivityDashboard(input({ unitMastery:progressed, awards:[{ studentId:'s1', meritNumber:1 }] }));
  assert.equal(acknowledged.students.find(row => row.studentId === 's1').pendingMerits, 0);
});

test('flags inactivity and repeated weak Unit Check results with simple explicit rules', () => {
  const dashboard = buildActivityDashboard(input());
  const amina = dashboard.students.find(row => row.studentId === 's1');
  const leo = dashboard.students.find(row => row.studentId === 's2');
  assert.ok(amina.attention.some(item => item.code === 'weak_unit_check'));
  assert.ok(leo.attention.some(item => item.code === 'inactive'));
  assert.equal(amina.needsAttention, true);
  assert.equal(leo.needsAttention, true);
});

test('recent activity feed contains safe labels but no answer or prompt text', () => {
  const dashboard = buildActivityDashboard(input({ activity:[
    { studentId:'s1', appKey:'vocabulary_paraphrase', eventType:'attempt_completed', occurredAt:'2026-10-27T10:00:00Z', metadata:{ pathway_id:'meaning', student_answer:'SECRET', prompt_text:'PRIVATE' } }
  ] }));
  const feed = dashboard.students.find(row => row.studentId === 's1').recentActivity;
  assert.equal(feed.length, 1);
  assert.equal(JSON.stringify(feed).includes('SECRET'), false);
  assert.equal(JSON.stringify(feed).includes('PRIVATE'), false);
});
