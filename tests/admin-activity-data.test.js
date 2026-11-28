import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTeacherActivityData, studentNumberFromEmail } from '../src/admin/activity-data.js';

function occurrenceQuery() {
  const result = { data:[], error:null };
  const query = {
    select() { return query; },
    eq() { return query; },
    in() { return query; },
    is() { return query; },
    gte() { return query; },
    lte() { return query; },
    lt() { return query; },
    order() { return query; },
    range() { return Promise.resolve(result); },
    then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); }
  };
  return query;
}

test('teacher Activity rows are loaded across Supabase RPC pages', async () => {
  const firstPage = Array.from({ length:1000 }, (_, index) => ({
    record_type:'student',
    payload:{ student_id:`student-${index}`, display_name:`Student ${index}`, class_id:'class-1', class_name:'Class 1' }
  }));
  const secondPage = [{
    record_type:'student',
    payload:{ student_id:'student-1000', display_name:'Student 1000', class_id:'class-1', class_name:'Class 1' }
  }];
  const ranges = [];
  const client = {
    rpc(name) {
      assert.equal(name, 'teacher_activity_rows');
      return {
        in() { return this; },
        order() { return this; },
        async range(start, end) {
          ranges.push([start, end]);
          return { data:start === 0 ? firstPage : secondPage, error:null };
        }
      };
    },
    from(name) {
      if (name === 'classes') return occurrenceQuery();
      if (name === 'profiles') return { select(columns) {
        assert.equal(columns,'id, school_email');
        return { async in(column, ids) {
          assert.equal(column,'id');
          assert.ok(ids.length <= 100);
          return {data:ids.includes('student-1000') ? [{id:'student-1000',school_email:'0001205@example.com'},{id:'outside-roster',school_email:'9999@example.com'}] : [],error:null};
        }};
      }};
      return occurrenceQuery();
    }
  };

  const dashboard = await loadTeacherActivityData(client, { now:new Date('2026-10-27T12:00:00Z') });

  assert.equal(dashboard.students.length, 1001);
  assert.equal(dashboard.students.find(s=>s.studentId==='student-1000').studentNumber,'1205');
  assert.equal(dashboard.students[0].studentNumber,null);
  assert.equal(dashboard.students.some(s=>Object.hasOwn(s,'school_email')),false);
  assert.deepEqual(ranges, [[0,999],[1000,1999]]);
});

 test('school student number strips leading zeros only and rejects nonnumeric usernames', () => {
  assert.equal(studentNumberFromEmail('0001205@example.com'),'1205');
  assert.equal(studentNumberFromEmail('0009080@example.com'),'9080');
  assert.equal(studentNumberFromEmail('123@example.com'),'123');
  assert.equal(studentNumberFromEmail('teacher12@example.com'),null);
  assert.equal(studentNumberFromEmail(null),null);
});

test('merit-only refresh uses scoped RPC with no activity logs, unit checks or email lookups', async () => {
  const filters = [];
  const client = {
    rpc(name) {
      assert.equal(name,'teacher_activity_rows');
      return { in(column, values) {
        filters.push([column,values]);
        return { order() { return this; }, async range() { return {data:[{record_type:'student',payload:{student_id:'s1',display_name:'Student',class_id:'c1',class_name:'Class 1'}}],error:null}; } };
      }};
    },
    from(name) {
      if (name === 'classes'||name==='vocabulary_missions') return occurrenceQuery();
      assert.equal(name,'vocabulary_unit_occurrences');
      return occurrenceQuery();
    }
  };
  assert.deepEqual(await loadTeacherActivityData(client,{meritOnly:true}),{students:[],pendingMerits:0});
  assert.deepEqual(filters,[['record_type',['student','vocabulary_global_mastery','vocabulary_unit_mastery','merit_award']]]);
});

test('merit refresh preserves an access denial for the session-revocation handler', async () => {
  const query = occurrenceQuery();
  const denied = {in(){return this;},order(){return this;},async range(){
    return {error:{code:'42501',message:'not authorised'},status:403};
  }};
  await assert.rejects(loadTeacherActivityData({rpc:()=>denied,from:()=>query},{meritOnly:true}),
    {code:'42501',status:403});
});

test('usage is emitted before mastery reads and permission remains server scoped',async()=>{const calls=[];let ready=false;const client={rpc(name){assert.equal(name,'teacher_activity_rows');let types;return {in(_column,v){types=v;return this},order(){return this},async range(){calls.push(types);if(types.includes('vocabulary_global_mastery'))assert.equal(ready,true);return {data:types.includes('student')?[{record_type:'student',payload:{student_id:'s1',display_name:'Student',class_id:'c1',class_name:'Class 1'}}]:[],error:null}}}},from(){return occurrenceQuery()}};const snapshot=await loadTeacherActivityData(client,{selectedPeriod:{start:0,end:1000,asOf:999},onUsageReady:partial=>{ready=true;assert.equal(partial.detailsPending,true);assert.equal(partial.students[0].pendingMerits,null);assert.equal(partial.students[0].awardedMerits,0);assert.deepEqual(calls,[['student','unit_check','merit_award']]);}});assert.equal(snapshot.students[0].pendingMerits,0);assert.equal(calls.length,2)});
test('navigation cancellation prevents detailed mastery request',async()=>{let calls=0;const client={rpc(){return {in(){return this},order(){return this},async range(){calls++;return {data:[],error:null}}}},from(){return occurrenceQuery()}};assert.equal(await loadTeacherActivityData(client,{selectedPeriod:{start:0,end:1000,asOf:999},onUsageReady:()=>false}),null);assert.equal(calls,1)});

test('historical qualifying missions appear in merit alerts, already awarded numbers disappear',async()=>{let awarded=false;const student={record_type:'student',payload:{student_id:'s1',display_name:'Fixture',class_id:'c1',class_name:'Class 1'}};const missions=['recognise','match','apply','recognise'].map((stage,i)=>({mission_id:String(i),student_id:'s1',unit_number:4,mission_kind:'pathway',pathway_id:'meaning',pathway_stage:stage,set_number:1,outcome:'pass',completed_at:'2026-11-13T00:00:00Z'}));const client={rpc(){return {in(){return this},order(){return this},async range(){return {data:[student,...(awarded?[{record_type:'merit_award',payload:{student_id:'s1',merit_number:1}}]:[])],error:null}}}},from(name){if(name==='vocabulary_missions')return {select(){return this},in(){return this},order(){return this},async range(){return {data:missions,error:null,count:4}}};return occurrenceQuery()}};let r=await loadTeacherActivityData(client,{meritOnly:true});assert.equal(r.pendingMerits,1);assert.deepEqual(r.students[0].pendingMeritNumbers,[1]);awarded=true;r=await loadTeacherActivityData(client,{meritOnly:true});assert.equal(r.pendingMerits,0)});
