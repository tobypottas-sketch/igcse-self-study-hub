import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';

function target(vocabularyId) {
  const occurrence = unit1.occurrences.find(row => row.vocabularyId === vocabularyId);
  const item = unit1.items.find(row => row.vocabularyId === vocabularyId);
  const contexts = unit1.contexts.filter(row => row.occurrenceId === occurrence?.occurrenceId);
  assert.ok(occurrence, `missing occurrence ${vocabularyId}`);
  assert.ok(item, `missing item ${vocabularyId}`);
  return { occurrence, item, contexts };
}

test('Which Situation Fits uses four genuine target-free situations, not the target sentence plus word distractors', () => {
  const { occurrence, item, contexts } = target('vocab_leisure');
  const activity = buildActivity({
    activityType:'which_situation_fits', occurrence, item, contexts,
    unitActivities:unit1.activities, mastery:{ status:'new' }, seed:'pedagogical-quality'
  });

  assert.equal(activity.options.length, 4);
  assert.ok(activity.options.every(option => option.trim().split(/\s+/).length >= 5), activity.options.join('\n'));
  assert.ok(activity.options.every(option => !/\bleisure\b/i.test(option)), activity.options.join('\n'));
  assert.equal(activity.markingReference.acceptedAnswers.length, 1);
  assert.ok(activity.options.includes(activity.markingReference.acceptedAnswers[0]));
});

test('Question ↔ Text Bridge makes students match meaning to a paraphrased question rather than choose a copied evidence span', () => {
  const { occurrence, item, contexts } = target('vocab_leisure');
  const activity = buildActivity({
    activityType:'question_text_bridge', occurrence, item, contexts,
    unitActivities:unit1.activities, mastery:{ status:'building' }, readinessStage:'building', seed:'pedagogical-quality'
  });

  assert.equal(activity.options.length, 4);
  assert.ok(activity.options.every(option => option.endsWith('?')), activity.options.join('\n'));
  assert.deepEqual(activity.markingReference.acceptedAnswers, [activity.questionText]);
  assert.ok(activity.options.includes(activity.questionText));
  assert.ok(!activity.sourceText.toLocaleLowerCase('en').includes(activity.questionText.toLocaleLowerCase('en')),
    'correct bridge answer must not simply be copied from the source text');
});

test('Find Evidence remains the exact-evidence task and keeps its answers inside the source text', () => {
  const { occurrence, item, contexts } = target('vocab_leisure');
  const activity = buildActivity({
    activityType:'find_evidence', occurrence, item, contexts,
    unitActivities:unit1.activities, mastery:{ status:'building' }, readinessStage:'building', seed:'pedagogical-quality'
  });
  const source = activity.sourceText.toLocaleLowerCase('en');
  assert.ok(activity.markingReference.acceptedAnswers.length >= 1);
  assert.ok(activity.markingReference.acceptedAnswers.every(answer => source.includes(answer.toLocaleLowerCase('en'))));
});
