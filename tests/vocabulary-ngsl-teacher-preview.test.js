import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateTeacherFormPreview} from '../src/vocabulary/diagnostic-teacher-walkthrough.js';

const make=(count=50)=>({form:'A',total:count,questions:Array.from({length:count},(_,i)=>({
 position:i+1,target:'target',stem:'The target word occurs in a sentence.',
 options:'ABCD'.split('').map(id=>({id,text:'Meaning '+id}))
}))});
test('NGSL teacher preview accepts exactly 50 safe questions',()=>{
 assert.equal(validateTeacherFormPreview(make()).length,50);
 assert.throws(()=>validateTeacherFormPreview(make(40)),/incomplete/);
 assert.throws(()=>validateTeacherFormPreview({...make(),form:'B'}),/incomplete/);
});
test('NGSL teacher preview rejects leaked keys, malformed or unordered questions',()=>{
 const a=make();a.questions[9].correctOptionId='A';
 assert.throws(()=>validateTeacherFormPreview(a),/unsafe/);
 const b=make();b.questions[20].options[3].correct=true;
 assert.throws(()=>validateTeacherFormPreview(b),/unsafe/);
 const c=make();c.questions[9].position=9;
 assert.throws(()=>validateTeacherFormPreview(c),/unsafe/);
});
test('old previews and CEFR calls are absent from the teacher-facing endpoint',()=>{
 const client=readFileSync(new URL('../src/vocabulary/diagnostic-teacher-walkthrough.js',import.meta.url),'utf8');
 const edge=readFileSync(new URL('../supabase/functions/vocabulary-diagnostic/index.ts',import.meta.url),'utf8');
 assert.match(client,/ngsl-form-preview/);
 assert.match(edge,/vocabulary_ngsl_teacher_form_preview/);
 assert.doesNotMatch(client,/review-form-preview|legacy|Form B|startSample|diagnostic-student/);
 assert.doesNotMatch(edge,/vocabulary_diagnostic_api|scoreProvisionalDiagnostic|review-form-worklist/);
});
