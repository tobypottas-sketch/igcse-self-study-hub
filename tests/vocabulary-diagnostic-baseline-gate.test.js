import test from 'node:test';
import assert from 'node:assert/strict';
import {
 DIAGNOSTIC_BASELINE_GATE_ENABLED,
 DIAGNOSTIC_ENTRY_STATES,
 decideVocabularyEntry,
 initialDiagnosticType,
 canUnlockFromDiagnosticResult
} from '../src/vocabulary/diagnostic-entry-gate.js';

test('gate is disabled until diagnostic and server enforcement are launch-ready',()=>{
 assert.equal(DIAGNOSTIC_BASELINE_GATE_ENABLED,false);
 assert.equal(decideVocabularyEntry({baselineCompleted:false}),DIAGNOSTIC_ENTRY_STATES.PRACTICE);
});
test('new and returning students need a completed baseline when enabled',()=>{
 for(const existing of [false,true]){
  assert.equal(decideVocabularyEntry({enabled:true,baselineCompleted:false,baselineAssignmentId:'id',hasAnyExistingTraining:existing}),DIAGNOSTIC_ENTRY_STATES.BASELINE_REQUIRED);
 }
});
test('completed server-confirmed baseline unlocks practice, regardless of prior learning',()=>{
 assert.equal(decideVocabularyEntry({enabled:true,baselineCompleted:true}),DIAGNOSTIC_ENTRY_STATES.PRACTICE);
 assert.equal(canUnlockFromDiagnosticResult({kind:'baseline',state:'completed',serverConfirmed:true,completedAt:'2026-11-14T00:00:00Z'}),true);
});
test('learning data, unit checks and fake client completion cannot unlock',()=>{
 assert.equal(decideVocabularyEntry({enabled:true,baselineCompleted:false,masteredCount:350,unitChecks:10}),DIAGNOSTIC_ENTRY_STATES.BASELINE_UNAVAILABLE);
 assert.equal(canUnlockFromDiagnosticResult({kind:'baseline',state:'completed',serverConfirmed:false,completedAt:'2026-11-14T00:00:00Z'}),false);
 assert.equal(canUnlockFromDiagnosticResult({kind:'follow_up',state:'completed',serverConfirmed:true,completedAt:'2026-11-14T00:00:00Z'}),false);
});
test('resume an in-progress or interrupted baseline',()=>{
 for(const baselineSessionState of ['in_progress','interrupted']){
  assert.equal(decideVocabularyEntry({enabled:true,baselineSessionState,baselineCompleted:false}),DIAGNOSTIC_ENTRY_STATES.BASELINE_IN_PROGRESS);
 }
});
test('unknown baseline and unavailable status fail closed if gate enabled',()=>{
 assert.equal(decideVocabularyEntry({enabled:true,statusAvailable:false}),DIAGNOSTIC_ENTRY_STATES.STATUS_ERROR);
 assert.equal(decideVocabularyEntry({enabled:true,baselineCompleted:false}),DIAGNOSTIC_ENTRY_STATES.BASELINE_UNAVAILABLE);
});
test('teacher and student preview bypass only student onboarding gate',()=>{
 assert.equal(decideVocabularyEntry({enabled:true,student:false}),DIAGNOSTIC_ENTRY_STATES.PRACTICE);
});
test('existing student receives correct baseline timing label',()=>{
 assert.equal(initialDiagnosticType({hasAnyExistingTraining:true}),'first_diagnostic_after_training');
 assert.equal(initialDiagnosticType({hasAnyExistingTraining:false}),'first_diagnostic_before_training');
});
