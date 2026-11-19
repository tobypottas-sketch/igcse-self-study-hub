import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';
import {leaderboardModal,leaderboardPageSize} from '../src/vocabulary/rewards-leaderboard-modal.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const board={ok:true,scope:'school',period:'weekly',className:'All classes',
 rows:Array.from({length:100},(_,i)=>({rank:i+1,name:'Student '+(i+1),xp:i<5?100-i*10:0,isYou:i===39})),
 me:{rank:40,name:'You',xp:0,isYou:true},count:100};
const shop={sandboxEnabled:true,shopMode:'sandbox',wallet:{available:100000},rewards:[],owned:[]};
const progress={level:{level:1,xp:0,next:100,progressPercent:0}};
test('shop stays seven rows, even when API returns 100 expanded ranks',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,shop,{leaderboard:board,progress,leaderboardView:{scope:'school',period:'weekly',expanded:true}});
 const html=root.innerHTML;
 const preview=html.split('class="vocab-shop-leaderboard__list">')[1].split('</ol>')[0];
 assert.equal((preview.match(/vocab-shop-leaderboard__row/g)||[]).length,7);
 assert.ok(preview.includes('Student 7'));
 assert.ok(!preview.includes('Student 8'));
 assert.match(html,/data-leaderboard-overlay/);
 assert.match(html,/aria-modal="true"/);
 assert.match(html,/data-leaderboard-search/);
 assert.match(html,/data-leaderboard-active/);
 assert.match(html,/data-leaderboard-pages/);
});
test('collapsed shop never mounts full overlay',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,shop,{leaderboard:board,progress,leaderboardView:{expanded:false}});
 assert.doesNotMatch(root.innerHTML,/data-leaderboard-overlay/);
 assert.match(root.innerHTML,/View full leaderboard/);
});
test('production action prefixes apply to modal close and group tabs',()=>{
 const root={innerHTML:''};
 renderProductionShop(root,{...shop,shopMode:'production',purchasesEnabled:true,walletStatus:'ready'},{
  leaderboard:board,progress,leaderboardView:{scope:'school',period:'all',expanded:true}});
 assert.match(root.innerHTML,/data-action="real-leaderboard-expand"/);
 assert.match(root.innerHTML,/data-action="real-leaderboard"/);
 assert.doesNotMatch(root.innerHTML,/data-action="sandbox-leaderboard"/);
});
test('overlay has 12-row pagination, independent search/filter, pinned personal rank and Escape close',()=>{
 assert.equal(leaderboardPageSize,12);
 const html=leaderboardModal(board,{scope:'school',period:'weekly'});
 assert.match(html,/role="dialog"/);
 assert.match(html,/data-leaderboard-my-rank/);
 assert.match(html,/data-leaderboard-search/);
 const src=read('src/vocabulary/rewards-leaderboard-modal.js');
 assert.match(src,/state\.activeOnly\|\|Number\(row\.xp\)>0/);
 assert.match(src,/filtered\.slice\(start,start\+PAGE_SIZE\)/);
 assert.match(src,/state\.term=search\.value/);
 assert.match(src,/event\.key==='Escape'/);
 assert.match(src,/element\.inert=true/);
 assert.match(src,/dialog\.focus\(\)/);
});
test('responsive overlay styles are isolated from gameplay and verified XP logic',()=>{
 const css=read('vocabulary-leaderboard-overlay.css');
 assert.match(css,/position:fixed;inset:0/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/100dvh/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(css,/vocab-question-card|vocab-tile|gm-option/);
 const app=read('src/vocabulary/app.js');
 assert.match(app,/vocabulary-practice-leaderboard/);
 assert.match(app,/rewards-sandbox-view\.js\?v=full-leaderboard-v1/);
 const api=read('supabase/functions/vocabulary-practice-leaderboard/index.ts');
 assert.match(api,/expanded\?list\.slice\(0,1000\):list\.slice\(0,7\)/);
 assert.match(api,/ids\.length>1000/);
});

