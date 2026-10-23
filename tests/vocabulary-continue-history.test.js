import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import unit from '../content/vocabulary/releases/unit-01.js';
import * as sessions from '../src/vocabulary/session.js';
import * as targets from '../src/vocabulary/session-targets.js';
import * as pathways from '../src/vocabulary/pathway-planner.js';
import * as placement from '../src/vocabulary/pathway-view-model.js';
import * as engine from '../supabase/functions/_shared/vocabulary-engine.js';
import { freshPathwayProgress, applyPathwayAttempt } from '../src/vocabulary/pathway-progress.js';
import { deriveLearningStage } from '../src/vocabulary/learning-stage.js';
import { buildSupportStep } from '../src/vocabulary/scaffolding.js';
import * as matchSetLogic from '../src/vocabulary/match-set.js';
import * as matchSetView from '../src/vocabulary/match-set-view.js';
import * as engagementCopy from '../src/vocabulary/engagement-copy.js';
import * as engagementModel from '../src/vocabulary/engagement-model.js';
import { buildActivity } from '../src/vocabulary/activity-factory.js';
import { createAttemptPersistence } from '../src/vocabulary/attempt-persistence.js';
import { buildSessionFinishModel } from '../src/vocabulary/session-finish-model.js';

// Execute the real controller without bootstrapping authentication or a browser.
// Only rendering, telemetry and the remote save boundary are replaced.
const source = fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8')
  .split("root?.addEventListener('submit'")[0]
  .replace(/^import .*;\n/gm,'')
  .replace(/^const root = .*;\n/m,'')
  .replace(/^const state = \{[\s\S]*?^\};\n/m,'');
const content = {...unit, occurrences:unit.occurrences.slice(0,10),
  itemsById:Object.fromEntries(unit.items.map(row => [row.vocabularyId,row])),
  contextsByOccurrence:{}, activitiesById:Object.fromEntries(unit.activities.map(row => [row.activityContentId,row]))};
for (const row of unit.contexts) (content.contextsByOccurrence[row.occurrenceId] ??= []).push(row);

function controller(stage = 'recognise', priorSuccess = false) {
  const state = {content,currentUnitNumber:1,currentUnitTitle:'Unit 1',preview:false,globalMastery:{},unitMastery:{},
    recentActivities:new Map(),usedContentIds:new Map(),recoveryNeeded:new Set(),queue:[],
    unitCache:new Map(),units:[]};
  const stages = ['recognise','match','apply','recall','mastery'];
  for (const target of content.occurrences) {
    const progress = freshPathwayProgress({completedStages:stages.slice(0,stages.indexOf(stage))});
    if (priorSuccess) Object.assign(progress.stages[stage],{successes:1,cleanSuccesses:1,cleanUnassistedSuccesses:1,contentIds:['prior-content'],contextIds:['prior-context'],promptKeys:['prior-prompt']});
    state.globalMastery[target.vocabularyId] = {status:'building',strandEvidence:{meaning:3,recognition:3,context:3,paraphrasing:3}};
    state.unitMastery[target.occurrenceId] = {status:'building',contextualEvidence:{pathwayProgress:{context:progress}}};
  }
  const saved = [];
  const context = vm.createContext({state,crypto,createAttemptPersistence,Date,Map,Set,console,root:{},window:{clearInterval(){},setInterval(){return 1;}},
    ...sessions,...targets,...pathways,...placement,...engine,...matchSetLogic,...matchSetView,...engagementCopy, ...engagementModel, loadVocabularyMissions:async () => [], recordVocabularyMission:async () => null, renderEngagementStrip:() => "", installMatchDrag() {}, playCompletionSequence() {}, loadSeenContent:() => new Map(), saveSeenContent() {}, _unused() {}, playCompletionSequence() {}, matchDragJustEnded:() => false,deriveLearningStage,buildSupportStep,buildSessionFinishModel,
    renderVocabularyQuestion(){},renderSessionSummary(){},renderVocabularyUnit(){},supportiveFeedback(){return '';},
    trackVocabularyEvent:async () => {},
    submitVocabularyAttempt:async (_client,payload) => {
      saved.push(payload);
      const correct = payload.rawAnswer !== '__wrong__';
      if (!payload.pathwayId) return {correct};
      const progress = state.unitMastery[payload.occurrenceId].contextualEvidence.pathwayProgress[payload.pathwayId];
      const id = payload.activityContentId ?? payload.contextId ?? payload.occurrenceId;
      return {correct,pathwayId:payload.pathwayId,pathwayProgress:applyPathwayAttempt(progress,{
        stageId:payload.pathwayStage,servedStageId:payload.servedPathwayStage,correct,
        firstAttempt:payload.firstAttempt,retryUsed:payload.retryUsed,supportLevel:payload.supportLevel,
        contentId:`${id}:${payload.questionType}`,contextId:payload.contextId ?? payload.activityContentId,
        promptKey:`${id}:${payload.questionType}`,activityType:payload.questionType,
        contextSensitive:payload.pathwayId === 'context' && payload.pathwayStage === 'apply'
      })};
    }});
  vm.runInContext(source,context);
  return {state,saved,run:code => vm.runInContext(code,context)};
}
function identity(question) {
  return JSON.stringify([question.occurrenceId,question.type,question.contentId,question.activityVariantId,question.prompt,question.sourceText,question.matchCue]);
}
async function answer(harness, wrong = false) {
  const {state,run} = harness;
  const value = wrong ? '__wrong__' : state.current.question.markingReference.acceptedAnswers[0];
  run(`handleAnswer(null,${JSON.stringify(value)})`);
  await state.attempts.settled();
  assert.equal(state.attempts.blocked,false);
}
async function ten(harness, mode = 'adaptive') {
  const questions = [];
  for (let i = 0; i < 10; i++) {
    assert.ok(harness.state.current,`missing question ${i + 1}`);
    questions.push(harness.state.current.question);
    await answer(harness);
    await harness.run('advanceToNextQuestion()');
  }
  if (mode === 'timed') harness.run('finishSession()'); // Model the timer ending this sample.
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(harness.state.current,null,JSON.stringify({targets:harness.state.session.targetIds,completed:harness.state.session.completedTargetIds,attempts:harness.state.session.completedAttempts.length,pending:harness.state.finishPending}));
  return questions;
}
const overlaps = (a,b) => b.filter(q => new Set(a.map(identity)).has(identity(q))).length;

