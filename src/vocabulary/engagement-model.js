// Pure, derived engagement model (Phase 1). Inputs are factual vocabulary_missions rows; nothing here is stored,
// nothing feeds mastery or evidence, and no function reads or writes the network.
import { STAR_THRESHOLDS } from './engagement-copy.js';
import { buildUnitPathwayStates } from './pathway-view-model.js';
import { VOCABULARY_PATHWAYS } from './pathway-model.js';
import { SKILLS_PER_MERIT } from './merits.js';

export const STREAK_MILESTONES = Object.freeze([3, 5, 8, 10]);
const STAGE_LABEL = Object.freeze({ recognise:'Recognise', match:'Match', apply:'Apply', recall:'Recall', mastery:'Mastery' });
const CLEAR_WITHIN_REACH = 8;

function whole(value) { return Math.max(0, Math.floor(Number(value) || 0)); }

export function normaliseMission(raw = {}) {
  return {
    missionId:String(raw.missionId ?? raw.mission_id ?? ''),
    unitNumber:whole(raw.unitNumber ?? raw.unit_number),
    kind:String(raw.missionKind ?? raw.mission_kind ?? raw.kind ?? 'pathway'),
    pathwayId:raw.pathwayId ?? raw.pathway_id ?? null,
    stage:raw.pathwayStage ?? raw.pathway_stage ?? raw.stage ?? null,
    family:String(raw.practiceFamily ?? raw.practice_family ?? raw.family ?? ''),
    size:whole(raw.missionSize ?? raw.mission_size ?? 10),
    score:whole(raw.score),
    stars:whole(raw.stars),
    bestStreak:whole(raw.bestStreak ?? raw.best_streak),
    completedAt:String(raw.completedAt ?? raw.completed_at ?? '')
  };
}

// A fair comparison bucket: pathway + stage + practice family/mode + mission size. Mixed Practice has its own bucket.
export function bucketKey(mission) {
  const m = normaliseMission(mission);
  if (m.kind === 'mixed') return `mixed|mixed|${m.size}`;
  return `pathway|${m.pathwayId}|${m.stage}|${m.family}|${m.size}`;
}

function byTime(a, b) {
  return (Date.parse(a.completedAt) || 0) - (Date.parse(b.completedAt) || 0) || a.missionId.localeCompare(b.missionId);
}

function better(a, b) {
  // Is result a better than result b? Higher score wins; the same score with a longer clean streak also counts.
  if (!b) return false;
  return a.score > b.score || (a.score === b.score && a.bestStreak > b.bestStreak);
}

// Compare one recorded mission with everything the student did before it, inside its own bucket.
export function evaluateMission(rawRows = [], missionId) {
  const rows = rawRows.map(normaliseMission).sort(byTime);
  const index = rows.findIndex(row => row.missionId === missionId);
  if (index < 0) return null;
  const mission = rows[index];
  const key = bucketKey(mission);
  const earlier = rows.slice(0, index);
  const sameBucket = earlier.filter(row => bucketKey(row) === key);
  const previousBest = sameBucket.reduce((best, row) => (!best || better(row, best) ? { score:row.score, bestStreak:row.bestStreak } : best), null);
  const previousStreakRecord = earlier.reduce((max, row) => Math.max(max, row.bestStreak), 0);
  const isFirstInBucket = sameBucket.length === 0;
  const isPersonalBest = !isFirstInBucket && better(mission, previousBest);
  const personalBestKind = !isPersonalBest ? null : mission.score > previousBest.score ? 'score' : 'streak';
  const bucketBest = isPersonalBest || isFirstInBucket ? { score:mission.score, bestStreak:mission.bestStreak } : previousBest;
  return {
    mission,
    missionNumber:index + 1,
    isFirstInBucket,
    isPersonalBest,
    personalBestKind,
    previousBest,
    bucketBest,
    isStreakRecord:mission.bestStreak > previousStreakRecord && mission.bestStreak >= STREAK_MILESTONES[0],
    previousStreakRecord
  };
}

