import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { unit1WordFamilies, unit1WordFamilyRejected } from '../content/vocabulary/units/unit-01-word-families.js';

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

test('every served Unit 1 Word Family target (the 29 authored families) has enough genuine forms for Match and enough prompt depth to rotate', () => {
  const authored = new Set(Object.keys(unit1WordFamilies));
  const targets = unit1.items.filter(item => authored.has(item.term));
  assert.equal(targets.length, 29, 'Unit 1 serves the 29 authored, eligible Word Families');
  // rejected headwords keep no family list, so Recognise/Match never offer an unauthorised member
  for (const term of Object.keys(unit1WordFamilyRejected)) assert.deepEqual(unit1.items.find(item => item.term === term).wordFamily, [], term);

  for (const item of targets) {
    const records = familyRecordsFor(item.vocabularyId);
    const forms = distinctFamilyForms(item);
    assert.ok(forms.size >= 3, `${item.term} needs at least 3 distinct family forms for meaningful Match discrimination`);
    assert.ok(records.length >= 2, `${item.term} needs at least two curated Word Family prompts before cue reuse`);
    assert.equal(new Set(records.map(record => record.activityContentId)).size, records.length, `${item.term} Word Family content IDs must be unique`);
  }
});
