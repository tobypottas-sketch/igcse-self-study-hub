import test from 'node:test';
import assert from 'node:assert/strict';
import { shuffleAnswerOptions } from '../src/vocabulary/answer-option-shuffle.js';
import { createSession, completeAttempt } from '../src/vocabulary/session.js';
import { ACTIVITY_TYPES, isActivityLive } from '../src/vocabulary/activity-catalogue.js';
import { buildActivity } from '../src/vocabulary/activity-factory.js';
import { planPathwayQuestion } from '../src/vocabulary/pathway-planner.js';
import { buildTargetPracticeQuestion, buildTimedMixedQuestion } from '../src/vocabulary/session-targets.js';
import unit from '../content/vocabulary/releases/unit-01.js';

const source = ['correct','wrong-1','wrong-2','wrong-3'];
const content = { ...unit, itemsById:Object.fromEntries(unit.items.map(item => [item.vocabularyId,item])), contextsByOccurrence:{} };
for (const context of unit.contexts) (content.contextsByOccurrence[context.occurrenceId] ??= []).push(context);
const types = ACTIVITY_TYPES.filter(type => type.responseMode === 'choice' && isActivityLive(type.id));
function argsFor(occurrence, position = 0) {
  return { occurrence, item:content.itemsById[occurrence.vocabularyId], contexts:content.contextsByOccurrence[occurrence.occurrenceId],
    unitActivities:unit.activities, unitItems:unit.items, unitContexts:unit.contexts, unitOccurrences:unit.occurrences,
    mastery:{ status:'mastered' }, readinessStage:'mastered', seed:`${occurrence.occurrenceId}:${position}:adaptive` };
}
function unordered(question) {
  return { ...question, options:[...(question.options ?? [])].sort(),
    ...(question.wordBank ? {wordBank:[...question.wordBank].sort()} : {}) };
}

test('mixed seeded option shuffle reaches all 24 permutations and balances A/B/C/D', () => {
  const permutations = new Set(), counts = [0,0,0,0], samples = 20000;
  for (let i = 0; i < samples; i++) {
    const options = shuffleAnswerOptions(source, `seed:${i}`, 'session');
    permutations.add(options.join('|'));
    counts[options.indexOf('correct')]++;
  }
  assert.equal(permutations.size, 24);
  for (const count of counts) assert.ok(Math.abs(count / samples - .25) < .015, `unbalanced positions: ${counts}`);
});

test('same seed and nonce reproduce option order without mutating the supplied options', () => {
  const options = Object.freeze([...source]);
  assert.deepEqual(shuffleAnswerOptions(options,'question','session'), shuffleAnswerOptions(options,'question','session'));
  assert.deepEqual(options,source);
  assert.deepEqual(shuffleAnswerOptions([],'question','session'),[]);
  assert.deepEqual(shuffleAnswerOptions(['only'],'question','session'),['only']);
  const orders = new Set(Array.from({length:100},(_,i) => shuffleAnswerOptions(source,'question',`session:${i}`).join('|')));
  assert.ok(orders.size > 20);
});

test('session nonce is unique per session, injectable for replay, and retained after an answer', () => {
  const args = { unitNumber:1, targetIds:['u1_01_leisure'] };
  const first = createSession(args), second = createSession(args);
  assert.equal(typeof first.optionNonce,'string');
  assert.notEqual(first.optionNonce,second.optionNonce);
  const replay = createSession({...args,optionNonce:'replay-session'});
  assert.equal(replay.optionNonce,'replay-session');
  assert.equal(completeAttempt(replay,{targetId:'u1_01_leisure'}).optionNonce,'replay-session');
});

for (const definition of types) {
  test(`${definition.id}: session nonce changes only option order and never question material`, () => {
    let built = 0, changed = 0;
    for (const occurrence of unit.occurrences) {
      const args = {...argsFor(occurrence),activityType:definition.id};
      let first;
      try { first = buildActivity({...args,optionNonce:'session:first'}); } catch { continue; }
      const replay = buildActivity({...args,optionNonce:'session:first'});
      const second = buildActivity({...args,optionNonce:'session:second'});
      assert.deepEqual(first,replay);
      assert.deepEqual(unordered(first),unordered(second));
      if (JSON.stringify(first.options) !== JSON.stringify(second.options)) changed++;
      built++;
    }
    assert.ok(built > 0,'no supported target exercised');
    assert.ok(changed > 0,'nonce did not reach the option builder');
  });
}

test('nonce passes through pathway, adaptive, and timed planners without changing their selection', () => {
  const target = unit.occurrences[0], common = {content,target,mastery:{status:'new',strandEvidence:{}},seed:`${target.occurrenceId}:0:adaptive`};
  const builders = [
    args => planPathwayQuestion({...args,pathwayId:'context',stageId:'recognise'}),
    args => buildTargetPracticeQuestion({...args,practiceMode:'context'}),
    args => buildTimedMixedQuestion({...args,practiceMode:'context',previousActivityType:null})
  ];
  for (const build of builders) {
    const orders = new Set();
    for (let i = 0; i < 16; i++) {
      const optionNonce = `session:${i}`, result = build({...common,optionNonce});
      const base = build({...common,optionNonce:'session:0'});
      assert.deepEqual({...result,question:unordered(result.question)}, {...base,question:unordered(base.question)});
      orders.add(JSON.stringify(result.question.options));
    }
    assert.ok(orders.size > 1,'nonce was dropped by planner');
  }
});

test('old ten-question Meaning seed pattern no longer repeats D clustering across sessions', () => {
  const targets = unit.occurrences.slice(0,10), sessions = 1000;
  const counts = [0,0,0,0]; let clustered = 0;
  for (let session = 0; session < sessions; session++) {
    const positions = [0,0,0,0];
    for (let i = 0; i < targets.length; i++) {
      const question = planPathwayQuestion({content,target:targets[i],pathwayId:'meaning',stageId:'recognise',mastery:{status:'new'},seed:`${targets[i].occurrenceId}:${i}:adaptive`,optionNonce:`session:${session}`}).question;
      const accepted = new Set(question.markingReference.acceptedAnswers);
      const index = question.options.findIndex(option => accepted.has(option));
      assert.ok(index >= 0);
      positions[index]++; counts[index]++;
    }
    if (Math.max(...positions) >= 7) clustered++;
  }
  for (const count of counts) assert.ok(Math.abs(count / (sessions * 10) - .25) < .025, `unbalanced session positions: ${counts}`);
  assert.ok(clustered < 35, `seven-or-more clustering in ${clustered}/${sessions} sessions`);
});

// These two builders also serve matching activities; retain their pre-change order.
test('matching presentations retain the original order independently of the session nonce', () => {
  const target = unit.occurrences[0];
  const expected = {
    meaning:['training','salary','leisure','deadline'],
    paraphrasing:['leisure time','compulsory study time','scheduled working time','organised training time']
  };
  for (const [pathwayId, options] of Object.entries(expected)) {
    const args = {content,target,pathwayId,stageId:'match',mastery:{status:'building'},recentActivities:['word_definition_match'],seed:'fixed'};
    const first = planPathwayQuestion({...args,optionNonce:'first'}).question;
    const second = planPathwayQuestion({...args,optionNonce:'second'}).question;
    assert.equal(first.responseMode,'matching');
    assert.deepEqual(first.options,options);
    assert.deepEqual(first.matchOptions,options);
    assert.deepEqual(first,second);
  }
});
