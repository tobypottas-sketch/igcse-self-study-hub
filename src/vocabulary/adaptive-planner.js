import { ACTIVITY_FAMILIES, activityDefinition, activitiesForMode, isActivityLive } from './activity-catalogue.js';
import { deriveLearningStage } from './learning-stage.js';

const LEGACY_STAGE_ORDER = Object.freeze({ new:0, building:1, secure:2, mastered:3 });
const LEARNING_STAGE_ORDER = Object.freeze({ emerging:0, building:1, developing:2, secure:3, mastered:4 });
const FAMILY_DEMAND = Object.freeze({ recognition:0, retrieval:1, discrimination:2, manipulation:3, production:4 });
const MODE_ENTRY_STAGE = Object.freeze({
  learn:'new',
  context:'new',
  question_text:'building',
  phrase_paraphrase:'new',
  idea_paraphrase:'building',
  writing:'building',
  adaptive:'new'
});
const STRENGTH_ORDER = Object.freeze({ light:0, medium:1, strong:2, very_strong:3 });

export const ADAPTIVE_FAMILY_MIX = Object.freeze({
  emerging:Object.freeze({ recognition:70, retrieval:20, discrimination:10, manipulation:0, production:0 }),
  building:Object.freeze({ recognition:25, retrieval:50, discrimination:20, manipulation:5, production:0 }),
  developing:Object.freeze({ recognition:10, retrieval:25, discrimination:45, manipulation:20, production:0 }),
  secure:Object.freeze({ recognition:5, retrieval:15, discrimination:25, manipulation:40, production:15 }),
  mastered:Object.freeze({ recognition:5, retrieval:10, discrimination:15, manipulation:25, production:45 })
});

function persistedStage(mastery = {}) {
  const status = String(mastery?.status ?? 'new').toLocaleLowerCase('en');
  return LEGACY_STAGE_ORDER[status] == null ? 'new' : status;
}

function effectiveLegacyStage(practiceMode, mastery) {
  const actual = persistedStage(mastery);
  if (practiceMode === 'adaptive') return actual;
  const baseline = MODE_ENTRY_STAGE[practiceMode] ?? 'new';
  return LEGACY_STAGE_ORDER[actual] >= LEGACY_STAGE_ORDER[baseline] ? actual : baseline;
}

function availableSet(availableContent) {
  if (!Array.isArray(availableContent) || !availableContent.length) return null;
  return new Set(availableContent.map(value => typeof value === 'string' ? value : value?.type ?? value?.id).filter(Boolean));
}

function activityFamily(entry) {
  return entry?.family ?? activityDefinition(entry?.type)?.family ?? null;
}

function allowedActivities({ practiceMode, mastery, available, excluded = new Set() }) {
  const learningStage = deriveLearningStage(mastery);
  const legacyStage = effectiveLegacyStage(practiceMode, mastery);
  return activitiesForMode(practiceMode).filter(activity => {
    if (!isActivityLive(activity.id) || excluded.has(activity.id) || (available && !available.has(activity.id))) return false;
    if (practiceMode === 'adaptive') return LEARNING_STAGE_ORDER[activity.earliestStage] <= LEARNING_STAGE_ORDER[learningStage];
    return LEGACY_STAGE_ORDER[activity.minimumStage] <= LEGACY_STAGE_ORDER[legacyStage];
  });
}

function recentFamilyCounts(recent) {
  const counts = Object.fromEntries(ACTIVITY_FAMILIES.map(family => [family,0]));
  for (const entry of recent.slice(-10)) {
    const family = activityFamily(entry);
    if (family in counts) counts[family] += 1;
  }
  return counts;
}

function twoRecentHighDemand(recent) {
  const lastTwo = recent.slice(-2);
  return lastTwo.length === 2 && lastTwo.every(entry => FAMILY_DEMAND[activityFamily(entry)] >= FAMILY_DEMAND.manipulation);
}

function familyScore(family, { stage, recent, reviewDue }) {
  const mix = ADAPTIVE_FAMILY_MIX[stage] ?? ADAPTIVE_FAMILY_MIX.emerging;
  const counts = recentFamilyCounts(recent);
  let score = Number(mix[family] ?? 0) - counts[family] * 12;
  if (counts[family] >= 3) score -= 100;

  const last = recent.at(-1) ?? null;
  const lastFamily = activityFamily(last);
  if (last?.correct && lastFamily && FAMILY_DEMAND[family] === FAMILY_DEMAND[lastFamily] + 1) score += 25;

  if (twoRecentHighDemand(recent)) {
    if (FAMILY_DEMAND[family] <= FAMILY_DEMAND.discrimination) score += 40;
    else score -= 40;
  }

  if (reviewDue && stage === 'mastered') {
    if (family === 'production') score += 20;
    if (family === 'manipulation') score += 10;
  }
  return score;
}