// "Best / Aim" for a bucket the student is about to practise (or just practised).
export function bestAndAim(rawRows = [], descriptor = {}) {
  const key = bucketKey({ missionKind:descriptor.kind ?? 'pathway', pathwayId:descriptor.pathwayId, pathwayStage:descriptor.stage, practiceFamily:descriptor.family, missionSize:10 });
  const rows = rawRows.map(normaliseMission).filter(row => bucketKey(row) === key);
  const best = rows.reduce((top, row) => (!top || better(row, top) ? row : top), null);
  if (!best) return { best:null, aim:7, copy:'Aim: 7 or more for 2 stars' };
  if (best.score >= 10) return { best:{ score:best.score, bestStreak:best.bestStreak }, aim:10, copy:`Best ${best.score}/10 · Keep it perfect` };
  const nextStar = STAR_THRESHOLDS.find(threshold => threshold > best.score);
  const aim = best.score + 1;
  return { best:{ score:best.score, bestStreak:best.bestStreak }, aim, copy:`Best ${best.score}/10 · Aim: ${nextStar && nextStar - best.score <= 2 ? nextStar : aim}` };
}

// One achievable next goal, chosen by a fixed priority: clear the stage if it is close, beat the best, earn 3 stars, reach a streak milestone.
export function nextChallenge({ evaluation, stageId = null, stageLabel = null, answersToClear = null, stageCleared = false, mastered = false } = {}) {
  if (!evaluation) return null;
  const { mission } = evaluation;
  const label = stageLabel ?? STAGE_LABEL[stageId] ?? 'this stage';
  const remaining = Number(answersToClear);
  if (!mastered && !stageCleared && mission.kind === 'pathway' && Number.isFinite(remaining) && remaining > 0 && remaining <= CLEAR_WITHIN_REACH) {
    return { kind:'clear_stage', text:`Clear ${label}: ${remaining} more clean ${remaining === 1 ? 'answer' : 'answers'}` };
  }
  const best = evaluation.bucketBest;
  if (!evaluation.isFirstInBucket && best && best.score < 10 && mission.score < 10) {
    return { kind:'beat_best', text:`Beat your best of ${best.score}/10: aim for ${best.score + 1}` };
  }
  if (mission.score < STAR_THRESHOLDS[2]) return { kind:'three_stars', text:`Earn 3 stars: score ${STAR_THRESHOLDS[2]} or more` };
  const nextMilestone = STREAK_MILESTONES.find(value => value > mission.bestStreak);
  if (nextMilestone) return { kind:'streak', text:`Reach ${nextMilestone} in a row` };
  return null;
}

export function describeEngagement(evaluation, challenge, rewards = null) {
  if (!evaluation) return null;
  const { mission } = evaluation;
  const headline = evaluation.isPersonalBest
    ? `New personal best: ${mission.score}/10${evaluation.personalBestKind === 'streak' ? ' with a longer clean streak' : ''}`
    : evaluation.isFirstInBucket ? 'First result saved here: this is your mark to beat' : `Your best here is ${evaluation.bucketBest.score}/10`;
  const chips = [
    { id:'mission', label:`Mission ${evaluation.missionNumber}` },
    { id:'streak', label:`Best clean streak ${mission.bestStreak}` }
  ];
  const unlocked = rewards?.unlocked ?? [];
  if (rewards && rewards.xpGained > 0) chips.push({ id:'xp', label:`+${rewards.xpGained} XP` });
  if (rewards?.level) chips.push({ id:'level', label:rewards.levelUp ? `Level up: Level ${rewards.level}` : `Level ${rewards.level}` });
  const shown = unlocked.slice(0, 2).map(item => item.name);
  const unlockedLine = unlocked.length ? `Achievement unlocked: ${shown.join(', ')}${unlocked.length > 2 ? ` (+${unlocked.length - 2} more)` : ''}` : null;
  const spoken = [headline, `Mission ${evaluation.missionNumber}.`, `Best clean streak ${mission.bestStreak}.`,
    rewards && rewards.xpGained > 0 ? `${rewards.xpGained} XP earned.` : '', rewards?.level ? `Level ${rewards.level}.` : '', unlockedLine ? `${unlockedLine}.` : '',
    challenge ? `Next challenge: ${challenge.text}.` : ''].filter(Boolean).join(' ');
  return { headline, isPersonalBest:evaluation.isPersonalBest, chips, challenge, unlockedLine, levelUp:Boolean(rewards?.levelUp), spoken };
}


