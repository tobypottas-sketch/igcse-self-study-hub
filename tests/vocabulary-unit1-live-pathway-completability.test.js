import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { buildPathwayCoverage } from '../src/vocabulary/pathway-coverage.js';
import { planPathwayQuestion } from '../src/vocabulary/pathway-planner.js';
import { freshPathwayProgress, applyPathwayAttempt, currentPathwayStage } from '../src/vocabulary/pathway-progress.js';
import { PATHWAY_STAGES } from '../src/vocabulary/pathway-model.js';

function plannerContent(unit) {
  const content = {
    occurrences:unit.occurrences,
    items:unit.items,
    contexts:unit.contexts,
    activities:unit.activities,
    itemsById:Object.fromEntries(unit.items.map(item => [item.vocabularyId,item])),
    contextsByOccurrence:{}
  };
  for (const context of unit.contexts) (content.contextsByOccurrence[context.occurrenceId] ??= []).push(context);
  return content;
}

function strongMastery() {
  return {
    status:'mastered',
    strandEvidence:{ meaning:8, recognition:8, context:8, paraphrasing:8, production:8 },
    successfulProductions:2,
    productionContextIds:['ctx-a','ctx-b'],
    productionActivityTypes:['rewrite_phrase','rewrite_idea'],
    unscaffoldedProductions:1,
    recentErrorCount:0,
    reviewFailureCount:0
  };
}

function serverLikeAttempt(pathwayId, stageId, question) {
  const evidenceId = question.contentId;
  return {
    stageId,
    servedStageId:stageId,
    correct:true,
    firstAttempt:true,
    retryUsed:false,
    supportLevel:'none',
    contentId:evidenceId,
    contextId:question.contentSource === 'context' ? evidenceId : null,
    promptKey:`${evidenceId}:${question.activityVariantId ?? question.type}`,
    activityType:question.type,
    operation:question.type,
    contextSensitive:pathwayId === 'context' && stageId === 'apply'
  };
}

function completeStage({ pathwayId, stageId, content, target, progress }) {
  let next = progress;
  const usedContentIds = [];
  const recentActivities = [];

  for (let attemptIndex = 0; attemptIndex < 8 && !next.stages[stageId].completed; attemptIndex += 1) {
    const built = planPathwayQuestion({
      pathwayId,
      stageId,
      content,
      target,
      mastery:strongMastery(),
      recentActivities,
      usedContentIds,
      seed:`perfect:${pathwayId}:${stageId}:${target.occurrenceId}:${attemptIndex}`
    });
    const question = built.question;
    next = applyPathwayAttempt(next,serverLikeAttempt(pathwayId,stageId,question));
    if (question.contentId) usedContentIds.push(question.contentId);
    if (question.type) recentActivities.push(question.type);
  }

  return next;
}

const content = plannerContent(unit1);
const coverage = buildPathwayCoverage({ content });
const LIVE_PATHWAYS = ['meaning','context','word_families','spelling_recall'];

test('Unit 1 Word Families exposes only targets with enough same-family forms for a genuine Match rung', () => {
  const expected = unit1.occurrences
    .filter(occurrence => {
      const item = content.itemsById[occurrence.vocabularyId];
      const family = new Set((item?.wordFamily ?? []).map(value => String(value).trim().toLowerCase()).filter(Boolean));
      const hasCuratedFamilyPrompt = unit1.activities.some(activity =>
        activity.contentType === 'writing_set' &&
        activity.activityData?.taskType === 'word_family' &&
        (activity.activityData?.linkedVocabularyIds ?? []).includes(occurrence.vocabularyId)
      );
      return family.size >= 4 && hasCuratedFamilyPrompt;
    })
    .map(occurrence => occurrence.occurrenceId)
    .sort();
  assert.ok(expected.length > 0,'Unit 1 needs real four-form word-family targets');
  assert.equal(coverage.word_families.available,true,'Word Families must be live for its genuinely serviceable cohort');
  assert.deepEqual([...coverage.word_families.occurrenceIds].sort(),expected);
});

test('every Unit 1 pathway declared live is genuinely completable to Mastery for every serviceable word', () => {
  for (const pathwayId of LIVE_PATHWAYS) {
    assert.equal(coverage[pathwayId].available,true,`${pathwayId} must be declared live for this test`);
    const serviceable = new Set(coverage[pathwayId].occurrenceIds);
    assert.ok(serviceable.size > 0,`${pathwayId} needs a real serviceable cohort`);

    for (const target of content.occurrences.filter(row => serviceable.has(row.occurrenceId))) {
      let progress = freshPathwayProgress();
      for (const stage of PATHWAY_STAGES) {
        assert.equal(currentPathwayStage(progress),stage.id,`${pathwayId}/${target.occurrenceId}: expected ${stage.id} before stage simulation`);
        progress = completeStage({ pathwayId, stageId:stage.id, content, target, progress });
        assert.equal(progress.stages[stage.id].completed,true,`${pathwayId}/${target.occurrenceId}/${stage.id}: declared-live rung cannot actually complete`);
      }
      assert.equal(progress.stages.mastery.completed,true,`${pathwayId}/${target.occurrenceId}: pathway cannot reach Mastery`);
    }
  }
});

test('Unit 1 pathways withheld for incomplete banks are excluded from the completability gate', () => {
  for (const pathwayId of ['paraphrasing','precision_use']) {
    assert.equal(coverage[pathwayId].available,false,pathwayId);
    assert.equal(coverage[pathwayId].reason,'content_bank_incomplete',pathwayId);
  }
});