function chooseFamily(activities, args) {
  const availableFamilies = [...new Set(activities.map(activity => activity.family))];
  return availableFamilies.sort((a,b) => {
    const scoreDiff = familyScore(b, args) - familyScore(a, args);
    if (scoreDiff) return scoreDiff;
    return FAMILY_DEMAND[b] - FAMILY_DEMAND[a];
  })[0] ?? null;
}

function chooseActivity(activities, { stage, recent, preferSupport = false }) {
  const lastType = recent.at(-1)?.type ?? null;
  let choices = [...activities];
  if (lastType && choices.length > 1) choices = choices.filter(activity => activity.id !== lastType);
  return choices.sort((a,b) => {
    const aPreferred = a.preferredStages?.includes(stage) ? 1 : 0;
    const bPreferred = b.preferredStages?.includes(stage) ? 1 : 0;
    if (aPreferred !== bPreferred) return bPreferred - aPreferred;
    const strengthDiff = (STRENGTH_ORDER[a.evidenceStrength] ?? 0) - (STRENGTH_ORDER[b.evidenceStrength] ?? 0);
    return preferSupport ? strengthDiff : -strengthDiff;
  })[0] ?? null;
}

function supportActivity(activities, recent) {
  const last = recent.at(-1) ?? null;
  const lastFamily = activityFamily(last);
  const lastDemand = FAMILY_DEMAND[lastFamily] ?? FAMILY_DEMAND.production;
  let support = activities.filter(activity => activity.supportSuitable && FAMILY_DEMAND[activity.family] < lastDemand);
  if (!support.length) support = activities.filter(activity => activity.supportSuitable);
  if (!support.length) return null;
  const bestDemand = Math.max(...support.map(activity => FAMILY_DEMAND[activity.family]));
  support = support.filter(activity => FAMILY_DEMAND[activity.family] === bestDemand);
  return chooseActivity(support, { stage:'secure', recent, preferSupport:true });
}

function focusedActivity(activities, { mastery, recent }) {
  const legacyStage = effectiveLegacyStage('adaptive', mastery);
  const last = recent.at(-1) ?? null;
  let choices = [...activities];
  if (last?.type && choices.length > 1) choices = choices.filter(activity => activity.id !== last.type);
  return choices.sort((a,b) => {
    const stageDiff = LEGACY_STAGE_ORDER[a.minimumStage] - LEGACY_STAGE_ORDER[b.minimumStage];
    if (stageDiff) return last?.correct ? -stageDiff : stageDiff;
    return (STRENGTH_ORDER[a.evidenceStrength] ?? 0) - (STRENGTH_ORDER[b.evidenceStrength] ?? 0);
  }).find(activity => LEGACY_STAGE_ORDER[activity.minimumStage] <= LEGACY_STAGE_ORDER[legacyStage]) ?? choices[0] ?? null;
}

export function planNextActivity({ practiceMode = 'adaptive', mastery = {}, recentActivities = [], supportState = null, reviewDue = false, availableContent = [] } = {}) {
  const stage = deriveLearningStage(mastery);
  const readinessStage = effectiveLegacyStage(practiceMode, mastery);
  const available = availableSet(availableContent);
  const recent = Array.isArray(recentActivities) ? recentActivities : [];
  const last = recent.at(-1) ?? null;
  const recycle = supportState?.recycle === true;
  const struggling = supportState?.struggling === true || recycle;
  const excluded = new Set(recycle && last?.type ? [last.type] : []);
  const avoidContentIds = [...new Set(recent.map(activity => activity?.contentId).filter(Boolean))];

  let eligible = allowedActivities({ practiceMode, mastery, available, excluded });
  if (!eligible.length && excluded.size) eligible = allowedActivities({ practiceMode, mastery, available, excluded:new Set() });
  if (!eligible.length) throw new Error('No suitable curated activity is available for this practice state.');

  let chosen = null;
  if (struggling) chosen = supportActivity(eligible, recent);

  if (!chosen && practiceMode === 'adaptive') {
    const family = chooseFamily(eligible, { stage, recent, reviewDue });
    chosen = chooseActivity(eligible.filter(activity => activity.family === family && (!reviewDue || activity.reviewSuitable)), { stage, recent });
    if (!chosen) chosen = chooseActivity(eligible.filter(activity => activity.family === family), { stage, recent });
  }

  if (!chosen) chosen = focusedActivity(eligible, { mastery, recent });
  if (!chosen) throw new Error('No suitable curated activity is available for this practice state.');

  return {
    activityType:chosen.id,
    family:chosen.family,
    avoidContentIds,
    practiceMode,
    stage,
    readinessStage,
    supportDirection:struggling ? 'more_support' : (last?.correct ? 'raise_demand' : 'hold')
  };
}
