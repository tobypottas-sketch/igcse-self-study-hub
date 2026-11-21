// Two-tier unit HUD: compact navigation + existing illustrated unit identity.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderVocabularyHome,renderVocabularyUnit} from '../src/vocabulary/views.js';
import {findChromium,loadPlaywright} from './helpers/pathway-geometry-harness.mjs';

const repo=fileURLToPath(new URL('..',import.meta.url));
const read=file=>fs.readFileSync(path.join(repo,file),'utf8');
const unitHtml=(unitNumber,unitTitle)=>{
 const root={innerHTML:''};
 renderVocabularyUnit(root,{unitNumber,unitTitle,progress:{mastered:3,total:50,needsAnotherLook:1,reviewDue:0,stages:{}},pathwayStates:{},contentReady:true});
 return root.innerHTML;
};
const homeHtml=()=>{
 const root={innerHTML:''};
 renderVocabularyHome(root,{displayName:'Amy',units:[{unitNumber:1,unitTitle:'Sports & Free Time',mastered:3,total:50}],soundOn:true});
 return root.innerHTML;
};
const unitNav=out=>out.match(/<header class="vocab-topbar vocab-topbar--unit vocab-study-nav"[\s\S]*?<\/header>/)?.[0];

test('unit navigation is compact, and unit identity exists exactly once in the illustrated hero',()=>{
 for(const [number,title] of [[1,'Sports & Free Time'],[7,'Travel and Tourism'],[12,'Global Citizenship, Sustainable Development and the Responsibilities of Young People']]){
  const out=unitHtml(number,title);
  const nav=unitNav(out);
  assert.ok(nav,'unit navigation exists');
  assert.match(nav,/vocab-study-nav__brand">Vocabulary Builder/);
  assert.doesNotMatch(nav,/vocab-unit-id|vocab-unit-id__title|vocab-unit-id__badge/);
  assert.doesNotMatch(nav,/class="vocab-student-identity-mini__title-art"/);
  const hero=out.match(/<section class="vocab-unit-hero[^"]*">[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero,'unit hero is the second tier');
  assert.ok(hero.includes('Unit '+number));
  assert.ok(hero.includes(title.replace(/&/g,'&amp;')));
  assert.match(hero,/Cambridge IGCSE ESL 0511/);
  assert.equal((hero.match(/<h1>/g)||[]).length,1);
 }
});

test('unit title is escaped and cannot be injected as markup',()=>{
 const out=unitHtml(2,'<img src=x onerror=alert(1)>');
 assert.doesNotMatch(out,/<img src=x/);
 assert.match(out,/&lt;img src=x onerror=alert\(1\)&gt;/);
});

test('back-units action and home navigation remain unchanged',()=>{
 const nav=unitNav(unitHtml(1,'Sports & Free Time'));
 assert.match(nav,/<button class="vocab-back vocab-back--chip" data-action="back-units"/);
 assert.match(nav,/>\s*<span class="vocab-back__arrow" aria-hidden="true">←<\/span> All units<\/button>/);
 assert.equal((nav.match(/data-action=/g)||[]).length,1);
 assert.match(homeHtml(),/<a href="\.\/" class="vocab-back vocab-back--chip">/);
 assert.match(read('src/vocabulary/app.js'),/action === 'back-units'\) showHome\(\)/);
});

test('home selection screen and learning content remain intact',()=>{
 const out=homeHtml();
 assert.match(out,/vocab-topbar vocab-topbar--home/);
 assert.match(out,/Choose a unit/);
 assert.match(out,/vocab-unit-grid/);
 assert.match(out,/vocab-coursebook/);
 assert.match(out,/data-action="open-unit" data-unit="1"/);
 const unit=unitHtml(5,'Holidays');
 assert.match(unit,/3 \/ 50 overall mastered/);
 assert.match(unit,/Choose a vocabulary pathway/);
});

test('unit HUD stylesheet is last and limits changes to the unit navigation',()=>{
 const html=read('vocabulary.html');
 assert.match(html,/vocabulary-study-two-tier-header\.css\?v=20261121-study-hud-v1/);
 assert.ok(html.indexOf('vocabulary-study-two-tier-header.css')>html.indexOf('vocabulary-premium-afterlight.css'));
 assert.ok(html.indexOf('vocabulary-study-two-tier-header.css')>html.indexOf('vocabulary-header-theme-legibility.css'));
 const css=read('vocabulary-study-two-tier-header.css');
 assert.match(css,/\.vocab-topbar\.vocab-topbar--unit\.vocab-study-nav/);
 assert.match(css,/\.vocab-study-nav \+ \.vocab-unit-hero/);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(read('src/vocabulary/rewards-equipped-home.js'),/compactStudy=header\.classList\.contains\('vocab-topbar--unit'\)/);
 assert.match(read('src/vocabulary/rewards-equipped-home.js'),/vocab-student-identity-mini__title-art/);
 assert.match(read('src/vocabulary/views.js'),/<header class="vocab-topbar">/);
});

const browserTest=loadPlaywright()&&await findChromium()?test:test.skip;
browserTest('unit HUD fits desktop and narrow screens without navigation overlap',async()=>{
 const playwright=loadPlaywright();
 const browser=await playwright.chromium.launch({executablePath:await findChromium()});
 try{
  const css=[...read('vocabulary.html').matchAll(/href="([^"?]+\.css)(?:\?[^"]*)?"/g)].map(m=>'<style>'+read(m[1])+'</style>').join('');
  for(const [width,height] of [[1440,900],[820,1100],[390,844],[320,640]]){
   const page=await browser.newPage({viewport:{width,height}});
   await page.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">'+css+'</head><body><div id="vocabularyApp">'+unitHtml(12,'Global Citizenship, Sustainable Development and the Responsibilities of Young People')+'</div></body></html>');
   const metrics=await page.evaluate(()=>{
    const nav=document.querySelector('.vocab-study-nav');
    const back=nav.querySelector('.vocab-back');
    const hero=document.querySelector('.vocab-unit-hero');
    const b=back.getBoundingClientRect(),n=nav.getBoundingClientRect(),h=hero.getBoundingClientRect();
    return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,backH:b.height,navH:n.height,heroNext:h.top>=n.bottom-1,title:hero.querySelector('h1')?.textContent};
   });
   assert.ok(metrics.overflow<=0,'horizontal overflow at '+width);
   assert.ok(metrics.backH>=44,'back tap target at '+width);
   assert.ok(metrics.navH<=110,'nav is compact at '+width);
   assert.equal(metrics.heroNext,true,'unit identity below nav at '+width);
   assert.match(metrics.title,/Global Citizenship/);
   await page.close();
  }
 }finally{await browser.close()}
});
