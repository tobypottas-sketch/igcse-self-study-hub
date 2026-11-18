import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {equippedCosmetics,studentIdentityView,renderIdentityShowcase,applyRewardTheme} from '../src/vocabulary/rewards-equipped-home.js';

const rewards=[
 {reward_id:'sakura',category:'themes',name:'Sakura Theme'},
 {reward_id:'ocean',category:'themes',name:'Ocean Theme'},
 {reward_id:'sparkle',category:'effects',name:'Sparkle Effect'},
 {reward_id:'gold-frame',category:'frames',name:'Golden Frame'},
 {reward_id:'word-wizard',category:'titles',name:'Word Wizard'}
];
const sandbox={ok:true,shopMode:'sandbox',sandboxEnabled:true,rewards,owned:[
 {reward_id:'sakura',category:'themes',equipped:true},
 {reward_id:'sparkle',category:'effects',equipped:true},
 {reward_id:'gold-frame',category:'frames',equipped:true},
 {reward_id:'word-wizard',category:'titles',equipped:true}
]};
test('test account shows actual sandbox-equipped Sparkle artwork and themed profile, clearly labelled as preview',()=>{
 assert.deepEqual(equippedCosmetics(sandbox),{themes:'sakura',effects:'sparkle',frames:'gold-frame',titles:'word-wizard'});
 assert.equal(studentIdentityView(sandbox,'TEST STUDENT').sandboxPreview,true);
 const html=renderIdentityShowcase(sandbox,'TEST STUDENT');
 assert.match(html,/TEST COSMETICS PREVIEW/);
 assert.match(html,/4 \/ 4 test equipped/);
 assert.match(html,/sparkle\.png/);
 assert.match(html,/gold-frame\.png/);
 assert.match(html,/Word Wizard/);
 assert.match(html,/Sakura Theme active/);
 assert.doesNotMatch(html,/0 \/ 4 equipped/);
});
test('sandbox cosmetics never grant production inventory, and are not available for arbitrary callers',()=>{
 assert.deepEqual(equippedCosmetics({...sandbox,sandboxEnabled:false}),{});
 assert.deepEqual(equippedCosmetics({...sandbox,shopMode:'production',owned:[]}),{});
 assert.deepEqual(equippedCosmetics({...sandbox,owned:[{reward_id:'unlisted',category:'effects',equipped:true}]}),{});
 assert.deepEqual(equippedCosmetics({...sandbox,owned:[{reward_id:'sparkle',category:'frames',equipped:true}]}),{});
});
test('sandbox Sakura preview activates and clears root theme and effect classes',()=>{
 const classes=new Set(),root={classList:{
  add(...args){args.forEach(x=>classes.add(x))},
  remove(...args){args.forEach(x=>classes.delete(x))}
 }};
 applyRewardTheme(root,sandbox);
 assert.ok(classes.has('vocab-real-theme--sakura'));
 assert.ok(classes.has('vocab-real-effect--sparkle'));
 applyRewardTheme(root,{...sandbox,owned:[]});
 assert.ok(!classes.has('vocab-real-theme--sakura'));
 assert.ok(!classes.has('vocab-real-effect--sparkle'));
});
test('home refresh and test shop equipment refresh the preview while never copying balances',()=>{
 const app=fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
 assert.match(app,/async function updateSandboxCosmetics\(shop\)/);
 assert.match(app,/shop\.sandboxEnabled!==true/);
 assert.match(app,/await updateSandboxCosmetics\(result\)/);
 assert.match(app,/await updateSandboxCosmetics\(shop\)/);
 assert.match(app,/await updateSandboxCosmetics\(sandboxShop\)/);
 assert.match(app,/sandboxEquipped\?sandboxCosmeticShop:productionCosmeticShop/);
 assert.match(app,/cosmeticModule\.renderEquippedCosmetics\(root,shop/);
 const cosmetic=app.slice(app.indexOf('function effectiveCosmeticShop()'),app.indexOf('function installStudentIdentityObserver()'));
 assert.doesNotMatch(cosmetic,/wallet\.|spent_xp|granted_xp|service_role/);
});
test('purchased sandbox themes auto-equip via a second free equip operation',()=>{
 const app=fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
 const piece=app.slice(app.indexOf('async function applySandboxReward('),app.indexOf('// One responsive strip:'));
 assert.match(piece,/const themeBought=action==='buy'/);
 assert.match(piece,/body:\{action:'equip',rewardId\}/);
 assert.match(piece,/feedback='Test theme purchased and previewed!'/);
});
test('four themes override fixed default wallpaper, vivid hero, unit cards, badges and buttons',()=>{
 const css=fs.readFileSync(new URL('../vocabulary-reward-identity.css',import.meta.url),'utf8');
 for(const theme of ['forest','ocean','sakura','midnight']){
  assert.match(css,new RegExp('body:has\\(#vocabularyApp\\.vocab-real-theme--'+theme+'\\)'));
  assert.match(css,new RegExp('#vocabularyApp\\.vocab-real-theme--'+theme+'\\{'));
 }
 assert.match(css,/vocab-shell--home > \.vocab-hero--home/);
 assert.match(css,/\.vocab-unit-card/);
 assert.match(css,/\.vocab-progress-entry button/);
 assert.match(css,/\.vocab-student-identity__badge/);
 assert.match(css,/var\(--reward-scene,none\)/);
 assert.doesNotMatch(css,/\.vocab-answer--correct\s*\{|\.vocab-answer--wrong\s*\{/);
});
