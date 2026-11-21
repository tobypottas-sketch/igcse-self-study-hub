// Unified Vocabulary arena regression checks.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'vocabulary-arena-premium.css'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');
const views=fs.readFileSync(path.join(root,'src/vocabulary/views.js'),'utf8');
test('unit assessment and reference cards share authoritative scoped styling',()=>{
 for(const term of ['vocab-unit-check-card','vocab-unit-check-card__scores','vocab-unit-check-card__stat','vocab-support-card','vocab-support-card__copy','vocab-support-card__icon'])
  assert.ok(css.includes(term),term);
 assert.match(css,/\.vocab-shell\[data-unit-overview\]/);
 assert.doesNotMatch(css,/\.vocab-shell--unit-check\s*\{/);
});
test('unit hero uses dark ink on its light progress statistics',()=>{
 for(const term of ['vocab-progress-row','vocab-learning-progress__stage','color:#193955!important','color:#42617a!important'])
  assert.ok(css.includes(term),term);
});
test('immersive support and check cards use light typography',()=>{
 assert.match(css,/color:#f3f8ff!important/);
 assert.match(css,/color:#f6faff!important/);
 assert.match(css,/forced-colors:active/);
});
