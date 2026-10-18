import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import {
  ACTIVITY_TYPES, PRACTICE_MODES, activityDefinition, activitiesForMode, activitiesForStage, isActivityLive
} from '../src/vocabulary/activity-catalogue.js';
import { planNextActivity } from '../src/vocabulary/adaptive-planner.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';
import { validateVocabularyAttempt, buildStoredAttemptMetadata, strandForQuestionType } from '../supabase/functions/vocabulary-attempt-action/validation.js';

const RETIRED = 'collocation_builder';
const STAGES = ['new', 'building', 'secure', 'mastered'];
const MODES = PRACTICE_MODES.map(mode => mode.id);
const LIVE_IDS = ACTIVITY_TYPES.filter(activity => activity.retired !== true).map(activity => activity.id);

function mastery(status) {
  return { status, strandEvidence:{ meaning:9, recognition:9, context:9, paraphrasing:9, production:9 }, recentErrorCount:0 };
}
function source(path) { return fs.readFileSync(new URL(path, import.meta.url), 'utf8'); }
function targetArgs(item) {
  const occurrence = unit1.occurrences.find(row => row.vocabularyId === item.vocabularyId);
  const contexts = unit1.contexts.filter(row => row.occurrenceId === occurrence.occurrenceId);
  return { occurrence, item, contexts, unitActivities:unit1.activities, unitItems:unit1.items, unitContexts:unit1.contexts, unitOccurrences:unit1.occurrences };
}

test('catalogue marks collocation_builder retired but still resolves it for historical attempts', () => {
  const definition = activityDefinition(RETIRED);
  assert.ok(definition, 'definition is kept so stored attempts can still be labelled');
  assert.equal(definition.retired, true);
  assert.equal(isActivityLive(RETIRED), false);
  assert.equal(isActivityLive('meaning_match'), true);
  assert.equal(isActivityLive('not_an_activity'), false);
});

test('collocation_builder is excluded from every student-facing practice mode, including Adaptive', () => {
  for (const mode of MODES) {
    assert.equal(activitiesForMode(mode).some(activity => activity.id === RETIRED), false, mode);
  }
  for (const stage of STAGES) {
    assert.equal(activitiesForStage(stage).some(activity => activity.id === RETIRED), false, stage);
  }
  assert.ok(MODES.includes('adaptive') && MODES.includes('learn') && MODES.includes('writing'));
});

test('planner never selects collocation_builder in any mode, stage or support state, even if it is advertised as available', () => {
  const advertisedEverything = ACTIVITY_TYPES.map(activity => activity.id);
  const lastTypes = [null, 'meaning_match', 'improve_vocabulary', 'word_family_switch', RETIRED];
  let plans = 0;
  for (const practiceMode of MODES) {
    for (const stage of STAGES) {
      for (const lastType of lastTypes) {
        for (const correct of [true, false]) {
          for (const struggling of [false, true]) {
            const recentActivities = lastType ? [{ type:lastType, correct }] : [];
            const plan = planNextActivity({
              practiceMode, mastery:mastery(stage), recentActivities,
              supportState:struggling ? { recycle:true, struggling:true } : null,
              reviewDue:stage === 'mastered', availableContent:advertisedEverything
            });
            assert.notEqual(plan.activityType, RETIRED, `${practiceMode}/${stage}/${lastType}/${correct}/${struggling}`);
            assert.ok(isActivityLive(plan.activityType));
            plans += 1;
          }
        }
      }
    }
  }
  assert.ok(plans > 300);
});

test('adaptive planner walks a long run of successes without ever reaching collocation_builder', () => {
  const recent = [];
  for (let step = 0; step < 60; step += 1) {
    const plan = planNextActivity({ practiceMode:'adaptive', mastery:mastery('secure'), recentActivities:recent, availableContent:ACTIVITY_TYPES.map(activity => activity.id) });
    assert.notEqual(plan.activityType, RETIRED, `step ${step}`);
    recent.push({ type:plan.activityType, correct:true });
  }
});

