import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderProductionShop,renderSandboxShop} from '../src/vocabulary/rewards-sandbox-view.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const reward={reward_id:'afterlight',category:'themes',name:'Afterlight Theme',xp_price:2200,description:'Theme'};
const base={
  shopMode:'production',purchasesEnabled:true,walletStatus:'ready',
  wallet:{available:1076450},rewards:[reward],owned:[{reward_id:'afterlight',category:'themes',equipped:true}]
};
const root=()=>({innerHTML:'',classList:Object.assign(new Set(),{
  remove(...values){for(const value of values)this.delete(value);}
}),querySelector:()=>null});

test('production and sandbox shops expose one accessible heading and one verified XP module',()=>{
  for(const production of [true,false]){
    const node=root();
    const shop=production?base:{...base,shopMode:'sandbox',sandboxEnabled:true};
    (production?renderProductionShop:renderSandboxShop)(node,shop,{studentName:'Test Student'});
    const html=node.innerHTML;
    assert.equal((html.match(/<h1>/g)||[]).length,1);
    assert.equal((html.match(/class="vocab-shop-hero__balance"/g)||[]).length,1);
    assert.equal((html.match(/class="vocab-shop-hero__scene"/g)||[]).length,0);
    assert.match(html,/<h1>XP REWARDS <span>SHOP<\/span><\/h1>/);
    assert.match(html,/Earn XP\. Unlock rewards\. Make your learning space yours\./);
    assert.match(html,/1,076,450 XP/);
    assert.match(html,/data-action="back-(real|sandbox)-home"/);
    assert.match(html,/data-equipped-theme="afterlight"/);
    assert.ok(node.classList.has('vocab-real-theme--afterlight'));
    assert.match(html,production?/Spendable balance/:/Sandbox available/);
    assert.match(html,production?/REAL XP REWARDS/:/TEST XP ONLY/);
  }
});

test('shop header has paired, accessible theme palettes and responsive breakpoints',()=>{
  const css=read('vocabulary-shop-header-premium.css');
  const html=read('vocabulary.html');
  assert.match(html,/vocabulary-shop-header-premium\.css\?v=theme-shop-header-v1/);
  const palettes={
    default:['#142e43','#f5fbff','#76e8dc'],
    forest:['#102e27','#f5ffe9','#d0f49a'],
    ocean:['#092645','#f2fbff','#8bf2ff'],
    sakura:['#492348','#fff7fb','#ffd0e9'],
    midnight:['#121c47','#f6f8ff','#cad5ff'],
    'neon-district':['#101a35','#f3faff','#79ecfa'],
    'celestial-realms':['#1a204f','#fff9ff','#ffe4ab'],
    afterlight:['#1a2422','#fff4df','#ffd28a'],
    blockverse:['#21303b','#f7fff8','#8af1ff'],
    dreamwave:['#2c224e','#fff7ff','#ffc9f7']
  };
  const luminance=hex=>{
    const c=hex.replace('#','').match(/../g).map(v=>parseInt(v,16)/255)
      .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
    return c[0]*.2126+c[1]*.7152+c[2]*.0722;
  };
  const contrast=(a,b)=>{
    const [light,dark]=[luminance(a),luminance(b)].sort((x,y)=>y-x);
    return (light+.05)/(dark+.05);
  };
  for(const [name,[background,foreground,accent]] of Object.entries(palettes)){
    const selector=name==='default'?'#vocabularyApp .vocab-shop-redesign{':
      '#vocabularyApp .vocab-shop-redesign[data-equipped-theme="'+name+'"]{';
    assert.ok(css.includes(selector),'Missing '+name+' semantic palette');
    assert.ok(contrast(background,foreground)>=4.5,name+' heading contrast below WCAG AA');
    assert.ok(contrast(background,accent)>=3,name+' accent contrast below WCAG large-text');
  }
  assert.match(css,/@media\(max-width:850px\)/);
  assert.match(css,/@media\(max-width:520px\)/);
  assert.match(css,/@media print,\(forced-colors:active\)/);
});
