function safeCount(value) {
  return Math.max(0,Number(value) || 0);
}

export function starCountFor(firstAttemptCorrect = 0) {
  const correct = safeCount(firstAttemptCorrect);
  if (correct >= 9) return 3;
  if (correct >= 7) return 2;
  if (correct >= 5) return 1;
  return 0;
}

export function buildSessionRewardSummary({
  completedAttempts = [],
  sessionSummary = {},
  totalQuestions = 10,
  pathwayId = null,
  pathwayStage = null
} = {}) {
  const attempts = Array.isArray(completedAttempts) ? completedAttempts : [];
  const firstAttemptCorrect = attempts.filter(attempt => attempt?.evidence?.firstAttemptCorrect === true).length;
  const correctedMistakes = attempts.filter(attempt => attempt?.evidence?.correctedAfterRetry === true).length;

  return {
    firstAttemptCorrect,
    correctedMistakes,
    stars:starCountFor(firstAttemptCorrect),
    practised:safeCount(sessionSummary?.practised),
    strengthened:safeCount(sessionSummary?.strengthened),
    needsAnotherLook:safeCount(sessionSummary?.needsAnotherLook),
    totalQuestions:safeCount(totalQuestions),
    pathwayId:pathwayId ?? null,
    pathwayStage:pathwayStage ?? null
  };
}
