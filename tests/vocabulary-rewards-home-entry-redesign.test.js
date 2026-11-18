import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../vocabulary-rewards.css',import.meta.url),'utf8');
test('real and sandbox cards live in separate containers of one homepage section',()=>{
 const layout=readFileSync(new URL('../src/vocabulary/rewards-home-layout.js',import.meta.url),'utf8');
 const layoutCss=readFileSync(new URL('../vocabulary-rewards-dashboard.css',import.meta.url),'utf8');
 assert.match(app,/function ensureRewardsHomeStrip\(home\)/);
 assert.match(app,/ensureRewardsDashboard\(home\)/);
 assert.match(app,/\[data-rewards-dashboard-side\]/);
 assert.match(app,/strip\.append\(entry\)/);
 assert.match(layout,/layout\.dataset\.rewardsDashboard='true'/);
 assert.match(layout,/data-rewards-dashboard-main/);
 assert.match(layout,/data-rewards-dashboard-side/);
 assert.match(layout,/home\.querySelector\('\.vocab-unit-grid'\)/);
 assert.match(layoutCss,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
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
test('compact cards retain their actions and responsive keyboard-safe styling',()=>{
 const css=readFileSync(new URL('../vocabulary-rewards-dashboard.css',import.meta.url),'utf8');
 assert.doesNotMatch(app,/XP Rewards Shop · Test Mode/);
 assert.match(css,/\.vocab-rewards-home-card--sandbox/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(max-width:540px\)/);
 assert.match(css,/button:focus-visible/);
});
test('async refreshes replace only their own card and never duplicate the layout',()=>{
 const layout=readFileSync(new URL('../src/vocabulary/rewards-home-layout.js',import.meta.url),'utf8');
 assert.match(app,/strip\.querySelector\('\[data-real-entry\]'\)\?\.remove\(\)/);
 assert.match(app,/strip\.querySelector\('\[data-sandbox-entry\]'\)\?\.remove\(\)/);
 assert.match(layout,/if\(layout\)return layout/);
});
