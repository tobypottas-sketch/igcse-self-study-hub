import { buildVocabularySkillProfile, skillFamiliesForQuestionType, skillLabel, summarizeMisconceptions } from './skill-profile.js';
import { deriveLearningStage } from './learning-stage.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES } from './pathway-model.js';
import { buildWordPathwayStates } from './pathway-view-model.js';
import { coverageServes } from './pathway-coverage-store.js';

const STRANDS = ['meaning','recognition','context','paraphrasing','production'];
const ATTENTION_STATUSES = new Set(['building']);
const RECENT_MS = 7 * 24 * 60 * 60 * 1000;
const PATHWAY_STAGE_INDEX = Object.freeze(Object.fromEntries(PATHWAY_STAGES.map((stage,index) => [stage.id,index])));

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
function hasSkillEvidence(profile) {
  return Object.values(profile?.skills ?? {}).some(row => Number(row?.evidenceCount ?? 0) > 0);
}
function skillWeakness({ students, activity, classProfile }) {
  if (!hasSkillEvidence(classProfile) || !classProfile.developmentSkill) return null;
  const skillId = classProfile.developmentSkill;
  const affected = new Set();
  for (const student of students) {
    const events = activity.filter(event => (event.studentId ?? event.user_id) === student.id);
    const profile = buildVocabularySkillProfile(events);
    const status = profile.skills?.[skillId]?.status;
    if (status === 'Needs attention' || status === 'Developing') affected.add(student.id);
  }
  const count = affected.size || 1;
  return {
    skillId,
    strand:skillId,
    problemType:'0511_skill',
    affectedCount:count,
    summary:`${count} student${count === 1 ? '' : 's'} need more support with ${skillLabel(skillId).toLocaleLowerCase('en')}.`
  };
}
function aggregatePathwayStates(states = []) {
  if (!states.length) return { currentStage:'recognise', needsPractice:false, mastered:false, evidenceCount:0 };
  const mastered = states.every(state => state?.mastered === true);
  const currentStage = mastered
    ? 'mastery'
    : states.slice().sort((a,b) => (PATHWAY_STAGE_INDEX[a?.currentStage] ?? 0) - (PATHWAY_STAGE_INDEX[b?.currentStage] ?? 0))[0]?.currentStage ?? 'recognise';
  return { currentStage, needsPractice:states.some(state => state?.needsPractice === true), mastered, evidenceCount:states.length };
}
// Only words a live pathway serves count toward that pathway. A pathway that serves none of these words is not live for them: it is
// reported as such (no stage, no progress) instead of looking like work nobody has started.
function pathwayRowFor(pathwayId, wordStates) {
  const serving = wordStates.filter(row => coverageServes(row.occurrence.unitNumber ?? row.occurrence.unit_number ?? null, pathwayId, row.occurrence.occurrenceId ?? row.occurrence.occurrence_id));
  if (wordStates.length && !serving.length) return { currentStage:'recognise', needsPractice:false, mastered:false, evidenceCount:0, available:false };
  return { ...aggregatePathwayStates(serving.map(row => row.states[pathwayId])), available:true };
}
function masteryMapsForStudent(studentId, globalMastery, unitMastery) {
  return {
    global:Object.fromEntries(globalMastery.filter(row => row.studentId === studentId).map(row => [row.vocabularyId,row])),
    unit:Object.fromEntries(unitMastery.filter(row => row.studentId === studentId).map(row => [row.occurrenceId,row]))
  };
}

