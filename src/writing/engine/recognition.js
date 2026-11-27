import {scoreItem, shuffledIndexes, validateActivities} from './activities.js';

// Option indexes are used only by the scorer. Stored attempts use authored IDs.
export function recognitionQuestion(id, version, prompt, correctId, choices, tip) {
 const item = {id, version, prompt, tip, optionIds:choices.map(([key])=>key),
  options:choices.map(([,text])=>text), explanations:choices.map(([, ,feedback])=>feedback)};
 item.answer = item.optionIds.indexOf(correctId);
 item.rationale = item.explanations[item.answer];
 if (!Number.isInteger(version) || version<1 || choices.length<3 || choices.length>4
   || ![id,...item.optionIds].every(key=>/^[a-z0-9][a-z0-9_-]{0,79}$/.test(key))
   || new Set(item.optionIds).size!==choices.length) throw new Error('Invalid recognition identifiers');
 return validateActivities([{id,type:'choice',items:[item]}])[0].items[0];
}

export function recognitionRun(item, saved, random) {
 const keys = item.optionIds;
 const validOrder = Array.isArray(saved?.order) && saved.order.length===keys.length
  && new Set(saved.order).size===keys.length && saved.order.every(key=>keys.includes(key));
 const validAttempts = Array.isArray(saved?.attempts) && saved.attempts.length<=2
  && saved.attempts.every(key=>keys.includes(key)) && new Set(saved.attempts).size===saved.attempts.length
  && (saved.attempts.length<2 || !scoreItem(item,keys.indexOf(saved.attempts[0])));
 if (saved?.version===item.version && validOrder && validAttempts) {
  const run = {version:item.version,order:[...saved.order],attempts:[...saved.attempts]};
  if (keys.includes(saved.selection) && !run.attempts.includes(saved.selection)
    && recognitionResult(item,run)==='pending') run.selection=saved.selection;
  return run;
 }
 return {version:item.version,order:shuffledIndexes(keys.length,random).map(index=>keys[index]),attempts:[]};
}

export function recognitionResult(item, run) {
 const index = item.optionIds.indexOf(run?.attempts.at(-1));
 if (index<0) return 'pending';
 if (scoreItem(item,index)) return run.attempts.length===1?'first':'retry';
 return run.attempts.length>=2?'supported':'pending';
}

export function checkRecognition(item, run, optionId) {
 if (recognitionResult(item,run)!=='pending' || !item.optionIds.includes(optionId) || run.attempts.includes(optionId)) return false;
 run.attempts.push(optionId);
 return true;
}

export function objectiveEvidence(item,run) {
 const outcome=recognitionResult(item,run);
 if(outcome==='pending')return run?.attempts.length?'incorrect-first-attempt':'not-attempted';
 return {first:'correct-independently',retry:'correct-after-feedback',supported:'completed-with-support'}[outcome];
}
