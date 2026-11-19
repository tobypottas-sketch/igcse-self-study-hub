import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {findChromium,loadPlaywright} from './helpers/pathway-geometry-harness.mjs';
const playwright=loadPlaywright(),executablePath=await findChromium();
const root=fileURLToPath(new URL('../',import.meta.url));
const links=[...fs.readFileSync(path.join(root,'vocabulary.html'),'utf8').matchAll(/<link rel="stylesheet"[^>]+>/g)].map(m=>m[0]).join('');
async function open(t,width,dpr=width<600?2:1){
 let failOptimized=false,failOriginal=false;
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/fixture'){
   res.setHeader('Content-Type','text/html');res.setHeader('Cache-Control','no-store');
   res.end(`<html><head>${links}</head><body><main id="vocabularyApp"></main><script type="module">
    import {renderVocabularyHome,renderVocabularyUnit} from '/src/vocabulary/views.js';
    import {installGraphicsHandlers} from '/src/vocabulary/graphics-runtime.js';
    const root=document.querySelector('#vocabularyApp');installGraphicsHandlers(root);
    window.scene=n=>{if(n===0)renderVocabularyHome(root,{units:Array.from({length:8},(_,i)=>({unitNumber:i+1,unitTitle:'Synthetic unit '+(i+1)}))});else renderVocabularyUnit(root,{unitNumber:n,unitTitle:'Synthetic unit '+n});};
    window.scene(0);window.ready=true;</script></body></html>`);return;
  }
  if((failOptimized&&url.pathname.endsWith('.webp'))||(failOriginal&&/\/units\/.*\.png$/.test(url.pathname))){res.writeHead(404);res.end();return;}
  try{
   const file=path.join(root,decodeURI(url.pathname));if(!file.startsWith(path.resolve(root)+path.sep)){res.writeHead(403);res.end();return;}const body=fs.readFileSync(file);
   res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.webp')?'image/webp':'image/png');
   res.setHeader('Cache-Control','public,max-age=600');res.end(body);
  }catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await playwright.chromium.launch({executablePath,headless:true});
 t.after(async()=>{await browser.close();server.close();});
 const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:dpr});
 const page=await context.newPage(),cdp=await context.newCDPSession(page);await cdp.send('Network.enable');
 let bytes=0;const ids=new Set();cdp.on('Network.requestWillBeSent',e=>{if(/assets\/vocabulary\/(?:delivery\/)?(?:units|pathways)\//.test(e.request.url))ids.add(e.requestId);});
 cdp.on('Network.loadingFinished',e=>{if(ids.has(e.requestId))bytes+=e.encodedDataLength;});
 const url='http://127.0.0.1:'+server.address().port+'/fixture?fullart=1';
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ready);
 return {page,url,disableCache:()=>cdp.send('Network.setCacheDisabled',{cacheDisabled:true}),bytes:()=>bytes,reset:()=>{bytes=0;},fail:()=>{failOptimized=true;},failAll:()=>{failOptimized=true;failOriginal=true;}};
}
async function settled(page){
 for(const img of await page.locator('[data-art-png]').all())await img.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>[...document.querySelectorAll('[data-art-png]')].every(x=>x.complete&&x.naturalWidth>0));
 await page.evaluate(()=>Promise.all([...document.querySelectorAll('[data-art-png]')].map(x=>x.decode())));
}
for(const width of [1280,390])test('real artwork: Units 1–8, six pathways, cold/warm cache at '+width,{skip:!playwright||!executablePath},async t=>{
 const h=await open(t,width),{page}=h;await settled(page);
 assert.equal(await page.locator('[data-unit-art]').count(),8);
 const homeBytes=h.bytes();assert.ok(homeBytes<4000000,'home delivery must stay well below the 12.2 MB original payload');
 assert.ok(await page.locator('[data-art-png]').evaluateAll(images=>images.every(i=>i.currentSrc.endsWith('.webp'))));
 const geometry=await page.locator('[data-unit-art]').evaluateAll(xs=>xs.map(x=>({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height})));
 await page.screenshot({path:'/tmp/vocab-art-home-'+width+'.png',fullPage:true});
 h.reset();await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ready);await settled(page);
 assert.equal(h.bytes(),0,'warm cache must avoid artwork transfers');
 assert.deepEqual(await page.locator('[data-unit-art]').evaluateAll(xs=>xs.map(x=>({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height}))),geometry);
 for(let unit=1;unit<=8;unit++){
  await page.evaluate(n=>window.scene(n),unit);await settled(page);
  assert.equal(await page.locator('[data-pathway-art]').count(),6);
  assert.equal(await page.locator('[data-unit-hero-art] [data-art-png]').getAttribute('loading'),'eager');
  assert.equal(await page.locator('[data-unit-hero-art] [data-art-png]').getAttribute('fetchpriority'),'high');
  assert.equal(await page.locator('.is-png-ready [data-art-png]').count(),7);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no overflow');
 }
 await page.locator('[data-unit-hero-art]').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>[...document.querySelectorAll('[data-art-png]')].every(x=>Number(getComputedStyle(x).opacity)>.99));
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.locator('[data-unit-hero-art]').screenshot({path:'/tmp/vocab-art-hero-'+width+'.png'});
 await page.screenshot({path:'/tmp/vocab-art-unit-'+width+'.png',fullPage:true});
});
test('optimized failure falls back to original PNG before existing SVG fallback',{skip:!playwright||!executablePath},async t=>{
 const h=await open(t,1280);h.fail();await h.disableCache();await h.page.reload({waitUntil:'domcontentloaded'});await h.page.waitForFunction(()=>window.ready);await h.page.evaluate(()=>window.scene(1));
 await settled(h.page);
 const image=h.page.locator('[data-unit-hero-art] [data-art-png]');
 assert.equal(await image.count(),1,'original PNG must survive optimized-delivery failure');
 assert.match(await image.evaluate(x=>x.currentSrc),/unit-01\.png/);
 h.failAll();await h.page.reload({waitUntil:'domcontentloaded'});await h.page.waitForFunction(()=>window.ready);await h.page.evaluate(()=>window.scene(2));
 await h.page.waitForFunction(()=>!document.querySelector('[data-unit-hero-art] [data-art-png]'));
 assert.equal(await h.page.locator('[data-unit-hero-art] [data-art-png]').count(),0);
 assert.equal(await h.page.locator('[data-unit-hero-art] .study-art__svg').evaluate(x=>getComputedStyle(x).visibility),'visible');
});

