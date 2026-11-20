import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {applyRewardTheme} from '../src/vocabulary/rewards-equipped-home.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const ids=['forest','ocean','sakura','midnight','neon-district'];
test('all five equipped themes paint their own actual PNG on the shop container',()=>{
 const css=read('vocabulary-immersive-shop-backgrounds.css');
 const html=read('vocabulary.html');
 for(const id of ids){
  assert.match(css,new RegExp('vocab-real-theme--'+id+'\\s*\\{'));
  assert.ok(css.includes('assets/vocabulary/rewards/'+(id==='neon-district'?'neon-district':id+'-immersive')+'.png'));
  const filename=id==='neon-district'?'neon-district':id+'-immersive';
  const bytes=readFileSync(new URL('../assets/vocabulary/rewards/'+filename+'.png',import.meta.url));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 }
 assert.match(css,/\.vocab-shop-redesign\s*\{[^}]*background-image:/);
 assert.match(css,/background-position:center,center!important;/);
 assert.match(css,/background-attachment:fixed,fixed!important;/);
 assert.match(html,/vocabulary-immersive-shop-backgrounds\.css\?v=shop-scene-v1/);
 assert.ok(html.indexOf('vocabulary-immersive-shop-backgrounds.css')>html.indexOf('vocabulary-legacy-immersive.css'));
 assert.ok(html.indexOf('vocabulary-immersive-shop-backgrounds.css')>html.indexOf('vocabulary-premium-neon-district.css'));
});
test('theme switch and Default clear previous wallpaper-bearing root class',()=>{
 const state=new Set();
 const root={classList:{add:x=>state.add(x),remove:(...xs)=>xs.forEach(x=>state.delete(x))}};
 for(const id of ids){
  const reward={reward_id:id,category:'themes',name:id};
  applyRewardTheme(root,{shopMode:'production',rewards:[reward],owned:[{reward_id:id,category:'themes',equipped:true}]});
  assert.ok(state.has('vocab-real-theme--'+id));
  applyRewardTheme(root,{shopMode:'production',rewards:[reward],owned:[]});
  assert.ok(ids.every(id=>!state.has('vocab-real-theme--'+id)));
 }
});
test('shop remains accessible: light cards and print/high-contrast fallbacks',()=>{
 const css=read('vocabulary-immersive-shop-backgrounds.css');
 const shop=read('vocabulary-rewards.css');
 assert.match(css,/@media print,\(forced-colors:active\)/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(shop,/\.vocab-reward-card\{[^}]*background:#fff/);
 assert.doesNotMatch(css,/\.vocab-shop-card\s*\{[^}]*background/);
});
