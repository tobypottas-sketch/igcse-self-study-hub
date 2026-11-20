import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rewardArtworkPath,rewardIllustration} from '../src/vocabulary/rewards-art.js';
import {studentIdentityView,applyRewardTheme} from '../src/vocabulary/rewards-equipped-home.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const badges=[
 ['forest-guardian-badge','Forest Guardian Badge','forest'],
 ['ocean-explorer-badge','Ocean Explorer Badge','ocean'],
 ['sakura-spirit-badge','Sakura Spirit Badge','sakura'],
 ['midnight-scholar-badge','Midnight Scholar Badge','midnight']
];
test('all four original-theme badges have distinct art IDs, are in Badge category and cost 500 XP',()=>{
 const art=read('src/vocabulary/rewards-art.js'),sql=read('supabase/sql/original-theme-badges-staged.sql');
 assert.equal(new Set(badges.map(x=>x[0])).size,4);
 for(const [id,name] of badges){
  assert.equal(rewardArtworkPath(id),'assets/vocabulary/rewards/'+id+'.png');
  assert.match(rewardIllustration(id),/vocab-shop-illustration/);
  assert.ok(art.includes("'"+id+"':'"+id+".png'"));
  assert.ok(sql.includes("'"+id+"','"+name+"','badges',500"));
 }
 assert.equal((sql.match(/false\)/g)||[]).length,4);
 assert.doesNotMatch(sql,/enabled\s*=\s*true|delete\s+from|truncate\s+|update\s+public\.vocabulary_reward_catalog/i);
 assert.doesNotMatch(sql,/vocabulary_reward_wallets|vocabulary_reward_owned|vocabulary_reward_purchases/);
});
test('the four badges use the existing equipment slot without equipping a theme',()=>{
 const rewards=badges.map(([reward_id,name])=>({reward_id,name,category:'badges'}));
 for(const [id] of badges){
  const owned=[{reward_id:id,category:'badges',equipped:true}];
  const result=studentIdentityView({shopMode:'production',owned,rewards},'Test Student');
  assert.match(result.badge,new RegExp(id+'\\.png$'));
  assert.equal(result.active.badges,id);
  assert.equal(result.active.themes,undefined);
 }
 const theme={reward_id:'forest',category:'themes',name:'Forest Theme'};
 const shop={shopMode:'production',rewards:[...rewards,theme],owned:[
  {reward_id:'sakura-spirit-badge',category:'badges',equipped:true},
  {reward_id:'forest',category:'themes',equipped:true}
 ]};
 const identity=studentIdentityView(shop,'Test Student');
 assert.match(identity.badge,/sakura-spirit-badge\.png$/);
 assert.equal(identity.active.themes,'forest');
 const classes=new Set();
 const root={classList:{add:(...xs)=>xs.forEach(x=>classes.add(x)),remove:(...xs)=>xs.forEach(x=>classes.delete(x))}};
 applyRewardTheme(root,shop);
 assert.ok(classes.has('vocab-real-theme--forest'));
 applyRewardTheme(root,{...shop,owned:shop.owned.filter(x=>x.category==='badges')});
 assert.ok(!classes.has('vocab-real-theme--forest'));
 assert.equal(studentIdentityView({...shop,owned:shop.owned.filter(x=>x.category==='badges')}).active.badges,'sakura-spirit-badge');
});
test('badges filter exists and hero describes all five equipment slots',()=>{
 const shop=read('src/vocabulary/rewards-sandbox-view.js');
 assert.match(shop,/\['badges','Badges'\]/);
 assert.match(shop,/data-category="\$\{id\}"/);
 assert.match(shop,/Themes <span aria-hidden="true">·<\/span> Frames <span aria-hidden="true">·<\/span> Badges/);
});
test('four transparent high-resolution PNGs must exist before merging',()=>{
 for(const [id] of badges){
  const bytes=readFileSync(new URL('../assets/vocabulary/rewards/'+id+'.png',import.meta.url));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Not a PNG: '+id);
  assert.ok(bytes.readUInt32BE(16)>=800,'Image too narrow: '+id);
  assert.ok(bytes.readUInt32BE(20)>=800,'Image too short: '+id);
  // PNG must support transparency through an alpha channel.
  assert.equal(bytes[25],6,'Expected RGBA PNG with transparency: '+id);
 }
});
