import test from 'node:test';
import assert from 'node:assert/strict';
import { renderActivityOverview } from '../src/views/activity.js';

function root(){ return { innerHTML:'' }; }

test('overview renders filters, first-attempt columns and escaped labels', () => {
  const node = root();
  renderActivityOverview(node, { role:'teacher' }, [{class_id:'c1',class_name:'<Math>'}], {rows:[{studentId:'s1',displayName:'<Ada>',lastActive:'Today',activeTime:'2 min',attempts:2,accuracy:'—',apps:['Reading'],weakestSkill:'Not enough data'}]}, {classId:'c1',period:'7d'});
  assert.match(node.innerHTML, /Class/);
  assert.match(node.innerHTML, /Last 7 days/);
  for (const col of ['Student','Last active','Active time','Questions attempted','First-attempt accuracy','Apps','Main weakness']) assert.match(node.innerHTML, new RegExp(col));
  assert.doesNotMatch(node.innerHTML, />Attempts</);
  assert.match(node.innerHTML, /&lt;Ada&gt;/);
  assert.match(node.innerHTML, /&lt;Math&gt;/);
  assert.match(node.innerHTML, /—/);
});

test('overview renders exact empty state', () => {
  const node = root();
  renderActivityOverview(node, {role:'admin'}, [], {rows:[]}, {period:'7d'});
  assert.match(node.innerHTML, /No Self-Study activity recorded for this period\./);
});
