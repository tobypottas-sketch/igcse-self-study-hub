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

test('a revised staff question reopens only that item and keeps other decisions and drafts',()=>{
  const state=runtime();
  state.gold[0].draft='Gold draft';
  state.transfer.draft='Master draft';
  state.attempts.set('choice',{index:2,done:true,correct:2,selected:null,order:[],checked:false,
    answered:new Map([['first',0],['second',0]]),displays:[[1,0],[0,1]]});
  const snapshot=capturePreview(state,content,{stage:'practise',completed:['practise','master']});
  const revised={...activity,items:[{...activity.items[0],version:2,optionIds:['a-v2','b-v2']},activity.items[1]]};
  const resumed=runtime();
  restorePreview(resumed,{...content,activities:[revised]},snapshot);
  const run=resumed.attempts.get('choice');
  assert.equal(run.index,0);
  assert.equal(run.done,false);
  assert.equal(run.checked,false);
  assert.equal(run.selected,null);
  assert.deepEqual(run.answered,new Map([['second',0]]));
  assert.deepEqual(run.displays[1],[0,1]);
  assert.equal(resumed.gold[0].draft,'Gold draft');
  assert.equal(resumed.transfer.draft,'Master draft');
});

test('preview resumes a shuffled choice retry, developing sequence and separate editor note together',()=>{
  const state=runtime();
  const item={id:'order-question',optionIds:['first','second','third'],answer:[0,1,2]};
  const ordering={id:'order-activity',type:'order',items:[item]};
  const checked={id:'checked-item',version:2,optionIds:['a','b','c'],answer:0};
  const preview={...content,activities:[ordering],recognition:[checked]};
  state.recognition=new Map([[checked.id,{version:2,order:['c','b','a'],attempts:['b'],selection:'a'}]]);
  state.attempts.set(ordering.id,{index:0,done:false,correct:0,selected:null,order:[2,0],checked:false,
    answered:new Map(),displays:[[1,2,0]]});
  state.gold[0].editorNote='The second sentence repeats the first.';
  state.gold[0].draft='This is the review draft.';
  const snapshot=capturePreview(state,preview,{stage:'practise',completed:[]});
  const resumed=runtime();
  resumed.recognition=new Map();
  restorePreview(resumed,preview,snapshot);
  assert.deepEqual(resumed.recognition.get(checked.id),state.recognition.get(checked.id));
  assert.deepEqual(resumed.attempts.get(ordering.id).order,[2,0]);
  assert.equal(resumed.gold[0].editorNote,state.gold[0].editorNote);
  assert.equal(resumed.gold[0].draft,state.gold[0].draft);
  const newVersion=runtime();
  newVersion.recognition=new Map();
  restorePreview(newVersion,{...preview,recognition:[{...checked,version:3}]},snapshot);
  assert.deepEqual(newVersion.recognition.get(checked.id).attempts,[]);
  assert.equal(newVersion.recognition.get(checked.id).selection,undefined);
  assert.equal(newVersion.gold[0].draft,state.gold[0].draft);
});

test('legacy quiz credit cannot stand in for new recognition evidence with stable option IDs',()=>{
  const state=runtime();
  state.attempts.set('choice',{index:2,done:true,correct:0,selected:null,order:[],checked:false,
    answered:new Map([['first',0],['second',1]]),displays:[[1,0],[0,1]]});
  const old=capturePreview(state,content,{stage:'practise',completed:['practise']});
  const revised={...activity.items[0],answer:0,version:2,checkedPractice:true};
  const next={...content,recognition:[revised],activities:[{...activity,items:[revised,activity.items[1]]}]};
  const resumed=runtime();
  resumed.recognition=new Map();
  restorePreview(resumed,next,old);
  assert.equal(resumed.attempts.get('choice').done,false);
  assert.deepEqual(resumed.attempts.get('choice').answered,new Map([['second',1]]));
  assert.equal(resumed.recognition.size,0);
});
