import test from 'node:test';
import assert from 'node:assert/strict';
import {
  periodToSince,
  formatActiveTime,
  formatAccuracy,
  formatAppLabels,
  buildClassActivityModel,
  buildStudentActivityModel
} from '../src/views/activity-model.js';

const now = new Date('2026-10-13T12:00:00.000Z');

test('periods convert to correct since timestamps', () => {
  assert.equal(periodToSince('7d', now), '2026-10-06T12:00:00.000Z');
  assert.equal(periodToSince('30d', now), '2026-09-13T12:00:00.000Z');
  assert.equal(periodToSince('all', now), null);
});

test('accuracy uses an em dash when denominator is zero', () => {
  assert.equal(formatAccuracy(0, 0), '—');
  assert.equal(formatAccuracy(7, 10), '70%');
});

test('active time is teacher friendly', () => {
  assert.equal(formatActiveTime(0), '0 min');
  assert.equal(formatActiveTime(90), '2 min');
  assert.equal(formatActiveTime(4320), '1 h 12 min');
});

test('app labels are readable', () => {
  assert.deepEqual(formatAppLabels(['reading','paraphrasing','future_app']), ['Reading','Paraphrasing','future_app']);
});

test('class model uses Not enough data for missing weakness', () => {
  const model = buildClassActivityModel([{ student_id:'s1', display_name:'Ada', active_seconds:60, attempts:1, correct_score:1, valid_max_score:1, apps_used:['reading'], weakest_skill:null }]);
  assert.equal(model.rows[0].weakestSkill, 'Not enough data');
  assert.equal(model.rows[0].accuracy, '100%');
});

test('student model keeps grouped exercise results separate from skill accuracy', () => {
  const model = buildStudentActivityModel({
    student_id:'s1', display_name:'Ada', active_seconds:60, attempts:2, correct_score:1, valid_max_score:2, apps_used:['reading'],
    apps:[{ app_key:'reading', active_seconds:60, attempts:2, correct_score:1, valid_max_score:2, skills:['multiple choice'] }],
    skills:[{ skill:'multiple choice', attempts:2, correct_score:1, valid_max_score:2 }],
    exercise_results:[{ app_key:'reading', skill:'note completion', score:5, max_score:7 }]
  }, [], { period:'7d' });
  assert.equal(model.skills.length, 1);
  assert.equal(model.skills[0].accuracy, '50%');
  assert.equal(model.exerciseResults[0].scoreLabel, '5/7');
});
