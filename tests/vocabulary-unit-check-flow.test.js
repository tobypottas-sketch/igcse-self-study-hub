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
  assert.equal((router.match(/import\('\.\/unit-check-controller\.js\?v=workspace-v5'\)/g) ?? []).length, 2);
  const teacherBlock = router.slice(router.indexOf("if (staff) {"), router.indexOf("if (profile.role === 'student')"));
  assert.doesNotMatch(teacherBlock, /unit-check-controller/);
});

test('Vocabulary entry point cache-busts compact Unit Check workspace assets', () => {
  assert.match(page, /src="src\/vocabulary\/router\.js\?v=workspace-v5"/);
  assert.match(page, /href="vocabulary-unit-check\.css\?v=workspace-v5"/);
  assert.match(controller, /unit-check-view\.js\?v=workspace-v5/);
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
  assert.match(view, /const questionId = form\?\.questions\?\.\[gapNumber - 1\]\?\.id/);
  assert.match(view, /answers\?\.\[questionId\]/);
  assert.match(view, /vocab-unit-check-gap--filled/);
  assert.match(controller, /readAnswer\(target\)[\s\S]*paintActive\(/);
  assert.doesNotMatch(view, /vocab-unit-check-gap--correct|vocab-unit-check-gap--wrong/);
});

test('compact navigator uses numbers only with no Done or Open labels', () => {
  assert.match(view, /data-unit-check-action="jump"/);
  assert.match(view, /data-question-index=/);
  assert.doesNotMatch(view, /<small>\$\{answered \? 'Done' : 'Open'\}<\/small>/);
  assert.doesNotMatch(view, />Done<|>Open</);
});

test('compact workspace keeps assessment context visible without a tall status block', () => {
  assert.match(view, /vocab-unit-check-topbar__meta/);
  assert.doesNotMatch(view, /vocab-unit-check-status|vocab-unit-check-meter/);
  assert.match(css, /\.vocab-unit-check-topbar\{[^}]*position:sticky/s);
  assert.match(css, /\.vocab-unit-check-layout\{[^}]*min-height:0/s);
  assert.match(css, /\.vocab-unit-check-question\{[^}]*min-height:0/s);
});

test('word-form questions visually emphasize the supplied base word without changing the prompt text', () => {
  assert.match(view, /questionPromptHtml/);
  assert.match(view, /correct form of\\s\+/);
  assert.match(view, /vocab-unit-check-target-word/);
  assert.match(css, /\.vocab-unit-check-target-word\{/);
});

test('active Unit Check exposes a distinct formal assessment theme', () => {
  assert.match(view, /vocab-unit-check-mode-badge/);
  assert.match(view, /Formal check/);
  assert.match(view, /vocab-unit-check-question__accent/);
  assert.match(css, /\.vocab-unit-check-mode-badge\{/);
  assert.match(css, /\.vocab-unit-check-question__accent\{/);
});

test('completion screen has a score medallion and three-attempt journey', () => {
  assert.match(view, /vocab-unit-check-score-medallion/);
  assert.match(view, /vocab-unit-check-journey/);
  assert.match(view, /vocab-unit-check-journey__step/);
  assert.match(view, /resultTone/);
  assert.match(css, /\.vocab-unit-check-score-medallion\{/);
  assert.match(css, /\.vocab-unit-check-journey\{/);
});

test('celebratory completion motion respects reduced-motion preferences', () => {
  assert.match(css, /@keyframes unit-check-celebrate/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /animation:\s*none/);
});
