import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
test('Vocabulary entry page invalidates cached router and rewards stylesheet',()=>{
 const html=read('vocabulary.html');
 assert.match(html,/src\/vocabulary\/router\.js\?v=rewards-dashboard-v7/);
 assert.match(html,/vocabulary-rewards\.css\?v=rewards-dashboard-v7/);
});
test('router invalidates cached main Vocabulary module on all student routes',()=>{
 const router=read('src/vocabulary/router.js');
 const matches=router.match(/import\('\.\/app\.js\?v=rewards-dashboard-v7'\)/g)||[];
 assert.equal(matches.length,2);
 assert.doesNotMatch(router,/app\.js\?v=meaning-recognise-v1/);
});
test('new entry scripts contain the real and sandbox compact card implementation',()=>{
 const app=read('src/vocabulary/app.js'),css=read('vocabulary-rewards-dashboard.css');
 assert.match(app,/function ensureRewardsHomeStrip\(home\)/);
 assert.match(app,/vocab-rewards-home-card--real/);
 assert.match(app,/vocab-rewards-home-card--sandbox/);
 assert.match(css,/\.vocab-rewards-home-card--real\{/);
 assert.match(css,/\.vocab-rewards-home-card--sandbox\{/);
});
