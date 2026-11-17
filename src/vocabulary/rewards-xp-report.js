// Opt-in, read-only XP reconciliation display; no student identity or wallet writes.
import { XP_COMPONENTS } from './rewards-xp-parity.js';
const labels={missions:'Mission practice',personalBests:'Personal bests',weeklyGoals:'Weekly goals',achievements:'Achievements',stageClears:'Passed stages',pathwayMasteries:'Pathway mastery',unitMasteries:'Unit mastery'};
const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function buildXpParityReportText(report,client,server,timeZone='') {
 const lines=['Vocabulary Builder XP consistency check','Read-only; no rewards or XP were changed.','Result: '+String(report?.status??'unavailable').toUpperCase(),'Timezone: '+String(timeZone||'unknown')];
 if(['match','mismatch'].includes(report?.status)) {
   lines.push('Displayed XP: '+report.studentTotal,'Server XP: '+report.serverTotal);
   for(const key of XP_COMPONENTS) lines.push(labels[key]+': displayed '+client.parts[key]+' / server '+server.parts[key]);
   if(report.timezoneSensitive)lines.push('Timezone sensitivity detected.');
 } else lines.push('Comparison unavailable or invalid.');
 lines.push('NOT permission to credit wallets.');
 return lines.join('\n');
}
export function renderXpParityReport(report,client,server) {
 const status=report?.status??'unavailable',matched=status==='match';
 const headline=matched?'XP calculations agree':status==='mismatch'?'XP discrepancy found':'XP comparison unavailable';
 const explanation=matched?'Displayed and server totals match across all seven components. This is one check, not wallet funding approval.':status==='mismatch'?'The results disagree. Share this anonymous report with your teacher.':'Unable to compare right now. Your XP is unchanged.';
 const rows=['match','mismatch'].includes(status)?XP_COMPONENTS.map(key=>`<tr><th scope="row">${safe(labels[key])}</th><td>${client.parts[key]}</td><td>${server.parts[key]}</td><td>${client.parts[key]===server.parts[key]?'Matches':'Different'}</td></tr>`).join(''):'';
 const table=rows?`<div class="vocab-xp-audit__scroll"><table><caption>XP comparison details</caption><thead><tr><th scope="col">Source</th><th scope="col">Displayed</th><th scope="col">Server</th><th scope="col">Result</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row">Total XP</th><td>${report.studentTotal}</td><td>${report.serverTotal}</td><td>${matched?'Matches':'Check'}</td></tr></tfoot></table></div>`:'';
 return `<div class="vocab-xp-audit__head"><div><strong>${safe(headline)}</strong><p>${safe(explanation)}</p></div><span class="vocab-xp-audit__status">${matched?'Match':status==='mismatch'?'Review':'Unavailable'}</span></div>${table}${report?.timezoneSensitive?'<p class="vocab-xp-audit__note">UTC and China-time XP results may differ.</p>':''}<div class="vocab-xp-audit__footer"><span>Read-only · No personal identity in report</span>${rows?'<button type="button" data-action="copy-xp-audit-report">Copy results for teacher</button>':''}<small data-xp-audit-copy-status role="status" aria-live="polite"></small></div>`;
}
