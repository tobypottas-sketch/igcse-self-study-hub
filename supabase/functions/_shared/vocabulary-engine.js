export const MASTERY_THRESHOLDS = Object.freeze({
  building: 1,
  secure: 3,
  masteredProductions: 2,
  reviewFailuresForDemotion: 2
});

const STRANDS = ['meaning','recognition','context','paraphrasing','production'];
const PROPAGATION = Object.freeze({
  meaning:['meaning'],
  recognition:['recognition','meaning'],
  context:['context','meaning'],
  paraphrasing:['paraphrasing','recognition','meaning'],
  production:['production','paraphrasing','recognition','meaning']
});
const REVIEW_DAYS = [4, 10, 24, 45, 70, 100];
const EXACT_CONTEXT_TYPES = new Set([
  'replace_phrase','produce_paraphrase','use_target','context_gap_fill',
  'build_paraphrase','complete_paraphrase','rewrite_phrase','build_same_idea','rewrite_idea',
  'improve_vocabulary','explain_another_way','collocation_builder','word_family_switch',
  'same_idea','spot_meaning_change','find_evidence','which_situation_fits','correct_usage'
]);
const INACCURATE_SELECTION_TYPES = new Set(['identify_inaccurate_paraphrase','spot_meaning_change']);
const EVIDENCE_STRENGTH = Object.freeze({ light:1, medium:2, strong:3, very_strong:4 });
const SUPPORT_MULTIPLIER = Object.freeze({ none:1, light:0.5, major:0.25 });

function asDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date.');
  return date;
}

function normalizedMastery(input = {}) {
  const strandEvidence = {};
  for (const strand of STRANDS) strandEvidence[strand] = Math.max(0, Number(input.strandEvidence?.[strand] ?? 0));
  return {
    ...input,
    status: input.status ?? 'new',
    strandEvidence,
    successfulProductions: Math.max(0, Number(input.successfulProductions ?? 0)),
    productionContextIds: [...new Set(Array.isArray(input.productionContextIds) ? input.productionContextIds.filter(Boolean) : [])],
    productionActivityTypes: [...new Set(Array.isArray(input.productionActivityTypes) ? input.productionActivityTypes.filter(Boolean) : [])],
    unscaffoldedProductions: Math.max(0, Number(input.unscaffoldedProductions ?? 0)),
    recentErrorCount: Math.max(0, Number(input.recentErrorCount ?? 0)),
    recoveryCount: Math.max(0, Number(input.recoveryCount ?? 0)),
    reviewStage: Math.max(0, Number(input.reviewStage ?? 0)),
    reviewFailureCount: Math.max(0, Number(input.reviewFailureCount ?? 0)),
    reviewDueAt: input.reviewDueAt ?? null
  };
}

function evidenceStrands(evidence = {}) {
  const candidates = Array.isArray(evidence.strands) && evidence.strands.length ? evidence.strands : [evidence.strand];
  const strands = [...new Set(candidates.filter(Boolean))];
  if (!strands.length || strands.some(strand => !STRANDS.includes(strand))) throw new Error('Invalid vocabulary evidence strand.');
  return strands;
}

function successWeight(evidence) {
  if (evidence.repeatedGuess === true) return 0;
  if (evidence.evidenceStrength != null) {
    const base = EVIDENCE_STRENGTH[evidence.evidenceStrength];
    if (!base) throw new Error('Invalid vocabulary evidence strength.');
    const inferredSupport = evidence.supportLevel ?? ((evidence.retryUsed || evidence.firstAttempt === false) ? 'light' : 'none');
    const multiplier = SUPPORT_MULTIPLIER[inferredSupport];
    if (multiplier == null) throw new Error('Invalid vocabulary support level.');
    return base * multiplier;
  }
  if (evidence.retryUsed || evidence.firstAttempt === false) return 1;
  if (evidence.recoveredLater) return 2;
  return 3;
}

export function deriveStatus(input = {}) {
  const mastery = normalizedMastery(input);
  const evidence = mastery.strandEvidence;
  const secureStrands = STRANDS.filter(strand => evidence[strand] >= MASTERY_THRESHOLDS.secure);
  const hasHigherEvidence = evidence.context >= MASTERY_THRESHOLDS.secure || evidence.paraphrasing >= MASTERY_THRESHOLDS.secure;
  const isSecure = secureStrands.length >= 3 && hasHigherEvidence;

  if (!isSecure) {
    return STRANDS.some(strand => evidence[strand] >= MASTERY_THRESHOLDS.building) ? 'building' : 'new';
  }

  const hasContext = evidence.context >= MASTERY_THRESHOLDS.secure;
  const hasParaphrasing = evidence.paraphrasing >= MASTERY_THRESHOLDS.secure;
  const contextDiversity = new Set(mastery.productionContextIds).size >= MASTERY_THRESHOLDS.masteredProductions;
  const activityDiversity = new Set(mastery.productionActivityTypes).size >= MASTERY_THRESHOLDS.masteredProductions;
  const hasIndependentProduction = mastery.unscaffoldedProductions >= 1;
  const canRemainMasteredAfterOneReviewMiss = mastery.status === 'mastered' && mastery.reviewFailureCount > 0 && mastery.reviewFailureCount < MASTERY_THRESHOLDS.reviewFailuresForDemotion;
  const noContradictoryError = mastery.recentErrorCount === 0 || canRemainMasteredAfterOneReviewMiss;
  const canRemainMastered = mastery.reviewFailureCount < MASTERY_THRESHOLDS.reviewFailuresForDemotion;

  if (
    canRemainMastered &&
    noContradictoryError &&
    hasContext &&
    hasParaphrasing &&
    mastery.successfulProductions >= MASTERY_THRESHOLDS.masteredProductions &&
    (contextDiversity || activityDiversity) &&
    hasIndependentProduction
  ) return 'mastered';

  return 'secure';
}

