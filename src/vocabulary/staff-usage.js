import { escapeHtml } from '../views/html.js';
import { fetchAllRows, fetchAllRowsForIds } from './teacher-paging.js';

const APP='vocabulary_paraphrase';
const DAY_MS=86400000;
const validDays=new Set([7,30,0]);
const number = value => Math.max(0,Number(value)||0).toLocaleString('en-GB');
const dateKey = date => new Date(date).toISOString().slice(0,10);
const formatDuration = seconds => {
  const minutes=Math.floor(Math.max(0,Number(seconds)||0)/60);
  const hours=Math.floor(minutes/60);
  return hours ? hours+'h '+String(minutes%60).padStart(2,'0')+'m' : minutes+'m';
};
function uniqueIds(rows,key) {return [...new Set(rows.map(row=>row[key]).filter(Boolean))];}
function scopeClassRows(classes,memberships,teacherAssignments,profile) {
  if(profile.role==='admin')return classes;
  const allowed=new Set(teacherAssignments.filter(row=>row.teacher_id===profile.id).map(row=>row.class_id));
  return classes.filter(row=>allowed.has(row.id));
}
export async function loadVocabularyStaffUsage(client,profile) {
  if(!client || !profile?.id || !['teacher','admin'].includes(profile.role))throw Error('Staff authorisation required.');
  const [classRows,membershipRows,assignments]=await Promise.all([
    fetchAllRows(()=>client.from('classes').select('id,class_name,active',{count:'exact'}).eq('active',true).order('id'),{label:'classes'}),
    fetchAllRows(()=>client.from('student_class_memberships').select('class_id,student_id,ended_at',{count:'exact'}).is('ended_at',null).order('class_id').order('student_id'),{label:'class memberships'}),
    profile.role==='admin'?Promise.resolve([]):
      fetchAllRows(()=>client.from('teacher_classes').select('teacher_id,class_id',{count:'exact'}).eq('teacher_id',profile.id).order('class_id'),{label:'teacher assignments'})
  ]);
  // Scope data before the student/event queries, never after the events have been fetched.
  const classes=scopeClassRows(classRows,membershipRows,assignments,profile);
  const permittedClassIds=new Set(classes.map(row=>row.id));
  const memberships=membershipRows.filter(row=>permittedClassIds.has(row.class_id));
  const permittedIds=uniqueIds(memberships,'student_id');
  const profiles=profile.role==='admin'
    ?await fetchAllRows(()=>client.from('profiles').select('id,display_name,role,active',{count:'exact'}).eq('role','student').eq('active',true).order('id'),{label:'student profiles'})
    :await fetchAllRowsForIds(permittedIds,ids=>client.from('profiles').select('id,display_name,role,active',{count:'exact'}).in('id',ids).eq('role','student').eq('active',true).order('id'),{label:'assigned class students'});
  const studentIds=uniqueIds(profiles,'id');
  const [events,mastery]=await Promise.all([
    fetchAllRowsForIds(studentIds,ids=>client.from('activity_events')
      .select('id,user_id,event_type,occurred_at,active_seconds',{count:'exact'})
      .eq('app_key',APP).in('user_id',ids).order('occurred_at').order('id'),{label:'Vocabulary activity'}),
    fetchAllRowsForIds(studentIds,ids=>client.from('vocabulary_global_mastery')
      .select('student_id,vocabulary_id,status',{count:'exact'})
      .in('student_id',ids).in('status',['building','secure']).order('student_id').order('vocabulary_id'),{label:'Vocabulary mastery'})
  ]);
  return {role:profile.role,classes,profiles,memberships,events,mastery};
}
export function calculateVocabularyUsage(data,{days=30,classId='all',studentId=null,now=new Date()}={}) {
  const dayCount=validDays.has(Number(days))?Number(days):30;
  const classes=data.classes??[];
  const chosenClass=classes.find(row=>row.id===classId)??null;
  const classStudents=new Set((data.memberships??[]).filter(row=>row.class_id===chosenClass?.id).map(row=>row.student_id));
  const scoped=(data.profiles??[]).filter(row=>!chosenClass||classStudents.has(row.id));
  const allowed=new Set(scoped.map(row=>row.id));
  const ending=new Date(now);
  const since=dayCount ? new Date(ending.getTime()-dayCount*DAY_MS) : null;
  const events=(data.events??[]).filter(row=>allowed.has(row.user_id) &&
    (!since || new Date(row.occurred_at)>=since) && new Date(row.occurred_at)<=ending);
  const students=new Map(scoped.map(row=>[row.id,{
    id:row.id,name:row.display_name||'Unnamed student',attempts:0,seconds:0,
    lastActive:null,activeDays:new Set(),wordsLearning:0,wordsSecure:0
  }]));
  // Current global status is not the same as complete five-stage mastery.
  for(const row of data.mastery??[])if(students.has(row.student_id)) {
    const student=students.get(row.student_id);
    if(row.status==='building'||row.status==='secure') student.wordsLearning++;
    if(row.status==='secure') student.wordsSecure++;
  }
  const daily=new Map();
  for(const row of events) {
    const user=students.get(row.user_id);
    if(!user)continue;
    const stamp=new Date(row.occurred_at);
    if(Number.isNaN(stamp.getTime()))continue;
    const day=dateKey(stamp);
    const isAttempt=row.event_type==='question_attempt';
    const activeSeconds=row.event_type==='active_time'?Math.max(0,Number(row.active_seconds)||0):0;
    if(!isAttempt&&!activeSeconds)continue;
    user.attempts+=isAttempt?1:0;
    user.seconds+=activeSeconds;
    user.activeDays.add(day);
    if(!user.lastActive||stamp>new Date(user.lastActive))user.lastActive=row.occurred_at;
    const bucket=daily.get(day)??{day,attempts:0,seconds:0,users:new Set()};
    bucket.attempts+=isAttempt?1:0;
    bucket.seconds+=activeSeconds;
    bucket.users.add(user.id);
    daily.set(day,bucket);
  }
  const studentRows=[...students.values()].map(row=>({...row,activeDays:row.activeDays.size}));
  studentRows.sort((a,b)=>b.attempts-a.attempts||b.seconds-a.seconds||a.name.localeCompare(b.name));
  const activeStudents=studentRows.filter(row=>row.lastActive!==null).length;
  const overview={
    studentCount:studentRows.length,activeStudents,
    attempts:studentRows.reduce((n,row)=>n+row.attempts,0),
    seconds:studentRows.reduce((n,row)=>n+row.seconds,0),
    wordsLearning:studentRows.reduce((n,row)=>n+row.wordsLearning,0),
    wordsSecure:studentRows.reduce((n,row)=>n+row.wordsSecure,0),
    inactive:studentRows.length-activeStudents
  };
  const dailyRows=[...daily.values()].sort((a,b)=>a.day.localeCompare(b.day))
    .map(row=>({day:row.day,attempts:row.attempts,seconds:row.seconds,activeStudents:row.users.size}));
  const visibleStudent=studentId?studentRows.find(row=>row.id===studentId)??null:null;
  return {days:dayCount,classId:chosenClass?.id??'all',className:chosenClass?.class_name??null,
    role:data.role,classes,overview,students:studentRows,daily:dailyRows,student:visibleStudent};
}
function metric(title,value,caption,tone) {
  return '<article class="vocab-usage-metric" data-tone="'+tone+'"><span class="vocab-usage-metric__label">'+escapeHtml(title)+'</span><strong class="vocab-usage-metric__value">'+escapeHtml(value)+'</strong><small class="vocab-usage-metric__caption">'+escapeHtml(caption)+'</small></article>';
}
function heading(text,sub) {return '<div class="vocab-usage-heading"><h2>'+escapeHtml(text)+'</h2><p>'+escapeHtml(sub)+'</p></div>';}
function action(text,kind,value,selected=false) {
  return '<button type="button" class="vocab-usage-pill'+(selected?' is-selected':'')+'" data-action="'+kind+'" data-value="'+escapeHtml(value)+'" aria-pressed="'+String(selected)+'">'+escapeHtml(text)+'</button>';
}
function dailyChart(daily,days,now=new Date()) {
  // Seven contiguous buckets spanning the last 7 or 30 calendar days (also for All time).
  const windowDays=days===7?7:30;
  const today=new Date(dateKey(now)+'T00:00:00.000Z');
  const buckets=Array.from({length:7},(_,i)=>{
    const startOffset=Math.floor(i*windowDays/7);
    const endOffset=Math.floor((i+1)*windowDays/7);
    const from=new Date(today.getTime()-(windowDays-1-startOffset)*DAY_MS);
    const to=new Date(today.getTime()-(windowDays-1-endOffset)*DAY_MS);
    const rows=daily.filter(row=>row.day>=dateKey(from)&&row.day<dateKey(to));
    const label=date=>date.toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'});
    const last=new Date(to.getTime()-DAY_MS);
    return {label:label(from),range:days===7?label(from):label(from)+'–'+label(last),
      attempts:rows.reduce((n,row)=>n+row.attempts,0)};
  });
  const max=Math.max(1,...buckets.map(row=>row.attempts));
  const peak=buckets.reduce((best,row)=>row.attempts>best.attempts?row:best,buckets[0]);
  const lead='<div class="vocab-usage-chart-meta"><span>Question submissions</span><strong>'+(peak.attempts?('Peak · '+escapeHtml(peak.range)+' · '+number(peak.attempts)):'No attempts recorded')+'</strong></div>';
  return lead+'<div class="vocab-usage-chart" role="img" aria-label="Question attempts in seven consecutive time buckets">'+
    buckets.map(row=>'<div class="vocab-usage-bar'+(row.attempts?'':' is-empty')+'" title="'+escapeHtml(row.range)+': '+number(row.attempts)+' attempts"><strong>'+number(row.attempts)+'</strong><span class="vocab-usage-bar__track"><i style="height:'+Math.round(row.attempts/max*100)+'%"></i></span><small>'+escapeHtml(row.label)+'</small></div>').join('')+'</div>';
}
export function renderVocabularyStaffUsage(root,model,{days=30,classId='all',studentId=null,now=new Date()}={}) {
  const usage=calculateVocabularyUsage(model,{days,classId,studentId,now});
  const {overview,student}=usage;
  const labels=usage.role==='admin'?['School-wide usage','Vocabulary activity across active student accounts']:['My classes · usage','Vocabulary activity in your assigned classes'];
  const options=[['7','7 days'],['30','30 days'],['0','All recorded']].map(([value,label])=>action(label,'staff-usage-days',value,usage.days===Number(value))).join('');
  const classOptions='<select class="vocab-usage-class-select" data-action="staff-usage-select-class" aria-label="Select a class">'+
    '<option value="all"'+(usage.classId==='all'?' selected':'')+'>'+(usage.role==='admin'?'All students':'All my classes')+'</option>'+
    usage.classes.map(row=>'<option value="'+escapeHtml(row.id)+'"'+(row.id===usage.classId?' selected':'')+'>'+escapeHtml(row.class_name)+'</option>').join('')+
    '</select>';
  const summary=metric('Students',number(overview.studentCount),'Active accounts in this view','blue')+
    metric('Practising',number(overview.activeStudents),'Students active in this period','green')+
    metric('Question attempts',number(overview.attempts),'All attempts, including retries','violet')+
    metric('Active time',formatDuration(overview.seconds),'Recorded practice time','orange');
  // A short first scan, with the full class list available on demand.
  const classCards=usage.classId==='all' ? usage.classes.map(row=>{
    const students=new Set((model.memberships??[]).filter(m=>m.class_id===row.id).map(m=>m.student_id));
    const inClass=usage.students.filter(s=>students.has(s.id));
    return '<button type="button" class="vocab-usage-class" data-action="staff-usage-class" data-value="'+escapeHtml(row.id)+'"><strong>'+escapeHtml(row.class_name)+'</strong><span>'+number(inClass.length)+' students</span><small aria-hidden="true">→</small></button>';
  }):[];
  const classGrid=classCards.map((html,index)=>index<8?html:html.replace('class="vocab-usage-class"','class="vocab-usage-class" data-class-extra hidden')).join('');
  const tableRow=s=>'<tr data-vocab-usage-student-row data-activity="'+(s.lastActive===null?'inactive':'active')+'" data-name="'+escapeHtml(s.name.toLowerCase())+'" hidden><td><button class="vocab-usage-student-link" data-action="staff-usage-student" data-value="'+escapeHtml(s.id)+'">'+escapeHtml(s.name)+'</button></td>'+
    '<td>'+number(s.attempts)+'</td><td>'+formatDuration(s.seconds)+'</td><td>'+number(s.wordsLearning)+'</td><td>'+number(s.wordsSecure)+'</td><td>'+
    escapeHtml(s.lastActive?new Date(s.lastActive).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'No recorded practice')+'</td></tr>';
  const activeRows=usage.students.filter(s=>s.lastActive!==null);
  const inactiveRows=usage.students.filter(s=>s.lastActive===null);
  const tableHead='<thead><tr><th>Student</th><th>Attempts</th><th>Active time</th><th>Words in progress</th><th>Words secure</th><th>Last active</th></tr></thead>';
  const studentTable='<div class="vocab-usage-tablewrap"><table>'+tableHead+'<tbody>'+
    usage.students.map(tableRow).join('')+'</tbody></table></div>';
  const studentTabs='<div class="vocab-usage-student-tabs" role="group" aria-label="Student activity filter">'+
    '<button type="button" data-action="staff-usage-view" data-value="active" class="vocab-usage-tab is-selected" aria-pressed="true">Practised <span>'+number(activeRows.length)+'</span></button>'+
    '<button type="button" data-action="staff-usage-view" data-value="inactive" class="vocab-usage-tab" aria-pressed="false">Not yet active <span>'+number(inactiveRows.length)+'</span></button>'+
    '<button type="button" data-action="staff-usage-view" data-value="all" class="vocab-usage-tab" aria-pressed="false">All students <span>'+number(usage.students.length)+'</span></button></div>';
  const detail=student?'<section class="vocab-usage-detail"><div><strong>'+escapeHtml(student.name)+'</strong><button class="vocab-usage-pill" data-action="staff-usage-student" data-value="">Close detail ✕</button></div><p>'+
    number(student.attempts)+' question attempts · '+formatDuration(student.seconds)+' recorded time · '+
    number(student.wordsLearning)+' words in progress · '+number(student.wordsSecure)+' words secure · '+number(student.activeDays)+' active days</p>'+
    '<p>These figures are usage evidence, not an English attainment grade.</p></section>':'';
  root.innerHTML='<main class="vocab-shell vocab-usage-shell" data-staff-usage>'+
    '<header class="vocab-topbar"><button type="button" class="vocab-back" data-action="staff-usage-back">← Teacher analytics</button>'+
    '<span>'+escapeHtml(usage.role==='admin'?'Admin overview':'Teacher overview')+'</span></header>'+
    '<section class="vocab-usage-hero"><span>VOCABULARY · LEARNING ACTIVITY</span><h1>'+escapeHtml(labels[0])+'</h1><p>'+escapeHtml(labels[1])+'</p></section>'+
    '<div class="vocab-usage-controls" aria-label="Usage filters"><div><strong>Reporting period</strong><div class="vocab-usage-pills" role="group" aria-label="Reporting period">'+options+'</div></div>'+
    '<div><strong>Class</strong><div class="vocab-usage-pills">'+classOptions+'</div></div></div>'+
    '<section class="vocab-usage-metrics" aria-label="Recorded usage summary">'+summary+'</section>'+
    '<section class="vocab-usage-panels"><article class="vocab-usage-panel vocab-usage-panel--chart">'+heading('Practice over time',usage.days===0?'Last 30 days shown · summary cards include all recorded activity':usage.days===7?'Daily question attempts · last 7 days':'Question attempts grouped into seven periods · last 30 days')+
    dailyChart(usage.daily,usage.days,now)+'</article><article class="vocab-usage-panel">'+
    heading('At a glance','Participation and progress')+
    '<div class="vocab-usage-facts"><div class="vocab-usage-fact" title="No question attempts or recorded active time in the selected period"><strong>'+number(overview.inactive)+'</strong><span><b>Not yet practising</b><small>In this period</small></span></div>'+
    '<div class="vocab-usage-fact" title="Current building or secure vocabulary records"><strong>'+number(overview.wordsLearning)+'</strong><span><b>Words in progress</b><small>Building or secure</small></span></div>'+
    '<div class="vocab-usage-fact" title="Vocabulary records currently marked secure"><strong>'+number(overview.wordsSecure)+'</strong><span><b>Words secure</b><small>Current status</small></span></div>'+
    '<div class="vocab-usage-fact" title="Number of classes in the current selection"><strong>'+(usage.classId==='all'?number(usage.classes.length):'1')+'</strong><span><b>'+(usage.classId==='all'?(usage.role==='admin'?'Active classes':'Assigned classes'):'Selected class')+'</b><small>'+(usage.classId==='all'?'In this view':'Current filter')+'</small></span></div></div></article></section>'+
    (classCards.length?'<section class="vocab-usage-classes">'+heading('Choose a class','Select a class to view its students')+
      '<div class="vocab-usage-class-grid" data-usage-class-grid>'+classGrid+'</div>'+
      (classCards.length>8?'<button type="button" class="vocab-usage-class-toggle" data-action="staff-usage-toggle-classes" aria-expanded="false" data-total="'+number(classCards.length)+'">Show all '+number(classCards.length)+' classes <span aria-hidden="true">⌄</span></button>':'')+'</section>':'')+
    '<section class="vocab-usage-panel vocab-usage-people">'+heading('Student activity','Select a student to see their recorded practice and progress')+
    '<div class="vocab-usage-search"><label for="vocab-usage-search">Find a student</label><input id="vocab-usage-search" type="search" data-action="staff-usage-search" placeholder="Search any student in this view…" autocomplete="off"></div>'+
    detail+studentTabs+
    '<div class="vocab-usage-student-list-head"><span data-usage-search-count role="status" aria-live="polite"></span></div>'+
    studentTable+'<p class="vocab-usage-no-results" data-usage-empty hidden>No students match this search and filter.</p>'+
    '<div class="vocab-usage-student-footer"><button type="button" class="vocab-usage-more-students" data-action="staff-usage-more-students" hidden>Show next 10 students</button></div></section>'+
    '<p class="vocab-usage-foot"><strong>About these figures</strong><span>Activity totals use the selected reporting period; question attempts include retries, and recorded time may omit short intervals. Vocabulary statuses describe current learning evidence, independent of the date filter—not attainment grades. Students belonging to more than one class are counted once in combined totals.</span></p></main>';
  // The complete permitted student list is in the DOM but only ten rows are visible.
  // Search/filter/pagination operate on this scope without fetching or exposing other classes.
  updateVocabularyUsageStudentRows(root);
}
export function updateVocabularyUsageStudentRows(root,{view=null,query=null,more=false}={}) {
  const panel=root?.querySelector?.('[data-staff-usage]');
  if(!panel)return;
  const state=panel.dataset;
  const allowedViews=new Set(['active','inactive','all']);
  if(view!==null){state.studentView=allowedViews.has(view)?view:'active';state.studentLimit='10';}
  if(!allowedViews.has(state.studentView))state.studentView='active';
  if(query!==null){state.studentQuery=String(query).trim().toLowerCase();state.studentLimit='10';}
  const limit=Math.max(10,Number(state.studentLimit)||10);
  if(more)state.studentLimit=String(limit+10);
  const activeLimit=more?limit+10:limit;
  const q=state.studentQuery??'';
  let matched=0,shown=0;
  const rows=panel.querySelectorAll('[data-vocab-usage-student-row]');
  for(const row of rows){
    const matchesView=state.studentView==='all'||row.dataset.activity===state.studentView;
    const matchesName=String(row.dataset.name??'').includes(q);
    const matches=matchesView&&matchesName;
    row.hidden=!matches||shown>=activeLimit;
    if(matches){matched++;if(!row.hidden)shown++;}
  }
  for(const tab of panel.querySelectorAll('[data-action="staff-usage-view"]')){
    const selected=tab.dataset.value===state.studentView;
    tab.classList.toggle('is-selected',selected);
    tab.setAttribute('aria-pressed',String(selected));
  }
  const counter=panel.querySelector('[data-usage-search-count]');
  if(counter)counter.textContent=matched?('Showing '+shown+' of '+matched+' students'):'No students match these filters';
  const empty=panel.querySelector('[data-usage-empty]');
  if(empty)empty.hidden=matched!==0;
  const next=panel.querySelector('[data-action="staff-usage-more-students"]');
  if(next){
    next.hidden=shown>=matched;
    next.textContent='Show next '+Math.min(10,matched-shown)+' students';
  }
}