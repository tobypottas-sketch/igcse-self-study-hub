import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {equippedCosmetics,studentIdentityView,renderIdentityShowcase,applyRewardTheme} from '../src/vocabulary/rewards-equipped-home.js';

const rewards=[
 {reward_id:'ocean',category:'themes',name:'Ocean Theme'},
 {reward_id:'midnight',category:'themes',name:'Midnight Theme'},
 {reward_id:'gold-frame',category:'frames',name:'Golden Frame'},
 {reward_id:'word-wizard',category:'titles',name:'Word Wizard'},
 {reward_id:'pixel-badge',category:'effects',name:'Pixel Badge'}
];
const shop={shopMode:'production',rewards,owned:[
 {reward_id:'ocean',category:'themes',equipped:true},
 {reward_id:'gold-frame',category:'frames',equipped:true},
 {reward_id:'word-wizard',category:'titles',equipped:true},
 {reward_id:'pixel-badge',category:'effects',equipped:true}
]};
test('equipped items render a genuine student identity with visible attached badge and frame',()=>{
 const markup=renderIdentityShowcase(shop,'Test Student');
 assert.match(markup,/MY STUDENT PROFILE/);
 assert.match(markup,/Test Student/);
 assert.match(markup,/TS/);
 assert.match(markup,/gold-frame\.png/);
 assert.match(markup,/pixel-badge\.png/);
 assert.match(markup,/Word Wizard/);
 assert.match(markup,/Pixel Badge equipped/);
 assert.match(markup,/Ocean Theme active/);
 assert.match(markup,/4 \/ 4 equipped/);
 assert.match(markup,/vocab-student-identity__badge/);
 assert.match(markup,/vocab-student-identity__frame/);
});
test('server owned equipment only is allowed to affect student cosmetics',()=>{
 assert.deepEqual(equippedCosmetics(shop),{themes:'ocean',frames:'gold-frame',titles:'word-wizard',effects:'pixel-badge'});
 assert.deepEqual(equippedCosmetics({...shop,owned:[{reward_id:'pixel-badge',category:'frames',equipped:true}]}),{});
 assert.deepEqual(equippedCosmetics({...shop,shopMode:'sandbox'}),{});
 assert.doesNotMatch(renderIdentityShowcase({...shop,owned:[{reward_id:'mystery',category:'effects',equipped:true}]},'<script>'),/<script>/);
});
test('themes are switched at persistent root rather than one homepage element',()=>{
 const classes=new Set(['vocab-real-theme--forest']);
 const root={classList:{
   add(...items){items.forEach(x=>classes.add(x))},
   remove(...items){items.forEach(x=>classes.delete(x))}
 }};
 applyRewardTheme(root,shop);
 assert.equal(classes.has('vocab-real-theme--forest'),false);
 assert.equal(classes.has('vocab-real-theme--ocean'),true);
 assert.equal(classes.has('vocab-real-effect--pixel-badge'),true);
 applyRewardTheme(root,{...shop,owned:[]});
 assert.equal(classes.has('vocab-real-theme--ocean'),false);
 assert.equal(classes.has('vocab-real-effect--pixel-badge'),false);
});
test('all four themes style global navigation and learning surfaces without recolouring answer feedback',()=>{
 const css=fs.readFileSync(new URL('../vocabulary-reward-identity.css',import.meta.url),'utf8');
 for(const theme of ['forest','ocean','sakura','midnight'])
   assert.match(css,new RegExp('#vocabularyApp\\.vocab-real-theme--'+theme));
 for(const target of ['.vocab-topbar','.vocab-hero--home','.vocab-unit-card','.vocab-pathway-card','.vocab-question-card'])
   assert.ok(css.includes(target),target+' missing from theme coverage');
 assert.match(css,/--c-bg:/);
 assert.doesNotMatch(css,/\.vocab-answer--correct|\.vocab-answer--wrong|\.vocab-feedback--incorrect/);
});
test('root theme and identity persist across internal screen rerenders and are refreshed after equipment changes',()=>{
 const app=fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
 assert.match(app,/function installStudentIdentityObserver\(\)/);
 assert.match(app,/identityObserver\.observe\(root,\{childList:true\}\)/);
 assert.match(app,/cosmeticModule\.decorateStudentIdentity/);
 assert.match(app,/cosmeticModule\.applyRewardTheme\(root,shop\)/);
 assert.match(app,/await updateLiveCosmetics\(realShop\)/);
 assert.match(app,/await updateLiveCosmetics\(shop\)/);
 assert.match(app,/if \(!state\.preview\) installStudentIdentityObserver\(\)/);
});
test('asset version bump exposes the new identity CSS and application code to returning students',()=>{
 const html=fs.readFileSync(new URL('../vocabulary.html',import.meta.url),'utf8');
 const router=fs.readFileSync(new URL('../src/vocabulary/router.js',import.meta.url),'utf8');
 assert.match(html,/vocabulary-reward-identity\.css\?v=reward-wallpaper-v9/);
 assert.match(html,/src\/vocabulary\/router\.js\?v=classroom-lite-hotfix-v1/);
 assert.match(router,/\.\/app\.js\?v=classroom-lite-hotfix-v1/);
});
