import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {applyRewardTheme} from '../src/vocabulary/rewards-equipped-home.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ids=['forest','ocean','sakura','midnight'];
const prefixes=['vocab-real-theme--forest','vocab-real-theme--ocean','vocab-real-theme--sakura','vocab-real-theme--midnight'];

test('legacy backgrounds are equipped-theme-specific and sourced from the four HD original scenic PNGs',()=>{
 const css=read('vocabulary-legacy-immersive.css');
 const html=read('vocabulary.html');
 for(const id of ids){
  assert.match(css,new RegExp('body:has\\(#vocabularyApp\\.vocab-real-theme--'+id+'\\)'));
  assert.ok(css.includes('assets/vocabulary/rewards/'+id+'-immersive.png'));
  const image=readFileSync(new URL('../assets/vocabulary/rewards/'+id+'-immersive.png',import.meta.url));
  assert.equal(image.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.ok(image.readUInt32BE(16)>=1600);
  assert.ok(image.readUInt32BE(20)>=900);
 }
 assert.ok(html.indexOf('vocabulary-legacy-immersive.css')>html.indexOf('vocabulary-premium-neon-district.css'));
 assert.match(html,/vocabulary-legacy-immersive\.css\?v=legacy-hd-scenes-v2/);
 assert.match(css,/body:has\(#vocabularyApp:is\(/);
});

test('unit activity wallpapers remain ahead of scenic art and accessibility fallbacks remain',()=>{
 const css=read('vocabulary-legacy-immersive.css');
 assert.match(css,/background-image:var\(--unit-wallpaper\),linear-gradient\(var\(--immersive-wash\)/);
 assert.match(css,/background-size:420px 420px,cover,cover!important;/);
 assert.match(css,/@media print,\(forced-colors:active\)/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.doesNotMatch(css,/[.#]vocab-question-card[^\n]*background:url/i);
});

test('removing an equipped legacy theme leaves no lingering class behind',()=>{
 const state=new Set(['other-root-class']);
 const root={classList:{add:x=>state.add(x),remove:(...xs)=>xs.forEach(x=>state.delete(x))}};
 for(const id of ids){
  const reward={reward_id:id,category:'themes',name:id};
  applyRewardTheme(root,{shopMode:'production',rewards:[reward],owned:[{reward_id:id,category:'themes',equipped:true}]});
  assert.ok(state.has('vocab-real-theme--'+id));
  applyRewardTheme(root,{shopMode:'production',rewards:[reward],owned:[]});
  for(const pref of prefixes)assert.ok(!state.has(pref));
 }
 assert.ok(state.has('other-root-class'));
});

test('Forest immersive home and shop retain high-contrast text and scenic background',()=>{
 const css=read('vocabulary-legacy-immersive.css');
 const html=read('vocabulary.html');
 const forest='#vocabularyApp.vocab-real-theme--forest';
 const hero=forest+' .vocab-shell--home > .vocab-hero--home';
 const shop=forest+' .vocab-shop-redesign';
 for(const [selector,prop] of [
  [forest+' .vocab-topbar .vocab-topbar__course','color:#f1fff6!important;'],
  [hero+' h1','color:#f6fff9!important;'],
  [hero+' h1 span','color:#cbf383!important;'],
  [hero+' .vocab-home-hero__tagline','color:#d7f4e5!important;'],
  [hero+' .vocab-home-hero__welcome','color:#d7f4e5!important;'],
  [hero+' .vocab-home-hero__welcome strong','color:#cbf383!important;'],
  [shop,'background:transparent!important;'],
 ]){
  const at=css.lastIndexOf(selector+'{');
  assert.ok(at>=0,'Missing actual Forest page selector: '+selector);
  const rule=css.slice(at,css.indexOf('}',at));
  assert.ok(rule.includes(prop),'Missing '+prop+' for '+selector);
 }
 assert.match(css,/\.vocab-shop-redesign \.vocab-shop-content,[\\s\\S]*?background:transparent!important;/);
 assert.ok(css.includes('forest-immersive.png'));
 assert.ok(css.includes(shop+' .vocab-shop-card'));
 assert.ok(css.includes(shop+' .vocab-shop-sidebar'));
 assert.ok(css.includes(shop+' .vocab-shop-equipped'));
 assert.match(html,/vocabulary-legacy-immersive\.css\?v=forest-shop-contrast-v3/);
 assert.match(css,/@media print,\(forced-colors:active\)/);
});
