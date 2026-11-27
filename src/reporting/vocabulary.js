import { timestampOf } from './periods.js';
import { buildUnitPathwayStates } from '../vocabulary/pathway-view-model.js';

export function summarizeUnitChecks(rows, asOf) {
  const groups = new Map();
  for (const row of rows) {
    const { unitNumber, attemptNumber, score, maxScore } = row;
    const date = timestampOf(row.completedAt);
    if (!Number.isInteger(unitNumber) || unitNumber < 1 || ![1,2,3].includes(attemptNumber) ||
        !Number.isFinite(date) || date > asOf || maxScore !== 10 || !Number.isInteger(score) || score < 0 || score > maxScore) continue;
    if (!groups.has(unitNumber)) groups.set(unitNumber, new Map());
    const attempts = groups.get(unitNumber);
    if (!attempts.has(attemptNumber) || timestampOf(attempts.get(attemptNumber).completedAt) < date) {
      attempts.set(attemptNumber, row);
    }
  }
  return [...groups].sort(([a], [b]) => a - b).map(([unitNumber, attempts]) => {
    const history = [...attempts.values()].sort((a, b) =>
      timestampOf(b.completedAt) - timestampOf(a.completedAt) || b.attemptNumber - a.attemptNumber);
    return {
      unitNumber, attemptsUsed:history.length, attemptsRemaining:3 - history.length,
      latestScore:history[0].score, bestScore:Math.max(...history.map(row => row.score)), rows:history
    };
  });
}

export function reportUnitPathways(occurrences, unitMastery, globalMastery, coverageByUnit) {
  const byUnit = new Map();
  for (const row of occurrences) {
    if (!byUnit.has(row.unitNumber)) byUnit.set(row.unitNumber, []);
    byUnit.get(row.unitNumber).push(row);
  }
  const context = Object.fromEntries(unitMastery.map(row => [row.occurrenceId, row]));
  const global = Object.fromEntries(globalMastery.map(row => [row.vocabularyId, row]));
  return [...byUnit].sort(([a], [b]) => a - b).flatMap(([unitNumber, words]) => {
    // Global evidence may carry across the curriculum. A contextual row establishes unit participation.
    if (!words.some(row => Object.hasOwn(context, row.occurrenceId))) return [];
    const coverageByPathway = coverageByUnit?.[unitNumber];
    return [{
      unitNumber, pathways:coverageByPathway
        ? buildUnitPathwayStates({ occurrences:words, unitMastery:context, globalMastery:global, coverageByPathway })
        : null
    }];
  });
}
