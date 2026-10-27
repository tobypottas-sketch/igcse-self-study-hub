import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHomeModel } from '../src/views/home.js';

const apps = [
  { app_key:'vocabulary', display_name:'Vocabulary Builder', launch_url:'https://example.com/vocabulary', enabled:true }
];

test('teacher home model exposes pending merit alerts from activity dashboard', () => {
  const profile = { display_name:'Teacher', role:'teacher' };
  const activityDashboard = {
    pendingMerits:3,
    students:[
      { studentId:'s1', displayName:'Amina K.', className:'Grade 9 ESL', pendingMerits:2, pendingMeritNumbers:[1,2] },
      { studentId:'s2', displayName:'Leo M.', className:'Grade 9 ESL', pendingMerits:0, pendingMeritNumbers:[] },
      { studentId:'s3', displayName:'Sora T.', className:'Grade 10 ESL', pendingMerits:1, pendingMeritNumbers:[1] }
    ]
  };

  const model = buildHomeModel(profile, apps, activityDashboard);

  assert.equal(model.pendingMerits, 3);
  assert.deepEqual(model.meritAlerts, [
    { studentId:'s1', displayName:'Amina K.', className:'Grade 9 ESL', meritNumbers:[1,2] },
    { studentId:'s3', displayName:'Sora T.', className:'Grade 10 ESL', meritNumbers:[1] }
  ]);
});

test('student home model does not expose teacher merit alerts', () => {
  const profile = { display_name:'Student', role:'student' };
  const activityDashboard = {
    pendingMerits:1,
    students:[{ studentId:'s1', displayName:'Amina K.', className:'Grade 9 ESL', pendingMerits:1, pendingMeritNumbers:[1] }]
  };

  const model = buildHomeModel(profile, apps, activityDashboard);

  assert.equal(model.pendingMerits, 0);
  assert.deepEqual(model.meritAlerts, []);
});
