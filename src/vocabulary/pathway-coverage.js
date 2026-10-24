import { evaluateUnitReadiness } from './pathway-readiness.js';

// Reshape a readiness evaluation into the per-pathway coverage the student views and planners read. Whether a pathway is live is
// decided only by the readiness evaluator; this file adds nothing of its own.
export function coverageFromReadiness(pathways = {}) {
  const result = {};
  for (const [id, row] of Object.entries(pathways)) {
    result[id] = {
      available:row.live,
      occurrenceIds:row.live ? row.servedOccurrenceIds : [],
      totalOccurrences:row.totalOccurrences,
      withheldStages:row.withheldStages,
      stageCounts:row.stageCounts,
      reason:row.reason,
      setCount:row.playableSetCount ?? 0,
      heldBackOccurrenceIds:row.heldBackOccurrenceIds ?? [],
      readiness:row
    };
  }
  return result;
}

export function buildPathwayCoverage({ content, masteryByVocabularyId = {}, expectedWords = null } = {}) {
  return coverageFromReadiness(evaluateUnitReadiness({ content, masteryByVocabularyId, expectedWords }).pathways);
}
