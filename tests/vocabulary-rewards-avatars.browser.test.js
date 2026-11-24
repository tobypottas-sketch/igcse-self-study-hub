import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadPlaywright,serve} from './helpers/pathway-geometry-harness.mjs';
import {PREMIUM_COLLECTIONS} from '../src/vocabulary/rewards-premium-registry.js';

const playwright=loadPlaywright();
const root=fileURLToPath(new URL('..',import.meta.url));
const cosmetics=PREMIUM_COLLECTIONS.find(item=>item.id==='blockverse').rewards.map(
  ([reward_id,category,name,xp_price])=>({reward_id,category,name,xp_price,description:name})
);
const rewards=[...cosmetics,
  {reward_id:'avatar-pixel-bot',category:'avatars',name:'Pixel Bot',xp_price:0,description:'Starter'},
  {reward_id:'avatar-voxel-architect',category:'avatars',name:'Voxel Architect',xp_price:1200,description:'Blockverse'}
];
const profile={id:'blockverse-browser-test',role:'student',active:true,display_name:'Blockverse Test Student'};

for(const width of [1440,768,390]) test(`Player avatar shop and persistence at ${width}px`,{skip:!playwright},async t=>{
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
  let available=0;
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
    if(name==='vocabulary-practice-leaderboard')data={ok:true,rows:[{rank:1,name:'Test Classmate',xp:100,avatarId:'avatar-shadow-fox'}]};
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
  const tab=shop.locator('.vocab-reward-tab[data-category="avatars"]');
  await tab.click();
  const starter=shop.locator('[data-reward-id="avatar-pixel-bot"].vocab-shop-card');
  const premium=shop.locator('[data-reward-id="avatar-voxel-architect"].vocab-shop-card');
  assert.match(await starter.innerText(),/Free/);
  assert.match(await premium.innerText(),/1,200 XP to unlock/);
  await starter.getByRole('button',{name:'Claim',exact:true}).click();
  await starter.getByRole('button',{name:'Equip',exact:true}).click();
  await starter.getByRole('button',{name:'Equipped',exact:true}).waitFor();
  assert.equal(available,0);
  const mini=shop.locator('.vocab-topbar img.vocab-avatar-character');
  await mini.waitFor();
  assert.match(await mini.getAttribute('src'),/avatar-pixel-bot.webp$/);
  available=10000;
  await page.reload();
  await page.locator('[data-action="open-real-shop"]').click();

  for (const item of [...cosmetics,rewards.at(-1)]) {
    await shop.locator(`.vocab-reward-tab[data-category="${item.category}"]`).click();
    const card=shop.locator(`[data-reward-id="${item.reward_id}"].vocab-shop-card`);
    await card.getByRole('button',{name:'Buy',exact:true}).click();
    if(item.category!=='themes') await card.getByRole('button',{name:'Equip',exact:true}).click();
    await card.getByRole('button',{name:'Equipped',exact:true}).waitFor();
  }
  assert.equal(available,3200);
  assert.equal(await shop.locator('[data-action="real-unequip"]').count(),6);
  assert.match(await mini.getAttribute('src'),/avatar-voxel-architect.webp$/);
  assert.ok(await mini.evaluate(async img=>{await img.decode();return img.naturalWidth>0;}));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await shop.locator('.vocab-shop-leaderboard img[src$="/avatar-shadow-fox.webp"]').waitFor();
  const evidence=process.env.AVATAR_SCREENSHOTS_DIR;
  if (evidence) {
    mkdirSync(evidence,{recursive:true});
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:`${evidence}/avatar-shop-${width}.png`});
  }

  await page.reload();
  await page.locator('.vocab-student-identity img[src$="avatar-voxel-architect.webp"]').waitFor();
  await page.locator('[data-action="open-real-shop"]').click();
  const slot=shop.locator('.vocab-shop-equipped__item').filter({hasText:'Voxel Architect'});
  await slot.getByRole('button',{name:'Change',exact:true}).click();
  await starter.getByRole('button',{name:'Equip',exact:true}).click();
  await starter.getByRole('button',{name:'Equipped',exact:true}).waitFor();
  await page.route('**/mock/missing-avatar.webp',route=>route.abort());
  const broken=shop.locator('.vocab-topbar img.vocab-avatar-character');
  await broken.evaluate(img=>img.src='/mock/missing-avatar.webp');
  await broken.waitFor({state:'detached'});
  await shop.locator('.vocab-topbar .vocab-student-identity__initials').waitFor();
  await shop.locator('[data-action="real-unequip"][data-category="avatars"]').click();
  await shop.locator('[data-action="real-unequip"][data-category="avatars"]').waitFor({state:'detached'});
  assert.equal(await shop.locator('[data-action="real-unequip"]').count(),5);
  await page.reload();
  await page.locator('.vocab-student-identity .vocab-student-identity__initials').waitFor();
  assert.equal(await page.locator('.vocab-student-identity img.vocab-avatar-character').count(),0);
  assert.deepEqual(errors,[]);
});