test('high-DPR rendering retains original-resolution PNG selection',{skip:!playwright||!executablePath},async t=>{
 const h=await open(t,1280,4);await settled(h.page);
 await h.page.evaluate(()=>window.scene(1));await settled(h.page);
 assert.ok(await h.page.locator('[data-art-png]').evaluateAll(images=>images.every(i=>new URL(i.currentSrc).pathname.endsWith('.png'))));
});

test('a high-DPR original failure goes directly to SVG without a second runtime attempt',{skip:!playwright||!executablePath},async t=>{
 const h=await open(t,1280,4);await settled(h.page);await h.page.addInitScript(()=>{window.__imageErrors=[];document.addEventListener('error',e=>{if(e.target.matches?.('[data-art-png]'))window.__imageErrors.push({src:e.target.src,current:e.target.currentSrc,sources:e.target.closest('picture')?.querySelectorAll('source').length});},true);});h.failAll();await h.disableCache();h.reset();
 await h.page.reload({waitUntil:'domcontentloaded'});await h.page.waitForFunction(()=>window.ready);
 await h.page.waitForFunction(()=>!document.querySelector('[data-unit-art="1"] [data-art-png]'));
 assert.equal((await h.page.evaluate(()=>window.__imageErrors.filter(e=>e.src.includes('unit-01')))).length,1);
 assert.equal(await h.page.locator('[data-unit-art="1"] picture source').count(),1,'the original failure must bypass source fallback');
});
