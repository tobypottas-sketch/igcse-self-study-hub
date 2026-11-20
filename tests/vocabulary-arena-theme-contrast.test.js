// Static regression guard for the six cosmetic-theme vocabulary arenas.
// Run: node --test tests/vocabulary-arena-theme-contrast.test.js
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'vocabulary-arena-theme-contrast.css'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');
test('contrast guard loads after every rewards-theme override',()=>{
  const guard=html.indexOf('vocabulary-arena-theme-contrast.css?v=arena-contrast-v1');
  assert.ok(guard>0);
  for(const stylesheet of [
    'vocabulary-legacy-immersive.css',
    'vocabulary-premium-neon-district.css',
    'vocabulary-premium-celestial-realms.css',
    'vocabulary-effect-shop-previews.css'
  ]) assert.ok(html.indexOf(stylesheet)<guard,stylesheet+' must precede guard');
});
test('all six cosmetics themes are covered and only unit overview cards are styled',()=>{
  for(const theme of ['forest','ocean','sakura','midnight','neon-district','celestial-realms'])
    assert.match(css,new RegExp('\\.vocab-real-theme--'+theme+'\\b'));
  assert.match(css,/\.vocab-shell\[data-unit-overview\] \.vocab-pathway-card/);
  assert.doesNotMatch(css,/\.vocab-shell--session/);
});
test('light evidence panels and stage tiles receive dark ink; CTA receives light ink',()=>{
  for(const component of ['vocab-pathway-card__head small','vocab-pathway-card__coverage','vocab-pathway-card__evidence-copy','vocab-pathway-ladder','vocab-pathway-stage','vocab-pathway-card__cta'])
    assert.ok(css.includes(component),component);
  assert.match(css,/--arena-light-ink:#193650/);
  assert.match(css,/--arena-on-dark-link:#aeeaff/);
  assert.match(css,/forced-colors:active/);
});
