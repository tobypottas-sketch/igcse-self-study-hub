import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMeritStatus, countMasteredPathways, DEFAULT_PATHWAYS_PER_MERIT } from '../src/vocabulary/merits.js';
import { meritProgress } from '../src/vocabulary/engagement-model.js';

const stages = ['recognise','match','apply','recall','mastery'];
const pathways = ['meaning','context','word_families','paraphrasing','precision_use','spelling_recall'];

function fixture(masteredCount = 0) {
  const occurrence = { occurrenceId:'occ-1', vocabularyId:'word-1', unitNumber:1 };
  const pathwayProgress = Object.fromEntries(pathways.map((id,index) => [id, {
    completedStages:index < masteredCount ? stages : []
  }]));
  return {
    occurrences:[occurrence],
    unitMastery:[{ studentId:'s1', occurrenceId:'occ-1', contextualEvidence:{ pathwayProgress } }],
    globalMastery:[]
  };
}

test('default merit threshold is two fully mastered pathways', () => {
  assert.equal(DEFAULT_PATHWAYS_PER_MERIT, 2);
  const data = fixture(4);
  const unit = Object.fromEntries(data.unitMastery.map(row => [row.occurrenceId,row]));
  assert.equal(countMasteredPathways({ occurrences:data.occurrences, unitMastery:unit }), 4);
  const [status] = buildMeritStatus({ students:[{ id:'s1' }], ...data });
  assert.equal(status.completedPathways, 4);
  assert.equal(status.earned, 2);
  assert.deepEqual(status.pendingNumbers, [1,2]);
});

test('each student uses the threshold of their class', () => {
  const data = fixture(4);
  const [status] = buildMeritStatus({
    students:[{ id:'s1', meritPathwaysRequired:4 }],
    ...data
  });
  assert.equal(status.pathwaysPerMerit, 4);
  assert.equal(status.earned, 1);
  assert.deepEqual(status.pendingNumbers, [1]);
});

test('raising a threshold never resurrects or revokes an awarded merit number', () => {
  const data = fixture(4);
  const [status] = buildMeritStatus({
    students:[{ id:'s1', meritPathwaysRequired:4 }],
    ...data,
    awards:[
      { studentId:'s1', meritNumber:1 },
      { studentId:'s1', meritNumber:2 }
    ]
  });
  assert.equal(status.awarded, 2);
  assert.deepEqual(status.pendingNumbers, []);
  assert.equal(status.nextMeritNumber, 3);
  assert.equal(status.pathwaysToNext, 8);
});

test('student progress copy uses completed pathways and the supplied class threshold', () => {
  const progress = meritProgress(3, 2, 1);
  assert.equal(progress.completedPathways, 3);
  assert.equal(progress.pathwaysPerMerit, 2);
  assert.equal(progress.toNext, 1);
  assert.match(progress.copy, /1 more completed pathway/);
  assert.doesNotMatch(progress.copy, /stage/i);
});
