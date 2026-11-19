import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('real and sandbox shops render actionable Buy/Equip buttons and disabled Equipped state',()=>{
 const rewards=[
  {reward_id:'neon-district',category:'themes',name:'Neon District',xp_price:2500,icon:'🌃',description:''},
  {reward_id:'gold-frame',category:'frames',name:'Gold Frame',xp_price:1200,icon:'🖼️',description:''},
  {reward_id:'word-wizard',category:'titles',name:'Word Wizard',xp_price:1000,icon:'🏆',description:''}
 ];
 const owned=[{reward_id:'gold-frame',category:'frames',equipped:false},{reward_id:'word-wizard',category:'titles',equipped:true}];
 for(const [render,production] of [[renderSandboxShop,false],[renderProductionShop,true]]){
  const root={innerHTML:''};
  const shop={shopMode:production?'production':'sandbox',purchasesEnabled:true,walletStatus:'ready',sandboxEnabled:true,wallet:{available:10000},rewards,owned};
  render(root,shop);
  assert.match(root.innerHTML,/>Buy<\/button>/);
  assert.match(root.innerHTML,/>Equip<\/button>/);
  assert.match(root.innerHTML,/disabled[^>]*class="is-owned">Equipped<\/button>/);
 }
});

test('shop button hover and keyboard focus have high-contrast foreground on coloured surfaces',()=>{
 const css=read('vocabulary-rewards.css');
 const html=read('vocabulary.html');
 const owner='#vocabularyApp .vocab-shop-redesign .vocab-shop-card .vocab-reward-card__bottom button:not(:disabled):not([aria-disabled="true"])';
 assert.ok(css.includes(owner));
 assert.match(css,/\@media\(hover:hover\) and \(pointer:fine\)/);
 for(const suffix of ['',':hover',':is(:active,:focus-visible)']){
  const i=css.lastIndexOf(owner+suffix+'{');
  assert.ok(i>=0,'Missing button state '+suffix);
  const rule=css.slice(i,css.indexOf('}',i));
  assert.match(rule,/color:#fff!important;/);
  assert.match(rule,/background:#[0-9a-f]{6}!important;/);
 }
 assert.match(css,/button\.is-owned:disabled\s*\{[^}]*color:#176c53!important;/);
 assert.match(html,/vocabulary-rewards\.css\?v=reward-hover-contrast-v2/);
});
