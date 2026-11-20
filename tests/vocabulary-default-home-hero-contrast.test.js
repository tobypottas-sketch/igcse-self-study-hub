import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderVocabularyHome} from '../src/vocabulary/views.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('default student overview renders the light non-preview hero',()=>{
 const student={innerHTML:''};
 renderVocabularyHome(student,{displayName:'TEST STUDENT',preview:false});
 assert.match(student.innerHTML,/class="vocab-shell vocab-shell--home"/);
 assert.doesNotMatch(student.innerHTML,/vocab-shell--staff-preview/);
 assert.match(student.innerHTML,/CHOOSE YOUR <span>UNIT<\/span>/);
 assert.match(student.innerHTML,/Pick a unit\. Build your skills\. Earn XP/);
 assert.match(student.innerHTML,/Welcome back,/);
});

test('default light hero declares readable dark ink for every meaningful text element',()=>{
 const css=read('vocabulary-hero-unified.css');
 const base='#vocabularyApp .vocab-shell--home > .vocab-hero--home ';
 for(const [selector,color] of [
  ['h1','color:#17395b;'],
  ['h1 span','color:#087d81;'],
  ['.vocab-home-hero__tagline','color:#244664;'],
  ['.vocab-home-hero__welcome','color:#315674;'],
  ['.vocab-home-hero__welcome strong','color:#825007;']
 ]){
  const at=css.indexOf(base+selector+'{');
  assert.ok(at>=0,'Missing hero rule for '+selector);
  assert.ok(css.slice(at,css.indexOf('}',at)).includes(color),'Wrong default ink for '+selector);
 }
 const welcome=css.indexOf(base+'.vocab-home-hero__welcome{');
 assert.ok(css.slice(welcome,css.indexOf('}',welcome)).includes('border-top:1px solid #bad6dc;'));
 const html=read('vocabulary.html');
 assert.match(html,/vocabulary-hero-unified\.css\?v=default-home-contrast-v3/);
});

test('dark equipped themes retain explicit light-ink overrides; preview remains isolated',()=>{
 const legacy=read('vocabulary-legacy-immersive.css');
 const neon=read('vocabulary-premium-neon-district.css');
 const celestial=read('vocabulary-premium-celestial-realms.css');
 const css=read('vocabulary-hero-unified.css');
 for(const theme of ['forest','ocean','sakura','midnight'])
  assert.ok(legacy.includes('#vocabularyApp.vocab-real-theme--'+theme+' .vocab-shell--home > .vocab-hero--home h1{'));
 assert.match(neon,/\.vocab-hero--home :is\(h1,h2,p,strong\)/);
 assert.match(celestial,/\.vocab-shell--home > \.vocab-hero--home :is\(h1,\.vocab-home-hero__tagline,\.vocab-home-hero__welcome\)/);
 assert.match(css,/vocab-shell--staff-preview/);
});
