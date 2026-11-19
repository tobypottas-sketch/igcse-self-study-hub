import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const shop={sandboxEnabled:true,shopMode:'sandbox',wallet:{available:100000},owned:[],rewards:[{reward_id:'language-ace',name:'Language Ace',description:'For students reaching new heights.',category:'titles',xp_price:1600,icon:'🏅'}]};
test('affordable Next unlock always links to its real reward through category filter',()=>{
 const root={innerHTML:''};renderSandboxShop(root,shop);
 assert.match(root.innerHTML,/data-action="sandbox-filter" data-category="titles" data-focus-reward="language-ace"/);
 renderProductionShop(root,{...shop,shopMode:'production',purchasesEnabled:true,walletStatus:'ready'});
 assert.match(root.innerHTML,/data-action="real-filter" data-category="titles" data-focus-reward="language-ace"/);
});
test('fresh router and app module versions deliver latest click handler',()=>{
 const html=read('vocabulary.html'),router=read('src/vocabulary/router.js'),app=read('src/vocabulary/app.js');
 assert.match(html,/router\.js\?v=unlock-jump-v2/);
 assert.match(router,/app\.js\?v=unlock-jump-v2/);
 assert.match(app,/rewards-sandbox-view\.js\?v=unlock-jump-v2/);
 assert.match(app,/target\.dataset\.focusReward/);
 assert.match(app,/requestAnimationFrame\(\(\)=>\{/);
 assert.match(app,/card\.scrollIntoView\?\.\(\{behavior:'smooth',block:'center'\}\)/);
 assert.match(app,/card\.classList\.add\('is-featured-reward'\)/);
 assert.match(app,/buy\.focus\?\.\(\{preventScroll:true\}\)/);
});
test('focused product receives visible highlight and accessible focus without purchasing',()=>{
 const css=read('vocabulary-next-unlock-jump.css');
 const html=read('vocabulary.html');
 assert.match(css,/\.vocab-shop-card\.is-featured-reward/);
 assert.match(css,/YOUR NEXT UNLOCK/);
 assert.match(css,/:focus-visible/);
 assert.ok(html.includes('vocabulary-next-unlock-jump.css?v=unlock-jump-v2'));
 const app=read('src/vocabulary/app.js');
 assert.doesNotMatch(app,/focusShopReward\([\s\S]{0,50}apply(?:Real|Sandbox)Reward/);
});