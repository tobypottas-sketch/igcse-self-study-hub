import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../vocabulary-rewards.css',import.meta.url),'utf8');
test('real and sandbox cards share exactly one responsive homepage strip',()=>{
 assert.match(app,/function ensureRewardsHomeStrip\(home\)/);
 assert.match(app,/home\.querySelector\('\[data-rewards-home-strip\]'\)/);
 assert.match(app,/strip\.dataset\.rewardsHomeStrip='true'/);
 assert.match(app,/const strip=ensureRewardsHomeStrip\(home\)/);
 assert.match(app,/strip\.prepend\(entry\)/);
 assert.match(app,/strip\.append\(entry\)/);
 assert.match(css,/\.vocab-rewards-home-strip\{[\s\S]*?grid-template-columns:minmax\(0,1fr\) minmax\(235px,295px\)/);
});
test('primary shop uses real XP and unchanged real action with approved PNG',()=>{
 assert.match(app,/assets\/vocabulary\/rewards\/word-explorer\.png/);
 assert.match(app,/Number\(shop\.wallet\.available\)\.toLocaleString\('en'\)/);
 assert.match(app,/data-action="open-real-shop"/);
 assert.match(app,/Learning XP stays yours/);
});
test('sandbox stays test-only and has its own action, balance and artwork',()=>{
 assert.match(app,/if\(!result\?\.sandboxEnabled\|\|!home\.isConnected\)return/);
 assert.match(app,/TEST ACCOUNT ONLY/);
 assert.match(app,/assets\/vocabulary\/rewards\/pixel-badge\.png/);
 assert.match(app,/Number\(result\.wallet\?\.available\?\?0\)\.toLocaleString\('en'\)/);
 assert.match(app,/data-action="open-sandbox-shop"/);
 assert.match(app,/No real XP spent/);
});
test('cards remove older oversized and cramped text without changing navigation',()=>{
 assert.doesNotMatch(app,/XP Rewards Shop · Test Mode/);
 assert.doesNotMatch(app,/Buying rewards never reduces learning XP\.<\/small>/);
 assert.match(css,/\.vocab-rewards-home-card--sandbox\{/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(max-width:480px\)/);
 assert.match(css,/\.vocab-rewards-home-card button:focus-visible/);
});
test('async refreshes do not add duplicate cards or create duplicate strips',()=>{
 assert.match(app,/strip\.querySelector\('\[data-real-entry\]'\)\?\.remove\(\)/);
 assert.match(app,/strip\.querySelector\('\[data-sandbox-entry\]'\)\?\.remove\(\)/);
 assert.match(app,/if\(strip\)return strip/);
});
