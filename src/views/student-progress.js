import { escapeHtml as h } from './html.js';
import { buildClassOverview } from '../reporting/student-progress-overview.js';
import { schoolDay, SCHOOL_TIME_ZONE } from '../reporting/periods.js';

const labels = { vocabulary_paraphrase:'Vocabulary & Paraphrase Builder', email_writing:'Informal Email Writing', essay_writing:'Essay Writing', review_writing:'Review Writing', reading:'Reading', listening:'Listening', paraphrasing:'Standalone Paraphrasing' };
const periods = [['thisWeek','This week'],['today','Today'],['last7','Last 7 days'],['last30','Last 30 days'],['custom','Custom']];
const val = x => x == null ? 'Unavailable' : h(String(x));
const pct = x => x == null ? 'Unavailable' : Math.round(x*100)+'%';
const attr = h;
const button = (action,label,extra='') => '<button type="button" class="sp-button" data-action="'+action+'" '+extra+'>'+h(label)+'</button>';
const stat = (label,value,detail='') => '<div class="sp-stat"><span>'+h(label)+'</span><strong>'+val(value)+'</strong><small>'+h(detail)+'</small></div>';
function daily(group,period) {
  if (!period || group.unknown) return '<p class="sp-muted">Daily engagement unavailable.</p>';
  const start=Date.parse(schoolDay(period.start)+'T00:00:00+08:00');
  const end=Math.min(period.end-1,period.asOf);
  const days=[];
  for(let t=start;t<=end;t+=86400000) {
    const key=schoolDay(t);
    days.push({key,count:group.students.filter(s=>(s.activeDateKeys??[]).includes(key)).length});
    if(days.length>31) return '<p class="sp-muted">Select a period of up to 31 days for the daily chart.</p>';
  }
  if (!days.length) return '<p class="sp-muted">No elapsed days in this period.</p>';
  return '<div class="sp-chart" role="img" aria-label="'+attr(days.map(d=>d.key+': '+d.count+' learners').join('; '))+'">'+days.map(d=>'<div class="sp-chart-day" title="'+attr(d.key+': '+d.count)+'"><span class="sp-bar" style="--height:'+Math.round(100*d.count/Math.max(group.enrolled,1))+'%"></span><small>'+h(d.key.slice(5))+'</small></div>').join('')+'</div>';
}
function card(c,period) {
  return '<article class="sp-card"><button type="button" class="sp-class-link" data-action="sp-class" data-class-id="'+attr(c.classId)+'"><strong>'+h(c.className??'Class')+'</strong><span aria-hidden="true">›</span></button><p class="sp-muted">'+c.enrolled+' enrolled students</p><div class="sp-rate">'+pct(c.participation)+'</div><p>'+val(c.activeLearners)+' / '+c.enrolled+' learners with recorded practice</p>'+ (c.participation==null?'':'<div class="sp-track"><span style="width:'+Math.round(c.participation*100)+'%"></span></div>')+daily(c,period)+'<div class="sp-card-foot"><span>'+val(c.learningAreasUsed)+' learning areas</span>'+button('sp-merits',c.pendingMerits==null?'Merits unavailable':c.pendingMerits+' pending merits','data-class-id="'+attr(c.classId)+'"')+'</div></article>';
}
function table(c,state) {
  const query=String(state.search??'').toLowerCase();
  const rows=c.students.filter(s=>(!state.meritsOnly||s.pendingMerits>0)&&[s.displayName,s.studentNumber].some(v=>String(v??'').toLowerCase().includes(query)));
  const sort=state.sort??'name';
  if(sort==='days') rows.sort((a,b)=>(b.activeDays??-1)-(a.activeDays??-1));
  if(sort==='merits') rows.sort((a,b)=>(b.pendingMerits??-1)-(a.pendingMerits??-1));
  if(sort==='recent') rows.sort((a,b)=>String(b.lastPractice??'').localeCompare(String(a.lastPractice??'')));
  return '<div class="sp-tools"><label>Search students <input data-sp-search value="'+attr(state.search??'')+'" placeholder="Name or school number"></label><label>Sort <select data-sp-sort>'+[['name','Name'],['days','Active days'],['recent','Last practice'],['merits','Pending merits']].map(([v,l])=>'<option value="'+v+'" '+(sort===v?'selected':'')+'>'+l+'</option>').join('')+'</select></label>'+button('sp-toggle-merits',state.meritsOnly?'Show all students':'Pending merits only')+'</div><div class="sp-table-wrap"><table class="sp-table"><thead><tr><th>Student</th><th>Last practice</th><th>Active days</th><th>Learning areas</th><th>Recent module</th><th>Pending merits</th></tr></thead><tbody>'+rows.map(s=>'<tr><td>'+button('sp-student',s.displayName??'Student','data-student-id="'+attr(s.studentId)+'"')+'<small>'+h(s.studentNumber??'')+'</small></td><td>'+h(s.lastPractice?new Date(s.lastPractice).toLocaleString('en-GB',{timeZone:SCHOOL_TIME_ZONE,day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):s.activeDays==null?'Unavailable':'No recorded practice')+'</td><td>'+val(s.activeDays)+'</td><td>'+val(s.activeDays==null?null:s.learningAreas?.length??0)+'</td><td>'+h(labels[s.recentModule]??'—')+'</td><td>'+val(s.pendingMerits)+'</td></tr>').join('')+'</tbody></table>'+(!rows.length?'<p class="sp-muted">No matching students.</p>':'')+'</div>';
}
function modules(c) {
 return '<div class="sp-module-grid">'+c.modules.map(m=>'<article class="sp-card"><h3>'+h(labels[m.appKey]??m.appKey)+'</h3><strong>'+val(m.learners)+' / '+c.enrolled+'</strong><p>Students with recorded practice</p><small>Limited coverage'+(m.pilot?' · Academy pilot separate':'')+'</small>'+(['email_writing','essay_writing','review_writing'].includes(m.appKey)?button('writing-activity','Writing Activity'):'')+'</article>').join('')+'</div>';
}
export function renderStudentProgress(root,state) {
 const model=buildClassOverview(state.snapshot);
 const group=model.classes.find(c=>c.classId===state.classId);
 const totals=model.totals;
 const tabs=['overview','students','learning'];
 let body='';
 if(state.loading) body='<p role="status">Loading student progress…</p>';
 else if(!model.available) body='<p role="alert">Student progress is unavailable.</p>'+button('sp-refresh','Try again');
 else if(group) body='<div class="sp-tabs">'+tabs.map(t=>button('sp-tab',({overview:'Overview',students:'Students',learning:'Learning areas'})[t],'data-tab="'+t+'" aria-pressed="'+(state.tab===t)+'"')).join('')+'</div>'+(state.tab==='students'?table(group,state):state.tab==='learning'?modules(group):card(group,state.period));
 else body='<div class="sp-stats">'+stat('Classes',totals.classes,'With enrolled students')+stat('Students',totals.enrolled,'Current roster')+stat('Active learners',totals.activeLearners,'Selected period')+stat('Pending merits',totals.pendingMerits,'All time · Vocabulary')+'</div><div class="sp-grid">'+model.classes.map(c=>card(c,state.period)).join('')+'</div>'+(!model.classes.length?'<p>No authorised classes with enrolled students.</p>':'');
 root.innerHTML='<section class="sp-shell"><div class="sp-top">'+button('sp-back',group?'‹ All classes':'‹ Back to Hub')+button('sp-refresh','Refresh')+'</div><header><p class="sp-kicker">Teacher workspace</p><h1>Student Progress</h1><h2>'+h(group?.className??'My classes at a glance')+'</h2></header><div class="sp-tools"><label>Reporting period <select data-sp-period>'+periods.map(([k,l])=>'<option value="'+k+'" '+(state.kind===k?'selected':'')+'>'+l+'</option>').join('')+'</select></label>'+(state.kind==='custom'?'<label>From <input type="date" data-sp-from value="'+attr(state.from??'')+'"></label><label>To <input type="date" data-sp-to value="'+attr(state.to??'')+'"></label>'+button('sp-apply','Apply dates'):'')+'</div>'+(state.error?'<p role="alert">'+h(state.error)+'</p>':'')+(model.preview?'<p>Illustrative preview data</p>':'')+body+'<footer>Recorded practice only. Missing records do not indicate poor performance. Module coverage varies. School time: Asia/Shanghai.</footer></section>';
}
