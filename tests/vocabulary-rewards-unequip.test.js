import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';
import {applyRewardTheme} from '../src/vocabulary/rewards-equipped-home.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const rewards=[{reward_id:'forest',name:'Forest',category:'themes',xp_price:250,icon:'🌲',description:''},{reward_id:'gold-frame',name:'Golden Frame',category:'frames',xp_price:100,icon:'🖼️',description:''},{reward_id:'word-explorer',name:'Word Explorer',category:'titles',xp_price:100,icon:'🏆',description:''},{reward_id:'sparkle',name:'Sparkle',category:'effects',xp_price:100,icon:'✨',description:''}];
const owned=rewards.map(r=>({reward_id:r.reward_id,category:r.category,equipped:true}));
const shop={shopMode:'sandbox',sandboxEnabled:true,wallet:{available:1000},rewards,owned};
const render=(fn,input)=>{const root={innerHTML:''};fn(root,input);return root.innerHTML;};
test('equipped sandbox categories have free unequip actions and a default theme choice',()=>{
 const html=render(renderSandboxShop,shop);
 assert.match(html,/data-action="sandbox-unequip" data-category="themes"/);
 assert.match(html,/Use Default Theme/);
 for(const c of ['frames','titles','effects'])assert.match(html,new RegExp('data-action="sandbox-unequip" data-category="'+c+'"'));
});
test('real shop exposes identical controls, never sandbox mutations',()=>{
 const html=render(renderProductionShop,{...shop,shopMode:'production',purchasesEnabled:true,walletStatus:'ready'});
 assert.match(html,/data-action="real-unequip" data-category="themes"/);
 assert.doesNotMatch(html,/data-action="sandbox-unequip"/);
});
test('empty equipment shows default / choose and no unauthorised unequip actions',()=>{
 const html=render(renderSandboxShop,{...shop,owned:owned.map(x=>({...x,equipped:false}))});
 assert.match(html,/Default theme/);
 assert.doesNotMatch(html,/data-action="sandbox-unequip"/);
});
test('removing a theme clears root theme classes while leaving non-theme equipment alone',()=>{
 const state=new Set(['vocab-real-theme--forest','vocab-real-effect--sparkle']);
 const root={classList:{remove:(...x)=>x.forEach(c=>state.delete(c)),add:x=>state.add(x)}};
 applyRewardTheme(root,{...shop,owned:owned.map(x=>x.category==='themes'?{...x,equipped:false}:x)});
 assert.equal(state.has('vocab-real-theme--forest'),false);
 assert.equal(state.has('vocab-real-effect--sparkle'),true);
});
test('both Edge APIs use verified student IDs and strict category allowlist',()=>{
 for(const p of ['supabase/functions/vocabulary-reward-production/index.ts','supabase/functions/vocabulary-reward-sandbox/index.ts']){
  const s=read(p);
  assert.match(s,/['"]unequip['"]/);
  assert.match(s,/\['themes','frames','badges','titles','effects'\]\.includes\(category\)/);
  assert.match(s,/p_student_id:studentId,p_category:category/);
  assert.match(s,/auth\.getUser\(token\)/);
 }
});
test('database mutation never touches ownership, balances or XP',()=>{
 const sql=read('supabase/sql/reward-unequip-default.sql');
 assert.match(sql,/update public\.vocabulary_reward_owned set equipped=false/);
 assert.match(sql,/update public\.vocabulary_reward_sandbox_owned set equipped=false/);
 assert.doesNotMatch(sql,/delete from|set spent_xp|set granted_xp|set verified_earned_xp/i);
 for(const fn of ['unequip_vocabulary_reward','unequip_vocabulary_sandbox_reward']){
  assert.match(sql,new RegExp('revoke all on function public\\.'+fn+'\\(uuid,text\\) from public,anon,authenticated'));
  assert.match(sql,new RegExp('grant execute on function public\\.'+fn+'\\(uuid,text\\) to service_role'));
 }
});
test('app handles real and test unequip actions independently',()=>{
 const s=read('src/vocabulary/app.js');
 for(const action of ['real-unequip','sandbox-unequip'])assert.ok(s.includes(action));
 assert.match(s,/persistUnequippedReward/);
 const flow=read('src/vocabulary/rewards-unequip-flow.js');
 assert.match(flow,/action:'unequip',category/);
 assert.match(s,/await updateLiveCosmetics\(data\)/);
 assert.match(s,/await updateSandboxCosmetics\(data\)/);
});
