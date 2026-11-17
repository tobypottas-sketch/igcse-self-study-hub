// Staff-only UI prototype. This never writes XP, purchases, ownership or profile data.
// The real shop will use server-confirmed balances and transactions before student launch.
import { REWARDS, REWARD_CATEGORIES, rewardsForCategory } from './rewards-catalog.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
})[c]);

export function renderRewardsPreview(root, { category='all' }={}) {
  const filtered = rewardsForCategory(category);
  const categories = REWARD_CATEGORIES.map(item =>
    `<button type="button" class="vocab-reward-tab${item.id===category?' is-active':''}" data-action="filter-rewards" data-category="${escapeHtml(item.id)}" aria-pressed="${item.id===category}">${escapeHtml(item.label)}</button>`
  ).join('');
  const cards = filtered.map(reward => `<article class="vocab-reward-card" data-reward-id="${escapeHtml(reward.id)}">
    <span class="vocab-reward-category">${escapeHtml(reward.category.slice(0,-1) || reward.category)}</span>
    <div class="vocab-reward-picture" aria-hidden="true"><span>${escapeHtml(reward.icon)}</span></div>
    <h3>${escapeHtml(reward.name)}</h3>
    <p>${escapeHtml(reward.description)}</p>
    <div class="vocab-reward-card__bottom"><strong>${reward.price.toLocaleString('en')} XP</strong>
    <button type="button" disabled title="Purchases are not enabled in this preview">Coming soon</button></div>
  </article>`).join('');
  root.innerHTML = `<main class="vocab-shell vocab-shell--rewards">
    <header class="vocab-topbar"><button type="button" class="vocab-back vocab-back--chip" data-action="back-rewards-home">← All units</button>
      <span class="vocab-topbar__course">Cambridge IGCSE ESL 0511</span></header>
    <section class="vocab-rewards-hero">
      <div><p class="vocab-kicker">Vocabulary Builder · Teacher preview</p>
      <h1>XP Rewards Shop</h1>
      <p>Personalise your profile as you build your vocabulary.</p></div>
      <div class="vocab-rewards-balance"><span>⭐ Sample balance</span><strong>2,480 XP</strong><small>Illustrative only — not your account balance</small></div>
    </section>
    <div class="vocab-rewards-notice" role="status">Preview mode: these 12 cosmetic rewards are proposed. Purchasing, ownership and equipping are not enabled yet. Your students' XP is unchanged.</div>
    <section class="vocab-rewards-layout" aria-label="Reward catalogue">
      <aside class="vocab-rewards-profile"><p class="vocab-kicker">Your rewards profile</p><div class="vocab-rewards-avatar" aria-hidden="true">📖</div>
        <h2>Vocabulary Explorer</h2><p>Earn XP by practising, then unlock themes, profile frames, titles and effects.</p>
        <div class="vocab-rewards-sample"><strong>Level 12</strong><span>Illustrative progress</span><div class="vocab-rewards-progress"><span></span></div></div>
        <small>Lifetime XP and levels will never decrease when redeeming rewards.</small>
      </aside>
      <div class="vocab-rewards-main"><nav class="vocab-rewards-filters" aria-label="Filter rewards">${categories}</nav>
        <div class="vocab-rewards-grid">${cards}</div>
      </div>
    </section>
  </main>`;
}
export { REWARDS };
