import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathways} from '../src/writing/content/review-pedagogy.js';
import {model} from '../src/writing/content/review-structure-v1.js';
import {guidedTask} from '../src/writing/content/review-guided-v1.js';
import {extraReviewModels} from '../src/writing/content/review-explore-models.js';
import {withStaffInteractions} from '../src/writing/content/review-interactions-r2-2.js';
import {expressionDiscover,expressionExplore,optionalExpressionExplore,refineExpressionForStaff} from '../src/writing/content/review-expression-r2-4.js';
import {finishedStructureModels} from '../src/writing/content/review-structure-r2-3.js';
import {checkRecognition,recognitionResult,recognitionRun} from '../src/writing/engine/recognition.js';
import {capturePreview,restorePreview} from '../src/writing/engine/preview-progress.js';
import {writingComplete} from '../src/writing/engine/activities.js';
import {newWritingRun} from '../src/writing/ui/response-workshop.js';

const base = pathways.expression;
const course = refineExpressionForStaff(withStaffInteractions(base));
const models = [model,guidedTask,...extraReviewModels];
const exploration = Object.values(expressionExplore).flat();
const quizzes = [...course.practice,{id:'expression-transfer',type:'choice',items:[course.analysis]}];
const recognition = [...expressionDiscover,...exploration,...quizzes.flatMap(activity=>activity.items.filter(item=>item.checkedPractice))];
const content = {recognition,discover:course.discover,models,activities:quizzes,gold:course.gold,
 apply:course.apply,master:course.master,challenges:[]};

test('the R2.4 register reconciles exactly the runtime inventory and the original audit',()=>{
 const inventory = [...expressionDiscover,...exploration,...quizzes.flatMap(activity=>activity.items),...course.gold,...course.apply,course.master];
 const docs = new URL('../docs/review-academy-r2/reviews/',import.meta.url);
 const records = filename => readFileSync(new URL(filename,docs),'utf8').trim().split('\n').slice(1).map(line=>line.split('\t'));
 const auditIds = [...records('expression-objectives.tsv'),...records('expression-open.tsv')].map(row=>row[0]).sort();
 const register = records('expression-r2-4-resolutions.tsv');
 assert.equal(inventory.length,56);
 assert.deepEqual(register.map(row=>row[0]).sort(),auditIds);
 assert.deepEqual(register.map(row=>row[1]).sort(),inventory.map(item=>item.id).sort());
 for(const source of models)assert.deepEqual(expressionExplore[source.id].map(item=>item.id),source.paragraphIds.map(id=>source.id+'--'+id));
});

test('the staff overlay keeps legacy course objects and unchanged decisions intact',()=>{
 const earlier = withStaffInteractions(base);
 const before = earlier.practice.flatMap(activity=>activity.items);
 for(const revised of course.practice.flatMap(activity=>activity.items)){
  const old = before.find(item=>item.id===revised.id);
  if(revised===old)continue;
  assert.equal(revised.version,2);
  for(const [index,id] of revised.optionIds.entries()){
   const oldIndex=old.optionIds.indexOf(id);
   if(oldIndex>=0)assert.equal(revised.options[index],old.options[oldIndex]);
  }
 }
 assert.equal(base.master.modelNote,undefined);
 assert.equal(base.analysis.version,undefined);
 assert.match(course.master.modelNote,/two signs near the exit in low light/);
 assert.ok(course.master.example.split(/\s+/).length>=35 && course.master.example.split(/\s+/).length<=55);
});

test('the two replacement activities and Master have new checked decisions',()=>{
 for(const [item,answer] of [
  [expressionExplore['beyond-the-stars'][0],'early-interest-2'],
  [expressionExplore['summer-sound'][0],'purpose-1'],
  [course.analysis,'caption-and-seats']
 ]){
  const run=recognitionRun(item);
  assert.equal(item.version,2);
  const wrong=item.optionIds.find(id=>id!==answer);
  assert.equal(checkRecognition(item,run,wrong),true);
  assert.equal(recognitionResult(item,run),'pending');
  assert.equal(checkRecognition(item,run,answer),true);
  assert.equal(recognitionResult(item,run),'retry');
 }
});

