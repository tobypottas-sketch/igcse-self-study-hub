import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const views = fs.readFileSync(new URL('../src/vocabulary/views.js', import.meta.url), 'utf8');
const layoutCss = fs.readFileSync(new URL('../vocabulary-layout-stability.css', import.meta.url), 'utf8');
const artCss = fs.readFileSync(new URL('../vocabulary-study-art.css', import.meta.url), 'utf8');

test('pathway cards render a dedicated top band so identity and status cannot overlap', () => {
  assert.match(views, /vocab-pathway-card__top/);
  assert.match(layoutCss, /\.vocab-pathway-card__top\s*\{[^}]*display:flex[^}]*justify-content:space-between/s);
  assert.match(layoutCss, /\.vocab-pathway-card__identity\s*\{[^}]*min-width:0/s);
  assert.match(layoutCss, /\.vocab-pathway-card__status\s*\{[^}]*flex:0 0 auto/s);
});

test('pathway cards reserve evidence geometry before async evidence appears', () => {
  assert.match(layoutCss, /grid-template-areas:\s*"top"\s*"coverage"\s*"evidence"\s*"ladder"\s*"cta"/s);
  assert.match(layoutCss, /grid-template-rows:\s*auto\s+auto\s+minmax\(48px,auto\)/s);
  assert.match(layoutCss, /\.vocab-pathway-card__evidence\s*\{[^}]*grid-area:evidence[^}]*width:100%/s);
});

test('decorative pathway artwork is not allowed behind live card text', () => {
  assert.match(artCss, /\.vocab-pathway-card__art\s*\{[^}]*display:none/s);
});

test('pathway ladder and CTA have their own calm lower-card regions', () => {
  assert.match(layoutCss, /\.vocab-pathway-ladder\s*\{[^}]*grid-area:ladder/s);
  assert.match(layoutCss, /\.vocab-pathway-card__cta\s*\{[^}]*grid-area:cta[^}]*border-top/s);
});
