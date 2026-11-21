import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {studentIdentityView,renderIdentityShowcase} from '../src/vocabulary/rewards-equipped-home.js';
const shop={shopMode:'production',rewards:[
 {reward_id:'word-explorer',category:'titles',name:'Word Explorer'},
 {reward_id:'gold-frame',category:'frames',name:'Golden Frame'},
 {reward_id:'sparkle',category:'effects',name:'Sparkle Effect'}
],owned:[
 {reward_id:'word-explorer',category:'titles',equipped:true},
 {reward_id:'gold-frame',category:'frames',equipped:true},
 {reward_id:'sparkle',category:'effects',equipped:true}
]};
test('equipped Word Explorer renders actual PNG artwork beneath student name',()=>{
 const id=studentIdentityView(shop,'Test Student');
 assert.equal(id.title,'Word Explorer');
 assert.equal(id.titleArt,'assets/vocabulary/rewards/word-explorer.png');
 const html=renderIdentityShowcase(shop,'Test Student');
 assert.match(html,/class="vocab-student-identity__title-art"/);
 assert.match(html,/src="assets\/vocabulary\/rewards\/word-explorer\.png"/);
 assert.match(html,/alt="Word Explorer title artwork"/);
 assert.match(html,/gold-frame-overlay\.png/);
 assert.match(html,/sparkle\.png/);
});
test('no title PNG is shown for unequipped titles, sandbox remains isolated',()=>{
 const html=renderIdentityShowcase({...shop,owned:shop.owned.filter(r=>r.category!=='titles')},'Test Student');
 assert.doesNotMatch(html,/word-explorer\.png/);
 const sandbox={...shop,shopMode:'sandbox',sandboxEnabled:true};
 assert.match(renderIdentityShowcase(sandbox,'Test Student'),/word-explorer\.png/);
 assert.doesNotMatch(renderIdentityShowcase({...sandbox,sandboxEnabled:false},'Test Student'),/word-explorer\.png/);
});
test('header mini identity uses compact PNG title rather than plain text',()=>{
 const source=fs.readFileSync(new URL('../src/vocabulary/rewards-equipped-home.js',import.meta.url),'utf8');
 const css=fs.readFileSync(new URL('../vocabulary-reward-identity.css',import.meta.url),'utf8');
 assert.match(source,/vocab-student-identity-mini__title-art/);
 assert.match(source,/src="\$\{id\.titleArt\}"/);
 assert.match(css,/\.vocab-student-identity-mini__title-art img/);
 assert.match(css,/object-fit:cover/);
});
