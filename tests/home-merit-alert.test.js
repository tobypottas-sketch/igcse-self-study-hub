import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHomeModel, renderHome, resetMeritPopup } from '../src/views/home.js';

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

test('pending merits open a staff dialog once per session, without awarding them', () => {
  resetMeritPopup();
  let opens = 0, closes = 0, dismiss;
  const dialog = { showModal(){ opens++; }, close(){ closes++; }, querySelector(){ return { addEventListener(type, handler){ dismiss=handler; } }; } };
  const root = { innerHTML:'', querySelector(selector){ return selector === '[data-merit-dialog]' ? dialog : null; }, querySelectorAll(){ return []; } };
  const profile = { id:'staff', display_name:'Teacher', role:'teacher', active:true };
  const dashboard = { pendingMerits:1, students:[{ studentId:'s1', displayName:'Amina K.', className:'Grade 9 ESL', pendingMerits:1, pendingMeritNumbers:[1] }] };
  renderHome(root, profile, apps, dashboard);
  assert.equal(opens,1);
  assert.match(root.innerHTML,/ready to award/);
  dismiss();
  assert.equal(closes,1);
  renderHome(root, profile, apps, dashboard);
  assert.equal(opens,1);
  resetMeritPopup();
  renderHome(root, profile, apps, dashboard);
  assert.equal(opens,2);
  renderHome(root, { ...profile, role:'student' }, apps, dashboard);
  assert.equal(opens,2);
  assert.doesNotMatch(root.innerHTML,/data-merit-dialog/);
  renderHome(root, profile, apps, { pendingMerits:0, students:[] });
  assert.equal(opens,2);
  assert.match(root.innerHTML,/All caught up/);
  assert.doesNotMatch(root.innerHTML,/home-merit-bell__count/);
});

test('staff bell reopens dismissed dialog and shows empty state without a zero badge', () => {
  resetMeritPopup();
  let opens=0, click, dismiss;
  const dialog={open:false,showModal(){this.open=true;opens++;},close(){this.open=false;},querySelector(){return {addEventListener(_,fn){dismiss=fn;}};}};
  const bell={addEventListener(_,fn){click=fn;}};
  const root={innerHTML:'',querySelector(selector){return selector==='[data-merit-dialog]'?dialog:selector==='[data-merit-bell]'?bell:null;},querySelectorAll(){return [];}};
  const profile={id:'staff',display_name:'Teacher',role:'teacher',active:true};
  const dashboard={pendingMerits:1,students:[{studentId:'s1',displayName:'Amina K.',className:'Grade 9 ESL',pendingMerits:1,pendingMeritNumbers:[1]}]};
  renderHome(root,profile,apps,dashboard);
  assert.equal(opens,1);
  assert.match(root.innerHTML,/home-account-controls[\s\S]*data-merit-bell[\s\S]*home-logout/);
  assert.match(root.innerHTML,/home-merit-bell__count/);
  dismiss();click();assert.equal(opens,2);
  dismiss();renderHome(root,profile,apps,{pendingMerits:0,students:[]});
  assert.equal(opens,2);
  assert.doesNotMatch(root.innerHTML,/home-merit-bell__count/);
  click();assert.equal(opens,3);
  assert.match(root.innerHTML,/All caught up/);
  dismiss();renderHome(root,{...profile,role:'student'},apps,dashboard);
  assert.doesNotMatch(root.innerHTML,/data-merit-bell|data-merit-dialog/);
});