for (const [stage,prior,nextStage] of [['recognise',false,'recognise'],['recall',true,'mastery']]) {
  test(`Context Set 1 → Continue → Set 2 avoids exact repetition (${stage} → ${nextStage})`, async () => {
    const h = controller(stage,prior);
    h.run("startPathwaySession('context')");
    const first = await ten(h);
    h.run('continuePractice()');
    assert.equal(h.state.pathwayStage,nextStage);
    assert.equal(h.state.session.completedAttempts.length,0);
    assert.equal(h.state.session.completedTargetIds.length,0);
    assert.equal(h.state.session.targetIds.length,10);
    const second = await ten(h);
    const overlap = overlaps(first,second);
    console.log(`${stage} → ${nextStage}: ${overlap}/10 exact questions repeated`);
    assert.equal(overlap,0,'Continue discarded the history needed to avoid repeating Set 1');
  });
}

test('timed Continue retains served content while resetting its timer and attempt state', async () => {
  const h = controller();
  h.run("startSession('timed',5)");
  const first = await ten(h,'timed');
  const history = new Map([...h.state.usedContentIds].map(([id,values]) => [id,[...values]]));
  h.run('continuePractice()');
  assert.equal(h.state.session.mode,'timed');
  assert.equal(h.state.session.durationMinutes,5);
  assert.equal(h.state.session.completedAttempts.length,0);
  assert.equal(h.state.session.targetIds.length,0);
  assert.equal(h.state.session.expired,false);
  for (const [id,values] of history) for (const value of values) assert.ok(h.state.usedContentIds.get(id)?.includes(value),'timed Continue lost served content');
  const second = await ten(h,'timed');
  console.log(`timed Continue: ${overlaps(first,second)}/10 exact questions repeated`);
  assert.equal(overlaps(first,second),0);
});

test('explicitly reopening an activity starts fresh; Continue keeps history scoped to its targets', async () => {
  const h = controller();
  h.run("startPathwaySession('context')");
  const first = await ten(h);
  h.run("startPathwaySession('context')");
  assert.equal(identity(h.state.current.question),identity(first[0]));
  assert.equal(h.state.usedContentIds.size,1);
  assert.equal(h.state.recentActivities.size,0);
});

test('retry keeps the same question and recovery uses fresh content without completing its target early', async () => {
  const h = controller(); h.run("startPathwaySession('context')");
  const original = h.state.current.question, id = original.occurrenceId;
  await answer(h,true);
  assert.equal(h.state.current.question,original);
  assert.equal(h.state.current.retry,true);
  assert.equal(h.state.session.completedAttempts.length,0);
  await answer(h);
  assert.equal(h.state.session.completedTargetIds.includes(id),false);
  assert.equal(h.state.recoveryNeeded.has(id),true);
  assert.equal(h.state.recentActivities.get(id).length,1);
  h.state.queue = [content.occurrences[0]];
  await h.run('advanceToNextQuestion()');
  assert.equal(h.state.current.recovery,true);
  assert.notEqual(h.state.current.question.contentId,original.contentId);
  await answer(h);
  assert.equal(h.state.session.completedTargetIds.includes(id),true);
  assert.equal(h.state.recoveryNeeded.has(id),false);
  assert.deepEqual(h.saved.map(row => [row.firstAttempt,row.retryUsed,row.recoveredLater]),[[true,false,false],[false,true,false],[true,false,true]]);
});

