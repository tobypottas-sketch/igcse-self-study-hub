import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAdminAccounts } from '../src/admin/accounts.js';
import { normalizeAdminClasses } from '../src/admin/classes.js';

test('only active membership becomes a student current class', () => {
  const profiles = [{ id:'s1', display_name:'Student', school_email:'s@x', role:'student', active:true }];
  const memberships = [
    { student_id:'s1', class_id:'old', ended_at:'2026-01-01T00:00:00Z' },
    { student_id:'s1', class_id:'new', ended_at:null }
  ];
  const classes = [{ id:'old', class_name:'Old' }, { id:'new', class_name:'New' }];
  const rows = normalizeAdminAccounts(profiles, memberships, classes, []);
  assert.equal(rows[0].currentClass, 'New');
});

test('inactive accounts remain visible and unassigned teacher normalizes cleanly', () => {
  const profiles = [{ id:'t1', display_name:'Teacher', school_email:'t@x', role:'teacher', active:false }];
  const rows = normalizeAdminAccounts(profiles, [], [], []);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].active, false);
  assert.deepEqual(rows[0].assignedClasses, []);
});

test('admin profiles are excluded from the student and teacher directory', () => {
  const profiles = [
    { id:'a1', display_name:'Admin', school_email:'admin@x', role:'admin', active:true },
    { id:'s1', display_name:'Student', school_email:'student@x', role:'student', active:true }
  ];
  const rows = normalizeAdminAccounts(profiles, [], [], []);
  assert.deepEqual(rows.map(row => row.role), ['student']);
});

test('many-to-many teacher assignment appears in class rows', () => {
  const classes = [{ id:'c1', class_name:'Class 1', active:true }, { id:'c2', class_name:'Class 2', active:true }];
  const profiles = [
    { id:'t1', display_name:'Teacher 1', role:'teacher', active:true },
    { id:'t2', display_name:'Teacher 2', role:'teacher', active:true }
  ];
  const teacherClasses = [
    { teacher_id:'t1', class_id:'c1' },
    { teacher_id:'t2', class_id:'c1' },
    { teacher_id:'t1', class_id:'c2' }
  ];
  const rows = normalizeAdminClasses(classes, profiles, [], teacherClasses);
  assert.deepEqual(rows.find(r => r.id === 'c1').teachers.map(t => t.id), ['t1','t2']);
  assert.deepEqual(rows.find(r => r.id === 'c2').teachers.map(t => t.id), ['t1']);
});

test('empty class normalizes with empty students and teachers', () => {
  const rows = normalizeAdminClasses([{ id:'c1', class_name:'Empty', active:true }], [], [], []);
  assert.deepEqual(rows[0].students, []);
  assert.deepEqual(rows[0].teachers, []);
});
