import assert from 'node:assert/strict';
import test from 'node:test';
import {pathways} from '../src/writing/content/review-pedagogy.js';
import {hasWritingAttempt, scoreItem, shuffledIndexes, validateActivities, validateWritingTask, writingComplete} from '../src/writing/engine/activities.js';
import {model} from '../src/writing/content/review-structure-v1.js';
import {guidedTask} from '../src/writing/content/review-guided-v1.js';
import {extraReviewModels} from '../src/writing/content/review-explore-models.js';
import {expressionModels} from '../src/writing/content/review-expression-v1.js';
import {developmentModels} from '../src/writing/content/review-development-v1.js';

test('each pathway teaches contrasts, offers differentiated practice and requires writing at Gold and Master', () => {
 const all = [];
 const prompts = new Set();
 for (const [key, course] of Object.entries(pathways)) {
  assert.equal(course.discover.length,3);
  assert.deepEqual(course.practice.map(activity=>activity.level),['Bronze','Bronze','Silver','Silver']);
  assert.deepEqual(course.practice.map(activity=>activity.items.length),[4,4,4,4]);
  assert.equal(course.apply.length,3);
  assert.equal(course.gold.length,2);
  for(const task of [...course.gold,...course.apply,course.master])validateWritingTask(task);
  all.push(...course.practice,{id:key+'-transfer',type:'choice',items:[course.analysis]});
  const choices=[...course.practice.filter(activity=>activity.type==='choice').flatMap(activity=>activity.items),course.analysis];
  const longest=choices.filter(item=>item.options[item.answer].length===Math.max(...item.options.map(option=>option.length)));
  assert.ok(longest.length<=Math.ceil(choices.length/2),key+' routinely gives the longest option as the answer');
 }
 validateActivities(all);
 for(const activity of all)for(const item of activity.items){
  assert.ok(!prompts.has(item.prompt),item.prompt);
  prompts.add(item.prompt);
  if(activity.type==='order'){
   assert.ok(scoreItem(item,item.answer));
   assert.ok(!scoreItem(item,[...item.answer].reverse()));
   continue;
  }
  assert.equal(item.explanations.length,item.options.length);
  assert.equal(item.rationale,item.explanations[item.answer]);
  const lengths=item.options.map(option=>option.split(/\s+/).length);
  assert.ok(Math.max(...lengths)/Math.min(...lengths)<=3,item.prompt);
  for(const random of [()=>0,()=>0.5,()=>0.999]){
   const permutation=shuffledIndexes(item.options.length,random);
   assert.equal(new Set(permutation).size,item.options.length);
   permutation.forEach(index=>assert.equal(scoreItem(item,index),index===item.answer));
  }
 }
});

test('both model lenses point to the relevant paragraph in every model',()=>{
 const models=[model,{...guidedTask,title:'Willow Kitchen'},...extraReviewModels];
 assert.equal(models.length,8);
 for(const lens of [expressionModels,developmentModels])for(const entry of lens(models)){
  assert.equal(entry.expression.length,entry.paragraphs.length);
  entry.expression.forEach((annotation,index)=>{
   assert.ok(entry.paragraphs[index].toLowerCase().includes(annotation.phrase.toLowerCase()),entry.title+': '+annotation.phrase);
   assert.ok(annotation.rationale);
  });
 }
});

test('repeated filler and unchecked criteria cannot complete a workshop; justified retention and punctuation edits can',()=>{
 const task=pathways.structure.gold[0];
 assert.ok(!hasWritingAttempt('test '.repeat(45),task.min));
 const original=task.example;
 const checks=new Set(task.checks.map((_,index)=>index));
 assert.ok(!writingComplete({original,revision:original,checks},task));
 assert.ok(writingComplete({original,revision:original+'!',checks},task));
 assert.ok(writingComplete({original,revision:original,checks,keepReason:'The existing advice is clearly linked to the booking delay.'},task));
 const revision=original.replace('collecting our booking','checking in');
 assert.ok(!writingComplete({original,revision,checks:new Set()},task));
 assert.ok(writingComplete({original,revision,checks},task));
});

import {cohesion, cohesionModels} from '../src/writing/content/review-cohesion.js';

