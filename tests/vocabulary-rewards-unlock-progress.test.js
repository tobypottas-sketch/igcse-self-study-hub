import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';

const rewards=[
 {reward_id:'word-explorer',name:'Word Explorer',category:'titles',xp_price:350,description:'Title'},
 {reward_id:'forest',name:'Forest Theme',category:'themes',xp_price:600,description:'Theme'},
 {reward_id:'pixel-badge',name:'Pixel Badge',category:'effects',xp_price:400,description:'Effect'}
];
const production={shopMode:'production',purchasesEnabled:true,walletStatus:'ready',wallet:{verifiedEarned:320,spent:0,available:320},rewards,owned:[]};
test('production shop shows precise XP remaining and accessible progress meters',()=>{
 const root={innerHTML:''};renderProductionShop(root,production);
 assert.match(root.innerHTML,/30 XP to unlock/);
 assert.match(root.innerHTML,/280 XP to unlock/);
 assert.match(root.innerHTML,/80 XP to unlock/);
 assert.equal((root.innerHTML.match(/class="vocab-shop-unlock__track"/g)||[]).length,3);
 assert.match(root.innerHTML,/aria-valuemax="350" aria-valuenow="320"/);
 assert.doesNotMatch(root.innerHTML,/Not enough XP/);
 assert.doesNotMatch(root.innerHTML,/data-action="real-buy"/);
});
test('affordable reward keeps its clickable buy button and owned rewards keep equip',()=>{
 const root={innerHTML:''};
 renderProductionShop(root,{...production,wallet:{verifiedEarned:700,spent:0,available:700},
  owned:[{reward_id:'forest',category:'themes',equipped:false}]});
 assert.match(root.innerHTML,/data-action="real-buy"/);
 assert.match(root.innerHTML,/data-action="real-equip"/);
 assert.doesNotMatch(root.innerHTML,/Not enough XP/);
});
test('sandbox keeps the same progress display without changing sandbox spending',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,{sandboxEnabled:true,shopMode:'sandbox',wallet:{granted:320,spent:0,available:320},rewards,owned:[]});
 assert.match(root.innerHTML,/30 XP to unlock/);
 assert.match(root.innerHTML,/data-action="open-sandbox-shop"|data-action="back-sandbox-home"/);
});
test('scroll resets only upon entering either shop, never when switching filters or updating leaderboard',()=>{
 const source=fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
 assert.match(source,/function scrollToShopTop\(\)/);
 assert.match(source,/window\.scrollTo\(0,0\)/);
 assert.match(source,/requestAnimationFrame\(reset\)/);
 assert.match(source,/await renderCurrentSandboxShop\(message\);\s*await updateSandboxCosmetics\(shop\);\s*scrollToShopTop\(\);/);
 assert.match(source,/await renderRealShop\(\);\s*scrollToShopTop\(\);/);
 const functionBlock=source.slice(source.indexOf('async function renderRealShop('),source.indexOf('async function refreshRealLeaderboard('));
 assert.doesNotMatch(functionBlock,/scrollToShopTop/);
});
