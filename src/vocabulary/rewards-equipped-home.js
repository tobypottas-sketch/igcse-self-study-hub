// Student-facing preview of owned and equipped production cosmetics.
// All artwork uses the approved PNG pack, never SVG/emoji stand-ins.
import {rewardArtworkPath} from './rewards-art.js';
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;':'&quot;',"'":'&#39;'}[c]));
const THEMES=new Set(['midnight','forest','ocean','sakura']);
const EFFECTS=new Set(['sparkle','pixel-badge']);
export function equippedCosmetics(shop){
 if(shop?.shopMode!=='production'||!Array.isArray(shop.owned))return {};
 const owned=new Set(shop.rewards?.map(r=>r.reward_id)||[]);
 const active={};
 for(const item of shop.owned)if(item.equipped&&owned.has(item.reward_id)
  &&['themes','frames','titles','effects'].includes(item.category))active[item.category]=item.reward_id;
 return active;
}
export function renderEquippedCosmetics(root,shop){
 const home=root?.querySelector?.('.vocab-shell--home');
 if(!home)return;
 home.querySelector('[data-real-cosmetics]')?.remove();
 home.classList.remove('vocab-real-theme--midnight','vocab-real-theme--forest','vocab-real-theme--ocean','vocab-real-theme--sakura');
 home.classList.remove('vocab-real-effect--sparkle','vocab-real-effect--pixel-badge');
 const active=equippedCosmetics(shop);
 if(THEMES.has(active.themes))home.classList.add('vocab-real-theme--'+active.themes);
 if(EFFECTS.has(active.effects))home.classList.add('vocab-real-effect--'+active.effects);
 if(!Object.keys(active).length)return;
 const itemFor=category=>shop.rewards.find(r=>r.reward_id===active[category]);
 const frame=itemFor('frames'),title=itemFor('titles'),effect=itemFor('effects');
 const framePath=frame?rewardArtworkPath(frame.reward_id):null;
 const effectPath=effect?rewardArtworkPath(effect.reward_id):null;
 const chip=(item,img)=>item?`<span class="vocab-real-cosmetic-chip">${img?`<img src="${img}" alt="" loading="lazy">`:''}<strong>${escapeHtml(item.name)}</strong></span>`:'';
 const panel=document.createElement('section');
 panel.className='vocab-real-cosmetics';
 panel.dataset.realCosmetics='true';
 panel.setAttribute('aria-label','Your equipped rewards');
 panel.innerHTML=`<div class="vocab-real-cosmetics__intro"><strong>Your equipped rewards</strong><small>Cosmetics only · learning results never change</small></div>
  <div class="vocab-real-cosmetics__items">${chip(frame,framePath)}${chip(title,null)}${chip(effect,effectPath)}
  ${active.themes?`<span class="vocab-real-cosmetic-chip"><strong>${escapeHtml(itemFor('themes')?.name||'Theme')}</strong></span>`:''}</div>`;
 home.querySelector('.vocab-hero--home')?.insertAdjacentElement('afterend',panel);
}
