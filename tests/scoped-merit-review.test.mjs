import test from 'node:test';
import assert from 'node:assert/strict';
import { awardReviewedMerit, loadMeritReview, reconcileMeritSnapshot } from '../src/admin/merit-review.js';
import { createMeritReview } from '../supabase/functions/merit-review/review.js';

test('one narrow request per opening or award and confirmation must be authoritative',async()=>{
  const calls=[];
  const client={functions:{invoke:async (name,options)=>{
    calls.push([name,options.body]);
    return {data:options.body.action==='award'?{highestAwarded:2,recorded:true,awardedCount:2}:{students:[],pendingMerits:0}};
  }}};
  await loadMeritReview(client);
  assert.deepEqual(await awardReviewedMerit(client,{scope:'all',studentId:'s',number:2}),{highestAwarded:2,recorded:true,awardedCount:2});
  assert.deepEqual(calls,[
    ['merit-review',{action:'list',scope:'mine'}],
    ['merit-review',{action:'award',scope:'all',studentId:'s',number:2}]
  ]);
  await assert.rejects(awardReviewedMerit({functions:{invoke:async()=>({data:null})}},{scope:'mine',studentId:'s',number:1}),/could not be confirmed/);
});

test('expired session and failed writes remain distinguishable from a confirmation',async()=>{
  for(const status of [401,403,409,503]){
    const client={functions:{invoke:async()=>({error:{context:new Response('{"error":"Rejected"}',{status})}})}};
    await assert.rejects(awardReviewedMerit(client,{scope:'mine',studentId:'s',number:1}),{status,message:'Rejected'});
  }
});

test('confirmed high-water mark removes only affected pending merits and recomputes the badge',()=>{
  const snapshot={assignedClassCount:1,pendingMerits:5,students:[
    {studentId:'a',pendingMerits:3,pendingMeritNumbers:[1,2,3]},
    {studentId:'b',pendingMerits:2,pendingMeritNumbers:[1,2]}
  ]};
  assert.deepEqual(reconcileMeritSnapshot(snapshot,'a',2),{...snapshot,pendingMerits:3,students:[
    {studentId:'a',pendingMerits:1,pendingMeritNumbers:[3]},snapshot.students[1]
  ]});
  assert.equal(snapshot.pendingMerits,5);
});

test('the review uses revised thresholds, persisted mastery bonuses and historical award numbers',async()=>{
  let coldCalls=0;
  const occurrence={occurrenceId:'target',unitNumber:1,vocabularyId:'word'};
  const coverageByUnit={1:{meaning:{available:true,occurrenceIds:['target']}}};
  const service=createMeritReview({prepare:()=>({occurrences:[occurrence],coverageByUnit})});
  const passed=Array.from({length:8},(_,i)=>({
    student_id:'s',unit_number:1,pathway_id:'meaning',pathway_stage:'recognise',
    set_number:i+1,mission_kind:'pathway',outcome:'pass',completed_at:'2026-11-28T00:00:00Z'
  }));
  const mastery=[{studentId:'s',occurrenceId:'target',contextualEvidence:{
    pathway_progress:{meaning:{completed_stages:['recognise','match','apply','recall','mastery']}}
  }}];
  const inputs=async cold=>{
    if(cold)coldCalls++;
    return {students:[{id:'s',display_name:'Synthetic',class_name:'Class A'}],assignedClassCount:1,
      catalogue:cold?{}:null,mastery,missions:[...passed,passed[0]],awards:[{student_id:'s',merit_number:2}]};
  };
  assert.deepEqual((await service({inputs})).snapshot.students[0].pendingMeritNumbers,[3]);
  const revoked=await service({inputs:async()=>({...await inputs(false),students:[]})});
  assert.equal(revoked.snapshot.pendingMerits,0);
  assert.equal(coldCalls,1);
});
