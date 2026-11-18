// One stable home layout for asynchronously loaded student cosmetics and shops.
// Never insert reward cards independently into the page grid.
export function ensureRewardsDashboard(home){
 if(!home?.isConnected)return null;
 let layout=home.querySelector('[data-rewards-dashboard]');
 if(layout)return layout;
 layout=document.createElement('section');
 layout.className='vocab-rewards-dashboard';
 layout.dataset.rewardsDashboard='true';
 layout.setAttribute('aria-label','Your rewards and profile');
 layout.innerHTML='<div class="vocab-rewards-dashboard__main" data-rewards-dashboard-main></div>'+
  '<aside class="vocab-rewards-dashboard__side" data-rewards-dashboard-side aria-label="Test shop"></aside>';
 const units=home.querySelector('.vocab-unit-grid');
 const progress=home.querySelector('.vocab-progress-entry');
 const anchor=units??progress??home.querySelector('.vocab-engage-home')??home.querySelector('.vocab-hero');
 if(anchor)anchor.insertAdjacentElement('afterend',layout);
 else home.append(layout);
 return layout;
}
