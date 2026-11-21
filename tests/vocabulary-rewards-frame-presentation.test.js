import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';
import {renderIdentityShowcase} from '../src/vocabulary/rewards-equipped-home.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const ids=['gold-frame','scholar-frame','survivor-frame'];
const root=()=>({innerHTML:'',classList:Object.assign(new Set(),{
  remove(...classes){classes.forEach(c=>this.delete(c))}
}),querySelector:()=>null});

test('full portrait-frame assets display without forced 12:7 cropping',()=>{
 const shopCss=read('vocabulary-rewards.css');
 assert.ok(shopCss.includes('.vocab-shop-card--frames .vocab-reward-picture > .vocab-shop-illustration'));
 assert.ok(shopCss.includes('aspect-ratio:1 / 1'));
 assert.ok(shopCss.includes('object-fit:contain'));
 assert.ok(shopCss.includes('object-position:center'));
 assert.ok(shopCss.includes('.vocab-shop-equipped__item:nth-child(2) .vocab-shop-illustration'));
 const html=read('vocabulary.html');
 assert.ok(html.includes('vocabulary-rewards.css?v=frame-art-contain-v1'));
});

test('equipped portrait-frame overlay preserves source proportions with no border clipping',()=>{
 const css=read('vocabulary-reward-identity.css');
 const start=css.indexOf('#vocabularyApp .vocab-student-identity__frame{');
 const end=css.indexOf('}',start);
 const rule=css.slice(start,end);
 assert.ok(rule.includes('object-fit:contain'));
 assert.ok(rule.includes('object-position:center'));
 assert.ok(rule.includes('border-radius:0'));
 assert.ok(!rule.includes('object-fit:fill'));
 assert.ok(read('vocabulary.html').includes('vocabulary-reward-identity.css?v=frame-proportions-v1'));
});

test('frame shop cards and equipped profile use same original PNG asset',()=>{
 for(const id of ids){
  const reward={reward_id:id,name:id,category:'frames',xp_price:800,description:'Original frame'};
  const shop={shopMode:'production',purchasesEnabled:true,walletStatus:'ready',wallet:{available:3000},
    rewards:[reward],owned:[{reward_id:id,category:'frames',equipped:true}]};
  const node=root();
  renderProductionShop(node,shop,{category:'frames'});
  assert.ok(node.innerHTML.includes('vocab-shop-card--frames'));
  assert.ok(node.innerHTML.includes('assets/vocabulary/rewards/'+id+'.png'));
  const profile=renderIdentityShowcase(shop,'Test Student');
  assert.ok(profile.includes('class="vocab-student-identity__frame"'));
  assert.ok(profile.includes('assets/vocabulary/rewards/'+id+'.png'));
 }
});
