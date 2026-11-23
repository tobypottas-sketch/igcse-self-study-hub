import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ORIGINAL_ANIMATED_EFFECTS} from '../src/vocabulary/rewards-premium-registry.js';
import {rewardArtworkPath} from '../src/vocabulary/rewards-art.js';
import {equippedCosmetics,studentIdentityView,renderIdentityShowcase,applyRewardTheme} from '../src/vocabulary/rewards-equipped-home.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ids=['forest-fireflies','ocean-bubbles','sakura-petals','midnight-starlight','rainbow-aura'];
const expected=[900,900,1000,1000,1600];
const catalog=ORIGINAL_ANIMATED_EFFECTS.map(([reward_id,name,xp_price])=>({reward_id,category:'effects',name,xp_price}));

test('all five effects have correct names, prices and PNG art without duplicating reward IDs',()=>{
 assert.deepEqual(ORIGINAL_ANIMATED_EFFECTS.map(x=>x[0]),ids);
 assert.deepEqual(ORIGINAL_ANIMATED_EFFECTS.map(x=>x[2]),expected);
 assert.equal(new Set(ids).size,5);
 for(const id of ids)assert.equal(rewardArtworkPath(id),'assets/vocabulary/rewards/'+id+'.png');
});
test('five original transparent PNG assets are committed to the branch',()=>{
 for(const id of ids){
  const data=readFileSync(new URL('../assets/vocabulary/rewards/'+id+'.png',import.meta.url));
  assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a',id);
  assert.ok(data.readUInt32BE(16)>=800,'width '+id);
  assert.ok(data.readUInt32BE(20)>=800,'height '+id);
  assert.ok([4,6].includes(data[25]),'expected alpha-channel PNG: '+id);
 }
});
test('effects are five independent live avatar treatments, including compact header',()=>{
 for(const id of ids){
  const shop={shopMode:'production',rewards:catalog,owned:[{reward_id:id,category:'effects',equipped:true}]};
  const identity=studentIdentityView(shop,'Test Student');
  assert.equal(identity.active.effects,id);
  assert.equal(identity.active.themes,undefined);
  assert.equal(identity.active.badges,undefined);
  assert.equal(identity.animatedEffect,id);
  assert.equal(identity.effectArt,'assets/vocabulary/rewards/'+id+'.png');
  const html=renderIdentityShowcase(shop,'Test Student');
  assert.ok(html.includes('data-cosmetic-effect="'+id+'"'));
  assert.equal((html.match(/class="vocab-cosmetic-particle vocab-cosmetic-particle--/g)||[]).length,6);
  assert.ok(html.includes('vocab-student-identity__effect'));
  assert.ok(html.includes(catalog.find(r=>r.reward_id===id).name+' equipped'));
  const classes=new Set(['vocab-real-theme--forest','learning-progress']);
  const root={classList:{add:(...xs)=>xs.forEach(x=>classes.add(x)),remove:(...xs)=>xs.forEach(x=>classes.delete(x))}};
  applyRewardTheme(root,shop);
  assert.ok(classes.has('vocab-real-effect--'+id));
  assert.ok(!classes.has('vocab-real-theme--forest'));
  assert.ok(classes.has('learning-progress'));
  applyRewardTheme(root,{...shop,owned:[]});
  assert.ok(!classes.has('vocab-real-effect--'+id));
 }
});
test('effect can coexist with a different theme, frame, badge and title',()=>{
 const extras=[
  {reward_id:'forest',category:'themes',name:'Forest Theme'},
  {reward_id:'gold-frame',category:'frames',name:'Golden Frame'},
  {reward_id:'pixel-badge',category:'badges',name:'Pixel Badge'},
  {reward_id:'word-explorer',category:'titles',name:'Word Explorer'}
 ];
 const shop={shopMode:'production',rewards:[...catalog,...extras],owned:[
  ...extras.map(({reward_id,category})=>({reward_id,category,equipped:true})),
  {reward_id:'ocean-bubbles',category:'effects',equipped:true}
 ]};
 const id=studentIdentityView(shop,'Test Student');
 assert.equal(Object.keys(equippedCosmetics(shop)).length,5);
 assert.match(id.badge,/pixel-badge\.png$/);
 assert.match(id.frame,/gold-frame-overlay\.png$/);
 assert.equal(id.active.themes,'forest');
 assert.equal(id.active.effects,'ocean-bubbles');
 const markup=renderIdentityShowcase(shop,'Test Student');
 assert.match(markup,/pixel-badge\.png/);
 assert.match(markup,/ocean-bubbles\.png/);
 assert.match(markup,/word-explorer\.png/);
});
test('CSS creates distinct lightweight motion for each effect and respects reduced motion',()=>{
 const css=read('vocabulary-effects-animated.css');
 for(const id of ids){
  assert.ok(css.includes('data-cosmetic-effect="'+id+'"'),id+' must have custom particles');
  assert.ok(!css.includes('vocab-real-theme--'),'effect particles must not override purchased theme colours');
 }
 for(const animation of ['vocab-firefly-drift','vocab-ocean-rise','vocab-sakura-fall','vocab-midnight-twinkle','vocab-rainbow-shimmer'])
  assert.ok(css.includes('@keyframes '+animation));
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/animation:none!important/);
 assert.match(css,/@media print,\(forced-colors:active\)/);
 assert.doesNotMatch(css,/\.vocab-answer--correct|\.vocab-answer--wrong|\.vocab-feedback--incorrect/);
 assert.doesNotMatch(css,/canvas|requestAnimationFrame|setInterval/);
});
test('catalogue staging is disabled, server-priced and does not mutate XP or ownership',()=>{
 const sql=read('supabase/sql/five-animated-effects-catalog-staged.sql');
 for(const [id,name,price] of ORIGINAL_ANIMATED_EFFECTS){
  assert.ok(sql.includes("'"+id+"','"+name+"','effects',"+price),id);
 }
 assert.equal((sql.match(/false\)/g)||[]).length,5);
 assert.doesNotMatch(sql,/update\s+public\.vocabulary_reward_wallets|delete\s+from|truncate\s+/i);
});
test('browser loads animation CSS and refreshed equipped renderer',()=>{
 const html=read('vocabulary.html'),app=read('src/vocabulary/app.js'),router=read('src/vocabulary/router.js');
 assert.match(html,/vocabulary-effects-animated\.css\?v=rainbow-full-colour-motion-v1/);
 assert.match(html,/router\.js\?v=battles-mvp-v1/);
 assert.match(app,/rewards-equipped-home\.js\?v=battles-mvp-v1/);
 assert.match(router,/app\.js\?v=battles-mvp-v1/);
});
