// Static guard: premium Vocabulary unit-overview redesign.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'vocabulary-arena-premium.css'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');
test('premium styles load after all theme safeguards',()=>{
  const premium=html.indexOf('vocabulary-arena-premium.css?v=arena-premium-v1');
  assert.ok(premium>0);
  for(const file of ['vocabulary-legacy-immersive.css','vocabulary-premium-neon-district.css','vocabulary-premium-celestial-realms.css','vocabulary-arena-theme-contrast.css'])
    assert.ok(html.indexOf(file)>=0 && html.indexOf(file)<premium,file);
});
test('all six reward themes share the same design treatment',()=>{
  for(const skin of ['forest','ocean','sakura','midnight','neon-district','celestial-realms'])
    assert.ok(css.includes('.vocab-real-theme--'+skin),skin);
  for(const selector of ['vocab-pathways__head','vocab-support__head','vocab-pathway-card__head','vocab-pathway-card__status','vocab-pathway-card__coverage','vocab-pathway-card__evidence','vocab-pathway-ladder','vocab-pathway-stage','vocab-pathway-card__cta'])
    assert.ok(css.includes(selector),selector);
});
test('cosmetic CSS is limited to unit overview and retains accessibility states',()=>{
  assert.ok(css.includes('.vocab-shell[data-unit-overview]'));
  assert.ok(css.includes('focus-visible'));
  assert.ok(css.includes('forced-colors:active'));
  assert.ok(css.includes('max-width:620px'));
  assert.ok(css.includes('[data-state="current"]'));
  assert.ok(css.includes('[data-state="complete"]'));
  assert.ok(css.includes(':disabled'));
  assert.doesNotMatch(css,/vocab-shell--session|\[data-study-question\]|vocab-reward-(purchase|checkout)/);
});
