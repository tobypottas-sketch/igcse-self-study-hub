import test from 'node:test';
import assert from 'node:assert/strict';
import {DIAGNOSTIC_BASELINE_GATE_ENABLED,DIAGNOSTIC_ENTRY_STATES,decideVocabularyEntry,canUnlockFromDiagnosticResult} from '../src/vocabulary/diagnostic-entry-gate.js';
import {validateSafeQuestion} from '../src/vocabulary/diagnostic-student.js';
import {scoreProvisionalDiagnostic} from '../supabase/functions/vocabulary-diagnostic/provisional-scoring.js';

const bands=(scores=[0,0,0,0,0],unknown=[0,0,0,0,0])=>Object.fromEntries(
  ['A1','A2','B1','B2','C1'].map((level,i)=>[level,{administered:8,correct:scores[i],unknown:unknown[i]}])
);
const question=()=>({
  sessionId:'session-test',questionId:'item-test',questionVersion:2,position:1,
  stem:'What does the sentence mean?',
  options:'ABCD'.split('').map(id=>({id,text:'Option '+id}))
});

test('rollout stays disabled; gate decision fails closed when explicitly enabled',()=>{
  assert.equal(DIAGNOSTIC_BASELINE_GATE_ENABLED,false);
  assert.equal(decideVocabularyEntry({baselineCompleted:false}),DIAGNOSTIC_ENTRY_STATES.PRACTICE);
  assert.equal(decideVocabularyEntry({enabled:true,statusAvailable:false}),DIAGNOSTIC_ENTRY_STATES.STATUS_ERROR);
  assert.equal(decideVocabularyEntry({enabled:true,baselineCompleted:false}),DIAGNOSTIC_ENTRY_STATES.BASELINE_UNAVAILABLE);
  assert.equal(decideVocabularyEntry({enabled:true,baselineAssignmentId:'assignment-test'}),DIAGNOSTIC_ENTRY_STATES.BASELINE_REQUIRED);
  assert.equal(decideVocabularyEntry({enabled:true,baselineAssignmentId:'assignment-test',baselineSessionState:'interrupted'}),DIAGNOSTIC_ENTRY_STATES.BASELINE_IN_PROGRESS);
  assert.equal(decideVocabularyEntry({enabled:true,baselineCompleted:true}),DIAGNOSTIC_ENTRY_STATES.PRACTICE);
});

test('only an authenticated server-recorded completed baseline can unlock',()=>{
  const baseline={kind:'baseline',state:'completed',serverConfirmed:true,completedAt:'2026-11-16T00:00:00Z'};
  assert.equal(canUnlockFromDiagnosticResult(baseline),true);
  assert.equal(canUnlockFromDiagnosticResult({...baseline,kind:'follow_up'}),false);
  assert.equal(canUnlockFromDiagnosticResult({...baseline,serverConfirmed:false}),false);
  assert.equal(canUnlockFromDiagnosticResult({...baseline,state:'in_progress'}),false);
  assert.equal(canUnlockFromDiagnosticResult({...baseline,completedAt:'not a date'}),false);
});

test('real student player accepts only four key-free choices',()=>{
  assert.deepEqual(validateSafeQuestion(question()),question());
  for(const property of ['correctOptionId','rationale','calibration','levelHypothesis','correct']){
    const input=question();input[property]='secret';
    assert.throws(()=>validateSafeQuestion(input));
  }
  const duplicate=question();duplicate.options[1].id='A';
  assert.throws(()=>validateSafeQuestion(duplicate));
  const optionRationale=question();optionRationale.options[0].rationale='hidden';
  assert.throws(()=>validateSafeQuestion(optionRationale));
});

test('provisional placement requires the complete balanced 40-question form',()=>{
  assert.equal(scoreProvisionalDiagnostic(bands([6,6,6,6,6]),39),null);
  const missing=bands([6,6,6,6,6]);delete missing.B2;
  assert.equal(scoreProvisionalDiagnostic(missing,40),null);
  const distorted=bands([6,6,6,6,6]);distorted.A1.administered=7;
  assert.equal(scoreProvisionalDiagnostic(distorted,40),null);
  const bad=bands([8,8,8,8,8]);bad.C1.unknown=1;
  assert.equal(scoreProvisionalDiagnostic(bad,40),null);
});

test('conservative placement respects lower-band foundations',()=>{
  assert.equal(scoreProvisionalDiagnostic(bands([0,0,0,0,0]),40).provisionalLevel,'A1');
  assert.equal(scoreProvisionalDiagnostic(bands([6,6,6,6,6]),40).provisionalLevel,'C1');
  assert.equal(scoreProvisionalDiagnostic(bands([5,5,6,8,8]),40).provisionalLevel,'C1');
  assert.equal(scoreProvisionalDiagnostic(bands([4,8,8,8,8]),40).provisionalLevel,'A1');
  assert.equal(scoreProvisionalDiagnostic(bands([6,6,4,8,8]),40).provisionalLevel,'A2');
  assert.equal(scoreProvisionalDiagnostic(bands([6,6,6,6,6],[0,0,0,0,2]),40).scoreStatus,'provisional');
});

test('placement warns about high unsure counts, not a certified CEFR claim',()=>{
  const result=scoreProvisionalDiagnostic(bands([5,5,5,5,5],[2,2,2,2,2]),40);
  assert.equal(result.scoreStatus,'provisional');
  assert.equal(result.provisional,true);
  assert.match(result.caution,/extra care/i);
  assert.ok(['A1','A2','B1','B2','C1'].includes(result.provisionalLevel));
});
