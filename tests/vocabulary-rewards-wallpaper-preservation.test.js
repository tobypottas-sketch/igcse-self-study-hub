import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync(new URL('../vocabulary-reward-identity.css',import.meta.url),'utf8');
const defaults=fs.readFileSync(new URL('../vocabulary-unit-themes.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../vocabulary.html',import.meta.url),'utf8');
test('four equipped palettes tint beneath existing artwork instead of resetting background shorthand',()=>{
 for(const theme of ['forest','ocean','sakura','midnight']){
  const selector='body:has(#vocabularyApp.vocab-real-theme--'+theme+')';
  const start=css.indexOf(selector);
  assert.ok(start>=0,theme+' theme body rule must remain');
  const rule=css.slice(start,css.indexOf('}',start));
  assert.match(rule,/--reward-wallpaper-base:/);
  assert.match(rule,/--reward-wallpaper-wash:/);
  assert.doesNotMatch(rule,/(?:^|\n)\s*background\s*:/,theme+' must not reset background layers');
 }
});
test('unit activity keeps original per-unit icon wallpaper above the theme wash',()=>{
 assert.match(css,/background-image:var\(--unit-wallpaper\),var\(--reward-wallpaper-wash\)!important/);
 assert.match(css,/background-repeat:repeat,no-repeat,no-repeat/);
 assert.match(css,/background-size:420px 420px,cover,cover/);
 assert.match(css,/background-size:340px 340px,cover,cover/);
 for(const unit of ['sports-free-time','digital-life','food-and-drink','transport','holidays','learning-study-skills','interviews','work'])
  assert.match(defaults,new RegExp(unit+'-wallpaper\\.svg'));
});
test('home and unit overviews retain composed original SVG scene',()=>{
 assert.match(css,/background-image:var\(--page-art\),var\(--reward-wallpaper-wash\)!important/);
 assert.match(defaults,/vocabulary-home-background\.svg/);
 assert.match(defaults,/sports-free-time-overview\.svg/);
 assert.match(css,/background-size:max\(100vw,177\.78vh\) auto,cover,cover/);
});
test('midnight icons remain legible and print/high-contrast users do not see wallpaper',()=>{
 assert.match(css,/\.vocab-real-theme--midnight \.vocab-shell\[data-unit-theme\]\)\{\s*background-blend-mode:screen/);
 assert.match(css,/@media print,\(forced-colors:active\)/);
 assert.match(css,/background-image:none!important/);
});
test('browser cache loads refreshed CSS without changing routed learning app',()=>{
 assert.match(html,/vocabulary-reward-identity\.css\?v=reward-wallpaper-v9/);
 assert.match(html,/vocabulary-unit-themes\.css/);
});
