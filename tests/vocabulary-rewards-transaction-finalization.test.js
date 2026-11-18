import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
const themes=fs.readFileSync(new URL('../vocabulary-reward-identity.css',import.meta.url),'utf8');
const functionSource=(begin,end)=>app.slice(app.indexOf(begin),app.indexOf(end,app.indexOf(begin)));

function realHarness({category='themes',failBuy=false,failEquip=false}={}){
 const events=[],renders=[],styles=[];
 const reward={reward_id:'sakura',category,name:'Sakura Theme'};
 const prior={ok:true,shopMode:'production',rewards:[reward],owned:[],wallet:{available:900}};
 const bought={...prior,owned:[{reward_id:'sakura',category,equipped:false}],wallet:{available:0}};
 const equipped={...bought,owned:[{reward_id:'sakura',category,equipped:true}]};
 const state={preview:false,client:{functions:{invoke:async(_name,{body})=>{
  events.push(body);
  if(body.action==='buy'&&failBuy)return {error:new Error('Failed purchase')};
  if(body.action==='equip'&&failEquip)return {error:new Error('Failed equip')};
  return {data:body.action==='buy'?bought:equipped,error:null};
 }}}};
 const src=functionSource('async function applyRealReward(','async function revealRealShopEntry(');
 const make=new Function('state','initialShop','renders','styles','events',src+
   '\nreturn {run:applyRealReward,getBusy:()=>realBusy,getShop:()=>realShop};');
 // Function-local state mirrors app-scoped flags while allowing an assertion on it.
 const wrapper=new Function('state','initialShop','renders','styles','events',
  'let realBusy=false,realShop=initialShop;'+
  "const renderRealShop=async (message,busy)=>renders.push({message,busy});"+
  "const updateLiveCosmetics=async shop=>styles.push(shop.owned.find(x=>x.equipped)?.reward_id??null);"+
  src+'\nreturn {run:applyRealReward,getBusy:()=>realBusy,getShop:()=>realShop};');
 return {...wrapper(state,prior,renders,styles,events),events,renders,styles};
}
function sandboxHarness({fail=false}={}){
 const events=[],renders=[];
 const sandbox={sandboxEnabled:true,rewards:[{reward_id:'word-explorer'}]};
 const src=functionSource('async function applySandboxReward(','// One responsive strip:');
 const state={preview:false,client:{functions:{invoke:async()=>fail?{error:new Error('Unable to buy')}:{data:sandbox}}}};
 const wrapper=new Function('state','initialShop','renders',
  'let sandboxBusy=false,sandboxShop=initialShop;'+
  'const renderCurrentSandboxShop=async(message,busy)=>renders.push({message,busy});'+
  src+'\nreturn {run:applySandboxReward,getBusy:()=>sandboxBusy};');
 return {...wrapper(state,sandbox,renders),renders};
}
test('buying a theme equips it immediately, with no second XP purchase',async()=>{
 const x=realHarness();
 await x.run('buy','sakura');
 assert.deepEqual(x.events.map(x=>x.action),['buy','equip']);
 assert.equal(x.getShop().owned[0].equipped,true);
 assert.deepEqual(x.styles,['sakura']);
 assert.equal(x.renders[0].busy,true);
 assert.equal(x.renders.at(-1).busy,false);
 assert.match(x.renders.at(-1).message,/Theme purchased and equipped/);
 assert.equal(x.getBusy(),false);
});
test('failed theme equip leaves purchase intact and active Equip button',async()=>{
 const x=realHarness({failEquip:true});
 await x.run('buy','sakura');
 assert.equal(x.events.length,2);
 assert.equal(x.getShop().owned[0].equipped,false);
 assert.match(x.renders.at(-1).message,/purchased, but not equipped/);
 assert.equal(x.renders.at(-1).busy,false);
 assert.equal(x.getBusy(),false);
});
test('buying non-theme cosmetics does not silently overwrite equipped items',async()=>{
 const x=realHarness({category:'titles'});
 await x.run('buy','sakura');
 assert.deepEqual(x.events.map(x=>x.action),['buy']);
 assert.equal(x.renders.at(-1).busy,false);
});
test('failed real purchase re-enables all controls for retry',async()=>{
 const x=realHarness({failBuy:true});
 await x.run('buy','sakura');
 assert.equal(x.getBusy(),false);
 assert.equal(x.renders.at(-1).busy,false);
 assert.match(x.renders.at(-1).message,/Reward could not be saved/);
});
test('real equip and sandbox purchase also clear loading state',async()=>{
 const x=realHarness();await x.run('equip','sakura');
 assert.deepEqual(x.events.map(x=>x.action),['equip']);
 assert.equal(x.renders.at(-1).busy,false);
 for(const fail of [false,true]){
  const sandbox=sandboxHarness({fail});
  await sandbox.run('buy','word-explorer');
  assert.equal(sandbox.getBusy(),false);
  assert.equal(sandbox.renders.at(-1).busy,false);
 }
});
test('active Ocean, Forest, Sakura and Midnight palettes extend to real shop',()=>{
 for(const name of ['ocean','forest','sakura','midnight'])
  assert.match(themes,new RegExp('#vocabularyApp\\.vocab-real-theme--'+name));
 assert.match(themes,/vocab-shop-redesign\.vocab-shell--production/);
 assert.match(themes,/background:var\(--reward-accent\)/);
});
