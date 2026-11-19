import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';

const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const rewards=[
 {reward_id:'language-ace',name:'Language Ace',description:'For students reaching new heights.',category:'titles',xp_price:1600,icon:'🏅'},
 {reward_id:'gold-frame',name:'Golden Frame',description:'A premium profile border.',category:'frames',xp_price:1200,icon:'🖼️'}
];
const sandbox={shopMode:'sandbox',sandboxEnabled:true,wallet:{available:2000},rewards,owned:[]};
const production={...sandbox,shopMode:'production',purchasesEnabled:true,walletStatus:'ready'};
test('equipped heading and next reward use compact metadata without losing real rewards',()=>{
 const root={innerHTML:''};renderSandboxShop(root,sandbox,{studentName:'Test Student'});
 assert.match(root.innerHTML,/YOUR COLLECTION/);
 assert.match(root.innerHTML,/4 slots · Your current look/);
 assert.doesNotMatch(root.innerHTML,/Your active rewards and customisations/);
 assert.match(root.innerHTML,/vocab-shop-next__category/);
 assert.match(root.innerHTML,/vocab-shop-next__info/);
 assert.match(root.innerHTML,/vocab-shop-next__status is-ready/);
 assert.match(root.innerHTML,/Ready to unlock/);
 assert.match(root.innerHTML,/Language Ace/);
 assert.match(root.innerHTML,/vocab-shop-equipped__list/);
 assert.match(root.innerHTML,/data-action="sandbox-filter"/);
});
test('when reward is not affordable preserve original price logic and use locked status',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,{...sandbox,wallet:{available:100}}, {studentName:'Test Student'});
 assert.match(root.innerHTML,/vocab-shop-next__status is-locked/);
 assert.match(root.innerHTML,/XP to go/);
 assert.match(root.innerHTML,/XP to unlock/);
});
test('production reward and equipment actions remain unchanged',()=>{
 const root={innerHTML:''};renderProductionShop(root,production,{studentName:'Student'});
 assert.match(root.innerHTML,/data-action="real-filter"/);
 assert.match(root.innerHTML,/data-action="real-buy"/);
 assert.match(root.innerHTML,/data-action="real-leaderboard-expand"/);
 assert.doesNotMatch(root.innerHTML,/data-action="sandbox-buy"/);
});
test('style sheet is scoped to Rewards Shop and loaded after reward styles',()=>{
 const css=read('vocabulary-rewards-info-polish.css');
 const html=read('vocabulary.html');
 assert.match(css,/#vocabularyApp \.vocab-shop-redesign \.vocab-shop-equipped/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)/);
 assert.match(css,/\.vocab-shop-next__category/);
 assert.match(css,/\.vocab-shop-next__status\.is-locked/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.ok(html.indexOf('vocabulary-rewards-info-polish.css?v=reward-info-polish-v1')>html.indexOf('vocabulary-rewards.css'));
 assert.doesNotMatch(css,/gm-option|vocab-choice|vocab-student-identity\{/);
});
