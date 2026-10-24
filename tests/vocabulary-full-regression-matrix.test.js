import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { activityDefinition, isActivityLive } from '../src/vocabulary/activity-catalogue.js';
import { selectEligiblePriorityTargets, buildTargetPracticeQuestion } from '../src/vocabulary/session-targets.js';

const PRACTICE_MODES = ['learn','context','question_text','phrase_paraphrase','idea_paraphrase','writing','adaptive'];
const STAGES = ['new','building','secure','mastered'];
const RETIRED = new Set(['correct_usage','collocation_builder']);
const QUESTIONS_PER_CELL = 10;

function masteryForStage(status) {
  const evidence = status === 'new' ? 0 : status === 'building' ? 1 : 6;
  return {
    status,
    strandEvidence:{ meaning:evidence, recognition:evidence, context:evidence, paraphrasing:evidence, production:evidence },
    recentErrorCount:0,
    recentErrorPattern:null,
    reviewDueAt:status === 'mastered' ? '2026-10-17T00:00:00.000Z' : null,
    successfulProductions:status === 'mastered' ? 2 : 0,
    productionContextIds:status === 'mastered' ? ['ctx-a','ctx-b'] : [],
    productionActivityTypes:status === 'mastered' ? ['rewrite_phrase','rewrite_idea'] : [],
    unscaffoldedProductions:status === 'mastered' ? 1 : 0,
    recoveryCount:0,
    reviewStage:status === 'mastered' ? 1 : 0,
    reviewFailureCount:0
  };
}

function masteryMap(status) {
  return Object.fromEntries(unit1.items.map(item => [item.vocabularyId, masteryForStage(status)]));
}

function content() {
  const itemsById = Object.fromEntries(unit1.items.map(item => [item.vocabularyId, item]));
  const contextsByOccurrence = {};
  for (const context of unit1.contexts) (contextsByOccurrence[context.occurrenceId] ??= []).push(context);
  return {
    occurrences:unit1.occurrences,
    items:unit1.items,
    itemsById,
    contexts:unit1.contexts,
    contextsByOccurrence,
    activities:unit1.activities
  };
}

function assertModeContract(practiceMode, activityType, label) {
  assert.equal(isActivityLive(activityType), true, `${label}: ${activityType} must be live`);
  assert.equal(RETIRED.has(activityType), false, `${label}: retired activity ${activityType} leaked into session`);
  const definition = activityDefinition(activityType);
  assert.ok(definition, `${label}: ${activityType} must exist in catalogue`);
  if (practiceMode !== 'adaptive') {
    assert.ok(definition.practiceModes.includes(practiceMode), `${label}: ${activityType} is not valid for ${practiceMode}`);
  }
}

test('full mode × mastery-stage matrix sustains Q1→Q10 with only live, buildable, mode-valid activities', () => {
  const unitContent = content();
  let builtCount = 0;

  for (const practiceMode of PRACTICE_MODES) {
    for (const stage of STAGES) {
      const masteryByVocabularyId = masteryMap(stage);
      const selected = selectEligiblePriorityTargets({
        content:unitContent,
        masteryByVocabularyId,
        unitMastery:{},
        practiceMode,
        now:new Date('2026-10-18T00:00:00.000Z'),
        limit:Math.max(QUESTIONS_PER_CELL, unitContent.occurrences.length)
      });

      assert.ok(selected.length >= QUESTIONS_PER_CELL, `${practiceMode}/${stage}: fewer than ten eligible targets (${selected.length})`);

      const recentByOccurrence = new Map();
      const usedByOccurrence = new Map();

      for (let index = 0; index < QUESTIONS_PER_CELL; index += 1) {
        const target = selected[index % selected.length];
        const recentActivities = recentByOccurrence.get(target.occurrenceId) ?? [];
        const usedContentIds = usedByOccurrence.get(target.occurrenceId) ?? [];
        const label = `${practiceMode}/${stage}/Q${index + 1}/${target.occurrenceId}`;

        const built = buildTargetPracticeQuestion({
          content:unitContent,
          target,
          mastery:masteryByVocabularyId[target.vocabularyId],
          practiceMode,
          recentActivities,
          supportState:null,
          reviewDue:stage === 'mastered',
          usedContentIds,
          seed:`matrix:${practiceMode}:${stage}:q${index + 1}:${target.occurrenceId}`
        });

        assert.ok(built.question, `${label}: missing question`);
        assert.ok(built.question.prompt?.trim(), `${label}: missing prompt`);
        assert.ok(built.question.type, `${label}: missing activity type`);
        assertModeContract(practiceMode, built.question.type, label);
        assert.ok(built.availableContent.includes(built.question.type), `${label}: planner chose content not available for target`);
        assert.equal(built.plan.activityType, built.question.type, `${label}: planner/builder activity mismatch`);

        recentByOccurrence.set(target.occurrenceId, [...recentActivities, { type:built.question.type, correct:true }].slice(-6));
        if (built.question.contentId) usedByOccurrence.set(target.occurrenceId, [...new Set([...usedContentIds, built.question.contentId])]);
        builtCount += 1;
      }
    }
  }

  assert.equal(builtCount, PRACTICE_MODES.length * STAGES.length * QUESTIONS_PER_CELL);
});

test('matrix coverage remains exactly seven modes × four stages × ten questions', () => {
  assert.equal(PRACTICE_MODES.length, 7);
  assert.deepEqual(STAGES, ['new','building','secure','mastered']);
  assert.equal(PRACTICE_MODES.length * STAGES.length * QUESTIONS_PER_CELL, 280);
});
