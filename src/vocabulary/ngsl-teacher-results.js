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
function classRows(dataset,classId){
 const classes=classId==='all'?dataset.classes:dataset.classes.filter(c=>c.id===classId);
 const ids=[...new Set(classes.flatMap(c=>c.students.map(s=>s.id)))];
 return ids.map(id=>({id,name:dataset.names.get(id)||'Student',result:dataset.results.get(id)||null}))
  .sort((a,b)=>Number(Boolean(a.result))-Number(Boolean(b.result))||a.name.localeCompare(b.name));
}
function bandCards(rows){
 const completed=rows.filter(row=>row.result).map(row=>row.result);
 return groupStats(completed).map(({band,average:mean})=>
  '<div class="ngsl-report-band ngsl-report-band--'+band+'"><span>Group '+band+'</span>'
  +'<strong>'+(mean===null?'—':Math.round(mean*10)+'%')+'</strong>'
  +'<small>'+(mean===null?'No results yet':mean+' / 10 average')+'</small></div>'
 ).join('');
}
export function renderNGSLClassReport(root,dataset,classId='all',isAdmin=false){
 const selected=dataset.classes.some(c=>c.id===classId)?classId:'all';
 const rows=classRows(dataset,selected);
 const completed=rows.filter(row=>row.result);
 const mean=average(completed.map(row=>row.result.correct));
 const completedPct=percent(completed.length,rows.length);
 const options=dataset.classes.map(c=>'<option value="'+e(c.id)+'"'+(selected===c.id?' selected':'')+'>'+e(c.className)+'</option>').join('');
 const controls='<label class="ngsl-report-filter">Class <select data-action="ngsl-report-select-class">'
  +'<option value="all"'+(selected==='all'?' selected':'')+'>'+(isAdmin?'All classes':'All my classes')+'</option>'
  +options+'</select></label>';
 const table=rows.map(row=>{
  const r=row.result;
  const score=r?r.correct+'/50 · '+(r.correct*2)+'%':'Not started';
  const unsure=Number(r?.unsure);
  const unsureText=!r?'—':Number.isInteger(unsure)&&unsure>=0&&unsure<=50-r.correct?String(unsure):'—';
  const incident=dataset.integrity?.get(row.id);
  const label=!r?'—':!dataset.integrityAvailable?'Unavailable':!incident?'No events reported':
    incident.focusLosses+' focus loss'+(incident.focusLosses===1?'':'es')+
      ' · '+incident.fullscreenExits+' fullscreen exit'+(incident.fullscreenExits===1?'':'s');
  const timeline=incident?.timeline??[];
  const items=timeline.map(item=>'<li><span>'+e(TYPES[item.type])+
   ' · Question '+item.position+'</span><time datetime="'+e(item.at)+'">'+
   e(new Date(item.at).toLocaleString(undefined,{dateStyle:'short',timeStyle:'short'}))+'</time></li>').join('');
  const note=timeline.length?'<details class="ngsl-integrity-details"><summary>'+e(label)+
   ' · View timeline</summary><ol>'+items+'</ol>'+
   '<small>Server-recorded times. Browser events may be incomplete.</small></details>':e(label);
  return '<tr><td>'+e(row.name)+'</td><td><span class="'+(r?'ngsl-report-done':'ngsl-report-wait')+'">'+(r?'Completed':'Not completed')+'</span></td>'
    +'<td class="ngsl-report-number">'+e(score)+'</td><td class="ngsl-report-number">'+e(unsureText)+'</td><td>'+e(r?levelFor(r.correct):'—')+'</td><td>'+note+'</td></tr>';
 }).join('');
 root.innerHTML='<main class="vocab-shell ngsl-report"><header class="vocab-topbar"><a href="./" class="vocab-back">← Hub</a><span>Vocabulary diagnostic</span></header>'
  +'<section class="ngsl-report-hero"><div><p class="vocab-kicker">NGSL · 50-QUESTION DIAGNOSTIC</p>'
  +'<h1>Diagnostic results</h1><p>Vocabulary starting points for your classes.</p></div>'
  +'<button class="vocab-button" type="button" data-action="ngsl-report-back">Back to classes</button></section>'
  +'<div class="ngsl-report-tools">'+controls+'</div>'
  +'<section class="ngsl-report-metrics" aria-label="Class diagnostic summary">'
  +'<div><span>Completed</span><strong>'+completed.length+' <small>/ '+rows.length+'</small></strong><small>'+completedPct+'% of students</small></div>'
  +'<div><span>Average score</span><strong>'+(mean===null?'—':Math.round(mean*2)+'%')+'</strong><small>'+(mean===null?'No results yet':mean+' / 50 · '+completed.length+' completed')+'</small></div>'
  +'<div><span>Still to complete</span><strong>'+(rows.length-completed.length)+'</strong><small>Students</small></div></section>'
  +'<section class="ngsl-report-panel"><h2>Vocabulary word groups</h2><p>Average recognition in each frequency group, based on completed tests only.</p>'
  +'<div class="ngsl-report-bands">'+bandCards(rows)+'</div></section>'
  +'<section class="ngsl-report-panel"><div class="ngsl-report-panel-heading"><h2>Student results</h2><span>'+rows.length+' students</span></div>'
  +'<div class="ngsl-report-table-scroll"><table><thead><tr><th>Student</th><th>Status</th><th>Score</th><th>Not sure</th><th>Foundation rating</th><th>Focus events (review only)</th></tr></thead><tbody>'
  +(rows.length?table:'<tr><td colspan="6">No students in this selection.</td></tr>')+'</tbody></table></div></section>'
  +'<p class="ngsl-report-footnote">Focus and fullscreen events are browser-reported, may be incomplete, and do not prove cheating. Review context before taking action. This diagnostic measures selected NGSL word recognition, not an English exam grade.</p></main>';
}
