import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';

const read = p => readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css = read('vocabulary-support-buttons.css');

test('scoped accent buttons CSS loads after the original support styles',()=>{
  const html=read('vocabulary.html');
  const original=html.indexOf('href="vocabulary-support.css"');
  const enhanced=html.indexOf('href="vocabulary-support-buttons.css?v=accent-actions-v1"');
  assert.ok(original>=0&&enhanced>original);
  assert.match(css,/#vocabularyApp \.vocab-support-card--mixed \.vocab-button--primary/);
  assert.match(css,/#vocabularyApp \.vocab-support-card--bank \.vocab-button--bank/);
  assert.match(css,/\.vocab-time-grid \.vocab-button/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/:disabled/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css,/\.vocab-student-identity|\.vocab-rewards-home/);
});

test('Mixed Practice and Vocabulary Bank actions remain unchanged for all timed choices',()=>{
 const root={innerHTML:''};
 renderVocabularyUnit(root,{
  unitNumber:8,
  unitTitle:'Work',
  progress:{mastered:0,total:50,needsAnotherLook:0,reviewDue:0,stages:{}},
  pathwayStates:{},
  contentReady:true
 });
 const html=root.innerHTML;
 assert.match(html,/class="vocab-button vocab-button--primary" data-action="start-mixed-review"/);
 assert.match(html,/class="vocab-button vocab-button--bank" data-action="view-all-words"/);
 for(const minutes of [5,10,15,20]){
  assert.match(html,new RegExp('data-action="start-mixed-review" data-minutes="'+minutes+'"'));
 }
});