const target = content.occurrences[0], item = content.itemsById[target.vocabularyId];
const args = {occurrence:target,item,contexts:content.contextsByOccurrence[target.occurrenceId],unitItems:unit.items,unitActivities:[],mastery:{status:'mastered'},seed:'repeatable'};
for (const activityType of ['context_sentence_match','spelling_choice']) {
  test(`${activityType} falls back after eligible content is exhausted`, () => {
    const usedContentIds = [`item:${item.vocabularyId}:${target.senseId}`,...args.contexts.map(row => row.contextId)];
    const question = buildActivity({...args,activityType,usedContentIds});
    assert.ok(question.contentId);
    assert.ok(question.markingReference.acceptedAnswers.includes(item.term));
  });
}
for (const activityType of ['precision_choice','precision_match','improve_vocabulary']) {
  test(`${activityType} prefers another eligible record and reuses safely after exhaustion`, () => {
    const records = ['a','b'].map(id => ({activityContentId:id,contentType:'writing_set',activityData:{taskType:'improve_vocabulary',linkedVocabularyIds:[item.vocabularyId],primaryEvidenceTargetId:item.vocabularyId,prompt:`Prompt ${id}`,sourceText:`Sentence ${id}`,acceptedAnswers:[item.term],distractors:['work','study','training']}}));
    const build = usedContentIds => buildActivity({...args,activityType,unitActivities:records,usedContentIds});
    const first = build([]), second = build([first.contentId]);
    assert.notEqual(second.contentId,first.contentId);
    assert.ok(records.some(row => row.activityContentId === build(['a','b']).contentId));
  });
}

for (const activityType of ['choose_word_sentence','context_sentence_match']) {
  test(`${activityType} uses an unseen legacy context before reusing exhausted published bank contexts`, () => {
    const bankIds = unit.activities.filter(row => row.activityContentId.startsWith('language-bank:')).map(row => row.activityContentId);
    assert.ok(bankIds.length > 0);
    const question = buildActivity({...args,activityType,unitActivities:unit.activities,usedContentIds:bankIds});
    assert.equal(question.contentSource,'context');
    const exhausted = buildActivity({...args,activityType,unitActivities:unit.activities,usedContentIds:[...bankIds,...args.contexts.map(row => row.contextId)]});
    assert.ok(exhausted.contentId);
    // Invalid/unavailable legacy contexts must never displace a valid published bank prompt.
    const bankOnly = buildActivity({...args,activityType,contexts:[],unitActivities:unit.activities,usedContentIds:bankIds});
    assert.equal(bankOnly.contentSource,'language_bank');
  });
}

test('using an item cue does not blacklist a different activity on the same word', () => {
  const first = buildActivity({...args,activityType:'definition_to_word'});
  const second = buildActivity({...args,activityType:'type_word_from_definition',usedContentIds:[first.contentId]});
  assert.equal(second.vocabularyId,first.vocabularyId);
  assert.notEqual(second.prompt,first.prompt);
  assert.deepEqual(second.markingReference.acceptedAnswers,first.markingReference.acceptedAnswers);
});

test('spelling recognition can reuse the definition cue if no sentence cues exist', () => {
  assert.doesNotThrow(() => buildActivity({...args,activityType:'spelling_choice',contexts:[],usedContentIds:[`item:${item.vocabularyId}:${target.senseId}`]}));
});

for (const activityType of ['question_text_bridge','same_idea','spot_meaning_change']) {
  test(`${activityType} tries an unseen question variant before repeating an exhausted record`, () => {
    const record = unit.activities.find(row => activityType === 'question_text_bridge' ? row.contentType === 'question_text' : row.contentType === 'idea_set' && row.activityData.accurateParaphrases.length > 1);
    const target = unit.occurrences.find(row => row.vocabularyId === record.activityData.linkedVocabularyIds[0]);
    const item = content.itemsById[target.vocabularyId];
    const material = {...args,activityType,occurrence:target,item,unitActivities:unit.activities,usedContentIds:unit.activities.map(row => row.activityContentId)};
    const first = buildActivity(material);
    const second = buildActivity({...material,usedContentIds:[...material.usedContentIds,JSON.stringify([first.contentId,first.type,first.activityVariantId])]});
    assert.equal(second.contentId,first.contentId);
    assert.notEqual(second.activityVariantId,first.activityVariantId);
    // The same word/record remains available to a genuinely different operation.
    assert.ok(second.markingReference.acceptedAnswers.length);
  });
}

test('unseen variants in another eligible record precede reuse of an exhausted record', () => {
  const original = unit.activities.find(row => row.contentType === 'idea_set' && row.activityData.accurateParaphrases.length > 1);
  const target = unit.occurrences.find(row => row.vocabularyId === original.activityData.linkedVocabularyIds[0]);
  const records = ['a','b'].map(activityContentId => ({...original,activityContentId}));
  const usedContentIds = ['a','b'], served = new Set();
  const count = 2 * new Set(original.activityData.accurateParaphrases).size;
  for (let i = 0; i < count; i++) {
    const question = buildActivity({...args,activityType:'same_idea',occurrence:target,item:content.itemsById[target.vocabularyId],unitActivities:records,usedContentIds});
    const key = JSON.stringify([question.contentId,question.type,question.activityVariantId]);
    assert.equal(served.has(key),false,'an unseen variant remains in the other record');
    served.add(key); usedContentIds.push(key);
  }
  assert.doesNotThrow(() => buildActivity({...args,activityType:'same_idea',occurrence:target,item:content.itemsById[target.vocabularyId],unitActivities:records,usedContentIds}));
});