test('three different completed models are needed and optional work never blocks a model',()=>{
 const done=new Set();
 const finished=()=>finishedStructureModels(expressionExplore,item=>done.has(item.id),optionalExpressionExplore);
 for(const items of Object.values(expressionExplore).slice(0,3)){
  const required=items.filter(item=>!optionalExpressionExplore.has(item.id));
  const before=finished();
  required.slice(1).forEach(item=>done.add(item.id));
  assert.equal(finished(),before);
  done.add(required[0].id);
  assert.equal(finished(),before+1);
 }
 assert.equal(finished(),3);
});

function freshState(){
 return {model:0,paragraph:0,discoveryIndex:0,goldIndex:0,applyIndex:0,discoverNotes:new Map(),discovered:new Set(),
  exploreDrafts:new Map(),identified:new Set(),attempts:new Map(),recognition:new Map(),gold:course.gold.map(newWritingRun),
  applications:course.apply.map(newWritingRun),transfer:newWritingRun()};
}

test('legacy open text, earlier writing and new retry history round-trip independently',()=>{
 const previous=freshState();
 const investigation=expressionExplore['riverside-cafe'][0];
 previous.exploreDrafts.set('0:0','Earlier paraphrase');
 previous.exploreDrafts.set('expression-writing:3:1','New optional writing');
 previous.identified.add('0:0');
 previous.discoverNotes.set(0,'An earlier observation');
 previous.transfer.draft='My earlier exhibition review';
 previous.transfer.editorNote='A separate note';
 const timing=expressionDiscover[2];
 const retry=recognitionRun(timing);
 checkRecognition(timing,retry,'sounds-v2');
 checkRecognition(timing,retry,'time-v2');
 previous.recognition.set(timing.id,retry);
 const checkpoint=capturePreview(previous,content,{stage:'explore',completed:['explore']});
 assert.ok(checkpoint);
 const restored=freshState();
 restorePreview(restored,content,checkpoint);
 assert.equal(restored.exploreDrafts.get('0:0'),'Earlier paraphrase');
 assert.equal(restored.exploreDrafts.get('expression-writing:3:1'),'New optional writing');
 assert.equal(restored.discoverNotes.get(0),'An earlier observation');
 assert.equal(restored.transfer.draft,'My earlier exhibition review');
 assert.equal(restored.transfer.editorNote,'A separate note');
 assert.equal(recognitionResult(investigation,restored.recognition.get(investigation.id)),'pending');
 assert.equal(recognitionResult(timing,restored.recognition.get(timing.id)),'retry');
});

test('the revised Master reopens while unrelated valid answers and author text survive',()=>{
 const oldCourse=withStaffInteractions(base);
 const oldCheckpoint={id:'expression-transfer',type:'choice',items:[oldCourse.analysis]};
 const unchanged=course.practice.flatMap(activity=>activity.items).find(item=>item.id==='pedagogy-q-008');
 const oldPractice=oldCourse.practice.find(activity=>activity.items.some(item=>item.id===unchanged.id));
 const previous=freshState();
 for(const activity of [oldCheckpoint,oldPractice]){
  previous.attempts.set(activity.id,{index:activity.items.length,done:true,
   displays:activity.items.map(item=>item.optionIds.map((_,index)=>index)),
   answered:new Map(activity.items.map(item=>[item.id,item.answer]))});
 }
 previous.transfer.original='An earlier original review that the writer should still be able to read.';
 previous.transfer.revision='An earlier revision that remains available after the checkpoint changes.';
 const oldContent={...content,activities:[...oldCourse.practice,oldCheckpoint]};
 const snapshot=capturePreview(previous,oldContent,{stage:'master',completed:['practise','master']});
 const restored=freshState();
 restorePreview(restored,content,snapshot);
 assert.equal(restored.attempts.get(oldCheckpoint.id).done,false);
 assert.equal(restored.attempts.get(oldPractice.id).answered.get(unchanged.id),unchanged.answer);
 assert.equal(restored.transfer.original,previous.transfer.original);
 assert.equal(restored.transfer.revision,previous.transfer.revision);
});

test('a separate editor’s note is required without contributing to review length',()=>{
 const task=course.master;
 const run={...newWritingRun(),original:task.example,revision:task.example+' The displays also show how photography developed.',
  checks:new Set(task.checkIds.map((_,index)=>index))};
 assert.equal(writingComplete(run,task),false);
 run.editorNote=task.modelNote;
 assert.equal(writingComplete(run,task),true);
 run.revision='A short review.';
 assert.equal(writingComplete(run,task),false);
});
