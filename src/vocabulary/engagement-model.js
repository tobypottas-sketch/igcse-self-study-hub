// Pure, derived engagement model (Phase 1). Inputs are factual vocabulary_missions rows; nothing here is stored,
// nothing feeds mastery or evidence, and no function reads or writes the network.
import { STAR_THRESHOLDS } from './engagement-copy.js';

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

export function describeEngagement(evaluation, challenge) {
  if (!evaluation) return null;
  const { mission } = evaluation;
  const headline = evaluation.isPersonalBest
    ? `New personal best: ${mission.score}/10${evaluation.personalBestKind === 'streak' ? ' with a longer clean streak' : ''}`
    : evaluation.isFirstInBucket ? 'First result saved here: this is your mark to beat' : `Your best here is ${evaluation.bucketBest.score}/10`;
  const chips = [
    { id:'mission', label:`Mission ${evaluation.missionNumber}` },
    { id:'streak', label:`Best clean streak ${mission.bestStreak}` }
  ];
  const spoken = [headline, `Mission ${evaluation.missionNumber}.`, `Best clean streak ${mission.bestStreak}.`, challenge ? `Next challenge: ${challenge.text}.` : ''].filter(Boolean).join(' ');
  return { headline, isPersonalBest:evaluation.isPersonalBest, chips, challenge, spoken };
}
