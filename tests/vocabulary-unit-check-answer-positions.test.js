import test from 'node:test';
import assert from 'node:assert/strict';
import { UNIT_CHECKS } from '../content/vocabulary/checks/index.js';

// Correct answers must not sit in a guessable position. Units 1, 4 and 6 predate this rule and are
// listed so the gap stays visible; remove a unit from this set once its forms are rebalanced.
const PENDING_REVIEW = new Set(['1', '4', '6']);
const LETTERS = ['A', 'B', 'C', 'D'];

function answerPositions(form) {
  return form.questions.filter(q => Array.isArray(q.choices)).map(q => q.choices.indexOf(q.answer));
}

for (const [unit, check] of Object.entries(UNIT_CHECKS)) {
  if (PENDING_REVIEW.has(unit)) continue;
  for (const [formId, form] of Object.entries(check.forms)) {
    test(`Unit ${unit} Form ${formId}: correct answers are spread irregularly across A-D`, () => {
      const positions = answerPositions(form);
      assert.ok(positions.length > 0);
      for (const position of positions) assert.ok(position >= 0, 'every answer appears in its choices');
      const total = form.questions.length;
      for (let letter = 0; letter < 4; letter++) {
        const score = positions.filter(position => position === letter).length;
        assert.ok(score <= 4, `always choosing ${LETTERS[letter]} scores ${score}/${total}`);
        assert.ok(score >= 1, `${LETTERS[letter]} is never the correct answer`);
      }
      for (let i = 0; i + 2 < positions.length; i++) {
        assert.ok(!(positions[i] === positions[i + 1] && positions[i + 1] === positions[i + 2]), `three answers in a row at ${LETTERS[positions[i]]}`);
      }
      for (let period = 1; period <= 4; period++) {
        const repeats = positions.every((position, i) => i + period >= positions.length || position === positions[i + period]);
        assert.ok(!repeats, `answer positions repeat every ${period} questions`);
      }
    });
  }
}

test('pending-review units are real registered checks, so the exemption cannot hide a missing unit', () => {
  for (const unit of PENDING_REVIEW) assert.ok(UNIT_CHECKS[unit], `unit ${unit}`);
});
