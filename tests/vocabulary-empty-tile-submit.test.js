import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('tile tasks require a student-selected tile before local marking or persistence', () => {
  const responseGuardIndex = app.indexOf("current.question.responseMode === 'tiles'");
  const selectedTileIndex = app.indexOf("[data-tile-answer].is-used");
  const markingIndex = app.indexOf('markVocabularyAttemptLocally(current, rawAnswer)');
  assert.ok(responseGuardIndex >= 0, 'tile response-mode guard should exist');
  assert.ok(selectedTileIndex > responseGuardIndex, 'tile guard should inspect selected tiles');
  assert.ok(markingIndex > selectedTileIndex, 'tile guard must run before local marking');
  assert.match(app, /Choose at least one tile before checking\./);
});
