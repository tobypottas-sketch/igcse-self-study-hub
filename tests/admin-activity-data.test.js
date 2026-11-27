import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTeacherActivityData, studentNumberFromEmail } from '../src/admin/activity-data.js';

function occurrenceQuery() {
  const result = { data:[], error:null };
  const query = {
    select() { return query; },
    eq() { return query; },
    order() { return query; },
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
        async range(start, end) {
          ranges.push([start, end]);
          return { data:start === 0 ? firstPage : secondPage, error:null };
        }
      };
    },
    from(name) {
      if (name === 'classes') return { select:async () => ({data:[],error:null}) };
      if (name === 'profiles') return { select(columns) {
        assert.equal(columns,'id, school_email');
        return { async in(column, ids) {
          assert.equal(column,'id');
          assert.ok(ids.length <= 100);
          return {data:ids.includes('student-1000') ? [{id:'student-1000',school_email:'0001205@example.com'},{id:'outside-roster',school_email:'9999@example.com'}] : [],error:null};
        }};
      }};
      assert.equal(name, 'vocabulary_unit_occurrences');
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
