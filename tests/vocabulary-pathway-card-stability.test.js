import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../vocabulary-layout-stability.css', import.meta.url), 'utf8');
test('the evidence row is a fixed-height track, whatever text it holds', () => {
  assert.match(css, /grid-template-rows:\s*auto\s+auto\s+auto\s+60px\s+auto\s+auto/s);
  assert.match(css, /\.vocab-pathway-card__evidence\s*\{[^}]*grid-area:evidence[^}]*box-sizing:border-box[^}]*height:60px[^}]*min-height:60px[^}]*max-height:60px/s);
});

test('pathway card header uses explicit regions with generous spacing', () => {
  assert.match(css, /\.vocab-pathway-card\s*\{[^}]*column-gap:20px[^}]*row-gap:14px[^}]*padding:28px 30px 24px/s);
  assert.match(css, /\.vocab-pathway-card__identity\s*\{[^}]*grid-area:identity[^}]*display:flex/s);
  assert.match(css, /\.vocab-pathway-card__status\s*\{[^}]*grid-area:status[^}]*justify-self:start/s);
  assert.match(css, /\.vocab-pathway-card__coverage\s*\{[^}]*grid-area:coverage[^}]*justify-self:start/s);
  assert.match(css, /\.vocab-pathway-ladder\s*\{[^}]*grid-area:ladder/s);
  assert.match(css, /\.vocab-pathway-card__cta\s*\{[^}]*grid-area:cta/s);
});

test('decorative pathway artwork is clearly visible without participating in card layout', () => {
  assert.doesNotMatch(css, /\.vocab-pathway-card__art\s*\{[^}]*display:none!important/s);
  assert.match(css, /\.vocab-pathway-card__art\s*\{[^}]*position:absolute/s);
  assert.match(css, /\.vocab-pathway-card__art\s*\{[^}]*pointer-events:none/s);
  assert.match(css, /\.vocab-pathway-card__art\s*\{[^}]*grid-area:art[^}]*width:128px[^}]*height:92px/s, 'its own grid area and explicit size: never behind the evidence row');
  assert.match(css, /grid-template-areas:\s*"identity art"\s*"status art"\s*"coverage art"\s*"evidence evidence"/s);
  assert.match(css, /\.vocab-pathway-card__art\s*\{[^}]*opacity:\.66/s, 'active artwork is a confident ~66%');
  assert.match(css, /\.vocab-pathway-card:disabled \.vocab-pathway-card__art\s*\{[^}]*opacity:\.36/s, 'unavailable artwork stays recognisable');
  assert.doesNotMatch(css, /mask-image:/);
  assert.doesNotMatch(fs.readFileSync(new URL('../vocabulary-study-art.css', import.meta.url), 'utf8'), /pathway-card__art\{[^}]*(mask-image|opacity:\.[0-2]\d?[;}])/, 'no fade mask or ghost opacity on pathway art');
  assert.match(css, /\.vocab-pathway-card\s*>\s*:not\(\.vocab-pathway-card__art\)\s*\{[^}]*z-index:2/s);
  assert.match(css,/\.vocab-pathway-card\.has-study-art\s*\{[^}]*padding:28px 30px 24px!important[^}]*min-height:340px/s);
});
