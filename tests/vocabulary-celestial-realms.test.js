import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PREMIUM_COLLECTIONS,SUPPORTED_THEME_IDS} from '../src/vocabulary/rewards-premium-registry.js';
import {rewardArtworkPath} from '../src/vocabulary/rewards-art.js';
import {applyRewardTheme,studentIdentityView,renderIdentityShowcase} from '../src/vocabulary/rewards-equipped-home.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const collection=PREMIUM_COLLECTIONS.find(x=>x.id==='celestial-realms');
const rewards=[
 ['celestial-realms','themes','Celestial Realms Theme',2500],
 ['astral-halo-frame','frames','Astral Halo Frame',1200],
 ['starseer-emblem','badges','Starseer Emblem',800],
 ['sky-wanderer','titles','Sky Wanderer',1000],
 ['stardust-trail','effects','Stardust Trail',1500]
];
test('Celestial Realms has five unique rewards matching the approved mockup',()=>{
 assert.ok(collection);
 assert.deepEqual(collection.rewards,rewards);
 assert.ok(SUPPORTED_THEME_IDS.includes('celestial-realms'));
 for(const [id] of rewards)assert.ok(rewardArtworkPath(id)?.endsWith(id==='celestial-realms'?'celestial-realms-preview.png':id+'.png'));
});
test('theme controller and equipment keep Stardust Trail independent of Badge and Frame',()=>{
 const items=rewards.map(([reward_id,category,name])=>({reward_id,category,name}));
 const owned=items.map(({reward_id,category})=>({reward_id,category,equipped:true}));
 const shop={shopMode:'sandbox',sandboxEnabled:true,rewards:items,owned};
 const profile=studentIdentityView(shop,'Test Student');
 assert.match(profile.frame,/astral-halo-frame\.png$/);
 assert.match(profile.badge,/starseer-emblem\.png$/);
 assert.match(profile.titleArt,/sky-wanderer\.png$/);
 assert.match(profile.effectArt,/stardust-trail\.png$/);
 assert.equal(profile.themeName,'Celestial Realms Theme');
 const html=renderIdentityShowcase(shop,'Test Student');
 assert.match(html,/vocab-student-identity__frame/);
 assert.match(html,/vocab-student-identity__badge/);
 assert.match(html,/vocab-student-identity__effect/);
 const classes=new Set();
 const root={classList:{add:(...xs)=>xs.forEach(x=>classes.add(x)),remove:(...xs)=>xs.forEach(x=>classes.delete(x))}};
 applyRewardTheme(root,shop);
 assert.ok(classes.has('vocab-real-theme--celestial-realms'));
 assert.ok(classes.has('vocab-real-effect--stardust-trail'));
 applyRewardTheme(root,{...shop,owned:owned.filter(x=>x.category!=='themes')});
 assert.ok(!classes.has('vocab-real-theme--celestial-realms'));
 assert.ok(classes.has('vocab-real-effect--stardust-trail'));
 applyRewardTheme(root,{...shop,owned:[]});
 assert.ok(!classes.has('vocab-real-effect--stardust-trail'));
});
test('theme styling is immersive, readable and does not overwrite academic marking',()=>{
 const css=read('vocabulary-premium-celestial-realms.css');
 const shop=read('vocabulary-immersive-shop-backgrounds.css');
 const html=read('vocabulary.html');
 assert.match(css,/#vocabularyApp\.vocab-real-theme--celestial-realms/);
 assert.match(css,/assets\/vocabulary\/rewards\/celestial-realms\.png/);
 assert.match(css,/var\(--unit-wallpaper\)/);
 assert.match(css,/\.vocab-home-hero__welcome/);
 assert.match(css,/\.vocab-unit-card/);
 assert.match(css,/\.vocab-shop-leaderboard__head/);
 assert.match(css,/\.vocab-startup__status/);
 assert.match(css,/@media\(forced-colors:active\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(css,/\.vocab-answer--correct|\.vocab-answer--wrong/);
 assert.match(shop,/--immersive-shop-art:url\("assets\/vocabulary\/rewards\/celestial-realms\.png"\)/);
 assert.match(shop,/\.vocab-real-theme--celestial-realms/);
 assert.ok(html.indexOf('vocabulary-premium-celestial-realms.css')>html.indexOf('vocabulary-immersive-shop-backgrounds.css'));
});
test('catalogue remains disabled until artworks and full sandbox QA complete',()=>{
 const sql=read('supabase/sql/celestial-realms-catalog-staged.sql');
 for(const [id] of rewards)assert.ok(sql.includes("'"+id+"'"));
 assert.equal((sql.match(/false\)/g)||[]).length,5);
 assert.doesNotMatch(sql,/update\s+public\.vocabulary_reward_catalog\s+set\s+enabled\s*=\s*true/i);
 assert.doesNotMatch(sql,/vocabulary_reward_wallets|vocabulary_reward_owned|vocabulary_reward_purchases/);
});
test('six individually authored PNG assets are present, valid and high resolution',()=>{
 for(const filename of [
  'celestial-realms.png','celestial-realms-preview.png',
  'astral-halo-frame.png','starseer-emblem.png','sky-wanderer.png','stardust-trail.png'
 ]){
  const bytes=readFileSync(new URL('../assets/vocabulary/rewards/'+filename,import.meta.url));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature '+filename);
  assert.ok(bytes.readUInt32BE(16)>=700,'Artwork width too small: '+filename);
  assert.ok(bytes.readUInt32BE(20)>=700,'Artwork height too small: '+filename);
 }
});