test('Grammar & Cohesion covers all model paragraphs with grounded investigation prompts',()=>{
 const models=[model,{...guidedTask,title:'Willow Kitchen'},...extraReviewModels];
 assert.equal(cohesion.discover.length,5);
 assert.equal(Object.keys(cohesionModels).length,models.length);
 for(const entry of models){
  const investigations=cohesionModels[entry.title];
  assert.equal(investigations.length,entry.paragraphs.length);
  investigations.forEach((investigation,index)=>{
   assert.ok(entry.paragraphs[index].includes(investigation.phrase),entry.title+': '+investigation.phrase);
   assert.ok(investigation.prompt && investigation.rationale);
   assert.ok(investigation.min<10);
  });
 }
});

test('Grammar & Cohesion has balanced practice, feedback and valid writing tasks',()=>{
 const activities=[...cohesion.practice,{id:'cohesion-analysis',type:'choice',items:[cohesion.analysis]}];
 validateActivities(activities);
 assert.deepEqual(cohesion.practice.map(a=>[a.level,a.items.length]),[['Bronze',4],['Bronze',4],['Silver',4],['Silver',4]]);
 assert.equal(cohesion.gold.length,2);
 assert.equal(cohesion.apply.length,3);
 for(const task of [...cohesion.gold,...cohesion.apply,cohesion.master])validateWritingTask(task);
 const items=activities.flatMap(a=>a.items);
 assert.equal(new Set(items.map(item=>item.prompt)).size,items.length);
 for(const item of items){
  assert.equal(item.explanations.length,item.options.length);
  assert.equal(item.rationale,item.explanations[item.answer]);
  for(const index of shuffledIndexes(item.options.length,()=>0.1)){
   assert.equal(scoreItem(item,index),index===item.answer);
  }
 }
});

test('Cohesion workshops allow punctuation edits or a reasoned decision to keep the draft',()=>{
 const task=cohesion.gold[0];
 const original=task.example;
 const checks=new Set(task.checks.map((_,index)=>index));
 const run={original,revision:original,checks};
 assert.ok(!writingComplete(run,task));
 assert.ok(!writingComplete({...run,revision:original.replace('Friday, we','Friday,  we')},task));
 assert.ok(writingComplete({...run,revision:original.replace('friendly. However,','friendly; however,')},task));
 assert.ok(!writingComplete({...run,keepReason:'It is fine'},task));
 assert.ok(writingComplete({...run,keepReason:'The final relative clause explains the consequence of our delay.'},task));
});

import {editing,editingModels} from '../src/writing/content/review-editing.js';

test('Editing investigations are grounded in every paragraph of all eight models',()=>{
 const models=[model,{...guidedTask,title:'Willow Kitchen'},...extraReviewModels];
 assert.equal(Object.keys(editingModels).length,8);
 assert.equal(Object.values(editingModels).flat().length,30);
 for(const entry of models){
  const notes=editingModels[entry.title];
  assert.equal(notes.length,entry.paragraphs.length);
  notes.forEach((note,index)=>{
   assert.ok(entry.paragraphs[index].includes(note.phrase),entry.title+': '+note.phrase);
   assert.ok(note.prompt && note.rationale && note.min<=8);
  });
 }
});

test('Editing practice validates answer mappings and all model writing lengths',()=>{
 assert.equal(editing.discover.length,5);
 assert.equal(editing.passes.length,4);
 assert.deepEqual(editing.practice.map(a=>[a.level,a.items.length]),[['Bronze',4],['Bronze',4],['Silver',4],['Silver',4]]);
 const activities=validateActivities([...editing.practice,{id:'editing-transfer',type:'choice',items:[editing.analysis]}]);
 const items=activities.flatMap(a=>a.items);
 assert.equal(new Set(items.map(item=>item.prompt)).size,items.length);
 for(const item of items){
  assert.equal(item.explanations.length,item.options.length);
  assert.equal(item.rationale,item.explanations[item.answer]);
  for(const index of shuffledIndexes(item.options.length,()=>0.2)){
   assert.equal(scoreItem(item,index),index===item.answer);
  }
 }
 assert.equal(editing.gold.length,2);
 assert.equal(editing.apply.length,3);
 for(const task of [...editing.gold,...editing.apply,editing.master]){
  validateWritingTask(task);
  const review=task.example.replace(/^(?:Priorities:|I kept).*?\n\n/,'');
  const count=review.trim().split(/\s+/).length;
  assert.ok(count>=task.range[0]&&count<=task.range[1],task.title+': '+count);
  assert.equal(task.allowKeep,true);
 }
 const draft=editing.master.prompt.split('Student draft\n')[1].trim().split(/\s+/).length;
 assert.ok(draft>=120&&draft<=160);
 assert.equal(editing.master.checks.length,4);
});

