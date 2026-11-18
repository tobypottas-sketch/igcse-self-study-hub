// Sandbox-only shop. All balances and ownership come from authenticated server data.
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[c]);
const categories=[
  ['all','All'],['themes','Themes'],['frames','Frames'],['titles','Titles'],['effects','Effects']
];
export function renderSandboxShop(root,shop,{category='all',busy=false,message=''}={}){
  if(!shop?.sandboxEnabled||shop.shopMode!=='sandbox')throw Error('Sandbox not enabled');
  const own=new Map((shop.owned??[]).map(x=>[x.reward_id,x]));
  const visible=shop.rewards.filter(item=>category==='all'||item.category===category);
  const tabs=categories.map(([id,label])=>`<button type="button" data-action="sandbox-filter" data-category="${id}" aria-pressed="${category===id}" class="vocab-reward-tab${category===id?' is-active':''}">${label}</button>`).join('');
  const cards=visible.map(item=>{
    const owned=own.get(item.reward_id),affordable=shop.wallet.available>=item.xp_price;
    const action=owned?(owned.equipped?'':'sandbox-equip'):'sandbox-buy';
    const label=owned?(owned.equipped?'Equipped':'Equip'):(affordable?'Buy reward':'Not enough XP');
    return `<article class="vocab-reward-card">
      <span class="vocab-reward-category">${escapeHtml(item.category)}</span>
      <div class="vocab-reward-picture" aria-hidden="true"><span>${escapeHtml(item.icon)}</span></div>
      <h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p>
      <div class="vocab-reward-card__bottom"><strong>${Number(item.xp_price).toLocaleString('en')} XP</strong>
      <button type="button" ${action?`data-action="${action}" data-reward-id="${escapeHtml(item.reward_id)}"`:''}
        ${busy||!action||(!owned&&!affordable)?'disabled':''}>${label}</button></div></article>`;
  }).join('');
  root.innerHTML=`<main class="vocab-shell vocab-shell--rewards vocab-shell--sandbox">
    <header class="vocab-topbar"><button type="button" class="vocab-back vocab-back--chip" data-action="back-sandbox-home">← All units</button>
      <span class="vocab-topbar__course">Cambridge IGCSE ESL 0511</span></header>
    <section class="vocab-rewards-hero">
      <div><p class="vocab-kicker">Test student · Sandbox only</p><h1>XP Rewards Shop</h1>
        <p>Try cosmetic rewards without affecting genuine learning XP.</p></div>
      <div class="vocab-rewards-balance"><span>⭐ Sandbox XP available</span>
        <strong>${Number(shop.wallet.available).toLocaleString('en')} XP</strong>
        <small>Granted ${Number(shop.wallet.granted).toLocaleString('en')} · Spent ${Number(shop.wallet.spent).toLocaleString('en')}</small></div>
    </section>
    <div class="vocab-rewards-notice" role="note">Test credits only. Purchases are saved to this sandbox profile, not your real XP, level or mastery. Regular student purchasing remains disabled.</div>
    <p class="vocab-sandbox-feedback" role="status" aria-live="polite">${escapeHtml(message)}</p>
    <nav class="vocab-rewards-filters" aria-label="Filter sandbox rewards">${tabs}</nav>
    <div class="vocab-rewards-grid">${cards}</div>
    </main>`;
}
