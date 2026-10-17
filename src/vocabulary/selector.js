function evidence(mastery, strand) {
  return Number(mastery?.strandEvidence?.[strand] ?? 0);
}

function reviewDue(mastery, now) {
  if (!mastery?.reviewDueAt) return false;
  const due = new Date(mastery.reviewDueAt);
  return !Number.isNaN(due.getTime()) && due.getTime() <= new Date(now).getTime();
}

function priorityFor(occurrence, globalMastery, unitMastery, now) {
  if ((globalMastery?.recentErrorCount ?? 0) > 0 || globalMastery?.recentErrorPattern) return 600;
  if (evidence(globalMastery, 'production') < 3 && globalMastery?.status && globalMastery.status !== 'new') return 500;
  if (unitMastery && !['secure','mastered'].includes(unitMastery.status)) return 450;
  if (globalMastery && (evidence(globalMastery, 'paraphrasing') < 3 || evidence(globalMastery, 'context') < 3)) return 400;
  if (!globalMastery || globalMastery.status === 'new') return 300;
  if (reviewDue(globalMastery, now)) return 200;
  return 100;
}

export function selectPriorityTargets({ occurrences = [], masteryByVocabularyId = {}, unitMastery = {}, now = new Date(), limit = 10 } = {}) {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  return occurrences
    .map(occurrence => ({
      ...occurrence,
      priority:priorityFor(occurrence, masteryByVocabularyId[occurrence.vocabularyId], unitMastery[occurrence.occurrenceId], now)
    }))
    .sort((a,b) => b.priority - a.priority || (a.positionInUnit ?? 0) - (b.positionInUnit ?? 0))
    .slice(0, safeLimit);
}
