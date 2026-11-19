import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderVocabularyHome} from '../src/vocabulary/views.js';
import {renderSandboxShop,renderProductionShop} from '../src/vocabulary/rewards-sandbox-view.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const shop={shopMode:'sandbox',sandboxEnabled:true,wallet:{available:1092150},rewards:[],owned:[]};

test('student home displays shorter engaging copy and personalised welcome',()=>{
 const source=read('src/vocabulary/views.js');
 assert.match(source,/CHOOSE YOUR <span>UNIT<\/span>/);
 assert.match(source,/Pick a unit\. Build your skills\. Earn XP\./);
 assert.match(source,/Welcome back,/);
 assert.match(source,/escapeHtml\(displayName\)/);
 assert.doesNotMatch(source,/Choose a unit, then work upwards through each vocabulary pathway/);
});
test('sandbox header has concise zones, retains verified wallet display and existing illustration',()=>{
 const root={innerHTML:''};renderSandboxShop(root,shop,{studentName:'Test Student'});
 const html=root.innerHTML;
 assert.match(html,/vocab-shop-hero__topline/);
 assert.match(html,/vocab-shop-hero__intro/);
 assert.match(html,/vocab-shop-hero__scene/);
 assert.match(html,/XP REWARDS <span>SHOP<\/span>/);
 assert.match(html,/Earn it\. Spend it\. Make it yours\./);
 assert.match(html,/Themes .*Frames .*Titles .*Effects/);
 assert.match(html,/1,092,150 XP/);
 assert.match(html,/TEST XP ONLY · Your learning progress is unaffected/);
 assert.match(html,/vocab-shop-hero__balance/);
 assert.match(html,/vocab-shop-hero__scene/);
});
test('production shop retains the true wallet source and production disclaimer',()=>{
 const root={innerHTML:''};
 renderProductionShop(root,{...shop,shopMode:'production',purchasesEnabled:true,walletStatus:'ready'});
 assert.match(root.innerHTML,/REAL XP REWARDS · Purchases do not reduce your earned learning XP/);
 assert.match(root.innerHTML,/1,092,150 XP/);
 assert.match(root.innerHTML,/Spendable balance/);
 assert.doesNotMatch(root.innerHTML,/TEST XP ONLY/);
});
test('unified hero CSS has deliberate two-area layout, mobile stacking and accessible theme colours',()=>{
 const css=read('vocabulary-hero-unified.css');
 assert.match(css,/--vocab-hero-display/);
 assert.doesNotMatch(css,/@import|fonts\.googleapis/);
 assert.match(css,/grid-template-areas:"top top" "intro art"/);
 assert.match(css,/grid-template-areas:"top" "intro" "art"/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css,/@media\(max-width:520px\)/);
 for(const theme of ['midnight','forest','ocean','sakura'])assert.ok(css.includes('vocab-real-theme--'+theme));
 assert.match(css,/@media\(forced-colors:active\)/);
 assert.doesNotMatch(css,/vocab-choice|gm-option|vocab-tile/);
});
test('new source and CSS must refresh through browser module chain',()=>{
 const html=read('vocabulary.html');
 const router=read('src/vocabulary/router.js');
 const app=read('src/vocabulary/app.js');
 assert.match(html,/vocabulary-hero-unified\.css\?v=hero-refresh-v1/);
 assert.match(html,/router\.js\?v=hero-refresh-v1/);
 assert.match(router,/app\.js\?v=hero-refresh-v1/);
 assert.match(app,/views\.js\?v=hero-refresh-v1/);
 assert.match(app,/rewards-sandbox-view\.js\?v=hero-refresh-v1/);
});