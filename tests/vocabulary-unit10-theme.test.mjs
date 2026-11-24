import test from 'node:test';
import assert from 'node:assert/strict';
import { browserAvailable, checkThemedUnit } from './helpers/unit-theme-harness.mjs';

// Unit 10 (Education) wallpaper: browser checks on all six pathways at desktop, tablet and mobile widths. The static checks, the tile
// checks and the plain-unit checks are in vocabulary-unit-themes.test.mjs.
const browserTest = browserAvailable ? test : test.skip;

browserTest('Unit 10 shows the Education wallpaper on every pathway and viewport without touching content, layout or scrolling', async () => {
  assert.deepEqual(await checkThemedUnit({ unit: 10, themeId: 'education', wallpaperFile: 'education-wallpaper.svg' }), []);
});
