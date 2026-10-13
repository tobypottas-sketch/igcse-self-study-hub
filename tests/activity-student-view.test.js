import test from 'node:test';
import assert from 'node:assert/strict';
import { renderStudentActivity } from '../src/views/activity.js';

function root(){ return { innerHTML:'' }; }

test('student drill-down renders summary, app, skill and safe timeline', () => {
  const node=root();
  renderStudentActivity(node,{role:'teacher'},{
    displayName:'<Ada>',className:'10A',period:'7d',lastActive:'Today',activeTime:'3 min',attempts:3,accuracy:'67%',appsUsed:['Reading'],
    apps:[{appLabel:'Reading',activeTime:'3 min',attempts:3,accuracy:'67%',skills:['Multiple choice']}],
    skills:[{skill:'Multiple choice',attempts:3,correct:2,accuracy:'67%'}],
    exerciseResults:[{appLabel:'Reading',skill:'Note completion',scoreLabel:'5/7',occurredAt:'Today'}],
    recent:[
      {appLabel:'Reading',event_type:'question_attempt',skillLabel:'Multiple choice',outcome:'correct',answer_text:'SECRET',prompt:'SECRET PROMPT',metadata:{x:1}},
      {appLabel:'Reading',event_type:'active_time',active_seconds:60}
    ]
  },{period:'7d'});
  assert.match(node.innerHTML,/&lt;Ada&gt;/);
  assert.match(node.innerHTML,/Back to class overview/);
  assert.match(node.innerHTML,/Valid accuracy/);
  assert.match(node.innerHTML,/App breakdown/);
  assert.match(node.innerHTML,/Skill breakdown/);
  assert.match(node.innerHTML,/Recent activity/);
  assert.match(node.innerHTML,/Correct/);
  assert.match(node.innerHTML,/5\/7/);
  assert.doesNotMatch(node.innerHTML,/SECRET/);
  assert.doesNotMatch(node.innerHTML,/metadata/);
  assert.doesNotMatch(node.innerHTML,/student_id|uuid/i);
});

test('recent activity shows eight rows initially and hides overflow behind Show more', () => {
  const node = root();
  const recent = [
    {appLabel:'Reading',event_type:'app_open',skillLabel:'Not enough data'},
    {appLabel:'Reading',event_type:'active_time',skillLabel:'Not enough data',active_seconds:120},
    ...Array.from({length:8},(_,i)=>({appLabel:'Reading',event_type:'question_attempt',skillLabel:'Multiple choice',outcome:i % 2 ? 'correct' : 'try_again'}))
  ];
  renderStudentActivity(node,{role:'teacher'},{
    displayName:'Ada',className:'10A',period:'7d',lastActive:'Today',activeTime:'3 min',attempts:8,accuracy:'50%',appsUsed:['Reading'],
    apps:[],skills:[],exerciseResults:[],recent
  },{period:'7d'});

  assert.equal((node.innerHTML.match(/class="activity-timeline__item/g) || []).length, 10);
  assert.equal((node.innerHTML.match(/activity-timeline__item--extra/g) || []).length, 2);
  assert.match(node.innerHTML,/data-action="activity-toggle-more"/);
  assert.match(node.innerHTML,/>Show more</);
  assert.match(node.innerHTML,/Opened app/);
  assert.match(node.innerHTML,/Active study · 2 min/);
  assert.doesNotMatch(node.innerHTML,/Not enough data/);
});
