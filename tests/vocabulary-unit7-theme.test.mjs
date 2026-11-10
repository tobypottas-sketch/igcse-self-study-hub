import test from 'node:test';
import assert from 'node:assert/strict';
import { browserAvailable, checkThemedUnit } from './helpers/unit-theme-harness.mjs';

// Unit 7 (Interviews) wallpaper: browser checks on all six pathways at desktop, tablet and mobile widths. The static checks, the tile
// checks and the plain-unit checks are in vocabulary-unit-themes.test.mjs.
const browserTest = browserAvailable ? test : test.skip;

browserTest('Unit 7 shows the Interviews wallpaper on every pathway and viewport without touching content, layout or scrolling', async () => {
  assert.deepEqual(await checkThemedUnit({ unit: 7, themeId: 'interviews', wallpaperFile: 'interviews-wallpaper.svg' }), []);
});
