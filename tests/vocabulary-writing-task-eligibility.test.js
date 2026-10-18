import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';
import { availableActivityTypesForTarget } from '../src/vocabulary/session-targets.js';

function targetFor(vocabularyId) {
  const target = unit1.occurrences.find(row => row.vocabularyId === vocabularyId);
  const item = unit1.items.find(row => row.vocabularyId === vocabularyId);
  assert.ok(target, `missing occurrence for ${vocabularyId}`);
  assert.ok(item, `missing item for ${vocabularyId}`);
  return { target, item };
}

function contextsFor(target) {
  return unit1.contexts.filter(row => row.occurrenceId === target.occurrenceId);
}

function buildImprove(vocabularyId) {
  const { target, item } = targetFor(vocabularyId);
  return buildActivity({
    activityType:'improve_vocabulary',
    occurrence:target,
    item,
    contexts:contextsFor(target),
    unitActivities:unit1.activities,
    unitItems:unit1.items,
    unitContexts:unit1.contexts,
    unitOccurrences:unit1.occurrences,
    mastery:{ status:'secure' },
    readinessStage:'secure',
    seed:`writing-task-type:${vocabularyId}`
  });
}

test('Improve the Vocabulary only uses writing_set records curated for improve_vocabulary', () => {
  const question = buildImprove('vocab_intense');
  assert.equal(question.taskType, 'improve_vocabulary');
  assert.equal(question.contentId, 'u1_writing_avoid_repeat');
});

test('Improve the Vocabulary never borrows a collocation task from the same or another target', () => {
  assert.throws(
    () => buildImprove('vocab_achievement'),
    /No curated improve_vocabulary content is available for this target/,
    'achievement only has a collocation writing_set and must fail closed rather than relabel it'
  );
});

test('target eligibility advertises improve_vocabulary only for targets with a matching writing task type', () => {
  const content = { activities:unit1.activities };

  const intense = targetFor('vocab_intense');
  const intenseTypes = availableActivityTypesForTarget({
    content,
    target:intense.target,
    item:intense.item,
    contexts:contextsFor(intense.target)
  });
  assert.ok(intenseTypes.includes('improve_vocabulary'));

  const achievement = targetFor('vocab_achievement');
  const achievementTypes = availableActivityTypesForTarget({
    content,
    target:achievement.target,
    item:achievement.item,
    contexts:contextsFor(achievement.target)
  });
  assert.equal(achievementTypes.includes('improve_vocabulary'), false);
});

test('Word Family Switch remains limited to word_family writing records', () => {
  const { target, item } = targetFor('vocab_competitor');
  const question = buildActivity({
    activityType:'word_family_switch',
    occurrence:target,
    item,
    contexts:contextsFor(target),
    unitActivities:unit1.activities,
    unitItems:unit1.items,
    unitContexts:unit1.contexts,
    unitOccurrences:unit1.occurrences,
    mastery:{ status:'building' },
    readinessStage:'building',
    seed:'word-family-control'
  });
  assert.equal(question.contentId, 'u1_writing_word_family_compete');
  assert.equal(question.taskType, undefined, 'word-family builder need not expose taskType; content identity is authoritative');
});
