import test from 'node:test';
import assert from 'node:assert/strict';
import {renderVocabularyHome,renderVocabularyUnit} from '../src/vocabulary/views.js';
const render=(fn)=>{const target={innerHTML:''};fn(target);return target.innerHTML};
const home=()=>render(root=>renderVocabularyHome(root,{displayName:'Student',units:[{unitNumber:1,unitTitle:'Sports and Free Time',mastered:0,total:50},{unitNumber:7,unitTitle:'Interviews',mastered:0,total:50}]}));
const unit=()=>render(root=>renderVocabularyUnit(root,{unitNumber:1,unitTitle:'Sports and Free Time',progress:{mastered:0,total:50,needsAnotherLook:0,reviewDue:0,stages:{}},pathwayStates:{},contentReady:true}));
test('explicit lightart=1 keeps the old SVG-first classroom fallback available',()=>{
 const old=globalThis.window;
 try{
  globalThis.window={location:{search:'?lightart=1'}};
  const h=home(),u=unit();
  assert.doesNotMatch(h,/class="study-art__png"/);
  assert.doesNotMatch(u,/assets\/vocabulary\/pathways\/.*?\.png/);
  assert.match(h,/<svg/);
  assert.match(u,/data-action="open-pathway"/);
  assert.match(u,/units\/unit-01\.png/); // only one selected-unit hero image is requested
 }finally{if(old===undefined)delete globalThis.window;else globalThis.window=old}
});
test('original full-artwork experience remains accessible with explicit fullart=1',()=>{
 const old=globalThis.window;
 try{
  globalThis.window={location:{search:'?fullart=1'}};
  assert.match(home(),/unit-01\.png/);
  assert.match(unit(),/assets\/vocabulary\/pathways\/meaning\.png/);
 }finally{if(old===undefined)delete globalThis.window;else globalThis.window=old}
});

test('normal student view loads optimized PNGs for home cards and all six pathways',()=>{
 const old=globalThis.window;
 try{
  globalThis.window={location:{search:''}};
  const h=home(),u=unit();
  assert.match(h,/class="study-art__png" data-art-png/);
  assert.match(h,/data-art-delivery/);
  assert.match(h,/delivery\\/units\\/unit-01\\./);
  for(const pathway of ['meaning','context','word-families','paraphrasing','precision-use','spelling-recall']){
   assert.match(u,new RegExp('delivery/pathways/'+pathway+'\\\\.'));
  }
  assert.match(u,/data-action="open-pathway"/);
 }finally{if(old===undefined)delete globalThis.window;else globalThis.window=old}
});
test('fullart=1 overrides lightart=1 for support and legacy preview URLs',()=>{
 const old=globalThis.window;
 try{
  globalThis.window={location:{search:'?lightart=1&fullart=1'}};
  assert.match(home(),/data-art-png/);
  assert.match(unit(),/assets\\/vocabulary\\/pathways\\/meaning\\.png/);
 }finally{if(old===undefined)delete globalThis.window;else globalThis.window=old}
});
