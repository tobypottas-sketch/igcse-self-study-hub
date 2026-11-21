// Sparkle is an actual moving cosmetic, not a static preview with a glow.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'vocabulary-effect-shop-previews.css'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');
const shop=fs.readFileSync(path.join(root,'src/vocabulary/rewards-sandbox-view.js'),'utf8');
test('Sparkle preview has moving art AND six drifting stars',()=>{
  assert.match(shop,/['"]sparkle['"]/);
  assert.match(shop,/vocab-cosmetic-particle--\$\{i\+1\}/);
  assert.match(css,/\.vocab-effect-preview\[data-preview-effect="sparkle"\] \.vocab-student-identity__effect/);
  assert.match(css,/\.vocab-effect-preview\[data-preview-effect="sparkle"\] \.vocab-cosmetic-particle/);
  assert.match(css,/animation:vocab-sparkle-art-motion 4\.4s/);
  assert.match(css,/animation:vocab-sparkle-float 3\.2s/);
  assert.match(css,/@keyframes vocab-sparkle-art-motion/);
  assert.match(css,/@keyframes vocab-sparkle-float/);
  assert.match(css,/translate3d\(14px,-15px,0\)/);
});
test('equipped Sparkle reuses motion and reduced-motion is honoured',()=>{
  assert.match(css,/#vocabularyApp\.vocab-real-effect--sparkle \.vocab-student-identity__effect/);
  assert.match(css,/#vocabularyApp\.vocab-real-effect--sparkle \.vocab-student-identity__avatar \.vocab-cosmetic-particle/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/animation:none!important/);
});
test('refreshed cache loads new CSS after equipped effects',()=>{
  assert.match(html,/vocabulary-effect-shop-previews\.css\?v=sparkle-visible-motion-v3/);
  assert.ok(html.indexOf('vocabulary-effects-animated.css')<html.indexOf('vocabulary-effect-shop-previews.css'));
});
