import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { shouldResetExamTrackingAfterReset } from '../src/tracking/listening-wrapper.js';

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

test('Reading cancelled mode/new-attempt actions do not clear Exam dedupe state',()=>{
  assert.match(reading,/function\s+paperHasAnyAnswer\s*\(/);
  assert.match(reading,/wrapAfter\(win,\s*['"]startNewExamAttempt['"][\s\S]*!paperHasAnyAnswer\(win\)[\s\S]*resetExamTracking/);
  assert.match(reading,/wrapAfter\(win,\s*['"]setStudyMode['"][\s\S]*!paperHasAnyAnswer\(win\)[\s\S]*resetExamTracking/);
});

test('Reading reseeds saved Exam answers after switching papers',()=>{
  assert.match(reading,/wrapAfter\(win,\s*['"]loadSelectedPaper['"][\s\S]*seedReadingExamTracking\(win\)/);
});

test('Listening Exam question_answered events are gated once per question per attempt',()=>{
  assert.match(listening,/examAnswered/);
  assert.match(listening,/examAnswered\.has\(/);
  assert.match(listening,/examAnswered\.add\(/);
  assert.match(listening,/resetExamTracking/);
});

test('Listening cancelled mode/reset actions do not clear Exam dedupe state',()=>{
  assert.match(listening,/safeWrapAfter\(win,\s*['"]setMode['"][\s\S]*shouldResetExamTrackingAfterReset\(state, result\)[\s\S]*resetExamTracking/);
  assert.match(listening,/safeWrapAfter\(win,\s*['"]resetAllAnswers['"][\s\S]*shouldResetExamTrackingAfterReset/);
  assert.equal(shouldResetExamTrackingAfterReset({ answers:{ 1:{ value:'A' } } }, undefined), false);
  assert.equal(shouldResetExamTrackingAfterReset({ answers:{} }, undefined), true);
  assert.equal(shouldResetExamTrackingAfterReset({ answers:{} }, false), false);
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

test('all wrappers rebind iframe interaction listeners after an iframe reload',()=>{
  for (const [name, source] of [['Reading',reading],['Listening',listening],['Paraphrasing',paraphrasing],['Essay',essay]]) {
    const start = source.indexOf('function startActiveTime');
    assert.notEqual(start, -1, `${name} startActiveTime missing`);
    const body = source.slice(start, start + 2200);
    const listener = body.indexOf("addEventListener(type, markInteraction");
    const timerGuard = body.indexOf('if (timer) return');
    assert.notEqual(listener, -1, `${name} iframe interaction listener missing`);
    assert.notEqual(timerGuard, -1, `${name} timer guard missing`);
    assert.ok(listener < timerGuard, `${name} returns before rebinding listeners on a reloaded iframe`);
  }
});

test('Listening resets wrapper section state to ex1 when a fresh iframe document attaches',()=>{
  assert.match(listening,/function\s+attachToLoadedFrame\s*\([\s\S]*currentSectionId\s*=\s*['"]ex1['"]/);
});

test('Listening active-time timer reads the current iframe document instead of a stale captured document',()=>{
  assert.match(listening,/let\s+trackedWindow\s*=\s*null/);
  assert.match(listening,/trackedWindow\s*=\s*win/);
  assert.match(listening,/const\s+activeWin\s*=\s*trackedWindow/);
});

test('Paraphrasing active-time flush reads mode from the current iframe after reload',()=>{
  assert.match(paraphrasing,/let\s+trackedWindow\s*=\s*null/);
  assert.match(paraphrasing,/trackedWindow\s*=\s*win/);
  assert.match(paraphrasing,/mode:\s*trackedWindow\s*\?\s*currentMode\(trackedWindow\)/);
});
