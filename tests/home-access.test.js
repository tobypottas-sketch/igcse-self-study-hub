import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHomeModel } from '../src/views/home.js';

const apps = [
  { app_key:'paraphrasing', display_name:'Paraphrasing', launch_url:'/p', enabled:true },
  { app_key:'reading', display_name:'Reading', launch_url:'/r', enabled:true },
  { app_key:'essay_writing', display_name:'Essay Writing', launch_url:'/e', enabled:true },
  { app_key:'listening', display_name:'Listening', launch_url:'/l', enabled:true },
  { app_key:'hidden', display_name:'Hidden', launch_url:'/h', enabled:false }
];

test('student home exposes the four enabled apps and no admin controls', () => {
  const model = buildHomeModel({ display_name:'Student One', role:'student' }, apps);
  assert.deepEqual(model.apps.map(a => a.app_key), ['paraphrasing','reading','essay_writing','listening']);
  assert.equal(model.showAdminControls, false);
});

test('admin home can expose admin controls', () => {
  const model = buildHomeModel({ display_name:'Admin', role:'admin' }, apps);
  assert.equal(model.showAdminControls, true);
});
