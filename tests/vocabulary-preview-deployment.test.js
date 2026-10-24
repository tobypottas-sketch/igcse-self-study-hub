import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const appSource = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('GitHub Pages bypasses Jekyll so underscore-prefixed vocabulary dependencies are published', () => {
  assert.match(appSource, /supabase\/functions\/_shared\/vocabulary-engine\.js/);
  const noJekyll = new URL('../.nojekyll', import.meta.url);
  assert.equal(fs.existsSync(noJekyll), true);
});
