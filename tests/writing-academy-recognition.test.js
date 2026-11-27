import assert from 'node:assert/strict';
import test from 'node:test';
import {checkRecognition, recognitionQuestion, recognitionResult, recognitionRun} from '../src/writing/engine/recognition.js';
import {structureDiscover, structureExplore} from '../src/writing/content/review-structure-recognition.js';
import {model} from '../src/writing/content/review-structure-v1.js';
import {guidedTask} from '../src/writing/content/review-guided-v1.js';
import {extraReviewModels} from '../src/writing/content/review-explore-models.js';
import {pathways} from '../src/writing/content/review-pedagogy.js';
import {structureR1 as course} from '../src/writing/content/review-structure-r1.js';
import {scoreItem, validateActivities, writingComplete} from '../src/writing/engine/activities.js';
import {capturePreview, restorePreview} from '../src/writing/engine/preview-progress.js';

const models = [model,guidedTask,...extraReviewModels];
const items = [...structureDiscover,...Object.values(structureExplore).flat()];
const wrongOptions = item => item.optionIds.filter((_,n)=>n!==item.answer);
const rightOption = item => item.optionIds[item.answer];

test('every active contrast and paragraph has a unique, stable recognition question',()=>{
 assert.equal(structureDiscover.length,3);
 assert.deepEqual(structureDiscover.map(item=>item.id),course.discover.map(example=>example.id));
 assert.deepEqual(Object.keys(structureExplore),models.map(review=>review.id));
 for(const review of models) {
  assert.deepEqual(structureExplore[review.id].map(item=>item.id),review.paragraphIds.map(id=>review.id+'--'+id));
  assert.equal(structureExplore[review.id].length,review.paragraphs.length);
 }
 assert.equal(items.length,33);
 assert.equal(new Set(items.map(item=>item.id)).size,33);
 const sample=[['a','One','Feedback A'],['b','Two','Feedback B'],['c','Three','Feedback C']];
 for(const choices of [sample.slice(0,2),[...sample,sample[0]],[...sample.slice(0,2),['c','One','Duplicate text']], [...sample.slice(0,2),['c','Three','']]]) {
  assert.throws(()=>recognitionQuestion('test',2,'Pick one.','a',choices));
 }
 assert.throws(()=>recognitionQuestion('test',2,'Pick one.','absent',sample));
 assert.throws(()=>recognitionQuestion('test',0,'Pick one.','a',sample));
 const four=recognitionQuestion('valid-four',2,'Pick one.','d',[...sample,['d','Four','Feedback D']],'A tip.');
 assert.equal(four.optionIds.length,4);
 assert.equal(four.tip,'A tip.');
 assert.ok(scoreItem(four,3));
});

for(const item of items) {
 test(item.id+' distinguishes first try, retry, support and unfinished work',()=>{
  const initial = recognitionRun(item,null,()=>0.99);
  const shuffled = recognitionRun(item,null,()=>0);
  assert.notDeepEqual(initial.order,shuffled.order);
  assert.deepEqual([...shuffled.order].sort(),[...item.optionIds].sort());
  for(const invalid of [null,'','Some meaningless written text',item.answer]) {
   assert.equal(checkRecognition(item,initial,invalid),false);
   assert.equal(recognitionResult(item,initial),'pending');
  }
  assert.ok(checkRecognition(item,initial,rightOption(item)));
  assert.equal(recognitionResult(item,initial),'first');
  const [firstWrong,secondWrong]=wrongOptions(item);
  assert.ok(checkRecognition(item,shuffled,firstWrong));
  assert.equal(recognitionResult(item,shuffled),'pending');
  assert.equal(checkRecognition(item,shuffled,firstWrong),false);
  assert.ok(checkRecognition(item,shuffled,rightOption(item)));
  assert.equal(recognitionResult(item,shuffled),'retry');
  assert.deepEqual(recognitionRun(item,shuffled),shuffled);

  const supported = recognitionRun(item);
  assert.ok(checkRecognition(item,supported,firstWrong));
  assert.ok(checkRecognition(item,supported,secondWrong));
  assert.equal(recognitionResult(item,supported),'supported');
  assert.equal(checkRecognition(item,supported,rightOption(item)),false);
  assert.equal(item.explanations[item.answer],item.rationale);
  assert.equal(new Set(item.explanations).size,item.optionIds.length);
  for(const stale of [{...initial,version:item.version-1},{...initial,attempts:[item.answer]}, {...initial,attempts:[rightOption(item),firstWrong]}]) {
   assert.equal(recognitionResult(item,recognitionRun(item,stale)),'pending');
  }
 });
}

