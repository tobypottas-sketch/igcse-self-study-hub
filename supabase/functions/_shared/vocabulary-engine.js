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
    recentErrorCount: Math.max(0, Number(input.recentErrorCount ?? 0)),
    recoveryCount: Math.max(0, Number(input.recoveryCount ?? 0)),
    reviewStage: Math.max(0, Number(input.reviewStage ?? 0)),
    reviewFailureCount: Math.max(0, Number(input.reviewFailureCount ?? 0)),
    reviewDueAt: input.reviewDueAt ?? null
  };
}

function successWeight(evidence) {
  if (evidence.retryUsed || evidence.firstAttempt === false) return 1;
  if (evidence.recoveredLater) return 2;
  return 3;
}

export function deriveStatus(input = {}) {
  const mastery = normalizedMastery(input);
  const evidence = mastery.strandEvidence;
  const secureStrands = STRANDS.filter(strand => evidence[strand] >= MASTERY_THRESHOLDS.secure);
  const hasHigherEvidence = evidence.context >= MASTERY_THRESHOLDS.secure || evidence.paraphrasing >= MASTERY_THRESHOLDS.secure;
  const isSecure = secureStrands.length >= 2 && hasHigherEvidence;

  if (!isSecure) {
    return STRANDS.some(strand => evidence[strand] >= MASTERY_THRESHOLDS.building) ? 'building' : 'new';
  }

  const distinctProductionContexts = new Set(mastery.productionContextIds).size;
  const canRemainMastered = mastery.reviewFailureCount < MASTERY_THRESHOLDS.reviewFailuresForDemotion;
  if (
    canRemainMastered &&
    mastery.successfulProductions >= MASTERY_THRESHOLDS.masteredProductions &&
    distinctProductionContexts >= MASTERY_THRESHOLDS.masteredProductions
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
  if (!STRANDS.includes(evidence.strand)) throw new Error('Invalid vocabulary evidence strand.');
  const occurredAt = asDate(now).toISOString();
  const next = {
    ...mastery,
    strandEvidence:{ ...mastery.strandEvidence },
    productionContextIds:[...mastery.productionContextIds],
    lastSeenAt:occurredAt
  };

  if (evidence.correct) {
    const weight = successWeight(evidence);
    for (const strand of PROPAGATION[evidence.strand]) next.strandEvidence[strand] += weight;
    if (evidence.strand === 'production') {
      next.successfulProductions += 1;
      if (evidence.contextId && !next.productionContextIds.includes(evidence.contextId)) next.productionContextIds.push(evidence.contextId);
    }
    if (evidence.recoveredLater) next.recoveryCount += 1;
    else next.recentErrorCount = Math.max(0, next.recentErrorCount - 1);
    if (evidence.review) {
      next.reviewFailureCount = 0;
      next.reviewStage += 1;
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

export function markCuratedAnswer({ item = {}, sense = {}, context = {}, questionType, rawAnswer }) {
  const normalizedAnswer = normalizeVocabularyAnswer(rawAnswer);
  const accepted = new Set();
  for (const answer of Array.isArray(context.acceptedAnswers) ? context.acceptedAnswers : []) accepted.add(normalizeVocabularyAnswer(answer));
  for (const answer of Array.isArray(sense.acceptedParaphrases) ? sense.acceptedParaphrases : []) accepted.add(normalizeVocabularyAnswer(answer));
  for (const scoped of Array.isArray(sense.contextDependentParaphrases) ? sense.contextDependentParaphrases : []) {
    if (scoped?.contextId !== context.contextId) continue;
    for (const answer of Array.isArray(scoped.answers) ? scoped.answers : []) accepted.add(normalizeVocabularyAnswer(answer));
  }
  accepted.delete('');

  const distractors = new Set((Array.isArray(sense.misleadingDistractors) ? sense.misleadingDistractors : []).map(normalizeVocabularyAnswer).filter(Boolean));
  const identifyingInaccurate = questionType === 'identify_inaccurate_paraphrase';
  const correct = identifyingInaccurate ? distractors.has(normalizedAnswer) : accepted.has(normalizedAnswer);
  let misconceptionCategory = null;
  if (!correct) {
    if (identifyingInaccurate && accepted.has(normalizedAnswer)) misconceptionCategory = 'meaning_confusion';
    else if (!identifyingInaccurate && distractors.has(normalizedAnswer)) misconceptionCategory = 'related_but_inaccurate';
  }
  const strand = ['produce_paraphrase','use_target','replace_phrase'].includes(questionType) ? 'production' : 'recognition';

  return {
    correct,
    normalizedAnswer,
    misconceptionCategory,
    evidence:{
      strand,
      correct,
      contextId:context.contextId ?? null,
      questionType:questionType ?? null,
      misconceptionCategory
    }
  };
}