export function nextReviewAt(input = {}, now = new Date()) {
  const mastery = normalizedMastery(input);
  const base = asDate(now);
  const days = mastery.reviewFailureCount > 0 ? 4 : REVIEW_DAYS[Math.min(mastery.reviewStage, REVIEW_DAYS.length - 1)];
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function isReviewDue(input = {}, now = new Date()) {
  const due = input?.reviewDueAt;
  if (!due) return false;
  const dueDate = new Date(due);
  if (Number.isNaN(dueDate.getTime())) return false;
  return dueDate.getTime() <= asDate(now).getTime();
}

export function applyEvidence(input = {}, evidence = {}, now = new Date()) {
  const mastery = normalizedMastery(input);
  const sourceStrands = evidenceStrands(evidence);
  const occurredAt = asDate(now).toISOString();
  const next = {
    ...mastery,
    strandEvidence:{ ...mastery.strandEvidence },
    productionContextIds:[...mastery.productionContextIds],
    productionActivityTypes:[...mastery.productionActivityTypes],
    lastSeenAt:occurredAt
  };

  if (evidence.correct) {
    const weight = successWeight(evidence);
    if (weight > 0) {
      const strengthened = new Set();
      for (const sourceStrand of sourceStrands) {
        for (const strand of PROPAGATION[sourceStrand]) strengthened.add(strand);
      }
      for (const strand of strengthened) next.strandEvidence[strand] += weight;

      const productive = evidence.productive === true || sourceStrands.includes('production');
      const supportLevel = evidence.supportLevel ?? ((evidence.retryUsed || evidence.firstAttempt === false) ? 'light' : 'none');
      const independentEnough = supportLevel !== 'major' && evidence.repeatedGuess !== true;
      if (productive && independentEnough) {
        next.successfulProductions += 1;
        const productionId = evidence.contextId ?? evidence.activityContentId ?? null;
        if (productionId && !next.productionContextIds.includes(productionId)) next.productionContextIds.push(productionId);
        const activityType = evidence.activityType ?? evidence.questionType ?? null;
        if (activityType && !next.productionActivityTypes.includes(activityType)) next.productionActivityTypes.push(activityType);
        if (supportLevel === 'none') next.unscaffoldedProductions += 1;
      }

      if (evidence.recoveredLater) next.recoveryCount += 1;
      else next.recentErrorCount = Math.max(0, next.recentErrorCount - 1);
      if (evidence.review) {
        next.reviewFailureCount = 0;
        next.reviewStage += 1;
      }
    }
  } else {
    next.recentErrorCount += 1;
    if (evidence.review) next.reviewFailureCount += 1;
  }

  next.status = deriveStatus(next);
  if (next.status === 'mastered' || evidence.review) next.reviewDueAt = nextReviewAt(next, now);
  return next;
}

export function normalizeVocabularyAnswer(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('en')
    .replace(/[.!?,;:]+$/u, '')
    .replace(/\s+/g, ' ');
}

function semanticDistractorMap(context = {}) {
  const map = new Map();
  for (const distractor of Array.isArray(context.distractors) ? context.distractors : []) {
    const normalized = normalizeVocabularyAnswer(distractor?.text);
    if (normalized) map.set(normalized, distractor?.misconceptionCategory ?? 'meaning_confusion');
  }
  return map;
}

function defaultStrandsForQuestionType(questionType) {
  if (['produce_paraphrase','use_target','replace_phrase','rewrite_phrase','rewrite_idea','improve_vocabulary','explain_another_way','word_family_switch'].includes(questionType)) return ['production'];
  if (questionType === 'complete_paraphrase') return ['paraphrasing','production'];
  // Tile assembly (build_*) is scaffolded paraphrasing evidence, never production.
  if (['same_idea','spot_meaning_change','phrase_match','build_paraphrase','build_same_idea'].includes(questionType)) return ['paraphrasing'];
  if (['context_inference','question_text_bridge','context_gap_fill','mini_mixed_check','find_evidence','meaning_in_context','correct_usage','which_situation_fits'].includes(questionType)) return ['context'];
  if (questionType === 'meaning_match') return ['meaning'];
  return ['recognition'];
}

const SPOT_MEANING_CHANGE_SAME_MEANING_OPTIONS = 3;
const SPOT_VARIANT_PATTERN = /^q(\d{1,3})$/;

function spotSameMeaningRewrites(data = {}) {
  const seen = new Set();
  const output = [];
  for (const value of Array.isArray(data?.accurateParaphrases) ? data.accurateParaphrases : []) {
    const textValue = String(value ?? '').trim();
    const key = normalizeVocabularyAnswer(textValue);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(textValue);
  }
  return output;
}

function spotUsableDistractorIndexes(data = {}) {
  const sameMeaning = new Set(spotSameMeaningRewrites(data).map(normalizeVocabularyAnswer));
  const rows = Array.isArray(data?.distractors) ? data.distractors : [];
  const indexes = [];
  rows.forEach((row, index) => {
    const key = normalizeVocabularyAnswer(row?.text);
    if (key && !sameMeaning.has(key)) indexes.push(index);
  });
  return indexes;
}

export function isSpotMeaningChangeReady(data = {}) {
  return spotSameMeaningRewrites(data).length >= SPOT_MEANING_CHANGE_SAME_MEANING_OPTIONS && spotUsableDistractorIndexes(data).length > 0;
}

export function spotMeaningChangeSameMeaningRewrites(data = {}) { return spotSameMeaningRewrites(data); }
export function spotMeaningChangeDistractorIndexes(data = {}) { return spotUsableDistractorIndexes(data); }

export function spotMeaningChangeMarking(data = {}, activityVariantId = null) {
  if (!isSpotMeaningChangeReady(data)) throw new Error('Spot the Meaning Change content is not ready.');
  const match = SPOT_VARIANT_PATTERN.exec(String(activityVariantId ?? ''));
  if (!match) throw new Error('Spot the Meaning Change activity variant is required.');
  const index = Number(match[1]);
  if (!spotUsableDistractorIndexes(data).includes(index)) throw new Error('Spot the Meaning Change activity variant is invalid.');
  const row = data.distractors[index];
  const answer = String(row.text).trim();
  return { acceptedAnswers:[answer], distractors:[{ text:answer, misconceptionCategory:row?.misconceptionCategory ?? 'meaning_confusion' }] };
}

export function markCuratedAnswer({ item = {}, sense = {}, context = {}, questionType, rawAnswer }) {
  const normalizedAnswer = normalizeVocabularyAnswer(rawAnswer);
  const accepted = new Set();
  const exactContextOnly = EXACT_CONTEXT_TYPES.has(questionType);

  for (const answer of Array.isArray(context.acceptedAnswers) ? context.acceptedAnswers : []) {
    accepted.add(normalizeVocabularyAnswer(answer));
  }

  if (!exactContextOnly) {
    for (const answer of Array.isArray(sense.acceptedParaphrases) ? sense.acceptedParaphrases : []) {
      accepted.add(normalizeVocabularyAnswer(answer));
    }
    for (const scoped of Array.isArray(sense.contextDependentParaphrases) ? sense.contextDependentParaphrases : []) {
      if (scoped?.contextId !== context.contextId) continue;
      for (const answer of Array.isArray(scoped.answers) ? scoped.answers : []) accepted.add(normalizeVocabularyAnswer(answer));
    }
  }
  accepted.delete('');

  const legacyDistractors = new Set((Array.isArray(sense.misleadingDistractors) ? sense.misleadingDistractors : []).map(normalizeVocabularyAnswer).filter(Boolean));
  const semanticDistractors = semanticDistractorMap(context);
  const identifyingInaccurate = INACCURATE_SELECTION_TYPES.has(questionType);
  const semanticCategory = semanticDistractors.get(normalizedAnswer) ?? null;
  const isDistractor = semanticCategory != null || (questionType !== 'spot_meaning_change' && legacyDistractors.has(normalizedAnswer));
  const correct = identifyingInaccurate ? isDistractor : accepted.has(normalizedAnswer);

  let misconceptionCategory = null;
  if (semanticCategory) misconceptionCategory = semanticCategory;
  else if (!correct) {
    if (identifyingInaccurate && accepted.has(normalizedAnswer)) misconceptionCategory = 'meaning_confusion';
    else if (!identifyingInaccurate && legacyDistractors.has(normalizedAnswer)) misconceptionCategory = 'related_but_inaccurate';
  }

  const strands = defaultStrandsForQuestionType(questionType);
  return {
    correct,
    normalizedAnswer,
    misconceptionCategory,
    evidence:{
      strand:strands[0],
      strands,
      correct,
      contextId:context.contextId ?? null,
      activityContentId:context.activityContentId ?? null,
      questionType:questionType ?? null,
      activityType:questionType ?? null,
      misconceptionCategory
    }
  };
}
