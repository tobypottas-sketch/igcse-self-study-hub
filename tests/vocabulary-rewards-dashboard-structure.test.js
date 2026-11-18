import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=read('src/vocabulary/app.js');
const profile=read('src/vocabulary/rewards-equipped-home.js');
const layout=read('src/vocabulary/rewards-home-layout.js');
const css=read('vocabulary-rewards-dashboard.css');
test('dashboard has a single authoritative home insertion point after all unit cards',()=>{
 assert.match(layout,/home\.querySelector\('\.vocab-unit-grid'\)/);
 assert.match(layout,/anchor\.insertAdjacentElement\('afterend',layout\)/);
 assert.match(layout,/if\(layout\)return layout/);
 assert.match(layout,/data-rewards-dashboard-main/);
 assert.match(layout,/data-rewards-dashboard-side/);
 assert.doesNotMatch(layout,/position:\s*absolute|style\.left|style\.right/);
});
test('profile and real shop share main column; test-only card occupies side column',()=>{
 assert.match(profile,/const layout=ensureRewardsDashboard\(home\)/);
 assert.match(profile,/layout\?\.querySelector\('\[data-rewards-dashboard-main\]'\)/);
 assert.match(profile,/main\.insertAdjacentHTML\('afterbegin',renderIdentityShowcase/);
 assert.match(app,/layout\?\.querySelector\('\[data-rewards-dashboard-side\]'\)/);
 assert.match(app,/const strip=ensureRewardsHomeStrip\(home\)/);
 assert.match(app,/strip\.append\(entry\)/);
 assert.doesNotMatch(profile,/hero\.insertAdjacentHTML\('afterend',renderIdentityShowcase/);
});
test('CSS uses nonoverlapping natural-height responsive columns and preserves original assets',()=>{
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/align-items:start/);
 assert.match(css,/\.vocab-rewards-home-card--sandbox\{/);
 assert.match(css,/min-height:0;height:auto;align-self:start/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/grid-template-columns:1fr;gap:12px/);
 assert.match(css,/\.vocab-student-identity__title-art img/);
 assert.doesNotMatch(css,/\.vocab-unit-card__art|\.vocab-question/);
});
