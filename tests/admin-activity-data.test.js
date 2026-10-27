import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTeacherActivityData } from '../src/admin/activity-data.js';

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
      assert.equal(name, 'vocabulary_unit_occurrences');
      return occurrenceQuery();
    }
  };

  const dashboard = await loadTeacherActivityData(client, { now:new Date('2026-10-27T12:00:00Z') });

  assert.equal(dashboard.students.length, 1001);
  assert.deepEqual(ranges, [[0,999],[1000,1999]]);
});
