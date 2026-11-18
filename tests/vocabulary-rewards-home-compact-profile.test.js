import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderIdentityShowcase} from '../src/vocabulary/rewards-equipped-home.js';
const css=readFileSync(new URL('../vocabulary-rewards-dashboard.css',import.meta.url),'utf8');
const rewardsCss=readFileSync(new URL('../vocabulary-rewards-dashboard.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
const shop={shopMode:'sandbox',sandboxEnabled:true,rewards:[
 {reward_id:'midnight',name:'Midnight Theme',category:'themes'},
 {reward_id:'gold-frame',name:'Golden Frame',category:'frames'},
 {reward_id:'word-explorer',name:'Word Explorer',category:'titles'},
 {reward_id:'sparkle',name:'Sparkle Effect',category:'effects'}
],owned:['midnight','gold-frame','word-explorer','sparkle'].map((reward_id,i)=>({reward_id,category:['themes','frames','titles','effects'][i],equipped:true}))};
test('student profile keeps all four reward identities and title artwork',()=>{
 const html=renderIdentityShowcase(shop,'TEST STUDENT');
 assert.match(html,/TEST COSMETICS PREVIEW/);
 assert.match(html,/4 \/ 4 test equipped/);
 assert.match(html,/word-explorer\.png/);
 assert.match(html,/gold-frame\.png/);
 assert.match(html,/sparkle\.png/);
 for(const text of ['Midnight Theme active','Golden Frame equipped','Word Explorer equipped','Sparkle Effect equipped'])
  assert.ok(html.includes(text),text);
 assert.equal((html.match(/class="vocab-student-identity__slot is-equipped"/g)||[]).length,4);
});
test('unowned slots remain empty and cannot display purchased graphics',()=>{
 const empty=renderIdentityShowcase({...shop,owned:[]},'Student');
 assert.equal((empty.match(/class="vocab-student-identity__slot"/g)||[]).length,4);
 assert.doesNotMatch(empty,/word-explorer\.png|gold-frame\.png|sparkle\.png/);
});
test('profile uses compact sizing and a restrained decorative scene',()=>{
 assert.match(css,/grid-template-columns:104px minmax\(0,1fr\) minmax\(150px,208px\)/);
 assert.match(css,/\.vocab-student-identity__slots/);
 assert.match(css,/opacity:\.11/);
 assert.match(css,/\.vocab-student-identity__title-art img/);
});
test('sandbox stays separate from learning XP and does not stretch vertically',()=>{
 assert.match(rewardsCss,/\.vocab-rewards-dashboard\{/);
 assert.match(rewardsCss,/\.vocab-rewards-home-card--sandbox\{/);
 assert.match(rewardsCss,/min-height:0/);
 assert.match(app,/data-action="open-sandbox-shop"/);
 assert.match(app,/No real XP spent/);
 assert.match(app,/Number\(result\.wallet\?\.available\?\?0\)\.toLocaleString\('en'\)/);
});
