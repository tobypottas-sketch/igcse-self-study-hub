import test from 'node:test';
import assert from 'node:assert/strict';
import { buildClassOverview } from '../src/reporting/student-progress-overview.js';
import { reportingPeriod } from '../src/reporting/periods.js';
import { summarizeEngagement } from '../src/reporting/engagement.js';
import { renderStudentProgress } from '../src/views/student-progress.js';

const row=(id,cls,days,extra={})=>({studentId:id,classId:cls,className:cls,displayName:id,activeDays:days,practiceState:days===null?'retrieval-failure':days?'recorded':'no-records',pendingMerits:0,learningAreas:days?['reading']:[],...extra});
const data={students:[row('a','G9',2,{pendingMerits:2,activeDateKeys:['2026-11-23','2026-11-24']}),row('b','G9',0),row('c','G10',1,{pendingMerits:1}),row('c','G10',1)]};
const period=reportingPeriod('custom',{now:new Date('2026-11-27T12:00:00Z'),from:'2026-11-23',to:'2026-11-24'});
test('unique roster and class participation',()=>{const m=buildClassOverview(data);assert.equal(m.totals.enrolled,3);assert.equal(m.classes.length,2);assert.equal(m.classes[0].participation,.5);assert.equal(m.totals.pendingMerits,3)});
test('unknown evidence is not inactivity',()=>{assert.equal(buildClassOverview({students:[row('a','G9',1),row('b','G9',null)]}).totals.participation,null);assert.equal(buildClassOverview(null).available,false)});
test('Shanghai dates',()=>{assert.equal(new Date(period.start).toISOString(),'2026-11-22T16:00:00.000Z');assert.equal(new Date(period.end).toISOString(),'2026-11-24T16:00:00.000Z')});
test('transfer and heartbeat exclusion',()=>{const events=[{id:1,appKey:'reading',eventType:'question_attempt',occurredAt:'2026-11-23T00:00:00Z',classId:'old'},{id:2,appKey:'reading',eventType:'question_attempt',occurredAt:'2026-11-24T00:00:00Z',classId:'G9'},{id:3,appKey:'reading',eventType:'active_time',activeSeconds:30,occurredAt:'2026-11-23T08:00:00Z',classId:'G9'}];assert.equal(summarizeEngagement(events,period,{classId:'G9',startedAt:'2026-11-23T06:00:00Z'}).activeDays,1)});
test('overview and student search',()=>{const root={innerHTML:''};renderStudentProgress(root,{snapshot:data,period,kind:'custom',tab:'overview'});assert.match(root.innerHTML,/50%/);renderStudentProgress(root,{snapshot:data,period,kind:'custom',classId:'G9',tab:'students',search:'a'});assert.match(root.innerHTML,/data-student-id="a"/);assert.doesNotMatch(root.innerHTML,/data-student-id="b"/)});
test('module coverage and pending custom period',()=>{const root={innerHTML:''};renderStudentProgress(root,{snapshot:data,period,kind:'custom',classId:'G9',tab:'learning'});assert.equal((root.innerHTML.match(/class="sp-card"/g)||[]).length,7);renderStudentProgress(root,{snapshot:data,kind:'custom',awaitingDates:true});assert.doesNotMatch(root.innerHTML,/50%/);assert.match(root.innerHTML,/Apply dates/)});
