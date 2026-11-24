import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCatalogue,validateCatalogue} from '../src/writing/engine/catalogue.js';
import {reviewConfig,CATEGORY_NAMES,QUESTIONS,PLAN_GUIDANCE} from '../src/writing/content/review-v1.js';

test('review catalogue retains all 20 stable legacy task IDs, four categories and six pathways',()=>{
 const c=createCatalogue(reviewConfig);
 assert.equal(c.listTasks().length,20);
 assert.equal(c.config.pathways.length,6);
 assert.deepEqual(c.config.wordRange,{min:120,max:160});
 assert.deepEqual(c.config.sections,['intro','description','opinion','recommendation']);
 for(const [category,title] of Object.entries(CATEGORY_NAMES)){
  assert.equal(c.listTasks(category).length,5);
  assert.ok(title && PLAN_GUIDANCE[category]);
  for(const q of QUESTIONS[category])assert.deepEqual(c.getTask(q.id),{...q,category,version:1});
 }
 assert.equal(c.getTask('missing'),null);
 assert.equal(c.getPathway('editing').title,'Editing & Improvement');
});
test('the extracted prompts and planning content match the unchanged legacy source',()=>{
 const legacy=readFileSync(new URL('../review-writing.html',import.meta.url),'utf8');
 const extracted=readFileSync(new URL('../src/writing/content/review-v1.js',import.meta.url),'utf8');
 for(const [start,end] of [['CATEGORY_NAMES','FIELD_MAP']]){
  const original=legacy.slice(legacy.indexOf('const '+start),legacy.indexOf('const '+end)).trim();
  const copy=extracted.slice(extracted.indexOf('export const '+start),extracted.indexOf('export const reviewConfig')).replaceAll('export const ','const ').trim();
  assert.equal(copy,original);
 }
});
test('invalid IDs, versions, ranges and task categories are rejected',()=>{
 const clone=()=>structuredClone(reviewConfig);
 let c=clone();c.tasks.push(c.tasks[0]);assert.throws(()=>validateCatalogue(c),/duplicate tasks/);
 c=clone();c.tasks[0].category='unknown';assert.throws(()=>validateCatalogue(c),/invalid task/);
 c=clone();c.tasks[0].version=0;assert.throws(()=>validateCatalogue(c),/invalid task/);
 c=clone();c.wordRange.max=10;assert.throws(()=>validateCatalogue(c),/word range/);
});
test('catalogue readers cannot mutate the published snapshot',()=>{
 const input=structuredClone(reviewConfig),c=createCatalogue(input);
 const before=c.getTask('restaurant-1');
 input.tasks[0].title='changed';
 c.getTask('restaurant-1').title='changed';
 c.config.tasks[0].title='changed';
 c.listTasks()[0].title='changed';
 assert.deepEqual(c.getTask('restaurant-1'),before);
});
test('a different writing type can use the same pure engine',()=>{
 const c=createCatalogue({id:'email',version:1,wordRange:{min:120,max:160},sections:['greeting','body','signoff'],categories:[{id:'friend',title:'Friends'}],tasks:[{id:'example',category:'friend',title:'Example',prompt:'Write to a friend.',version:1}],pathways:[{id:'register',title:'Register'}]});
 assert.equal(c.getTask('example').prompt,'Write to a friend.');
});

import {reviewExam,blueprint,model,structureActivities} from '../src/writing/content/review-structure-v1.js';
import {scoreItem,validateActivities} from '../src/writing/engine/activities.js';
test('structure lessons retain exam scaffold and valid original model',()=>{
 assert.equal(reviewExam.contentMarks+reviewExam.languageMarks,15);
 assert.equal(blueprint.length,4);assert.match(blueprint[0].guidance,/why you visited/);
 const count=model.paragraphs.join(' ').split(/\s+/).length;assert.ok(count>=120&&count<=160);
 assert.equal(validateActivities(structureActivities).length,6);
 for(const a of structureActivities)for(const i of a.items){assert.equal(scoreItem(i,i.answer),true);assert.equal(scoreItem(i,null),false);}
 assert.equal(scoreItem({answer:[2,1,3,0]},[0,1,2,3]),false);
});
