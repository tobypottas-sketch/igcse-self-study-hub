import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const reward={reward_id:'language-ace',name:'Language Ace',description:'For students reaching new heights.',category:'titles',xp_price:1600,icon:'🏅'};
const base={shopMode:'sandbox',sandboxEnabled:true,wallet:{available:2000},rewards:[reward],owned:[]};

test('ready reward is a real shop navigation action, not dead text',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,base);
 assert.match(root.innerHTML,/class="vocab-shop-next__status is-ready" data-action="sandbox-filter" data-category="titles" data-focus-reward="language-ace"/);
 assert.match(root.innerHTML,/Ready to unlock/);
 assert.match(root.innerHTML,/Language Ace/);
 assert.match(root.innerHTML,/vocab-shop-next__art/);
});
test('locked reward status is not an actionable purchase shortcut',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,{...base,wallet:{available:100}});
 const next=root.innerHTML.split('<div class="vocab-shop-next">')[1].split('</aside>')[0];
 assert.match(next,/vocab-shop-next__status is-locked/);
 assert.match(next,/XP to go/);
 assert.doesNotMatch(next,/data-focus-reward/);
});
test('production view converts ready action to production filter safely',()=>{
 const root={innerHTML:''};
 renderProductionShop(root,{...base,shopMode:'production',purchasesEnabled:true,walletStatus:'ready'});
 assert.match(root.innerHTML,/data-action="real-filter" data-category="titles" data-focus-reward="language-ace"/);
 assert.doesNotMatch(root.innerHTML,/data-action="sandbox-filter"/);
 const app=read('src/vocabulary/app.js');
 assert.match(app,/function focusShopReward\(rewardId\)/);
 assert.match(app,/card\.focus\?\.\(\{preventScroll:true\}\)/);
 assert.match(app,/target\.dataset\.focusReward/);
});
test('latest reward styles enforce a one-column image, copy and full-width badge at all sizes',()=>{
 const css=read('vocabulary-next-unlock-stack.css');
 const html=read('vocabulary.html');
 assert.ok(html.indexOf('vocabulary-next-unlock-stack.css?v=single-column-v1')>html.indexOf('vocabulary-rewards-info-polish.css'));
 assert.match(css,/\.vocab-shop-next__detail\{[\s\S]*?grid-template-columns:minmax\(0,1fr\)/);
 assert.match(css,/\.vocab-shop-next__status\{[\s\S]*?width:100%/);
 assert.match(css,/\.vocab-shop-next__art[\s\S]*?max-width:none/);
 assert.match(css,/@media\(max-width:840px\)/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/@media\(max-width:360px\)/);
 assert.match(css,/object-fit:contain/);
 assert.match(css,/focus-visible/);
 assert.doesNotMatch(css,/vocab-unit-card|vocab-tile|vocab-student-identity/);
});
