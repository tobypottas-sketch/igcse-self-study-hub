export const QUESTION_TYPES = Object.freeze([
  'meaning_match','paraphrase_match','context_inference','question_text_bridge','context_gap_fill',
  'replace_phrase','produce_paraphrase','use_target','identify_inaccurate_paraphrase','mini_mixed_check'
]);

const CHOICE_TYPES = new Set(['meaning_match','paraphrase_match','identify_inaccurate_paraphrase']);
const EASY = ['meaning_match','paraphrase_match','context_inference','identify_inaccurate_paraphrase'];
const CONTEXTUAL = ['context_inference','question_text_bridge','context_gap_fill'];
const PRODUCTIVE = ['replace_phrase','produce_paraphrase','use_target'];
const HARD = ['replace_phrase','produce_paraphrase','use_target','question_text_bridge','mini_mixed_check'];
const INFERRED_BY_CONTEXT = Object.freeze({
  meaning_context:['meaning_match','context_inference','identify_inaccurate_paraphrase'],
  paraphrase_context:['paraphrase_match','question_text_bridge','replace_phrase'],
  production_context:['context_gap_fill','produce_paraphrase','use_target'],
  reading_bridge:['question_text_bridge','context_inference','mini_mixed_check'],
  gap_fill:['context_gap_fill','use_target'],
  mixed_check:['mini_mixed_check','context_inference','produce_paraphrase']
});

function due(mastery, now) {
  if (!mastery?.reviewDueAt) return false;
  return new Date(mastery.reviewDueAt).getTime() <= new Date(now ?? Date.now()).getTime();
}

function evidenceValue(mastery, strand) {
  const value = Number(mastery?.strandEvidence?.[strand] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function candidateTypes(mastery, now) {
  if (mastery?.status === 'secure' || mastery?.status === 'mastered' || due(mastery, now)) return HARD;

  const meaning = evidenceValue(mastery, 'meaning');
  const recognition = evidenceValue(mastery, 'recognition');
  const context = evidenceValue(mastery, 'context');
  const paraphrasing = evidenceValue(mastery, 'paraphrasing');
  const production = evidenceValue(mastery, 'production');

  if ((context > 0 || paraphrasing > 0) && production <= 0) return PRODUCTIVE;
  if ((meaning > 0 || recognition > 0) && context <= 0) return CONTEXTUAL;
  return EASY;
}

function contextSupports(context, type) {
  const activities = Array.isArray(context?.activityTypes) ? context.activityTypes : (INFERRED_BY_CONTEXT[context?.type] ?? QUESTION_TYPES);
  return activities.includes(type);
}

function senseFor(item, occurrence) {
  return Array.isArray(item?.senses) ? item.senses.find(sense => sense?.senseId === occurrence?.senseId) : null;
}

function uniqueText(values) {
  const seen = new Set();
  const output = [];
  for (const value of values) {
    const text = String(value ?? '').trim();
    const key = text.toLocaleLowerCase('en');
    if (!text || seen.has(key)) continue;
    seen.add(key);
    output.push(text);
  }
  return output;
}

function rotate(values, seed) {
  if (values.length < 2) return values;
  let hash = 0;
  for (const char of String(seed ?? '')) hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
  const offset = hash % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}

function choicesFor(item, occurrence, context, type) {
  if (!CHOICE_TYPES.has(type)) return [];
  const sense = senseFor(item, occurrence) ?? {};
  const accepted = [
    ...(Array.isArray(context?.acceptedAnswers) ? context.acceptedAnswers : []),
    ...(Array.isArray(sense.acceptedParaphrases) ? sense.acceptedParaphrases : [])
  ];
  for (const scoped of Array.isArray(sense.contextDependentParaphrases) ? sense.contextDependentParaphrases : []) {
    if (scoped?.contextId === context?.contextId) accepted.push(...(Array.isArray(scoped.answers) ? scoped.answers : []));
  }
  const acceptedUnique = uniqueText(accepted);
  const distractors = uniqueText(Array.isArray(sense.misleadingDistractors) ? sense.misleadingDistractors : []);
  const seed = `${occurrence?.occurrenceId}:${context?.contextId}:${type}`;

  if (type === 'identify_inaccurate_paraphrase') {
    const bad = distractors[0];
    const valid = acceptedUnique.slice(0, 3);
    return rotate(uniqueText([bad, ...valid]).slice(0, 4), seed);
  }

  const correct = acceptedUnique[0];
  return rotate(uniqueText([correct, ...distractors.slice(0, 3)]).slice(0, 4), seed);
}

export function buildQuestion({ occurrence, item, contexts = [], mastery = {}, usedContextIds = [], previousQuestionType = null, recycle = false, forceQuestionType = null, now = new Date() } = {}) {
  if (!occurrence || !item) throw new Error('Vocabulary occurrence and item are required.');
  const allowed = forceQuestionType ? [forceQuestionType] : candidateTypes(mastery, now);
  if (forceQuestionType && !QUESTION_TYPES.includes(forceQuestionType)) throw new Error('Invalid vocabulary question type.');

  const used = new Set(usedContextIds);
  let pairs = [];
  for (const type of allowed) for (const context of contexts) if (contextSupports(context, type)) pairs.push({ type, context });
  if (!pairs.length) for (const type of QUESTION_TYPES) for (const context of contexts) if (contextSupports(context, type)) pairs.push({ type, context });
  if (!pairs.length) throw new Error('No curated context can support this question.');

  const unused = pairs.filter(pair => !used.has(pair.context.contextId));
  if (unused.length) pairs = unused;
  if (recycle || previousQuestionType) {
    const differentType = pairs.filter(pair => pair.type !== previousQuestionType);
    if (differentType.length) pairs = differentType;
  }

  const chosen = pairs[0];
  const responseMode = CHOICE_TYPES.has(chosen.type) ? 'choice' : 'text';
  return {
    questionId:`${occurrence.occurrenceId}:${chosen.context.contextId}:${chosen.type}`,
    type:chosen.type,
    strand:['produce_paraphrase','use_target','replace_phrase'].includes(chosen.type) ? 'production' : (['context_inference','question_text_bridge','context_gap_fill','mini_mixed_check'].includes(chosen.type) ? 'context' : (chosen.type === 'paraphrase_match' ? 'paraphrasing' : chosen.type === 'meaning_match' ? 'meaning' : 'recognition')),
    responseMode,
    options:responseMode === 'choice' ? choicesFor(item, occurrence, chosen.context, chosen.type) : [],
    vocabularyId:item.vocabularyId,
    occurrenceId:occurrence.occurrenceId,
    contextId:chosen.context.contextId,
    prompt:chosen.context.text
  };
}
