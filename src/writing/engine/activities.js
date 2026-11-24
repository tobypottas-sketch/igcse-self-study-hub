// Deterministic activity scoring; no AI, DOM, network or student persistence.
export function scoreItem(item,response){
 if(Array.isArray(item.answer))return Array.isArray(response)&&response.length===item.answer.length&&response.every((v,i)=>v===item.answer[i]);
 return Number.isInteger(response)&&response===item.answer;
}
export function validateActivities(activities){
 const ids=new Set();
 for(const a of activities){
  if(!a.id||ids.has(a.id)||!['choice','order'].includes(a.type)||!a.items?.length)throw Error('Invalid activity');
  ids.add(a.id);
  for(const i of a.items){
   if(!i.prompt||!i.rationale||!Array.isArray(i.options)||i.options.length<2)throw Error('Invalid item');
   const valid=n=>Number.isInteger(n)&&n>=0&&n<i.options.length;
   if(a.type==='choice'?!valid(i.answer):!Array.isArray(i.answer)||i.answer.length!==i.options.length||new Set(i.answer).size!==i.options.length||!i.answer.every(valid))throw Error('Invalid answer');
  }
 }
 return activities;
}
