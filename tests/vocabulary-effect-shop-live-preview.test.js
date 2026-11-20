import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const effects=['sparkle','electric-pulse','stardust-trail','forest-fireflies','ocean-bubbles','sakura-petals','midnight-starlight','rainbow-aura']
 .map((reward_id,i)=>({reward_id,category:'effects',name:reward_id,xp_price:900+i*100,description:'Decorative avatar effect',icon:'✨'}));
const sandbox={sandboxEnabled:true,shopMode:'sandbox',wallet:{available:10000},rewards:effects,owned:[]};
const production={...sandbox,sandboxEnabled:false,shopMode:'production',purchasesEnabled:true,walletStatus:'ready'};

test('Effect cards show honest original artwork and normal Buy / Equip actions, not a fake preview',()=>{
 for(const [shop,render] of [[sandbox,renderSandboxShop],[production,renderProductionShop]]){
  const root={innerHTML:''};
  render(root,shop,{category:'effects',studentName:'TEST STUDENT'});
  assert.equal((root.innerHTML.match(/class="vocab-reward-picture"/g)||[]).length,effects.length);
  for(const item of effects)assert.ok(root.innerHTML.includes('data-reward-id="'+item.reward_id+'"'));
  assert.doesNotMatch(root.innerHTML,/Try live effect|Show artwork|Live avatar preview|preview-effect|vocab-effect-demo-stage|data-preview-effect=/);
  assert.equal((root.innerHTML.match(/data-action="(?:real|sandbox)-buy"/g)||[]).length,effects.length);
 }
});
test('Owned effects still show Equip / Equipped independently of removed demo UI',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,{...sandbox,owned:[{reward_id:'electric-pulse',category:'effects',equipped:false}]},{category:'effects'});
 assert.match(root.innerHTML,/data-action="sandbox-equip" data-reward-id="electric-pulse"/);
 assert.doesNotMatch(root.innerHTML,/preview-effect|Try live effect/);
});
test('Shop source has no demo buttons, handlers or sample-avatar mockup',()=>{
 const view=read('src/vocabulary/rewards-sandbox-view.js');
 const app=read('src/vocabulary/app.js');
 const identity=read('src/vocabulary/rewards-equipped-home.js');
 assert.doesNotMatch(view,/PREVIEWABLE_EFFECTS|renderEffectPreviewAvatar|preview-effect|Try live effect|Show artwork/);
 assert.doesNotMatch(app,/toggleLiveEffectCardPreview|preview-effect|Try live effect|Show artwork/);
 assert.doesNotMatch(identity,/renderEffectPreviewAvatar|PREVIEWABLE_EFFECTS/);
 assert.match(view,/rewardIllustration\(item.reward_id,item.icon\)/);
});
test('Existing equipped animations and reduced-motion support remain intact',()=>{
 const app=read('src/vocabulary/app.js'),html=read('vocabulary.html');
 const effectsCss=read('vocabulary-effects-animated.css');
 const addOn=read('vocabulary-effect-shop-previews.css');
 assert.match(effectsCss,/@keyframes vocab-electric-pulse-art/);
 assert.match(effectsCss,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(addOn,/@keyframes vocab-sparkle-glimmer/);
 assert.match(addOn,/@keyframes vocab-stardust-trail-flow/);
 assert.match(html,/vocabulary-effect-shop-previews\.css\?v=live-effect-previews-v1/);
 assert.match(html,/router\.js\?v=static-effect-cards-v2/);
 assert.match(app,/rewards-sandbox-view\.js\?v=static-effect-cards-v2/);
});
