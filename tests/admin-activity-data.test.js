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
      if (name === 'classes') return occurrenceQuery();
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
