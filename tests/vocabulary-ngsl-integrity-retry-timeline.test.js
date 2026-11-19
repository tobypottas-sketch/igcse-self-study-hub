import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createIntegrityQueue} from '../src/vocabulary/ngsl-integrity-queue.js';
import {renderNGSLClassReport} from '../src/vocabulary/ngsl-teacher-results.js';
const sessionId='12345678-1234-4234-8234-123456789abc';
const makeStorage=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k),data}};
test('offline focus events retain their original id and retry without duplicate records',async()=>{
 const storage=makeStorage(),sent=[];let connected=false;
 const a=createIntegrityQueue({sessionId,storage,online:()=>connected,send:async x=>{sent.push(x);return {ok:true}}});
 a.enqueue('tab_hidden',14);
 assert.equal(a.pendingCount,1);
 assert.equal(await a.flush(),false);
 const previous=JSON.parse(storage.getItem('ngsl-integrity-'+sessionId))[0];
 a.dispose();
 const b=createIntegrityQueue({sessionId,storage,online:()=>connected,send:async x=>{sent.push(x);return {ok:true}}});
 connected=true;assert.equal(await b.flush(),true);
 assert.equal(sent.length,1);
 assert.equal(sent[0].eventId,previous.eventId);
 assert.equal(b.pendingCount,0);
 assert.equal(storage.getItem('ngsl-integrity-'+sessionId),null);
});
test('request errors do not destroy a queued event',async()=>{
 const storage=makeStorage();let attempt=0;
 const queue=createIntegrityQueue({sessionId,storage,send:async()=>{
  if(++attempt===1)throw new Error('offline');
  return {ok:true};
 }});
 queue.enqueue('fullscreen_exit',20);
 assert.equal(await queue.flush(),false);
 assert.equal(queue.pendingCount,1);
 assert.equal(await queue.flush(),true);
 assert.equal(attempt,2);
});
test('retry queue refuses malformed and large event payloads',async()=>{
 const storage=makeStorage(),queue=createIntegrityQueue({sessionId,storage,send:async()=>({ok:true})});
 queue.enqueue('answer',1);
 queue.enqueue('tab_hidden',0);
 for(let i=0;i<110;i++)queue.enqueue('tab_hidden',1);
 assert.equal(queue.pendingCount,80);
 const saved=JSON.parse(storage.getItem('ngsl-integrity-'+sessionId));
 assert.equal(saved.length,80);
 assert.ok(saved.every(x=>!('answerId' in x)&&!('stem' in x)&&!('score' in x)));
});
test('teacher can review a valid timeline in a dialog without rendering unsafe student names',()=>{
 const id='12345678-1234-4234-8234-123456789abc';
 const dataset={classes:[{id:'class-a',className:'A',students:[{id}]}],
  names:new Map([[id,'Student <img>']]),
  results:new Map([[id,{studentId:id,total:50,correct:29}]]),
  integrity:new Map([[id,{focusLosses:2,fullscreenExits:1,timeline:[
   {type:'tab_hidden',position:12,at:'2026-11-18T10:05:00Z'},
   {type:'fullscreen_exit',position:23,at:'2026-11-18T10:08:00Z'}
  ]}]]),integrityAvailable:true,sessionsAvailable:false};
 let reviewClick;
 const controls=new Map();
 const root={innerHTML:'',append(dialog){this.dialog=dialog;},querySelector(selector){
  if(!controls.has(selector))controls.set(selector,{value:'',addEventListener(){},focus(){},setSelectionRange(){}});
  return controls.get(selector);
 },querySelectorAll(selector){
  if(selector!=='[data-review-id]')return [];
  return [{dataset:{reviewId:id},addEventListener(type,callback){reviewClick=callback;}}];
 }};
 renderNGSLClassReport(root,dataset,'class-a',false);
 assert.match(root.innerHTML,/data-review-id/);
 assert.doesNotMatch(root.innerHTML,/Student <img>/);
 assert.match(root.innerHTML,/Focus activity/);
 const previousDocument=globalThis.document;
 globalThis.document={createElement(){
  return {innerHTML:'',className:'',querySelector(){return {addEventListener(){}};},
    addEventListener(){},showModal(){this.opened=true;}};
 }};
 try{
  reviewClick();
  assert.match(root.dialog.innerHTML,/Question 12/);
  assert.match(root.dialog.innerHTML,/Fullscreen exited/);
  assert.doesNotMatch(root.dialog.innerHTML,/Student <img>/);
  assert.equal(root.dialog.opened,true);
 }finally{
  if(previousDocument===undefined)delete globalThis.document;
  else globalThis.document=previousDocument;
 }
});
test('server integrity timeline is teacher-scoped and bounded',()=>{
 const sql=fs.readFileSync(new URL('../supabase/diagnostic/ngsl_integrity_monitor_v2.sql',import.meta.url),'utf8');
 assert.match(sql,/tc\.teacher_id=p_actor/);
 assert.match(sql,/m\.ended_at is null/);
 assert.match(sql,/limit 60/);
 assert.match(sql,/order by item\.occurred_at,item\.id/);
 assert.match(sql,/completed_at<now\(\)-interval '1 hour'/);
 assert.match(sql,/revoke all on function public\.vocabulary_ngsl_integrity_report/);
});
test('student monitoring remains advisory and never changes assessment results',()=>{
 const s=fs.readFileSync(new URL('../src/vocabulary/ngsl-student.js',import.meta.url),'utf8');
 assert.match(s,/createIntegrityQueue/);
 assert.match(s,/setInterval\(\(\)=>\{void integrityQueue\?\.flush\(\)\},12000\)/);
 assert.match(s,/window\.addEventListener\('online',retryIntegrity\)/);
 assert.match(s,/api\('respond',state\.pending\)/);
 assert.doesNotMatch(s,/auto.?disqualify|setTimeout\(.*submit/i);
});
