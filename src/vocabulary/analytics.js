const STRANDS = ['meaning','recognition','context','paraphrasing','production'];
const ATTENTION_STATUSES = new Set(['building']);
const RECENT_MS = 7 * 24 * 60 * 60 * 1000;

function number(value) { return Number.isFinite(Number(value)) ? Number(value) : 0; }
function average(values) { return values.length ? values.reduce((sum,value) => sum + value, 0) / values.length : 0; }
function targetMap(targets) { return new Map(targets.map(target => [target.vocabularyId, target])); }
function studentMap(students) { return new Map(students.map(student => [student.id, student])); }

function qualitative(value, hasEvidence = true) {
  if (!hasEvidence) return 'Insufficient evidence';
  if (value >= 7) return 'Strong';
  if (value >= 4) return 'Secure';
  if (value >= 2) return 'Developing';
  return 'Needs attention';
}

function weakestStrand(rows) {
  const totals = Object.fromEntries(STRANDS.map(strand => [strand, []]));
  for (const row of rows) for (const strand of STRANDS) totals[strand].push(number(row.strandEvidence?.[strand]));
  const available = STRANDS.map(strand => ({ strand, value:average(totals[strand]) })).filter(entry => totals[entry.strand].length);
  return available.sort((a,b) => a.value - b.value)[0] ?? null;
}

function strongestStrand(rows) {
  const totals = Object.fromEntries(STRANDS.map(strand => [strand, []]));
  for (const row of rows) for (const strand of STRANDS) totals[strand].push(number(row.strandEvidence?.[strand]));
  return STRANDS.map(strand => ({ strand, value:average(totals[strand]) })).sort((a,b) => b.value - a.value)[0] ?? null;
}

export function buildClassInsights({ students = [], targets = [], mastery = [], activity = [], now = new Date() } = {}) {
  const studentById = studentMap(students);
  const targetsById = targetMap(targets);
  const nowMs = new Date(now).getTime();
  const recentStudents = new Set(activity.filter(event => {
    const time = new Date(event.occurredAt ?? event.occurred_at).getTime();
    return Number.isFinite(time) && nowMs - time <= RECENT_MS;
  }).map(event => event.studentId ?? event.user_id));

  const studentAttention = new Map();
  for (const row of mastery) {
    const studentId = row.studentId;
    if (!studentById.has(studentId)) continue;
    if (ATTENTION_STATUSES.has(row.status) || row.recentErrorPattern) {
      studentAttention.set(studentId, (studentAttention.get(studentId) ?? 0) + 1);
    }
  }
  const studentsNeedingAttention = [...studentAttention.entries()]
    .map(([studentId,targetCount]) => ({ studentId, displayName:studentById.get(studentId)?.displayName ?? studentId, targetCount }))
    .sort((a,b) => b.targetCount - a.targetCount);

  const weakness = mastery.length ? weakestStrand(mastery) : null;
  let mainWeakness = null;
  if (weakness) {
    const affected = new Set(mastery.filter(row => number(row.strandEvidence?.[weakness.strand]) < 3).map(row => row.studentId));
    if (affected.size) mainWeakness = {
      strand:weakness.strand,
      problemType:'skill',
      affectedCount:affected.size,
      summary:`${affected.size} student${affected.size === 1 ? '' : 's'} need more ${weakness.strand} evidence.`
    };
  }

  const wordCounts = new Map();
  for (const row of mastery) {
    if (!(ATTENTION_STATUSES.has(row.status) || row.recentErrorPattern)) continue;
    wordCounts.set(row.vocabularyId, (wordCounts.get(row.vocabularyId) ?? 0) + 1);
  }
  const difficultWords = [...wordCounts.entries()].map(([vocabularyId,affectedCount]) => ({
    vocabularyId,
    term:targetsById.get(vocabularyId)?.term ?? vocabularyId,
    affectedCount
  })).sort((a,b) => b.affectedCount - a.affectedCount || a.term.localeCompare(b.term));

  const recentRows = mastery.filter(row => {
    const time = new Date(row.updatedAt ?? row.updated_at ?? 0).getTime();
    return Number.isFinite(time) && nowMs - time <= RECENT_MS;
  });
  const improvedCount = recentRows.filter(row => row.status === 'secure' || row.status === 'mastered').length;

  return {
    studentsNeedingAttention,
    mainWeakness,
    difficultWords,
    engagement:{ practisedRecently:recentStudents.size, notRecentlyPractised:Math.max(0, students.length - recentStudents.size) },
    trend:{ label:improvedCount ? 'Improving' : (mastery.length ? 'Stable' : 'Insufficient evidence'), improvedCount }
  };
}

export function buildProblemDrilldown({ students = [], targets = [], mastery = [], strand } = {}) {
  const studentById = studentMap(students);
  const targetsById = targetMap(targets);
  const relevant = mastery.filter(row => !strand || number(row.strandEvidence?.[strand]) < 3);
  const affectedStudents = [...new Set(relevant.map(row => row.studentId))].map(studentId => ({
    studentId,
    displayName:studentById.get(studentId)?.displayName ?? studentId
  }));
  const wordCounts = new Map();
  const failureCounts = new Map();
  for (const row of relevant) {
    wordCounts.set(row.vocabularyId, (wordCounts.get(row.vocabularyId) ?? 0) + 1);
    if (row.recentErrorPattern) failureCounts.set(row.recentErrorPattern, (failureCounts.get(row.recentErrorPattern) ?? 0) + 1);
  }
  return {
    strand,
    affectedStudents,
    words:[...wordCounts.entries()].map(([vocabularyId,affectedCount]) => ({ vocabularyId, term:targetsById.get(vocabularyId)?.term ?? vocabularyId, affectedCount })).sort((a,b) => b.affectedCount - a.affectedCount),
    failureTypes:[...failureCounts.entries()].map(([type,count]) => ({ type, count })).sort((a,b) => b.count - a.count)
  };
}

export function buildStudentProfile({ student, targets = [], mastery = [], activity = [] } = {}) {
  const targetsById = targetMap(targets);
  const strong = strongestStrand(mastery);
  const weak = weakestStrand(mastery);
  const strands = {};
  for (const strand of STRANDS) {
    const values = mastery.map(row => number(row.strandEvidence?.[strand]));
    strands[strand] = qualitative(average(values), values.length > 0);
  }
  const persistentTargets = mastery
    .filter(row => ATTENTION_STATUSES.has(row.status) || row.recentErrorPattern)
    .map(row => ({ vocabularyId:row.vocabularyId, term:targetsById.get(row.vocabularyId)?.term ?? row.vocabularyId, status:row.status, errorPattern:row.recentErrorPattern ?? null }));
  const lastPractice = activity.map(event => event.occurredAt ?? event.occurred_at).filter(Boolean).sort().at(-1) ?? null;
  return {
    studentId:student?.id,
    displayName:student?.displayName ?? student?.display_name ?? '',
    strongestStrand:strong?.strand ?? null,
    developmentArea:weak?.strand ?? null,
    strands,
    persistentTargets,
    lastPractice
  };
}
