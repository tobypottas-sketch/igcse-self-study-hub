import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateTeacherFormPreview} from '../src/vocabulary/diagnostic-teacher-walkthrough.js';

const make=(form,total)=>({
 form,total,
 questions:Array.from({length:total},(_,index)=>({
   position:index+1,stem:'The target word is used in an ordinary sentence.',
   options:['A','B','C','D'].map(id=>({id,text:'Definition '+id+' for this question'}))
 }))
});

test('legacy preview remains 40-question and NGSL accepts complete 50-question forms',()=>{
 assert.equal(validateTeacherFormPreview(make('A',40),'A').length,40);
 assert.equal(validateTeacherFormPreview(make('B',50),'B',50).length,50);
 assert.throws(()=>validateTeacherFormPreview(make('B',50),'B'),/incomplete/);
 assert.throws(()=>validateTeacherFormPreview(make('A',40),'A',50),/incomplete/);
});
test('fails closed on keys or answer metadata anywhere in question options',()=>{
 const data=make('A',50);
 data.questions[19].correctOptionId='answer';
 assert.throws(()=>validateTeacherFormPreview(data,'A',50),/not safe/);
 const nested=make('A',50);
 nested.questions[29].options[1].correct=true;
 assert.throws(()=>validateTeacherFormPreview(nested,'A',50),/not safe/);
});
test('rejects incomplete, duplicated, unordered and malformed questions',()=>{
 const cut=make('B',50);cut.questions.pop();
 assert.throws(()=>validateTeacherFormPreview(cut,'B',50));
 const moved=make('B',50);moved.questions[7].position=6;
 assert.throws(()=>validateTeacherFormPreview(moved,'B',50));
 const blank=make('B',50);blank.questions[13].options[2].text=' ';
 assert.throws(()=>validateTeacherFormPreview(blank,'B',50));
});
test('teacher preview selects a distinct authenticated NGSL endpoint',()=>{
 const client=readFileSync(new URL('../src/vocabulary/diagnostic-teacher-walkthrough.js',import.meta.url),'utf8');
 const edge=readFileSync(new URL('../supabase/functions/vocabulary-diagnostic/index.ts',import.meta.url),'utf8');
 assert.match(client,/ngsl-form-preview/);
 assert.match(client,/NGSL diagnostic/);
 assert.match(client,/questions\.length-1/);
 assert.match(edge,/vocabulary_ngsl_teacher_form_preview/);
 assert.match(edge,/isNGSLPreviewRequest/);
 assert.doesNotMatch(client,/position<39/);
});