import {exam,examMocks,examModels,modelContext} from '../src/writing/content/review-exam.js';
import {deadlineFor,newExamAttempt,remainingSeconds,submitExamAttempt} from '../src/writing/engine/exam-attempt.js';

test('Exam Mastery content covers eight models and all independent task types',()=>{
 const models=[model,{...guidedTask,title:'Willow Kitchen'},...extraReviewModels];
 assert.equal(Object.values(examModels).flat().length,30);
 for(const entry of models){
  assert.equal(modelContext[entry.title].length,2);
  assert.equal(examModels[entry.title].length,entry.paragraphs.length);
  examModels[entry.title].forEach((note,i)=>assert.ok(entry.paragraphs[i].includes(note.phrase)));
 }
 assert.equal(exam.discover.length,5);
 assert.equal(exam.passes.length,4);
 assert.equal(exam.analysis.length,3);
 assert.deepEqual(exam.practice.map(card=>card.items.length),[4,4,4,4]);
 validateActivities([...exam.practice,{id:'exam-checkpoint',type:'choice',items:exam.analysis}]);
 assert.equal(exam.gold.length,2);
 for(const task of exam.gold)validateWritingTask(task);
 const tasks=[...exam.apply,...examMocks];
 assert.equal(exam.apply.length,3);
 assert.equal(examMocks.length,4);
 assert.equal(new Set(tasks.map(task=>task.id)).size,tasks.length);
 for(const task of tasks){
  const count=task.example.trim().split(/\s+/).length;
  assert.ok(count>=120&&count<=160,task.title+': '+count);
 }
});

test('Exam deadline survives elapsed time and short submissions preserve an immutable original',()=>{
 const start=1000;
 const deadline=deadlineFor(start);
 assert.equal(remainingSeconds(deadline,start),1200);
 assert.equal(remainingSeconds(deadline,start+73000),1127);
 assert.equal(remainingSeconds(deadline,deadline+10000),0);
 const attempt=newExamAttempt();
 attempt.started=true;
 attempt.deadline=deadline;
 assert.equal(submitExamAttempt(attempt,start),false);
 attempt.draft='A short original response.';
 assert.equal(submitExamAttempt(attempt,deadline),true);
 assert.equal(attempt.submitted.expired,true);
 attempt.revision='A new version.';
 assert.equal(submitExamAttempt(attempt,deadline+2000),false);
 assert.equal(attempt.submitted.text,'A short original response.');
 assert.equal(attempt.revision,'A new version.');
});

test('R2.1 staff fixes have independent scenario answers and distinct option identities',async()=>{
 const {reviseDevelopmentForStaff,vocabularyDiscoverR21}=await import('../src/writing/content/review-critical-r2-1.js');
 const {pathways}=await import('../src/writing/content/review-pedagogy.js');
 const {scoreItem}=await import('../src/writing/engine/activities.js');
 const staff=reviseDevelopmentForStaff(pathways.development);
 const staffItems=[staff.analysis,...staff.practice.flatMap(activity=>activity.items),vocabularyDiscoverR21];
 const previous=[pathways.development.analysis,...pathways.development.practice.flatMap(activity=>activity.items)];
 for (const [id,answer,detail] of [
  ['pedagogy-q-019','demo-v2',/5:05/],
  ['pedagogy-extra-q-31','try-v2',/club can accept/],
  ['pedagogy-extra-q-27','seven-v2',/leaves seven minutes/],
  ['pedagogy-extra-q-30','balance-v2',/ten minutes at the bench/],
  ['pedagogy-observation-006','time-v2',/at lunchtime.*around midday/i]
 ]){
  const item=staffItems.find(question=>question.id===id);
  assert.equal(item.version,2,id);
  assert.equal(item.optionIds[item.answer],answer,id);
  assert.match(item.rationale,detail,id);
  item.options.forEach((_,index)=>assert.equal(scoreItem(item,index),item.optionIds[index]===answer,id));
  const old=previous.find(question=>question.id===id);
  if(old)assert.ok(old.optionIds.every(key=>!item.optionIds.includes(key)),id);
 }
 assert.ok(previous.every(question=>question.version!==2));
 assert.match(pathways.expression.discover.find(item=>item.id===vocabularyDiscoverR21.id).prompt,/when or where/);
});
