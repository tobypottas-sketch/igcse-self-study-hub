import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderSandboxShop} from '../src/vocabulary/rewards-sandbox-view.js';

const source=fs.readFileSync(new URL('../supabase/functions/vocabulary-practice-leaderboard/index.ts',import.meta.url),'utf8');
const formatterSource=source.match(/function shortName\(value\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(formatterSource,'Leaderboard API name formatter must be present');
const shortName=Function(formatterSource+'; return shortName;')();
test('real-world school name formats retain first and last name without nicknames or truncation',()=>{
 assert.equal(shortName('Qiliang Yin (Adam)'),'Qiliang Yin');
 assert.equal(shortName('Tiantong Tony Yu'),'Tiantong Yu');
 assert.equal(shortName('Wuye Bao (Bob)'),'Wuye Bao');
 assert.equal(shortName('Anrui Ray Wu'),'Anrui Wu');
 assert.equal(shortName('Anqi Xie (Angel)'),'Anqi Xie');
 assert.equal(shortName(' SingleName '),'SingleName');
 assert.equal(shortName('张三'),'张三');
 assert.equal(shortName('  '),'Student');
 assert.equal(shortName('<script> Qiliang Yin'),'script Qiliang Yin'.split(' ')[0]+' Yin');
});
test('ranking still comes from server verified missions, not spendable or sandbox XP',()=>{
 assert.match(source,/vocabulary_missions/);
 assert.match(source,/scores\(missions,eligible\)/);
 assert.match(source,/rows:visible\.map\(publicRow\)/);
 assert.match(source,/auth\.getUser\(token\)/);
 assert.match(source,/callerProfile\?\.role!=='student'/);
 assert.doesNotMatch(source,/from\('vocabulary_reward_(?:sandbox_)?wallets'\)/);
});
test('leaderboard renders complete labels, podium classes and an identifiable self row',()=>{
 const shop={sandboxEnabled:true,shopMode:'sandbox',wallet:{available:1000000},rewards:[],owned:[]};
 const board={ok:true,rows:[
  {rank:1,name:'Qiliang Yin',xp:60,isYou:false},
  {rank:2,name:'Tiantong Yu',xp:60,isYou:false},
  {rank:3,name:'Wuye Bao',xp:25,isYou:false},
  {rank:4,name:'You',xp:20,isYou:true}
 ],me:{rank:4,name:'You',xp:20,isYou:true},className:'Grade 9'};
 const root={innerHTML:''};
 renderSandboxShop(root,shop,{leaderboard:board});
 const html=root.innerHTML;
 for(const name of ['Qiliang Yin','Tiantong Yu','Wuye Bao']) assert.ok(html.includes(name));
 assert.match(html,/is-podium--1/);
 assert.match(html,/is-podium--2/);
 assert.match(html,/is-podium--3/);
 assert.match(html,/is-you/);
 assert.match(html,/Your rank/);
 assert.match(html,/data-action="sandbox-leaderboard-expand"/);
});
test('leaderboard has wrapping names, responsive width and reduced-motion/focus styling',()=>{
 const css=fs.readFileSync(new URL('../vocabulary-leaderboard-polish.css',import.meta.url),'utf8');
 const html=fs.readFileSync(new URL('../vocabulary.html',import.meta.url),'utf8');
 assert.match(css,/overflow:visible;text-overflow:clip;white-space:normal/);
 assert.match(css,/overflow-wrap:anywhere/);
 assert.match(css,/grid-template-columns:37px minmax\(0,1fr\) auto/);
 assert.match(css,/@media\(max-width:440px\)/);
 assert.match(css,/focus-visible/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.ok(html.includes('vocabulary-leaderboard-polish.css?v=rankings-names-v1'));
});
