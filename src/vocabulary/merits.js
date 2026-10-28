import { buildUnitPathwayStates } from './pathway-view-model.js';

export const DEFAULT_PATHWAYS_PER_MERIT = 2;
export const MIN_PATHWAYS_PER_MERIT = 1;
export const MAX_PATHWAYS_PER_MERIT = 6;

function unitNumberOf(occurrence) { return occurrence.unitNumber ?? occurrence.unit_number ?? null; }

export function normalisePathwaysPerMerit(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < MIN_PATHWAYS_PER_MERIT || parsed > MAX_PATHWAYS_PER_MERIT) return DEFAULT_PATHWAYS_PER_MERIT;
  return parsed;
}

export function countMasteredPathways({ occurrences = [], unitMastery = {}, globalMastery = {} } = {}) {
  const byUnit = new Map();
  for (const occurrence of occurrences) {
    const unit = unitNumberOf(occurrence);
    if (unit == null) continue;
    if (!byUnit.has(unit)) byUnit.set(unit, []);
    byUnit.get(unit).push(occurrence);
  }
  let completed = 0;
  for (const unitOccurrences of byUnit.values()) {
    const states = buildUnitPathwayStates({ occurrences:unitOccurrences, unitMastery, globalMastery });
    for (const state of Object.values(states)) if (state?.available !== false && state?.mastered === true) completed += 1;
  }
  return completed;
}

export function buildMeritStatus({ students = [], occurrences = [], unitMastery = [], globalMastery = [], awards = [] } = {}) {
  const awardedByStudent = new Map();
  for (const award of awards) {
    const id = award.studentId ?? award.student_id;
    if (!awardedByStudent.has(id)) awardedByStudent.set(id, new Set());
    awardedByStudent.get(id).add(Number(award.meritNumber ?? award.merit_number));
  }

  return students.map(student => {
    const unit = Object.fromEntries(unitMastery.filter(row => row.studentId === student.id).map(row => [row.occurrenceId, row]));
    const global = Object.fromEntries(globalMastery.filter(row => row.studentId === student.id).map(row => [row.vocabularyId, row]));
    const completedPathways = countMasteredPathways({ occurrences, unitMastery:unit, globalMastery:global });
    const pathwaysPerMerit = normalisePathwaysPerMerit(student.meritPathwaysRequired ?? student.merit_pathways_required);
    const eligibleByProgress = Math.floor(completedPathways / pathwaysPerMerit);
    const done = awardedByStudent.get(student.id) ?? new Set();
    const highestAwarded = done.size ? Math.max(...done) : 0;
    const earned = Math.max(eligibleByProgress, highestAwarded);
    const pendingNumbers = [];
    for (let n = highestAwarded + 1; n <= eligibleByProgress; n += 1) pendingNumbers.push(n);
    const nextMeritNumber = earned + 1;
    return {
      studentId:student.id,
      displayName:student.displayName ?? student.display_name ?? student.id,
      completedPathways,
      pathwaysPerMerit,
      earned,
      awarded:done.size,
      pendingNumbers,
      nextMeritNumber,
      pathwaysToNext:Math.max(0, nextMeritNumber * pathwaysPerMerit - completedPathways)
    };
  });
}
