import { escapeHtml as h } from './html.js';
import { buildClassOverview } from '../reporting/student-progress-overview.js';
import { schoolDay, SCHOOL_TIME_ZONE, timestampOf } from '../reporting/periods.js';

const labels = { vocabulary_paraphrase:'Vocabulary & Paraphrase Builder', email_writing:'Informal Email Writing', essay_writing:'Essay Writing', review_writing:'Review Writing', reading:'Reading', listening:'Listening', paraphrasing:'Standalone Paraphrasing' };
const periods = [['thisWeek','This week'],['today','Today'],['last7','Last 7 days'],['last30','Last 30 days'],['custom','Custom']];
const val = x => x == null ? 'Unavailable' : h(String(x));
const pct = x => x == null ? 'Unavailable' : Math.round(x*100)+'%';
const attr = h;
const duration = s => s == null ? '—' : (s<60 ? '<1 min' : Math.floor(s/60).toLocaleString('en-GB')+' min');
const metric = x => x == null ? '—' : Number(x).toLocaleString('en-GB');
const kpis = g => '<div class="sp-stats">'+stat('Recorded practice',g.activeLearners==null?'Unavailable':g.activeLearners+' / '+g.enrolled,'Students practising · selected period')+stat('Recorded time · estimate',duration(g.estimatedSeconds),g.timeRecords+' students with time records')+stat('Activities completed',metric(g.completedActivities),'Missions, assessments & submissions · period')+stat('Merits awarded',metric(g.awardedMerits),'Vocabulary · lifetime')+stat('Pending merits',metric(g.pendingMerits),'Vocabulary · lifetime')+'</div>';
const button = (action,label,extra='') => '<button type="button" class="sp-button" data-action="'+action+'" '+extra+'>'+h(label)+'</button>';
const stat = (label,value,detail='') => '<div class="sp-stat"><span>'+h(label)+'</span><strong>'+val(value)+'</strong><small>'+h(detail)+'</small></div>';
function daily(group,period) {
  if (!group.enrolled) return '<p class="sp-muted">No enrolled students.</p>';
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
  return '<div class="sp-chart" role="img" aria-label="'+attr(days.map(d=>d.key+': '+d.count+' learners').join('; '))+'">'+days.map(d=>'<div class="sp-chart-day" title="'+attr(d.key+': '+d.count)+'"><span class="sp-chart-count">'+d.count+'</span><span class="sp-bar" style="--height:'+Math.round(100*d.count/Math.max(group.enrolled,1))+'%"></span><small>'+h(d.key.slice(5))+'</small></div>').join('')+'</div>';
}
function card(c,period,detail=false) {
  const participation=c.participation==null?'—':pct(c.participation);
  return '<article class="sp-card sp-class-card"><button type="button" class="sp-class-link" data-action="sp-class" data-class-id="'+attr(c.classId)+'"><strong>'+h(c.className??'Class')+'</strong><span aria-hidden="true">›</span></button><div class="sp-class-main"><div><div class="sp-rate">'+participation+'</div><p class="sp-muted">'+val(c.activeLearners)+' / '+c.enrolled+' practising</p></div><div class="sp-ring" role="img" aria-label="'+attr('Participation '+participation)+'" style="--rate:'+Math.round((c.participation??0)*100)+'%"></div></div>'+ (c.participation==null?'':'<div class="sp-track"><span style="width:'+Math.round(c.participation*100)+'%"></span></div>')+'<div class="sp-mini"><div><small>Time · est.</small><strong>'+h(duration(c.estimatedSeconds))+'</strong></div><div><small>Completed</small><strong>'+metric(c.completedActivities)+'</strong></div><div><small>Merits awarded</small><strong>'+metric(c.awardedMerits)+'</strong></div></div>'+(detail?'<h3 class="sp-chart-title">Daily participation · students</h3>'+daily(c,period):'')+'<div class="sp-card-foot"><span>'+val(c.learningAreasUsed)+' learning areas</span>'+button('sp-merits',c.pendingMerits==null?'Merits unavailable':c.pendingMerits+' pending merits','data-class-id="'+attr(c.classId)+'"')+'</div></article>';
}
function cohortTrend(model,period){
 const students=model.classes.flatMap(c=>c.students);
 return '<section class="sp-trend"><div><p class="sp-kicker">Learning activity</p><h2>Daily participation</h2><p class="sp-muted">Unique students with recorded practice each day</p></div>'+daily({...model.totals,students},period)+'</section>';
}
function studentRows(c,state) {
  const query=String(state.search??'').toLowerCase();
  const rows=c.students.filter(s=>(!state.meritsOnly||s.pendingMerits>0)&&[s.displayName,s.studentNumber].some(v=>String(v??'').toLowerCase().includes(query)));
  const sort=state.sort??'name';
  if(sort==='time') rows.sort((a,b)=>(b.estimatedSeconds??-1)-(a.estimatedSeconds??-1));
  if(sort==='completed') rows.sort((a,b)=>(b.completedActivities??-1)-(a.completedActivities??-1));
  if(sort==='awarded') rows.sort((a,b)=>(b.awardedMerits??-1)-(a.awardedMerits??-1));
  if(sort==='days') rows.sort((a,b)=>(b.activeDays??-1)-(a.activeDays??-1));
  if(sort==='merits') rows.sort((a,b)=>(b.pendingMerits??-1)-(a.pendingMerits??-1));
  if(sort==='recent') rows.sort((a,b)=>(timestampOf(b.lastPractice) || 0)-(timestampOf(a.lastPractice) || 0));
  return rows.map(s=>'<tr><td>'+button('sp-student',s.displayName??'Student','data-student-id="'+attr(s.studentId)+'"')+'<small>'+h(s.studentNumber??'')+'</small></td><td>'+h(s.lastPractice?new Date(s.lastPractice).toLocaleString('en-GB',{timeZone:SCHOOL_TIME_ZONE,day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):s.activeDays==null?'Unavailable':'No recorded practice')+'</td><td>'+val(s.activeDays)+'</td><td>'+h(duration(s.estimatedSeconds))+'</td><td>'+metric(s.completedActivities)+'</td><td>'+metric(s.awardedMerits)+'</td><td>'+h(labels[s.recentModule]??'—')+'</td><td>'+val(s.pendingMerits)+'</td></tr>').join('');
}
function table(c,state) {
  const sort=state.sort??'name';
  const rows=studentRows(c,state);
  return '<div class="sp-tools"><label>Search students <input data-sp-search value="'+attr(state.search??'')+'" placeholder="Name or school number"></label><label>Sort <select data-sp-sort>'+[['name','Name'],['days','Active days'],['time','Recorded time'],['completed','Activities completed'],['awarded','Merits awarded'],['recent','Last practice'],['merits','Pending merits']].map(([v,l])=>'<option value="'+v+'" '+(sort===v?'selected':'')+'>'+l+'</option>').join('')+'</select></label>'+button('sp-toggle-merits',state.meritsOnly?'Show all students':'Pending merits only')+'</div><div class="sp-table-wrap"><table class="sp-table"><thead><tr><th>Student</th><th>Last practice in period</th><th>Active days</th><th>Time · est.</th><th>Completed</th><th>Awarded merits</th><th>Recent module</th><th>Pending merits</th></tr></thead><tbody>'+rows+'</tbody></table><p class="sp-muted" data-sp-no-students'+(rows?' hidden':'')+'>No matching students.</p></div>';
}
function modules(c) {
 return '<div class="sp-module-grid">'+c.modules.map(m=>'<article class="sp-card"><h3>'+h(labels[m.appKey]??m.appKey)+'</h3><strong>'+val(m.learners)+' / '+c.enrolled+'</strong><p>Students with recorded practice</p><small>'+(m.coverage==='limited'?'Limited coverage':'Recorded evidence')+(m.pilot?' · Academy pilot separate':'')+'</small>'+(['email_writing','essay_writing','review_writing'].includes(m.appKey)?button('writing-activity','Writing Activity'):'')+'</article>').join('')+'</div>';
}
export function updateProgressStudentRows(root,state) {
  const group=buildClassOverview(state.snapshot).classes.find(c=>c.classId===state.classId);
  const body=root.querySelector('.sp-table tbody');
  if (!group || !body) return;
  const rows=studentRows(group,state);
  body.innerHTML=rows;
  root.querySelector('[data-sp-no-students]').hidden=Boolean(rows);
}
export function renderStudentProgress(root,state,{resultsOnly=false}={}) {
 const model=buildClassOverview(state.snapshot);
 const group=model.classes.find(c=>c.classId===state.classId);
 const totals=model.totals;
 const tabs=['overview','students','learning'];
 let body='';
 if(state.awaitingDates) body='<p role="status">Choose your dates and select Apply dates.</p>';
 else if(state.loading) body='<p role="status">Loading student progress…</p>';
 else if(!model.available) body='<p role="alert">Student progress is unavailable.</p>'+button('sp-refresh','Try again');
 else if(group) body=kpis(group)+'<div class="sp-tabs">'+tabs.map(t=>button('sp-tab',({overview:'Overview',students:'Students',learning:'Learning areas'})[t],'data-tab="'+t+'" aria-pressed="'+(state.tab===t)+'"')).join('')+'</div>'+(state.tab==='students'?table(group,state):state.tab==='learning'?modules(group):'<div class="sp-detail-grid">'+card(group,state.period,true)+'<section class="sp-detail-side"><h2>Student comparison</h2><p class="sp-muted">Select a student to open their existing detailed progress record.</p>'+table(group,state)+'</section></div>');
 else body=kpis(totals)+cohortTrend(model,state.period)+'<div class="sp-section-head"><div><p class="sp-kicker">Class overview</p><h2>My classes <span>'+totals.classes+'</span></h2></div><span class="sp-muted">'+totals.enrolled+' enrolled students</span></div><div class="sp-grid">'+model.classes.map(c=>card(c,state.period)).join('')+'</div>'+(!model.classes.length?'<p>No authorised active classes.</p>':'');
 const results=(state.error?'<p role="alert">'+h(state.error)+'</p>':'')+(model.preview?'<p>Illustrative preview data</p>':'')+body;
 if (resultsOnly) {
   const target=root.querySelector('[data-sp-results]');
   if (target) target.innerHTML=results;
   return;
 }
 root.innerHTML='<section class="sp-shell"><div class="sp-top">'+button('sp-back',state.classId?'‹ All classes':'‹ Back to Hub')+button('sp-refresh','Refresh')+'</div><header><p class="sp-kicker">Teacher workspace</p><h1>Student Progress</h1><h2>'+h(group?.className??'My classes at a glance')+'</h2></header><div class="sp-tools"><label>Reporting period <select data-sp-period>'+periods.map(([k,l])=>'<option value="'+k+'" '+(state.kind===k?'selected':'')+'>'+l+'</option>').join('')+'</select></label>'+(state.kind==='custom'?'<label>From <input type="date" data-sp-from value="'+attr(state.from??'')+'"></label><label>To <input type="date" data-sp-to value="'+attr(state.to??'')+'"></label>'+button('sp-apply','Apply dates'):'')+'</div>'+'<div data-sp-results>'+results+'</div><footer>Recorded time is a legacy estimate, not verified active learning time; coverage varies and missing time is shown as —. Completed activities are recorded events, not exam grades. Merits are lifetime Vocabulary totals. School time: Asia/Shanghai.</footer></section>';
}
