import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrackingEvent } from '../src/tracking/core.js';
import { buildListeningAttempt, buildListeningExamResult } from '../src/tracking/listening-core.js';
import { buildStudentActivityModel } from '../src/views/activity-model.js';
import { renderStudentActivity } from '../src/views/activity.js';

function root(){ return { innerHTML:'' }; }

test('exam pre-submit evidence does not count as a question attempt', () => {
  const pending = buildTrackingEvent(buildListeningAttempt({ sectionId:'ex4', questionNumber:17, mode:'exam', attemptNumber:1 }));
  const final = buildTrackingEvent(buildListeningExamResult({ sectionId:'ex4', questionNumber:17, correct:true }));
  assert.equal(pending.event_type, 'question_answered');
  assert.equal(pending.score, undefined);
  assert.equal(final.event_type, 'question_attempt');
  assert.equal(final.score, 1);
  assert.equal(final.max_score, 1);
});

test('student activity model labels Listening cleanly', () => {
  const model = buildStudentActivityModel({
    student_id:'s1', display_name:'Pilot', class_name:'10A', active_seconds:180,
    attempts:4, correct_score:3, valid_max_score:4, apps_used:['listening'],
    apps:[{app_key:'listening',active_seconds:180,attempts:4,correct_score:3,valid_max_score:4,skills:['Speaker matching']}],
    skills:[{skill:'Speaker matching',attempts:4,correct_score:3,valid_max_score:4}],
    exercise_results:[]
  }, [], {period:'7d'});
  assert.deepEqual(model.appsUsed, ['Listening']);
  assert.equal(model.apps[0].appLabel, 'Listening');
  assert.equal(model.accuracy, '75%');
});

test('support and section events render as compact secondary recent activity', () => {
  const node = root();
  renderStudentActivity(node,{role:'teacher'},{
    displayName:'Pilot',className:'10A',period:'7d',lastActive:'Today',activeTime:'3 min',attempts:1,accuracy:'100%',appsUsed:['Listening'],
    apps:[],skills:[],exerciseResults:[],
    recent:[
      {appLabel:'Listening',event_type:'support_use'},
      {appLabel:'Listening',event_type:'section_use',skillLabel:'Dialogues'},
      {appLabel:'Listening',event_type:'question_answered',skillLabel:'Speaker matching'}
    ]
  },{period:'7d'});
  assert.match(node.innerHTML,/Transcript support used/);
  assert.match(node.innerHTML,/Dialogues · Section opened/);
  assert.match(node.innerHTML,/Speaker matching · Answer recorded/);
  assert.doesNotMatch(node.innerHTML,/Not enough data/);
});
