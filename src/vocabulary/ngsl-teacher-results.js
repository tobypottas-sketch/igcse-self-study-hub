// NGSL diagnostic class report. The Edge Function authorises teacher class access and admin scope.
// Only trusted completed-result records are used; no answer keys or question banks.
import {escapeHtml} from '../views/html.js';

const e=value=>escapeHtml(String(value??''));
const levels=[
 {max:14,label:'Beginning'},
 {max:24,label:'Developing'},
 {max:34,label:'Building confidence'},
 {max:44,label:'Strong'},
 {max:50,label:'Advanced recognition'}
];
const levelFor=score=>levels.find(level=>score<=level.max)?.label??'—';
const round=value=>Math.round(value*10)/10;
const average=values=>values.length?round(values.reduce((sum,n)=>sum+n,0)/values.length):null;
const TYPES={tab_hidden:'Tab hidden',window_blur:'Browser focus lost',fullscreen_exit:'Fullscreen exited',focus_return:'Returned to assessment'};

function validResult(row){
 const score=Number(row?.correct);
 return row&&typeof row.studentId==='string'&&Number(row.total)===50&&
  Number.isInteger(score)&&score>=0&&score<=50?{...row,correct:score}:null;
}
export async function fetchNGSLClassResults(client,classes){
 const {data,error}=await client.functions.invoke('vocabulary-diagnostic',{
  body:{action:'ngsl-teacher-report',payload:{}}
 });
 if(error||data?.error||!Array.isArray(data?.results))throw new Error('Diagnostic results could not be loaded. Please try again.');
 const authorisedIds=[...new Set(classes.flatMap(c=>c.students.map(s=>s.id)))];
 const names=new Map();
 // Read only names for students in classes the teacher is allowed to see.
 for(let i=0;i<authorisedIds.length;i+=100){
  const ids=authorisedIds.slice(i,i+100);
  const {data:profiles,error:profileError}=await client.from('profiles').select('id,display_name,role').in('id',ids).eq('role','student');
  if(profileError)throw new Error('Student names could not be loaded.');
  for(const p of profiles??[])names.set(p.id,p.display_name||'Student');
 }
 const permitted=new Set(authorisedIds);
 const results=new Map();
 for(const raw of data.results){
  const row=validResult(raw);
  if(row&&permitted.has(row.studentId))results.set(row.studentId,row);
 }
 // Security incidents are advisory, and remain scoped to the same
 // teacher-authorised class membership as academic results.
 let integrityAvailable=true;
 const integrity=new Map();
 try{
  const {data:report,error:reportError}=await client.functions.invoke('vocabulary-diagnostic',{
   body:{action:'ngsl-integrity-report',payload:{}}
  });
  if(reportError||!Array.isArray(report?.events))throw new Error('Integrity report unavailable');
  for(const entry of report.events){
   if(!permitted.has(entry.studentId))continue;
   const focusLosses=Number(entry.focusLosses),fullscreenExits=Number(entry.fullscreenExits);
   if(Number.isInteger(focusLosses)&&focusLosses>=0&&Number.isInteger(fullscreenExits)&&fullscreenExits>=0){
    const timeline=Array.isArray(entry.timeline)?entry.timeline.filter(item=>
      Object.hasOwn(TYPES,item?.type)&&Number.isInteger(item.position)&&item.position>=1&&item.position<=50&&
      typeof item.at==='string'&&!Number.isNaN(Date.parse(item.at))
    ).slice(0,60):[];
    integrity.set(entry.studentId,{focusLosses,fullscreenExits,timeline});
   }
  }
 }catch{integrityAvailable=false;}
 return {classes,names,results,integrity,integrityAvailable};
}
const percent=(n,den)=>den?Math.round(n*100/den):0;
function groupStats(completed){
 return Array.from({length:5},(_,index)=>{
  const b=index+1;
  const scores=completed.map(row=>Number(row.bandScores?.[String(b)]?.correct)).filter(n=>Number.isInteger(n)&&n>=0&&n<=10);
  return {band:b,average:average(scores),count:scores.length};
 });
}

