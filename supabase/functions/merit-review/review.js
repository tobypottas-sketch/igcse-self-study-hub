import { buildMeritStatus } from '../../../src/vocabulary/merits.js';
import { plannerContent } from '../../../src/vocabulary/data.js';
import { evaluateUnitReadiness } from '../../../src/vocabulary/pathway-readiness.js';
import { coverageFromReadiness } from '../../../src/vocabulary/pathway-coverage.js';

function prepareCatalogue(catalogue) {
  const coverageByUnit = {};
  for (const unit of new Set(catalogue.occurrences.map(o => o.unit_number))) {
    const occurrences = catalogue.occurrences.filter(o => o.unit_number === unit);
    const words = new Set(occurrences.map(o => o.vocabulary_id));
    const targets = new Set(occurrences.map(o => o.occurrence_id));
    const content = plannerContent({
      occurrences,
      items:catalogue.items.filter(i => words.has(i.vocabulary_id)),
      contexts:catalogue.contexts.filter(c => targets.has(c.occurrence_id)),
      activities:catalogue.activities.filter(a => a.unit_number === unit)
    });
    coverageByUnit[unit] = coverageFromReadiness(evaluateUnitReadiness({content}).pathways);
  }
  return {occurrences:catalogue.occurrences,coverageByUnit};
}

export function createMeritReview({now=Date.now,prepare=prepareCatalogue}={}) {
  let cached;
  return async ({inputs,fresh=false}) => {
    const warm = cached?.until > now() ? cached.value : null;
    const data = await inputs(fresh || !warm);
    // Only the public live catalogue is reused across accounts. Student inputs
    // and authorization are read afresh for every request, including awards.
    const catalogue = data.catalogue ? prepare(data.catalogue) : fresh ? null : warm;
    if (!catalogue) throw new Error('Merit catalogue unavailable');
    if (data.catalogue) cached = {value:catalogue,until:now()+120000};
    const status = buildMeritStatus({...catalogue,students:data.students,unitMastery:data.mastery,
      missions:data.missions,awards:data.awards});
    const byStudent = new Map(status.map(row=>[row.studentId,row.pendingNumbers]));
    const highest = new Map(data.awards.map(row=>[row.student_id,row.merit_number]));
    const students = new Map();
    const pending = [];
    for (const row of data.students) {
      const numbers = byStudent.get(row.id) ?? [];
      students.set(row.id,{pending:numbers,highestAwarded:highest.get(row.id) ?? 0});
      if (numbers.length) pending.push({studentId:row.id,displayName:row.display_name,className:row.class_name,
        pendingMerits:numbers.length,pendingMeritNumbers:numbers});
    }
    return {proof:data.proof,students,snapshot:{students:pending,assignedClassCount:data.assignedClassCount,
      pendingMerits:pending.reduce((sum,s)=>sum+s.pendingMerits,0)}};
  };
}
