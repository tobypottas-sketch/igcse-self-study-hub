import { planNextActivity } from './adaptive-planner.js';
import { buildActivity } from './activity-factory.js';
import { hasApplicationSituation } from './apply-situation.js';
import { activitiesForStage } from './activity-catalogue.js';
import { selectPriorityTargets } from './selector.js';
import { isSpotMeaningChangeReady } from '../../supabase/functions/_shared/vocabulary-engine.js';

function array(value) { return Array.isArray(value) ? value : []; }
function text(value) { return String(value ?? '').trim(); }
function hashSeed(seed) {
  let hash = 2166136261;
  for (const char of String(seed ?? '')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619) >>> 0; }
  return hash >>> 0;
}
function stableOrder(values, seed) {
  const choices = [...array(values)];
  if (choices.length < 2) return choices;
  const offset = hashSeed(seed) % choices.length;
  return [...choices.slice(offset), ...choices.slice(0, offset)];
}

function reviewIsDue(mastery, now = new Date()) {
  if (!mastery?.reviewDueAt) return false;
  const due = new Date(mastery.reviewDueAt);
  const reference = now instanceof Date ? now : new Date(now);
  return !Number.isNaN(due.getTime()) && !Number.isNaN(reference.getTime()) && due.getTime() <= reference.getTime();
}

function targetMaterial(content, target) {
  const item = content?.itemsById?.[target?.vocabularyId] ?? array(content?.items).find(row => row?.vocabularyId === target?.vocabularyId);
  if (!item) throw new Error('Vocabulary item is missing.');
  const contexts = content?.contextsByOccurrence?.[target?.occurrenceId] ?? array(content?.contexts).filter(row => row?.occurrenceId === target?.occurrenceId);
  const availableContent = availableActivityTypesForTarget({ content, target, item, contexts });
  return { item, contexts, availableContent };
}

function buildPlannedQuestion({ content, target, mastery, item, contexts, availableContent, plan, usedContentIds = [], seed = '', optionNonce = '' }) {
  const avoidContentIds = [...new Set([...array(plan.avoidContentIds), ...array(usedContentIds)])];
  const question = buildActivity({
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
    usedContentIds:avoidContentIds,
    seed,
    optionNonce
  });
  return { item, contexts, availableContent, plan, question };
}

export function linkedActivitiesForTarget(content, target) {
  return array(content?.activities).filter(activity => {
    const linked = array(activity?.activityData?.linkedVocabularyIds);
    return linked.includes(target?.vocabularyId);
  });
}

function hasDefinition(item, target) {
  const sense = array(item?.senses).find(row => row?.senseId === target?.senseId) ?? array(item?.senses)[0];
  return Boolean(text(sense?.meaning) || text(item?.coreMeaning) || text(array(sense?.acceptedParaphrases)[0]));
}
function samePosAlternatives(content, item) {
  const pos = text(item?.partOfSpeech).toLocaleLowerCase('en');
  return array(content?.items).filter(candidate =>
    candidate?.vocabularyId !== item?.vocabularyId &&
    text(candidate?.partOfSpeech).toLocaleLowerCase('en') === pos &&
    text(candidate?.term) && hasDefinition(candidate,{})
  );
}
function hasBlankableContext(contexts, item) {
  const term = text(item?.term).toLocaleLowerCase('en');
  return array(contexts).some(context => {
    const rewrite = text(context?.targetRewrite);
    const source = text(context?.text);
    const accepted = array(context?.acceptedAnswers).map(value => text(value).toLocaleLowerCase('en'));
    return ['paraphrase_context','production_context'].includes(context?.type) && rewrite && source.toLocaleLowerCase('en').includes(rewrite.toLocaleLowerCase('en')) && accepted.includes(term);
  });
}
function hasWordFamilyChoice(content, item, linked) {
  const writing = linked.find(row => row.contentType === 'writing_set' && row.activityData?.taskType === 'word_family' && array(row.activityData?.acceptedAnswers).some(text));
  if (!writing) return false;
  const accepted = new Set(array(writing.activityData.acceptedAnswers).map(value => text(value).toLocaleLowerCase('en')).filter(Boolean));
  const alternatives = new Set([
    ...array(item?.wordFamily),
    ...array(content?.items).flatMap(candidate => array(candidate?.wordFamily))
  ].map(value => text(value).toLocaleLowerCase('en')).filter(value => value && !accepted.has(value)));
  return alternatives.size >= 2;
}

