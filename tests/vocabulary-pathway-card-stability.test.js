import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../vocabulary-layout-stability.css', import.meta.url), 'utf8');

test('pathway cards reserve a dedicated evidence row before async evidence appears', () => {
  assert.match(css, /grid-template-areas:\s*"identity status"\s*"coverage coverage"\s*"evidence evidence"\s*"ladder ladder"\s*"cta cta"/s);
  assert.match(css, /grid-template-rows:\s*auto\s+auto\s+minmax\(60px,auto\)/s);
  assert.match(css, /\.vocab-pathway-card__evidence\s*\{[^}]*grid-area:evidence[^}]*width:100%[^}]*min-height:60px/s);
});

test('pathway card header uses explicit regions with generous spacing', () => {
  assert.match(css, /\.vocab-pathway-card\s*\{[^}]*column-gap:28px[^}]*row-gap:16px[^}]*padding:28px 30px 24px/s);
  assert.match(css, /\.vocab-pathway-card__identity\s*\{[^}]*grid-area:identity[^}]*display:flex/s);
  assert.match(css, /\.vocab-pathway-card__status\s*\{[^}]*grid-area:status[^}]*justify-self:end/s);
  assert.match(css, /\.vocab-pathway-card__coverage\s*\{[^}]*grid-area:coverage[^}]*justify-self:start/s);
  assert.match(css, /\.vocab-pathway-ladder\s*\{[^}]*grid-area:ladder/s);
  assert.match(css, /\.vocab-pathway-card__cta\s*\{[^}]*grid-area:cta/s);
});

test('decorative pathway graphics cannot overlap card content', () => {
  assert.match(css, /\.vocab-pathway-card__art\s*\{[^}]*display:none!important/s);
  assert.match(css, /\.vocab-pathway-card\[data-study-accent\]::after\s*\{[^}]*display:none!important/s);
});
