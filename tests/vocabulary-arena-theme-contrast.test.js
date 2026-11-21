// Unified Vocabulary arena regression checks.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'vocabulary-arena-premium.css'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');
const views=fs.readFileSync(path.join(root,'src/vocabulary/views.js'),'utf8');
test('one authoritative theme styling owner is loaded after older overrides',()=>{
 assert.match(html,/vocabulary-arena-premium\.css\?v=unified-arena-20261121/);
 assert.doesNotMatch(html,/vocabulary-arena-theme-contrast\.css|vocabulary-arena-premium-repair\.css/);
 for(const old of ['vocabulary-study-art.css','vocabulary-legacy-immersive.css','vocabulary-premium-neon-district.css','vocabulary-premium-celestial-realms.css'])
  assert.ok(html.indexOf(old)<html.indexOf('vocabulary-arena-premium.css'),old);
});
test('six themes, light on dark and dark on light are distinct',()=>{
 for(const skin of ['forest','ocean','sakura','midnight','neon-district','celestial-realms'])
  assert.ok(css.includes('.vocab-real-theme--'+skin),skin);
 assert.match(css,/--unit-ink:#f6faff/);
 assert.match(css,/--unit-ink:#183b58/);
 assert.match(css,/\.vocab-pathway-card__evidence/);
});
