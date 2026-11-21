// Regression guard for assessment + support cards on Vocabulary unit overviews.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'vocabulary-arena-premium-repair.css'),'utf8');
const html=fs.readFileSync(path.join(root,'vocabulary.html'),'utf8');
test('repair styles are loaded after the older unit-check and support styles',()=>{
 const repair=html.indexOf('vocabulary-arena-premium-repair.css');
 assert.ok(repair>0);
 for(const name of ['vocabulary-unit-check.css','vocabulary-support.css','vocabulary-arena-premium.css'])
   assert.ok(html.indexOf(name)>=0 && html.indexOf(name)<repair,name);
});
test('both card types are unit-overview-scoped and retain all six themes',()=>{
 for(const theme of ['forest','ocean','sakura','midnight','neon-district','celestial-realms'])
   assert.ok(css.includes('.vocab-real-theme--'+theme),theme);
 for(const selector of ['.vocab-unit-check-card__stat :is(small,strong,em)',
  '.vocab-unit-check-card__meta li','.vocab-unit-check-card__cta',
  '.vocab-support-card :is(h3,.vocab-support-card__copy,.vocab-support-card__sub)'])
  assert.ok(css.includes(selector),selector);
 assert.ok(css.includes('.vocab-shell[data-unit-overview]'));
 assert.doesNotMatch(css,/\.vocab-shell--unit-check\s*\{/);
});
test('unit check is compact and light/dark text have explicit contrasting colours',()=>{
 assert.match(css,/\.vocab-unit-check-card__stat\{[\s\S]*?border-radius:7px!important/);
 assert.match(css,/\.vocab-unit-check-card__cta\{[\s\S]*?border-radius:6px!important/);
 assert.match(css,/\.vocab-support-card :is\(h3,\.vocab-support-card__copy,\.vocab-support-card__sub\)\{\s*color:#f3f8ff!important/);
 assert.match(css,/color:#193650!important/);
 assert.match(css,/forced-colors:active/);
});
