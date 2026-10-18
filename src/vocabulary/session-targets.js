import { planNextActivity } from './adaptive-planner.js';
import { buildActivity } from './activity-builder.js';
import { activitiesForStage } from './activity-catalogue.js';
import { selectPriorityTargets } from './selector.js';
import { isSpotMeaningChangeReady } from '../../supabase/functions/_shared/vocabulary-engine.js';

function array(value) { return Array.isArray(value) ? value : []; }
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

function buildPlannedQuestion({ content, target, mastery, item, contexts, availableContent, plan, usedContentIds = [], seed = '' }) {
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
    seed
  });
  return { item, contexts, availableContent, plan, question };
}

export function linkedActivitiesForTarget(content, target) {
  return array(content?.activities).filter(activity => {
    const linked = array(activity?.activityData?.linkedVocabularyIds);
    return linked.includes(target?.vocabularyId);
  });
}

export function availableActivityTypesForTarget({ content, target, item, contexts = [] } = {}) {
  const available = new Set();
  const targetContexts = array(contexts);
  if (targetContexts.length) ['meaning_match','which_situation_fits','meaning_in_context'].forEach(type => available.add(type));

  const linked = linkedActivitiesForTarget(content, target);
  if (linked.some(row => row.contentType === 'writing_set' && row.activityData?.taskType === 'word_family')) available.add('word_family_switch');
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
  seed = ''
} = {}) {
  const { item, contexts, availableContent } = targetMaterial(content, target);
  const due = reviewDue == null ? reviewIsDue(mastery) : Boolean(reviewDue);
  const plan = planNextActivity({ practiceMode, target, mastery, recentActivities, supportState, reviewDue:due, availableContent });
  return buildPlannedQuestion({ content, target, mastery, item, contexts, availableContent, plan, usedContentIds, seed });
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
  seed = ''
} = {}) {
  if (supportState?.recycle || supportState?.struggling) {
    return buildTargetPracticeQuestion({
      content, target, mastery, practiceMode:'adaptive', recentActivities, supportState,
      reviewDue, usedContentIds, seed
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
      return buildPlannedQuestion({ content, target, mastery, item, contexts, availableContent, plan, usedContentIds, seed });
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
