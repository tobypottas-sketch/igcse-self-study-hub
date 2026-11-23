import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderIdentityShowcase} from '../src/vocabulary/rewards-equipped-home.js';
const css=readFileSync(new URL('../vocabulary-rewards-dashboard.css',import.meta.url),'utf8');
const rewardsCss=readFileSync(new URL('../vocabulary-rewards-dashboard.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
const shop={shopMode:'sandbox',sandboxEnabled:true,rewards:[
 {reward_id:'midnight',name:'Midnight Theme',category:'themes'},
 {reward_id:'gold-frame',name:'Golden Frame',category:'frames'},
 {reward_id:'word-explorer',name:'Word Explorer',category:'titles'},
 {reward_id:'sparkle',name:'Sparkle Effect',category:'effects'}
],owned:['midnight','gold-frame','word-explorer','sparkle'].map((reward_id,i)=>({reward_id,category:['themes','frames','titles','effects'][i],equipped:true}))};
test('student profile keeps all four reward identities and title artwork',()=>{
 const html=renderIdentityShowcase(shop,'TEST STUDENT');
 assert.match(html,/>Preview<\/span>/);
 assert.match(html,/>4 \/ 4 equipped<\/span>/);
 assert.match(html,/word-explorer\.png/);
 assert.match(html,/gold-frame-overlay\.png/);
 assert.match(html,/sparkle\.png/);
 for(const text of ['Midnight Theme active','Golden Frame equipped','Word Explorer equipped','Sparkle Effect equipped'])
  assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/class="vocab-student-identity__slots?"/);
 assert.match(html,/class="vocab-sr-only">4 \/ 4 test equipped:/);
});
test('unowned slots remain empty and cannot display purchased graphics',()=>{
 const empty=renderIdentityShowcase({...shop,owned:[]},'Student');
 assert.match(empty,/>0 \/ 4 equipped<\/span>/);
 for(const category of ['Theme','Frame','Title','Effect'])assert.ok(empty.includes(category+' not equipped'));
 assert.doesNotMatch(empty,/word-explorer\.png|gold-frame-overlay\.png|sparkle\.png/);
});
test('production profile uses the same concise count without a preview label',()=>{
 const html=renderIdentityShowcase({...shop,shopMode:'production'},'Synthetic Student');
 assert.match(html,/>4 \/ 4 equipped<\/span>/);
 assert.doesNotMatch(html,/>Preview<\/span>|test equipped/);
 assert.match(html,/MY STUDENT PROFILE/);
});
test('sandbox stays separate from learning XP and does not stretch vertically',()=>{
 assert.match(rewardsCss,/\.vocab-rewards-dashboard\{/);
 assert.match(rewardsCss,/\.vocab-rewards-home-card--sandbox\{/);
 assert.match(rewardsCss,/min-height:0/);
 assert.match(app,/data-action="open-sandbox-shop"/);
 assert.match(app,/No real XP spent/);
 assert.match(app,/Number\(result\.wallet\?\.available\?\?0\)\.toLocaleString\('en'\)/);
});

test('profile removes redundant theme name from visible banner for all themes and Default',()=>{
 for(const theme of ['midnight','ocean','forest','sakura','neon-district','celestial-realms']){
  const themed={
   ...shop,
   rewards:[...shop.rewards.filter(r=>r.category!=='themes'),{reward_id:theme,name:theme+' Theme',category:'themes'}],
   owned:[...shop.owned.filter(r=>r.category!=='themes'),{reward_id:theme,category:'themes',equipped:true}]
  };
  const html=renderIdentityShowcase(themed,'TEST STUDENT');
  assert.match(html,/>Preview<\/span>/);
  assert.match(html,/>4 \/ 4 equipped<\/span>/);
  assert.doesNotMatch(html,/vocab-student-identity__theme|Theme: <strong>/);
  assert.ok(html.includes('Theme active')===false || html.includes(theme+' Theme active'));
 }
 const none=renderIdentityShowcase({...shop,owned:[]},'TEST STUDENT');
 assert.doesNotMatch(none,/vocab-student-identity__theme|Theme: <strong>Default/);
 assert.match(none,/>0 \/ 4 equipped<\/span>/);
});
test('home always provides shop navigation even when verified wallet or catalogue is temporarily unavailable',()=>{
 const html=readFileSync(new URL('../vocabulary.html',import.meta.url),'utf8');
 const router=readFileSync(new URL('../src/vocabulary/router.js',import.meta.url),'utf8');
 const call=app.indexOf('ensureVisibleRewardsEntry(root.querySelector(\'.vocab-shell--home\'))');
 const pending=app.indexOf('void refreshVerifiedRewardWallet().then(()=>revealRealShopEntry())');
 assert.ok(call>0&&pending>call,'Shop entry must precede asynchronous wallet sync');
 const start=app.indexOf('function ensureVisibleRewardsEntry(home){');
 const end=app.indexOf('async function revealSandboxEntry()',start);
 assert.ok(start>0&&end>start);
 const fn=app.slice(start,end);
 assert.match(fn,/data-real-entry/);
 assert.match(fn,/data-action="open-real-shop"/);
 assert.match(fn,/Explore themes, frames, badges, titles and effects/);
 assert.doesNotMatch(fn,/wallet\.available|fetchRealShop|wallet-sync/);
 assert.match(html,/router\.js\?v=teacher-dashboard-v2/);
 assert.match(html,/vocabulary-rewards-dashboard\.css\?v=shop-recovery-v9/);
 assert.match(router,/app\.js\?v=leaderboard-stable-v1/);
 assert.match(app,/rewards-equipped-home\.js\?v=study-hud-v1/);
});
