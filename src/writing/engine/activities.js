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
   if(i.explanations && (i.explanations.length!==i.options.length || i.explanations.some(text=>!text.trim())))throw Error('Invalid feedback mapping');
   if(new Set(i.options.map(option=>option.trim().toLowerCase())).size!==i.options.length)throw Error('Duplicate options');
   const valid=n=>Number.isInteger(n)&&n>=0&&n<i.options.length;
   if(a.type==='choice'?!valid(i.answer):!Array.isArray(i.answer)||i.answer.length!==i.options.length||new Set(i.answer).size!==i.options.length||!i.answer.every(valid))throw Error('Invalid answer');
  }
 }
 return activities;
}

// Keep option identities as original indexes. The caller stores the permutation
// for the current item, so a redraw never changes the meaning of a response.
export function shuffledIndexes(length, random = Math.random) {
 const indexes = Array.from({length}, (_, i) => i);
 for (let i = length - 1; i > 0; i--) {
  const j = Math.floor(random() * (i + 1));
  [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
 }
 return indexes;
}

export function hasWritingAttempt(text, minimum) {
 const words = text.toLocaleLowerCase('en').match(/\p{L}+(?:[’'-]\p{L}+)*/gu) ?? [];
 return words.length >= minimum && new Set(words).size >= Math.min(8, minimum);
}

export function validateWritingTask(task) {
 if (![task.title, task.prompt, task.question, task.example].every(value => typeof value === 'string' && value.trim())
  || !Number.isInteger(task.min) || task.min < 1 || !hasWritingAttempt(task.example, task.min)
  || !Array.isArray(task.checks) || !task.checks.length || task.checks.some(check => !check.trim())) {
  throw Error('Invalid writing task: ' + task.title);
 }
 return task;
}

const normaliseWriting = text => text.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
export function writingComplete(run, task) {
 return !!run.original && hasWritingAttempt(run.revision, task.min)
  && (normaliseWriting(run.original) !== normaliseWriting(run.revision)
   || (task.allowKeep && (run.original.trim().replace(/\s+/g,' ') !== run.revision.trim().replace(/\s+/g,' ') || hasWritingAttempt(run.keepReason??'',8))))
  && run.checks.size === task.checks.length;
}

// These are evidence states for an independent writing workflow.
export function writingEvidence(run,task) {
 if(writingComplete(run,task))return 'self-reviewed';
 if(!run.original)return run.draft.trim()?'draft':'not-attempted';
 const changed=run.original.trim().replace(/\s+/g,' ')!==run.revision.trim().replace(/\s+/g,' ');
 return (changed && hasWritingAttempt(run.revision,task.min)) || (task.allowKeep && hasWritingAttempt(run.keepReason??'',8))
  ? 'revised-or-retained':'compared';
}
