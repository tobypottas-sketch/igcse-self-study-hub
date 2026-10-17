export const QUESTION_TYPES = Object.freeze([
  'meaning_match','paraphrase_match','context_inference','question_text_bridge','context_gap_fill',
  'replace_phrase','produce_paraphrase','use_target','identify_inaccurate_paraphrase','mini_mixed_check'
]);

const EASY = ['meaning_match','paraphrase_match','context_inference','identify_inaccurate_paraphrase'];
const HARD = ['replace_phrase','produce_paraphrase','use_target','question_text_bridge','mini_mixed_check'];

function due(mastery, now) {
  if (!mastery?.reviewDueAt) return false;
  return new Date(mastery.reviewDueAt).getTime() <= new Date(now ?? Date.now()).getTime();
}

function candidateTypes(mastery, now) {
  if (mastery?.status === 'secure' || mastery?.status === 'mastered' || due(mastery, now)) return HARD;
  return EASY;
}

function contextSupports(context, type) {
  const activities = Array.isArray(context?.activityTypes) ? context.activityTypes : QUESTION_TYPES;
  return activities.includes(type);
}

export function buildQuestion({ occurrence, item, contexts = [], mastery = {}, usedContextIds = [], previousQuestionType = null, recycle = false, forceQuestionType = null, now = new Date() } = {}) {
  if (!occurrence || !item) throw new Error('Vocabulary occurrence and item are required.');
  const allowed = forceQuestionType ? [forceQuestionType] : candidateTypes(mastery, now);
  if (forceQuestionType && !QUESTION_TYPES.includes(forceQuestionType)) throw new Error('Invalid vocabulary question type.');

  const used = new Set(usedContextIds);
  let pairs = [];
  for (const type of allowed) {
    for (const context of contexts) {
      if (contextSupports(context, type)) pairs.push({ type, context });
    }
  }
  if (!pairs.length) {
    for (const type of QUESTION_TYPES) for (const context of contexts) if (contextSupports(context, type)) pairs.push({ type, context });
  }
  if (!pairs.length) throw new Error('No curated context can support this question.');

  const unused = pairs.filter(pair => !used.has(pair.context.contextId));
  if (unused.length) pairs = unused;
  if (recycle || previousQuestionType) {
    const differentType = pairs.filter(pair => pair.type !== previousQuestionType);
    if (differentType.length) pairs = differentType;
  }

  const chosen = pairs[0];
  return {
    questionId:`${occurrence.occurrenceId}:${chosen.context.contextId}:${chosen.type}`,
    type:chosen.type,
    strand:['produce_paraphrase','use_target','replace_phrase'].includes(chosen.type) ? 'production' : (chosen.type === 'context_inference' || chosen.type === 'question_text_bridge' ? 'context' : 'recognition'),
    vocabularyId:item.vocabularyId,
    occurrenceId:occurrence.occurrenceId,
    contextId:chosen.context.contextId,
    prompt:chosen.context.text
  };
}
