import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateSafeQuestion,diagnosticErrorMessage} from '../src/vocabulary/diagnostic-student.js';
import {DIAGNOSTIC_BASELINE_GATE_ENABLED,decideVocabularyEntry,DIAGNOSTIC_ENTRY_STATES} from '../src/vocabulary/diagnostic-entry-gate.js';

const sample={
 sessionId:'session-1',questionId:'diagnostic-001',questionVersion:1,
 position:1,stem:'What does this word mean?',
 options:[{id:'C',text:'Choice three'},{id:'A',text:'Choice one'},
 {id:'B',text:'Choice two'},{id:'D',text:'Choice four'}],allowUnknown:true
};

test('only keyed-answer-free questions reach student player',()=>{
 assert.equal(validateSafeQuestion(sample),sample);
 for(const field of ['correctOptionId','levelHypothesis','correct','calibration','rationale']){
  assert.throws(()=>validateSafeQuestion({...sample,[field]:'secret'}),/Invalid question/);
 }
 assert.throws(()=>validateSafeQuestion({...sample,options:[...sample.options.slice(0,3),{id:'C',text:'Duplicate'}]}),/Invalid question/);
 assert.throws(()=>validateSafeQuestion({...sample,options:sample.options.map((x,i)=>i===0?{...x,rationale:'Correct'}:x)}),/Invalid question/);
});
test('student diagnostic remains non-mandatory until explicit safe activation',()=>{
 assert.equal(DIAGNOSTIC_BASELINE_GATE_ENABLED,false);
 assert.equal(decideVocabularyEntry({baselineCompleted:false}),DIAGNOSTIC_ENTRY_STATES.PRACTICE);
 assert.equal(decideVocabularyEntry({enabled:true,baselineCompleted:false,baselineAssignmentId:'id'}),DIAGNOSTIC_ENTRY_STATES.BASELINE_REQUIRED);
});
test('student answers use server request IDs and do not receive correctness feedback',()=>{
 const source=readFileSync(new URL('../src/vocabulary/diagnostic-student.js',import.meta.url),'utf8');
 assert.match(source,/crypto\.randomUUID\(\)/);
 assert.match(source,/if\(!state\.request\)state\.request=/);
 assert.match(source,/answerId:state\.answer/);
 assert.match(source,/if\(data\.state==='completed'\)/);
 assert.doesNotMatch(source,/answer\.correct|data\.correctOptionId|levelEstimate\s*=/);
});
test('review is not mistaken for a validated CEFR level',()=>{
 const source=readFileSync(new URL('../src/vocabulary/diagnostic-student.js',import.meta.url),'utf8');
 assert.match(source,/initial learning placement, not a certified CEFR result/i);
 assert.match(source,/I’m not sure/);
});
test('diagnostic error messages do not leak backend details',()=>{
 assert.match(diagnosticErrorMessage('ASSIGNMENT_UNAVAILABLE'),/teacher/i);
 assert.doesNotMatch(diagnosticErrorMessage('UNEXPECTED_QUERY_ERROR'),/UNEXPECTED_QUERY_ERROR/);
});
test('option badges follow on-screen order while the server option id is submitted',()=>{
 const source=readFileSync(new URL('../src/vocabulary/diagnostic-student.js',import.meta.url),'utf8');
 assert.match(source,/q\.options\.map\(\(o,i\)=>/);
 assert.match(source,/diag-option-key" aria-hidden="true">'\+'ABCD'\[i\]/);
 assert.match(source,/value="'\+esc\(o\.id\)\+'"/);
});
test('baseline status exposes the fields the router needs and ignores follow-ups',()=>{
 const sql=readFileSync(new URL('../supabase/diagnostic/pilot_api.sql',import.meta.url),'utf8');
 const status=sql.slice(sql.indexOf("p_action='status'"),sql.indexOf("p_action='start'"));
 for(const key of ['baselineCompleted','baselineSessionState','baselineAssignmentId','baselineSessionId'])assert.match(status,new RegExp("'"+key+"'"));
 assert.match(status,/student_id=p_actor and kind='baseline'/);
 assert.match(status,/a\.kind='baseline'/);
 const router=readFileSync(new URL('../src/vocabulary/router.js',import.meta.url),'utf8');
 assert.match(router,/typeof data\.baselineCompleted==='boolean'/);
});

test('the not-certified disclaimer is always shown, alongside any extra-care caution',()=>{
  const source=readFileSync(new URL('../src/vocabulary/diagnostic-student.js',import.meta.url),'utf8');
  assert.doesNotMatch(source,/result\.caution\|\|/);
  assert.match(source,/'<p class="diag-placement__caution">'\+NOT_CERTIFIED\+'<\/p>'/);
});