// ---------------------------------------------------------------------------------------------------------------------
// Phase 2: XP, Level N, weekly goal, achievements and merit progress. All derived from mission rows plus the pathway progress
// the app already holds; nothing is stored and nothing here can award a teacher merit.
// ---------------------------------------------------------------------------------------------------------------------
export const LEVEL_THRESHOLDS = Object.freeze([0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700]);
export const WEEKLY_GOAL = 4;
export const XP_RULES = Object.freeze({ dailyMissionCap:80, personalBest:5, weeklyGoal:15, achievement:25, stageClear:40, pathwayMastery:100, unitMastery:200 });

export function levelFor(xp) {
  const total = whole(xp);
  let level = 1;
  for (let index = 0; index < LEVEL_THRESHOLDS.length; index += 1) if (total >= LEVEL_THRESHOLDS[index]) level = index + 1;
  const floor = LEVEL_THRESHOLDS[level - 1];
  const next = level >= LEVEL_THRESHOLDS.length ? null : LEVEL_THRESHOLDS[level];
  return { level, xp:total, floor, next, toNext:next == null ? 0 : next - total, progressPercent:next == null ? 100 : Math.round(((total - floor) / (next - floor)) * 100) };
}

// What the student has passed so far, from the same per-word pathway progress the unit screen shows.
export function progressSnapshot({ occurrences = [], unitMastery = {}, globalMastery = {} } = {}) {
  const byUnit = new Map();
  for (const occurrence of occurrences) {
    const unit = occurrence.unitNumber ?? occurrence.unit_number;
    if (unit == null) continue;
    if (!byUnit.has(unit)) byUnit.set(unit, []);
    byUnit.get(unit).push(occurrence);
  }
  let passedStages = 0; let masteredPathwayCount = 0; let unitsMastered = 0;
  const masteredPathways = new Set();
  for (const unitOccurrences of byUnit.values()) {
    const states = buildUnitPathwayStates({ occurrences:unitOccurrences, unitMastery, globalMastery });
    const available = Object.entries(states).filter(([, state]) => state?.available !== false);
    for (const [id, state] of available) {
      passedStages += state?.completedStages?.length ?? 0;
      if (state?.mastered === true) { masteredPathwayCount += 1; masteredPathways.add(id); }
    }
    if (available.length && available.every(([, state]) => state?.mastered === true)) unitsMastered += 1;
  }
  return { passedStages, masteredPathwayCount, masteredPathways, unitsMastered };
}

// Merit progress, always worded as progress toward the teacher-awarded merit.
export function meritProgress(passedStages, awarded = null) {
  const passed = whole(passedStages);
  const toNext = SKILLS_PER_MERIT - (passed % SKILLS_PER_MERIT);
  return {
    passedStages:passed,
    toNext,
    copy:`${toNext} more passed ${toNext === 1 ? 'stage' : 'stages'} toward your next teacher-awarded merit`,
    awarded:awarded == null ? null : whole(awarded)
  };
}

function localDayKey(iso) { const date = new Date(iso); return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; }
function weekKey(iso) {
  const date = new Date(iso);
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7));
  return `${monday.getFullYear()}-${monday.getMonth() + 1}-${monday.getDate()}`;
}

export function weeklyGoal(rawRows = [], now = new Date()) {
  const rows = rawRows.map(normaliseMission);
  const current = weekKey(now.toISOString());
  const done = rows.filter(row => row.completedAt && weekKey(row.completedAt) === current).length;
  const perWeek = new Map();
  for (const row of rows) if (row.completedAt) perWeek.set(weekKey(row.completedAt), (perWeek.get(weekKey(row.completedAt)) ?? 0) + 1);
  const weeksMet = [...perWeek.values()].filter(count => count >= WEEKLY_GOAL).length;
  return { done, goal:WEEKLY_GOAL, met:done >= WEEKLY_GOAL, weeksMet, label:`${Math.min(done, WEEKLY_GOAL)} of ${WEEKLY_GOAL} missions this week` };
}

const PATHWAY_ACHIEVEMENTS = Object.freeze([
  ['meaning_maker', 'Meaning Maker', 'meaning'],
  ['context_expert', 'Context Expert', 'context'],
  ['word_builder', 'Word Builder', 'word_families'],
  ['paraphrase_pro', 'Paraphrase Pro', 'paraphrasing'],
  ['precision_player', 'Precision Player', 'precision_use'],
  ['total_recall', 'Total Recall', 'spelling_recall']
]);

