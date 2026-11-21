import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {leaderboardModal} from '../src/vocabulary/rewards-leaderboard-modal.js';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('leaderboard scope and period toggles update the overlay, not the entire Rewards Shop',()=>{
 const source=read('src/vocabulary/app.js');
 const modal=read('src/vocabulary/rewards-leaderboard-modal.js');
 assert.match(source,/if\(realLeaderboardView\.expanded && markLeaderboardTabPending\(root,realLeaderboardView\)\) void refreshRealLeaderboard\(\)/);
 assert.match(source,/if\(sandboxLeaderboardView\.expanded && markLeaderboardTabPending\(root,sandboxLeaderboardView\)\) void refreshSandboxLeaderboard\(\)/);
 assert.match(source,/updateLeaderboardModal\(root,realLeaderboard,realLeaderboardView\)/);
 assert.match(source,/updateLeaderboardModal\(root,sandboxLeaderboard,sandboxLeaderboardView\)/);
 assert.match(modal,/previous\.replaceWith\(next\)/);
 assert.doesNotMatch(modal,/root\.innerHTML\s*=/);
 assert.match(modal,/restore\?\.focus\(\{preventScroll:true\}\)/);
 assert.match(modal,/dialog\.focus\(\{preventScroll:true\}\)/);
});
test('modal keeps its accessible controls, and top-level overscroll is contained',()=>{
 const html=leaderboardModal(null,{scope:'school',period:'all'});
 assert.match(html,/data-scope="school" aria-pressed="true"/);
 assert.match(html,/data-period="all" aria-pressed="true"/);
 assert.match(html,/role="dialog" aria-modal="true"/);
 assert.match(html,/data-leaderboard-results/);
 assert.match(html,/data-leaderboard-search/);
 const css=read('vocabulary-leaderboard-overlay.css');
 assert.match(css,/overscroll-behavior:contain/);
 const root=read('vocabulary.html');
 assert.match(root,/vocabulary-leaderboard-overlay\.css\?v=stable-modal-scroll-v2/);
 assert.match(root,/src\/vocabulary\/router\.js\?v=leaderboard-stable-v1/);
});
test('server XP source and underlying purchases are unchanged',()=>{
 const source=read('src/vocabulary/app.js');
 assert.match(source,/vocabulary-practice-leaderboard/);
 assert.match(source,/requested\.scope!==sandboxLeaderboardView\.scope/);
 assert.match(source,/JSON\.stringify\(requested\)!==JSON\.stringify\(realLeaderboardView\)/);
 const modal=read('src/vocabulary/rewards-leaderboard-modal.js');
 assert.match(modal,/data-action="sandbox-leaderboard"/);
 assert.match(modal,/data-action="sandbox-leaderboard-expand"/);
 assert.match(modal,/html=html\.replace\(\/data-action="sandbox-\/g,'data-action="real-'\)/);
});
