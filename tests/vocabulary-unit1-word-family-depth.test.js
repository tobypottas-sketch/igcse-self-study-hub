import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';

function familyRecordsFor(vocabularyId) {
  return unit1.activities.filter(activity =>
    activity?.contentType === 'writing_set' &&
    activity?.activityData?.taskType === 'word_family' &&
    (activity.activityData?.linkedVocabularyIds ?? []).includes(vocabularyId)
  );
}

function distinctFamilyForms(item) {
  return new Set([item?.term, ...(item?.wordFamily ?? [])]
    .map(value => String(value ?? '').trim().toLowerCase())
    .filter(Boolean));
}

test('every curated Unit 1 Word Family target has enough genuine forms for Match and enough prompt depth to rotate', () => {
  const targets = unit1.items.filter(item => familyRecordsFor(item.vocabularyId).length > 0);
  assert.equal(targets.length, 37, 'Unit 1 should expose the full curated 37-target Word Families cohort (25 + 12)');

  for (const item of targets) {
    const records = familyRecordsFor(item.vocabularyId);
    const forms = distinctFamilyForms(item);
    assert.ok(forms.size >= 3, `${item.term} needs at least three distinct family forms for meaningful Match discrimination`);
    assert.ok(records.length >= 2, `${item.term} needs at least two curated Word Family prompts before cue reuse`);
    assert.equal(new Set(records.map(record => record.activityContentId)).size, records.length, `${item.term} Word Family content IDs must be unique`);
  }
});
