import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const reading = fs.readFileSync('src/tracking/reading-wrapper.js','utf8');
const listening = fs.readFileSync('src/tracking/listening-wrapper.js','utf8');
const paraphrasing = fs.readFileSync('src/tracking/paraphrasing-wrapper.js','utf8');
const essay = fs.readFileSync('src/tracking/essay-writing-wrapper.js','utf8');

test('Reading, Listening and Paraphrasing send authenticated storage namespaces into their iframes',()=>{
  for (const [name, source] of [['Reading',reading],['Listening',listening],['Paraphrasing',paraphrasing]]) {
    assert.match(source,/self-study-hub-context/,`${name} context message missing`);
    assert.match(source,/storageNamespace:\s*`user-\$\{profile\.id\}`/,`${name} user namespace missing`);
  }
});

test('Reading wrapper sends staff capability only from authenticated profile role',()=>{
  assert.match(reading,/role/);
  assert.match(reading,/staffAccess/);
});

test('Listening Exam question_answered events are gated once per question per attempt',()=>{
  assert.match(listening,/examAnswered/);
  assert.match(listening,/examAnswered\.has\(/);
  assert.match(listening,/examAnswered\.add\(/);
  assert.match(listening,/resetExamTracking/);
});

test('Paraphrasing Exam correctness comes from app records rather than hidden CSS feedback',()=>{
  assert.match(paraphrasing,/const\s+mode\s*=\s*currentMode\(win\)/);
  assert.match(paraphrasing,/mode\s*===\s*['"]exam['"][\s\S]*latestRecord\(win/);
  assert.match(paraphrasing,/record\?\.strong/);
});

test('Essay wrapper does not count blocked Exam navigation or failed saves as section use',()=>{
  assert.match(essay,/activeTab/);
  assert.match(essay,/saveResult\s*!==\s*true/);
  assert.match(essay,/studyMode/);
  assert.doesNotMatch(essay,/saveDraftName[\s\S]{0,120}\.value/);
});
