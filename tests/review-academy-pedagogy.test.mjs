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
