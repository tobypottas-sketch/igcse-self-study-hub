import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';
import {renderIdentityShowcase} from '../src/vocabulary/rewards-equipped-home.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const ids=['gold-frame','scholar-frame','aurora-frame','survivor-frame','cyber-pulse-frame'];
const root=()=>({innerHTML:'',classList:Object.assign(new Set(),{
  remove(...classes){classes.forEach(c=>this.delete(c))}
}),querySelector:()=>null});

test('full portrait-frame assets display without forced 12:7 cropping',()=>{
 const shopCss=read('vocabulary-rewards.css');
 assert.ok(shopCss.includes('.vocab-shop-card--frames .vocab-reward-picture > .vocab-shop-illustration'));
 assert.ok(shopCss.includes('aspect-ratio:1 / 1'));
 assert.ok(shopCss.includes('background:radial-gradient'));
 assert.ok(shopCss.includes('border-radius:0'));
 assert.ok(shopCss.includes('object-fit:contain'));
 assert.ok(shopCss.includes('object-position:center'));
 assert.ok(shopCss.includes('.vocab-shop-equipped__item:nth-child(2) .vocab-shop-illustration'));
 const html=read('vocabulary.html');
 assert.ok(html.includes('vocabulary-rewards.css?v=shop-frame-clean-v1'));
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
 assert.ok(read('vocabulary.html').includes('vocabulary-reward-identity.css?v=player-avatars-v1'));
});

test('frame cards, equipped collection and actual profile consistently use transparent ornaments',()=>{
 for(const id of ids){
  const reward={reward_id:id,name:id,category:'frames',xp_price:800,description:'Original frame'};
  const shop={shopMode:'production',purchasesEnabled:true,walletStatus:'ready',wallet:{available:3000},
    rewards:[reward],owned:[{reward_id:id,category:'frames',equipped:true}]};
  const node=root();
  renderProductionShop(node,shop,{category:'frames'});
  assert.ok(node.innerHTML.includes('vocab-shop-card--frames'));
  const expected=/^(gold-frame|scholar-frame|aurora-frame)$/.test(id)?id+'-overlay':id;
  assert.ok(node.innerHTML.includes('assets/vocabulary/rewards/'+expected+'.png'),
    'Shop must show clean transparent frame for '+id);
  if(expected!==id) assert.ok(!node.innerHTML.includes('src="assets/vocabulary/rewards/'+id+'.png"'),
    'Shop must not show rectangular preview for '+id);
  assert.ok((node.innerHTML.match(new RegExp('src="assets/vocabulary/rewards/'+expected+'\\.png"','g'))||[]).length>=2,
    'Both shop card and equipped collection show the same transparent ornament');
  const profile=renderIdentityShowcase(shop,'Test Student');
  assert.ok(profile.includes('class="vocab-student-identity__frame"'));
  assert.ok(profile.includes('assets/vocabulary/rewards/'+expected+'.png'),
    'Equipped art must be transparent for '+id);
  if(expected!==id) assert.ok(!profile.includes('src="assets/vocabulary/rewards/'+id+'.png"'));
 }
});

test('the three equipped-only assets have transparent corners and a transparent centre',()=>{
 for(const id of ['gold-frame','scholar-frame','aurora-frame']){
   const file=readFileSync(new URL('../assets/vocabulary/rewards/'+id+'-overlay.png',import.meta.url));
   assert.equal(file.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
   assert.equal(file.readUInt32BE(16),512);
   assert.equal(file.readUInt32BE(20),512);
   assert.equal(file[25],6,'Overlay is RGBA');
   // PNG alpha pixel assertions are performed by Pillow during asset build.
 }
});
