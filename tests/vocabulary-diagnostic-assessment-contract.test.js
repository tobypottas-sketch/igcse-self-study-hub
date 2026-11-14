import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertDiagnosticTransition,nextDiagnosticDueAt,toStudentDiagnosticQuestion,
  validateDiagnosticResponse,summarisePilotDiagnostic,shouldOfferFollowup
} from '../tools/diagnostic/assessment-contract.js';

const privateItem={
  itemId:'diag-example-001',version:2,stem:'In this context, what does the underlined word mean?',
  correctOptionId:'B',levelHypothesis:'B1',lemma:'private-target',
  source:{rightsStatus:'author_owned',origin:'original'},
  review:{status:'pilot',languageReviewerId:'x'},
  calibration:{difficulty:0.8},
  options:[
    {id:'A',text:'First alternative',rationale:'Do not disclose rationale A'},
    {id:'B',text:'Second alternative',rationale:'Do not disclose rationale B'},
    {id:'C',text:'Third alternative',rationale:'Do not disclose rationale C'},
    {id:'D',text:'Fourth alternative',rationale:'Do not disclose rationale D'}
  ]
};
test('student payload is an explicit whitelist: no answer key, CEFR tag or rationales',()=>{
  const p=toStudentDiagnosticQuestion(privateItem,{sessionId:'student-session',position:1,optionOrder:['C','A','D','B']});
  assert.deepEqual(Object.keys(p),['sessionId','questionId','questionVersion','position','stem','options','allowUnknown']);
  assert.deepEqual(p.options.map(x=>x.id),['C','A','D','B']);
  assert.deepEqual(Object.keys(p.options[0]),['id','text']);
  for(const leak of ['correctOptionId','rationale','calibration','levelHypothesis','lemma','source','review']){
    assert.equal(JSON.stringify(p).includes(leak),false,leak);
  }
});
test('option-order input must be exactly four distinct private option IDs',()=>{
  for(const order of [['A','A','C','D'],['A','B','C'],['A','B','C','Z']])
    assert.throws(()=>toStudentDiagnosticQuestion(privateItem,{sessionId:'s1',position:1,optionOrder:order}),/permutation/);
});
test('session lifecycle is strict, with no completed-session resets',()=>{
  assert.deepEqual(assertDiagnosticTransition('assigned','in_progress'),{from:'assigned',to:'in_progress'});
  assert.deepEqual(assertDiagnosticTransition('in_progress','interrupted'),{from:'in_progress',to:'interrupted'});
  assert.deepEqual(assertDiagnosticTransition('interrupted','in_progress'),{from:'interrupted',to:'in_progress'});
  assert.deepEqual(assertDiagnosticTransition('in_progress','completed'),{from:'in_progress',to:'completed'});
  assert.throws(()=>assertDiagnosticTransition('completed','in_progress'),/Invalid/);
  assert.throws(()=>assertDiagnosticTransition('assigned','completed'),/Invalid/);
});
test('valid and unknown answers are accepted only in current session order',()=>{
  const session={id:'s-1',state:'in_progress',nextPosition:3};
  const request={sessionId:'s-1',questionId:privateItem.itemId,questionVersion:2,position:3,requestId:'r1',answerId:'A'};
  const opts={session,question:privateItem,answeredIds:[],submittedRequestIds:[]};
  assert.deepEqual(validateDiagnosticResponse(request,opts),{status:'accepted',scoreNow:true,answerId:'A'});
  assert.equal(validateDiagnosticResponse({...request,answerId:'unknown'},opts).answerId,'unknown');
});
test('rejects wrong-session, future-position, manipulated and repeated responses',()=>{
  const session={id:'s-1',state:'in_progress',nextPosition:3};
  const request={sessionId:'s-1',questionId:privateItem.itemId,questionVersion:2,position:3,requestId:'r1',answerId:'A'};
  const o={session,question:privateItem};
  assert.throws(()=>validateDiagnosticResponse({...request,sessionId:'other'},o),/does not match/);
  assert.throws(()=>validateDiagnosticResponse({...request,position:4},o),/out of sequence/);
  assert.throws(()=>validateDiagnosticResponse({...request,answerId:'correct'},o),/Invalid answer/);
  assert.throws(()=>validateDiagnosticResponse(request,{...o,answeredIds:[privateItem.itemId+'@2']}),/already been answered/);
  assert.deepEqual(validateDiagnosticResponse(request,{...o,submittedRequestIds:['r1']}),{status:'duplicate_request',scoreNow:false});
});
test('never accepts late answers after completed/expired sessions',()=>{
  const r={sessionId:'s',questionId:privateItem.itemId,questionVersion:2,position:1,requestId:'x',answerId:'B'};
  for(const state of ['completed','expired','interrupted','void']){
    assert.throws(()=>validateDiagnosticResponse(r,{session:{id:'s',state,nextPosition:1},question:privateItem}),/not in progress/);
  }
});
test('pilot scoring reports evidence and explicitly withholds CEFR level estimate',()=>{
  const out=summarisePilotDiagnostic({sessionId:'s',adjudicatedResponses:[
    {levelHypothesis:'A2',correct:true,answerId:'A'},
    {levelHypothesis:'B1',correct:false,answerId:'unknown'},
    {levelHypothesis:'B1',correct:false,answerId:'C'},
    {levelHypothesis:'B2',correct:true,answerId:'D'}
  ]});
  assert.equal(out.scoreStatus,'uncalibrated');
  assert.equal(out.levelEstimate,null);
  assert.equal(out.total,4);
  assert.equal(out.correct,2);
  assert.equal(out.incorrect,1);
  assert.equal(out.unknown,1);
  assert.deepEqual(out.coverage.B1,{administered:2,correct:0,unknown:1});
});
test('cannot calculate scoring from a client percentage or non-adjudicated responses',()=>{
  assert.throws(()=>summarisePilotDiagnostic({sessionId:'s',adjudicatedResponses:[{levelHypothesis:'B1',answerId:'A'}]}),/independently adjudicated/);
});
test('follow-up is due after 56 days only with permission and no open session',()=>{
  const completed='2026-01-01T00:00:00Z',now='2026-02-26T00:00:00Z';
  assert.equal(nextDiagnosticDueAt(completed),'2026-02-26T00:00:00.000Z');
  const args={baselineCompletedAt:completed,lastCompletedAt:completed,now,assigned:true};
  assert.equal(shouldOfferFollowup(args),true);
  assert.equal(shouldOfferFollowup({...args,assigned:false}),false);
  assert.equal(shouldOfferFollowup({...args,hasOpenSession:true}),false);
  assert.equal(shouldOfferFollowup({...args,now:'2026-02-25T23:59:59Z'}),false);
});
test('calendar intervals and timestamps are bounded',()=>{
  assert.throws(()=>nextDiagnosticDueAt('bad date'),/timestamp/);
  assert.throws(()=>nextDiagnosticDueAt('2026-01-01T00:00:00Z',3),/between 28 and 365/);
});