// While a unit's readiness is being evaluated, the same target is asked "which activity types can you serve?" once per pathway and stage
// (and again inside each question plan) although the answer only depends on the unit's immutable content. withContentMemo() keeps the
// answers for the duration of ONE evaluation of ONE content object, so nothing is cached across content changes.
let memo = null;
export function withContentMemo(content, run) {
  const previous = memo; memo = { content, answers:new Map() };
  try { return run(); } finally { memo = previous; }
}
export function availableActivityTypesForTarget(args = {}) {
  const { content, target, item, contexts = [] } = args;
  if (!memo || memo.content !== content) return computeAvailableActivityTypes(args);
  const key = `${target?.occurrenceId ?? ''}|${target?.senseId ?? ''}|${item?.vocabularyId ?? ''}|${array(contexts).map(row => row?.contextId ?? '').join(',')}`;
  let answer = memo.answers.get(key);
  if (!answer) { answer = computeAvailableActivityTypes(args); memo.answers.set(key, answer); }
  return [...answer];
}
function computeAvailableActivityTypes({ content, target, item, contexts = [] } = {}) {
  const available = new Set();
  const targetContexts = array(contexts);
  if (targetContexts.length) ['meaning_match','which_situation_fits','meaning_in_context'].forEach(type => available.add(type));

  const samePos = samePosAlternatives(content,item);
  if (text(item?.term) && hasDefinition(item,target)) {
    available.add('spell_word');
    if (samePos.length >= 3) ['definition_to_word','word_definition_match'].forEach(type => available.add(type));
    // Meaning → Apply needs a curated situation that does not show the word.
    if (samePos.length >= 3 && hasApplicationSituation(targetContexts,item,target)) ['drag_word_definition','drag_definition_word'].forEach(type => available.add(type));
  }
  if (samePos.length >= 3 && hasBlankableContext(targetContexts,item)) {
    ['gap_fill_bank','drag_word_sentence','type_missing_word','choose_word_sentence'].forEach(type => available.add(type));
  }

  const linked = linkedActivitiesForTarget(content, target);
  if (linked.some(row => row.contentType === 'writing_set' && row.activityData?.taskType === 'word_family')) available.add('word_family_switch');
  if (hasWordFamilyChoice(content,item,linked)) available.add('word_family_choice');
  if (linked.some(row => row.contentType === 'phrase_set')) ['phrase_match','build_paraphrase','complete_paraphrase','rewrite_phrase','explain_another_way'].forEach(type => available.add(type));
  if (linked.some(row => row.contentType === 'idea_set')) ['same_idea','build_same_idea','rewrite_idea','explain_another_way'].forEach(type => available.add(type));
  if (linked.some(row => row.contentType === 'idea_set' && isSpotMeaningChangeReady(row.activityData))) available.add('spot_meaning_change');
  if (linked.some(row => row.contentType === 'question_text')) { available.add('question_text_bridge'); available.add('find_evidence'); }
  if (linked.some(row => row.contentType === 'writing_set' && row.activityData?.taskType === 'improve_vocabulary')) available.add('improve_vocabulary');
  return [...available];
}

export function buildTargetPracticeQuestion({
  content,
  target,
  mastery = {},
  practiceMode = 'adaptive',
  recentActivities = [],
  supportState = null,
  reviewDue = null,
  usedContentIds = [],
  seed = '',
  optionNonce = ''
} = {}) {
  const { item, contexts, availableContent } = targetMaterial(content, target);
  const due = reviewDue == null ? reviewIsDue(mastery) : Boolean(reviewDue);
  const plan = planNextActivity({ practiceMode, target, mastery, recentActivities, supportState, reviewDue:due, availableContent });
  return buildPlannedQuestion({ content, target, mastery, item, contexts, availableContent, plan, usedContentIds, seed, optionNonce });
}

export function buildTimedMixedQuestion({
  content,
  target,
  mastery = {},
  recentActivities = [],
  supportState = null,
  reviewDue = null,
  usedContentIds = [],
  previousActivityType = null,
  seed = '',
  optionNonce = ''
} = {}) {
  if (supportState?.recycle || supportState?.struggling) {
    return buildTargetPracticeQuestion({
      content, target, mastery, practiceMode:'adaptive', recentActivities, supportState,
      reviewDue, usedContentIds, seed, optionNonce
    });
  }

  const { item, contexts, availableContent } = targetMaterial(content, target);
  const stage = ['new','building','secure','mastered'].includes(mastery?.status) ? mastery.status : 'new';
  const stageEligible = new Set(activitiesForStage(stage).map(activity => activity.id));
  let choices = availableContent.filter(type => stageEligible.has(type));
  if (!choices.length) throw new Error('No suitable curated activity is available for this timed target.');
  if (previousActivityType && choices.length > 1) choices = choices.filter(type => type !== previousActivityType);

  const ordered = stableOrder(choices, `${seed}:${target?.occurrenceId ?? ''}:${stage}`);
  let lastError = null;
  for (const activityType of ordered) {
    const plan = { activityType, readinessStage:stage, supportLevel:'none', reason:'Timed mixed activity' };
    try {
      return buildPlannedQuestion({ content, target, mastery, item, contexts, availableContent, plan, usedContentIds, seed, optionNonce });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('No suitable curated activity is available for this timed target.');
}

export function selectEligiblePriorityTargets({
  content,
  masteryByVocabularyId = {},
  unitMastery = {},
  practiceMode = 'adaptive',
  now = new Date(),
  limit = 10
} = {}) {
  const eligible = [];
  for (const target of array(content?.occurrences)) {
    const mastery = masteryByVocabularyId[target.vocabularyId] ?? { status:'new', strandEvidence:{} };
    try {
      const built = buildTargetPracticeQuestion({
        content,
        target,
        mastery,
        practiceMode,
        recentActivities:[],
        supportState:null,
        reviewDue:reviewIsDue(mastery, now),
        usedContentIds:[],
        seed:`eligibility:${practiceMode}:${target.occurrenceId}`
      });
      eligible.push({
        ...target,
        eligibility:{ practiceMode, availableActivityTypes:built.availableContent, activityType:built.plan.activityType }
      });
    } catch {
      // Eligibility is deliberately fail-closed: a target that cannot build a valid
      // question for this mode must never consume a session slot.
    }
  }

  return selectPriorityTargets({
    occurrences:eligible,
    masteryByVocabularyId,
    unitMastery,
    now,
    limit,
    practiceMode
  });
}
