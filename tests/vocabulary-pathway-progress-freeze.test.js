import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/vocabulary/pathway-question-progress.js', import.meta.url), 'utf8');

test('pathway question progress enhancer does not rewrite its own rendered progress on observer callbacks', () => {
  assert.match(
    source,
    /meta\.querySelector\?\.\(['"]\[data-pathway-session-progress\]['"]\)\) return;/,
    'enhancer must stop when the progress component is already present, otherwise MutationObserver loops on its own innerHTML write'
  );
});
