import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMonthlyUsage } from '../src/vocabulary/monthly-usage.js';

const students = [{ id:'s1' }, { id:'s2' }, { id:'s3' }];

test('monthly usage counts each student once per day and keeps zero days', () => {
  const result = buildMonthlyUsage({
    students,
    now:new Date(2026, 10, 3, 12, 0, 0),
    activity:[
      { studentId:'s1', eventType:'question_attempt', occurredAt:'2026-11-01T01:00:00Z' },
      { studentId:'s1', eventType:'question_attempt', occurredAt:'2026-11-01T02:00:00Z' },
      { studentId:'s2', eventType:'question_attempt', occurredAt:'2026-11-01T03:00:00Z' },
      { studentId:'s3', eventType:'question_attempt', occurredAt:'2026-11-03T01:00:00Z' }
    ]
  });

  assert.equal(result.monthLabel, 'November 2026');
  assert.equal(result.studentCount, 3);
  assert.equal(result.activeStudents, 3);
  assert.equal(result.activeDays, 2);
  assert.deepEqual(result.days.map(row => row.activeStudents), [2, 0, 1]);
});

test('monthly usage ignores other event types, invalid timestamps, other months, future events, and non-cohort students', () => {
  const result = buildMonthlyUsage({
    students,
    now:new Date(2026, 10, 3, 12, 0, 0),
    activity:[
      { studentId:'s1', eventType:'page_view', occurredAt:'2026-11-02T01:00:00Z' },
      { studentId:'s1', eventType:'question_attempt', occurredAt:'not-a-date' },
      { studentId:'s1', eventType:'question_attempt', occurredAt:'2026-10-31T10:00:00Z' },
      { studentId:'s1', eventType:'question_attempt', occurredAt:'2026-11-04T01:00:00Z' },
      { studentId:'outside', eventType:'question_attempt', occurredAt:'2026-11-02T01:00:00Z' },
      { studentId:'s2', eventType:'question_attempt', occurredAt:'2026-11-02T01:00:00Z' }
    ]
  });

  assert.deepEqual(result.days.map(row => row.activeStudents), [0, 1, 0]);
  assert.equal(result.activeStudents, 1);
  assert.equal(result.activeDays, 1);
});

test('monthly usage returns a stable zero series when there is no activity', () => {
  const result = buildMonthlyUsage({ students:[], activity:[], now:new Date(2026, 1, 2, 9, 0, 0) });
  assert.equal(result.monthLabel, 'February 2026');
  assert.equal(result.studentCount, 0);
  assert.equal(result.activeStudents, 0);
  assert.equal(result.activeDays, 0);
  assert.deepEqual(result.days.map(row => row.activeStudents), [0, 0]);
});
