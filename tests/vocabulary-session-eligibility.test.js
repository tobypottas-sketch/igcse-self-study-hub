import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { selectEligiblePriorityTargets, buildTargetPracticeQuestion } from '../src/vocabulary/session-targets.js';

const PRACTICE_MODES = ['learn','context','question_text','phrase_paraphrase','idea_paraphrase','writing','adaptive'];

function masteryByVocabularyId() {
  return Object.fromEntries(unit1.items.map(item => [item.vocabularyId, {
    status:'new',
    strandEvidence:{ meaning:0, recognition:0, context:0, paraphrasing:0, production:0 },
    recentErrorCount:0,
    reviewDueAt:null,
    successfulProductions:0,
    productionContextIds:[],
    productionActivityTypes:[],
    unscaffoldedProductions:0,
    reviewStage:0,
    reviewFailureCount:0
  }]));
}

function content() {
  const itemsById = Object.fromEntries(unit1.items.map(item => [item.vocabularyId, item]));
  const contextsByOccurrence = {};
  for (const context of unit1.contexts) (contextsByOccurrence[context.occurrenceId] ??= []).push(context);
  return { occurrences:unit1.occurrences, items:unit1.items, itemsById, contexts:unit1.contexts, contextsByOccurrence, activities:unit1.activities };
}

function selectionArgs(practiceMode, limit = 10) {
  return {
    content:content(),
    masteryByVocabularyId:masteryByVocabularyId(),
    unitMastery:{},
    practiceMode,
    now:new Date('2026-10-18T00:00:00Z'),
    limit
  };
}

test('eligibility-first selection returns ten genuinely buildable targets for every practice mode in Unit 1', () => {
  for (const practiceMode of PRACTICE_MODES) {
    const args = selectionArgs(practiceMode, 10);
    const selected = selectEligiblePriorityTargets(args);
    assert.equal(selected.length, 10, `${practiceMode} should have ten eligible Unit 1 targets`);
    for (const [index, target] of selected.entries()) {
      assert.doesNotThrow(() => buildTargetPracticeQuestion({
        content:args.content,
        target,
        mastery:args.masteryByVocabularyId[target.vocabularyId],
        practiceMode,
        recentActivities:[],
        supportState:null,
        reviewDue:false,
        usedContentIds:[],
        seed:`${practiceMode}:q${index + 1}`
      }), `${practiceMode} Q${index + 1} target ${target.occurrenceId}`);
    }
  }
});

test('focused selection ranks only eligible targets and passes practiceMode into priority scoring', () => {
  const args = selectionArgs('idea_paraphrase', 10);
  const selected = selectEligiblePriorityTargets(args);
  assert.equal(selected.length, 10);
  assert.ok(selected.every(target => target.eligibility?.practiceMode === 'idea_paraphrase'));
  assert.ok(selected.every(target => Array.isArray(target.eligibility?.availableActivityTypes) && target.eligibility.availableActivityTypes.length > 0));
});

test('timed replenishment can repeatedly obtain ten buildable questions without falling back to ineligible targets', () => {
  for (const practiceMode of PRACTICE_MODES) {
    const args = selectionArgs(practiceMode, 20);
    const selected = selectEligiblePriorityTargets(args);
    assert.ok(selected.length >= 10, `${practiceMode} must have enough eligible targets for timed practice`);
    for (let index = 0; index < 10; index += 1) {
      const target = selected[index % selected.length];
      assert.doesNotThrow(() => buildTargetPracticeQuestion({
        content:args.content,
        target,
        mastery:args.masteryByVocabularyId[target.vocabularyId],
        practiceMode,
        recentActivities:[],
        supportState:null,
        reviewDue:false,
        usedContentIds:[],
        seed:`timed:${practiceMode}:q${index + 1}`
      }), `timed ${practiceMode} Q${index + 1}`);
    }
  }
});

test('ineligible high-priority targets cannot displace eligible lower-priority targets', () => {
  const args = selectionArgs('idea_paraphrase', 10);
  const first = args.content.occurrences[0];
  args.masteryByVocabularyId[first.vocabularyId] = {
    ...args.masteryByVocabularyId[first.vocabularyId],
    status:'building',
    recentErrorCount:5,
    recentErrorPattern:'meaning_confusion'
  };
  const selected = selectEligiblePriorityTargets(args);
  const firstIsEligible = selected.some(target => target.occurrenceId === first.occurrenceId);
  if (firstIsEligible) {
    assert.doesNotThrow(() => buildTargetPracticeQuestion({
      content:args.content,
      target:first,
      mastery:args.masteryByVocabularyId[first.vocabularyId],
      practiceMode:'idea_paraphrase',
      recentActivities:[],
      supportState:null,
      reviewDue:false,
      usedContentIds:[],
      seed:'priority-eligibility'
    }));
  }
  assert.equal(selected.length, 10);
});