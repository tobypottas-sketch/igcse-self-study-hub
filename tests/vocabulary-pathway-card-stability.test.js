import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../vocabulary-layout-stability.css', import.meta.url), 'utf8');

test('pathway cards reserve a dedicated evidence row before async evidence appears', () => {
  assert.match(css, /grid-template-areas:\s*"identity status"\s*"coverage coverage"\s*"evidence evidence"\s*"ladder ladder"\s*"cta cta"/s);
  assert.match(css, /grid-template-rows:\s*auto\s+auto\s+minmax\(42px,auto\)/s);
  assert.match(css, /\.vocab-pathway-card__evidence\s*\{[^}]*grid-area:evidence[^}]*width:100%/s);
});

test('pathway card header uses explicit regions so status and coverage do not crowd identity text', () => {
  assert.match(css, /\.vocab-pathway-card__identity\s*\{[^}]*grid-area:identity[^}]*display:flex/s);
  assert.match(css, /\.vocab-pathway-card__status\s*\{[^}]*grid-area:status[^}]*justify-self:end/s);
  assert.match(css, /\.vocab-pathway-card__coverage\s*\{[^}]*grid-area:coverage[^}]*justify-self:start/s);
  assert.match(css, /\.vocab-pathway-ladder\s*\{[^}]*grid-area:ladder/s);
  assert.match(css, /\.vocab-pathway-card__cta\s*\{[^}]*grid-area:cta/s);
});
