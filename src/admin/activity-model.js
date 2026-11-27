import { buildMeritStatus } from '../vocabulary/merits.js';
import { summarizeEngagement } from '../reporting/engagement.js';
import { reportingPeriod, timestampOf } from '../reporting/periods.js';
import { reportUnitPathways, summarizeUnitChecks } from '../reporting/vocabulary.js';

function indexByStudent(rows) {
  const result = new Map();
  for (const row of rows) {
    if (!result.has(row.studentId)) result.set(row.studentId, []);
    result.get(row.studentId).push(row);
  }
  return result;
}

export function buildActivityDashboard({
  students = [], occurrences = [], globalMastery = [], unitMastery = [], activity = [],
  unitChecks = [], awards = [], now = new Date(), coverageByUnit, engagementAvailable = true
} = {}) {
  const period = reportingPeriod('thisWeek', { now });
  const merits = new Map(buildMeritStatus({
    students, occurrences, globalMastery, unitMastery, awards, coverageByUnit
  }).map(merit => [merit.studentId, merit]));
  const events = indexByStudent(activity);
  const checks = indexByStudent(unitChecks);
  const contextual = indexByStudent(unitMastery);
  const global = indexByStudent(globalMastery);

  const rows = students.map(student => {
    const history = summarizeUnitChecks(checks.get(student.id) ?? [], period.asOf);
    const evidence = [...(events.get(student.id) ?? [])];
    for (const check of history) {
      for (const attempt of check.rows) evidence.push({
        id:`${check.unitNumber}:${attempt.attemptNumber}`, appKey:'vocabulary_paraphrase',
        source:'unit-check', occurredAt:attempt.completedAt
      });
    }
    const engagement = engagementAvailable
      ? summarizeEngagement(evidence, period, { classId:student.classId, startedAt:student.startedAt })
      : null;
    const merit = merits.get(student.id);
    return {
      studentId:student.id, displayName:student.displayName, classId:student.classId,
      className:student.className, studentNumber:student.studentNumber,
      lastPractice:engagement?.lastPractice?.occurredAt ?? null,
      lastInteraction:engagement?.lastInteraction?.occurredAt ?? null,
      activeDays:engagement?.sufficient ? engagement.activeDays : null,
      practiceState:!engagement ? 'retrieval-failure' : !engagement.sufficient ? 'insufficient-evidence'
        : engagement.activeDays ? 'recorded' : 'no-records',
      learningAreas:engagement?.learningAreas ?? [],
      unitPathways:reportUnitPathways(occurrences, contextual.get(student.id) ?? [], global.get(student.id) ?? [], coverageByUnit),
      unitChecks:history, awardedMerits:merit.awarded, eligibleMerits:merit.eligibleByProgress,
      pendingMerits:merit.pendingNumbers.length, pendingMeritNumbers:merit.pendingNumbers,
      recentActivity:engagement?.visible.sort((a,b) => timestampOf(b.occurredAt) - timestampOf(a.occurredAt)).slice(0,12)
        .map(row => ({ occurredAt:row.occurredAt, appKey:row.appKey, label:(row.eventType ?? row.source).replaceAll('_',' ') })) ?? []
    };
  });
  return { students:rows, pendingMerits:rows.reduce((sum,row) => sum + row.pendingMerits,0) };
}
