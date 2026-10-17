import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync(new URL('../supabase/migrations/20261017061000_intervention_class_student_access.sql', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../supabase/functions/learning-intervention-action/index.ts', import.meta.url), 'utf8');

test('students may read interventions targeting their current class', () => {
  assert.match(sql, /student_class_memberships/i);
  assert.match(sql, /scm\.student_id\s*=\s*\(select auth\.uid\(\)\)/i);
  assert.match(sql, /scm\.ended_at is null/i);
  assert.match(sql, /lit\.class_id\s*=\s*scm\.class_id/i);
});

test('students may read their class-target row without seeing unrelated class targets', () => {
  assert.match(sql, /learning_intervention_targets_select/i);
  assert.match(sql, /class_id\s*=\s*scm\.class_id/i);
});

test('intervention action recognises current-class targeting when students start or complete work', () => {
  assert.match(source, /studentIsClassTargeted/);
  assert.match(source, /student_class_memberships/);
  assert.match(source, /ended_at/);
  assert.match(source, /studentTargeted\s*=\s*directStudentTargeted\s*\|\|\s*classStudentTargeted/);
});
