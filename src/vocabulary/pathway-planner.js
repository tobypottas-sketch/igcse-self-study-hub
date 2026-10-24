import { applyStageVariant } from './stage-variants.js';
import { deriveContentSeed } from './mission-seed.js';
import { buildActivity } from './activity-factory.js';
import { PATHWAY_STAGES, activityTypesForPathwayStage, pathwayDefinition } from './pathway-model.js';
import { availableActivityTypesForTarget } from './session-targets.js';
import { PATHWAY_ACTIVITY_TYPES } from './pathway-activity-builder.js';
import { registeredPathwayCoverage } from './pathway-coverage-store.js';
import { UnreviewedContentError } from './reviewed-content.js';
import { assessBuiltQuestion } from './question-quality-gate.js';
import { STRICT_REVIEW_QUESTION_TYPES } from '../../content/vocabulary/pathway-readiness-rules.js';

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

function buildCandidate({ content, target, mastery, item, contexts, plan, usedContentIds, seed, optionNonce, requireReviewed = false, avoidTileOrders = [] }) {
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
    seed,
    optionNonce,
    avoidTileOrders,
    requireReviewed,
    pathwayId:plan.pathwayId,
    pathwayStage:plan.servedStage,
    matchingPresentation:plan.servedStage === 'match'
  });
  const question = applyStageVariant(normalizedStageTwoMatch(built,plan,item,target),{ pathwayId:plan.pathwayId, servedStage:plan.servedStage, item });
  return { ...question, pathwayId:plan.pathwayId, pathwayStage:plan.learnerStage, presentationNonce:optionNonce || undefined };
}

// Quality-preferring build: the first candidate that passes the question-quality gate wins. Attempt 0 is the ordinary seed so a clean
// question is unchanged; later attempts re-roll content and option order deterministically. If none passes, the FIRST built question is
// served (never strand a Set member) and `qualityGate` records the residual violations so readiness reporting can surface the gap.
export const QUALITY_REGENERATIONS = 11;
function buildCandidateGated(args) {
  let first = null;
  let firstViolations = [];
  for (let attempt = 0; attempt <= QUALITY_REGENERATIONS; attempt += 1) {
    let question;
    try {
      question = buildCandidate(attempt === 0 ? args : { ...args, seed:`${args.seed}:q-regen:${attempt}`, optionNonce:`${args.optionNonce ?? ''}:q${attempt}` });
    } catch (error) {
      if (attempt === 0) throw error;
      continue;
    }
    const verdict = assessBuiltQuestion(question);
    if (verdict.ok) return attempt === 0 ? question : { ...question, qualityGate:{ ok:true, attempt } };
    if (!first) { first = question; firstViolations = verdict.violations; }
  }
  return { ...first, qualityGate:{ ok:false, violations:firstViolations } };
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
  seed = '',
  optionNonce = '',
  // Mission-scoped variation: when the server-issued missionSeed is supplied, content choices use H(missionSeed, occurrenceId, slot, activityType)
  // instead of the mission-independent `seed`. It never changes which answer is correct. Presentation order uses optionNonce, kept separate.
  missionSeed = null,
  slot = 0,
  avoidTileOrders = [],
  allowedTypes = null,
  // 'prefer' (the default): questions whose wrong options are teacher-reviewed are served first, and a question built from generated
  // options is used only when no reviewed one exists. 'require': reviewed options only. 'any': no preference.
  reviewPolicy = 'prefer'
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
  // Student-chosen activity family: only those question types, never a substitute. (A temporary one-stage support step keeps its own
  // existing choices, because that is recovery scaffolding rather than the student's chosen activity.)
  if (Array.isArray(allowedTypes) && servedStage === learnerStage) choices = choices.filter(type => allowedTypes.includes(type));
  const recent = new Set(array(recentActivities));
  const fresh = choices.filter(type => !recent.has(type));
  if (fresh.length) choices = fresh;
  const contentSeedFor = activityType => (missionSeed ? deriveContentSeed({ missionSeed, occurrenceId:target?.occurrenceId, slot, activityType }) : seed);
  choices = stableOrder(choices,`${contentSeedFor('_order')}:${pathwayId}:${stageId}:${servedStage}`);
  if (!choices.length) throw new Error('No suitable curated activity is available for this pathway stage.');

  let lastError = null;
  const passes = reviewPolicy === 'any' ? [false] : reviewPolicy === 'require' ? [true] : [true,false];
  const metBefore = new Set(array(usedContentIds).map(String));
  for (const requireReviewed of passes) {
    // In a server-issued mission, a question type whose material this student has already met is passed over when another allowed type
    // can still serve fresh material (the first such type, in the seeded order, wins; if none is fresh the first built one is kept).
    let firstBuilt = null;
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
        const question = buildCandidateGated({content,target,mastery,item,contexts,plan,usedContentIds,seed:contentSeedFor(activityType),optionNonce,requireReviewed,avoidTileOrders});
        const built = { item, contexts, plan, question };
        if (!missionSeed || !question.contentId || !metBefore.has(String(question.contentId))) return built;
        firstBuilt ??= built;
      } catch (error) {
        lastError = error;
      }
    }
    if (firstBuilt) return firstBuilt;
  }
  throw lastError ?? new Error('No suitable curated activity is available for this pathway stage.');
}

// One word, one pathway stage: can the real builder produce a question, and does every question type of the stage that rests on a
// distractor judgement (see STRICT_REVIEW_QUESTION_TYPES) have reviewed, well-formed options? A question that technically builds
// from generated options may still have a second defensible answer, so it does not make the word ready for a strict stage.
export function evaluateTargetForPathwayStage({ pathwayId, stageId, content, target, mastery = {}, seed = '' } = {}) {
  validatePathwayStage(pathwayId,stageId);
  const result = { buildable:false, eligible:false, source:null, strictFailures:[], reason:null };
  try {
    const built = planPathwayQuestion({ pathwayId, stageId, content, target, mastery, seed, reviewPolicy:'prefer' });
    result.buildable = true;
    result.source = built.question?.distractorSource ?? null;
  } catch (error) {
    result.reason = error?.message ?? 'No question could be built.';
    return result;
  }
  const { item, contexts } = materialForTarget(content,target);
  const availableForTarget = new Set(availableActivityTypesForTarget({ content, target, item, contexts }));
  const strictTypes = activityTypesForPathwayStage(pathwayId,stageId)
    .filter(type => STRICT_REVIEW_QUESTION_TYPES.includes(type) && targetCanTryActivity(type,availableForTarget));
  for (const activityType of strictTypes) {
    const plan = { pathwayId, learnerStage:stageId, servedStage:stageId, activityType, readinessStage:readinessForStage(stageId), supportLevel:'none', reason:'Fixed pathway stage' };
    try {
      buildCandidate({ content, target, mastery, item, contexts, plan, usedContentIds:[], seed:`${seed}:strict:${activityType}`, optionNonce:'', requireReviewed:true });
    } catch (error) {
      if (error instanceof UnreviewedContentError) result.strictFailures.push({ type:activityType, kind:error.kind, detail:error.message });
    }
  }
  result.eligible = result.strictFailures.length === 0;
  return result;
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
