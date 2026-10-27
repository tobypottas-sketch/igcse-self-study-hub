import test from 'node:test';
import assert from 'node:assert/strict';
import { unit1VocabularyCheck } from '../content/vocabulary/checks/unit-01-check.js';

const expectedTypes = ['passage_mcq','passage_mcq','passage_mcq','passage_mcq','passage_mcq','passage_mcq','paraphrase_mcq','paraphrase_mcq','word_form','precision_mcq'];

test('Unit 1 formal check ships three equivalent unseen forms', () => {
  assert.equal(unit1VocabularyCheck.unitNumber, 1);
  assert.equal(unit1VocabularyCheck.title, 'Unit Vocabulary Check');
  assert.deepEqual(Object.keys(unit1VocabularyCheck.forms), ['A','B','C']);
  const passages = Object.values(unit1VocabularyCheck.forms).map(form => form.passage);
  assert.equal(new Set(passages).size, 3, 'each attempt uses a different passage');

  for (const [formId, form] of Object.entries(unit1VocabularyCheck.forms)) {
    assert.equal(form.id, formId);
    assert.equal(form.questions.length, 10);
    assert.deepEqual(form.questions.map(question => question.type), expectedTypes);
    assert.equal((form.passage.match(/\[\[[1-6]\]\]/g) ?? []).length, 6, `${formId} passage contains six numbered gaps`);
    for (const question of form.questions) {
      assert.ok(question.id && question.prompt && question.answer && question.diagnostic && question.explanation);
      if (question.type.endsWith('_mcq')) {
        assert.equal(question.choices.length, 4);
        assert.ok(question.choices.includes(question.answer));
      } else {
        assert.equal(question.choices, undefined);
      }
      assert.equal(question.diagnostic.toLowerCase().includes(String(question.answer).toLowerCase()), false, `${formId} ${question.id} diagnostic must not reveal the answer`);
    }
  }
});
