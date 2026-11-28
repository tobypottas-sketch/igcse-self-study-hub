import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {loadPlaywright,serve} from './helpers/pathway-geometry-harness.mjs';
import {PREMIUM_COLLECTIONS} from '../src/vocabulary/rewards-premium-registry.js';

const playwright=loadPlaywright();
const root=fileURLToPath(new URL('..',import.meta.url));
const cosmetics=PREMIUM_COLLECTIONS.find(item=>item.id==='blockverse').rewards.map(
  ([reward_id,category,name,xp_price])=>({reward_id,category,name,xp_price,description:name})
);
const migration=readFileSync(new URL('../supabase/migrations/20261124120000_vocabulary_player_avatars.sql',import.meta.url),'utf8');
const avatars=[...migration.matchAll(/\('(avatar-[a-z-]+)','([^']+)','avatars',(\d+),'([^']+)'/g)]
  .map(([,reward_id,name,price,description])=>({reward_id,name,category:'avatars',xp_price:Number(price),description}));
const premiumReward=avatars.find(row=>row.reward_id==='avatar-voxel-architect');
const rewards=[...cosmetics,...avatars];
const profile={id:'avatar-browser-test',role:'student',active:true,display_name:'Avatar Test Student'};

for(const width of [1440,768,390]) test(`Player avatar shop and persistence at ${width}px`,{skip:!playwright},async t=>{
  const {server,origin}=await serve(root);
  t.after(()=>server.close());
  const browser=await playwright.chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
  t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width,height:880}});
  page.setDefaultTimeout(10000);
  const owned=[],sandboxOwned=[];
  let sandboxAvailable=1200;
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
    if(name==='vocabulary-reward-sandbox'){
      const item=rewards.find(row=>row.reward_id===rewardId);
      if(action==='buy' && !sandboxOwned.some(row=>row.reward_id===rewardId)){
        assert.ok(item&&sandboxAvailable>=item.xp_price);
        sandboxOwned.push({...item,equipped:false});
        sandboxAvailable-=item.xp_price;
      }
      if(action==='equip'){
        const selected=sandboxOwned.find(row=>row.reward_id===rewardId);
        assert.ok(selected);
        for(const row of sandboxOwned) if(row.category===selected.category)row.equipped=row===selected;
      }
      if(action==='unequip')for(const row of sandboxOwned)if(row.category===category)row.equipped=false;
      data={ok:true,shopMode:'sandbox',sandboxEnabled:true,wallet:{available:sandboxAvailable},rewards,owned:sandboxOwned};
    }
    if(name==='vocabulary-battles'){
      const peer={id:'peer',display_name:'Test Classmate',avatarId:'avatar-shadow-fox'};
      const classes=[{id:'class',name:'Test Class'}];
      if(action==='classes')data={ok:true,classes};
      if(action==='lobby')data={ok:true,me:profile.id,avatarId:'avatar-pixel-bot',students:[peer],pending:[],active:[
        // A started match stays in the lobby until entered; an accepted unstarted match auto-enters V2.
        {id:'match',unit_number:1,challenger_id:profile.id,opponent_id:peer.id,starts_at:'2026-11-27T12:00:00Z'}
      ]};
      if(action==='leaderboard')data={ok:true,ranking:[{...peer,name:peer.display_name,wins:1,played:1,score:800}]};
      if(action==='status')data={ok:true,id:'match',status:'accepted',unitNumber:1,className:'Test Class',challengerId:profile.id,
        avatarId:'avatar-pixel-bot',opponentAvatarId:peer.avatarId,opponentName:peer.display_name,
        score:900,opponentScore:800,finished:true,outcome:'won'};
    }
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
  assert.equal(await shop.locator('.vocab-shop-card--avatars').count(),28);
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

  for (const item of [...cosmetics,premiumReward]) {
    await shop.locator(`.vocab-reward-tab[data-category="${item.category}"]`).click();
    const card=shop.locator(`[data-reward-id="${item.reward_id}"].vocab-shop-card`);
    await card.getByRole('button',{name:'Buy',exact:true}).click();
    if(item.category!=='themes') await card.getByRole('button',{name:'Equip',exact:true}).click();
    await card.getByRole('button',{name:'Equipped',exact:true}).waitFor();
  }
  assert.equal(available,3200);
  assert.equal(await shop.locator('[data-action="real-unequip"]').count(),6);
  const slots=shop.locator('.vocab-shop-equipped__list');
  const columns=await slots.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
  assert.equal(columns,width===390?2:width===768?3:6);
  const panel=shop.locator('.vocab-shop-equipped');
  if(width===1440){
    const geometry=await panel.evaluate(el=>({height:el.getBoundingClientRect().height,children:[...el.querySelectorAll('.vocab-shop-equipped__heading,.vocab-shop-equipped__list,.vocab-shop-equipped__item')].map(n=>({className:n.className,height:n.getBoundingClientRect().height,rows:getComputedStyle(n).gridTemplateRows}))}));
    assert.ok(geometry.height<=290,'desktop equipment panel is compact: '+JSON.stringify(geometry));
  }
  for(const art of await slots.locator('.vocab-shop-equipped__art').all()){
    assert.ok((await art.boundingBox()).height<=111,'equipment artwork height is bounded');
  }
  for(const image of await slots.locator('.vocab-shop-equipped__art > img').all()){
    assert.equal(await image.evaluate(el=>getComputedStyle(el).objectFit),'contain');
  }
  const equippedArtwork=slots.locator('img.vocab-avatar-character');
  assert.equal(await equippedArtwork.evaluate(el=>getComputedStyle(el).objectFit),'contain');
  assert.match(await mini.getAttribute('src'),/avatar-voxel-architect.webp$/);
  assert.ok(await mini.evaluate(async img=>{await img.decode();return img.naturalWidth>0;}));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await shop.locator('.vocab-shop-leaderboard img[src$="/avatar-shadow-fox.webp"]').waitFor();
  const evidence=process.env.AVATAR_SCREENSHOTS_DIR;
  if (evidence) {
    mkdirSync(evidence,{recursive:true});
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:`${evidence}/avatar-shop-${width}.png`});
    await premium.screenshot({path:`${evidence}/avatar-card-${width}.png`});
    await shop.locator('.vocab-shop-equipped').screenshot({path:`${evidence}/avatar-equipped-${width}.png`});
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
  await page.locator('[data-action="open-sandbox-shop"]').click();
  const sandbox=page.locator('.vocab-shell--sandbox');
  await sandbox.locator('.vocab-reward-tab[data-category="avatars"]').click();
  const sandboxStarter=sandbox.locator('.vocab-shop-card[data-reward-id="avatar-pixel-bot"]');
  await sandboxStarter.getByRole('button',{name:'Claim',exact:true}).click();
  await sandboxStarter.getByRole('button',{name:'Equip',exact:true}).click();
  await sandboxStarter.getByRole('button',{name:'Equipped',exact:true}).waitFor();
  assert.equal(sandboxAvailable,1200);
  const sandboxPremium=sandbox.locator('.vocab-shop-card[data-reward-id="avatar-voxel-architect"]');
  await sandboxPremium.getByRole('button',{name:'Buy',exact:true}).click();
  await sandboxPremium.getByRole('button',{name:'Equip',exact:true}).click();
  await sandboxPremium.getByRole('button',{name:'Equipped',exact:true}).waitFor();
  assert.equal(sandboxAvailable,0);
  await sandbox.locator('[data-action="sandbox-unequip"][data-category="avatars"]').click();
  await sandbox.locator('[data-action="sandbox-unequip"][data-category="avatars"]').waitFor({state:'detached'});
  assert.equal(available,3200);
  assert.equal(owned.filter(row=>row.category==='avatars'&&row.equipped).length,0);

  await page.goto(origin+'/vocabulary-battles.html');
  await page.locator('[data-battle-opponent]').selectOption('peer');
  await page.locator('.battle-challenge-player img[src$="avatar-shadow-fox.webp"]').waitFor();
  await page.locator('[data-battle-act="enter"]').click();
  await page.locator('.battle-final-scores img[src$="avatar-shadow-fox.webp"]').waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(evidence) await page.screenshot({path:`${evidence}/avatar-battle-${width}.png`});
  assert.deepEqual(errors,[]);
});

