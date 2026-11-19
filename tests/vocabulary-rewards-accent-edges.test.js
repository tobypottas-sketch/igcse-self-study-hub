import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('shop accent sheet loads after existing theme and hero rules',()=>{
 const html=read('vocabulary.html');
 assert.ok(html.includes('vocabulary-rewards-accent-edges.css?v=shop-accent-edges-v1'));
 assert.ok(html.indexOf('vocabulary-rewards-accent-edges.css')>html.indexOf('vocabulary-hero-unified.css'));
});
test('all requested rewards panels get scoped borders without changing PNG artwork',()=>{
 const css=read('vocabulary-rewards-accent-edges.css');
 for(const selector of ['> .vocab-topbar','> .vocab-shop-hero','.vocab-shop-sidebar','.vocab-shop-leaderboard','.vocab-shop-equipped','.vocab-shop-card']){
  assert.ok(css.includes(selector),'missing shop outline: '+selector);
 }
 assert.match(css,/border:1\.5px solid var\(--shop-accent-edge\)/);
 assert.match(css,/\.vocab-shop-card--effects\{\s*border-top:3px solid #bd96fb;/);
 assert.match(css,/@media\(forced-colors:active\)/);
 assert.doesNotMatch(css,/\.vocab-shop-illustration|object-fit|width:100%/);
});
