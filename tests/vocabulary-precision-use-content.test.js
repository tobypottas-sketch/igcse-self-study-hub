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

import { applyStageVariant } from '../src/vocabulary/stage-variants.js';
import { isPathwayQuestionAllowed } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';

test('Precision & Use Mastery is allowed by the shared contract and each stage is presented differently', () => {
  assert.equal(isPathwayQuestionAllowed('precision_use','mastery','improve_vocabulary'),true);
  const question = { type:'improve_vocabulary', markingReference:{ acceptedAnswers:['relatively'] } };
  const apply = applyStageVariant(question,{ pathwayId:'precision_use', servedStage:'apply' });
  const recall = applyStageVariant(question,{ pathwayId:'precision_use', servedStage:'recall' });
  const mastery = applyStageVariant(question,{ pathwayId:'precision_use', servedStage:'mastery' });
  assert.match(apply.clue,/starts with “r”/);
  assert.match(recall.clue,/10 letters/);
  assert.equal(mastery.clue,undefined);
  assert.equal(mastery.stageVariant,'mastery-no-clue');
  for (const variant of [apply, recall, mastery]) assert.deepEqual(variant.markingReference,question.markingReference);
});
