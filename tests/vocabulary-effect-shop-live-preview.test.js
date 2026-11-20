import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';
import {renderEffectPreviewAvatar,PREVIEWABLE_EFFECTS} from '../src/vocabulary/rewards-equipped-home.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const names={
 sparkle:'Sparkle Effect',
 'electric-pulse':'Electric Pulse',
 'stardust-trail':'Stardust Trail',
 'forest-fireflies':'Forest Fireflies',
 'ocean-bubbles':'Ocean Bubbles',
 'sakura-petals':'Falling Sakura Petals',
 'midnight-starlight':'Midnight Starlight',
 'rainbow-aura':'Rainbow Aura'
};
const rewards=Object.entries(names).map(([reward_id,name],i)=>({reward_id,name,category:'effects',xp_price:900+i*100,description:'Effect preview',icon:'✨'}));
const sandbox={sandboxEnabled:true,shopMode:'sandbox',wallet:{available:10000},rewards,owned:[]};
const prod={...sandbox,sandboxEnabled:false,shopMode:'production',purchasesEnabled:true,walletStatus:'ready'};
test('every known active effect offers a real sample avatar trial in both shops',()=>{
 assert.deepEqual([...PREVIEWABLE_EFFECTS],Object.keys(names));
 for(const [shop,render] of [[sandbox,renderSandboxShop],[prod,renderProductionShop]]){
  const root={innerHTML:''};
  render(root,shop,{category:'effects',studentName:'TEST STUDENT'});
  assert.equal((root.innerHTML.match(/data-action="preview-effect"/g)||[]).length,8);
  assert.equal((root.innerHTML.match(/class="vocab-effect-demo-stage" hidden/g)||[]).length,8);
  assert.equal((root.innerHTML.match(/data-preview-effect="/g)||[]).length,8);
  for(const id of PREVIEWABLE_EFFECTS){
   assert.ok(root.innerHTML.includes('data-preview-effect="'+id+'"'),id);
   assert.match(root.innerHTML,new RegExp('data-reward-id="'+id+'"'));
  }
  assert.match(root.innerHTML,/Try live effect/);
  assert.match(root.innerHTML,/aria-pressed="false"/);
 }
});
test('preview renderer reuses equipped effect artwork and six-particle structure',()=>{
 for(const id of PREVIEWABLE_EFFECTS){
  const html=renderEffectPreviewAvatar(id);
  assert.match(html,/vocab-student-identity__avatar/);
  assert.match(html,/src="assets\/vocabulary\/rewards\/[a-z-]+\.png"/);
  assert.match(html,/Live avatar preview/);
  if(!['sparkle','electric-pulse','stardust-trail'].includes(id)){
   assert.equal((html.match(/vocab-cosmetic-particle--[1-6]/g)||[]).length,6);
   assert.match(html,/has-animated-effect/);
  }
  assert.ok(!html.includes('data-action="sandbox-buy"'));
  assert.ok(!html.includes('data-action="real-buy"'));
  assert.ok(!html.includes('<script'));
 }
 assert.equal(renderEffectPreviewAvatar('pixel-badge'),'');
 assert.equal(renderEffectPreviewAvatar('unknown'), '');
});
test('preview controls are not advertised on non-effect products',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,{...sandbox,rewards:[
  ...rewards,{reward_id:'gold-frame',category:'frames',name:'Golden Frame',xp_price:800,description:'A frame'}
 ]},{category:'frames'});
 assert.doesNotMatch(root.innerHTML,/preview-effect|vocab-effect-demo-stage/);
});
test('preview interaction is a local DOM toggle, not a purchase or equip action',()=>{
 const app=read('src/vocabulary/app.js');
 const begin=app.indexOf('function toggleLiveEffectCardPreview(button){');
 const end=app.indexOf("root?.addEventListener('click', event => {",begin);
 assert.ok(begin>0&&end>begin,'Missing isolated preview function');
 const fn=app.slice(begin,end);
 assert.match(fn,/\.vocab-effect-demo-stage/);
 assert.match(fn,/\.is-previewing/);
 assert.match(fn,/aria-pressed/);
 assert.match(fn,/\.hidden=/);
 assert.doesNotMatch(fn,/fetch\(|invoke\(|rpc\(|wallet|owned|spent_xp|applyRealReward|applySandboxReward|equip_vocabulary|buy-reward/);
 assert.match(app,/action === 'preview-effect'/);
 assert.doesNotMatch(fn,/window\.setInterval|requestAnimationFrame|new MutationObserver/);
});
test('live card styles use actual effect keyframes with reduced-motion fallback',()=>{
 const css=read('vocabulary-effect-shop-previews.css');
 const effects=read('vocabulary-effects-animated.css');
 const html=read('vocabulary.html');
 assert.match(css,/vocab-effect-demo-toggle/);
 assert.match(css,/vocab-effect-demo-stage\[hidden\]/);
 assert.match(css,/data-preview-effect="electric-pulse"/);
 assert.match(css,/data-preview-effect="sparkle"/);
 assert.match(css,/data-preview-effect="stardust-trail"/);
 assert.match(css,/animation:vocab-electric-pulse-art/);
 assert.match(css,/animation:vocab-stardust-trail-flow/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/animation:none!important/);
 assert.match(effects,/data-cosmetic-effect="rainbow-aura"/);
 assert.match(effects,/data-cosmetic-effect="forest-fireflies"/);
 assert.match(html,/vocabulary-effect-shop-previews\.css\?v=live-effect-previews-v1/);
 assert.doesNotMatch(css,/\.vocab-answer--wrong|\.vocab-answer--correct/);
});
