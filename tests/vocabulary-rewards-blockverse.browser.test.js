import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {loadPlaywright,serve} from './helpers/pathway-geometry-harness.mjs';
import {PREMIUM_COLLECTIONS} from '../src/vocabulary/rewards-premium-registry.js';

const playwright=loadPlaywright();
const root=fileURLToPath(new URL('..',import.meta.url));
const rewards=PREMIUM_COLLECTIONS.find(item=>item.id==='blockverse').rewards.map(
  ([reward_id,category,name,xp_price])=>({reward_id,category,name,xp_price,description:name})
);
const profile={id:'blockverse-browser-test',role:'student',active:true,display_name:'Blockverse Test Student'};

for(const width of [1280,390]) test(`Blockverse shop and equipped profile at ${width}px`,{skip:!playwright},async t=>{
  const {server,origin}=await serve(root);
  t.after(()=>server.close());
  const browser=await playwright.chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
  t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width,height:880}});
  page.setDefaultTimeout(10000);
  const owned=[];
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{
    if(response.url().startsWith(origin+'/assets/')&&response.status()>=400)errors.push(response.url());
  });
  let available=5600;
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
    const {action,rewardId,category}=route.request().postDataJSON();
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
      if(action==='unequip')for(const row of owned)if(row.category===category)row.equipped=false;
      data={ok:true,shopMode:'production',purchasesEnabled:true,walletStatus:'ready',wallet:{available},rewards,owned};
    }
    await route.fulfill({json:{data,error:null}});
  });
  const url=origin+'/vocabulary.html';
  await page.goto(url);
  await page.locator('[data-action="open-real-shop"]').click();
  const shop=page.locator('.vocab-shop-redesign');
  await shop.waitFor();
  assert.equal(await shop.locator('.vocab-shop-blockverse .vocab-shop-card').count(),5);
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
  await page.locator('#vocabularyApp.vocab-real-theme--blockverse').waitFor();
  assert.equal(await shop.locator('.vocab-shop-hero').evaluate(el=>getComputedStyle(el).backgroundImage.includes('blockverse.png')),true);
  const demo=shop.locator('.vocab-effect-demo-stage[data-preview-effect="pixel-burst"]');
  await shop.getByRole('button',{name:/Preview animation for Pixel Burst/}).click();
  await demo.waitFor();
  const pixel=demo.locator('.vocab-cosmetic-particle').first();
  const frames=await pixel.evaluate(el=>{
    const animation=el.getAnimations()[0];
    animation.pause();
    return [130,660].map(time=>{
      animation.currentTime=time;
      const style=getComputedStyle(el);
      return [style.animationName,style.transform];
    });
  });
  assert.equal(frames[0][0],'vocab-pixel-burst');
  assert.notEqual(frames[0][1],frames[1][1]);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await pixel.evaluate(el=>getComputedStyle(el).animationName),'none');
  await shop.getByRole('button',{name:/Close animation preview for Pixel Burst/}).click();
  await demo.waitFor({state:'hidden'});
  await page.emulateMedia({reducedMotion:'no-preference'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.reload();
  const identity=page.locator('.vocab-student-identity');
  await identity.getByText('5 / 5 equipped',{exact:true}).waitFor();
  const title=identity.locator('h2 + .vocab-student-identity__title-art img');
  assert.equal(await title.getAttribute('alt'),'Master Builder title artwork');
  assert.ok((await title.boundingBox()).width>=140);
  for(const id of ['voxel-master-frame','diamond-block-badge','master-builder','pixel-burst']){
    const image=identity.locator(`img[src$="/${id}.png"]`);
    assert.ok(await image.evaluate(async img=>{await img.decode();return img.naturalWidth>0;}));
  }
  assert.equal(await identity.locator('.vocab-student-identity__frame').evaluate(el=>getComputedStyle(el).objectFit),'contain');
  assert.equal(await identity.locator('.vocab-cosmetic-particle').first().evaluate(el=>getComputedStyle(el).animationName),'vocab-pixel-burst');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const checkWorkspace=await page.evaluate(async()=>{
    const {renderVocabularyUnit,renderVocabularyQuestion}=await import('/src/vocabulary/views.js');
    const root=document.querySelector('#vocabularyApp');
    renderVocabularyUnit(root,{unitNumber:1,unitTitle:'Sports and Free Time',
      progress:{mastered:0,total:50,needsAnotherLook:0,reviewDue:0,stages:{}}});
    const pathway=getComputedStyle(root.querySelector('.vocab-pathway-card')).backgroundImage;
    renderVocabularyQuestion(root,{unitNumber:1,unitTitle:'Sports and Free Time',term:'regular',sessionLabel:'1 / 10',
      question:{type:'drag_word_sentence',responseMode:'drag_gap',prompt:'Complete the sentence.',
        sourceText:'Students should stay ____ after school.',draggables:['active','compete'],
        markingReference:{acceptedAnswers:['active']}}});
    return {pathway,activity:getComputedStyle(root.querySelector('.vocab-question-card')).backgroundColor,
      backdrop:getComputedStyle(document.body).backgroundImage};
  });
  assert.match(checkWorkspace.pathway,/rgb\(37, 55, 51\)/);
  assert.match(checkWorkspace.backdrop,/blockverse\.png/);
  assert.equal(checkWorkspace.activity,'rgb(245, 248, 239)');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.reload();
  await page.locator('[data-action="open-real-shop"]').click();
  for(const item of rewards){
    await shop.locator(`[data-action="real-unequip"][data-category="${item.category}"]`).click();
    await shop.locator(`[data-action="real-unequip"][data-category="${item.category}"]`).waitFor({state:'detached'});
  }
  assert.equal(await shop.getAttribute('data-equipped-theme'),'');
  assert.equal(await page.locator('#vocabularyApp.vocab-real-theme--blockverse').count(),0);
  await page.reload();
  await page.locator('[data-action="open-real-shop"]').click();
  await shop.locator('.vocab-reward-tab[data-category="all"]').click();
  await shop.locator('.vocab-shop-blockverse [data-action="real-equip"]').first().waitFor();
  assert.equal(await shop.locator('.vocab-shop-blockverse [data-action="real-equip"]').count(),5);
  assert.equal(available,0);
  assert.deepEqual(errors,[]);
});
