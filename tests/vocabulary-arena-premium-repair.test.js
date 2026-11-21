// Static regression checks for the premium pathway UI hotfix.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'vocabulary-arena-premium-repair.css'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');
test('premium repair loads after both legacy and premium CSS',()=>{
  const repair=html.indexOf('vocabulary-arena-premium-repair.css?v=arena-premium-repair-v1');
  assert.ok(repair>0);
  for(const file of ['vocabulary-arena-theme-contrast.css','vocabulary-arena-premium.css'])
    assert.ok(html.indexOf(file)>=0 && html.indexOf(file)<repair,file);
});
test('six themed arenas have readable dark panels and transparent labels',()=>{
  for(const theme of ['forest','ocean','sakura','midnight','neon-district','celestial-realms'])
    assert.ok(css.includes('.vocab-real-theme--'+theme),theme);
  assert.match(css,/\.vocab-pathway-card__evidence-copy :is\(strong,small,span\)/);
  assert.match(css,/color:var\(--arena-ink\)!important/);
  assert.match(css,/\.vocab-pathway-card__head small\{/);
  assert.match(css,/background:none!important/);
  assert.match(css,/\.vocab-pathway-ladder/);
  assert.match(css,/\.vocab-pathway-stage\[data-state="current"\]/);
  assert.match(css,/\.vocab-pathway-stage\[data-state="complete"\]/);
});
test('light default view and forced-colors remain protected',()=>{
  assert.match(css,/#vocabularyApp:not\(:is\(/);
  assert.match(css,/color:#193650!important/);
  assert.match(css,/forced-colors:active/);
  assert.doesNotMatch(css,/vocab-shell--session|vocab-answer-form/);
});
