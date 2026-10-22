import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';

const records = unit1.activities.filter(row => row.contentType === 'writing_set' && row.activityData?.taskType === 'improve_vocabulary');

test('every Unit 1 word has at least two Precision & Use items', () => {
  for (const item of unit1.items) {
    const own = records.filter(row => row.activityData.linkedVocabularyIds.includes(item.vocabularyId));
    assert.ok(own.length >= 2, `${item.term} has ${own.length} Precision & Use items`);
  }
});

test('Precision & Use items have a quoted vague wording, an answer, and three distinct wrong options', () => {
  for (const row of records.filter(record => record.activityContentId.startsWith('u1_writing_precision_'))) {
    const data = row.activityData;
    assert.match(data.prompt, /“[^”]+”/, row.activityContentId);
    assert.ok(data.acceptedAnswers.length >= 1, row.activityContentId);
    const vague = data.prompt.match(/“([^”]+)”/)[1];
    assert.ok(data.sourceText.includes(vague), `${row.activityContentId}: source must contain the vague wording`);
    if (data.distractors) {
      assert.ok(data.distractors.length >= 3, row.activityContentId);
      assert.equal(new Set(data.distractors).size, data.distractors.length, row.activityContentId);
      assert.ok(data.distractors.every(option => !data.acceptedAnswers.map(a => a.toLowerCase()).includes(option.toLowerCase())), `${row.activityContentId}: a wrong option is also an accepted answer`);
    }
  }
});
