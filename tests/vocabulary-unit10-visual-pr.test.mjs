// Live Chromium verification for Unit 10 on a PR branch, no deployment or student login.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root=fileURLToPath(new URL('../',import.meta.url));
const screenshots=process.env.UNIT10_SHOTS_DIR??path.join(os.tmpdir(),'unit10-visual');
fs.mkdirSync(screenshots,{recursive:true});
const css=[...fs.readFileSync(path.join(root,'vocabulary.html'),'utf8').matchAll(/<link rel="stylesheet"[^>]+>/g)].map(x=>x[0]).join('');
const types={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.html':'text/html'};
const fixture=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${css}</head>
<body><div id="vocabularyApp"></div><script type="module">
import {renderVocabularyHome,renderVocabularyUnit} from '/src/vocabulary/views.js';
import {installGraphicsHandlers} from '/src/vocabulary/graphics-runtime.js';
const root=document.getElementById('vocabularyApp');
installGraphicsHandlers(root);
window.renderUnit10=(scene)=>{
  if(scene==='home'){
    renderVocabularyHome(root,{displayName:'Test Student',units:[
      {unitNumber:8,unitTitle:'Work',total:50,mastered:0},
      {unitNumber:9,unitTitle:'Communication',total:50,mastered:0},
      {unitNumber:10,unitTitle:'Education',total:48,mastered:0}
    ],soundOn:false,preview:false});
  } else {
    renderVocabularyUnit(root,{unitNumber:10,unitTitle:'Education',
      progress:{mastered:0,total:48,needsAnotherLook:0,reviewDue:0,stages:{}},
      pathwayStates:Object.fromEntries(['meaning','context','word_families','paraphrasing','precision_use','spelling_recall']
         .map(id=>[id,{available:true,totalCount:id==='word_families'?20:40,coverageCount:0}])),
      contentReady:true});
  }
};
window.renderUnit10('overview');window.fixtureReady=true;
</script></body></html>`;
function serve(){
 const server=http.createServer((req,res)=>{
   const pathname=new URL(req.url,'http://localhost').pathname;
   if(pathname==='/fixture'){res.writeHead(200,{'Content-Type':'text/html'}).end(fixture);return;}
   const target=path.resolve(root,'.'+decodeURI(pathname));
   if(!target.startsWith(path.resolve(root)+path.sep)){res.writeHead(403).end();return;}
   try{res.writeHead(200,{'Content-Type':types[path.extname(target)]??'application/octet-stream'}).end(fs.readFileSync(target));}
   catch{res.writeHead(404).end();}
 });
 return new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve({server,origin:`http://127.0.0.1:${server.address().port}`})));
}
const bounds=page=>page.evaluate(()=>{
 const rect=selector=>{
  const el=document.querySelector(selector);
  if(!el)return null;
  const r=el.getBoundingClientRect();
  const s=getComputedStyle(el);
  return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,
   overflow:s.overflow,whiteSpace:s.whiteSpace,text:el.textContent?.trim().slice(0,110)};
 };
 return {
  viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
  shell:rect('.vocab-shell'),hero:rect('.vocab-unit-hero'),
  heroArt:rect('[data-unit-hero-art]'),heroImage:rect('[data-unit-hero-art] img[data-art-png]'),
  heading:rect('.vocab-unit-hero h1'),pathways:[...document.querySelectorAll('.vocab-pathway-card')].map(el=>{
    const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height};
  }),
  artReady:document.querySelector('[data-unit-hero-art]')?.classList.contains('is-png-ready')??false,
  artworkVisible:(()=>{const img=document.querySelector('[data-unit-hero-art] img[data-art-png]');return Boolean(img&&img.complete&&img.naturalWidth>0&&getComputedStyle(img).opacity==='1')})(),
  theme:document.querySelector('.vocab-shell')?.getAttribute('data-unit-overview')
 };
});
for(const width of [1440,390]){
 test(`Unit 10 overview and home at ${width}px: real artwork, title and six pathways remain visible`,async()=>{
   const {server,origin}=await serve();
   const browser=await chromium.launch({headless:true});
   try{
     const page=await browser.newPage({viewport:{width,height:width===390?844:900},deviceScaleFactor:1});
     const errors=[];page.on('pageerror',e=>errors.push(e.message));
     await page.goto(origin+'/fixture',{waitUntil:'domcontentloaded'});
     await page.waitForFunction(()=>window.fixtureReady);
     await page.waitForFunction(()=>document.querySelector('[data-unit-hero-art]')?.classList.contains('is-png-ready'),{timeout:30000});
     await page.evaluate(()=>Promise.all([...document.images].map(img=>img.decode().catch(()=>{}))));
     await page.waitForTimeout(350);
     const overview=await bounds(page);
     console.log('Unit 10 overview '+width+'px:',JSON.stringify(overview));
     assert.equal(overview.theme,'education');
     assert.ok(overview.artReady&&overview.artworkVisible,'Real Education PNG must load visibly');
     assert.ok(overview.hero&&overview.heading&&overview.heroArt,'Hero, title and artwork exist');
     assert.equal(overview.pathways.length,6);
     assert.ok(overview.scrollWidth<=width+2,`Horizontal overflow ${overview.scrollWidth} on ${width}px viewport`);
     assert.ok(overview.heroArt.left>=-2&&overview.heroArt.right<=width+2,'Artwork stays within viewport');
     assert.ok(overview.heading.left>=-2&&overview.heading.right<=width+2,'Education title within viewport');
     assert.ok(overview.heroImage.width>=80&&overview.heroImage.height>=80,'Artwork actually has visible size');
     await page.screenshot({path:path.join(screenshots,`unit10-overview-${width}.png`),fullPage:true});
     await page.evaluate(()=>window.renderUnit10('home'));
     await page.waitForFunction(()=>document.querySelector('[data-unit-art="10"]')?.classList.contains('is-png-ready'),{timeout:30000});
     await page.waitForTimeout(250);
     const home=await page.evaluate(()=>{
       const el=document.querySelector('.vocab-unit-card[data-unit="10"]');
       const h=el?.querySelector('.vocab-unit-card__title');
       const a=el?.querySelector('[data-unit-art="10"]');
       const r=el?.getBoundingClientRect(),text=h?.getBoundingClientRect();
       return {exists:!!el,card:{left:r?.left,right:r?.right,width:r?.width},
         title:h?.textContent,overflow:h?.scrollHeight>h?.clientHeight+2||h?.scrollWidth>h?.clientWidth+2,
         artReady:a?.classList.contains('is-png-ready'),scrollWidth:document.documentElement.scrollWidth};
     });
     console.log('Unit 10 home '+width+'px:',JSON.stringify(home));
     assert.ok(home.exists&&home.artReady,'Unit 10 home card must display its PNG');
     assert.equal(home.title,'Education');
     assert.equal(home.overflow,false,'Unit 10 title must not clip or overflow');
     assert.ok(home.scrollWidth<=width+2,'Home must not scroll horizontally');
     assert.deepEqual(errors,[],'No browser JS errors');
     await page.screenshot({path:path.join(screenshots,`unit10-home-${width}.png`),fullPage:true});
   }finally{await browser.close();server.close();}
 });
}
