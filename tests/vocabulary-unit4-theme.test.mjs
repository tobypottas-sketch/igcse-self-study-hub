import test from 'node:test';
import assert from 'node:assert/strict';
import { browserAvailable, checkThemedUnit } from './helpers/unit-theme-harness.mjs';

// Unit 4 (Transport) wallpaper: browser checks on all six pathways at desktop, tablet and mobile widths. The static checks, the tile
// checks and the plain-unit checks are in vocabulary-unit-themes.test.mjs.
const browserTest = browserAvailable ? test : test.skip;

browserTest('Unit 4 shows the Transport wallpaper on every pathway and viewport without touching content, layout or scrolling', async () => {
  assert.deepEqual(await checkThemedUnit({ unit: 4, themeId: 'transport', wallpaperFile: 'transport-wallpaper.svg' }), []);
});
