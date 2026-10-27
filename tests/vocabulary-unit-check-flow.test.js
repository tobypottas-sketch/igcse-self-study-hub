import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const controller = fs.readFileSync(new URL('../src/vocabulary/unit-check-controller.js', import.meta.url), 'utf8');
const view = fs.readFileSync(new URL('../src/vocabulary/unit-check-view.js', import.meta.url), 'utf8');
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

test('Vocabulary entry point cache-busts the router that mounts the Unit Check', () => {
  assert.match(page, /src="src\/vocabulary\/router\.js\?v=unit-check-v1"/);
});

test('an attempt is only advanced after a score-only save succeeds', () => {
  assert.match(controller, /const scored = scoreCheck/);
  const saveCall = controller.match(/recordVocabularyUnitCheckAttempt\(client, \{([\s\S]*?)\n    \}\);/)?.[1] ?? '';
  assert.match(saveCall, /unitNumber:1/);
  assert.match(saveCall, /formId:active\.formId/);
  assert.match(saveCall, /attemptNumber:active\.attemptNumber/);
  assert.match(saveCall, /score:scored\.score/);
  assert.match(saveCall, /maxScore:scored\.maxScore/);
  assert.doesNotMatch(saveCall, /answers|studentAnswer|rawAnswer/);
  assert.match(controller, /attemptsCache\.set\(1, attempts\)/);
  assert.match(controller, /finishSavedAttempt\(scored, attempts\)/);
  assert.match(controller, /this attempt has not been used/);
});

test('passage layout stays sticky and remains available on narrow screens', () => {
  assert.match(page, /vocabulary-unit-check\.css/);
  assert.match(css, /\.vocab-unit-check-passage\{[^}]*position:sticky/s);
  assert.match(css, /@media\(max-width:900px\)/);
  assert.match(css, /\.vocab-unit-check-passage\.is-collapsed \.vocab-unit-check-passage__body\{display:none\}/);
  assert.match(css, /\.vocab-unit-check-passage__head/);
});

test('selected context answers are rendered back into reading gaps without correctness feedback', () => {
  assert.match(view, /passageHtml\(form,\s*answers/);
  assert.match(view, /vocab-unit-check-gap--filled/);
  assert.match(view, /answers\?\.\[`q\$\{gapNumber\}`\]/);
  assert.match(controller, /readAnswer\(target\)[\s\S]*paintActive\(/);
  assert.doesNotMatch(view, /vocab-unit-check-gap--correct|vocab-unit-check-gap--wrong/);
});

test('assessment workspace uses a progress bar and 1 to 10 navigator', () => {
  assert.match(view, /vocab-unit-check-meter/);
  assert.match(view, /data-unit-check-action="jump"/);
  assert.match(view, /data-question-index=/);
  assert.match(css, /\.vocab-shell--unit-check\{max-width:min\(1540px,calc\(100vw - 32px\)\)/);
  assert.match(css, /\.vocab-unit-check-question-nav/);
});
