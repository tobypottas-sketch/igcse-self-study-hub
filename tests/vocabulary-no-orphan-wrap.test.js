import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('answer option text is balanced so no single word wraps alone', () => {
  const css = readFileSync(new URL('../vocabulary-study-app.css', import.meta.url), 'utf8');
  assert.match(css, /\.vocab-choice-card>span:not\(\.vocab-choice-card__key\)[^{]*\{[^}]*text-wrap:balance/);
});
