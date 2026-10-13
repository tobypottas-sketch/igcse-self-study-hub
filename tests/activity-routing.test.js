import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessActivity, loadActivityOverviewData } from '../src/app.js';

test('only admin and teacher roles may enter Activity', () => {
  assert.equal(canAccessActivity({role:'admin'}), true);
  assert.equal(canAccessActivity({role:'teacher'}), true);
  assert.equal(canAccessActivity({role:'student'}), false);
  assert.equal(canAccessActivity(null), false);
});

test('overview loader preserves selected class and period', async () => {
  const calls=[];
  const loaders={
    loadClasses: async()=>[{class_id:'c1',class_name:'10A'},{class_id:'c2',class_name:'10B'}],
    loadClass: async(_client,classId,since)=>{calls.push({classId,since});return [{student_id:'s1',display_name:'Ada'}];}
  };
  const data=await loadActivityOverviewData({}, {role:'teacher'}, {classId:'c2',period:'30d'}, loaders, new Date('2026-10-13T12:00:00Z'));
  assert.equal(data.classId,'c2');
  assert.equal(data.period,'30d');
  assert.equal(calls[0].classId,'c2');
  assert.equal(calls[0].since,'2026-09-13T12:00:00.000Z');
});

test('student overview request is rejected before loaders run', async () => {
  let called=false;
  await assert.rejects(() => loadActivityOverviewData({}, {role:'student'}, {}, {loadClasses:async()=>{called=true;return[];},loadClass:async()=>[]}), /Activity is available to staff only\./);
  assert.equal(called,false);
});
