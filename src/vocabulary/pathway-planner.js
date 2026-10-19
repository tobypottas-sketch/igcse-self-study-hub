import { buildActivity } from './activity-factory.js';
import { PATHWAY_STAGES, activityTypesForPathwayStage, pathwayDefinition } from './pathway-model.js';
import { availableActivityTypesForTarget } from './session-targets.js';
import { PATHWAY_ACTIVITY_TYPES } from './pathway-activity-builder.js';
import { registeredPathwayCoverage } from './pathway-coverage-store.js';

const STAGE_IDS = Object.freeze(PATHWAY_STAGES.map(stage => stage.id));
const READINESS_BY_STAGE = Object.freeze({
  recognise:'building',
  match:'building',
  apply:'secure',
  recall:'secure',
  mastery:'mastered'
});

function array(value) { return Array.isArray(value) ? value : []; }
function text(value) { return String(value ?? '').trim(); }
function hashSeed(seed) {
  let hash = 2166136261;
  for (const char of String(seed ?? '')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash,16777619) >>> 0; }
  return hash >>> 0;
}
function stableOrder(values, seed) {
  const choices = [...values];
  if (choices.length < 2) return choices;
  const offset = hashSeed(seed) % choices.length;
  return [...choices.slice(offset), ...choices.slice(0,offset)];
}
function previousStage(stageId) {
  const index = STAGE_IDS.indexOf(stageId);
  return index > 0 ? STAGE_IDS[index - 1] : null;
}
function validatePathwayStage(pathwayId, stageId) {
  if (!pathwayDefinition(pathwayId)) throw new Error('Unknown vocabulary pathway.');
  if (!STAGE_IDS.includes(stageId)) throw new Error('Unknown vocabulary pathway stage.');
}
function mappedChoices(pathwayId, stageId, availableActivityTypes) {
  const allowed = activityTypesForPathwayStage(pathwayId,stageId);
  const available = new Set(array(availableActivityTypes));
  return allowed.filter(type => available.has(type));
}
function readinessForStage(stageId) {
  return READINESS_BY_STAGE[stageId] ?? 'building';
}
function targetCanTryActivity(type, availableForTarget) {
  return PATHWAY_ACTIVITY_TYPES.has(type) || availableForTarget.has(type);
}
function unitNumberFor(content, target = null) {
  return target?.unitNumber ?? target?.unit_number ?? content?.occurrences?.[0]?.unitNumber ?? content?.occurrences?.[0]?.unit_number ?? null;
}

export function selectPathwayStageActivity({
  pathwayId,
  stageId,
  availableActivityTypes = [],
  recentActivities = [],
  supportState = null,
  seed = ''
} = {}) {
  validatePathwayStage(pathwayId,stageId);
  let servedStage = stageId;
  let supportLevel = 'none';
  if (supportState?.struggling === true || supportState?.recycle === true) {
    servedStage = previousStage(stageId) ?? stageId;
    supportLevel = servedStage === stageId ? 'none' : 'light';
  }

  let choices = mappedChoices(pathwayId,servedStage,availableActivityTypes);
  const recent = new Set(array(recentActivities));
  const fresh = choices.filter(type => !recent.has(type));
  if (fresh.length) choices = fresh;
  if (!choices.length) throw new Error('No suitable curated activity is available for this pathway stage.');

  const ordered = stableOrder(choices,`${seed}:${pathwayId}:${stageId}:${servedStage}`);
  return {
    pathwayId,
    learnerStage:stageId,
    servedStage,
    activityType:ordered[0],
    readinessStage:readinessForStage(servedStage),
    supportLevel,
    reason:servedStage === stageId ? 'Fixed pathway stage' : 'Temporary one-stage support'
  };
}

function materialForTarget(content, target) {
  const item = content?.itemsById?.[target?.vocabularyId] ?? array(content?.items).find(row => row?.vocabularyId === target?.vocabularyId);
  if (!item) throw new Error('Vocabulary item is missing.');
  const contexts = content?.contextsByOccurrence?.[target?.occurrenceId] ?? array(content?.contexts).filter(row => row?.occurrenceId === target?.occurrenceId);
  return { item, contexts };
}

