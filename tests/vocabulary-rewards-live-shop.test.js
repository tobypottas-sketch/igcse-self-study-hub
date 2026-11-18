import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderProductionShop,renderSandboxShop} from '../src/vocabulary/rewards-sandbox-view.js';
import {equippedCosmetics} from '../src/vocabulary/rewards-equipped-home.js';
const rewards=[
 {reward_id:'forest',name:'Forest Theme',category:'themes',xp_price:600,description:'Natural look'},
 {reward_id:'gold-frame',name:'Golden Frame',category:'frames',xp_price:800,description:'Gold trim'},
 {reward_id:'word-wizard',name:'Word Wizard',category:'titles',xp_price:1000,description:'Your title'},
 {reward_id:'sparkle',name:'Sparkle Effect',category:'effects',xp_price:1100,description:'Sparkle'}
];
const owned=[
 {reward_id:'forest',category:'themes',equipped:true},
 {reward_id:'gold-frame',category:'frames',equipped:true},
 {reward_id:'word-wizard',category:'titles',equipped:false}
];
const shop={ok:true,purchasesEnabled:true,shopMode:'production',walletStatus:'ready',
 wallet:{verifiedEarned:2300,spent:800,available:1500},rewards,owned};
const progress={level:{level:3,xp:2300,next:2900,progressPercent:33},weekly:{label:'2 of 4 missions'}};
test('live shop renders real wallet and approved PNG art without sandbox labels',()=>{
 const root={innerHTML:''};
 renderProductionShop(root,shop,{studentName:'STUDENT A',progress});
 assert.match(root.innerHTML,/1,500 XP/);
 assert.match(root.innerHTML,/2,300 XP/);
 assert.match(root.innerHTML,/gold-frame\.png/);
 assert.match(root.innerHTML,/forest\.png/);
 assert.match(root.innerHTML,/shop-banner\.png/);
 assert.match(root.innerHTML,/data-action="real-buy"/);
 assert.match(root.innerHTML,/data-action="real-equip"/);
 assert.match(root.innerHTML,/data-action="real-filter"/);
 assert.match(root.innerHTML,/data-action="back-real-home"/);
 assert.doesNotMatch(root.innerHTML,/data-action="sandbox-|Test credits only|Sandbox available| · Test shop/);
});
test('equipped and affordable/locked cards reflect server wallet',()=>{
 const root={innerHTML:''};
 renderProductionShop(root,{...shop,wallet:{verifiedEarned:900,spent:800,available:100}},{progress});
 assert.match(root.innerHTML,/XP to unlock/);
 assert.match(root.innerHTML,/Equipped/);
 assert.match(root.innerHTML,/Equip/);
 assert.match(root.innerHTML,/disabled/);
});
test('production shop refuses incomplete readiness, sandbox renderer remains sandbox-only',()=>{
 const root={innerHTML:''};
 assert.throws(()=>renderProductionShop(root,{...shop,walletStatus:'not_initialized'}),/not ready/);
 assert.throws(()=>renderProductionShop(root,{...shop,purchasesEnabled:false}),/not ready/);
 assert.throws(()=>renderSandboxShop(root,shop),/Sandbox not enabled/);
});
test('home cosmetics only use server-owned equipped catalogue rewards',()=>{
 assert.deepEqual(equippedCosmetics(shop),{themes:'forest',frames:'gold-frame'});
 assert.deepEqual(equippedCosmetics({...shop,owned:[{reward_id:'not-in-catalogue',category:'frames',equipped:true}]}),{});
 assert.deepEqual(equippedCosmetics({...shop,shopMode:'sandbox'}),{});
});
test('student app keeps test and real purchase actions distinct and reuses approved art',()=>{
 const app=fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
 assert.match(app,/functions\.invoke\('vocabulary-reward-production'/);
 assert.match(app,/functions\.invoke\('vocabulary-reward-wallet-sync'/);
 assert.match(app,/applyRealReward\('buy'/);
 assert.match(app,/applyRealReward\('equip'/);
 assert.match(app,/data-action="open-real-shop"/);
 assert.match(app,/renderEquippedCosmetics/);
 assert.match(app,/refreshRealLeaderboard/);
 assert.match(app,/applySandboxReward\('buy'/);
});