export function buildPathwayAnalytics({ students = [], targets = [], occurrences = [], globalMastery = [], unitMastery = [] } = {}) {
  const targetById = targetMap(targets);
  const perStudent = new Map();
  const studentRows = students.map(student => {
    const maps = masteryMapsForStudent(student.id,globalMastery,unitMastery);
    const wordStates = occurrences.map(occurrence => ({ occurrence, states:buildWordPathwayStates({ occurrence, unitMastery:maps.unit, globalMastery:maps.global }) }));
    perStudent.set(student.id,wordStates);
    const pathways = Object.fromEntries(VOCABULARY_PATHWAYS.map(pathway => [pathway.id,pathwayRowFor(pathway.id,wordStates)]));
    return { studentId:student.id, displayName:student.displayName ?? student.display_name ?? student.id, pathways };
  });

  const occurrencesByVocabulary = new Map();
  for (const occurrence of occurrences) {
    const vocabularyId = occurrence.vocabularyId ?? occurrence.vocabulary_id;
    if (!occurrencesByVocabulary.has(vocabularyId)) occurrencesByVocabulary.set(vocabularyId,[]);
    occurrencesByVocabulary.get(vocabularyId).push(occurrence);
  }
  const wordRows = targets.map(target => {
    const vocabularyId = target.vocabularyId ?? target.vocabulary_id;
    const relevantOccurrenceIds = new Set((occurrencesByVocabulary.get(vocabularyId) ?? []).map(row => row.occurrenceId ?? row.occurrence_id));
    const states = [];
    for (const student of students) {
      for (const row of perStudent.get(student.id) ?? []) {
        if (relevantOccurrenceIds.has(row.occurrence.occurrenceId ?? row.occurrence.occurrence_id)) states.push(row.states);
      }
    }
    const pathways = Object.fromEntries(VOCABULARY_PATHWAYS.map(pathway => [pathway.id,aggregatePathwayStates(states.map(row => row[pathway.id]))]));
    return { vocabularyId, term:targetById.get(vocabularyId)?.term ?? vocabularyId, pathways };
  });
  return { studentRows, wordRows };
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
    if (ATTENTION_STATUSES.has(row.status) || row.recentErrorPattern) studentAttention.set(studentId, (studentAttention.get(studentId) ?? 0) + 1);
  }
  const studentsNeedingAttention = [...studentAttention.entries()]
    .map(([studentId,targetCount]) => ({ studentId, displayName:studentById.get(studentId)?.displayName ?? studentId, targetCount }))
    .sort((a,b) => b.targetCount - a.targetCount);

  const skillProfile = buildVocabularySkillProfile(activity);
  let mainWeakness = skillWeakness({ students, activity, classProfile:skillProfile });
  if (!mainWeakness) {
    const weakness = mastery.length ? weakestStrand(mastery) : null;
    if (weakness) {
      const affected = new Set(mastery.filter(row => number(row.strandEvidence?.[weakness.strand]) < 3).map(row => row.studentId));
      if (affected.size) mainWeakness = { strand:weakness.strand, problemType:'skill', affectedCount:affected.size, summary:`${affected.size} student${affected.size === 1 ? '' : 's'} need more ${weakness.strand} evidence.` };
    }
  }

  const wordCounts = new Map();
  for (const row of mastery) {
    if (!(ATTENTION_STATUSES.has(row.status) || row.recentErrorPattern)) continue;
    wordCounts.set(row.vocabularyId, (wordCounts.get(row.vocabularyId) ?? 0) + 1);
  }
  const difficultWords = [...wordCounts.entries()].map(([vocabularyId,affectedCount]) => ({ vocabularyId, term:targetsById.get(vocabularyId)?.term ?? vocabularyId, affectedCount })).sort((a,b) => b.affectedCount - a.affectedCount || a.term.localeCompare(b.term));

  const recentRows = mastery.filter(row => {
    const time = new Date(row.updatedAt ?? row.updated_at ?? 0).getTime();
    return Number.isFinite(time) && nowMs - time <= RECENT_MS;
  });
  const improvedCount = recentRows.filter(row => ['secure','mastered'].includes(deriveLearningStage(row))).length;

  return {
    studentsNeedingAttention,
    mainWeakness,
    skillProfile,
    misconceptionPatterns:summarizeMisconceptions(activity),
    difficultWords,
    engagement:{ practisedRecently:recentStudents.size, notRecentlyPractised:Math.max(0, students.length - recentStudents.size) },
    trend:{ label:improvedCount ? 'Improving' : (mastery.length ? 'Stable' : 'Insufficient evidence'), improvedCount }
  };
}

export function buildProblemDrilldown({ students = [], targets = [], mastery = [], activity = [], strand, skillId } = {}) {
  const studentById = studentMap(students);
  const targetsById = targetMap(targets);
  const relevant = mastery.filter(row => !strand || number(row.strandEvidence?.[strand]) < 3);
  let affectedStudentIds = [...new Set(relevant.map(row => row.studentId))];
  let failureTypes;

  if (skillId) {
    const relevantActivity = activity.filter(event => skillFamiliesForQuestionType(event?.metadata?.question_type).includes(skillId));
    affectedStudentIds = [...new Set(relevantActivity.map(event => event.studentId ?? event.user_id).filter(Boolean))];
    failureTypes = summarizeMisconceptions(relevantActivity).map(row => ({ type:row.code, label:row.label, count:row.count }));
  }

  const affectedStudents = affectedStudentIds.map(studentId => ({ studentId, displayName:studentById.get(studentId)?.displayName ?? studentId }));
  const wordCounts = new Map();
  const masteryFailureCounts = new Map();
  for (const row of relevant) {
    wordCounts.set(row.vocabularyId, (wordCounts.get(row.vocabularyId) ?? 0) + 1);
    if (row.recentErrorPattern) masteryFailureCounts.set(row.recentErrorPattern, (masteryFailureCounts.get(row.recentErrorPattern) ?? 0) + 1);
  }
  if (!failureTypes) failureTypes = [...masteryFailureCounts.entries()].map(([type,count]) => ({ type, count })).sort((a,b) => b.count - a.count);
  return {
    strand,
    skillId,
    affectedStudents,
    words:[...wordCounts.entries()].map(([vocabularyId,affectedCount]) => ({ vocabularyId, term:targetsById.get(vocabularyId)?.term ?? vocabularyId, affectedCount })).sort((a,b) => b.affectedCount - a.affectedCount),
    failureTypes
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
  const persistentTargets = mastery.filter(row => ATTENTION_STATUSES.has(row.status) || row.recentErrorPattern).map(row => ({ vocabularyId:row.vocabularyId, term:targetsById.get(row.vocabularyId)?.term ?? row.vocabularyId, status:row.status, learningStage:deriveLearningStage(row), errorPattern:row.recentErrorPattern ?? null }));
  const lastPractice = activity.map(event => event.occurredAt ?? event.occurred_at).filter(Boolean).sort().at(-1) ?? null;
  const skillProfile = buildVocabularySkillProfile(activity);
  return {
    studentId:student?.id,
    displayName:student?.displayName ?? student?.display_name ?? '',
    strongestStrand:strong?.strand ?? null,
    developmentArea:weak?.strand ?? null,
    strands,
    persistentTargets,
    lastPractice,
    skillProfile,
    strongestSkill:skillProfile.strongestSkill,
    developmentSkill:skillProfile.developmentSkill,
    misconceptionPatterns:skillProfile.misconceptions
  };
}
