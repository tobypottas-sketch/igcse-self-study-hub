import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright')}catch{}
const root=path.resolve(import.meta.dirname,'..');
const links=[...fs.readFileSync(path.join(root,'vocabulary.html'),'utf8').matchAll(/<link rel="stylesheet"[^>]+>/g)].map(m=>m[0]).join('');

for(const width of [1280,820,390])test('compact identity: actual artwork, names and equipment at '+width,{skip:!pw},async t=>{
 const missing=[];
 const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://localhost').pathname;
  if(p==='/favicon.ico'){res.writeHead(204);return res.end();}
  if(p==='/fixture'){
   res.setHeader('Content-Type','text/html');
   return res.end('<!doctype html><html><head>'+links+'</head><body><main id="vocabularyApp"><section class="vocab-shell vocab-shell--home"><div class="vocab-unit-grid"></div></section></main></body></html>');
  }
  try{
   const file=path.resolve(root,'.'+decodeURI(p));
   if(!file.startsWith(root+path.sep))throw Error('outside fixture');
   const body=fs.readFileSync(file);
   res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.png')?'image/png':'image/svg+xml');res.end(body);
  }catch{missing.push(p);res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await pw.chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
 t.after(async()=>{await browser.close();await new Promise(resolve=>server.close(resolve));});
 const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:'+server.address().port+'/fixture');
 const cdp=await page.context().newCDPSession(page);
 const cases=[
  {name:'TEST STUDENT',mode:'sandbox',count:4},
  {name:'Alexandra Montgomery-Synthetic',mode:'production',count:4},
  {name:'Li',mode:'production',count:0},
  {name:'A'.repeat(65),mode:'sandbox',count:4},
  {name:'Synthetic Student',mode:'production',count:1}
 ];
 for(const [index,scenario] of cases.entries()){
  await page.evaluate(async({name,mode,count})=>{
   const {renderEquippedCosmetics}=await import('/src/vocabulary/rewards-equipped-home.js');
   const rewards=[['forest','themes'],['gold-frame','frames'],['word-explorer','titles'],['sparkle','effects']].map(([reward_id,category])=>({reward_id,category,name:reward_id==='word-explorer'?'Word Explorer':reward_id}));
   const owned=(count===1?rewards.filter(x=>x.category==='titles'):rewards.slice(0,count)).map(x=>({...x,equipped:true}));
   const state={shopMode:mode,sandboxEnabled:mode==='sandbox',rewards,owned};
   window.__identityInput=JSON.stringify(state);
   renderEquippedCosmetics(document.querySelector('#vocabularyApp'),state,name);
   if(JSON.stringify(state)!==window.__identityInput)throw Error('Rendering mutated inventory');
   const card=sandbox=>`<section class="vocab-rewards-preview-entry vocab-rewards-home-card vocab-rewards-home-card--${sandbox?'sandbox':'real'}"><img class="vocab-rewards-home-card__art" src="assets/vocabulary/rewards/${sandbox?'pixel-badge':'word-explorer'}.png" alt=""><div class="vocab-rewards-home-card__body"><span class="vocab-rewards-home-card__eyebrow">${sandbox?'TEST ACCOUNT ONLY':'YOUR REWARDS'}</span><strong>${sandbox?'Sandbox shop':'XP Rewards Shop'}</strong><small>${sandbox?'92,150 test XP':'320 XP ready to spend · Learning XP stays yours'}</small>${sandbox?'<span class="vocab-rewards-home-card__test-note">No real XP spent</span>':''}</div><button>${sandbox?'Open test shop':'Explore shop'}</button></section>`;
   document.querySelector('.vocab-rewards-home-card--real')?.remove();
   document.querySelector('[data-rewards-dashboard-main]').insertAdjacentHTML('beforeend',card(false));
   document.querySelector('[data-rewards-dashboard-side]').innerHTML=mode==='sandbox'?card(true):'';
  },scenario);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode()));});
  const m=await page.evaluate(()=>{
   const box=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};
   const profile=document.querySelector('.vocab-student-identity'),name=profile.querySelector('h2');
   return{profile:box(profile),name:box(name),line:parseFloat(getComputedStyle(name).lineHeight),nameOverflow:name.scrollWidth>name.clientWidth+1,
    pageOverflow:document.documentElement.scrollWidth>innerWidth,
    art:[...profile.querySelectorAll('img')].map(x=>({...box(x),loaded:x.naturalWidth>0})),
    title:profile.querySelector('.vocab-student-identity__title-art img')?.getBoundingClientRect().width,
    real:box(document.querySelector('.vocab-rewards-home-card--real')),
    sandbox:document.querySelector('.vocab-rewards-home-card--sandbox')?box(document.querySelector('.vocab-rewards-home-card--sandbox')):null};
  });
  if(index===0){
   await page.screenshot({path:'/tmp/identity-'+(process.env.REWARDS_BEFORE?'before':'after')+'-'+width+'.png',fullPage:true});
   console.log(JSON.stringify({width,profileHeight:m.profile.h,titleWidth:m.title,phase:process.env.REWARDS_BEFORE?'before':'after'}));
  }
  assert.ok(!m.pageOverflow&&!m.nameOverflow,'names must remain visible without horizontal scrolling');
  assert.equal(await page.locator('.vocab-student-identity__stamp > [aria-hidden="true"]').innerText(),scenario.count+' / 4 equipped');
  assert.equal(await page.locator('.vocab-student-identity__slot').count(),0,'one concise count replaces four category pills');
  assert.ok(await page.locator('.vocab-student-identity__stamp .vocab-sr-only').evaluate(x=>x.getBoundingClientRect().width<=1),'screen-reader details stay visually hidden');
  const ax=await cdp.send('Accessibility.getFullAXTree');
  const summaryPrefix=scenario.count+' / 4 '+(scenario.mode==='sandbox'?'test equipped':'equipped')+':';
  assert.ok(ax.nodes.some(n=>n.role?.value==='StaticText'&&n.name?.value.startsWith(summaryPrefix)),'equipment details must be readable text in the accessibility tree');
  assert.ok(m.profile.h<=(width===390?(index===3?280:220):170),'compact natural-height profile');
  assert.ok(m.real.y>=m.profile.y+m.profile.h,'real shop stays below profile');
  if(m.sandbox){
   if(width>760){assert.ok(m.real.x+m.real.w<=m.sandbox.x);assert.ok(Math.abs(m.real.y-m.sandbox.y)<2);}
   else assert.ok(m.sandbox.y>=m.real.y+m.real.h);
  }
  if(width===1280&&index<2)assert.ok(m.name.h<m.line*1.5,'ordinary desktop names use one line');
  if(m.title)assert.ok(m.title<=145,'title illustration is reduced by at least 30%');
  for(const a of m.art){assert.ok(a.loaded);assert.ok(a.x>=m.profile.x&&a.x+a.w<=m.profile.x+m.profile.w&&a.y>=m.profile.y&&a.y+a.h<=m.profile.y+m.profile.h,'all artwork layers fit inside card');}
  if(index===0)assert.equal(await page.locator('.vocab-student-identity__avatar').evaluate(x=>getComputedStyle(x).animationName),'none');
  if(scenario.mode==='sandbox')assert.equal(await page.locator('.vocab-student-identity__eyebrow').innerText(),'Preview');
 }
 assert.deepEqual(missing,[],'all real styles and artwork must load locally');

});
