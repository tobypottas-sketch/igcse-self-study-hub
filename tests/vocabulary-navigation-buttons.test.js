import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css=readFileSync(new URL('../vocabulary-navigation-buttons.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../vocabulary.html',import.meta.url),'utf8');
const read=name=>readFileSync(new URL('../src/vocabulary/'+name,import.meta.url),'utf8');

test('all Vocabulary routes load navigation buttons after click feedback CSS',()=>{
  assert.match(html,/vocabulary-button-feedback\.css\?v=press-feel-v1/);
  assert.match(html,/vocabulary-navigation-buttons\.css\?v=button-links-v1/);
  assert.ok(html.indexOf('vocabulary-navigation-buttons.css')>html.indexOf('vocabulary-button-feedback.css'));
});
test('plain text teacher, staff and back controls have button appearance',()=>{
  for(const name of ['.vocab-back:not(.vocab-back--chip)', '.vocab-link', '.vocab-teacher-choose-class', '.vocab-usage-student-link']){
    assert.ok(css.includes(name),name);
  }
  assert.match(css,/min-height:42px/);
  assert.match(css,/border:1px solid/);
  assert.match(css,/background:#fff/);
  assert.match(css,/:hover:not\(:disabled\)/);
});
test('student back chip remains styled by its existing owner',()=>{
  assert.match(css,/\.vocab-back--chip/);
  assert.match(read('views.js'),/vocab-back vocab-back--chip/);
});
test('existing link targets and delegated button actions remain in place',()=>{
  assert.match(read('teacher-app.js'),/href="\.\/" class="vocab-back"/);
  assert.match(read('teacher-views.js'),/data-action="teacher-back-overview"/);
  assert.match(read('staff-usage.js'),/data-action=\\"staff-usage-back\\"/);
});
test('buttonisation remains scoped, keyboard-accessible and reduced-motion friendly',()=>{
  assert.match(css,/#vocabularyApp/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.equal(css.split('{').length,css.split('}').length);
});
