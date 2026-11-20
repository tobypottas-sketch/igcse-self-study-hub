import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {REWARDS,REWARD_CATEGORIES,rewardsForCategory} from '../src/vocabulary/rewards-catalog.js';
import {equippedCosmetics,studentIdentityView,applyRewardTheme} from '../src/vocabulary/rewards-equipped-home.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const pixel=REWARDS.find(r=>r.id==='pixel-badge');

test('Pixel Badge is a 400 XP Badge, not an Effect, in the local catalogue',()=>{
 assert.ok(pixel);
 assert.equal(pixel.category,'badges');
 assert.equal(pixel.price,400);
 assert.ok(REWARD_CATEGORIES.some(r=>r.id==='badges'));
 assert.ok(rewardsForCategory('badges').some(r=>r.id==='pixel-badge'));
 assert.ok(!rewardsForCategory('effects').some(r=>r.id==='pixel-badge'));
});
test('Pixel Badge visibly occupies Badge slot but not effect slot',()=>{
 const rewards=[
  {reward_id:'pixel-badge',category:'badges',name:'Pixel Badge'},
  {reward_id:'forest',category:'themes',name:'Forest Theme'},
  {reward_id:'sparkle',category:'effects',name:'Sparkle Effect'}
 ];
 const shop={shopMode:'production',rewards,owned:[
  {reward_id:'pixel-badge',category:'badges',equipped:true},
  {reward_id:'forest',category:'themes',equipped:true},
  {reward_id:'sparkle',category:'effects',equipped:true}
 ]};
 const identity=studentIdentityView(shop,'Test Student');
 assert.equal(identity.active.badges,'pixel-badge');
 assert.equal(identity.active.effects,'sparkle');
 assert.match(identity.badge,/pixel-badge\.png$/);
 assert.equal(identity.themeName,'Forest Theme');
 const classes=new Set(['learning-progress']);
 const root={classList:{add:(...xs)=>xs.forEach(x=>classes.add(x)),remove:(...xs)=>xs.forEach(x=>classes.delete(x))}};
 applyRewardTheme(root,shop);
 assert.ok(classes.has('vocab-real-theme--forest'));
 assert.ok(classes.has('vocab-real-effect--sparkle'));
 assert.ok(!classes.has('vocab-real-effect--pixel-badge'));
 assert.ok(classes.has('learning-progress'));
 const switched={...shop,rewards:[...rewards,{reward_id:'forest-guardian-badge',name:'Forest Guardian Badge',category:'badges'}],
  owned:shop.owned.map(x=>x.reward_id==='pixel-badge'?{...x,equipped:false}:x).concat([{reward_id:'forest-guardian-badge',category:'badges',equipped:true}])};
 assert.match(studentIdentityView(switched,'Test Student').badge,/forest-guardian-badge\.png$/);
});
test('migration preserves original purchase ownership, never touches wallets and resolves badge collisions',()=>{
 const sql=read('supabase/sql/pixel-badge-to-badges-preserve-ownership.sql');
 assert.match(sql,/begin;/);
 assert.match(sql,/commit;/);
 assert.match(sql,/set category='badges'/);
 assert.match(sql,/from public\.vocabulary_reward_sandbox_owned/);
 assert.match(sql,/update public\.vocabulary_reward_owned/);
 assert.match(sql,/update public\.vocabulary_reward_sandbox_owned/);
 assert.match(sql,/other\.category='badges'/);
 assert.match(sql,/pixel\.equipped=true/);
 assert.doesNotMatch(sql,/delete\s+from|truncate\s+|drop\s+table|update\s+public\.vocabulary_reward_wallets|update\s+public\.vocabulary_reward_sandbox_wallets/i);
 assert.match(read('src/vocabulary/rewards-premium-registry.js'),/Pixel Badge is now a real badge/);
});
test('returning browsers load the corrected Badge renderer',()=>{
 const app=read('src/vocabulary/app.js'),router=read('src/vocabulary/router.js'),html=read('vocabulary.html');
 assert.match(app,/rewards-equipped-home\.js\?v=profile-theme-caption-removed-v1/);
 assert.equal((router.match(/app\.js\?v=profile-theme-caption-removed-v1/g)||[]).length,2);
 assert.match(html,/router\.js\?v=profile-theme-caption-removed-v1/);
});
