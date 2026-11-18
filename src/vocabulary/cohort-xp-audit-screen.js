// Admin-only read-only cohort XP reconciliation screen.
// The Edge Function rechecks privileges; this client holds no service key.
const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const count=value=>Number.isSafeInteger(value)&&value>=0?value:0;
const fmt=value=>count(value).toLocaleString('en');
export function aggregateCohortAudit(pages){
 const total={examined:0,totalStudents:0,withMissions:0,zeroXp:0,timeZoneSensitive:0,missingWallets:0,walletDiscrepancies:0,earnedXpSum:0,withoutMissionsWithXp:0,masteryWithoutMissions:0,components:{missions:0,personalBests:0,weeklyGoals:0,achievements:0,stageClears:0,pathwayMasteries:0,unitMasteries:0},pages:pages.length};
 for(const page of pages){
  if(!page||page.ok!==true||page.auditOnly!==true||page.readyForWalletFunding!==false||
    !Number.isInteger(page.examined)||page.examined<0||
    !page.summary||!Number.isInteger(page.totalStudents))
    throw new Error('The audit returned incomplete or unsafe results.');
  total.examined+=page.examined;total.totalStudents=page.totalStudents;
  for(const key of ['withMissions','zeroXp','timeZoneSensitive','missingWallets','walletDiscrepancies','earnedXpSum','withoutMissionsWithXp','masteryWithoutMissions']){
   const value=page.summary[key];
   if(!Number.isSafeInteger(value)||value<0)throw new Error('The audit returned an invalid '+key+' count.');
   total[key]+=value;
  }
  for(const key of Object.keys(total.components)){
   const value=page.summary.components?.[key];
   if(!Number.isSafeInteger(value)||value<0)throw new Error('The audit returned an invalid XP component.');
   total.components[key]+=value;
  }
  if(Object.values(page.summary.components).reduce((a,b)=>a+b,0)!==page.summary.earnedXpSum)throw new Error('XP components did not reconcile.');
 }
 if(Object.values(total.components).reduce((a,b)=>a+b,0)!==total.earnedXpSum)throw new Error('Lifetime XP totals did not reconcile.');
 if(total.examined!==total.totalStudents)throw new Error('The full student cohort was not examined.');
 return total;
}
export function renderCohortAudit(root,{pages=[],loading=false,error='',complete=false}={}){
 const current=pages.length?pages[pages.length-1]:null;
 const examined=pages.reduce((sum,page)=>sum+count(page.examined),0);
 const expected=count(current?.totalStudents);
 const pct=expected?Math.min(100,Math.round(100*examined/expected)):0;
 const summary=complete?aggregateCohortAudit(pages):null;
 const tile=(value,label)=>`<div class="vocab-cohort-tile"><strong>${fmt(value)}</strong><span>${safe(label)}</span></div>`;
 root.innerHTML=`<main class="vocab-shell vocab-cohort-audit">
 <header class="vocab-topbar"><a href="./vocabulary.html" class="vocab-back">← Teacher analytics</a><span>Admin · Read-only audit</span></header>
 <section class="vocab-cohort-header"><span class="vocab-kicker">XP Rewards Shop · Release readiness</span>
 <h1>Student XP reconciliation</h1>
 <p>Audit real vocabulary practice and mastery XP across all active students before enabling the Rewards Shop. This page cannot award XP, change wallets or make purchases.</p>
 <div class="vocab-cohort-guard">Read-only · No student balances are changed · No real purchases are enabled</div></section>
 <section class="vocab-cohort-body" aria-live="polite">
 <div class="vocab-cohort-run"><div><h2>Cohort scan</h2><p>${complete?'Full audit complete':loading?'Scanning active student accounts…':error?'The audit did not complete.': 'Ready to check the complete cohort.'}</p></div>
 <button type="button" data-action="run-cohort-audit" ${loading?'disabled':''}>${loading?'Checking…':complete?'Run audit again':'Run full read-only audit'}</button></div>
 <div class="vocab-cohort-track" role="progressbar" aria-label="Students examined" aria-valuemin="0" aria-valuemax="${expected||100}" aria-valuenow="${examined}"><span style="width:${pct}%"></span></div>
 <p class="vocab-cohort-count">${fmt(examined)} of ${expected?fmt(expected):'—'} students checked · ${pages.length} batches</p>
 ${error?`<p class="vocab-cohort-error" role="alert">${safe(error)}</p>`:''}
 ${summary?`<div class="vocab-cohort-tiles">
 ${tile(summary.examined,'Students examined')}${tile(summary.withMissions,'With recorded missions')}
 ${tile(summary.zeroXp,'Zero calculated XP')}${tile(summary.timeZoneSensitive,'Timezone differences')}
 ${tile(summary.missingWallets,'Wallets not initialised')}${tile(summary.walletDiscrepancies,'Wallet discrepancies')}
 ${tile(summary.earnedXpSum,'Total lifetime XP (all students)')}
 ${tile(summary.masteryWithoutMissions,'Mastery records without missions')}
 ${tile(summary.withoutMissionsWithXp,'Earned XP without missions')}</div>
 <section class="vocab-cohort-breakdown"><h2>Where student XP comes from</h2><div class="vocab-cohort-tiles">
 ${tile(summary.components.missions,'Completed missions')}
 ${tile(summary.components.personalBests,'Personal bests')}
 ${tile(summary.components.weeklyGoals,'Weekly goals')}
 ${tile(summary.components.achievements,'Achievements')}
 ${tile(summary.components.stageClears,'Passed stages')}
 ${tile(summary.components.pathwayMasteries,'Mastered pathways')}
 ${tile(summary.components.unitMasteries,'Mastered units')}
 </div><p class="vocab-cohort-footnote">These seven components must add up exactly to the lifetime total. No XP has been credited.</p></section>
 <p class="vocab-cohort-footnote">This is a reconciliation report, not authorisation to fund wallets. Students with no missions may still have mastery or achievement XP.</p>`:''}
 </section></main>`;
}
export async function startVocabularyCohortAudit({root,client,profile}){
 if(profile?.role!=='admin'){root.textContent='Administrator access required.';return;}
 let running=false;
 const run=async()=>{
  if(running)return;running=true;
  const pages=[];let error='';
  renderCohortAudit(root,{loading:true});
  try{
   for(let page=0;page<100;page++){
    const response=await client.functions.invoke('vocabulary-reward-cohort-audit',{body:{page}});
    if(response.error||response.data?.ok!==true||response.data?.auditOnly!==true||
       response.data?.readyForWalletFunding!==false||response.data?.page!==page)
     throw new Error('Could not verify cohort batch '+(page+1)+'. No credits were changed.');
    pages.push(response.data);
    if(response.data.more===false){
      aggregateCohortAudit(pages);renderCohortAudit(root,{pages,complete:true});return;
    }
    if(response.data.more!==true)throw new Error('The audit did not confirm whether all student batches were checked.');
    renderCohortAudit(root,{pages,loading:true});
   }
   throw new Error('Too many batches; the audit was not completed.');
  }catch(e){error=e instanceof Error?e.message:'The XP audit could not be completed.';
   renderCohortAudit(root,{pages,error});
  }finally{running=false;}
 };
 root.addEventListener('click',event=>{
  if(event.target?.closest?.('[data-action="run-cohort-audit"]'))void run();
 });
 renderCohortAudit(root);
}
