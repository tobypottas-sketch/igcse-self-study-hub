import assert from 'node:assert/strict';
import test from 'node:test';
import {createPreviewProgress,capturePreview,restorePreview} from '../src/writing/engine/preview-progress.js';

const memory = () => {
  const values=new Map();
  return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
};
const context={appKey:'review_writing',id:'review',curriculumVersion:1};
const task={id:'guided-writing',checkIds:['audience','evidence']};
const activity={id:'choice',type:'choice',items:[
  {id:'first',optionIds:['a','b']},{id:'second',optionIds:['x','y']}
]};
const content={discover:[{id:'contrast'}],models:[{id:'cafe',paragraphIds:['intro','evaluation']}],
  activities:[activity],gold:[task],apply:[task],master:task,challenges:['choice']};
const writing=()=>({draft:'',original:'',revision:'',keepReason:'',checks:new Set()});
const runtime=()=>({discoveryIndex:0,model:0,paragraph:0,goldIndex:0,applyIndex:0,active:null,
  discovered:new Set(),identified:new Set(),discoverNotes:new Map(),exploreDrafts:new Map(),
  attempts:new Map(),gold:[writing()],applications:[writing()],transfer:writing()});

test('checkpoints restore stable activity and workshop state across question and option reordering',()=>{
  const state=runtime();
  state.active='choice';
  state.paragraph=1;
  state.discoverNotes.set(0,'My contrast observation');
  state.discovered.add(0);
  state.exploreDrafts.set('0:1','My editorial reasoning');
  state.identified.add('0:1');
  state.gold[0]={...writing(),draft:'My draft',checks:new Set([1])};
  state.attempts.set('choice',{index:0,done:false,correct:0,selected:1,order:[],checked:false,answered:new Map(),displays:[[1,0],[0,1]]});
  const snapshot=capturePreview(state,content,{stage:'practise',completed:['discover']});
  const reordered={...activity,items:[activity.items[1],{...activity.items[0],optionIds:['b','a']}]};
  const resumed=runtime();
  restorePreview(resumed,{...content,activities:[reordered],gold:[{...task,checkIds:['evidence','audience']}]},snapshot);
  assert.equal(resumed.active,'choice');
  assert.equal(resumed.paragraph,1);
  assert.equal(resumed.discoverNotes.get(0),'My contrast observation');
  assert.equal(resumed.exploreDrafts.get('0:1'),'My editorial reasoning');
  assert.deepEqual([...resumed.identified],['0:1']);
  assert.equal(resumed.gold[0].draft,'My draft');
  assert.deepEqual([...resumed.gold[0].checks],[0]);
  assert.deepEqual(resumed.attempts.get('choice'),{
    index:1,done:false,correct:0,selected:0,order:[],checked:false,answered:new Map(),displays:[[0,1],[0,1]]
  });
});

test('checkpoints are separated by staff account, pathway, genre and curriculum version',()=>{
  const storage=memory();
  const first=createPreviewProgress(storage,'teacher-a',context);
  const snapshot=capturePreview(runtime(),content,{stage:'explore',completed:['discover']});
  assert.equal(first.save('structure',snapshot),true);
  assert.deepEqual(first.load('structure'),snapshot);
  for(const changed of [
    createPreviewProgress(storage,'teacher-b',context),
    createPreviewProgress(storage,'teacher-a',{...context,appKey:'essay_writing'}),
    createPreviewProgress(storage,'teacher-a',{...context,curriculumVersion:2})
  ]) assert.equal(changed.load('structure'),null);
  assert.equal(first.load('exam'),null);
  assert.equal(first.save('structure',{...snapshot,version:2}),false);
  const unavailable=createPreviewProgress(undefined,'teacher-a',context);
  assert.equal(unavailable.load('structure'),null);
  assert.equal(unavailable.save('structure',snapshot),false);
});