test('staff preview has no separate generation path: it shares the one planner → builder flow', () => {
  const app = source('../src/vocabulary/app.js');
  const sessionTargets = source('../src/vocabulary/session-targets.js');
  assert.match(app, /buildTargetPracticeQuestion\(/);
  assert.equal((sessionTargets.match(/buildActivity\(/g) ?? []).length, 1, 'exactly one shared buildActivity call site');
  assert.match(sessionTargets, /activityType:plan\.activityType/);
  assert.equal((sessionTargets.match(/planNextActivity\(/g) ?? []).length, 1, 'exactly one shared planNextActivity call site');
  for (const file of ['teacher-app.js', 'teacher-views.js', 'router.js']) {
    assert.doesNotMatch(source(`../src/vocabulary/${file}`), /buildActivity\(|collocation_builder/, file);
  }
  assert.match(app, /state\.preview/);
});

test('direct generation of collocation_builder is rejected for every Unit 1 target, at every stage', () => {
  const withCollocations = unit1.items.filter(item => item.collocations.length > 0);
  assert.ok(withCollocations.length >= 30, 'legacy collocation data is present to try to generate from');
  for (const item of withCollocations) {
    for (const status of STAGES) {
      assert.throws(
        () => buildActivity({ activityType:RETIRED, ...targetArgs(item), mastery:{ status }, readinessStage:status, seed:'direct' }),
        /temporarily unavailable/,
        `${item.term}/${status}`
      );
    }
  }
});

test('legacy collocation data is untouched and Unit 1 content still validates and loads', () => {
  assert.equal(unit1.items.length, 50);
  const preference = unit1.items.find(item => item.term === 'preference');
  assert.ok(preference.collocations.includes('personal preference'), 'legacy collocations are retained for the later rebuild');
  const result = validateUnit(unit1);
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
});

test('items that carry legacy collocations still build every other live activity without crashing', () => {
  const withCollocations = unit1.items.filter(item => item.collocations.length > 0);
  for (const item of withCollocations) {
    const activity = buildActivity({ activityType:'meaning_match', ...targetArgs(item), mastery:{ status:'new' }, seed:'legacy-load' });
    assert.equal(activity.type, 'meaning_match', item.term);
    assert.ok(activity.prompt, item.term);
  }
});

test('the live vocabulary catalogue stays coherent after retirements and every mode still has work', () => {
  assert.ok(activityDefinition('correct_usage')?.retired, 'retired correct_usage definition is retained');
  assert.ok(activityDefinition(RETIRED)?.retired, 'retired collocation definition is retained');
  assert.ok(LIVE_IDS.length > 0);
  assert.deepEqual(activitiesForMode('adaptive').map(activity => activity.id), LIVE_IDS);
  for (const mode of MODES) assert.ok(activitiesForMode(mode).length > 0, mode);
  for (const id of LIVE_IDS) assert.equal(isActivityLive(id), true, id);
});

test('server refuses NEW collocation_builder attempts but accepts every live activity type', () => {
  const base = { occurrenceId:'u1_46_significant', contextId:'sig_ctx_3', rawAnswer:'a significant change' };
  assert.throws(() => validateVocabularyAttempt({ ...base, questionType:RETIRED }), /no longer available/);
  assert.throws(() => validateVocabularyAttempt({ ...base, questionType:RETIRED, strands:['production'], evidenceStrength:'strong', productive:true }), /no longer available/);
  for (const id of LIVE_IDS) {
    assert.equal(validateVocabularyAttempt({ ...base, questionType:id }).questionType, id, id);
  }
});

test('historical collocation_builder attempts remain readable (metadata + strand mapping unchanged)', () => {
  const metadata = buildStoredAttemptMetadata({
    unitNumber:1, questionType:RETIRED, correct:false, evidenceStrength:'strong', supportLevel:'light',
    misconceptionCategory:'unnatural_collocation', vocabularyId:'vocab_preference', occurrenceId:'u1_02_preference'
  });
  assert.equal(metadata.question_type, RETIRED);
  assert.equal(metadata.evidence_strength, 'strong');
  assert.equal(metadata.misconception, 'unnatural_collocation');
  assert.equal(strandForQuestionType(RETIRED), 'production');
});