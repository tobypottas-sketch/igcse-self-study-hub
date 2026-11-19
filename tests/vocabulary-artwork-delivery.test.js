import test from 'node:test';import assert from 'node:assert/strict';
import * as graphics from '../src/vocabulary/graphics-registry.js';
test('display-sized delivery retains original PNG fallback and matches the cropped home tile resolution',()=>{
 assert.equal(typeof graphics.graphicDelivery,'function','display-sized delivery is missing');
 const delivery=graphics.graphicDelivery('unit',1);
 assert.match(delivery.src,/units\/unit-01\.png/);assert.match(delivery.srcset,/\.webp 960w/);assert.match(delivery.srcset,/unit-01\.png.*\d+w/);
 assert.match(delivery.sizes,/300px, 400px/ ,'panoramic source must supply enough pixels for the square cover crop');
 assert.match(graphics.graphicDelivery('unit',1,{hero:true}).sizes,/440px/);
 assert.match(graphics.graphicDelivery('pathway','meaning').srcset,/\.webp 512w/);
 assert.equal(graphics.graphicDelivery('unit',99),null);
});

test('generated candidates are smaller, lossless WebP containers and match unchanged originals',async()=>{
 const {GRAPHIC_DELIVERY}=await import('../src/vocabulary/graphics-delivery.js');
 const {readFileSync}=await import('node:fs');const {createHash}=await import('node:crypto');
 for(const [name,entry] of Object.entries(GRAPHIC_DELIVERY)){
  const original=readFileSync(new URL('../assets/vocabulary/'+name,import.meta.url));
  assert.equal(createHash('sha256').update(original).digest('hex'),entry.sourceHash,'regenerate derivatives after an original changes');
  for(const variant of entry.variants){
   const bytes=readFileSync(new URL('../'+variant.src,import.meta.url));
   assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
   assert.ok(bytes.includes(Buffer.from('VP8L')),'lossless WebP must be used');
   assert.ok(bytes.length<original.length,'optimized candidate must save bytes');
  }
 }
});

test('only first visible home cards are eager; hero is high priority; later cards remain lazy',async()=>{
 const {renderVocabularyHome,renderVocabularyUnit}=await import('../src/vocabulary/views.js');
 const root={innerHTML:''};renderVocabularyHome(root,{units:Array.from({length:8},(_,i)=>({unitNumber:i+1,unitTitle:'Synthetic unit '+(i+1)}))});
 const images=root.innerHTML.match(/<img[^>]*data-art-png[^>]*>/g);
 assert.equal(images.filter(x=>x.includes('loading="eager"')).length,2);
 assert.equal(images.filter(x=>x.includes('loading="lazy"')).length,6);
 renderVocabularyUnit(root,{unitNumber:1,unitTitle:'Synthetic unit'});
 assert.match(root.innerHTML,/<img[^>]*data-art-png[^>]*fetchpriority="high"/);
});

// Optional tooling matches the repo's browser-test convention; run locally with
// pinned sharp available through NODE_PATH to verify the generated pixel data.
const {createRequire}=await import('node:module');
let sharp;try{sharp=createRequire(import.meta.url)('sharp');}catch{}
test('lossless candidates preserve every visible pixel of the resized original',{skip:!sharp},async()=>{
 const {GRAPHIC_DELIVERY}=await import('../src/vocabulary/graphics-delivery.js');
 const {fileURLToPath}=await import('node:url');
 for(const [name,entry] of Object.entries(GRAPHIC_DELIVERY))for(const variant of entry.variants){
  const original=fileURLToPath(new URL('../assets/vocabulary/'+name,import.meta.url));
  const candidate=fileURLToPath(new URL('../'+variant.src,import.meta.url));
  const expected=await sharp(original).resize({width:variant.width,withoutEnlargement:true}).ensureAlpha().raw().toBuffer();
  const actual=await sharp(candidate).ensureAlpha().raw().toBuffer();
  assert.equal(actual.length,expected.length);
  for(let i=0;i<expected.length;i+=4){
   assert.equal(actual[i+3],expected[i+3],variant.src+' alpha');
   if(expected[i+3])for(let channel=0;channel<3;channel++)assert.equal(actual[i+channel],expected[i+channel],variant.src+' visible pixel');
  }
 }
});
