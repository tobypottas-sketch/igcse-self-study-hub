import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {renderSandboxShop} from '../src/vocabulary/rewards-sandbox-view.js';
import {rewardIllustration,bannerIllustration} from '../src/vocabulary/rewards-art.js';
const rewards=[
 {reward_id:'midnight',name:'Midnight Theme',category:'themes',xp_price:600,description:'Dark theme',icon:'🌙'},
 {reward_id:'gold-frame',name:'Golden Frame',category:'frames',xp_price:800,description:'Shiny',icon:'🏅'},
 {reward_id:'word-wizard',name:'Word Wizard',category:'titles',xp_price:1000,description:'Word expert',icon:'🧙'},
 {reward_id:'pixel-badge',name:'Pixel Badge',category:'effects',xp_price:400,description:'Retro badge',icon:'✨'}
];
const shop={sandboxEnabled:true,shopMode:'sandbox',wallet:{granted:100000,spent:1000,available:99000},rewards,
 owned:[{reward_id:'midnight',category:'themes',equipped:true},{reward_id:'pixel-badge',category:'effects',equipped:false}]};
const progress={level:{level:2,xp:125,next:250,progressPercent:17},weekly:{label:'2 of 4 activities'},achievementsUnlocked:1,achievementsTotal:8};
test('approved shop layout contains real progress, sandbox balance and equipped area',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,shop,{progress,studentName:'TEST STUDENT'});
 assert.match(root.innerHTML,/99,000 XP/);
 assert.match(root.innerHTML,/Level|Lv\./);
 assert.match(root.innerHTML,/125 XP/);
 assert.match(root.innerHTML,/2 of 4 activities/);
 assert.match(root.innerHTML,/1 \/ 8/);
 assert.match(root.innerHTML,/TEST STUDENT/);
 assert.match(root.innerHTML,/Equipped now/);
 assert.match(root.innerHTML,/Popular picks/);
 assert.match(root.innerHTML,/Next unlock/);
 assert.match(root.innerHTML,/data-equipped-theme="midnight"/);
 assert.match(root.innerHTML,/Test credits only/);
 assert.doesNotMatch(root.innerHTML,/2,480 XP|Level 12|14 days/);
});
test('shop card actions continue to work after redesign and filters are genuine',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,shop,{category:'themes',progress});
 assert.equal((root.innerHTML.match(/class="vocab-reward-card vocab-shop-card/g)||[]).length,1);
 assert.match(root.innerHTML,/Equipped/);
 renderSandboxShop(root,shop,{category:'popular',progress});
 assert.ok(root.innerHTML.includes('Golden Frame'));
 assert.ok(root.innerHTML.includes('Word Wizard'));
 assert.match(root.innerHTML,/data-action="sandbox-buy"/);
 assert.match(root.innerHTML,/data-action="sandbox-equip"/);
});
test('artwork renders as inline accessible decorative vectors, without remote tracking',()=>{
 assert.match(rewardIllustration('midnight'),/<svg/);
 assert.match(rewardIllustration('forest'),/<svg/);
 assert.match(rewardIllustration('gold-frame'),/<svg/);
 assert.match(bannerIllustration,/<svg/);
 assert.doesNotMatch(bannerIllustration,/<image\\b|<script\\b|(?:href|src)=[\"']https?:/i);
});
test('untrusted student names and catalogue descriptions are escaped',()=>{
 const root={innerHTML:''};
 renderSandboxShop(root,{...shop,rewards:[{...rewards[0],description:'<img src=x onerror=alert(1)>'}]},
  {progress,studentName:'<script>alert(1)</script>'});
 assert.doesNotMatch(root.innerHTML,/<script>/);
 assert.doesNotMatch(root.innerHTML,/<img src=x/);
 assert.match(root.innerHTML,/&lt;script&gt;/);
});
test('UI can only be shown to server-enabled sandbox accounts',()=>{
 const root={innerHTML:''};
 assert.throws(()=>renderSandboxShop(root,{...shop,sandboxEnabled:false},{progress}),/Sandbox not enabled/);
 const app=fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
 assert.match(app,/if\(!result\?\.sandboxEnabled\|\|!home\.isConnected\)return/);
 assert.match(app,/progress:homeEngagement\(\)/);
 assert.match(app,/sandbox-filter/);
 assert.match(app,/sandbox-buy/);
 assert.match(app,/sandbox-equip/);
});
