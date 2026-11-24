import test from 'node:test';
import assert from 'node:assert/strict';
import { UNIT_CHECKS } from '../content/vocabulary/checks/index.js';

// Correct answers must not sit in a guessable position, in any unit.
const LETTERS = ['A', 'B', 'C', 'D'];

function answerPositions(form) {
  return form.questions.filter(q => Array.isArray(q.choices)).map(q => q.choices.indexOf(q.answer));
}

for (const [unit, check] of Object.entries(UNIT_CHECKS)) {
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

test('the answer-position rule covers every existing Unit Check, Units 1-9, with no exclusions', () => {
  for (let unit = 1; unit <= 9; unit++) assert.ok(UNIT_CHECKS[String(unit)]?.forms, `unit ${unit}`);
});
