import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { geometryDifferences, measure, findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const browserReady = Boolean(loadPlaywright() && await findChromium());
const browserTest = browserReady ? test : test.skip;

// ── Static lifecycle guarantees ────────────────────────────────────────────────────────────────────
test('no script owns pathway-card content or geometry after render', () => {
  const html = readFileSync(`${root}/vocabulary.html`, 'utf8');
  assert.doesNotMatch(html, /study-art-runtime/);
  assert.equal(existsSync(`${root}/src/vocabulary/study-art-runtime.js`), false);
  const model = readFileSync(`${root}/src/vocabulary/pathway-view-model.js`, 'utf8');
  assert.doesNotMatch(model, /getLatestUnitPathwayStates|latestUnitPathwayStates/, 'no module-level state side channel');
  for (const file of ['views.js', 'app.js']) assert.doesNotMatch(readFileSync(`${root}/src/vocabulary/${file}`, 'utf8'), /MutationObserver|data-pathway-evidence-shell/);
});

// ── Real browser: zero geometry change after the first render ─────────────────────────────────────
for (const [name, width] of [['desktop', 1280], ['mobile', 390]]) {
  for (const mode of ['direct', 'preloaded-then-loaded']) {
    browserTest(`pathway cards never change geometry after first render (${name} ${width}px, ${mode})`, async () => {
      const result = await measure({ root, width, mode });
      assert.equal(result.frames.length, 4);
      const cards = Object.values(result.frames[0][1].cards);
      assert.equal(cards.length, 6);
      // The fixture really exercises evidence: populated, empty and unavailable cards are all present.
      const texts = cards.map(card => card.evidenceText);
      assert.ok(texts.some(text => /attempts? · \d+ clean/.test(text ?? '')), 'a card shows real saved evidence in the first render');
      assert.ok(texts.includes('No saved evidence yet'));
      assert.ok(texts.includes(null), 'the unavailable pathway has no evidence row');
      assert.deepEqual(geometryDifferences(result.frames), [], 'x/y/width/height of every card, art slot, evidence row, ladder and container are identical in every frame');
      assert.equal(result.mutations, 0, 'nothing inserts, removes or edits DOM after the render');
      assert.equal(result.shifts.reduce((sum, value) => sum + value, 0), 0, 'layout-shift score is zero');
      assert.ok(!result.scripts.some(src => /study-art-runtime/.test(src)));
    });
  }
}
