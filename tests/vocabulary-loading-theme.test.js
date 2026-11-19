import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const css=read('vocabulary-loading-theme.css');
const html=read('vocabulary.html');
const app=read('src/vocabulary/app.js');

test('theme-aware loader styles are loaded after purchased theme palette',()=>{
 const loader=html.indexOf('href="vocabulary-loading-theme.css?v=loader-contrast-v1"');
 assert.ok(loader>html.indexOf('vocabulary-reward-identity.css'));
 assert.ok(loader>html.indexOf('vocabulary-header-theme-legibility.css'));
 assert.match(html,/vocab-startup__status/);
});
test('loader has an opaque readable panel and explicit title and status colours',()=>{
 assert.match(css,/#vocabularyApp \.vocab-startup__content/);
 assert.match(css,/background:rgba\(250,253,255,.97\)/);
 assert.match(css,/#vocabularyApp \.vocab-startup__title\{[\s\S]*?color:#173958/);
 assert.match(css,/#vocabularyApp \.vocab-startup__status\{[\s\S]*?color:#355b76/);
});
test('all four reward themes retain readable loader text regardless of page background',()=>{
 for(const theme of ['midnight','forest','ocean','sakura']){
  assert.match(css,new RegExp('vocab-real-theme--'+theme+' \\.vocab-startup__content'));
  assert.match(css,new RegExp('vocab-real-theme--'+theme+' \\.vocab-startup__title'));
  assert.match(css,new RegExp('vocab-real-theme--'+theme+' \\.vocab-startup__status'));
 }
 assert.match(css,/@media\(max-width:480px\)/);
 assert.match(css,/@media\(forced-colors:active\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
test('startup and return-to-home use the same loader and no data or XP behaviour changes',()=>{
 assert.match(app,/function showStudentLoading\(message\)/);
 assert.ok((app.match(/showStudentLoading\('Loading your vocabulary progress…'\)/g)||[]).length>=2);
 assert.match(app,/class="vocab-startup__title"/);
 assert.doesNotMatch(css,/vocab-unit-card|vocab-choice|vocab-shop|vocab-reward-wallet/);
});
