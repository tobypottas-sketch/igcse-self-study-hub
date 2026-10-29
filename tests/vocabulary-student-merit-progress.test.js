import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/vocabulary/student-merit-progress.js', import.meta.url), 'utf8');

test('student merit progress does not rewrite identical DOM text from its own MutationObserver', () => {
  assert.match(
    source,
    /if\s*\(node\.textContent\s*!==\s*copy\)\s*node\.textContent\s*=\s*copy/,
    'merit progress must guard identical text writes so its childList observer cannot trigger itself forever'
  );
  assert.doesNotMatch(
    source,
    /for\s*\(const node of nodes\)\s*node\.textContent\s*=\s*copy\s*;/,
    'unconditional textContent writes recreate the observed child node and can freeze the home screen'
  );
});
