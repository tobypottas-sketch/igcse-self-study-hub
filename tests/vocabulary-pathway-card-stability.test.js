import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const layoutCss = fs.readFileSync(new URL('../vocabulary-card-refinement.css', import.meta.url), 'utf8');

test('pathway card header keeps identity and status in dedicated first-row regions', () => {
  assert.match(layoutCss, /grid-template-areas:\s*"identity status"\s*"coverage coverage"\s*"evidence evidence"\s*"ladder ladder"\s*"cta cta"/s);
  assert.match(layoutCss, /\.vocab-pathway-card__identity\s*\{[^}]*grid-area:identity[^}]*min-width:0/s);
  assert.match(layoutCss, /\.vocab-pathway-card__status\s*\{[^}]*grid-area:status[^}]*justify-self:end[^}]*white-space:nowrap/s);
});

test('pathway cards reserve evidence geometry before async evidence appears', () => {
  assert.match(layoutCss, /grid-template-rows:\s*auto\s+auto\s+minmax\(52px,auto\)/s);
  assert.match(layoutCss, /\.vocab-pathway-card__evidence\s*\{[^}]*grid-area:evidence[^}]*width:100%[^}]*min-height:52px/s);
});

test('decorative pathway artwork is not allowed behind live card text', () => {
  assert.match(layoutCss, /\.vocab-pathway-card__art\s*\{display:none!important\}/s);
});

test('pathway ladder and CTA have calm dedicated lower-card regions', () => {
  assert.match(layoutCss, /\.vocab-pathway-ladder\s*\{[^}]*grid-area:ladder[^}]*background:#f7fafc/s);
  assert.match(layoutCss, /\.vocab-pathway-card__cta\s*\{[^}]*grid-area:cta[^}]*border-top/s);
});
