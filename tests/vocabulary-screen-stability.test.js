import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../vocabulary-study-art.css', import.meta.url),'utf8');
const app = readFileSync(new URL('../src/vocabulary/app.js', import.meta.url),'utf8');
const artRuntime = readFileSync(new URL('../src/vocabulary/study-art-runtime.js', import.meta.url),'utf8');

test('unit navigation renders the unit only once after its content load completes', () => {
  const match = app.match(/async function openUnit\(unitNumber\) \{([\s\S]*?)\n\}\nfunction strandLabel/);
  assert.ok(match, 'openUnit implementation should be present');
  const body = match[1];
  const renders = body.match(/renderCurrentUnit\(\);/g) ?? [];
  assert.equal(renders.length, 1, 'openUnit must not render a temporary unit and then rebuild it');
  assert.ok(body.indexOf('await Promise.all') < body.indexOf('renderCurrentUnit();'), 'the single unit render should happen after content/mastery resolve');
});

test('navigation and question shells do not use broad fade-in animations that can flash on rerender', () => {
  assert.match(css,/\.vocab-unit-card\.study-enter,\.vocab-pathway-card\.study-enter,\.vocab-word-row\.study-enter\{animation:none!important\}/);
  assert.match(css,/\.vocab-question-card\.study-enter\{animation:none!important\}/);
  assert.match(css,/\.vocab-retry-stage\.study-enter\{animation:none!important\}/);
});

test('study artwork is preloaded before decoration to avoid late image pops', () => {
  assert.match(artRuntime,/function preloadStudyArtwork\(/);
  assert.match(artRuntime,/Promise\.allSettled/);
  assert.match(artRuntime,/preloadStudyArtwork\(\)/);
});
