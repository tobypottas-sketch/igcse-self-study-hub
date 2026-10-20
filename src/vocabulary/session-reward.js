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

function sessionOutcomes(completedAttempts = []) {
  const attempts = Array.isArray(completedAttempts) ? completedAttempts : [];
  const byTarget = new Map();
  let anonymousIndex = 0;
  for (const attempt of attempts) {
    const key = attempt?.targetId ?? `attempt:${anonymousIndex++}`;
    const evidence = attempt?.evidence ?? {};
    if (!byTarget.has(key)) {
      byTarget.set(key, {
        firstAttemptCorrect:evidence.firstAttemptCorrect === true,
        correctedAfterRetry:evidence.correctedAfterRetry === true
      });
      continue;
    }
    if (evidence.correctedAfterRetry === true) byTarget.get(key).correctedAfterRetry = true;
  }
  return [...byTarget.values()];
}

export function buildSessionRewardSummary({
  completedAttempts = [],
  sessionSummary = {},
  totalQuestions = 10,
  pathwayId = null,
  pathwayStage = null
} = {}) {
  const outcomes = sessionOutcomes(completedAttempts);
  const firstAttemptCorrect = outcomes.filter(outcome => outcome.firstAttemptCorrect).length;
  const correctedMistakes = outcomes.filter(outcome => outcome.correctedAfterRetry).length;

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
