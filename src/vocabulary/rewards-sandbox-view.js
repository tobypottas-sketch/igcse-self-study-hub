// Functional Rewards Shop for server-enabled sandbox accounts only.
// The layout follows the approved mockup; all XP, ownership and equipment
// values come from authenticated data, never from illustrative screenshots.
import { rewardIllustration, bannerIllustration } from './rewards-art.js';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[c]);
const categories=[['all','All'],['themes','Themes'],['frames','Frames'],['titles','Titles'],['effects','Effects']];
const popular=['midnight','forest','gold-frame','pixel-badge','word-wizard','aurora-frame'];
const categoryLabel={themes:'Theme',frames:'Frame',titles:'Title',effects:'Effect'};
const num=value=>Number.isSafeInteger(value)&&value>=0?value:0;
const format=value=>num(value).toLocaleString('en');
function ownedMap(shop){return new Map((shop.owned??[]).map(item=>[item.reward_id,item]));}
export function renderSandboxShop(root,shop,{category='all',busy=false,message='',progress=null,studentName='Student'}={}){
  if(!shop?.sandboxEnabled||shop.shopMode!=='sandbox')throw Error('Sandbox not enabled');
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
  const nextGoal=feature?`<div class="vocab-shop-next__detail"><div class="vocab-shop-next__art">${rewardIllustration(feature.reward_id,feature.icon)}</div><div><strong>${escapeHtml(feature.name)}</strong><p>${escapeHtml(feature.description)}</p><b>${escapeHtml(featureCaption)}</b></div></div>`:
    '<p class="vocab-shop-next__complete">You own every available cosmetic. Amazing collecting!</p>';
  const featuredArt=active.frames??'gold-frame';
  const selectedTitle=rewards.find(item=>item.reward_id===active.titles)?.name??'Vocabulary Explorer';
  const theme=active.themes??'';
  const shopCards=visible.map(item=>{
    const purchase=owned.get(item.reward_id),affordable=available>=item.xp_price;
    const action=purchase?(purchase.equipped?'':'sandbox-equip'):'sandbox-buy';
    const label=purchase?(purchase.equipped?'Equipped':'Equip'):(affordable?'Buy':'Not enough XP');
    const tag=categoryLabel[item.category]??item.category;
    return `<article class="vocab-reward-card vocab-shop-card vocab-shop-card--${escapeHtml(item.category)}" data-reward-id="${escapeHtml(item.reward_id)}">
      <span class="vocab-reward-category">${escapeHtml(tag)}</span>
      <div class="vocab-reward-picture">${rewardIllustration(item.reward_id,item.icon)}</div>
      <h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p>
      <div class="vocab-reward-card__bottom"><strong class="vocab-shop-price"><span aria-hidden="true">⭐</span> ${format(item.xp_price)} XP</strong>
      <button type="button" ${action?`data-action="${action}" data-reward-id="${escapeHtml(item.reward_id)}"`:''}
        ${busy||!action||(!purchase&&!affordable)?'disabled':''}
        class="${purchase?'is-owned':''}">${escapeHtml(label)}</button></div></article>`;
  }).join('');
  const equipment=categories.slice(1).map(([id,label])=>{
    const reward=rewards.find(item=>item.reward_id===active[id]);
    return `<div class="vocab-shop-equipped__item"><small>${escapeHtml(label.slice(0,-1))}</small>
      <div class="vocab-shop-equipped__art">${reward?rewardIllustration(reward.reward_id,reward.icon):'<span class="vocab-shop-empty-icon" aria-hidden="true">＋</span>'}</div>
      <strong>${reward?escapeHtml(reward.name):'Not equipped'}</strong>
      <button type="button" data-action="sandbox-filter" data-category="${id}" ${busy?'disabled':''}>${reward?'Change':'Choose'}</button></div>`;
  }).join('');
  const banner=bannerIllustration;
  root.innerHTML=`<main class="vocab-shell vocab-shell--rewards vocab-shell--sandbox vocab-shop-redesign" data-equipped-theme="${escapeHtml(theme)}">
    <header class="vocab-topbar"><button type="button" class="vocab-back vocab-back--chip" data-action="back-sandbox-home">← All units</button><span class="vocab-topbar__course">Cambridge IGCSE ESL 0511 · Test shop</span></header>
    <section class="vocab-shop-hero" aria-label="XP Rewards Shop">
      <div class="vocab-shop-hero__intro"><span class="vocab-shop-eyebrow">Vocabulary Builder · Student rewards</span>
        <h1>XP Rewards Shop</h1><span class="vocab-shop-underline" aria-hidden="true"></span>
        <p>Spend XP on themes, profile frames, titles and effects.</p></div>
      <div class="vocab-shop-hero__scene">${banner}</div>
      <div class="vocab-shop-hero__balance"><span aria-hidden="true">⭐</span><strong>${format(available)} XP</strong><small>Sandbox available</small></div>
    </section>
    <p class="vocab-shop-test-note" role="note">Test mode · 100,000 sample XP allocated to this account. Rewards never affect answers, levels or genuine learning XP.</p>
    <p class="vocab-sandbox-feedback" role="status" aria-live="polite">${escapeHtml(message)}</p>
    <div class="vocab-shop-content">
      <aside class="vocab-shop-sidebar" aria-label="Your real learning progress">
        <h2>Your Progress</h2><div class="vocab-shop-level-mark"><span>Lv.</span><strong>${num(level)}</strong></div>
        <strong class="vocab-shop-student-name">${escapeHtml(studentName)}</strong><small class="vocab-shop-student-title">${escapeHtml(selectedTitle)}</small>
        <p class="vocab-shop-level-copy">${format(currentXp)} XP ${nextXp==null?'· Top level':`/ ${format(nextXp)} XP`}</p>
        <div class="vocab-shop-meter" role="progressbar" aria-label="Progress to next learning level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${levelPercent}"><span style="width:${levelPercent}%"></span></div>
        <div class="vocab-shop-stat"><span aria-hidden="true">🎯</span><div><small>Weekly practice</small><strong>${weekly?escapeHtml(weekly.label):'Keep practising'}</strong></div></div>
        <div class="vocab-shop-stat"><span aria-hidden="true">🏆</span><div><small>Achievements</small><strong>${achievements} / ${totalAchievements}</strong></div></div>
        <div class="vocab-shop-next"><h3>✧ Next unlock</h3>${nextGoal}</div>
      </aside>
      <section class="vocab-shop-main" aria-label="Shop rewards">
        <div class="vocab-shop-filter-line"><nav class="vocab-rewards-filters" aria-label="Filter rewards">${tabs}</nav>
          <button type="button" class="vocab-shop-popular${category==='popular'?' is-active':''}" data-action="sandbox-filter" data-category="popular" aria-pressed="${category==='popular'}">🔥 Popular picks</button></div>
        <div class="vocab-rewards-grid">${shopCards||'<p class="vocab-shop-empty-list">No rewards in this category.</p>'}</div>
      </section>
      <section class="vocab-shop-equipped" aria-label="Equipped rewards">
        <div class="vocab-shop-equipped__heading"><h2>Equipped now</h2><p>Your active rewards and customisations.</p></div>
        <div class="vocab-shop-equipped__list">${equipment}</div>
      </section>
    </div>
  </main>`;
}
