import test from 'node:test';
import assert from 'node:assert/strict';
import { generateVocabularyActivity, renderVocabularyActivityStudio, ACTIVITY_FORMATS } from '../src/vocabulary/teacher-activity-studio.js';

const evidence = {
  wordBank:['fooled','guaranteed','harmless','inexpensive','afford','demand'],
  focus:'Idea paraphrasing'
};
test('all activity formats produce usable tasks and keys', () => {
  assert.equal(ACTIVITY_FORMATS.length,6);
  for(const format of ACTIVITY_FORMATS) {
    for(const minutes of [5,10,15]) {
      for(const level of ['supported','standard','challenge']) {
        const activity=generateVocabularyActivity(evidence,{type:format.id,minutes,level,variant:1});
        assert.equal(activity.ready,true,format.id);
        assert.ok(activity.task.length>80,format.id);
        assert.ok(activity.key.length>15,format.id);
        assert.ok(!activity.task.includes('undefined'));
      }
    }
  }
});
test('Forms questions have four options and a separate answer key',()=>{
  const a=generateVocabularyActivity(evidence,{type:'forms',minutes:5});
  assert.match(a.task,/A\./);
  assert.match(a.task,/B\./);
  assert.match(a.task,/C\./);
  assert.match(a.task,/D\./);
  assert.match(a.key,/—/);
  assert.match(a.note,/does not create a Form automatically/);
});
test('gap-fill has real blanks and a valid word bank',()=>{
  const a=generateVocabularyActivity(evidence,{type:'gap',minutes:10});
  assert.match(a.task,/________/);
  assert.match(a.task,/WORD BANK:/);
});
test('missing vetted vocabulary uses a safe explicit fallback',()=>{
  const a=generateVocabularyActivity({wordBank:['unknown-target']},{type:'forms'});
  assert.equal(a.ready,false);
  assert.match(a.note,/No made-up definitions/);
  const html=renderVocabularyActivityStudio({wordBank:['unknown-target']});
  assert.match(html,/disabled/);
});
test('render escapes untrusted vocabulary and hides answer key by default',()=>{
  const html=renderVocabularyActivityStudio({...evidence,wordBank:['fooled','<script>bad</script>']});
  assert.ok(!html.includes('<script>bad</script>'));
  assert.match(html,/<details class="vocab-studio-preview__key">/);
  assert.match(html,/data-vocab-studio/);
});
test('activity variant changes question order',()=>{
  const first=generateVocabularyActivity(evidence,{type:'forms',variant:0});
  const second=generateVocabularyActivity(evidence,{type:'forms',variant:1});
  assert.notEqual(first.task,second.task);
});

test('gap-fill difficulty changes the actual question format',()=>{
  const supported=generateVocabularyActivity(evidence,{type:'gap',minutes:10,level:'supported'});
  const standard=generateVocabularyActivity(evidence,{type:'gap',minutes:10,level:'standard'});
  const challenge=generateVocabularyActivity(evidence,{type:'gap',minutes:10,level:'challenge'});
  assert.match(supported.task,/Choose: /);
  assert.match(supported.task,/Clue: /);
  assert.doesNotMatch(supported.task,/WORD BANK:/);
  assert.match(standard.task,/WORD BANK:/);
  assert.doesNotMatch(standard.task,/Choose: /);
  assert.doesNotMatch(standard.task,/Clue: /);
  assert.doesNotMatch(challenge.task,/No word bank/);
  assert.doesNotMatch(challenge.task,/WORD BANK:/);
  assert.match(challenge.task,/Explain the evidence for TWO answers/);
  assert.notEqual(supported.task,standard.task);
  assert.notEqual(challenge.task,standard.task);
  assert.equal(supported.key,standard.key);
  assert.match(challenge.key,/Accept explanations/);
});
test('gap-fill keeps all levels usable with a single known word',()=>{
  const plan={wordBank:['harmless']};
  for(const level of ['supported','standard','challenge']){
    const task=generateVocabularyActivity(plan,{type:'gap',level,minutes:5});
    assert.equal(task.ready,true);
    assert.match(task.task,/________/);
    assert.match(task.key,/harmless/);
  }
});
