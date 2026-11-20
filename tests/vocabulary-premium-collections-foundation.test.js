import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';
import {equippedCosmetics,studentIdentityView,applyRewardTheme,renderIdentityShowcase} from '../src/vocabulary/rewards-equipped-home.js';
import {PREMIUM_COLLECTIONS,visibleEquipmentCategories} from '../src/vocabulary/rewards-premium-registry.js';

const reward=(reward_id,category,name=reward_id)=>({reward_id,category,name,xp_price:800,description:'Cosmetic'});
const base={shopMode:'sandbox',sandboxEnabled:true,wallet:{available:10000},rewards:[reward('sakura','themes'),reward('pixel-badge','effects')],owned:[{reward_id:'pixel-badge',category:'effects',equipped:true}]};
test('five premium collections contain unique IDs and all five reward types',()=>{
 assert.equal(PREMIUM_COLLECTIONS.length,5);
 assert.equal(new Set(PREMIUM_COLLECTIONS.flatMap(x=>x.rewards.map(y=>y[0]))).size,25);
 for(const group of PREMIUM_COLLECTIONS){
  assert.deepEqual(group.rewards.map(x=>x[1]).sort(),['badges','effects','frames','themes','titles'].sort());
  assert.ok(group.rewards.every(x=>x[3]>0));
 }
});
test('existing student has four original slots and original pixel effect',()=>{
 assert.equal(visibleEquipmentCategories(base).length,4);
 const root={innerHTML:''};
 renderSandboxShop(root,base);
 assert.doesNotMatch(root.innerHTML,/data-category="badges"/);
 assert.match(root.innerHTML,/4 slots · Your current look/);
 assert.match(renderIdentityShowcase(base),/1 \/ 4/);
 assert.match(studentIdentityView(base).badge,/pixel-badge.png/);
});
test('badge catalogue enables fifth slot, dedicated badge artwork and filtered shop',()=>{
 const shop={...base,rewards:[...base.rewards,reward('neon-hacker-badge','badges','Neon Hacker Badge')],owned:[
  ...base.owned,{reward_id:'neon-hacker-badge',category:'badges',equipped:true}
 ]};
 assert.equal(visibleEquipmentCategories(shop).length,5);
 assert.equal(equippedCosmetics(shop).badges,'neon-hacker-badge');
 const root={innerHTML:''};
 renderSandboxShop(root,shop,{category:'badges'});
 assert.match(root.innerHTML,/data-category="badges"/);
 assert.match(root.innerHTML,/5 slots · Your current look/);
 assert.match(root.innerHTML,/vocab-shop-equipped__list has-badges/);
 assert.equal((root.innerHTML.match(/class="vocab-reward-card vocab-shop-card/g)||[]).length,1);
 assert.match(renderIdentityShowcase(shop),/2 \/ 5/);
 const production={...shop,shopMode:'production',purchasesEnabled:true,walletStatus:'ready'};
 renderProductionShop(root,production,{category:'badges'});
 assert.match(root.innerHTML,/data-action="real-filter"/);
});
test('theme switching clears old cosmetic classes, never touches progress',()=>{
 const tokens=new Set(['vocab-real-theme--sakura','vocab-real-effect--sparkle','learning-progress']);
 const root={classList:{add(x){tokens.add(x)},remove(...xs){for(const x of xs)tokens.delete(x)}}};
 const shop={...base,rewards:[...base.rewards,reward('neon-district','themes')],owned:[
  {reward_id:'neon-district',category:'themes',equipped:true}
 ]};
 applyRewardTheme(root,shop);
 assert.ok(tokens.has('vocab-real-theme--neon-district'));
 assert.ok(!tokens.has('vocab-real-theme--sakura'));
 assert.ok(tokens.has('learning-progress'));
 applyRewardTheme(root,{...base,owned:[]});
 assert.ok(!tokens.has('vocab-real-theme--neon-district'));
 assert.ok(tokens.has('learning-progress'));
});

test('live click router accepts Badges on both shop filters and permits Badge unequip',()=>{
 // The shop already renders the Badge tab; these application guards must
 // include the category too or the click silently does nothing.
 const fs=requireRead();
 const app=fs('src/vocabulary/app.js');
 const list="['all','themes','frames','badges','titles','effects','popular']";
 assert.match(app,/action === 'real-filter'/);
 assert.match(app,/action === 'sandbox-filter'/);
 assert.equal(app.split(list).length-1,2,'Both production and sandbox filters must admit badges');
 assert.match(app,/function removeEquippedReward\(category,production,clickedButton=null\)/);
 assert.ok(app.includes("['themes','frames','badges','titles','effects'].includes(category)"));
 const router=fs('src/vocabulary/router.js');
 const html=fs('vocabulary.html');
 assert.equal((router.match(/app\.js\?v=badge-filter-fix-v2/g)||[]).length,2);
 assert.ok(html.includes('router.js?v=badge-filter-fix-v2'));
});
function requireRead(){
 return path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
}
