import { buildUnitPathwayStates } from './pathway-view-model.js';

export const DEFAULT_PATHWAYS_PER_MERIT = 2;
export const MIN_PATHWAYS_PER_MERIT = 1;
export const MAX_PATHWAYS_PER_MERIT = 6;
// Compatibility only while the core Vocabulary engagement strip is progressively migrated.
// Merit eligibility is no longer calculated from stage ticks; see buildMeritStatus/meritProgress below.
export const SKILLS_PER_MERIT = 10;

function unitNumberOf(occurrence) { return occurrence.unitNumber ?? occurrence.unit_number ?? null; }

export function normalisePathwaysPerMerit(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < MIN_PATHWAYS_PER_MERIT || parsed > MAX_PATHWAYS_PER_MERIT) return DEFAULT_PATHWAYS_PER_MERIT;
  return parsed;
}

export function countMasteredPathways({ occurrences = [], unitMastery = {}, globalMastery = {}, coverageByUnit } = {}) {
  const byUnit = new Map();
  for (const occurrence of occurrences) {
    const unit = unitNumberOf(occurrence);
    if (unit == null) continue;
    if (!byUnit.has(unit)) byUnit.set(unit, []);
    byUnit.get(unit).push(occurrence);
  }
  let completed = 0;
  for (const [unitNumber, unitOccurrences] of byUnit) {
    const states = buildUnitPathwayStates({ occurrences:unitOccurrences, unitMastery, globalMastery, coverageByPathway:coverageByUnit?.[unitNumber] });
    for (const state of Object.values(states)) if (state?.available !== false && state?.mastered === true) completed += 1;
  }
  return completed;
}

export function meritProgress(completedPathways, pathwaysPerMerit = DEFAULT_PATHWAYS_PER_MERIT, awarded = 0) {
  const completed = Math.max(0, Math.floor(Number(completedPathways) || 0));
  const threshold = normalisePathwaysPerMerit(pathwaysPerMerit);
  const awardedCount = Math.max(0, Math.floor(Number(awarded) || 0));
  const nextMeritNumber = Math.max(Math.floor(completed / threshold), awardedCount) + 1;
  const toNext = Math.max(0, nextMeritNumber * threshold - completed);
  return {
    completedPathways:completed,
    pathwaysPerMerit:threshold,
    toNext,
    copy:`${toNext} more completed ${toNext === 1 ? 'pathway' : 'pathways'} toward your next teacher-awarded merit`,
    awarded:awardedCount,
    nextMeritNumber
  };
}

export function buildMeritStatus({ students = [], occurrences = [], unitMastery = [], globalMastery = [], awards = [], coverageByUnit, missions = [] } = {}) {
  const awardedByStudent = new Map();
  for (const award of awards) {
    const id = award.studentId ?? award.student_id;
    if (!awardedByStudent.has(id)) awardedByStudent.set(id, new Set());
    awardedByStudent.get(id).add(Number(award.meritNumber ?? award.merit_number));
  }

  return students.map(student => {
    const unit = Object.fromEntries(unitMastery.filter(row => row.studentId === student.id).map(row => [row.occurrenceId, row]));
    const global = Object.fromEntries(globalMastery.filter(row => row.studentId === student.id).map(row => [row.vocabularyId, row]));
    const completedPathways = countMasteredPathways({ occurrences, unitMastery:unit, globalMastery:global, coverageByUnit });
    const pathwaysPerMerit = normalisePathwaysPerMerit(student.meritPathwaysRequired ?? student.merit_pathways_required);
    const missionStatus=missionMeritProgress(missions.filter(r=>(r.studentId??r.student_id)===student.id),completedPathways);
    const eligibleByProgress = missionStatus.eligibleByProgress;
    const done = awardedByStudent.get(student.id) ?? new Set();
    const highestAwarded = done.size ? Math.max(...done) : 0;
    const earned = Math.max(eligibleByProgress, highestAwarded);
    const pendingNumbers = [];
    // Preserve the historical award high-water mark, including gaps after a class transfer.
    for (let n = highestAwarded + 1; n <= Math.min(1000,eligibleByProgress); n += 1) pendingNumbers.push(n);
    const nextMeritNumber = earned + 1;
    return {
      studentId:student.id,
      displayName:student.displayName ?? student.display_name ?? student.id,
      completedPathways,
      passedMissions:missionStatus.passedMissions,
      pathwaysPerMerit,
      earned,
      eligibleByProgress,
      awarded:done.size,
      pendingNumbers,
      nextMeritNumber,
      pathwaysToNext:missionMeritProgress(missions.filter(r=>(r.studentId??r.student_id)===student.id),completedPathways,highestAwarded).toNext
    };
  });
}

export const MISSIONS_PER_MERIT=3;
export function qualifyingMissions(rows=[]){
 const unique=new Map();
 for(const r of rows){
  const unit=Number(r.unit_number??r.unitNumber),path=r.pathway_id??r.pathwayId,stage=r.pathway_stage??r.stage,kind=r.mission_kind??r.kind,date=r.completed_at??r.completedAt,set=Number(r.set_number??r.setNumber??0);
  if(r.outcome!=='pass'||kind!=='pathway'||!Number.isInteger(unit)||unit<1||!['meaning','context','word_families','paraphrasing','precision_use','spelling_recall'].includes(path)||!['recognise','match','apply','recall','mastery'].includes(stage)||!Number.isFinite(Date.parse(date))||!Number.isInteger(set)||set<0)continue;
  const key=[unit,path,stage,set].join('|');if(!unique.has(key))unique.set(key,{unit,path,stage,set});
 }
 return [...unique.values()];
}
export function missionMeritProgress(missions=[],mastered=0,awarded=0){
 const passed=qualifyingMissions(missions).length,eligible=Math.floor(passed/3)+Math.max(0,Math.floor(mastered||0)),already=Math.max(0,Math.floor(awarded||0)),earned=Math.max(eligible,already);
 const toNext=Math.max(1,(earned+1-Math.max(0,Math.floor(mastered||0)))*3-passed);
 return {passedMissions:passed,completedPathways:mastered,eligibleByProgress:eligible,earned,awarded:already,toNext,copy:toNext+' more qualifying passed '+(toNext===1?'mission':'missions')+' toward your next merit'};
}
