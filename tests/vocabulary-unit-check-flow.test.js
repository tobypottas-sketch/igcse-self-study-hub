import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const controller = fs.readFileSync(new URL('../src/vocabulary/unit-check-controller.js', import.meta.url), 'utf8');
const router = fs.readFileSync(new URL('../src/vocabulary/router.js', import.meta.url), 'utf8');
const page = fs.readFileSync(new URL('../vocabulary.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../vocabulary-unit-check.css', import.meta.url), 'utf8');

test('formal check is an isolated Unit 1 layer, not a seventh pathway', () => {
  assert.match(controller, /visibleUnitNumber\(\) !== 1/);
  assert.match(controller, /\.vocab-pathways/);
  assert.match(controller, /insertAdjacentHTML\('afterend'/);
  assert.doesNotMatch(controller, /VOCABULARY_PATHWAYS|pathwayId|pathwayStage|Stage Contract|setRows/);
  assert.doesNotMatch(controller, /submitVocabularyAttempt|createAttemptPersistence|recordVocabularyMission/);
});

test('student and staff preview load the check controller, while teacher analytics does not', () => {
  assert.equal((router.match(/import\('\.\/unit-check-controller\.js'\)/g) ?? []).length, 2);
  const teacherBlock = router.slice(router.indexOf("if (staff) {"), router.indexOf("if (profile.role === 'student')"));
  assert.doesNotMatch(teacherBlock, /unit-check-controller/);
});

test('an attempt is only advanced after a score-only save succeeds', () => {
  assert.match(controller, /const scored = scoreCheck/);
  assert.match(controller, /await recordVocabularyUnitCheckAttempt/);
  assert.match(controller, /attemptsCache\.set\(1, attempts\)/);
  assert.match(controller, /finishSavedAttempt\(scored, attempts\)/);
  assert.match(controller, /this attempt has not been used/);
  assert.doesNotMatch(controller, /answers\s*:/g, 'answers are not included in the persistence call');
});

test('passage layout stays sticky and remains available on narrow screens', () => {
  assert.match(page, /vocabulary-unit-check\.css/);
  assert.match(css, /\.vocab-unit-check-passage\{[^}]*position:sticky/s);
  assert.match(css, /@media\(max-width:900px\)/);
  assert.match(css, /\.vocab-unit-check-passage\.is-collapsed \.vocab-unit-check-passage__body\{display:none\}/);
  assert.match(css, /\.vocab-unit-check-passage__head/);
});
