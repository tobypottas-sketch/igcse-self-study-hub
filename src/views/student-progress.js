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
const kpis = g => '<div class="sp-stats">'+stat('Recorded time · estimate',duration(g.estimatedSeconds),g.timeRecords+' students with time records')+stat('Recorded practice',g.activeLearners==null?'Unavailable':g.activeLearners+' / '+g.enrolled,'Students practising · selected period')+stat('Activities completed',metric(g.completedActivities),'Missions, assessments & submissions · period')+stat('Merits awarded',metric(g.awardedMerits),'Vocabulary · lifetime')+stat('Pending merits',metric(g.pendingMerits),'Vocabulary · lifetime')+'</div>';
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
  const peak=Math.max(0,...days.map(d=>d.count));
  const step=Math.max(1,Math.ceil(peak/4));
  const max=step*4;
  const weekdays=new Intl.DateTimeFormat('en-GB',{weekday:'short',timeZone:'Asia/Shanghai'});
  return '<div class="sp-chart" role="img" aria-label="'+attr(days.map(d=>d.key+': '+d.count+' learners').join('; '))+'"><div class="sp-plot" style="--days:'+days.length+'"><div class="sp-axis">'+[4,3,2,1,0].map(n=>'<span>'+n*step+'</span>').join('')+'</div><div class="sp-plot-body"><div class="sp-gridlines" aria-hidden="true">'+[0,1,2,3,4].map(()=>'<i></i>').join('')+'</div><div class="sp-columns">'+days.map(d=>'<div class="sp-column" title="'+attr(d.key+': '+d.count+' students')+'"><div class="sp-column-mark" style="--value:'+100*d.count/max+'%"><span class="sp-column-count">'+d.count+'</span><i class="sp-column-bar'+(d.count===peak&&peak>0?' is-peak':'')+'"></i></div><div class="sp-column-date">'+(days.length<=7?h(weekdays.format(new Date(d.key+'T12:00:00+08:00')))+'<small>'+h(d.key.slice(5))+'</small>':h(d.key.slice(5)))+'</div></div>').join('')+'</div></div></div></div>';
}
function card(c,period,detail=false) {
  const participation=c.participation==null?'—':pct(c.participation);
  return '<article class="sp-card sp-class-card"><button type="button" class="sp-class-link" data-action="sp-class" data-class-id="'+attr(c.classId)+'"><strong>'+h(c.className??'Class')+'</strong><span aria-hidden="true">›</span></button><div class="sp-class-main"><div><div class="sp-rate">'+participation+'</div><p class="sp-muted">'+val(c.activeLearners)+' / '+c.enrolled+' practising</p></div><div class="sp-ring" role="img" aria-label="'+attr('Participation '+participation)+'" style="--rate:'+Math.round((c.participation??0)*100)+'%"></div></div>'+'<div class="sp-mini"><div><small>Time · est.</small><strong>'+h(duration(c.estimatedSeconds))+'</strong></div><div><small>Completed</small><strong>'+metric(c.completedActivities)+'</strong></div><div><small>Merits awarded</small><strong>'+metric(c.awardedMerits)+'</strong></div></div>'+(detail?'<h3 class="sp-chart-title">Daily participation · students</h3>'+daily(c,period):'')+'<div class="sp-card-foot"><span>'+val(c.learningAreasUsed)+' learning areas</span>'+button('sp-merits',c.pendingMerits==null?'Merits unavailable':c.pendingMerits+' pending merits','data-class-id="'+attr(c.classId)+'"')+'</div></article>';
}
function engagementPanel(g){
 const known=g.participation!=null;
 const share=known?Math.round(g.participation*100):null;
 return '<section class="sp-engagement"><p class="sp-kicker">Engagement snapshot</p><div class="sp-engagement-ring" style="--rate:'+(share??0)+'%"><div><strong>'+(share==null?'—':share+'%')+'</strong><small>participation</small></div></div><div class="sp-engagement-numbers"><div><strong>'+val(g.activeLearners)+'</strong><span>Practising</span></div><div><strong>'+val(known?g.enrolled-g.activeLearners:null)+'</strong><span>No recorded practice</span></div></div><p>'+g.enrolled+' enrolled'+(g.unknown?' · '+g.unknown+' unknown':'')+'</p></section>';
}
function cohortTrend(model,period){
 const students=model.classes.flatMap(c=>c.students);
 return '<div class="sp-analytics-row"><section class="sp-trend"><div class="sp-panel-head"><div><p class="sp-kicker">Learning activity</p><h2>Daily participation</h2><p class="sp-muted">Unique students with recorded practice per day</p></div><span class="sp-chart-key"><i></i> Students</span></div>'+daily({...model.totals,students},period)+'</section>'+engagementPanel(model.totals)+'</div>';
}
function classRanking(model){
 const classes=[...model.classes].sort((a,b)=>(b.participation??-1)-(a.participation??-1));
 return '<section class="sp-rankings"><div class="sp-panel-head"><div><p class="sp-kicker">Compare your classes</p><h2>Class performance</h2></div><span class="sp-muted">By recorded participation</span></div><div class="sp-ranking-table"><table><thead><tr><th>Class</th><th>Participation</th><th>Practising</th><th>Time · est.</th><th>Completed</th><th>Pending merits</th></tr></thead><tbody>'+classes.map(c=>'<tr><td>'+button('sp-class',c.className??'Class','data-class-id="'+attr(c.classId)+'"')+'</td><td><div class="sp-ranking-meter"><div class="sp-track"><span style="width:'+Math.round((c.participation??0)*100)+'%"></span></div><strong>'+pct(c.participation)+'</strong></div></td><td>'+val(c.activeLearners)+' / '+c.enrolled+'</td><td>'+h(duration(c.estimatedSeconds))+'</td><td>'+metric(c.completedActivities)+'</td><td>'+button('sp-merits',c.pendingMerits==null?'Unavailable':String(c.pendingMerits),'data-class-id="'+attr(c.classId)+'"')+'</td></tr>').join('')+'</tbody></table></div></section>';
}
function classInsights(c){
 const timed=c.students.filter(s=>Number.isFinite(s.estimatedSeconds)&&s.estimatedSeconds>0).sort((a,b)=>b.estimatedSeconds-a.estimatedSeconds);
 const unrecorded=c.students.filter(s=>s.practiceState==='no-records'&&s.activeDays===0);
 const unknown=c.students.filter(s=>!['recorded','no-records'].includes(s.practiceState)||s.activeDays==null);
 const activeModules=c.modules.filter(m=>m.recordedLearners>0).sort((a,b)=>b.recordedLearners-a.recordedLearners);
 const checks=c.students.flatMap(s=>(s.unitChecks??[]).filter(r=>Number.isFinite(r.latestScore)));
 const link=s=>button('sp-student',s.displayName??'Student','data-student-id="'+attr(s.studentId)+'"');
 const leader=timed.slice(0,3).map((s,i)=>'<li><span class="sp-rank">'+(i+1)+'</span>'+link(s)+'<strong>'+h(duration(s.estimatedSeconds))+'</strong></li>').join('');
 const absent=unrecorded.slice(0,4).map(s=>'<li>'+link(s)+'</li>').join('');
 const skills=activeModules.map(m=>'<div class="sp-skill"><div><span>'+h(labels[m.appKey]??m.appKey)+'</span><strong>'+m.recordedLearners+' / '+c.enrolled+'</strong></div><div class="sp-track"><span style="width:'+Math.round(100*m.recordedLearners/Math.max(c.enrolled,1))+'%"></span></div></div>').join('');
 return '<section class="sp-insights" aria-label="Class insights"><div class="sp-section-head"><div><p class="sp-kicker">At a glance</p><h2>Class insights</h2></div><span class="sp-muted">Selected period unless noted</span></div><div class="sp-insight-grid"><article class="sp-card"><h3>Most recorded time</h3><p class="sp-muted">Estimated minutes · top 3</p><ol class="sp-insight-list">'+(leader||'<li>No recorded time.</li>')+'</ol><p class="sp-insight-foot">'+(timed.length?h(duration(c.estimatedSeconds/timed.length))+' average per student with time records':'Time evidence unavailable')+'</p>'+button('sp-insight-time','View time ranking')+'</article><article class="sp-card"><h3>No recorded practice <span class="sp-insight-number">'+unrecorded.length+'</span></h3><p class="sp-muted">Not a judgement of ability or effort.</p><ul class="sp-insight-list">'+(absent||'<li>None among students with known evidence.</li>')+'</ul><p class="sp-insight-foot">'+(unknown.length?unknown.length+' students with unavailable practice evidence':'All roster practice states known')+'</p>'+button('sp-insight-inactive','View students without practice')+'</article><article class="sp-card"><h3>Learning areas</h3><p class="sp-muted">Students with recorded practice by area</p><div class="sp-skills">'+(skills||'<p class="sp-muted">No recorded learning-area activity.</p>')+'</div></article><article class="sp-card"><h3>Vocabulary assessment</h3><p class="sp-muted">Latest recorded Unit Check per student and unit · historical</p><div class="sp-insight-big">'+(checks.length?Math.round(100*checks.reduce((n,r)=>n+r.latestScore,0)/(10*checks.length))+'%':'—')+'</div><p>'+checks.length+' student–unit results from '+c.students.filter(s=>(s.unitChecks??[]).some(r=>Number.isFinite(r.latestScore))).length+' students</p><small>Assessment snapshot, not measured improvement.</small></article></div></section>';
}
function studentRows(c,state) {
  const query=String(state.search??'').toLowerCase();
  const rows=c.students.filter(s=>(!state.meritsOnly||s.pendingMerits>0)&&(!state.inactiveOnly||(s.practiceState==='no-records'&&s.activeDays===0))&&[s.displayName,s.studentNumber].some(v=>String(v??'').toLowerCase().includes(query)));
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
  return '<div class="sp-tools"><label>Search students <input data-sp-search value="'+attr(state.search??'')+'" placeholder="Name or school number"></label><label>Sort <select data-sp-sort>'+[['name','Name'],['days','Active days'],['time','Recorded time'],['completed','Activities completed'],['awarded','Merits awarded'],['recent','Last practice'],['merits','Pending merits']].map(([v,l])=>'<option value="'+v+'" '+(sort===v?'selected':'')+'>'+l+'</option>').join('')+'</select></label>'+button('sp-toggle-merits',state.meritsOnly?'Show all students':'Pending merits only')+(state.inactiveOnly?button('sp-clear-inactive','Show all practice states'):'')+'</div><div class="sp-table-wrap"><table class="sp-table"><thead><tr><th>Student</th><th>Last practice in period</th><th>Active days</th><th>Time · est.</th><th>Completed</th><th>Awarded merits</th><th>Recent module</th><th>Pending merits</th></tr></thead><tbody>'+rows+'</tbody></table><p class="sp-muted" data-sp-no-students'+(rows?' hidden':'')+'>'+(state.meritsOnly&&c.pendingMerits==null?'Pending merit evidence is not available yet.':'No matching students.')+'</p></div>';
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
function studentDetail(s) {
 const checks=(s.unitChecks??[]).map(c=>'<tr><td>Unit '+h(c.unitNumber)+'</td><td>'+val(c.latestScore)+' / 10</td><td>'+val(c.bestScore)+' / 10</td><td>'+val(c.attemptsUsed)+'</td></tr>').join('');
 const activity=(s.recentActivity??[]).map(r=>'<li><strong>'+h(labels[r.appKey]??r.appKey)+'</strong><span>'+h(r.label??'')+' · '+h(new Date(r.occurredAt).toLocaleString('en-GB',{timeZone:SCHOOL_TIME_ZONE,day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))+'</span></li>').join('');
 return '<div class="sp-section-head"><h2>'+h(s.displayName??'Student')+'</h2>'+button('sp-student-back','‹ Back to class')+'</div><div class="sp-stats">'+stat('Recorded time · estimate',duration(s.estimatedSeconds),'Selected period')+stat('Active days',metric(s.activeDays),'Selected period')+stat('Completed activities',metric(s.completedActivities),'Selected period')+stat('Merits awarded',metric(s.awardedMerits),'Lifetime')+stat('Pending merits',metric(s.pendingMerits),'Lifetime')+'</div><div class="sp-profile-grid"><section class="sp-card"><h3>Recent learning activity</h3><ul class="sp-activity-list">'+(activity||'<li>No recent recorded activity.</li>')+'</ul></section><section class="sp-card"><h3>Vocabulary unit checks</h3>'+(checks?'<div class="sp-table-wrap"><table class="sp-table"><thead><tr><th>Unit</th><th>Latest</th><th>Best</th><th>Attempts</th></tr></thead><tbody>'+checks+'</tbody></table></div>':'<p class="sp-muted">No recorded unit checks.</p>')+'<h3>Vocabulary progress</h3><p>'+(s.unitPathways==null?'Mastery details loading…':s.unitPathways.length+' units with contextual mastery records')+'</p>'+button('sp-full-student','Open full Vocabulary record','data-student-id="'+attr(s.studentId)+'"')+'</section></div>';
}
export function renderStudentProgress(root,state,{resultsOnly=false}={}) {
 const model=buildClassOverview(state.snapshot);
 const group=model.classes.find(c=>c.classId===state.classId);
 const totals=model.totals;
 const selected=group?.students.find(s=>s.studentId===state.studentId);
 const tabs=['overview','students','learning'];
 let body='';
 if(state.awaitingDates) body='<p role="status">Choose your dates and select Apply dates.</p>';
 else if(state.loading&&!model.available) body='<p role="status">Loading student progress…</p>';
 else if(!model.available) body='<p role="alert">Student progress is unavailable.</p>'+button('sp-refresh','Try again');
 else if(selected) body=studentDetail(selected);
 else if(group) body=kpis(group)+'<div class="sp-tabs">'+tabs.map(t=>button('sp-tab',({overview:'Overview',students:'Students',learning:'Learning areas'})[t],'data-tab="'+t+'" aria-pressed="'+(state.tab===t)+'"')).join('')+'</div>'+(state.tab==='students'?table(group,state):state.tab==='learning'?modules(group):classInsights(group)+'<div class="sp-detail-grid">'+card(group,state.period,true)+'<section class="sp-detail-side"><h2>Student comparison</h2><p class="sp-muted">Select a student to open their existing detailed progress record.</p>'+table(group,state)+'</section>');
 else body=kpis(totals)+cohortTrend(model,state.period)+classRanking(model)+'<div class="sp-section-head"><div><p class="sp-kicker">Class overview</p><h2>My classes <span>'+totals.classes+'</span></h2></div><span class="sp-muted">'+totals.enrolled+' enrolled students</span></div><div class="sp-grid">'+model.classes.map(c=>card(c,state.period)).join('')+'</div>'+(!model.classes.length?'<p>No authorised active classes.</p>':'');
 const status=state.refreshing?'<div class="sp-load-status" role="status"><i></i> Refreshing… showing the previous snapshot.</div>':state.snapshot?.detailsPending?'<div class="sp-load-status" role="status"><i></i> Usage ready · loading mastery and pending merits…</div>':'';
 const results=status+(state.error?'<p role="alert">'+h(state.error)+'</p>':'')+(model.preview?'<p>Illustrative preview data</p>':'')+body;
 if (resultsOnly) {
   const target=root.querySelector('[data-sp-results]');
   if (target) target.innerHTML=results;
   return;
 }
 const nav=(action,label,icon,active,extra='')=>'<button type="button" class="sp-nav-link'+(active?' is-current':'')+'" data-action="'+action+'" '+extra+'><span aria-hidden="true">'+icon+'</span>'+h(label)+'</button>';
 const classNav=model.classes.map(c=>nav('sp-class',c.className??'Class','›',c.classId===state.classId,'data-class-id="'+attr(c.classId)+'"')).join('');
 const dateControls='<div class="sp-tools sp-period-tools"><label>Reporting period <select data-sp-period>'+periods.map(([k,l])=>'<option value="'+k+'" '+(state.kind===k?'selected':'')+'>'+l+'</option>').join('')+'</select></label>'+(state.kind==='custom'?'<label>From <input type="date" data-sp-from value="'+attr(state.from??'')+'"></label><label>To <input type="date" data-sp-to value="'+attr(state.to??'')+'"></label>'+button('sp-apply','Apply dates'):'')+'</div>';
 root.innerHTML='<section class="sp-shell sp-editorial"><aside class="sp-sidebar"><div class="sp-brand"><span class="sp-brand-mark" aria-hidden="true">◫</span><div><strong>LEARNING</strong><small>INTELLIGENCE</small></div></div><p class="sp-nav-caption">WORKSPACE</p><nav aria-label="Student Progress navigation">'+nav('sp-all','Overview','▦',!state.classId)+(group?nav('sp-tab','Class overview','▤',!selected&&state.tab==='overview','data-tab="overview"')+nav('sp-tab','Students','◉',!selected&&state.tab==='students','data-tab="students"')+nav('sp-tab','Learning areas','▥',!selected&&state.tab==='learning','data-tab="learning"'):'')+'</nav><p class="sp-nav-caption">REPORTING PERIOD</p>'+dateControls+'<details class="sp-class-nav"><summary>My classes <span>'+model.classes.length+'</span></summary><nav>'+classNav+'</nav></details><div class="sp-sidebar-foot">'+nav('sp-home','Back to Hub','←',false)+'</div></aside><main class="sp-workspace"><div class="sp-top"><span class="sp-breadcrumb">Teacher analytics / '+h(selected?'Student':group?'Class':'Overview')+'</span>'+button('sp-refresh','↻ Refresh')+'</div><header><div><p class="sp-kicker">Teacher workspace</p><h1>'+h(selected?.displayName??group?.className??'Student Progress')+'</h1><h2>'+h(selected?'Individual learning record':group?'Class learning analytics':'My classes at a glance')+'</h2></div>'+button('sp-back',state.studentId?'‹ Back to class':state.classId?'‹ All classes':'‹ Back to Hub')+'</header><div data-sp-results>'+results+'</div><footer>Recorded time is a legacy estimate, not verified active learning time; coverage varies and missing time is shown as —. Completed activities are recorded events, not exam grades. Merits are lifetime Vocabulary totals. School time: Asia/Shanghai.</footer></main></section>';
}
