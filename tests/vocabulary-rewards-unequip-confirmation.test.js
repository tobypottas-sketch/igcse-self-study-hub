import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {persistUnequippedReward} from '../src/vocabulary/rewards-unequip-flow.js';
const owned=[{reward_id:'forest',category:'themes',equipped:false},{reward_id:'gold-frame',category:'frames',equipped:true},{reward_id:'word-explorer',category:'titles',equipped:true},{reward_id:'sparkle',category:'effects',equipped:true}];
const sandbox=()=>({ok:true,shopMode:'sandbox',sandboxEnabled:true,owned:owned.map(x=>({...x})),wallet:{available:90000}});
test('sends unequip immediately and verifies fresh server status, preserving all other cosmetics',async()=>{
 const calls=[];
 const result=await persistUnequippedReward({category:'themes',invoke:async(name,args)=>{calls.push([name,args.body]);return {data:sandbox()}}});
 assert.deepEqual(calls,[['vocabulary-reward-sandbox',{action:'unequip',category:'themes'}],['vocabulary-reward-sandbox',{action:'status'}]]);
 assert.equal(result.owned.find(x=>x.reward_id==='forest').equipped,false);
 assert.deepEqual(result.owned.filter(x=>x.equipped).map(x=>x.reward_id),['gold-frame','word-explorer','sparkle']);
 assert.equal(result.wallet.available,90000);
});
test('real shop request stays completely separate from sandbox',async()=>{
 const calls=[];const real={...sandbox(),shopMode:'production',purchasesEnabled:true};
 await persistUnequippedReward({category:'effects',production:true,invoke:async(name,args)=>{
  calls.push([name,args.body.action]);return {data:{...real,owned:real.owned.map(x=>x.category==='effects'?{...x,equipped:false}:x)}};
 }});
 assert.deepEqual(calls,[['vocabulary-reward-production','unequip'],['vocabulary-reward-production','status']]);
});
test('stale response showing Forest as equipped is rejected instead of claiming success',async()=>{
 await assert.rejects(()=>persistUnequippedReward({category:'themes',invoke:async()=>({data:{...sandbox(),owned:owned.map(x=>x.category==='themes'?{...x,equipped:true}:x)}})}),/still marked as equipped/);
});
test('status readback catches a failed save even after optimistic response',async()=>{
 let n=0;await assert.rejects(()=>persistUnequippedReward({category:'themes',invoke:async()=>{
  n++;return {data:n===1?sandbox():{...sandbox(),owned:owned.map(x=>x.category==='themes'?{...x,equipped:true}:x)}};
 }}),/still equipped on the server/);
});
test('rejects invalid category, wrong inventory and auth errors',async()=>{
 await assert.rejects(()=>persistUnequippedReward({category:'accounts',invoke:async()=>({data:sandbox()})}),/Invalid reward category/);
 await assert.rejects(()=>persistUnequippedReward({category:'themes',invoke:async()=>({error:new Error('offline')})}),/Unable to remove equipped reward/);
 await assert.rejects(()=>persistUnequippedReward({category:'themes',invoke:async()=>({data:{...sandbox(),shopMode:'production'}})}),/wrong reward inventory/);
});
test('UI does not redraw before the request, leaves removal errors visible and locks clicked control',()=>{
 const app=fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
 const start=app.indexOf('async function removeEquippedReward(');
 const end=app.indexOf('async function revealRealShopEntry()',start);
 const section=app.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.match(section,/clickedButton\.disabled=true/);
 assert.match(section,/persistUnequippedReward/);
 assert.match(section,/await updateSandboxCosmetics\(data\)/);
 assert.match(section,/await renderCurrentSandboxShop\(message,false\)/);
 assert.doesNotMatch(section,/renderCurrentSandboxShop\('Removing equipped reward/);
 assert.match(app,/removeEquippedReward\(target\.dataset\.category,false,target\)/);
});
