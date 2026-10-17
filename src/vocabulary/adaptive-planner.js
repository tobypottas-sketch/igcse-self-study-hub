import { activityDefinition, activitiesForMode, isActivityLive } from './activity-catalogue.js';

const STAGE_ORDER = Object.freeze({ new:0, building:1, secure:2, mastered:3 });
const MODE_ENTRY_STAGE = Object.freeze({
  learn:'new',
  context:'new',
  question_text:'building',
  phrase_paraphrase:'new',
  idea_paraphrase:'building',
  writing:'building',
  adaptive:'new'
});

const ADAPTIVE_LADDERS = Object.freeze({
  new:['meaning_match','which_situation_fits','phrase_match'],
  building:[
    'which_situation_fits','meaning_in_context','correct_usage','phrase_match',
    'question_text_bridge','find_evidence','build_paraphrase','complete_paraphrase','same_idea','spot_meaning_change'
  ],
  secure:[
    'complete_paraphrase','rewrite_phrase','build_same_idea','rewrite_idea',
    'improve_vocabulary','collocation_builder','word_family_switch','question_text_bridge','spot_meaning_change'
  ],
  mastered:['rewrite_phrase','rewrite_idea','improve_vocabulary','explain_another_way']
});

const SUPPORT_FALLBACKS = Object.freeze({
  rewrite_idea:['same_idea','spot_meaning_change','build_same_idea','build_paraphrase','complete_paraphrase'],
  build_same_idea:['same_idea','spot_meaning_change','build_paraphrase'],
  rewrite_phrase:['build_paraphrase','complete_paraphrase','phrase_match'],
  improve_vocabulary:['correct_usage','collocation_builder','word_family_switch'],
  explain_another_way:['same_idea','rewrite_phrase','build_paraphrase'],
  word_family_switch:['correct_usage','collocation_builder'],
  collocation_builder:['correct_usage','meaning_in_context'],
  complete_paraphrase:['build_paraphrase','phrase_match'],
  build_paraphrase:['phrase_match','meaning_in_context'],
  question_text_bridge:['find_evidence','meaning_in_context'],
  find_evidence:['question_text_bridge','meaning_in_context'],
  spot_meaning_change:['same_idea','meaning_in_context'],
  same_idea:['meaning_in_context','phrase_match']
});

function stageOf(mastery = {}) {
  const status = String(mastery?.status ?? 'new').toLocaleLowerCase('en');
  return STAGE_ORDER[status] == null ? 'new' : status;
}

function effectiveStage(practiceMode, mastery) {
  const actual = stageOf(mastery);
  if (practiceMode === 'adaptive') return actual;
  const baseline = MODE_ENTRY_STAGE[practiceMode] ?? 'new';
  return STAGE_ORDER[actual] >= STAGE_ORDER[baseline] ? actual : baseline;
}

function score(mastery, strand) {
  const value = Number(mastery?.strandEvidence?.[strand] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function availableSet(availableContent) {
  if (!Array.isArray(availableContent) || !availableContent.length) return null;
  return new Set(availableContent.map(value => typeof value === 'string' ? value : value?.type ?? value?.id).filter(Boolean));
}

function stageEligible(type, stage) {
  const definition = activityDefinition(type);
  return Boolean(definition) && isActivityLive(type) && STAGE_ORDER[definition.minimumStage] <= STAGE_ORDER[stage];
}

function allowedForMode(practiceMode) {
  return new Set(activitiesForMode(practiceMode).map(activity => activity.id));
}

function filterCandidates(candidates, { practiceMode, stage, available, excluded = new Set() }) {
  const modeAllowed = allowedForMode(practiceMode);
  return candidates.filter(type =>
    modeAllowed.has(type) && stageEligible(type, stage) && (!available || available.has(type)) && !excluded.has(type)
  );
}

function adaptiveCandidates(mastery, reviewDue) {
  const stage = stageOf(mastery);
  if (reviewDue && stage === 'mastered') return [...ADAPTIVE_LADDERS.mastered];
  if (stage === 'new') return [...ADAPTIVE_LADDERS.new];
  if (stage === 'building') {
    if (score(mastery,'context') < 3) return ['which_situation_fits','meaning_in_context','correct_usage','question_text_bridge','find_evidence','phrase_match','build_paraphrase','same_idea'];
    if (score(mastery,'paraphrasing') < 3) return ['phrase_match','build_paraphrase','complete_paraphrase','question_text_bridge','same_idea','spot_meaning_change'];
    return [...ADAPTIVE_LADDERS.building];
  }
  return [...ADAPTIVE_LADDERS[stage]];
}

function focusedCandidates(practiceMode, stage) {
  const activities = activitiesForMode(practiceMode).filter(activity => STAGE_ORDER[activity.minimumStage] <= STAGE_ORDER[stage]);
  const strengthOrder = Object.freeze({ light:0, medium:1, strong:2, very_strong:3 });
  return activities.slice().sort((a,b) => strengthOrder[a.evidenceStrength] - strengthOrder[b.evidenceStrength]).map(activity => activity.id);
}

function progressionCandidates({ practiceMode, mastery, recentActivities, reviewDue, stage }) {
  const base = practiceMode === 'adaptive' ? adaptiveCandidates(mastery, reviewDue) : focusedCandidates(practiceMode, stage);
  const last = recentActivities.at(-1);
  if (!last?.correct) return base;
  const index = base.indexOf(last.type);
  if (index >= 0 && index < base.length - 1) return [...base.slice(index + 1), ...base.slice(0, index + 1)];
  return base.filter(type => type !== last.type).concat(last.type ? [last.type] : []);
}

export function planNextActivity({ practiceMode = 'adaptive', mastery = {}, recentActivities = [], supportState = null, reviewDue = false, availableContent = [] } = {}) {
  const actualStage = stageOf(mastery);
  const stage = effectiveStage(practiceMode, mastery);
  const available = availableSet(availableContent);
  const recent = Array.isArray(recentActivities) ? recentActivities : [];
  const last = recent.at(-1) ?? null;
  const recycle = supportState?.recycle === true;
  const struggling = supportState?.struggling === true || recycle;
  const excluded = new Set(recycle && last?.type ? [last.type] : []);
  const avoidContentIds = [...new Set(recent.map(activity => activity?.contentId).filter(Boolean))];

  let candidates;
  if (struggling && last?.type && SUPPORT_FALLBACKS[last.type]) candidates = [...SUPPORT_FALLBACKS[last.type]];
  else candidates = progressionCandidates({ practiceMode, mastery, recentActivities:recent, reviewDue, stage });

  let filtered = filterCandidates(candidates, { practiceMode, stage, available, excluded });
  if (!filtered.length) {
    const fallback = practiceMode === 'adaptive' ? activitiesForMode('adaptive').map(activity => activity.id) : activitiesForMode(practiceMode).map(activity => activity.id);
    filtered = filterCandidates(fallback, { practiceMode, stage, available, excluded });
  }
  if (!filtered.length && excluded.size) {
    const fallback = practiceMode === 'adaptive' ? activitiesForMode('adaptive').map(activity => activity.id) : activitiesForMode(practiceMode).map(activity => activity.id);
    filtered = filterCandidates(fallback, { practiceMode, stage, available, excluded:new Set() });
  }
  if (!filtered.length) throw new Error('No suitable curated activity is available for this practice state.');

  return {
    activityType:filtered[0], avoidContentIds, practiceMode,
    stage:actualStage,
    readinessStage:stage,
    supportDirection:struggling ? 'more_support' : (last?.correct ? 'raise_demand' : 'hold')
  };
}