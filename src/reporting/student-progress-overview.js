import { REPORTING_CAPABILITIES } from './capabilities.js';

const names = new Intl.Collator('en', { numeric:true, sensitivity:'base' });
const known = row => Number.isInteger(row.activeDays) && row.activeDays >= 0 &&
  ['recorded','no-records'].includes(row.practiceState);

// Input must be the authorised Phase 1 snapshot, never a global profile list.
// Unknown evidence is not counted as inactivity. Merits are lifetime, not period totals.
export function buildClassOverview(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.students)) return { available:false, classes:[], totals:null };
  const groups = new Map();
  const seen = new Set();
  for (const c of snapshot.classes ?? []) if(c.classId) groups.set(c.classId,{classId:c.classId,className:c.className,students:[]});
  for (const row of snapshot.students) {
    if (!row.studentId || !row.classId || seen.has(row.studentId)) continue;
    seen.add(row.studentId);
    if (!groups.has(row.classId)) groups.set(row.classId, { classId:row.classId, className:row.className, students:[] });
    groups.get(row.classId).students.push(row);
  }
  const summarize = rows => {
    const observed = rows.filter(known);
    const active = observed.filter(row => row.activeDays > 0);
    const modules = Object.keys(REPORTING_CAPABILITIES).map(appKey => ({
      appKey, learners:active.filter(row => (row.learningAreas ?? []).includes(appKey)).length,
      coverage:REPORTING_CAPABILITIES[appKey].coverage,
      pilot:REPORTING_CAPABILITIES[appKey].pilot ?? null
    }));
    const complete = observed.length === rows.length;
    const meritKnown = rows.every(row => Number.isInteger(row.pendingMerits) && row.pendingMerits >= 0);
    return {
      enrolled:rows.length, observed:observed.length, unknown:rows.length-observed.length,
      estimatedSeconds:rows.some(r=>Number.isFinite(r.estimatedSeconds)) ? rows.reduce((n,r)=>n+(Number.isFinite(r.estimatedSeconds)?r.estimatedSeconds:0),0) : null,
      timeRecords:rows.filter(r=>Number.isFinite(r.estimatedSeconds)).length,
      completedActivities:complete && rows.every(r=>Number.isInteger(r.completedActivities)) ? rows.reduce((n,r)=>n+r.completedActivities,0) : null,
      awardedMerits:rows.every(r=>Number.isInteger(r.awardedMerits)) ? rows.reduce((n,r)=>n+r.awardedMerits,0) : null,
      activeLearners:complete ? active.length : null,
      recordedActiveLearners:active.length,
      participation:complete && rows.length ? active.length / rows.length : null,
      learningAreasUsed:complete ? modules.filter(m => m.learners > 0).length : null,
      pendingMerits:meritKnown ? rows.reduce((n,row) => n+row.pendingMerits,0) : null,
      modules:modules.map(m => ({ ...m, learners:complete ? m.learners : null, recordedLearners:m.learners }))
    };
  };
  const classes = [...groups.values()].sort((a,b) => names.compare(a.className ?? '', b.className ?? '')).map(group => ({
    ...group, ...summarize(group.students),
    students:[...group.students].sort((a,b) => names.compare(a.displayName ?? '',b.displayName ?? ''))
  }));
  return { available:true, preview:snapshot.preview === true, classes,
    totals:{ ...summarize(classes.flatMap(group => group.students)), classes:classes.length } };
}