test('Avatar artwork composes with the default and eight theme states', {skip:!playwright}, async t=>{
  const {server,origin}=await serve(root);
  t.after(()=>server.close());
  const browser=await playwright.chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
  t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await page.route('**/src/vocabulary/router.js*',route=>route.fulfill({contentType:'text/javascript',body:''}));
  await page.goto(origin+'/vocabulary.html');
  const themes=['','forest','ocean','sakura','midnight','neon-district','celestial-realms','afterlight','blockverse'];
  const portraits=['avatar-classic-explorer','avatar-woodland-guardian','avatar-aqua-shark',
    'avatar-sakura-kitsune','avatar-phantom-cat','avatar-cyber-mech','avatar-astral-sorceress',
    'avatar-zombie-survivor','avatar-voxel-adventurer'];
  const frames=['gold-frame','scholar-frame','aurora-frame','cyber-pulse-frame','astral-halo-frame',
    'survivor-frame','voxel-master-frame'];
  for (const [index,theme] of themes.entries()){
    const avatarId=portraits[index],frameId=frames[index%frames.length];
    await page.evaluate(async ({theme,avatarId,frameId})=>{
      const {renderProductionShop}=await import('/src/vocabulary/rewards-sandbox-view.js');
      const {decorateStudentIdentity}=await import('/src/vocabulary/rewards-equipped-home.js');
      const app=document.querySelector('#vocabularyApp');
      const items=[[avatarId,'avatars'],[frameId,'frames'],['pixel-badge','badges'],
        ['word-wizard','titles'],['sakura-petals','effects'],...(theme?[[theme,'themes']]:[])];
      const rewards=items.map(([reward_id,category])=>({reward_id,category,name:reward_id,description:'',xp_price:1200}));
      const shop={shopMode:'production',purchasesEnabled:true,walletStatus:'ready',wallet:{available:0},
        rewards,owned:rewards.map(row=>({...row,equipped:true}))};
      renderProductionShop(app,shop,{category:'avatars',studentName:'Avatar Test Student'});
      decorateStudentIdentity(app,shop,'Avatar Test Student');
      await Promise.all(Array.from(app.querySelectorAll('.vocab-topbar img')).map(image=>image.decode()));
    },{theme,avatarId,frameId});
    const header=page.locator('.vocab-shop-redesign .vocab-topbar');
    assert.match(await header.locator('img.vocab-avatar-character').getAttribute('src'),new RegExp('/'+avatarId+'\\.webp$'));
    assert.equal(await header.locator('.vocab-student-identity__frame').evaluate(el=>getComputedStyle(el).objectFit),'contain');
    assert.equal(await header.locator('.vocab-student-identity__avatar').evaluate(el=>el.offsetWidth),108);
    assert.equal(await page.locator('.vocab-shop-redesign').getAttribute('data-equipped-theme'),theme);
    const evidence=process.env.AVATAR_SCREENSHOTS_DIR;
    if(evidence){
      mkdirSync(evidence,{recursive:true});
      await header.screenshot({path:`${evidence}/avatar-theme-${theme||'default'}.png`});
    }
  }
});
