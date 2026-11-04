import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {findChromium,loadPlaywright} from './helpers/pathway-geometry-harness.mjs';
import {shippedGraphic,graphicPath} from '../src/vocabulary/graphics-registry.js';

const revision='seaside-snorkeling-20261104';
test('Unit 5 replacement uses a new image URL in the shared graphics registry',()=>{
  assert.equal(shippedGraphic('unit',5).src,`${graphicPath('unit',5)}?v=${revision}`);
  assert.equal(shippedGraphic('unit',3).src,`${graphicPath('unit',3)}?v=riverside-feast-20261104`);
  assert.equal(shippedGraphic('unit',2).src,graphicPath('unit',2),'other units keep their existing references');
});

const playwright=loadPlaywright();
const executablePath=await findChromium();
const browserTest=playwright&&executablePath?test:test.skip;
browserTest('Unit 5 hero and card bypass a cached old image using the actual browser HTTP cache',async()=>{
  const root=fileURLToPath(new URL('..',import.meta.url)).replace(/\/$/,'');
  const newImage=await readFile(new URL('../assets/vocabulary/units/unit-05.png',import.meta.url));
  // A tiny PNG with the old intrinsic width is sufficient: the cache behavior is independent of artwork pixels.
  const {deflateSync}=await import('node:zlib');
  const pngChunk=(name,data)=>{let crc=~0;const chunk=Buffer.concat([Buffer.from(name),data]);for(const byte of chunk){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}const out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);chunk.copy(out,4);out.writeUInt32BE(~crc>>>0,out.length-4);return out;};
  const header=Buffer.alloc(13);header.writeUInt32BE(1672);header.writeUInt32BE(1,4);header[8]=8;header[9]=2;
  const oldImage=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),pngChunk('IHDR',header),pngChunk('IDAT',deflateSync(Buffer.alloc(1672*3+1))),pngChunk('IEND',Buffer.alloc(0))]);
  let replaced=false;const imageRequests=[];
  const server=http.createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,'http://local');
      if(url.pathname==='/assets/vocabulary/units/unit-05.png'){
        imageRequests.push(url.search);res.writeHead(200,{'content-type':'image/png','cache-control':'max-age=600'}).end(replaced?newImage:oldImage);return;
      }
      if(url.pathname==='/prime.html'){res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'}).end('<img id="old" src="assets/vocabulary/units/unit-05.png">');return;}
      if(url.pathname==='/preview.html'){
        res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'}).end(`<div id="vocabularyApp"></div><script type="module">import {renderVocabularyUnit} from './src/vocabulary/views.js';renderVocabularyUnit(document.getElementById('vocabularyApp'),{unitNumber:5,unitTitle:'Holidays'});window.ready=true;</script>`);return;
      }
      const file=path.join(root,url.pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
      const bytes=await readFile(file);
      res.writeHead(200,{'content-type':file.endsWith('.js')?'text/javascript':'application/octet-stream','cache-control':'no-store'}).end(bytes);
    }catch{res.writeHead(404).end();}
  });
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await playwright.chromium.launch({executablePath});
  try{
    const page=await browser.newPage();
    // No page.route(): Playwright routing disables HTTP caching, which would hide the original bug.
    await page.goto(origin+'/prime.html');
    assert.equal(await page.locator('#old').evaluate(async img=>{await img.decode();return img.naturalWidth;}),1672);
    replaced=true;
    await page.goto(origin+'/preview.html');await page.waitForFunction(()=>window.ready);
    const hero=await page.locator('[data-unit-hero-art="5"] img').evaluate(async img=>{await img.decode();return {width:img.naturalWidth,src:img.getAttribute('src')};});
    assert.equal(hero.width,1200,'the hero must fetch the replacement instead of using the cached old PNG');
    assert.ok(hero.src.endsWith(`?v=${revision}`));
    await page.evaluate(async()=>{const {renderVocabularyHome}=await import('/src/vocabulary/views.js');renderVocabularyHome(document.getElementById('vocabularyApp'),{units:[{unitNumber:5,unitTitle:'Holidays',total:50,mastered:0}]});});
    assert.equal(await page.locator('[data-unit-art="5"] img').evaluate(async img=>{await img.decode();return img.naturalWidth;}),1200);
    assert.deepEqual(imageRequests,['',`?v=${revision}`],'one old cached URL and one new versioned request');
  }finally{await browser.close();await new Promise(done=>server.close(done));}
});
