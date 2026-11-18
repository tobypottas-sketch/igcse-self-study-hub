import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderSandboxShop} from '../src/vocabulary/rewards-sandbox-view.js';

const shop={sandboxEnabled:true,shopMode:'sandbox',wallet:{available:97900},
 rewards:[{reward_id:'forest',name:'Forest Theme',description:'Green',xp_price:900,category:'themes'}],owned:[]};
const progress={level:{level:3,xp:320,next:450,progressPercent:43},weekly:{label:'1 of 4 missions'},achievementsUnlocked:4,achievementsTotal:14};
const board={ok:true,scope:'class',period:'weekly',className:'G10 ESL-5',count:12,rows:[
 {rank:1,name:'Student A.',xp:80,isYou:false},{rank:2,name:'Student B.',xp:60,isYou:false},
 {rank:3,name:'Student C.',xp:40,isYou:false}],me:{rank:10,name:'You',xp:10,isYou:true}};
test('leaderboard appears under original progress section without replacing rewards',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,shop,{progress,studentName:'TEST STUDENT',leaderboard:board});
 const html=root.innerHTML;
 assert.match(html,/Your Progress/);assert.match(html,/Class leaderboard/);
 assert.match(html,/G10 ESL-5/);assert.match(html,/Practice XP/);
 assert.match(html,/You/);assert.match(html,/#10/);assert.match(html,/10 XP/);
 assert.match(html,/Forest Theme/);assert.match(html,/Equipped now/);
 assert.ok(html.indexOf('Your Progress')<html.indexOf('Class leaderboard'));
 assert.ok(html.indexOf('Class leaderboard')<html.indexOf('Shop rewards'));
});
test('leaderboard toggles are real action targets and displayed values are escaped',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,shop,{progress,leaderboard:{...board,className:'<script>bad</script>'},leaderboardView:{scope:'school',period:'all',expanded:true}});
 assert.doesNotMatch(root.innerHTML,/<script>/);
 assert.match(root.innerHTML,/&lt;script&gt;bad&lt;\/script&gt;/);
 assert.match(root.innerHTML,/data-action="sandbox-leaderboard"/);
 assert.match(root.innerHTML,/data-action="sandbox-leaderboard-expand"/);
 assert.match(root.innerHTML,/Show top 7/);
 assert.match(root.innerHTML,/data-scope="school" aria-pressed="true"/);
 assert.match(root.innerHTML,/data-period="all" aria-pressed="true"/);
});
test('missing remote data never invents student positions',()=>{
 const root={innerHTML:''};renderSandboxShop(root,shop,{progress});
 assert.match(root.innerHTML,/Leaderboard unavailable right now/);
 assert.doesNotMatch(root.innerHTML,/128,400 XP|Yixuan M\./);
});
test('read-only endpoint enforces authentication, class membership, practice-only XP and capped responses',()=>{
 const server=fs.readFileSync(new URL('../supabase/functions/vocabulary-practice-leaderboard/index.ts',import.meta.url),'utf8');
 assert.match(server,/auth\.getUser\(token\)/);
 assert.match(server,/student_class_memberships/);
 assert.match(server,/vocabulary_missions/);
 assert.match(server,/mission_kind/);
 assert.match(server,/daily\.get/);
 assert.match(server,/80-used/);
 assert.match(server,/sandbox wallets/);
 assert.doesNotMatch(server,/from\('vocabulary_reward_sandbox_wallets'\)/);
 assert.match(server,/rows:visible\.map\(publicRow\)/);
});
