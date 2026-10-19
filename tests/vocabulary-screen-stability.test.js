import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../vocabulary-study-art.css', import.meta.url),'utf8');
const app = readFileSync(new URL('../src/vocabulary/app.js', import.meta.url),'utf8');
const artRuntime = readFileSync(new URL('../src/vocabulary/study-art-runtime.js', import.meta.url),'utf8');

test('unit navigation renders the unit only once after its content load completes', () => {
  const start = app.indexOf('async function openUnit(unitNumber) {');
  const end = app.indexOf('function strandLabel', start);
  assert.ok(start >= 0 && end > start, 'openUnit implementation should be present');
  const body = app.slice(start, end);
  const renders = body.match(/renderCurrentUnit\(\);/g) ?? [];
  assert.equal(renders.length, 1, 'openUnit must not render a temporary unit and then rebuild it');
  assert.ok(body.indexOf('await Promise.all') < body.indexOf('renderCurrentUnit();'), 'the single unit render should happen after content/mastery resolve');
});

test('navigation surfaces avoid broad fade-in animations and questions use a deliberate non-flashing transition', () => {
  assert.match(css,/\.vocab-unit-card\.study-enter,\.vocab-pathway-card\.study-enter,\.vocab-word-row\.study-enter\{animation:none!important\}/);
  assert.match(css,/\.vocab-retry-stage\.study-enter\{animation:none!important\}/);
  assert.match(css,/\.vocab-question-card\.study-enter:not\(:has\(\.study-feedback\)\)\{\s*animation:study-question-transition 420ms/);
  assert.match(css,/@keyframes study-question-transition\{\s*0%\{opacity:\.90;transform:translateY\(4px\)\}/);
});

test('desktop question sessions use horizontal space and compact staff preview/answer density', () => {
  assert.match(css,/@media \(min-width:900px\)\{[\s\S]*\.vocab-shell--session\{width:min\(1180px,calc\(100% - 40px\)\);max-width:1180px\}/);
  assert.match(css,/\.vocab-shell--session \.vocab-preview-banner\{min-height:auto;padding:12px 16px/);
  assert.match(css,/\.vocab-choice-card\{min-height:56px!important;padding:12px 18px!important/);
  assert.match(css,/\.vocab-question-prompt\{margin:12px 0 14px!important/);
});

test('study artwork is preloaded before decoration to avoid late image pops', () => {
  assert.match(artRuntime,/function preloadStudyArtwork\(/);
  assert.match(artRuntime,/Promise\.allSettled/);
  assert.match(artRuntime,/preloadStudyArtwork\(\)/);
});
