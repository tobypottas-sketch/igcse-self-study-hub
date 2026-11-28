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
    const pathways=coverageByPathway?buildUnitPathwayStates({occurrences:words,unitMastery:context,globalMastery:global,coverageByPathway}):null;
    // Unit currentStage is the highest stage reached by an actionable word, not whole-unit completion.
    // Count completed word-stages across all serviceable words, including unstarted words.
    if(pathways){
      const wordStates=words.map(word=>({word}));
      for(const [key,p] of Object.entries(pathways)){
        if(!p.available)continue;
        const ids=coverageByPathway[key]?.occurrenceIds;
        const allowed=Array.isArray(ids)?new Set(ids.map(String)):null;
        const eligible=wordStates.filter(({word})=>!allowed||allowed.has(String(word.occurrenceId)));
        // Count contiguous recorded stage completions, not legacy placement estimates.
        const stageIds=['recognise','match','apply','recall','mastery'];
        const recorded=eligible.map(({word})=>{
          const evidence=context[word.occurrenceId]?.contextualEvidence??context[word.occurrenceId]?.contextual_evidence??{};
          const q=evidence.pathwayProgress?.[key]??evidence.pathway_progress?.[key];
          const raw=q?.completedStages??q?.completed_stages;
          const done=new Set(Array.isArray(raw)?raw:stageIds.filter(id=>q?.stages?.[id]?.completed===true));
          let count=0;for(const id of stageIds){if(!done.has(id))break;count++}
          const next=stageIds[count],s=q?.stages?.[next]??{},clean=Number(s.cleanSuccesses??s.clean_successes??0),unassisted=Number(s.cleanUnassistedSuccesses??s.clean_unassisted_successes??0),success=Number(s.successes??0);
          const content=new Set(s.contentIds??s.content_ids??[]).size,prompts=new Set(s.promptKeys??s.prompt_keys??[]).size;
          const partial=next==='recognise'?Math.min(clean/2,content/2):next==='match'||next==='apply'?clean/2:next==='recall'?unassisted/2:next==='mastery'?Math.min(success/3,unassisted/2,prompts/2):0;
          return {count,partial:Math.max(0,Math.min(.99,partial||0))};
        });
        p.completedWordStages=recorded.reduce((n,x)=>n+x.count,0);
        p.totalWordStages=eligible.length*5;
        p.learningWordStages=recorded.reduce((n,x)=>n+x.count+x.partial,0);
        p.masteredWords=recorded.filter(x=>x.count===5).length;
        p.serviceableWords=eligible.length;
      }
    }
    return [{unitNumber,unitTitle:words[0]?.unitTitle??null,pathways}];
  });
}
