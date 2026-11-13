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


test('reading is a real passage with text-dependent questions and a checked answer key',()=>{
  const activity=generateVocabularyActivity(evidence,{type:'reading',minutes:10,level:'standard'});
  assert.equal(activity.ready,true);
  assert.match(activity.task,/The Holiday That Wasn’t What It Seemed/);
  assert.match(activity.task,/Mrs Li posted a detailed review/);
  assert.match(activity.task,/Give TWO ways/);
  assert.doesNotMatch(activity.task,/Which detail in the sentence helps/);
  assert.match(activity.key,/Pool closed/);
});
test('reading does not pretend unrelated vocabulary is covered',()=>{
  const activity=generateVocabularyActivity({wordBank:['depression']},{type:'reading'});
  assert.equal(activity.ready,false);
  assert.match(activity.note,/does not invent/);
});
test('reading duration changes comprehension work and difficulty changes demands',()=>{
  const base={type:'reading'};
  const short=generateVocabularyActivity(evidence,{...base,minutes:5,level:'standard'});
  const medium=generateVocabularyActivity(evidence,{...base,minutes:10,level:'standard'});
  const long=generateVocabularyActivity(evidence,{...base,minutes:15,level:'standard'});
  assert.ok(short.task.length<medium.task.length);
  assert.ok(medium.task.length<long.task.length);
  assert.notEqual(generateVocabularyActivity(evidence,{...base,level:'supported'}).task,medium.task);
  assert.notEqual(generateVocabularyActivity(evidence,{...base,level:'challenge'}).task,medium.task);
});
test('gap-fill levels have different answer processes and no missing gaps',()=>{
  const supported=generateVocabularyActivity(evidence,{type:'gap',level:'supported'});
  const standard=generateVocabularyActivity(evidence,{type:'gap',level:'standard'});
  const challenge=generateVocabularyActivity(evidence,{type:'gap',level:'challenge'});
  for(const item of [supported,standard,challenge])assert.match(item.task,/________/);
  assert.match(supported.task,/Choose:/);
  assert.doesNotMatch(supported.task,/WORD BANK:/);
  assert.match(standard.task,/WORD BANK:/);
  assert.doesNotMatch(standard.task,/Choose:/);
  assert.doesNotMatch(challenge.task,/WORD BANK:/);
  assert.match(challenge.task,/Explain why each word fits/);
  assert.equal(supported.key,standard.key);
});
test('context detective tests evidence and accurate claims, not imaginary clues',()=>{
  const activity=generateVocabularyActivity(evidence,{type:'detective',minutes:10,level:'standard'});
  assert.match(activity.task,/CASE 1/);
  assert.match(activity.task,/Does this accurately represent the original claim/);
  assert.doesNotMatch(activity.task,/Which words in the sentence support your answer/);
  assert.match(activity.key,/definite promise/);
});
test('paraphrase and writing distinguish independent and supported responses',()=>{
  const paraSupport=generateVocabularyActivity(evidence,{type:'paraphrase',level:'supported'});
  const paraChallenge=generateVocabularyActivity(evidence,{type:'paraphrase',level:'challenge'});
  assert.match(paraSupport.task,/Possible paraphrase/);
  assert.match(paraChallenge.task,/sentence structure/);
  const writeSupport=generateVocabularyActivity(evidence,{type:'writing',level:'supported',minutes:5});
  const writeChallenge=generateVocabularyActivity(evidence,{type:'writing',level:'challenge',minutes:15});
  assert.match(writeSupport.task,/Sentence starters/);
  assert.match(writeChallenge.task,/120–150 words/);
  assert.match(writeChallenge.task,/balanced judgement/);
});
