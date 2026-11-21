import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PREMIUM_COLLECTIONS} from '../src/vocabulary/rewards-premium-registry.js';
import {rewardArtworkPath} from '../src/vocabulary/rewards-art.js';
import {applyRewardTheme,renderIdentityShowcase,studentIdentityView} from '../src/vocabulary/rewards-equipped-home.js';
import {renderProductionShop,renderSandboxShop} from '../src/vocabulary/rewards-sandbox-view.js';

const collection=PREMIUM_COLLECTIONS.find(item=>item.id==='afterlight');
const approved=[
  ['afterlight','themes',2200,1448,1086,2,'b97bbf47c4030e827f95ee67bce65d209f7a2edbeab9ed18b8ba9cc25aeeec9a'],
  ['survivor-frame','frames',800,1254,1254,6,'970f853b316453e7330573f9e97e46f2b48c232e04ebf172166b9b77e2e9f967'],
  ['last-explorer-badge','badges',600,1254,1254,6,'6ab53a51b82455be164cb29dbe4f20bd7469f9ca39add9518da3fbafc1e884da'],
  ['the-pathfinder','titles',1200,2172,724,6,'83973b48aa2f4ddd6ae701d68234a4a181f324e88c88b29a4a3c83d449d647c7'],
  ['golden-sunrays','effects',1400,1254,1254,6,'807559c2cbf4f5d7cc00854e4e9d06862c041b4bc06e7fae1c4792ae90ec6d2b']
];
const rewards=collection.rewards.map(([reward_id,category,name,xp_price])=>({reward_id,category,name,xp_price}));
const shop={shopMode:'production',purchasesEnabled:true,walletStatus:'ready',wallet:{available:6200},rewards,owned:[]};
const read=path=>readFileSync(new URL('../'+path,import.meta.url));

test('Afterlight artwork matches the supplied PNGs, catalogue slots and prices',()=>{
  assert.deepEqual(rewards.map(row=>[row.reward_id,row.category,row.xp_price]),approved.map(row=>row.slice(0,3)));
  const migration=read('supabase/migrations/20261121090000_vocabulary_afterlight_catalog.sql').toString();
  for(const [id,category,price,width,height,colorType,digest] of approved){
    const name=rewards.find(row=>row.reward_id===id).name;
    assert.ok(migration.includes(`('${id}','${name}','${category}',${price},`));
    const path=rewardArtworkPath(id);
    assert.equal(path,`assets/vocabulary/rewards/${id}.png`);
    const png=read(path);
    assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20),png[25]],[width,height,colorType]);
    assert.equal(createHash('sha256').update(png).digest('hex'),digest);
  }
  assert.equal(rewards.reduce((total,row)=>total+row.xp_price,0),6200);
});