function normalizedStageTwoMatch(question, plan, item, target) {
  if (plan?.servedStage !== 'match') return question;
  if (text(question?.matchCue) && array(question?.matchOptions).length) return { ...question, responseMode:'matching' };
  if (plan?.pathwayId === 'meaning' && question?.type === 'definition_to_word') {
    const sense = array(item?.senses).find(row => row?.senseId === target?.senseId) ?? array(item?.senses)[0] ?? {};
    const cue = text(sense?.meaning) || text(item?.coreMeaning) || text(array(sense?.acceptedParaphrases)[0]);
    const options = array(question?.options).map(text).filter(Boolean);
    if (!cue || options.length < 2) throw new Error('Definition → Word Match requires a definition and comparable word options.');
    return { ...question, responseMode:'matching', matchCue:cue, matchOptions:options, matchPresentation:'meaning_definition_to_word' };
  }
  if (plan?.pathwayId === 'paraphrasing' && question?.type === 'phrase_match') {
    const cue = text(question?.sourcePhrase) || text(question?.sourceIdea) || text(question?.prompt).match(/[“"]([^”"]+)[”"]/)?.[1] || '';
    const options = array(question?.options).map(text).filter(Boolean);
    if (!cue || options.length < 2) throw new Error('Paraphrasing Match requires a curated source phrase and candidate paraphrases.');
    return { ...question, responseMode:'matching', matchCue:cue, matchOptions:options, matchPresentation:'paraphrase_equivalence' };
  }
  return question;
}

function buildCandidate({ content, target, mastery, item, contexts, plan, usedContentIds, seed }) {
  const built = buildActivity({
    activityType:plan.activityType,
    occurrence:target,
    item,
    contexts,
    unitActivities:array(content?.activities),
    unitItems:array(content?.items),
    unitContexts:array(content?.contexts),
    unitOccurrences:array(content?.occurrences),
    mastery,
    readinessStage:plan.readinessStage,
    usedContentIds:array(usedContentIds),
    seed
  });
  const question = normalizedStageTwoMatch(built,plan,item,target);
  return { ...question, pathwayId:plan.pathwayId, pathwayStage:plan.learnerStage };
}

export function planPathwayQuestion({
  pathwayId,
  stageId,
  content,
  target,
  mastery = {},
  recentActivities = [],
  usedContentIds = [],
  supportState = null,
  seed = ''
} = {}) {
  validatePathwayStage(pathwayId,stageId);
  const learnerStage = stageId;
  const servedStage = (supportState?.struggling === true || supportState?.recycle === true)
    ? (previousStage(stageId) ?? stageId)
    : stageId;
  const supportLevel = servedStage === learnerStage ? 'none' : 'light';
  const readinessStage = readinessForStage(servedStage);
  const { item, contexts } = materialForTarget(content,target);
  const availableForTarget = new Set(availableActivityTypesForTarget({ content, target, item, contexts }));
  let choices = activityTypesForPathwayStage(pathwayId,servedStage).filter(type => targetCanTryActivity(type,availableForTarget));
  const recent = new Set(array(recentActivities));
  const fresh = choices.filter(type => !recent.has(type));
  if (fresh.length) choices = fresh;
  choices = stableOrder(choices,`${seed}:${pathwayId}:${stageId}:${servedStage}`);
  if (!choices.length) throw new Error('No suitable curated activity is available for this pathway stage.');

  let lastError = null;
  for (const activityType of choices) {
    const plan = {
      pathwayId,
      learnerStage,
      servedStage,
      activityType,
      readinessStage,
      supportLevel,
      reason:servedStage === learnerStage ? 'Fixed pathway stage' : 'Temporary one-stage support'
    };
    try {
      const question = buildCandidate({content,target,mastery,item,contexts,plan,usedContentIds,seed});
      return { item, contexts, plan, question };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('No suitable curated activity is available for this pathway stage.');
}

export function rawEligibleTargetsForPathwayStage({
  pathwayId,
  stageId,
  content,
  masteryByVocabularyId = {},
  supportState = null,
  seed = ''
} = {}) {
  validatePathwayStage(pathwayId,stageId);
  const eligible = [];
  for (const target of array(content?.occurrences)) {
    try {
      planPathwayQuestion({
        pathwayId, stageId, content, target,
        mastery:masteryByVocabularyId[target?.vocabularyId] ?? {},
        supportState,
        seed:`${seed}:${target?.occurrenceId ?? ''}`
      });
      eligible.push(target);
    } catch {
      // Fixed pathways fail closed when the requested stage cannot build a valid task.
    }
  }
  return eligible;
}

export function eligibleTargetsForPathwayStage(options = {}) {
  const eligible = rawEligibleTargetsForPathwayStage(options);
  const pathwayId = options?.pathwayId;
  const coverage = registeredPathwayCoverage(unitNumberFor(options?.content, eligible[0] ?? options?.content?.occurrences?.[0]))?.[pathwayId] ?? null;
  if (!coverage) return eligible;
  if (coverage.available === false) return [];
  const allowed = new Set(array(coverage.occurrenceIds).map(String));
  return eligible.filter(target => allowed.has(String(target?.occurrenceId ?? target?.occurrence_id)));
}
