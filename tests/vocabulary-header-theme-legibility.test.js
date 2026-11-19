import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('vocabulary-header-theme-legibility.css');
const html=read('vocabulary.html');
test('header override is loaded last after theme and reward styles',()=>{
 const newIndex=html.indexOf('vocabulary-header-theme-legibility.css?v=centered-30pct-badges-v2');
 assert.ok(newIndex>html.indexOf('vocabulary-reward-identity.css'));
 assert.ok(newIndex>html.indexOf('vocabulary-unit-themes.css'));
 assert.ok(newIndex>html.indexOf('vocabulary-header-identity-space.css'));
 assert.ok(newIndex>html.indexOf('vocabulary-rewards-info-polish.css'));
});
test('title artwork and avatar are large enough to recognise on desktop and handheld views',()=>{
 assert.match(css,/width:247px;[\s\S]*?height:88px/);
 assert.match(css,/width:88px;height:88px/);
 assert.match(css,/width:43px;height:42px/);
 assert.match(css,/@media\(max-width:680px\)/);
 assert.match(css,/@media\(max-width:380px\)/);
 assert.match(css,/width:min\(100%,221px\);[\s\S]*?height:81px/);
 assert.match(css,/object-fit:contain/);
});
test('all four equipped themes receive explicit readable name and unit label treatments',()=>{
 for(const theme of ['midnight','forest','ocean','sakura']){
  assert.ok(css.includes('vocab-real-theme--'+theme),theme);
  assert.match(css,new RegExp('vocab-real-theme--'+theme+' \\.vocab-topbar--unit \\.vocab-unit-id__title'));
 }
 assert.match(css,/vocab-real-theme--midnight \.vocab-student-identity-mini__name/);
 assert.match(css,/background:#f6f9ff;[\s\S]*?color:#18345b/);
 assert.match(css,/background:#f2fff5;color:#174d35/);
 assert.match(css,/background:#f1fbff;color:#164c6d/);
 assert.match(css,/background:#fff4fa;color:#663454/);
 assert.match(css,/@media\(forced-colors:active\)/);
});
test('header identity artwork still comes from real owned PNG and unit control markup is unchanged',()=>{
 const identity=read('src/vocabulary/rewards-equipped-home.js');
 const unit=read('src/vocabulary/views.js');
 assert.match(identity,/vocab-student-identity-mini__title-art/);
 assert.match(identity,/id\.titleArt/);
 assert.match(identity,/decorateStudentIdentity/);
 assert.match(unit,/vocab-unit-id__title/);
 assert.doesNotMatch(css,/vocab-choice|gm-option|vocab-tile|\.vocab-student-identity\{/);
});

test('student name and reward title art are a truly centered vertical pair',()=>{
 assert.match(css,/\.vocab-student-identity-mini__name\{[\s\S]*?flex-direction:column;[\s\S]*?align-items:center;[\s\S]*?text-align:center;/);
 assert.match(css,/\.vocab-student-identity-mini__title-art\{[\s\S]*?justify-content:center;[\s\S]*?margin:0 auto;/);
 assert.match(css,/object-position:center;/);
 assert.match(css,/@media\(max-width:900px\)/);
 assert.match(css,/@media\(max-width:680px\)/);
});
