import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { ACTIVITY_TYPES, PRACTICE_MODES, activityDefinition, activitiesForMode, activitiesForStage, isActivityLive } from '../src/vocabulary/activity-catalogue.js';
import { planNextActivity } from '../src/vocabulary/adaptive-planner.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';
import { validateVocabularyAttempt, buildStoredAttemptMetadata, strandForQuestionType } from '../supabase/functions/vocabulary-attempt-action/validation.js';

const RETIRED = 'correct_usage';
const STAGES = ['new','building','secure','mastered'];
const MODES = PRACTICE_MODES.map(mode => mode.id);

function mastery(status) {
  return { status, strandEvidence:{ meaning:9, recognition:9, context:9, paraphrasing:9, production:9 }, recentErrorCount:0 };
}
function targetArgs(item) {
  const occurrence = unit1.occurrences.find(row => row.vocabularyId === item.vocabularyId);
  const contexts = unit1.contexts.filter(row => row.occurrenceId === occurrence.occurrenceId);
  return { occurrence, item, contexts, unitActivities:unit1.activities, unitItems:unit1.items, unitContexts:unit1.contexts, unitOccurrences:unit1.occurrences };
}
function source(path) { return fs.readFileSync(new URL(path, import.meta.url), 'utf8'); }

test('Correct Usage remains defined for history but is retired from live activity selection', () => {
  const definition = activityDefinition(RETIRED);
  assert.ok(definition);
  assert.equal(definition.retired, true);
  assert.equal(isActivityLive(RETIRED), false);
  for (const mode of MODES) assert.equal(activitiesForMode(mode).some(activity => activity.id === RETIRED), false, mode);
  for (const stage of STAGES) assert.equal(activitiesForStage(stage).some(activity => activity.id === RETIRED), false, stage);
});

test('planner never selects Correct Usage, including when stale clients advertise it', () => {
  const advertisedEverything = ACTIVITY_TYPES.map(activity => activity.id);
  for (const practiceMode of MODES) {
    for (const stage of STAGES) {
      const plan = planNextActivity({ practiceMode, mastery:mastery(stage), recentActivities:[], availableContent:advertisedEverything });
      assert.notEqual(plan.activityType, RETIRED, `${practiceMode}/${stage}`);
    }
  }
});

test('direct Correct Usage generation is rejected instead of building mixed-format distractors', () => {
  const buildable = unit1.items.filter(item => {
    const args = targetArgs(item);
    try {
      buildActivity({ activityType:RETIRED, ...args, mastery:{ status:'building' }, readinessStage:'building', seed:'usage-audit' });
      return true;
    } catch {
      return false;
    }
  });
  assert.ok(buildable.length > 0, 'old implementation should have had live Correct Usage targets');
  for (const item of buildable.slice(0, 10)) {
    assert.throws(
      () => buildActivity({ activityType:RETIRED, ...targetArgs(item), mastery:{ status:'building' }, readinessStage:'building', seed:'direct' }),
      /temporarily unavailable/,
      item.term
    );
  }
});

test('authoritative server rejects new Correct Usage attempts while history remains readable', () => {
  const base = { occurrenceId:'u1_02_preference', contextId:'u1_02_preference_meaning', rawAnswer:'example' };
  assert.throws(() => validateVocabularyAttempt({ ...base, questionType:RETIRED }), /no longer available/);

  const metadata = buildStoredAttemptMetadata({
    unitNumber:1, questionType:RETIRED, correct:false, evidenceStrength:'medium', supportLevel:'none',
    misconceptionCategory:'context_mismatch', vocabularyId:'vocab_preference', occurrenceId:'u1_02_preference'
  });
  assert.equal(metadata.question_type, RETIRED);
  assert.equal(metadata.evidence_strength, 'medium');
  assert.equal(strandForQuestionType(RETIRED), 'context');
});

test('there is no separate staff-preview generation path that can bypass retirement', () => {
  const app = source('../src/vocabulary/app.js');
  const sessionTargets = source('../src/vocabulary/session-targets.js');
  assert.match(app, /buildTargetPracticeQuestion\(/);
  assert.equal((sessionTargets.match(/buildActivity\(/g) ?? []).length, 1);
  assert.equal((sessionTargets.match(/planNextActivity\(/g) ?? []).length, 1);
});
