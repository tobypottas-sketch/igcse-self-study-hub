import test from 'node:test';
import assert from 'node:assert/strict';
import { bucketKey, evaluateMission, bestAndAim, nextChallenge, describeEngagement } from '../src/vocabulary/engagement-model.js';

let n = 0;
function row(overrides = {}) {
  n += 1;
  return { mission_id:`m${String(n).padStart(3,'0')}`, unit_number:1, mission_kind:'pathway', pathway_id:'meaning', pathway_stage:'recognise', practice_family:'meaning:recognise', mission_size:10, score:6, stars:1, best_streak:3, completed_at:new Date(Date.UTC(2026,9,1,0,n)).toISOString(), ...overrides };
}

test('buckets separate pathway, stage, practice family and Mixed Practice', () => {
  const base = bucketKey(row());
  assert.notEqual(base, bucketKey(row({ pathway_stage:'match' })));
  assert.notEqual(base, bucketKey(row({ pathway_id:'context' })));
  assert.notEqual(base, bucketKey(row({ practice_family:'recommended' })));
  const mixed = bucketKey(row({ mission_kind:'mixed', pathway_id:null, pathway_stage:null, practice_family:'mixed' }));
  assert.notEqual(base, mixed);
  assert.equal(mixed, bucketKey(row({ mission_kind:'mixed', pathway_id:null, pathway_stage:null, practice_family:'mixed', score:10 })));
});

test('the first result in a bucket sets the mark to beat and is not called a personal best', () => {
  const rows = [row()];
  const result = evaluateMission(rows, rows[0].mission_id);
  assert.equal(result.isFirstInBucket, true);
  assert.equal(result.isPersonalBest, false);
  assert.equal(result.missionNumber, 1);
});

test('a higher score is a personal best; the same score needs a longer clean streak; a lower score is not', () => {
  const a = row({ score:6, best_streak:3 });
  const b = row({ score:8, best_streak:4 });
  const c = row({ score:8, best_streak:6 });
  const d = row({ score:8, best_streak:5 });
  const e = row({ score:7, best_streak:9 });
  const rows = [a, b, c, d, e];
  assert.equal(evaluateMission(rows, b.mission_id).personalBestKind, 'score');
  assert.equal(evaluateMission(rows, c.mission_id).personalBestKind, 'streak');
  assert.equal(evaluateMission(rows, d.mission_id).isPersonalBest, false);
  const last = evaluateMission(rows, e.mission_id);
  assert.equal(last.isPersonalBest, false);
  assert.deepEqual(last.bucketBest, { score:8, bestStreak:6 });
});

test('a better score in a different bucket never counts as a personal best here', () => {
  const stageOne = row({ score:10, best_streak:10 });
  const stageTwo = row({ pathway_stage:'match', score:5 });
  const result = evaluateMission([stageOne, stageTwo], stageTwo.mission_id);
  assert.equal(result.isFirstInBucket, true);
  assert.equal(result.isPersonalBest, false);
});

test('Mixed Practice compares only with other Mixed Practice', () => {
  const mixedA = row({ mission_kind:'mixed', pathway_id:null, pathway_stage:null, practice_family:'mixed', score:6 });
  const pathwayHigh = row({ score:10, best_streak:10 });
  const mixedB = row({ mission_kind:'mixed', pathway_id:null, pathway_stage:null, practice_family:'mixed', score:7 });
  const result = evaluateMission([mixedA, pathwayHigh, mixedB], mixedB.mission_id);
  assert.equal(result.isPersonalBest, true);
  assert.equal(result.previousBest.score, 6);
});

test('Best / Aim line for a bucket with and without history', () => {
  const descriptor = { kind:'pathway', pathwayId:'meaning', stage:'recognise', family:'meaning:recognise' };
  assert.equal(bestAndAim([], descriptor).copy, 'Aim: 7 or more for 2 stars');
  assert.equal(bestAndAim([row({ score:8 })], descriptor).copy, 'Best 8/10 · Aim: 9');
  assert.equal(bestAndAim([row({ score:10 })], descriptor).copy, 'Best 10/10 · Keep it perfect');
  assert.equal(bestAndAim([row({ pathway_stage:'match', score:9 })], descriptor).best, null);
});

test('next challenge follows the fixed priority and only offers achievable goals', () => {
  const prior = row({ score:8, best_streak:5 });
  const current = row({ score:7, best_streak:4 });
  const evaluation = evaluateMission([prior, current], current.mission_id);
  assert.match(nextChallenge({ evaluation, stageId:'recognise', answersToClear:5 }).text, /^Clear Recognise: 5 more clean answers$/);
  assert.equal(nextChallenge({ evaluation, stageId:'recognise', answersToClear:30 }).kind, 'beat_best');
  const first = row({ pathway_stage:'apply', score:6 });
  assert.equal(nextChallenge({ evaluation:evaluateMission([first], first.mission_id) }).kind, 'three_stars');
  const great = row({ pathway_stage:'recall', score:9, best_streak:4 });
  assert.equal(nextChallenge({ evaluation:evaluateMission([great], great.mission_id) }).text, 'Reach 5 in a row');
  const flawless = row({ pathway_stage:'mastery', score:10, best_streak:10 });
  assert.equal(nextChallenge({ evaluation:evaluateMission([flawless], flawless.mission_id) }), null);
  assert.notEqual(nextChallenge({ evaluation, stageId:'recognise', answersToClear:2, stageCleared:true })?.kind, 'clear_stage');
  assert.notEqual(nextChallenge({ evaluation, stageId:'mastery', answersToClear:2, mastered:true })?.kind, 'clear_stage');
});

test('descriptions never claim a personal best unless one happened, and read well aloud', () => {
  const a = row({ score:5 });
  const b = row({ score:9, best_streak:7 });
  const pb = evaluateMission([a, b], b.mission_id);
  const text = describeEngagement(pb, nextChallenge({ evaluation:pb }));
  assert.match(text.headline, /New personal best: 9\/10/);
  assert.match(text.spoken, /Mission 2\./);
  const first = describeEngagement(evaluateMission([a], a.mission_id), null);
  assert.doesNotMatch(first.headline, /personal best/i);
});

import fs from 'node:fs';
test('the app records a mission only through the id, only for finished non-preview missions, and only reads rows back', () => {
  const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  assert.match(app, /recordVocabularyMission\(state\.client, missionId\)/);
  assert.match(app, /!state\.preview && \(state\.pathwayId \|\| state\.mixedReview\) && finished\.mode === 'adaptive'/);
  const data = fs.readFileSync(new URL('../src/vocabulary/data.js', import.meta.url), 'utf8');
  assert.match(data, /rpc\('record_vocabulary_mission', \{ p_mission_id:missionId \}\)/);
  assert.match(data, /Engagement data is optional/);
});
