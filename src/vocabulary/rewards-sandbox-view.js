// Functional Rewards Shop for server-enabled sandbox accounts only.
// The layout follows the approved mockup; all XP, ownership and equipment
// values come from authenticated data, never from illustrative screenshots.
import { rewardIllustration, bannerIllustration } from './rewards-art.js';
import {leaderboardModal,installLeaderboardModal} from './rewards-leaderboard-modal.js';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[c]);
const categories=[['all','All'],['themes','Themes'],['frames','Frames'],['titles','Titles'],['effects','Effects']];
const popular=['midnight','forest','gold-frame','pixel-badge','word-wizard','aurora-frame'];
const categoryLabel={themes:'Theme',frames:'Frame',titles:'Title',effects:'Effect'};
const num=value=>Number.isSafeInteger(value)&&value>=0?value:0;
const format=value=>num(value).toLocaleString('en');
function leaderboardPanel(board,view={}){
 const scope=view.scope==='school'?'school':'class',period=view.period==='all'?'all':'weekly',expanded=view.expanded===true;
 const tab=(key,text,value,action)=>`<button type="button" data-action="sandbox-leaderboard" data-${key}="${value}" aria-pressed="${key==='scope'?scope===value:period===value}" class="${(key==='scope'?scope:period)===value?'is-active':''}">${text}</button>`;
 const results=board?.ok&&Array.isArray(board.rows);
 const rows=results?board.rows.slice(0,7).map(row=>`<li class="vocab-shop-leaderboard__row${row.isYou?' is-you':''}${row.rank<=3?' is-podium is-podium--'+row.rank:''}"${row.isYou?' aria-label="Your leaderboard position"':''}>
    <span class="vocab-shop-leaderboard__rank" aria-label="Rank ${escapeHtml(row.rank)}">${row.rank<=3?['🥇','🥈','🥉'][row.rank-1]:escapeHtml(row.rank)}</span>
    <span class="vocab-shop-leaderboard__name">${escapeHtml(row.name)}${row.isYou?'<small>Your rank</small>':''}</span>
    <strong class="vocab-shop-leaderboard__xp">${format(row.xp)} <span>XP</span></strong></li>`).join(''):'';
 const shown=results&&board.rows.slice(0,7).some(row=>row.isYou);
 const me=results&&board.me&&!shown?`<div class="vocab-shop-leaderboard__mine"><span>#${num(board.me.rank)} · You</span><strong>${format(board.me.xp)} XP</strong></div>`:'';
 const note=results?(board.empty||(!board.rows.length?'No completed practice missions yet.':'Ranked by verified practice XP, not shop balance.')):'Rankings will appear when class data is available.';
 return `<section class="vocab-shop-leaderboard" aria-label="Practice XP leaderboard">
   <div class="vocab-shop-leaderboard__head"><span aria-hidden="true">🏆</span><div><h2>Class leaderboard</h2><small>${escapeHtml(board?.className||'Your vocabulary practice ranking')}</small></div></div>
   <div class="vocab-shop-leaderboard__tabs" aria-label="Leaderboard group">${tab('scope','My Class','class')}${tab('scope','All Classes','school')}</div>
   <div class="vocab-shop-leaderboard__tabs" aria-label="Leaderboard period">${tab('period','This Week','weekly')}${tab('period','All Time','all')}</div>
   ${results?`<ol class="vocab-shop-leaderboard__list">${rows}</ol>${me}`:'<p class="vocab-shop-leaderboard__loading">Leaderboard unavailable right now.</p>'}
   <p class="vocab-shop-leaderboard__note">${escapeHtml(note)}</p>
   <button type="button" class="vocab-shop-leaderboard__expand" data-action="sandbox-leaderboard-expand" aria-expanded="${expanded}">View full leaderboard</button>
 </section>`;
}
function ownedMap(shop){return new Map((shop.owned??[]).map(item=>[item.reward_id,item]));}
export function renderSandboxShop(root,shop,options={}){return renderSharedShop(root,shop,options,false);}
export function renderProductionShop(root,shop,options={}){
 if(shop?.shopMode!=='production'||!shop?.purchasesEnabled||shop?.walletStatus!=='ready')throw Error('Verified production shop not ready');
 return renderSharedShop(root,shop,options,true);
}
function renderSharedShop(root,shop,{category='all',busy=false,message='',progress=null,studentName='Student',leaderboard=null,leaderboardView={}}={},production=false){
 if(!production&&(!shop?.sandboxEnabled||shop.shopMode!=='sandbox'))throw Error('Sandbox not enabled');
  const owned=ownedMap(shop);
  const active={};
  for(const item of shop.owned??[])if(item.equipped)active[item.category]=item.reward_id;
  const rewards=shop.rewards??[];
  const visible=rewards.filter(item=>category==='all'||(category==='popular'?popular.includes(item.reward_id):item.category===category));
  const tabs=categories.map(([id,label])=>`<button type="button" data-action="sandbox-filter" data-category="${id}" aria-pressed="${category===id}" class="vocab-reward-tab${category===id?' is-active':''}">${label}</button>`).join('');
  const available=num(shop.wallet?.available);
  const level=progress?.level?.level??1;
  const currentXp=num(progress?.level?.xp);
  const nextXp=progress?.level?.next;
  const achievements=num(progress?.achievementsUnlocked);
  const totalAchievements=num(progress?.achievementsTotal);
  const weekly=progress?.weekly??null;
  const levelPercent=Math.min(100,Math.max(0,num(progress?.level?.progressPercent)));
  const nextUnowned=rewards.filter(item=>!owned.has(item.reward_id)).sort((a,b)=>a.xp_price-b.xp_price)[0];
  const upcoming=rewards.filter(item=>!owned.has(item.reward_id)&&item.xp_price>available).sort((a,b)=>a.xp_price-b.xp_price)[0];
  const feature=upcoming??nextUnowned;
  const featureCaption=upcoming?`${format(upcoming.xp_price-available)} XP to go`:nextUnowned?'Ready to unlock':'All rewards collected';
  const nextGoal=feature?`<div class="vocab-shop-next__detail">
    <div class="vocab-shop-next__art">${rewardIllustration(feature.reward_id,feature.icon)}</div>
    <div class="vocab-shop-next__info">
      <span class="vocab-shop-next__category">${escapeHtml(categoryLabel[feature.category]??'Reward')}</span>
      <strong>${escapeHtml(feature.name)}</strong>
      <p>${escapeHtml(feature.description)}</p>
      ${upcoming
        ?`<span class="vocab-shop-next__status is-locked">${escapeHtml(featureCaption)}</span>`
        :`<button type="button" class="vocab-shop-next__status is-ready" data-action="sandbox-filter" data-category="${escapeHtml(feature.category)}" data-focus-reward="${escapeHtml(feature.reward_id)}">Ready to unlock <span aria-hidden="true">→</span></button>`}
    </div>
  </div>`:
    '<p class="vocab-shop-next__complete">You own every available cosmetic. Amazing collecting!</p>';
  const featuredArt=active.frames??'gold-frame';
  const selectedTitle=rewards.find(item=>item.reward_id===active.titles)?.name??'Vocabulary Explorer';
  const theme=active.themes??'';
  const shopCards=visible.map(item=>{
    const purchase=owned.get(item.reward_id),affordable=available>=item.xp_price;
    const action=purchase?(purchase.equipped?'':'sandbox-equip'):'sandbox-buy';
    const label=purchase?(purchase.equipped?'Equipped':'Equip'):'Buy';
    const locked=!purchase&&!affordable;
    const remaining=locked?Math.max(0,item.xp_price-available):0;
    const unlockPercent=locked&&item.xp_price>0?Math.min(99,Math.floor(available/item.xp_price*100)):100;
    const tag=categoryLabel[item.category]??item.category;
    return `<article class="vocab-reward-card vocab-shop-card vocab-shop-card--${escapeHtml(item.category)}" data-reward-id="${escapeHtml(item.reward_id)}">
      <span class="vocab-reward-category">${escapeHtml(tag)}</span>
      <div class="vocab-reward-picture">${rewardIllustration(item.reward_id,item.icon)}</div>
      <h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p>
      <div class="vocab-reward-card__bottom"><strong class="vocab-shop-price"><span aria-hidden="true">⭐</span> ${format(item.xp_price)} XP</strong>
      ${locked?`<div class="vocab-shop-unlock" aria-label="${format(remaining)} XP to unlock ${escapeHtml(item.name)}">
        <strong class="vocab-shop-unlock__label">${format(remaining)} XP to unlock</strong>
        <div class="vocab-shop-unlock__track" role="progressbar" aria-label="XP saved towards ${escapeHtml(item.name)}" aria-valuemin="0" aria-valuemax="${item.xp_price}" aria-valuenow="${available}"><span style="width:${unlockPercent}%"></span></div>
      </div>`:`<button type="button" ${action?`data-action="${action}" data-reward-id="${escapeHtml(item.reward_id)}"`:''}
        ${busy||!action?'disabled':''}
        class="${purchase?'is-owned':''}">${escapeHtml(label)}</button>`}</div></article>`;
  }).join('');
  const equipment=categories.slice(1).map(([id,label])=>{
    const reward=rewards.find(item=>item.reward_id===active[id]);
    return `<div class="vocab-shop-equipped__item"><small>${escapeHtml(label.slice(0,-1))}</small>
      <div class="vocab-shop-equipped__art">${reward?rewardIllustration(reward.reward_id,reward.icon):'<span class="vocab-shop-empty-icon" aria-hidden="true">＋</span>'}</div>
      <strong>${reward?escapeHtml(reward.name):id==='themes'?'Default theme':'Not equipped'}</strong>
      <button type="button" data-action="sandbox-filter" data-category="${id}" ${busy?'disabled':''}>${reward?'Change':'Choose'}</button>
      ${reward?`<button type="button" class="vocab-shop-unequip" data-action="sandbox-unequip" data-category="${id}" ${busy?'disabled':''}>${id==='themes'?'Use Default Theme':'Unequip'}</button>`:''}</div>`;
  }).join('');
  const banner=bannerIllustration;
  let html=`<main class="vocab-shell vocab-shell--rewards vocab-shell--sandbox vocab-shop-redesign" data-equipped-theme="${escapeHtml(theme)}">
    <header class="vocab-topbar"><button type="button" class="vocab-back vocab-back--chip" data-action="back-sandbox-home">← All units</button><span class="vocab-topbar__course">Cambridge IGCSE ESL 0511 · Test shop</span></header>
    <section class="vocab-shop-hero" aria-label="XP Rewards Shop">
      <div class="vocab-shop-hero__topline">
        <span class="vocab-shop-eyebrow">✦ STUDENT REWARDS</span>
        <div class="vocab-shop-hero__balance" aria-label="Available XP balance"><span aria-hidden="true">⭐</span><strong>${format(available)} XP</strong><small>Sandbox available</small></div>
      </div>
      <div class="vocab-shop-hero__intro">
        <h1>XP REWARDS <span>SHOP</span></h1>
        <p class="vocab-shop-hero__tagline">Earn it. Spend it. Make it yours.</p>
        <p class="vocab-shop-hero__categories">Themes <span aria-hidden="true">·</span> Frames <span aria-hidden="true">·</span> Titles <span aria-hidden="true">·</span> Effects</p>
      </div>
      <div class="vocab-shop-hero__scene">${banner}</div>
    </section>
    <p class="vocab-shop-test-note" role="note">TEST XP ONLY · Your learning progress is unaffected</p>
    <p class="vocab-sandbox-feedback" role="status" aria-live="polite">${escapeHtml(message)}</p>
    <div class="vocab-shop-content">
      <div class="vocab-shop-rail">
      <aside class="vocab-shop-sidebar" aria-label="Your real learning progress">
        <h2>Your Progress</h2><div class="vocab-shop-level-mark"><span>Lv.</span><strong>${num(level)}</strong></div>
        <strong class="vocab-shop-student-name">${escapeHtml(studentName)}</strong><small class="vocab-shop-student-title">${escapeHtml(selectedTitle)}</small>
        <p class="vocab-shop-level-copy">${format(currentXp)} XP ${nextXp==null?'· Top level':`/ ${format(nextXp)} XP`}</p>
        <div class="vocab-shop-meter" role="progressbar" aria-label="Progress to next learning level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${levelPercent}"><span style="width:${levelPercent}%"></span></div>
        <div class="vocab-shop-stat"><span aria-hidden="true">🎯</span><div><small>Weekly practice</small><strong>${weekly?escapeHtml(weekly.label):'Keep practising'}</strong></div></div>
        <div class="vocab-shop-stat"><span aria-hidden="true">🏆</span><div><small>Achievements</small><strong>${achievements} / ${totalAchievements}</strong></div></div>
        <div class="vocab-shop-next"><h3><span aria-hidden="true">✦</span> Next unlock</h3>${nextGoal}</div>
      </aside>
      <div class="vocab-shop-leaderboard-slot">${leaderboardPanel(leaderboard,leaderboardView)}</div>
      </div>
      <section class="vocab-shop-main" aria-label="Shop rewards">
        <div class="vocab-shop-filter-line"><nav class="vocab-rewards-filters" aria-label="Filter rewards">${tabs}</nav>
          <button type="button" class="vocab-shop-popular${category==='popular'?' is-active':''}" data-action="sandbox-filter" data-category="popular" aria-pressed="${category==='popular'}">🔥 Popular picks</button></div>
        <div class="vocab-rewards-grid">${shopCards||'<p class="vocab-shop-empty-list">No rewards in this category.</p>'}</div>
      </section>
      <section class="vocab-shop-equipped" aria-label="Equipped rewards">
        <div class="vocab-shop-equipped__heading"><span class="vocab-shop-equipped__eyebrow">YOUR COLLECTION</span><h2>Equipped now</h2><p>4 slots · Your current look</p></div>
        <div class="vocab-shop-equipped__list">${equipment}</div>
      </section>
    </div>
    ${leaderboardView.expanded===true?leaderboardModal(leaderboard,leaderboardView):''}
  </main>`;
  if(production){
   html=html.replace(/data-action="sandbox-/g,'data-action="real-')
    .replace('data-action="back-sandbox-home"','data-action="back-real-home"')
    .replace('vocab-shell--sandbox','vocab-shell--production')
    .replace(' · Test shop',' · Rewards Shop')
    .replace('Sandbox available','Spendable balance')
    .replace('TEST XP ONLY · Your learning progress is unaffected','REAL XP REWARDS · Purchases do not reduce your earned learning XP');
  }
  root.innerHTML=html;
  if(leaderboardView.expanded===true)installLeaderboardModal(root,leaderboard,leaderboardView);
}
