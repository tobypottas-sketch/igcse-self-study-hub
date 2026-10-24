import { buildUnitPathwayStates } from './pathway-view-model.js';

// One "skill" = one pathway stage that shows as passed (a tick) on a student's unit pathway card.
export const SKILLS_PER_MERIT = 10;

function unitNumberOf(occurrence) { return occurrence.unitNumber ?? occurrence.unit_number ?? null; }

export function countPassedStages({ occurrences = [], unitMastery = {}, globalMastery = {} } = {}) {
  const byUnit = new Map();
  for (const occurrence of occurrences) {
    const unit = unitNumberOf(occurrence);
    if (unit == null) continue;
    if (!byUnit.has(unit)) byUnit.set(unit, []);
    byUnit.get(unit).push(occurrence);
  }
  let passed = 0;
  for (const unitOccurrences of byUnit.values()) {
    const states = buildUnitPathwayStates({ occurrences:unitOccurrences, unitMastery, globalMastery });
    for (const state of Object.values(states)) if (state?.available !== false) passed += state?.completedStages?.length ?? 0;
  }
  return passed;
}

export function buildMeritStatus({ students = [], occurrences = [], unitMastery = [], globalMastery = [], awards = [], skillsPerMerit = SKILLS_PER_MERIT } = {}) {
  const awardedByStudent = new Map();
  for (const award of awards) {
    const id = award.studentId ?? award.student_id;
    if (!awardedByStudent.has(id)) awardedByStudent.set(id, new Set());
    awardedByStudent.get(id).add(Number(award.meritNumber ?? award.merit_number));
  }
  return students.map(student => {
    const unit = Object.fromEntries(unitMastery.filter(row => row.studentId === student.id).map(row => [row.occurrenceId, row]));
    const global = Object.fromEntries(globalMastery.filter(row => row.studentId === student.id).map(row => [row.vocabularyId, row]));
    const skillsPassed = countPassedStages({ occurrences, unitMastery:unit, globalMastery:global });
    const earned = Math.floor(skillsPassed / skillsPerMerit);
    const done = awardedByStudent.get(student.id) ?? new Set();
    const pendingNumbers = [];
    for (let n = 1; n <= earned; n += 1) if (!done.has(n)) pendingNumbers.push(n);
    return {
      studentId:student.id,
      displayName:student.displayName ?? student.display_name ?? student.id,
      skillsPassed, earned, awarded:earned - pendingNumbers.length, pendingNumbers,
      skillsToNext:skillsPerMerit - (skillsPassed % skillsPerMerit)
    };
  });
}