// 14 deterministic rules, derived from real outcomes. They cannot be awarded twice and none can be earned by repeating one easy activity.
export function achievements({ missions = [], snapshot = null } = {}) {
  const rows = missions.map(normaliseMission);
  const progress = snapshot ?? { passedStages:0, masteredPathways:new Set(), unitsMastered:0 };
  const pathwaysDone = new Set(rows.filter(row => row.kind === 'pathway' && row.pathwayId).map(row => row.pathwayId));
  const list = [
    { id:'first_steps', name:'First Steps', rule:'Finish your first mission', unlocked:rows.length >= 1 },
    { id:'hot_streak', name:'Hot Streak', rule:'5 clean answers in a row', unlocked:rows.some(row => row.bestStreak >= 5) },
    { id:'perfect_ten', name:'Perfect Ten', rule:'10 clean answers in a row', unlocked:rows.some(row => row.bestStreak >= 10) },
    { id:'comeback', name:'Comeback', rule:'Score 10/10 after a slip', unlocked:rows.some(row => row.score >= 10 && row.bestStreak < 10) },
    { id:'stage_climber', name:'Stage Climber', rule:'Pass 5 pathway stages', unlocked:progress.passedStages >= 5 },
    { id:'all_rounder', name:'All-Rounder', rule:'A mission in all six pathways', unlocked:VOCABULARY_PATHWAYS.every(pathway => pathwaysDone.has(pathway.id)) },
    ...PATHWAY_ACHIEVEMENTS.map(([id, name, pathwayId]) => ({ id, name, rule:`All five ${VOCABULARY_PATHWAYS.find(pathway => pathway.id === pathwayId)?.label ?? pathwayId} stages`, unlocked:progress.masteredPathways?.has?.(pathwayId) === true })),
    { id:'steady_week', name:'Steady Week', rule:`${WEEKLY_GOAL} missions in one week`, unlocked:weeklyGoal(missions).weeksMet >= 1 },
    { id:'unit_master', name:'Unit Master', rule:'Master a whole unit', unlocked:progress.unitsMastered >= 1 }
  ];
  return list;
}

function missionXp(score) { return score >= 9 ? 20 : score >= 7 ? 15 : 10; }

export function computeXp({ missions = [], snapshot = null } = {}) {
  const rows = missions.map(normaliseMission).sort(byTime);
  const perDay = new Map(); const perDayBucket = new Map();
  let missionXpTotal = 0; let personalBests = 0;
  rows.forEach((row, index) => {
    const day = localDayKey(row.completedAt);
    const taperKey = `${day}|${row.kind === 'mixed' ? 'mixed' : `${row.pathwayId}|${row.stage}`}`;
    const seen = (perDayBucket.get(taperKey) ?? 0) + 1; perDayBucket.set(taperKey, seen);
    let xp = missionXp(row.score);
    if (seen >= 3) xp = Math.floor(xp / 2);
    const used = perDay.get(day) ?? 0;
    xp = Math.max(0, Math.min(xp, XP_RULES.dailyMissionCap - used));
    perDay.set(day, used + xp);
    missionXpTotal += xp;
    if (evaluateMission(rows.slice(0, index + 1), row.missionId)?.isPersonalBest) personalBests += 1;
  });
  const unlocked = achievements({ missions, snapshot }).filter(item => item.unlocked).length;
  const goal = weeklyGoal(missions);
  const parts = {
    missions:missionXpTotal,
    personalBests:personalBests * XP_RULES.personalBest,
    weeklyGoals:goal.weeksMet * XP_RULES.weeklyGoal,
    achievements:unlocked * XP_RULES.achievement,
    stageClears:(snapshot?.passedStages ?? 0) * XP_RULES.stageClear,
    pathwayMasteries:(snapshot?.masteredPathwayCount ?? 0) * XP_RULES.pathwayMastery,
    unitMasteries:(snapshot?.unitsMastered ?? 0) * XP_RULES.unitMastery
  };
  const total = Object.values(parts).reduce((sum, value) => sum + value, 0);
  return { total, parts, ...levelFor(total) };
}
