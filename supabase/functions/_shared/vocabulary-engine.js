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
  // Paraphrasing demonstrates meaning transfer, but scaffolded paraphrase work must not
  // manufacture a third independent strand simply through repetition.
  paraphrasing:['paraphrasing','meaning'],
  production:['production','paraphrasing','recognition','meaning']
});
const REVIEW_DAYS = [4, 10, 24, 45, 70, 100];
const EXACT_CONTEXT_TYPES = new Set([
  'replace_phrase','produce_paraphrase','use_target','context_gap_fill',
  'build_paraphrase','complete_paraphrase','rewrite_phrase','build_same_idea','rewrite_idea',
  'improve_vocabulary','explain_another_way','collocation_builder','word_family_switch','word_family_choice',
  'same_idea','spot_meaning_change','find_evidence','which_situation_fits','correct_usage','meaning_in_context',
  'definition_to_word','drag_definition_word','spell_word',
  // Recall the Word tests recall of the target headword; a synonym is not the word.
  'type_word_from_definition',
  'gap_fill_bank','drag_word_sentence','type_missing_word','choose_word_sentence',
  // Stage Contract v2 typed Mastery/Recall tasks: the surface form(s) the sentence needs, never a paraphrase.
  'gloss_in_context_type','type_in_passage','precision_type_cued','upgrade_passage','family_multi_form','word_family_identify','spot_the_error'
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

export function successClearsRecentError(evidence = {}) {
  return evidence.correct === true && evidence.retryUsed !== true && evidence.firstAttempt !== false && evidence.recoveredLater !== true;
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
      else if (successClearsRecentError(evidence)) next.recentErrorCount = Math.max(0, next.recentErrorCount - 1);
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
    // The same character typed differently is not a different answer: every Unicode hyphen/dash (autocorrect, paste, smart punctuation)
    // reads as the plain hyphen and curly apostrophes as the plain apostrophe. A space is NOT a hyphen ("goal oriented" stays wrong).
    .replace(/[\u2010-\u2015\u2212]/gu, '-')
    .replace(/[\u2018\u2019\u02bc]/gu, "'")
    .replace(/[.!?,;:]+$/u, '')
    .replace(/\s+/g, ' ');
}


// ---- multi-slot typed answers (family_multi_form, upgrade_passage, type_in_passage) ----
export function encodeSlotAnswer(values) { return JSON.stringify((Array.isArray(values) ? values : []).map(value => String(value ?? ''))); }
export function decodeSlotAnswer(raw) {
  try {
    const parsed = JSON.parse(String(raw ?? ''));
    return Array.isArray(parsed) && parsed.every(value => typeof value === 'string') ? parsed : null;
  } catch { return null; }
}
// All required slots correct = correct; any wrong or missing = incorrect. No partial visible credit. `slots` keeps the per-slot
// result for hidden diagnostics only.
export function markSlotAnswer(raw, slotAnswers) {
  const expected = (Array.isArray(slotAnswers) ? slotAnswers : []).map(slot => (Array.isArray(slot) ? slot : []).map(normalizeVocabularyAnswer).filter(Boolean));
  const given = decodeSlotAnswer(raw);
  if (!expected.length || !given || given.length !== expected.length) return { correct: false, slots: expected.map(() => false) };
  const slots = expected.map((accepted, index) => accepted.includes(normalizeVocabularyAnswer(given[index])));
  return { correct: slots.every(Boolean), slots };
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
  if (['improve_vocabulary','word_family_switch','word_family_choice','gap_fill_bank','drag_word_sentence','type_missing_word','choose_word_sentence','type_in_passage','precision_type_cued','upgrade_passage','family_multi_form'].includes(questionType)) return ['context','recognition'];
  if (questionType === 'gloss_in_context_type') return ['context','meaning'];
  if (['definition_to_word','word_definition_match','drag_word_definition','drag_definition_word'].includes(questionType)) return ['meaning','recognition'];
  if (questionType === 'spell_word') return ['recognition','meaning'];
  if (['produce_paraphrase','use_target','replace_phrase','rewrite_phrase','rewrite_idea','explain_another_way'].includes(questionType)) return ['production'];
  // Scaffolded paraphrase completion/assembly is paraphrasing evidence, never independent production.
  if (['same_idea','spot_meaning_change','phrase_match','build_paraphrase','complete_paraphrase','build_same_idea'].includes(questionType)) return ['paraphrasing'];
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
  if (Array.isArray(context.slotAnswers)) {
    // Multi-slot item: the visible item is correct only when EVERY slot is correct. No partial visible credit.
    const slotResult = markSlotAnswer(rawAnswer, context.slotAnswers);
    const slotStrands = defaultStrandsForQuestionType(questionType);
    return {
      correct: slotResult.correct, normalizedAnswer: normalizeVocabularyAnswer(rawAnswer), misconceptionCategory: slotResult.correct ? null : 'retrieval_failure',
      slots: slotResult.slots,
      evidence: { strand: slotStrands[0], strands: slotStrands, correct: slotResult.correct, contextId: context.contextId ?? null, activityContentId: context.activityContentId ?? null, questionType: questionType ?? null, activityType: questionType ?? null, misconceptionCategory: slotResult.correct ? null : 'retrieval_failure' }
    };
  }
  const normalizedAnswer = normalizeVocabularyAnswer(rawAnswer);
  const accepted = new Set();
  const exactContextOnly = EXACT_CONTEXT_TYPES.has(questionType);

  if (questionType === 'meaning_in_context') {
    const masteryContext = (Array.isArray(sense.masteryContexts) ? sense.masteryContexts : [])
      .find(record => record?.contextId === context.contextId);
    const designated = normalizeVocabularyAnswer(masteryContext?.meaning);
    if (designated) accepted.add(designated);
  } else {
    for (const answer of Array.isArray(context.acceptedAnswers) ? context.acceptedAnswers : []) {
      accepted.add(normalizeVocabularyAnswer(answer));
    }
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
  // Job 9: the wrong meanings authored for this very Mastery sentence are recognised wrong answers too (misconception classification only;
  // they never change what is marked correct).
  if (questionType === 'meaning_in_context') {
    const own = (Array.isArray(sense.masteryContexts) ? sense.masteryContexts : []).find(record => record?.contextId === context.contextId);
    for (const wrong of Array.isArray(own?.wrongMeanings) ? own.wrongMeanings : []) { const key = normalizeVocabularyAnswer(wrong); if (key) legacyDistractors.add(key); }
  }
  for (const wrong of Array.isArray(sense.wrongParaphrases) ? sense.wrongParaphrases : []) { const key = normalizeVocabularyAnswer(wrong); if (key) legacyDistractors.add(key); }
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