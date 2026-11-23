import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const animatedIds=['sparkle','electric-pulse','stardust-trail','forest-fireflies','ocean-bubbles','sakura-petals','midnight-starlight','rainbow-aura'];
const effects=[...animatedIds,'unanimated-test-effect']
 .map((reward_id,i)=>({reward_id,category:'effects',name:reward_id,xp_price:900+i*100,description:'Decorative avatar effect',icon:'✨'}));
const sandbox={sandboxEnabled:true,shopMode:'sandbox',wallet:{available:10000},rewards:effects,owned:[]};
const production={...sandbox,sandboxEnabled:false,shopMode:'production',purchasesEnabled:true,walletStatus:'ready'};

test('Only effects with shipped animated artwork offer genuine avatar animation demos',()=>{
 for(const [shop,render] of [[sandbox,renderSandboxShop],[production,renderProductionShop]]){
  const root={innerHTML:''};
  render(root,shop,{category:'effects',studentName:'TEST STUDENT'});
  assert.equal((root.innerHTML.match(/class="vocab-reward-picture"/g)||[]).length,effects.length);
  for(const item of effects)assert.ok(root.innerHTML.includes('data-reward-id="'+item.reward_id+'"'));
  for(const id of animatedIds){
   assert.match(root.innerHTML,new RegExp('data-preview-effect="'+id+'"'));
   assert.match(root.innerHTML,new RegExp('data-action="'+(shop.shopMode==='production'?'real':'sandbox')+'-preview-effect" data-reward-id="'+id+'"'));
  }
  assert.doesNotMatch(root.innerHTML,/data-preview-effect="unanimated-test-effect"|data-action="sandbox-preview-effect" data-reward-id="unanimated-test-effect"/);
  assert.doesNotMatch(root.innerHTML,/Try live effect|Show artwork|Live avatar preview/);
  assert.equal((root.innerHTML.match(/data-action="(?:real|sandbox)-buy"/g)||[]).length,effects.length);
 }
});
test('Owning an effect preserves Equip / Equipped, independently of live demo controls',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,{...sandbox,owned:[{reward_id:'electric-pulse',category:'effects',equipped:false}]},{category:'effects'});
 assert.match(root.innerHTML,/data-action="sandbox-equip" data-reward-id="electric-pulse"/);
 assert.match(root.innerHTML,/data-preview-effect="electric-pulse"/);
});
test('Demo markup is limited to motion-capable effects and has a functioning toggle',()=>{
 const view=read('src/vocabulary/rewards-sandbox-view.js');
 const app=read('src/vocabulary/app.js');
 const css=read('vocabulary-effect-shop-previews.css');
 assert.match(view,/const LIVE_EFFECT_IDS=new Set/);
 assert.match(view,/if\(item\?\.category!=='effects'\|\|!LIVE_EFFECT_IDS\.has\(item\.reward_id\)\)return ''/);
 assert.match(view,/rewardArtworkPath\(item\.reward_id\)/);
 assert.match(view,/liveEffectDemo\(item\)/);
 assert.match(app,/action === 'sandbox-preview-effect'/);
 assert.match(app,/stage\.hidden=!opening/);
 assert.match(css,/\.vocab-effect-demo-stage\[hidden\]\{display:none!important\}/);
});
test('Existing equipped animations, real CSS motion and reduced-motion support remain intact',()=>{
 const app=read('src/vocabulary/app.js'),html=read('vocabulary.html');
 const effectsCss=read('vocabulary-effects-animated.css');
 const previewCss=read('vocabulary-effect-shop-previews.css');
 assert.match(effectsCss,/@keyframes vocab-electric-pulse-art/);
 assert.match(effectsCss,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(previewCss,/@keyframes vocab-sparkle-glimmer/);
 assert.match(previewCss,/@keyframes vocab-stardust-trail-flow/);
 assert.match(html,/vocabulary-effect-shop-previews\.css\?v=effects-full-colour-v1/);
 assert.match(html,/router\.js\?v=leaderboard-stable-v1/);
 assert.match(app,/rewards-sandbox-view\.js\?v=blockverse-v1/);
});
