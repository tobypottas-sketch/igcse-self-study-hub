import test from 'node:test';
import assert from 'node:assert/strict';
import { supportiveFeedback } from '../src/vocabulary/views.js';

test('Spelling & Recall wrong-answer fallback talks about spelling', () => {
  for (const questionType of ['spelling_choice','spelling_rebuild','spell_word','spell_in_context','spot_the_error']) {
    assert.equal(
      supportiveFeedback({ correct:false, questionType }),
      'Not quite. Check the spelling carefully and try once more with support.'
    );
  }
});

test('non-spelling fallback still talks about meaning', () => {
  assert.equal(
    supportiveFeedback({ correct:false, questionType:'definition_to_word' }),
    'Not quite. Check the meaning carefully and try once more with support.'
  );
});
