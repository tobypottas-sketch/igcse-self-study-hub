import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderVocabularyHome} from '../src/vocabulary/views.js';

const css=readFileSync(new URL('../vocabulary-home-polish.css',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
const router=readFileSync(new URL('../src/vocabulary/router.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../vocabulary.html',import.meta.url),'utf8');

test('real student home shows full-width Battles CTA and two distinct sword SVGs',()=>{
  const root={innerHTML:''};
  renderVocabularyHome(root,{units:[],preview:false});
  const markup=root.innerHTML;
  assert.match(markup,/vocab-battles-entry__copy/);
  assert.match(markup,/vocab-battles-entry__title/);
  assert.match(markup,/vocab-battles-entry__description/);
  assert.match(markup,/vocab-battles-entry__cta[^"]*" href="\.\/vocabulary-battles\.html"/);
  assert.equal((markup.match(/class="vocab-battles-entry__sword /g)||[]).length,2);
  assert.match(markup,/vocab-battles-entry__sword--left/);
  assert.match(markup,/vocab-battles-entry__sword--right/);
  assert.match(markup,/vocab-battles-entry__spark/);
  assert.doesNotMatch(markup,/>⚔️<\/div>/);
});

test('teacher preview never gets Battles CTA',()=>{
  const root={innerHTML:''};
  renderVocabularyHome(root,{units:[],preview:true});
  assert.doesNotMatch(root.innerHTML,/vocab-battles-entry/);
});

test('banner stays entirely inside its home container with larger typography',()=>{
  assert.match(css,/\.vocab-shell--home > \.vocab-battles-entry\s*\{/);
  assert.match(css,/width:100%/);
  assert.match(css,/left:auto/);
  assert.match(css,/transform:none/);
  assert.doesNotMatch(css,/translateX\(-50%\)/);
  assert.doesNotMatch(css,/width:calc\(100vw - (?:76|36|20)px\)/);
  assert.match(css,/min-height:218px/);
  assert.match(css,/font-size:clamp\(2rem,2\.8vw,3\.15rem\)/);
  assert.match(css,/font-size:clamp\(1\.1rem,1\.5vw,1\.55rem\)/);
  assert.match(css,/\.vocab-battles-entry__cta/);
  assert.match(css,/@media\(max-width:620px\)/);
});

test('swords clash separately and spark, but respect reduced motion',()=>{
  for(const key of ['battles-clash-left','battles-clash-right','battles-clash-spark'])
    assert.match(css,new RegExp('@keyframes '+key));
  assert.match(css,/\.vocab-battles-entry__sword--left/);
  assert.match(css,/\.vocab-battles-entry__sword--right/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/animation:none!important/);
});

test('all browser links use the refreshed banner CSS and JS',()=>{
  assert.match(html,/vocabulary-home-polish\.css\?v=battles-banner-v2/);
  assert.match(html,/router\.js\?v=battles-banner-v2/);
  assert.match(router,/app\.js\?v=battles-banner-v2/);
  assert.match(app,/views\.js\?v=battles-banner-v2/);
});