const viewState=new WeakMap();
const BAND_LABELS=['Most frequent','High frequency','Core vocabulary','Less frequent','Extended frequency'];
const formatPct=score=>score===null?'—':Math.round(score*2)+'%';
function classRows(dataset,classId){
 const classes=classId==='all'?dataset.classes:dataset.classes.filter(c=>c.id===classId);
 const ids=[...new Set(classes.flatMap(c=>c.students.map(s=>s.id)))];
 return ids.map(id=>({id,name:dataset.names.get(id)||'Student',result:dataset.results.get(id)||null}));
}
function statusOf(row){
 if(row.result)return 'completed';
 const status=datasetSessionState(row);
 return status==='in_progress'||status==='interrupted'?'in_progress':'not_started';
}
function datasetSessionState(row){return row.session?.state??null;}
function bandCards(rows){
 const completed=rows.filter(row=>row.result).map(row=>row.result);
 return groupStats(completed).map(({band,average:mean,count})=>
  '<div class="ngsl-report-band ngsl-report-band--'+band+'"><span>Group '+band+'</span>'+
  '<small>'+e(BAND_LABELS[band-1])+'</small><strong>'+(mean===null?'—':Math.round(mean*10)+'%')+'</strong>'+
  '<small>'+(mean===null?'No completed results':mean+' / 10 average · '+count+' students')+'</small></div>'
 ).join('');
}
function parseTime(value){const t=Date.parse(value??'');return Number.isFinite(t)?t:0;}
function compactEvents(timeline){
 const events=[...timeline].sort((a,b)=>parseTime(a.at)-parseTime(b.at));
 const groups=[];
 for(const event of events){
  const last=groups.at(-1);
  if(last&&last.type===event.type&&last.position===event.position&&Math.abs(parseTime(event.at)-parseTime(last.at))<=5000){
   last.count++;last.at=event.at;
  }else groups.push({...event,count:1});
 }
 return groups;
}
function distribution(rows){
 const values=rows.filter(r=>r.result).map(r=>r.result.correct);
 const bins=[{name:'0–9',min:0,max:9},{name:'10–19',min:10,max:19},
 {name:'20–29',min:20,max:29},{name:'30–39',min:30,max:39},{name:'40–50',min:40,max:50}];
 const largest=Math.max(1,...bins.map(b=>values.filter(v=>v>=b.min&&v<=b.max).length));
 return '<div class="ngsl-report-distribution" role="img" aria-label="Completed students by score range">'+bins.map(bin=>{
  const count=values.filter(v=>v>=bin.min&&v<=bin.max).length;
  return '<div><span>'+bin.name+'</span><div class="ngsl-dist-track"><i style="width:'+(100*count/largest)+'%"></i></div><b>'+count+'</b></div>';
 }).join('')+'</div>';
}
function exportRows(rows){
 const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';
 const lines=[['Student','Status','Correct','Total','Percent','Recognition rating','Group 1 / 10','Group 2 / 10','Group 3 / 10','Group 4 / 10','Group 5 / 10','Focus losses','Fullscreen exits','Completed at']];
 for(const row of rows){
  const r=row.result,incident=row.integrity;
  lines.push([row.name,statusOf(row)==='in_progress'?'In progress':r?'Completed':'Not started',
   r?.correct??'',r?.total??'',r?2*r.correct:'',r?levelFor(r.correct):'',
   ...[1,2,3,4,5].map(b=>r?.bandScores?.[String(b)]?.correct??''),
   incident?.focusLosses??'',incident?.fullscreenExits??'',r?.completedAt??'']);
 }
 return '\uFEFF'+lines.map(row=>row.map(quote).join(',')).join('\r\n');
}
function downloadCSV(rows){
 const blob=new Blob([exportRows(rows)],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='ngsl-diagnostic-class-results.csv';document.body.append(link);
 link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function eventDialog(root,row){
 const incident=row.integrity;
 const entries=compactEvents(incident?.timeline??[]);
 const dialog=document.createElement('dialog');dialog.className='ngsl-event-dialog';
 dialog.innerHTML='<div class="ngsl-event-dialog-header"><div><small>Assessment focus activity</small><h2>'+e(row.name)+'</h2></div><button type="button" class="ngsl-report-dismiss" aria-label="Close focus activity">×</button></div>'+
  '<p><strong>'+(incident?.focusLosses??0)+' focus losses · '+(incident?.fullscreenExits??0)+' fullscreen exits</strong></p>'+
  '<p class="ngsl-report-caution">Browser focus events are context for teacher review, not evidence of cheating. The list may be incomplete.</p>'+
  (entries.length?'<ol class="ngsl-event-list">'+entries.map(item=>
   '<li><span>'+e(TYPES[item.type])+' · Question '+item.position+(item.count>1?' · '+item.count+' nearby events':'')+'</span>'+
   '<time datetime="'+e(item.at)+'">'+e(new Date(item.at).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}))+'</time></li>'
  ).join('')+'</ol>':'<p>No detailed timeline was supplied for this student.</p>')+
  '<p class="ngsl-report-caution">Nearby identical events are grouped here for readability. Original records have not been changed.</p>';
 root.append(dialog);
 const close=()=>{dialog.close();dialog.remove();};
 dialog.querySelector('button').addEventListener('click',close);
 dialog.addEventListener('close',()=>dialog.remove(),{once:true});
 if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
}
export function renderNGSLClassReport(root,dataset,classId='all',isAdmin=false){
 const selected=dataset.classes.some(c=>c.id===classId)?classId:'all';
 const old=viewState.get(root);
 const state=old&&old.classId===selected?old:{classId:selected,search:'',filter:'all',sort:'low'};
 viewState.set(root,state);
 const rows=classRows(dataset,selected).map(row=>({...row,
  session:dataset.sessions?.get(row.id),integrity:dataset.integrity?.get(row.id)}));
 const completed=rows.filter(row=>row.result);
 const mean=average(completed.map(row=>row.result.correct));
 const completedPct=percent(completed.length,rows.length);
 const incomplete=rows.filter(row=>!row.result);
 const low=completed.filter(row=>row.result.correct<25);
 const inProgress=incomplete.filter(row=>statusOf(row)==='in_progress');
 const notStarted=incomplete.length-inProgress.length;
 const groupMeans=groupStats(completed);
 const weakest=[...groupMeans].filter(b=>b.average!==null).sort((a,b)=>a.average-b.average)[0];
 const options=dataset.classes.map(c=>'<option value="'+e(c.id)+'"'+(selected===c.id?' selected':'')+'>'+e(c.className)+'</option>').join('');
 const filtered=rows.filter(row=>(state.filter==='all'||state.filter===statusOf(row)||state.filter==='review'&&row.result?.correct<25)&&
  row.name.toLocaleLowerCase().includes(state.search.toLocaleLowerCase())).sort((a,b)=>{
   if(state.sort==='name')return a.name.localeCompare(b.name);
   if(state.sort==='high')return (b.result?.correct??-1)-(a.result?.correct??-1)||a.name.localeCompare(b.name);
   if(state.sort==='status')return statusOf(a).localeCompare(statusOf(b))||a.name.localeCompare(b.name);
   return (a.result?.correct??51)-(b.result?.correct??51)||a.name.localeCompare(b.name);
  });
 const table=filtered.map(row=>{
  const r=row.result,status=statusOf(row),incident=row.integrity;
  const score=r?r.correct+'/50 · '+(r.correct*2)+'%':'—';
  const incidentLabel=!r?'—':!dataset.integrityAvailable?'Unavailable':
   !incident?'No events reported':incident.focusLosses+' focus · '+incident.fullscreenExits+' exits';
  return '<tr><td class="ngsl-report-student">'+e(row.name)+'</td><td><span class="'+(r?'ngsl-report-done':'ngsl-report-wait')+'">'+
   (status==='completed'?'Completed':status==='in_progress'?'In progress':'Not started')+'</span></td>'+
   '<td class="ngsl-report-number">'+e(score)+'</td><td>'+e(r?levelFor(r.correct):'—')+'</td>'+
   '<td><span>'+e(incidentLabel)+'</span>'+
   (incident&&r?'<button type="button" class="ngsl-review-button" data-review-id="'+e(row.id)+'">Review</button>':'')+
   '</td></tr>';
 }).join('');
 root.innerHTML='<main class="vocab-shell ngsl-report"><header class="vocab-topbar"><a href="./" class="vocab-back">← Hub</a><span>Vocabulary diagnostic</span></header>'+
 '<section class="ngsl-report-hero"><div><p class="vocab-kicker">NGSL · 50-QUESTION DIAGNOSTIC</p>'+
 '<h1>Diagnostic results</h1><p>Recognition of selected NGSL words · not a CEFR placement test.</p></div>'+
 '<button class="vocab-button" type="button" data-action="ngsl-report-back">Back to classes</button></section>'+
 '<div class="ngsl-report-tools"><label class="ngsl-report-filter">Class <select data-action="ngsl-report-select-class">'+
 '<option value="all"'+(selected==='all'?' selected':'')+'>'+(isAdmin?'All classes':'All my classes')+'</option>'+options+
 '</select></label></div>'+
 '<section class="ngsl-report-metrics" aria-label="Class diagnostic summary">'+
 '<div><span>Completed</span><strong>'+completed.length+' <small>/ '+rows.length+'</small></strong><small>'+completedPct+'% of students</small></div>'+
 '<div><span>Average recognition</span><strong>'+(mean===null?'—':Math.round(mean*2)+'%')+'</strong><small>'+
 (mean===null?'No results yet':mean+' / 50 · completed students only')+'</small></div>'+
 '<div><span>Still to complete</span><strong>'+incomplete.length+'</strong><small>'+inProgress.length+' in progress · '+notStarted+' not started</small></div></section>'+
 '<section class="ngsl-report-actions" aria-label="Teacher follow-up"><h2>What needs attention?</h2><div>'+
 '<p><strong>'+incomplete.length+' unfinished:</strong> '+inProgress.length+' started, '+notStarted+' not started.</p>'+
 '<p><strong>'+low.length+' students below 50%:</strong> review their starting vocabulary practice.</p>'+
 '<p><strong>Lowest frequency group:</strong> '+(weakest?'Group '+weakest.band+' ('+Math.round(weakest.average*10)+'%)':'Awaiting results')+
 '. Similar group averages may reflect question selection rather than equal word knowledge.</p></div></section>'+
 '<section class="ngsl-report-panel"><h2>Vocabulary frequency groups</h2><p>Each group contains 10 selected NGSL items; higher groups contain less frequent vocabulary. These are not CEFR bands.</p>'+
 '<div class="ngsl-report-bands">'+bandCards(rows)+'</div></section>'+
 '<section class="ngsl-report-panel"><h2>Score distribution</h2><p>Number of completed students in each raw-score range (out of 50).</p>'+
 distribution(rows)+'</section>'+
 '<section class="ngsl-report-panel"><div class="ngsl-report-panel-heading"><h2>Student results</h2><span>'+filtered.length+' of '+rows.length+' students</span></div>'+
 '<div class="ngsl-report-toolbar"><label>Find student<input type="search" data-ngsl-search placeholder="Search names…" value="'+e(state.search)+'"></label>'+
 '<label>Status<select data-ngsl-filter><option value="all">All students</option><option value="completed">Completed</option>'+
 '<option value="in_progress">In progress</option><option value="not_started">Not started</option><option value="review">Below 50%</option></select></label>'+
 '<label>Sort<select data-ngsl-sort><option value="low">Lowest scores first</option><option value="high">Highest scores first</option>'+
 '<option value="name">Student name</option><option value="status">Status</option></select></label>'+
 '<button type="button" class="ngsl-review-button ngsl-export-button" data-ngsl-export>Export CSV</button></div>'+
 '<div class="ngsl-report-table-scroll"><table><thead><tr><th>Student</th><th>Status</th><th>Score</th><th>Recognition rating</th><th>Focus activity</th></tr></thead><tbody>'+
 (filtered.length?table:'<tr><td colspan="5">No students match these filters.</td></tr>')+
 '</tbody></table></div></section>'+
 '<section class="ngsl-report-explainer"><strong>How to read the ratings</strong><p>Beginning: 0–14 · Developing: 15–24 · Building confidence: 25–34 · Strong: 35–44 · Advanced recognition: 45–50. These labels describe performance on this particular 50-item test only. They are not standardised NGSL or CEFR levels.</p></section>'+
 '<p class="ngsl-report-footnote">Focus and fullscreen events are browser-reported and may be incomplete. They do not prove cheating. Scores reflect multiple-choice recognition of selected words, not productive vocabulary, reading ability or an English exam grade.</p></main>';
 root.querySelector('[data-ngsl-filter]').value=state.filter;
 root.querySelector('[data-ngsl-sort]').value=state.sort;
 root.querySelector('[data-ngsl-search]').addEventListener('input',event=>{
  const value=event.target.value,start=event.target.selectionStart;
  state.search=value;renderNGSLClassReport(root,dataset,selected,isAdmin);
  const input=root.querySelector('[data-ngsl-search]');input.focus();input.setSelectionRange(start,start);
 });
 for(const [attr,key] of [['data-ngsl-filter','filter'],['data-ngsl-sort','sort']]){
  root.querySelector('['+attr+']').addEventListener('change',event=>{
   state[key]=event.target.value;renderNGSLClassReport(root,dataset,selected,isAdmin);
  });
 }
 root.querySelector('[data-ngsl-export]').addEventListener('click',()=>downloadCSV(rows));
 for(const button of root.querySelectorAll('[data-review-id]')){
  button.addEventListener('click',()=>{const row=rows.find(r=>r.id===button.dataset.reviewId);if(row)eventDialog(root,row);});
 }
}
