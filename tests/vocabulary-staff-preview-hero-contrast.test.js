import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderVocabularyHome} from '../src/vocabulary/views.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('admin/teacher preview gets an explicit light-surface marker but student home does not',()=>{
 const preview={innerHTML:''},student={innerHTML:''};
 renderVocabularyHome(preview,{displayName:'Preview Student',preview:true});
 renderVocabularyHome(student,{displayName:'Student',preview:false});
 assert.match(preview.innerHTML,/vocab-shell--home vocab-shell--staff-preview/);
 assert.doesNotMatch(student.innerHTML,/vocab-shell--staff-preview/);
 assert.match(preview.innerHTML,/vocab-home-hero__welcome/);
});
test('light preview heading, accent, supporting sentence and name are high contrast',()=>{
 const css=read('vocabulary-hero-unified.css');
 const scope='#vocabularyApp .vocab-shell--home.vocab-shell--staff-preview > .vocab-hero--home ';
 const options=new Map([
  ['h1','color:#17395b!important;'],
  ['h1 span','color:#087d81!important;'],
  ['.vocab-home-hero__tagline','color:#244664!important;'],
  ['.vocab-home-hero__welcome','color:#315674!important;'],
  ['.vocab-home-hero__welcome strong','color:#825007!important;']
 ]);
 for(const [selector,color] of options){
   const start=css.indexOf(scope+selector+'{');
   assert.ok(start>=0,'Missing preview-only rule: '+selector);
   assert.ok(css.slice(start,css.indexOf('}',start)).includes(color),'Contrast missing on '+selector);
 }
 assert.match(css,/@media\(forced-colors:active\)/);
});
test('the refreshed browser imports reach new preview markup and CSS',()=>{
 const app=read('src/vocabulary/app.js'),router=read('src/vocabulary/router.js'),html=read('vocabulary.html');
 assert.match(app,/views\.js\?v=battles-mvp-v1/);
 assert.match(router,/app\.js\?v=battles-mvp-v1/);
 assert.match(html,/router\.js\?v=battles-mvp-v1/);
 assert.match(html,/vocabulary-hero-unified\.css\?v=default-home-contrast-v3/);
});
