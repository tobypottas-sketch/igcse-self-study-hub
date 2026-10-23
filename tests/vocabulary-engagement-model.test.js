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
  const descriptor = { unitNumber:1, kind:'pathway', pathwayId:'meaning', stage:'recognise', family:'meaning:recognise' };
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

import { achievements, computeXp, levelFor, meritProgress, weeklyGoal, XP_RULES } from '../src/vocabulary/engagement-model.js';
const PATHWAYS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];
function at(day, hour = 10, minute = 0) { return new Date(2026, 9, day, hour, minute).toISOString(); }
function mission(overrides = {}) { return row({ completed_at:at(5), ...overrides }); }

test('levels are plain Level N from the approved thresholds', () => {
  assert.equal(levelFor(0).level, 1);
  assert.equal(levelFor(99).level, 1);
  assert.equal(levelFor(100).level, 2);
  assert.equal(levelFor(2699).level, 9);
  assert.deepEqual([levelFor(2700).level, levelFor(99999).level, levelFor(2700).next], [10, 10, null]);
  const mid = levelFor(175);
  assert.deepEqual([mid.level, mid.toNext, mid.progressPercent], [2, 75, 50]);
});

test('merit progress is worded as progress toward the teacher-awarded merit', () => {
  assert.equal(meritProgress(4).copy, '6 more passed stages toward your next teacher-awarded merit');
  assert.equal(meritProgress(9).copy, '1 more passed stage toward your next teacher-awarded merit');
  assert.equal(meritProgress(10).toNext, 10);
  assert.doesNotMatch(meritProgress(3).copy, /earn(ed)? a merit|you earned|awarded you/i);
});

test('weekly goal counts missions Monday to Sunday and is fixed at 4', () => {
  const rows = [mission({ completed_at:at(19) }), mission({ completed_at:at(20) }), mission({ completed_at:at(21, 23, 59) }), mission({ completed_at:at(22, 0, 1) }), mission({ completed_at:at(18) })];
  const goal = weeklyGoal(rows, new Date(2026, 9, 23, 9));
  assert.deepEqual([goal.done, goal.goal, goal.met], [4, 4, true]);
  assert.equal(weeklyGoal(rows, new Date(2026, 9, 26, 9)).done, 0);
  assert.equal(weeklyGoal(rows, new Date(2026, 9, 18, 12)).done, 1);
  assert.equal(goal.weeksMet, 1);
});

test('mission XP is 10 / 15 / 20 by score and capped at 80 a day, with half XP from the third repeat of a stage', () => {
  const day = [10, 11, 12, 13, 14].map((minute, index) => mission({ score:9, completed_at:at(6, 9, minute), pathway_stage:['recognise', 'match', 'apply', 'recall', 'mastery'][index] }));
  const capped = computeXp({ missions:day });
  assert.equal(capped.parts.missions, 80);
  assert.equal(computeXp({ missions:[mission({ score:9 })] }).parts.missions, 20);
  assert.equal(computeXp({ missions:[mission({ score:7 })] }).parts.missions, 15);
  assert.equal(computeXp({ missions:[mission({ score:3 })] }).parts.missions, 10);
  const repeats = [1, 2, 3].map(minute => mission({ score:9, completed_at:at(7, 9, minute) }));
  assert.equal(computeXp({ missions:repeats }).parts.missions, 20 + 20 + 10);
});

test('personal bests, achievements and progress add the approved bonuses', () => {
  const rows = [mission({ score:6, best_streak:3, completed_at:at(5, 9, 1) }), mission({ score:8, best_streak:5, completed_at:at(5, 9, 2) })];
  const snapshot = { passedStages:3, masteredPathwayCount:1, masteredPathways:new Set(['meaning']), unitsMastered:0 };
  const xp = computeXp({ missions:rows, snapshot });
  assert.equal(xp.parts.personalBests, XP_RULES.personalBest);
  assert.equal(xp.parts.stageClears, 3 * XP_RULES.stageClear);
  assert.equal(xp.parts.pathwayMasteries, XP_RULES.pathwayMastery);
  const unlocked = achievements({ missions:rows, snapshot }).filter(item => item.unlocked).map(item => item.id);
  assert.deepEqual(unlocked.sort(), ['first_steps', 'hot_streak', 'meaning_maker'].sort());
  assert.equal(xp.parts.achievements, 3 * XP_RULES.achievement);
});

test('there are exactly 14 achievements, Personal Best is not one, and none carry unlock dates', () => {
  const list = achievements({ missions:[], snapshot:null });
  assert.equal(list.length, 14);
  assert.equal(new Set(list.map(item => item.id)).size, 14);
  assert.ok(list.some(item => item.id === 'comeback'));
  assert.ok(!list.some(item => /personal best/i.test(item.name)));
  assert.ok(list.every(item => !('unlockedAt' in item) && !('date' in item)));
  assert.equal(list.filter(item => item.unlocked).length, 0);
});

test('Comeback needs a perfect score after a slip; Perfect Ten needs ten clean answers in a row; All-Rounder needs every pathway', () => {
  const comeback = achievements({ missions:[mission({ score:10, best_streak:7 })] });
  assert.equal(comeback.find(item => item.id === 'comeback').unlocked, true);
  assert.equal(comeback.find(item => item.id === 'perfect_ten').unlocked, false);
  const flawless = achievements({ missions:[mission({ score:10, best_streak:10 })] });
  assert.equal(flawless.find(item => item.id === 'perfect_ten').unlocked, true);
  assert.equal(flawless.find(item => item.id === 'comeback').unlocked, false);
  const five = PATHWAYS.slice(0, 5).map((pathway, index) => mission({ pathway_id:pathway, completed_at:at(5, 9, index) }));
  assert.equal(achievements({ missions:five }).find(item => item.id === 'all_rounder').unlocked, false);
  const six = PATHWAYS.map((pathway, index) => mission({ pathway_id:pathway, completed_at:at(5, 9, index) }));
  assert.equal(achievements({ missions:six }).find(item => item.id === 'all_rounder').unlocked, true);
});
