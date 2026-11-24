import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';

const css=readFileSync(new URL('../vocabulary-shop-card-polish-v2.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../vocabulary.html',import.meta.url),'utf8');
const fixtures=[
 {reward_id:'gold-frame',category:'frames',name:'Golden Frame',description:'A golden border for your profile.',xp_price:800},
 {reward_id:'survivor-frame',category:'frames',name:'Survivor Frame',description:'A weathered steel portrait frame wrapped in vines.',xp_price:800},
 {reward_id:'the-pathfinder',category:'titles',name:'The Pathfinder',description:'A weathered title plate for a student who finds a way through.',xp_price:1200},
 {reward_id:'neon-hacker-badge',category:'badges',name:'Neon Hacker Badge',description:'A collectible holographic hacker emblem.',xp_price:800},
 {reward_id:'pixel-burst',category:'effects',name:'Pixel Burst',description:'Colourful pixels burst around your avatar.',xp_price:1000}
];
const makeShop=(production=false)=>({
 shopMode:production?'production':'sandbox',sandboxEnabled:!production,
 purchasesEnabled:production,walletStatus:'ready',
 wallet:{available:3000},rewards:fixtures,owned:[{reward_id:'gold-frame',category:'frames',equipped:true},{reward_id:'pixel-burst',category:'effects',equipped:false}]
});
const render=production=>{
 const root={innerHTML:''};
 const args={category:'all',studentName:'Test Student'};
 if(production)renderProductionShop(root,makeShop(true),args);
 else renderSandboxShop(root,makeShop(),args);
 return root.innerHTML;
};

test('new card density sheet is loaded after the entire theme stack',()=>{
 const pos=html.indexOf('vocabulary-shop-card-polish-v2.css?v=shop-density-contain-actions-v2');
 assert.ok(pos>0);
 for(const file of ['vocabulary-rewards.css','vocabulary-premium-blockverse.css','vocabulary-blockverse-legibility-v3.css','vocabulary-shop-theme-glass.css','vocabulary-study-two-tier-header.css']){
  assert.ok(html.indexOf(file)>=0&&html.indexOf(file)<pos,file+' loaded before card polish');
 }
});

test('grid cards are content-height rather than height-stretched or flex-expanded',()=>{
 assert.match(css,/align-items:start!important/);
 assert.match(css,/grid-auto-rows:max-content/);
 assert.match(css,/align-self:start!important/);
 assert.match(css,/height:auto!important/);
 assert.match(css,/min-height:0!important/);
 assert.match(css,/flex:0 0 auto!important/);
 assert.match(css,/margin-top:8px!important/);
});

test('artwork never crops title plates, frames, badges, effects or theme thumbnails',()=>{
 assert.match(css,/\.vocab-reward-picture > img\.vocab-shop-illustration/);
 assert.match(css,/object-fit:contain!important/);
 assert.match(css,/aspect-ratio:auto!important/);
 assert.match(css,/vocab-shop-card--frames/);
 assert.match(css,/vocab-shop-card--titles/);
 assert.match(css,/vocab-shop-card--themes/);
 assert.doesNotMatch(css,/object-fit:cover/);
 assert.match(css,/max-width:100%/);
});

test('buy, equip and equipped states keep real existing actions and accessible contrast',()=>{
 const sandbox=render(false),production=render(true);
 for(const markup of [sandbox,production]){
  assert.match(markup,/vocab-shop-card--frames/);
  assert.match(markup,/vocab-shop-card--titles/);
  assert.match(markup,/vocab-shop-card--effects/);
  assert.match(markup,/survivor-frame/);
  assert.match(markup,/the-pathfinder/);
  assert.match(markup,/neon-hacker-badge/);
  assert.match(markup,/class="is-owned"[^>]*>Equipped<\/button>/);
 }
 assert.match(sandbox,/data-action="sandbox-buy"/);
 assert.match(sandbox,/data-action="sandbox-equip"/);
 assert.match(production,/data-action="real-buy"/);
 assert.match(production,/data-action="real-equip"/);
 assert.match(css,/button\.is-owned:not\(:disabled\)/);
 assert.match(css,/button\.is-owned:disabled/);
 assert.match(css,/focus-visible/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('description hierarchy is larger, readable and cannot grow into dead space',()=>{
 assert.match(css,/font-family:"Arial Black"/);
 assert.match(css,/font-size:clamp\(1\.16rem,1\.35vw,1\.4rem\)!important/);
 assert.match(css,/font-size:clamp\(\.94rem,1\.06vw,1\.08rem\)!important/);
 assert.match(css,/flex:0 0 auto!important/);
 assert.match(css,/\.vocab-reward-category/);
 assert.match(css,/@media\(max-width:740px\)/);
 assert.match(css,/@media\(max-width:440px\)/);
});
