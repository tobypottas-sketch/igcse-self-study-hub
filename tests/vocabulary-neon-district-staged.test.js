import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rewardArtworkPath} from '../src/vocabulary/rewards-art.js';
import {SUPPORTED_THEME_IDS,PREMIUM_COLLECTIONS} from '../src/vocabulary/rewards-premium-registry.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('Neon District is a complete planned five-piece collection',()=>{
 const neon=PREMIUM_COLLECTIONS.find(x=>x.id==='neon-district');
 assert.ok(neon);
 assert.equal(neon.rewards.length,5);
 assert.deepEqual(new Set(neon.rewards.map(x=>x[1])),new Set(['themes','frames','badges','titles','effects']));
 assert.ok(SUPPORTED_THEME_IDS.includes('neon-district'));
 for(const [id] of neon.rewards)assert.ok(rewardArtworkPath(id)?.endsWith(id+'.png'));
});
test('theme CSS is scoped and loaded after existing style cascade',()=>{
 const css=read('vocabulary-premium-neon-district.css');
 const html=read('vocabulary.html');
 assert.match(css,/#vocabularyApp\.vocab-real-theme--neon-district/);
 assert.match(css,/--neon-cyan:/);
 assert.match(css,/--neon-pink:/);
 assert.match(css,/var\(--unit-wallpaper\)/);
 assert.match(css,/\.vocab-shop-redesign/);
 assert.match(css,/@media\(forced-colors:active\)/);
 assert.ok(html.indexOf('vocabulary-premium-neon-district.css')>html.indexOf('vocabulary-reward-identity.css'));
});
test('Neon rewards are staged disabled, not unexpectedly sold',()=>{
 const sql=read('supabase/sql/neon-district-catalog-staged.sql');
 for(const id of ['neon-district','cyber-pulse-frame','neon-hacker-badge','cyber-legend','electric-pulse'])
  assert.ok(sql.includes("'"+id+"'"));
 assert.equal((sql.match(/false\)/g)||[]).length,5);
 assert.doesNotMatch(sql,/update\s+public\.vocabulary_reward_catalog\s+set\s+enabled\s*=\s*true/i);
});

test('asset files must exist before Neon District can be merged or sold',()=>{
 const paths=['neon-district.png','neon-district-preview.png','cyber-pulse-frame.png','neon-hacker-badge.png','cyber-legend.png','electric-pulse.png'];
 for(const filename of paths){
  const relative='../assets/vocabulary/rewards/'+filename;
  const bytes=readFileSync(new URL(relative,import.meta.url));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Invalid PNG: '+filename);
  assert.ok(bytes.readUInt32BE(16)>=500,'PNG is too small: '+filename);
  assert.ok(bytes.readUInt32BE(20)>=500,'PNG is too short: '+filename);
 }
});
