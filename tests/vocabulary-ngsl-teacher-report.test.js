import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderNGSLClassReport} from '../src/vocabulary/ngsl-teacher-results.js';

function rootStub(){
 const controls=new Map();
 return {
  innerHTML:'',
  querySelector(selector){
   if(!controls.has(selector))controls.set(selector,{
    value:'',addEventListener(){},focus(){},setSelectionRange(){}
   });
   return controls.get(selector);
  },
  querySelectorAll(){return [];}
 };
}
function fixture(){
 const ids=['a','b','c'];
 return {
  classes:[{id:'class-1',className:'Grade 11',students:ids.map(id=>({id}))}],
  names:new Map(ids.map((id,i)=>[id,['Low score','High score','Working student'][i]])),
  results:new Map([
   ['a',{correct:8,total:50,bandScores:{'1':{correct:2}},completedAt:'2026-11-19T02:00:00Z'}],
   ['b',{correct:49,total:50,bandScores:{'1':{correct:10}},completedAt:'2026-11-19T03:00:00Z'}]
  ]),
  sessions:new Map([['c',{state:'in_progress',answered:16}]]),
  sessionsAvailable:true,integrity:new Map(),integrityAvailable:true
 };
}
test('NGSL report uses saved session status and does not treat progress as not started',()=>{
 const root=rootStub();
 renderNGSLClassReport(root,fixture(),'class-1');
 assert.match(root.innerHTML,/1 in progress/);
 assert.match(root.innerHTML,/In progress/);
 assert.match(root.innerHTML,/Refresh results/);
 assert.match(root.innerHTML,/Export CSV/);
 assert.match(root.innerHTML,/Score distribution/);
 assert.match(root.innerHTML,/not a CEFR placement test/);
 assert.ok(root.innerHTML.indexOf('Low score')<root.innerHTML.indexOf('High score'));
});
test('missing session API cannot be silently interpreted as not started',()=>{
 const root=rootStub(),data=fixture();
 data.sessionsAvailable=false;
 renderNGSLClassReport(root,data,'class-1');
 assert.match(root.innerHTML,/Status unavailable/);
 assert.match(root.innerHTML,/1 unverified/);
});
test('session report is restricted and no diagnostic answers are exposed',()=>{
 const edge=readFileSync(new URL('../supabase/functions/vocabulary-diagnostic/index.ts',import.meta.url),'utf8');
 const sql=readFileSync(new URL('../supabase/diagnostic/ngsl_teacher_session_report.sql',import.meta.url),'utf8');
 assert.match(edge,/ngsl-session-report/);
 assert.match(sql,/student_class_memberships/);
 assert.match(sql,/teacher_classes/);
 assert.match(sql,/revoke all on function public.vocabulary_ngsl_session_report/);
 assert.doesNotMatch(sql,/correct_answer|selected_letter|question_order/);
});
