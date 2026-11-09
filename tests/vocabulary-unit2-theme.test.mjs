import test from 'node:test';
import assert from 'node:assert/strict';
import { browserAvailable, checkThemedUnit } from './helpers/unit-theme-harness.mjs';

// Unit 2 (Digital Life) wallpaper: browser checks on all six pathways at desktop, tablet and mobile widths. The static checks, the tile
// checks and the Unit 1 / Units 3-4 checks are in vocabulary-unit-themes.test.mjs.
const browserTest = browserAvailable ? test : test.skip;

browserTest('Unit 2 shows the Digital Life wallpaper on every pathway and viewport without touching content, layout or scrolling', async () => {
  assert.deepEqual(await checkThemedUnit({ unit: 2, themeId: 'digital-life', wallpaperFile: 'digital-life-wallpaper.svg' }), []);
});
