import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { validateUnit } from '../content/vocabulary/schema.js';

function activities(type) {
  return (unit1.activities ?? []).filter(activity => activity.contentType === type);
}

function normalized(value) {
  return String(value ?? '').trim().toLocaleLowerCase('en');
}

test('Unit 1 keeps the approved 50 targets and passes the strict validator with its new activity bank', () => {
  assert.equal(unit1.items.length, 50);
  assert.equal(unit1.occurrences.length, 50);
  assert.equal(new Set(unit1.items.map(item => item.vocabularyId)).size, 50);
  const result = validateUnit(unit1);
  assert.equal(result.ok, true, result.errors.join('\n'));
});

test('Unit 1 contains a substantial balanced 0511 activity bank', () => {
  assert.ok(activities('phrase_set').length >= 12, 'phrase_set count');
  assert.ok(activities('idea_set').length >= 12, 'idea_set count');
  assert.ok(activities('question_text').length >= 10, 'question_text count');
  assert.ok(activities('writing_set').length >= 8, 'writing_set count');
  assert.equal(new Set(unit1.activities.map(activity => activity.activityContentId)).size, unit1.activities.length);
});

test('phrase sets contain genuine transformations rather than identical wording', () => {
  for (const activity of activities('phrase_set')) {
    const data = activity.activityData;
    assert.notEqual(normalized(data.originalPhrase), normalized(data.equivalentPhrase), activity.activityContentId);
    assert.ok((data.chunks ?? []).length >= 2, activity.activityContentId);
    assert.ok((data.commonMeaningDistortions ?? []).length >= 1, activity.activityContentId);
  }
});

test('idea sets explicitly preserve meaning-bearing details and label deliberate distortions', () => {
  for (const activity of activities('idea_set')) {
    const data = activity.activityData;
    assert.ok((data.meaningInvariants ?? []).length >= 1, activity.activityContentId);
    assert.ok((data.accurateParaphrases ?? []).length >= 1, activity.activityContentId);
    assert.notEqual(normalized(data.originalIdea), normalized(data.accurateParaphrases[0]), activity.activityContentId);
    assert.ok((data.distractors ?? []).every(row => row.text && row.misconceptionCategory), activity.activityContentId);
  }
});

test('Question ↔ Text mini-readings provide multiple questions with exact evidence and paraphrase links', () => {
  for (const activity of activities('question_text')) {
    const data = activity.activityData;
    assert.ok(normalized(data.sourceText).length >= 60, activity.activityContentId);
    assert.ok((data.questions ?? []).length >= 2, activity.activityContentId);
    for (const question of data.questions) {
      assert.ok((question.evidenceSpans ?? []).length >= 1, activity.activityContentId);
      assert.ok((question.paraphraseLinks ?? []).length >= 1, activity.activityContentId);
      for (const span of question.evidenceSpans) {
        assert.ok(normalized(data.sourceText).includes(normalized(span)), `${activity.activityContentId}: evidence span must occur in source text`);
      }
    }
  }
});

test('writing sets are deterministic and tied to vocabulary actually present in Unit 1', () => {
  const itemIds = new Set(unit1.items.map(item => item.vocabularyId));
  for (const activity of activities('writing_set')) {
    const data = activity.activityData;
    assert.ok((data.acceptedAnswers ?? []).length >= 1, activity.activityContentId);
    assert.ok(data.prompt?.trim(), activity.activityContentId);
    assert.ok(data.sourceText?.trim(), activity.activityContentId);
    for (const id of data.linkedVocabularyIds ?? []) assert.ok(itemIds.has(id), `${activity.activityContentId}: ${id}`);
    if (data.primaryEvidenceTargetId) assert.ok((data.linkedVocabularyIds ?? []).includes(data.primaryEvidenceTargetId), activity.activityContentId);
  }
});
