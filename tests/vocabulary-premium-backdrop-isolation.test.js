import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(name)=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const themes=[
  ['blockverse','vocabulary-premium-blockverse.css','blockverse.png'],
  ['afterlight','vocabulary-premium-afterlight.css','afterlight.png']
];
test('premium themes own overview and activity backdrops without default SVG overlays',()=>{
 for(const [id,file,art] of themes){
  const css=read(file);
  assert.doesNotMatch(css,/background-image:\\s*var\\(--page-art\\)/i,id+' overview must not inherit default icons');
  assert.doesNotMatch(css,/background-image:\\s*var\\(--unit-wallpaper\\)/i,id+' activity must not inherit default icons');
  const marker='body:has(#vocabularyApp.vocab-real-theme--'+id+' .vocab-shell:is([data-unit-overview],[data-unit-theme]))';
  assert.ok(css.includes(marker),id+' explicit overview/activity scenery selector');
  const rule=css.slice(css.indexOf(marker)).split('}')[0];
  assert.match(rule,/background-image:linear-gradient\\(/);
  assert.ok(rule.includes('assets/vocabulary/rewards/'+art));
  assert.match(rule,/background-repeat:no-repeat,no-repeat!important/);
  assert.match(rule,/background-position:center,center!important/);
 }
});
test('premium scene override stays theme-scoped and leaves normal student unit artwork intact',()=>{
 const css=read('vocabulary-unit-themes.css');
 assert.match(css,/--unit-wallpaper:url/);
 assert.match(css,/--page-art:url/);
 const views=read('src/vocabulary/views.js');
 assert.match(views,/unitHeroArt\\(unitNumber\\)/);
 const html=read('vocabulary.html');
 assert.match(html,/vocabulary-premium-blockverse\\.css\\?v=blockverse-scene-only-v3/);
 assert.match(html,/vocabulary-premium-afterlight\\.css\\?v=afterlight-scene-only-v4/);
});
