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
  assert.equal(course.apply.length,3);
  for(const task of [course.gold,...course.apply,course.master])validateWritingTask(task);
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

test('repeated filler, an unchanged revision and unchecked criteria cannot complete a workshop',()=>{
 const task=pathways.structure.gold;
 assert.ok(!hasWritingAttempt('test '.repeat(45),task.min));
 const original=task.example;
 const checks=new Set(task.checks.map((_,index)=>index));
 assert.ok(!writingComplete({original,revision:original+'!',checks},task));
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
