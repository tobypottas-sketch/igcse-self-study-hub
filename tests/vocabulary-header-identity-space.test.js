import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('student identity header receives a final stylesheet after the existing reward styles',()=>{
 const html=read('vocabulary.html');
 const old=html.indexOf('href="vocabulary-reward-identity.css');
 const file=html.indexOf('href="vocabulary-header-identity-space.css?v=full-name-header-v1"');
 assert.ok(old>=0&&file>old);
});
test('mini identity supports 30 percent taller header, full names and responsive wraps',()=>{
 const css=read('vocabulary-header-identity-space.css');
 assert.match(css,/min-height:78px/);
 assert.match(css,/width:50px/);
 assert.match(css,/width:125px/);
 assert.match(css,/overflow-wrap:anywhere/);
 assert.match(css,/white-space:normal/);
 assert.match(css,/@media\(max-width:560px\)/);
 assert.match(css,/flex:1 1 100%/);
 assert.match(css,/\.vocab-student-identity-mini__name\{[\s\S]*?display:grid/);
 assert.doesNotMatch(css,/\.vocab-student-identity\{/);
});
test('header decoration continues to use the entire escaped student name and equipped artwork',()=>{
 const js=read('src/vocabulary/rewards-equipped-home.js');
 assert.match(js,/escapeHtml\(id\.name\)/);
 assert.match(js,/vocab-student-identity-mini__title-art/);
 assert.match(js,/header\.append\(chip\)/);
});
