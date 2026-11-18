// Student-facing equipped identity and app-wide cosmetic theme controller.
// The backend owns inventory; only equipped items found in its returned catalogue
// can influence presentation. No learning content, grades, mastery or XP changes.
import {rewardArtworkPath} from './rewards-art.js';
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const THEMES=new Set(['midnight','forest','ocean','sakura']);
const EFFECTS=new Set(['sparkle','pixel-badge']);
const CATEGORIES=['themes','frames','titles','effects'];
const ROOT_CLASSES=[...THEMES].map(x=>'vocab-real-theme--'+x);
const EFFECT_CLASSES=[...EFFECTS].map(x=>'vocab-real-effect--'+x);

export function equippedCosmetics(shop){
 if(shop?.shopMode!=='production'||!Array.isArray(shop.owned)||!Array.isArray(shop.rewards))return {};
 const catalog=new Map(shop.rewards.map(r=>[r.reward_id,r]));
 const active={};
 for(const item of shop.owned){
   const reward=catalog.get(item.reward_id);
   if(item.equipped===true&&reward?.category===item.category&&CATEGORIES.includes(item.category))
     active[item.category]=item.reward_id;
 }
 return active;
}

export function studentIdentityView(shop,displayName='Student'){
 const active=equippedCosmetics(shop);
 const items=new Map((shop?.rewards??[]).map(r=>[r.reward_id,r]));
 const name=String(displayName||'Student').trim().slice(0,65)||'Student';
 const initials=name.split(/\s+/).slice(0,2).map(p=>p[0]?.toUpperCase()??'').join('');
 return {
   name,initials,active,
   title:active.titles?items.get(active.titles)?.name??'':'',
   frame:active.frames?rewardArtworkPath(active.frames):null,
   badge:active.effects?rewardArtworkPath(active.effects):null,
   effectName:active.effects?items.get(active.effects)?.name??'':'',
   themeName:active.themes?items.get(active.themes)?.name??'':''
 };
}
function avatar(identity,compact=false){
 return `<span class="vocab-student-identity__avatar${identity.frame?' has-frame':''}${identity.badge?' has-badge':''}" aria-hidden="true">
   ${identity.frame?`<img class="vocab-student-identity__frame" src="${identity.frame}" alt="" decoding="async">`:''}
   <span class="vocab-student-identity__initials">${escapeHtml(identity.initials)}</span>
   ${identity.badge?`<img class="vocab-student-identity__badge" src="${identity.badge}" alt="" decoding="async">`:''}
 </span>`;
}
export function renderIdentityShowcase(shop,displayName='Student'){
 const id=studentIdentityView(shop,displayName);
 const active=id.active;
 const extras=[
   id.title?`<span class="vocab-student-identity__title">${escapeHtml(id.title)}</span>`:'',
   id.effectName?`<span class="vocab-student-identity__detail">${escapeHtml(id.effectName)} equipped</span>`:'',
   id.themeName?`<span class="vocab-student-identity__detail">${escapeHtml(id.themeName)} active</span>`:''
 ].join('');
 return `<section class="vocab-real-cosmetics vocab-student-identity" data-real-cosmetics aria-label="Your student profile and equipped rewards">
   <div class="vocab-student-identity__portrait">${avatar(id)}</div>
   <div class="vocab-student-identity__text">
     <span class="vocab-student-identity__eyebrow">MY STUDENT PROFILE</span>
     <h2>${escapeHtml(id.name)}</h2>
     <div class="vocab-student-identity__extras">${extras||'<span class="vocab-student-identity__detail">Your reward showcase is ready to customise</span>'}</div>
   </div>
   <div class="vocab-student-identity__stamp">${Object.keys(active).length} / 4 equipped</div>
 </section>`;
}
export function applyRewardTheme(root,shop){
 if(!root?.classList)return {};
 root.classList.remove(...ROOT_CLASSES,...EFFECT_CLASSES);
 const active=equippedCosmetics(shop);
 if(THEMES.has(active.themes))root.classList.add('vocab-real-theme--'+active.themes);
 if(EFFECTS.has(active.effects))root.classList.add('vocab-real-effect--'+active.effects);
 return active;
}
export function decorateStudentIdentity(root,shop,displayName='Student'){
 const id=studentIdentityView(shop,displayName);
 const header=root?.querySelector?.('.vocab-topbar');
 if(!header)return;
 header.querySelector('[data-student-identity-mini]')?.remove();
 const chip=document.createElement('div');
 chip.dataset.studentIdentityMini='true';
 chip.className='vocab-student-identity-mini';
 chip.setAttribute('aria-label',id.name+(id.title?' · '+id.title:'')+(id.effectName?' · '+id.effectName:''));
 chip.innerHTML=avatar(id,true)+`<span class="vocab-student-identity-mini__name">${escapeHtml(id.name)}${id.title?`<small>${escapeHtml(id.title)}</small>`:''}</span>`;
 // The course code and navigation remain accessible; add a compact identity at
 // the far end without replacing the existing page header controls.
 header.append(chip);
}
export function renderEquippedCosmetics(root,shop,displayName='Student'){
 const home=root?.querySelector?.('.vocab-shell--home');
 applyRewardTheme(root,shop);
 if(!home)return;
 home.querySelector('[data-real-cosmetics]')?.remove();
 const hero=home.querySelector('.vocab-hero--home');
 if(!hero)return;
 hero.insertAdjacentHTML('afterend',renderIdentityShowcase(shop,displayName));
 decorateStudentIdentity(root,shop,displayName);
}