const writingRun=()=>({draft:'',original:'',revision:'',keepReason:'',checks:new Set()});
const state=()=>({discoveryIndex:0,model:0,paragraph:0,goldIndex:0,applyIndex:0,discovered:new Set(),identified:new Set(),
 discoverNotes:new Map(),exploreDrafts:new Map(),attempts:new Map(),recognition:new Map(),gold:course.gold.map(writingRun),
 applications:course.apply.map(writingRun),transfer:writingRun()});
const content={discover:course.discover,models,recognition:items,gold:course.gold,apply:course.apply,master:course.master,
 activities:course.practice,challenges:course.practice.map(activity=>activity.id)};

test('legacy completion preserves observations and writing without generating correct answers',()=>{
 const old=state();
 old.discovered.add(0);
 old.identified.add('0:0');
 old.discoverNotes.set(0,'Random words can pass a minimum.');
 old.applications[0].draft='This draft belongs to the student.';
 const saved=capturePreview(old,content,{stage:'explore',completed:['discover']});
 const next=state();
 restorePreview(next,content,saved);
 assert.equal(next.recognition.size,0);
 assert.equal(next.applications[0].draft,old.applications[0].draft);
 assert.equal(next.discoverNotes.get(0),old.discoverNotes.get(0));
 const item=items[0];
 const run=recognitionRun(item);
 checkRecognition(item,run,wrongOptions(item)[0]);
 next.recognition.set(item.id,run);
 const renewed=capturePreview(next,content,{stage:'discover',completed:[]});
 const reopened=state();
 restorePreview(reopened,content,renewed);
 assert.deepEqual(reopened.recognition.get(item.id),run);
 assert.equal(recognitionResult(item,reopened.recognition.get(item.id)),'pending');
});

test('all Structure practice, checkpoint and writing workflows retain their assessed content',()=>{
 const activities=[...course.practice,{id:'structure-transfer',type:'choice',items:[course.analysis]}];
 validateActivities(activities);
 const legacy=pathways.structure.practice.flatMap(activity=>activity.items).concat(pathways.structure.analysis);
 const updated=activities.flatMap(activity=>activity.items);
 assert.deepEqual(updated.map(({id,optionIds,answer})=>[id,optionIds,answer]),legacy.map(({id,optionIds,answer})=>[id,optionIds,answer]));
 assert.equal(course.practice.flatMap(activity=>activity.items).length,16);
 for(const {type,items} of activities) for(const item of items) {
  assert.ok(scoreItem(item,item.answer));
  assert.equal(scoreItem(item,null),false);
  if(type==='choice') assert.deepEqual(item.options.map((_,index)=>scoreItem(item,index)),item.options.map((_,index)=>index===item.answer));
  else assert.equal(scoreItem(item,[...item.answer].reverse()),false);
 }
 for(const task of [...course.gold,...course.apply,course.master]){
  const run=writingRun();
  assert.equal(writingComplete(run,task),false);
  run.original=task.example;
  run.revision=task.example;
  run.checks=new Set(task.checks.map((_,index)=>index));
  assert.equal(writingComplete(run,task),false);
  run.keepReason='I kept my related details together in the same paragraph.';
  assert.equal(writingComplete(run,task),true);
 }
});

test('objective evidence distinguishes attempts, independent answers, retries and support',async()=>{
 const {recognitionQuestion,recognitionRun,checkRecognition,objectiveEvidence}=await import('../src/writing/engine/recognition.js');
 const question=recognitionQuestion('contract',1,'Choose the best answer.','a',[
  ['a','A','This is supported by the extract.'],['b','B','This gives a different reason.'],['c','C','This changes the audience.']
 ]);
 const independent=recognitionRun(question);
 assert.equal(objectiveEvidence(question,independent),'not-attempted');
 checkRecognition(question,independent,'a');
 assert.equal(objectiveEvidence(question,independent),'correct-independently');
 for(const [choice,result] of [['a','correct-after-feedback'],['c','completed-with-support']]){
  const run=recognitionRun(question);
  checkRecognition(question,run,'b');
  assert.equal(objectiveEvidence(question,run),'incorrect-first-attempt');
  checkRecognition(question,run,choice);
  assert.equal(objectiveEvidence(question,run),result);
  assert.equal(checkRecognition(question,run,'a'),false);
 }
});