test('each category renders its original art and below-price wallets show unlock progress',()=>{
  for(const reward of rewards){
    const root={innerHTML:'',querySelector:()=>null};
    renderProductionShop(root,{...shop,wallet:{available:reward.xp_price-1}},{category:reward.category});
    const cards=[...root.innerHTML.matchAll(/<article class="vocab-reward-card[^>]*data-reward-id="([^"]+)"/g)];
    assert.deepEqual(cards.map(card=>card[1]),[reward.reward_id]);
    assert.ok(root.innerHTML.includes(rewardArtworkPath(reward.reward_id)));
    assert.match(root.innerHTML,/1 XP to unlock/);
    assert.doesNotMatch(root.innerHTML,/data-action="real-buy"/);
    if(reward.category==='effects') assert.match(root.innerHTML,/data-preview-effect="golden-sunrays"/);
  }
});

test('Afterlight portrait layers and theme require server-returned equipped ownership',()=>{
  const owned=rewards.map(({reward_id,category})=>({reward_id,category,equipped:true}));
  const equipped={...shop,owned};
  const root={classList:new Set()};
  root.classList.remove=(...classes)=>classes.forEach(name=>root.classList.delete(name));
  applyRewardTheme(root,equipped);
  assert.deepEqual([...root.classList],['vocab-real-theme--afterlight','vocab-real-effect--golden-sunrays']);
  const html=renderIdentityShowcase(equipped,'Test Student');
  assert.match(html,/data-cosmetic-effect="golden-sunrays"/);
  assert.equal((html.match(/vocab-cosmetic-particle--/g)||[]).length,6);
  assert.match(html,/survivor-frame\.png/);
  assert.match(html,/last-explorer-badge\.png/);
  assert.match(html,/the-pathfinder\.png/);
  assert.doesNotMatch(html,/>The Pathfinder</);
  const effectOnly={...equipped,owned:owned.filter(item=>item.category==='effects')};
  applyRewardTheme(root,effectOnly);
  assert.deepEqual([...root.classList],['vocab-real-effect--golden-sunrays']);
  applyRewardTheme(root,{...shop,owned,rewards:[]});
  assert.deepEqual([...root.classList],[]);
  assert.equal(studentIdentityView(shop).effectArt,null);
});


test('shop rerenders apply verified Afterlight equipment to the app root',()=>{
  const owned=[{reward_id:'afterlight',category:'themes',equipped:true}];
  const root={innerHTML:'',classList:new Set(),querySelector:()=>null};
  root.classList.remove=(...classes)=>classes.forEach(name=>root.classList.delete(name));
  renderProductionShop(root,{...shop,owned},{category:'themes'});
  assert.ok(root.classList.has('vocab-real-theme--afterlight'));
  assert.match(root.innerHTML,/data-equipped-theme="afterlight"/);
  renderProductionShop(root,{...shop,owned:[]},{category:'themes'});
  assert.ok(!root.classList.has('vocab-real-theme--afterlight'));
  const sandbox={...shop,shopMode:'sandbox',sandboxEnabled:true,owned};
  renderSandboxShop(root,sandbox,{category:'themes'});
  assert.ok(root.classList.has('vocab-real-theme--afterlight'));
});

test('Afterlight shop styling uses its backdrop and hides duplicate banner',()=>{
  const css=read('vocabulary-premium-afterlight.css').toString();
  assert.ok(css.includes('.vocab-shop-redesign[data-equipped-theme="afterlight"]'));
  assert.ok(css.includes('url("assets/vocabulary/rewards/afterlight.png")'));
  assert.ok(css.includes('.vocab-shop-hero__scene{'));
  assert.ok(css.includes('display:none!important'));
});

test('every animated reward preview omits caption while preserving controls and motion',()=>{
  const previewCss=read('vocabulary-effect-shop-previews.css').toString();
  const effectsCss=read('vocabulary-effects-animated.css').toString();
  assert.doesNotMatch(previewCss,/vocab-effect-preview__caption/);
  assert.match(effectsCss,/vocab-sunrays-visible-beams/);
  assert.ok(effectsCss.includes('@media(prefers-reduced-motion:reduce)'));
  const effects=['forest-fireflies','ocean-bubbles','sakura-petals','midnight-starlight',
    'rainbow-aura','sparkle','stardust-trail','electric-pulse','golden-sunrays'];
  for(const reward_id of effects){
    const root={innerHTML:'',classList:new Set(),querySelector:()=>null};
    root.classList.remove=(...names)=>names.forEach(name=>root.classList.delete(name));
    renderProductionShop(root,{...shop,rewards:[{reward_id,category:'effects',xp_price:1000,name:reward_id,description:'Effect'}]},{category:'effects'});
    assert.match(root.innerHTML,/data-action="real-preview-effect"/);
    assert.match(root.innerHTML,/vocab-effect-demo-stage/);
    assert.doesNotMatch(root.innerHTML,/Live avatar effect|Reduced-motion preview|vocab-effect-preview__caption/);
  }
});


test('all nine previews show original effect art without a YOU placeholder or faded overlay',()=>{
  const effects=['forest-fireflies','ocean-bubbles','sakura-petals','midnight-starlight',
    'rainbow-aura','sparkle','stardust-trail','electric-pulse','golden-sunrays'];
  for(const reward_id of effects){
    const root={innerHTML:'',classList:new Set(),querySelector:()=>null};
    root.classList.remove=(...names)=>names.forEach(name=>root.classList.delete(name));
    renderProductionShop(root,{...shop,rewards:[{reward_id,category:'effects',xp_price:1000,name:reward_id,description:'Effect'}]},{category:'effects'});
    const previewStart=root.innerHTML.indexOf('<div class="vocab-effect-demo-stage"');
    const previewEnd=root.innerHTML.indexOf('<button type="button" class="vocab-effect-demo-toggle"',previewStart);
    assert.ok(previewStart>=0&&previewEnd>previewStart,'Missing preview for '+reward_id);
    const preview=root.innerHTML.slice(previewStart,previewEnd);
    assert.doesNotMatch(preview,/>YOU<|vocab-student-identity__initials/);
    assert.ok(preview.includes('src="assets/vocabulary/rewards/'+reward_id+'.png"'));

  }
  const css=read('vocabulary-effect-shop-previews.css').toString();
  assert.ok(css.includes('opacity:1!important'));
  assert.ok(css.includes('background:#17202c!important'));
  assert.ok(css.includes('background:transparent!important'));
});

test('Rainbow Aura has genuine artwork/ring animation in preview and equipped mini identity',()=>{
  const css=read('vocabulary-effect-shop-previews.css').toString();
  const equipped=read('vocabulary-effects-animated.css').toString();
  for(const name of ['vocab-rainbow-preview-art','vocab-rainbow-preview-ring'])
    assert.ok(css.includes('@keyframes '+name));
  for(const name of ['vocab-rainbow-equipped-art','vocab-rainbow-equipped-ring'])
    assert.ok(equipped.includes('@keyframes '+name));
  assert.ok(equipped.includes('.vocab-student-identity__avatar[data-cosmetic-effect="rainbow-aura"] > .vocab-student-identity__effect'));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(equipped.includes('prefers-reduced-motion:reduce'));
});


test('shop counter art and live XP stay separate for both real and sandbox shops',()=>{
  const png=read('assets/vocabulary/rewards/shop-stall-scene.png');
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  const owned=[{reward_id:'afterlight',category:'themes',equipped:true}];
  for(const production of [true,false]){
    const root={innerHTML:'',classList:new Set(),querySelector:()=>null};
    root.classList.remove=(...classes)=>classes.forEach(name=>root.classList.delete(name));
    const data={...shop,shopMode:production?'production':'sandbox',sandboxEnabled:!production,
      wallet:{available:5724},owned};
    (production?renderProductionShop:renderSandboxShop)(root,data,{category:'themes'});
    assert.ok(root.innerHTML.includes('assets/vocabulary/rewards/shop-stall-scene.png'));
    assert.equal(root.innerHTML.split('vocab-shop-hero__counter').length-1,1);
    assert.ok(root.innerHTML.includes('5,724 XP'));
    assert.ok(root.innerHTML.includes('vocab-shop-hero__backdrop'));
    const x=root.innerHTML.indexOf('class="vocab-shop-hero__display"');
    assert.ok(root.innerHTML.indexOf('class="vocab-shop-hero__counter"',x) < root.innerHTML.indexOf('class="vocab-shop-hero__balance"',x));
    assert.ok(!root.innerHTML.includes('STUDENT REWARDS'));
    assert.ok(root.innerHTML.includes('Earn it. Spend it. Make it yours.'));
  }
});


test('shop banner uses one narrow centered content group rather than edge-separated hero cells',()=>{
  const css=read('vocabulary-shop-header-premium.css').toString();
  const html=read('vocabulary.html').toString();
  assert.ok(html.includes('vocabulary-shop-header-premium.css?v=hires-stall-wallet-v2'));
  assert.ok(css.includes('grid-template-columns:minmax(0,660px) minmax(350px,520px)'));
  assert.ok(css.includes('justify-content:center!important'));
  assert.ok(css.includes('grid-template-areas:"intro display"'));
  assert.ok(css.includes('grid-template-areas:"wallet" "stall"'));
  assert.ok(!css.includes('top:1.5%'));
  assert.ok(css.includes('grid-template-areas:"intro" "display"'));
  assert.ok(css.includes('max-width:1040px'));
  assert.ok(css.includes('max-width:640px'));
  assert.ok(!css.includes('grid-template-areas:"top balance" "intro balance"'));
  assert.ok(!css.includes('grid-template-areas:"intro balance" "intro counter"'));
});
