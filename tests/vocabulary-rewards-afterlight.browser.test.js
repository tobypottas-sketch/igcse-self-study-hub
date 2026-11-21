import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {loadPlaywright,serve} from './helpers/pathway-geometry-harness.mjs';
import {PREMIUM_COLLECTIONS} from '../src/vocabulary/rewards-premium-registry.js';

const playwright=loadPlaywright();
const root=fileURLToPath(new URL('..',import.meta.url));
const rewards=PREMIUM_COLLECTIONS.find(item=>item.id==='afterlight').rewards.map(
  ([reward_id,category,name,xp_price])=>({reward_id,category,name,xp_price,description:name})
);
const profile={id:'afterlight-browser-test',role:'student',active:true,display_name:'Afterlight Test Student'};

for(const width of [1280,390]) test(`Afterlight shop and equipped profile at ${width}px`,{skip:!playwright},async t=>{
  const {server,origin}=await serve(root);
  t.after(()=>server.close());
  const browser=await playwright.chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
  t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width,height:880}});
  page.setDefaultTimeout(10000);
  const owned=[];
  let available=6200;
  await page.route('**/src/supabase.js',route=>route.fulfill({contentType:'text/javascript',body:`
    const client={
      auth:{getUser:async()=>({data:{user:${JSON.stringify(profile)}}})},
      from(name){
        const rows=name==='vocabulary_unit_occurrences'?[{
          occurrence_id:'o1',vocabulary_id:'v1',unit_number:1,unit_title:'Sports and Free Time',position_in_unit:1
        }]:[];
        const query=new Proxy({}, {get(_,key){
          if(key==='then')return resolve=>resolve({data:rows,count:0});
          if(key==='single'||key==='maybeSingle')return async()=>({data:name==='profiles'?${JSON.stringify(profile)}:null});
          return ()=>query;
        }}); return query;
      },
      rpc:async()=>({data:[]}),
      functions:{async invoke(name,{body}){
        const response=await fetch('/mock/'+name,{method:'POST',body:JSON.stringify(body)});
        return response.json();
      }}
    };
    export const getSupabaseClient=async()=>client;
  ` }));
  await page.route('**/mock/**',async route=>{
    const name=new URL(route.request().url()).pathname.split('/').at(-1);
    const {action,rewardId}=route.request().postDataJSON();
    let data={ok:false};
    if(name==='vocabulary-diagnostic')data={completed:true};
    if(name==='vocabulary-reward-wallet-sync')data={ok:true,synchronised:true};
    if(name==='vocabulary-reward-production'){
      const item=rewards.find(row=>row.reward_id===rewardId);
      if(action==='buy'){
        assert.ok(item&&available>=item.xp_price&&!owned.some(row=>row.reward_id===rewardId));
        owned.push({...item,equipped:false});
        available-=item.xp_price;
      }
      if(action==='equip'){
        const reward=owned.find(row=>row.reward_id===rewardId);
        assert.ok(reward);
        for(const row of owned) if(row.category===reward.category)row.equipped=row===reward;
      }
      data={ok:true,shopMode:'production',purchasesEnabled:true,walletStatus:'ready',wallet:{available},rewards,owned};
    }
    await route.fulfill({json:{data,error:null}});
  });
  const url=origin+'/vocabulary.html';
  await page.goto(url);
  await page.locator('[data-action="open-real-shop"]').click();
  const shop=page.locator('.vocab-shop-redesign');
  await shop.waitFor();
  for(const item of rewards){
    await shop.locator(`.vocab-reward-tab[data-category="${item.category}"]`).click();
    await shop.locator(`.vocab-reward-tab[data-category="${item.category}"][aria-pressed="true"]`).waitFor();
    assert.equal(await shop.locator('.vocab-rewards-grid .vocab-shop-card').count(),1);
    const card=shop.locator(`.vocab-shop-card[data-reward-id="${item.reward_id}"]`);
    const art=card.locator('.vocab-reward-picture > img');
    assert.ok(await art.evaluate(async img=>{await img.decode();return img.naturalWidth>0;}));
    assert.ok((await card.locator('.vocab-shop-price').innerText()).includes(item.xp_price.toLocaleString('en')));
    await card.getByRole('button',{name:'Buy'}).click();
    if(item.category!=='themes') await card.getByRole('button',{name:'Equip',exact:true}).click();
    await card.getByRole('button',{name:'Equipped',exact:true}).waitFor();
  }
  assert.equal(available,0);
  await page.locator('#vocabularyApp.vocab-real-theme--afterlight').waitFor();
  const demo=shop.locator('.vocab-effect-demo-stage[data-preview-effect="golden-sunrays"]');
  const toggle=shop.getByRole('button',{name:/Preview animation for Golden Sunrays/});
  await toggle.click();
  await demo.waitFor();
  const rays=demo.locator('.vocab-student-identity__effect');
  const dust=demo.locator('.vocab-cosmetic-particle').first();
  for(const [element,name] of [[rays,'vocab-sunrays-visible-art'],[dust,'vocab-sunrays-visible-dust']]){
    const sample=()=>element.evaluate(el=>[getComputedStyle(el).animationName,getComputedStyle(el).transform]);
    const before=await sample();
    assert.equal(before[0],name);
    await element.evaluate(el=>{el.getAnimations()[0].currentTime=3500;});
    assert.notEqual((await sample())[1],before[1]);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await rays.evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.equal(await dust.evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.equal(await demo.locator('.vocab-effect-preview__caption').count(),0);
  await shop.getByRole('button',{name:/Close animation preview for Golden Sunrays/}).click();
  await demo.waitFor({state:'hidden'});
  assert.ok(await shop.locator('[data-reward-id="golden-sunrays"] .vocab-reward-picture > img').isVisible());
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.reload();
  const identity=page.locator('.vocab-student-identity');
  await identity.waitFor();
  assert.match(await identity.innerText(),/5 \/ 5 equipped/);
  assert.doesNotMatch(await identity.locator('.vocab-student-identity__extras').innerText(),/The Pathfinder/);
  for(const file of ['survivor-frame','last-explorer-badge','the-pathfinder','golden-sunrays']){
    const img=identity.locator(`img[src$="/${file}.png"]`);
    assert.ok(await img.evaluate(async el=>{await el.decode();return el.naturalWidth>0;}));
  }
  assert.equal(await identity.locator('.vocab-student-identity__effect').evaluate(el=>getComputedStyle(el).animationName),'vocab-sunrays-visible-art');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByRole('button',{name:'View my progress →'}).waitFor();
  await page.locator('[data-action="open-my-progress"]').click();
  await page.locator('.vocab-journey-hero').waitFor();
  assert.match(await page.locator('.vocab-journey-hero').evaluate(el=>getComputedStyle(el).backgroundImage),/afterlight\.png/);
  await page.evaluate(async()=>{
    const {renderVocabularyUnit}=await import('/src/vocabulary/views.js');
    renderVocabularyUnit(document.querySelector('#vocabularyApp'),{
      unitNumber:1,unitTitle:'Sports and Free Time',
      progress:{mastered:0,total:50,needsAnotherLook:0,reviewDue:0,stages:{}}
    });
  });
  const pathway=page.locator('.vocab-pathway-card').first();
  assert.match(await pathway.evaluate(el=>getComputedStyle(el).backgroundImage),/rgb\(23, 29, 30\)/);
  assert.equal(await pathway.locator('.vocab-pathway-card__head strong').evaluate(el=>getComputedStyle(el).color),'rgb(246, 250, 255)');
  assert.match(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundImage),/sports-free-time-overview.*afterlight\.png/);
  await page.evaluate(async()=>{
    const {renderVocabularyQuestion}=await import('/src/vocabulary/views.js');
    renderVocabularyQuestion(document.querySelector('#vocabularyApp'),{
      unitNumber:1,unitTitle:'Sports and Free Time',term:'regular',sessionLabel:'1 / 10',
      question:{type:'drag_word_sentence',responseMode:'drag_gap',prompt:'Complete the sentence.',
        sourceText:'Students should stay ____ after school.',draggables:['active','compete'],
        markingReference:{acceptedAnswers:['active']}}
    });
  });
  assert.equal(await page.locator('.vocab-question-card').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(246, 244, 234)');
  assert.ok(await page.locator('.vocab-question-prompt').isVisible());
  assert.match(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundImage),/sports-free-time-wallpaper.*afterlight\.png/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
});
