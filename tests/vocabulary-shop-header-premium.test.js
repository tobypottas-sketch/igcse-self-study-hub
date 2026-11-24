import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
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
    assert.equal((html.match(/class="vocab-shop-hero__counter"/g)||[]).length,1);
    assert.equal((html.match(/class="vocab-shop-hero__display"/g)||[]).length,1);
    const display=html.slice(html.indexOf('class="vocab-shop-hero__display"'));
    assert.ok(display.indexOf('class="vocab-shop-hero__counter"') < display.indexOf('class="vocab-shop-hero__balance"'));
    assert.match(display,/vocab-shop-hero__backdrop/);
    assert.match(html,/assets\/vocabulary\/rewards\/shop-stall-scene\.png/);
    assert.doesNotMatch(html,/STUDENT REWARDS/);
    assert.match(html,/<h1>XP REWARDS <span>SHOP<\/span><\/h1>/);
    assert.match(html,/Earn it\. Spend it\. Make it yours\./);
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
  assert.match(html,/vocabulary-shop-header-premium\.css\?v=large-cosmetics-v3/);
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


test('approved shop counter is a valid transparent PNG and CSS keeps it theme independent',()=>{
  const png=readFileSync(new URL('../assets/vocabulary/rewards/shop-counter.png',import.meta.url));
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16),320);
  assert.equal(png.readUInt32BE(20),240);
  assert.equal(png[25],3); // indexed-colour, transparent tRNS chunk
  assert.ok(png.includes(Buffer.from('tRNS')));
  const blobHash=createHash('sha1').update('blob '+png.length).update(Buffer.from([0])).update(png).digest('hex');
  assert.equal(blobHash,'096218380b2ef6129b88e0ce59b6a963bf43f26d');
  const css=read('vocabulary-shop-header-premium.css');
  assert.ok(css.includes('.vocab-shop-hero__counter'));
  assert.ok(css.includes('grid-template-areas:"intro display"'));
  assert.ok(css.includes('grid-template-columns:minmax(0,660px) minmax(350px,520px)'));
  assert.ok(css.includes('justify-content:center!important'));
  assert.ok(!css.includes('/* A single, balanced hero composition.'));
  assert.ok(css.includes('grid-template-areas:"intro" "display"'));
  assert.ok(css.includes('min-height:0!important'));
  assert.ok(css.includes('.vocab-shop-hero__display .vocab-shop-hero__balance'));
  assert.ok(css.includes('.vocab-shop-hero__backdrop'));
  assert.ok(css.includes('grid-template-areas:"wallet" "stall"'));
  assert.ok(css.includes('gap:12px'));
  assert.ok(css.includes('position:relative!important'));
  assert.ok(css.includes('top:auto!important'));
  assert.ok(css.includes('right:auto!important'));
  assert.ok(!css.includes('top:1.5%'));
  assert.ok(css.includes('aspect-ratio:auto'));
  assert.ok(css.includes('[data-equipped-theme="afterlight"] > .vocab-shop-hero'));
  assert.ok(css.includes('max-width:640px'));
});


test('the new stall scene is a valid transparent PNG independent of the previous kiosk',()=>{
  const png=readFileSync(new URL('../assets/vocabulary/rewards/shop-stall-scene.png',import.meta.url));
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16),1448);
  assert.equal(png.readUInt32BE(20),1086);
  assert.equal(png[25],6); // PNG RGBA: includes transparency
  const hash=createHash('sha1').update('blob '+png.length).update(Buffer.from([0])).update(png).digest('hex');
  assert.equal(hash,'12255592e18a2161190ec43f626d45ae0ab4f8c4');
  assert.equal(createHash('sha256').update(png).digest('hex'),'ecf285eb2a116b5fad1cb3dd97eae7eb5c10c70d44391fbeebc611828e353609');
});

test('shop identity showcases larger artwork with responsive contained dimensions',()=>{
 const css=read('vocabulary-shop-header-premium.css');
 const rules=css.slice(css.indexOf('/* Large shop-only cosmetic showcase.'));
 assert.match(rules,/--shop-avatar-size:108px/);
 assert.match(rules,/--shop-badge-size:66px/);
 assert.match(rules,/--shop-title-width:285px/);
 assert.match(rules,/--shop-title-height:108px/);
 assert.match(rules,/width:var\(--shop-avatar-size\)!important/);
 assert.match(rules,/width:var\(--shop-badge-size\)!important/);
 assert.match(rules,/width:var\(--shop-title-width\)!important/);
 assert.match(rules,/object-fit:contain!important/);
 assert.match(rules,/@media\(max-width:520px\)/);
 assert.match(rules,/--shop-avatar-size:82px/);
 assert.match(rules,/--shop-title-width:190px/);
});
