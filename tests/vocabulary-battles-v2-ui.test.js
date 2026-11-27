import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const ui=read('src/vocabulary/battles-app.js');
const css=read('vocabulary-battles-v2.css');
const html=read('vocabulary-battles.html');
const backend=read('supabase/functions/vocabulary-battles/index.ts');

test('Battle Arena V2 stylesheet and student script are fresh and ordered',()=>{
 assert.match(html,/vocabulary-battles\.css\?v=battles-mvp-v1/);
 assert.match(html,/vocabulary-battles-v2\.css\?v=champions-responsive-v1/);
 assert.ok(html.indexOf('vocabulary-battles-v2.css')>html.indexOf('vocabulary-battles.css'));
 assert.match(html,/battles-app\.js\?v=arena-recovery-v2/);
 assert.doesNotMatch(html,/id="battlesApp" aria-live="polite"/);
});

test('lobby includes opponent-facing matchup, class selector and weekly podium',()=>{
 for(const marker of ['battle-lobby-hero','battle-challenge-versus','battle-choice-grid','battle-podium','battle-request-list','battle-class-controls','battle-podium__medal','battle-no-ranks'])assert.ok(ui.includes(marker),marker);
 assert.match(ui,/data-battle-opponent/);
 assert.match(ui,/data-battle-unit/);
 assert.match(ui,/action:'leaderboard'/);
 assert.match(ui,/action:'lobby'/);
 assert.match(ui,/data-selected-opponent/);
});

test('ready room, live duel and result are distinct, meaningful screens',()=>{
 for(const marker of ['battle-ready-grid','battle-ready-status','battle-matchup','battle-fighter--self','battle-fighter--rival','battle-progress','battle-timer','battle-options','battle-finish__trophy','battle-final-scores'])assert.ok(ui.includes(marker),marker);
 assert.match(ui,/I’M READY/);
 assert.match(ui,/data-time-left/);
 assert.match(ui,/data-countdown/);
 assert.match(ui,/battle-question__tip/);
 assert.match(ui,/result\.correct/);
 assert.match(ui,/action:'answer'/);
 assert.match(ui,/No XP at stake/);
});

test('typography and contrasting colour groups are genuinely larger than old MVP',()=>{
 for(const color of ['--arena-cyan','--arena-purple','--arena-gold','--arena-green'])assert.ok(css.includes(color),color);
 assert.match(css,/\.battle-heading h1[\s\S]*?font-size:clamp\(3\.1rem,5vw,5\.5rem\)/);
 assert.match(css,/\.battle-question>h2\{font-size:clamp\(2rem,3\.1vw,3\.05rem\)/);
 assert.match(css,/\.battle-options \.battle-btn[\s\S]*?min-height:110px/);
 assert.match(css,/\.battle-btn:nth-child\(2\)/);
 assert.match(css,/\.battle-btn:nth-child\(3\)/);
 assert.match(css,/\.battle-btn:nth-child\(4\)/);
 assert.match(css,/\.battle-panel--invitations/);
 assert.match(css,/\.battle-panel--leaderboard/);
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/focus-visible/);
});

test('background polling does not replace an unchanged active question',()=>{
 assert.match(ui,/const sig=matchSignature\(b\)/);
 assert.match(ui,/if\(force\|\|state\.viewKey!==sig\)render\(matchMarkup\(\),sig\)/);
 assert.match(ui,/else patchMatchHud\(b\)/);
 assert.match(ui,/querySelector\('select:focus'\)/);
 assert.match(ui,/state\.polling=true/);
 assert.match(ui,/requestEpoch/);
 assert.match(ui,/data-own-score/);
 assert.match(ui,/data-rival-progress/);
 assert.match(ui,/setInterval\(updateClock,250\)/);
 assert.doesNotMatch(ui,/setInterval\(\(\)=>\{if\(!state\.busy\)void refresh\(\);\},3000\)/);
});

test('visual refresh remains isolated from server-scored learning and permissions',()=>{
 assert.match(ui,/getSupabaseClient/);
 assert.match(ui,/client\.functions\.invoke\('vocabulary-battles'/);
 assert.doesNotMatch(ui,/\.from\('vocabulary_battles'\)/);
 assert.doesNotMatch(ui,/reward_wallet|computeXp|settleMission|client\.from\('vocabulary_(?:attempts|mastery|reward_wallets)'\)/);
 assert.match(backend,/student_class_memberships/);
 assert.match(backend,/role!=='student'/);
 assert.match(backend,/const LIMIT=10,DURATION=60000/);
});

test('single-class students see a class identity chip without unnecessary native dropdown',()=>{
 assert.match(ui,/state\.classes\.length===1/);
 assert.match(ui,/battle-class-static__value/);
 assert.match(ui,/battle-class-static__dot/);
 assert.match(ui,/state\.classes\[0\]\.name/);
 assert.match(ui,/battle-class-select-wrap/);
 assert.match(ui,/data-battle-class/);
 assert.match(css,/\.battle-class-static__value/);
 assert.match(css,/select\[data-battle-class\]/);
 assert.match(css,/appearance:none/);
 assert.match(css,/focus-visible/);
 assert.match(css,/\.battle-class-select-chevron/);
 assert.match(css,/@media\(max-width:720px\)/);
});

test('actual match signature changes when both peers become ready and when questions advance',()=>{
 const phaseFor=()=>phase;
 let phase='ready';
 const state={battleId:'synthetic'};
 const source=ui.slice(ui.indexOf('function matchSignature('),ui.indexOf('function matchup('));
 const signature=new Function('phaseFor','state',source+'; return matchSignature;')(phaseFor,state);
 const waiting={ready:true,opponentReady:false,answered:0};
 const ready={...waiting,opponentReady:true};
 assert.equal(typeof signature(waiting),'string');
 assert.notEqual(signature(waiting),signature(ready));
 phase='countdown';
 const countdown=signature(ready);
 phase='question';
 const first=signature({...ready,question:{id:'q1'}});
 assert.notEqual(countdown,first);
 assert.equal(first,signature({...ready,question:{id:'q1'},opponentAnswered:2}));
 assert.notEqual(first,signature({...ready,answered:1,question:{id:'q2'}}));
 phase='finished';
 assert.notEqual(first,signature({...ready,outcome:'won'}));
});

test('recovery has bounded requests, restores polling on pageshow and supports all ten units',()=>{
 assert.match(ui,/AbortController/);assert.match(ui,/Promise\.race/);assert.match(ui,/pageshow/);assert.match(ui,/pollAgain/);assert.match(ui,/serverOffset/);assert.match(ui,/Education/);assert.match(css,/select option\{font-family:/);assert.match(css,/repeat\(3,minmax\(0,1fr\)\)/);
});

test('champion cards respond to the leaderboard panel rather than only the viewport',()=>{
 assert.match(css,/#battlesApp \.battle-panel--leaderboard\{container-type:inline-size;min-width:0\}/);
 assert.match(css,/@container \(max-width: 470px\)\{#battlesApp \.battle-podium\{grid-template-columns:minmax\(0,1fr\)\}\}/);
 assert.match(css,/grid-template-rows:auto auto 1fr/);
 assert.match(css,/grid-template-rows:1fr auto;align-self:stretch/);
 assert.match(css,/word-break:normal;hyphens:none;white-space:normal/);
 assert.match(css,/overflow-wrap:break-word;text-wrap:balance/);
});
