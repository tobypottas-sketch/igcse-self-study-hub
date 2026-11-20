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
 assert.match(html,/>Preview<\/span>/);
 assert.match(html,/>4 \/ 4 equipped<\/span>/);
 assert.match(html,/word-explorer\.png/);
 assert.match(html,/gold-frame\.png/);
 assert.match(html,/sparkle\.png/);
 for(const text of ['Midnight Theme active','Golden Frame equipped','Word Explorer equipped','Sparkle Effect equipped'])
  assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/class="vocab-student-identity__slots?"/);
 assert.match(html,/class="vocab-sr-only">4 \/ 4 test equipped:/);
});
test('unowned slots remain empty and cannot display purchased graphics',()=>{
 const empty=renderIdentityShowcase({...shop,owned:[]},'Student');
 assert.match(empty,/>0 \/ 4 equipped<\/span>/);
 for(const category of ['Theme','Frame','Title','Effect'])assert.ok(empty.includes(category+' not equipped'));
 assert.doesNotMatch(empty,/word-explorer\.png|gold-frame\.png|sparkle\.png/);
});
test('production profile uses the same concise count without a preview label',()=>{
 const html=renderIdentityShowcase({...shop,shopMode:'production'},'Synthetic Student');
 assert.match(html,/>4 \/ 4 equipped<\/span>/);
 assert.doesNotMatch(html,/>Preview<\/span>|test equipped/);
 assert.match(html,/MY STUDENT PROFILE/);
});
test('sandbox stays separate from learning XP and does not stretch vertically',()=>{
 assert.match(rewardsCss,/\.vocab-rewards-dashboard\{/);
 assert.match(rewardsCss,/\.vocab-rewards-home-card--sandbox\{/);
 assert.match(rewardsCss,/min-height:0/);
 assert.match(app,/data-action="open-sandbox-shop"/);
 assert.match(app,/No real XP spent/);
 assert.match(app,/Number\(result\.wallet\?\.available\?\?0\)\.toLocaleString\('en'\)/);
});
