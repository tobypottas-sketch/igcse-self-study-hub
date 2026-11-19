// Compact, practical teacher NGSL results report. Never changes student assessment data.
import {fetchNGSLClassResults} from './ngsl-teacher-results.js';
import {escapeHtml} from '../views/html.js';
const e=value=>escapeHtml(String(value??''));
const categories=[{max:14,label:'Beginning'},{max:24,label:'Developing'},{max:34,label:'Building confidence'},{max:44,label:'Strong'},{max:50,label:'Advanced recognition'}];
const rating=score=>categories.find(x=>score<=x.max)?.label??'—';
const TYPES={tab_hidden:'Tab hidden',window_blur:'Browser focus lost',fullscreen_exit:'Fullscreen exited',focus_return:'Returned to assessment'};
const BANDS=[
 ['Most frequent','NGSL ranks 41–518'],['Very common','NGSL ranks 658–1,106'],
 ['Everyday core','NGSL ranks 1,190–1,666'],['Less frequent core','NGSL ranks 1,694–2,142'],
 ['Lower-frequency NGSL','NGSL ranks 2,255–2,766']
];
const percent=(n,d)=>d?Math.round(n*100/d):0;
const average=values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
const fmtTime=value=>value&&!Number.isNaN(Date.parse(value))?new Date(value).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}):'—';
export const scoreStatus=row=>row.result?'completed':row.progress?.state==='in_progress'||row.progress?.state==='interrupted'?'progress':row.progress?.state==='completed'?'pending':'notstarted';
const scoreValue=row=>row.result?.correct??-1;
export const safeCsv=value=>{
 const s=String(value??'').replace(/\r?\n/g,' ');
 const safe=/^[\s]*[=+\-@]/.test(s)?"'"+s:s;
 return '"'+safe.replace(/"/g,'""')+'"';
};
function activeRows(dataset,classId){
 const allowed=classId==='all'?dataset.classes:dataset.classes.filter(c=>String(c.id)===String(classId));
 return [...new Set(allowed.flatMap(c=>(c.students??[]).map(s=>s.id)))].map(id=>({
  id,name:dataset.names.get(id)||'Student',result:dataset.results.get(id)||null,
  progress:dataset.progress?.get(id)||null,incident:dataset.integrity?.get(id)||null
 }));
}
export async function fetchNGSLPolishedResults(client,classes){
 const base=await fetchNGSLClassResults(client,classes);
 const permitted=new Set(classes.flatMap(c=>(c.students??[]).map(s=>s.id)));
 const progress=new Map();
 let progressAvailable=false;
 try{
  const {data,error}=await client.functions.invoke('vocabulary-diagnostic',{body:{action:'ngsl-teacher-progress',payload:{}}});
  if(error||!Array.isArray(data?.sessions))throw Error('Progress unavailable');
  progressAvailable=true;
  for(const row of data.sessions){
   if(!permitted.has(row?.studentId)||!['in_progress','interrupted','completed'].includes(row.state))continue;
   const answered=Number(row.answered);
   progress.set(row.studentId,{state:row.state,answered:Number.isInteger(answered)?Math.max(0,Math.min(50,answered)):0,startedAt:row.startedAt});
  }
 }catch{/* Score report remains available if progress endpoint is not deployed. */}
 return {...base,progress,progressAvailable};
}
export function renderNGSLPolishedReport(root,dataset,classId='all',isAdmin=false){
 const selected=dataset.classes.some(c=>String(c.id)===String(classId))?String(classId):'all';
 const all=activeRows(dataset,selected);
 const completed=all.filter(r=>r.result);
 const pending=all.filter(r=>scoreStatus(r)!=='completed');
 const inProgress=all.filter(r=>scoreStatus(r)==='progress');
 const below=completed.filter(r=>r.result.correct<25);
 const mean=average(completed.map(r=>r.result.correct));
 const bandMeans=Array.from({length:5},(_,i)=>{
  const values=completed.map(r=>Number(r.result.bandScores?.[String(i+1)]?.correct)).filter(n=>Number.isInteger(n)&&n>=0&&n<=10);
  return average(values);
 });
 const minBand=Math.min(...bandMeans.filter(x=>x!==null));
 const weakest=bandMeans.findIndex(x=>x===minBand);
 const classOptions=dataset.classes.map(c=>'<option value="'+e(c.id)+'"'+(String(c.id)===selected?' selected':'')+'>'+e(c.className)+'</option>').join('');
 const summary=(label,num,note,kind)=>'<div class="ngsl-p-metric ngsl-p-metric--'+kind+'"><span>'+label+'</span><strong>'+num+'</strong><small>'+note+'</small></div>';
 const advisory=(count,message,filter)=>'<button type="button" data-ngsl-quick="'+filter+'" class="ngsl-p-action"><b>'+count+'</b><span>'+message+'</span><span aria-hidden="true">›</span></button>';
 root.innerHTML='<main class="vocab-shell ngsl-p-report"><header class="vocab-topbar"><a href="./" class="vocab-back">← Hub</a><span>NGSL diagnostic · Teacher report</span></header>'+
 '<section class="ngsl-p-hero"><div><p class="vocab-kicker">NGSL · 50-QUESTION DIAGNOSTIC</p><h1>Diagnostic results</h1><p>Vocabulary recognition baseline · Not a CEFR placement test</p></div><button type="button" class="vocab-button" data-action="ngsl-report-back">Back to classes</button></section>'+
 '<div class="ngsl-p-classbar"><label>Class <select data-action="ngsl-report-select-class"><option value="all"'+(selected==='all'?' selected':'')+'>'+(isAdmin?'All classes':'All my classes')+'</option>'+classOptions+'</select></label><span>Updated when this report was opened · '+all.length+' students</span></div>'+
 '<section class="ngsl-p-metrics" aria-label="Diagnostic summary">'+
 summary('Completed',completed.length+' / '+all.length,percent(completed.length,all.length)+'% finished','completion')+
 summary('Average recognition',mean===null?'—':Math.round(mean*2)+'%',mean===null?'No completed scores':(Math.round(mean*10)/10)+' / 50 · completed only','average')+
 summary('Still to complete',pending.length,inProgress.length+' in progress'+(dataset.progressAvailable?'':' · status unverified'),'pending')+
 '</section>'+
 '<section class="ngsl-p-followup" aria-label="Suggested teacher follow-up"><div><h2>Teaching priorities</h2><p>Based on saved diagnostic results, not automated exam grades.</p></div><div class="ngsl-p-actions">'+
 advisory(pending.length,'Without a completed diagnostic','incomplete')+
 advisory(below.length,'Completed below 50% · review baseline','review')+
 '<span class="ngsl-p-weak">Lowest group: '+(weakest>=0?'Group '+(weakest+1)+' · '+Math.round(minBand*10)+'%':'No results')+'</span></div></section>'+
 '<section class="ngsl-p-bands"><div class="ngsl-p-section-heading"><h2>NGSL word-frequency groups</h2><p>10 sampled words per group · Recognition, not CEFR levels</p></div><div class="ngsl-p-band-grid">'+
 BANDS.map((b,i)=>'<article class="ngsl-p-band"><span>Group '+(i+1)+'</span><strong>'+(bandMeans[i]===null?'—':Math.round(bandMeans[i]*10)+'%')+'</strong><b>'+b[0]+'</b><small>'+b[1]+'</small></article>').join('')+
 '</div><p class="ngsl-p-note">Groups indicate word frequency, not linguistic difficulty or CEFR. Scores from ten questions per group are estimates and should be interpreted cautiously.</p></section>'+
 '<section class="ngsl-p-students"><div class="ngsl-p-section-heading"><div><h2>Student results</h2><p>Choose a group to view its students. Search works across all names within the selected group.</p></div><span>'+all.length+' enrolled</span></div>'+
 '<div class="ngsl-p-tabs" role="group" aria-label="Student result groups">'+
 '<button type="button" data-ngsl-tab="completed">Completed <b>'+completed.length+'</b></button>'+
 '<button type="button" data-ngsl-tab="progress">In progress <b>'+inProgress.length+'</b></button>'+
 '<button type="button" data-ngsl-tab="incomplete">Still to finish <b>'+pending.length+'</b></button>'+
 '<button type="button" data-ngsl-tab="review">Below 50% <b>'+below.length+'</b></button>'+
 '<button type="button" data-ngsl-tab="all">All <b>'+all.length+'</b></button></div>'+
 '<div class="ngsl-p-toolbar"><input data-ngsl-search type="search" placeholder="Search names in selected group…" aria-label="Search students">'+
 '<select data-ngsl-sort aria-label="Sort student results"><option value="low">Lowest score first</option><option value="high">Highest score first</option><option value="name">Name A–Z</option><option value="status">Completion status</option></select>'+
 '<button type="button" data-ngsl-export>Export CSV</button></div>'+
 '<p class="ngsl-p-table-count" data-ngsl-count aria-live="polite"></p><div class="ngsl-p-table-wrap"><table><thead><tr><th scope="col">Student</th><th scope="col">Status</th><th scope="col">Result</th><th scope="col">Foundation indicator</th><th scope="col">Browser events</th></tr></thead><tbody data-ngsl-rows></tbody></table></div>'+
 '<nav class="ngsl-p-pages" aria-label="Student result pages"><span data-ngsl-page-info></span><div><button type="button" data-ngsl-prev>Previous</button><button type="button" data-ngsl-next>Next</button></div></nav>'+
 '<p class="ngsl-p-note">Scores reflect only 50 multiple-choice NGSL meaning-recognition items. Foundation indicators are internal teaching bands, not CEFR certification. Browser focus events do not demonstrate misconduct.</p></section>'+
 '<section class="ngsl-p-explanation"><h2>How to interpret these results</h2><div class="ngsl-p-explanation-grid"><p><b>NGSL:</b> Measures recognition of sampled high-frequency word meanings. It cannot establish how many words a learner knows or measure fluent use.</p><p><b>CEFR:</b> A1–C2 describes broader listening, reading, speaking and writing proficiency. No validated NGSL-to-CEFR conversion is available for this 50-item diagnostic.</p><p><b>Next step:</b> Use weaker frequency groups and individual scores to plan reinforcement, then combine with authentic 0511 reading, writing, listening and speaking evidence.</p></div><p class="ngsl-p-note">Internal indicators: Beginning 0–14, Developing 15–24, Building confidence 25–34, Strong 35–44, Advanced recognition 45–50.</p></section>'+
 '<div class="ngsl-p-dialog" data-ngsl-dialog hidden role="dialog" aria-modal="true" aria-label="Browser event timeline"><div class="ngsl-p-dialog-card"><button type="button" data-ngsl-close aria-label="Close event review">×</button><div data-ngsl-dialog-body></div></div></div></main>';
 let filter='completed',sort='low',query='',page=0;
 const PAGE_SIZE=12;
 const tbody=root.querySelector('[data-ngsl-rows]');
 const statuses={completed:'Completed',progress:'In progress',notstarted:dataset.progressAvailable?'Not started':'No completed result',pending:'Awaiting result'};
 const displayed=()=>{
  let rows=all.filter(row=>{
   const status=scoreStatus(row);
   return row.name.toLowerCase().includes(query)&&
    (filter==='all'||filter==='completed'&&status==='completed'||filter==='incomplete'&&status!=='completed'||filter==='progress'&&status==='progress'||filter==='review'&&row.result?.correct<25);
  });
  rows.sort((a,b)=>sort==='name'?a.name.localeCompare(b.name):
    sort==='high'?(scoreValue(b)-scoreValue(a)||a.name.localeCompare(b.name)):
    sort==='status'?(scoreStatus(a).localeCompare(scoreStatus(b))||a.name.localeCompare(b.name)):
    ((scoreValue(a)<0?999:scoreValue(a))-(scoreValue(b)<0?999:scoreValue(b))||a.name.localeCompare(b.name)));
  return rows;
 };
 const timelineButton=row=>{
  if(!row.result)return '<span class="ngsl-p-muted">—</span>';
  const incident=row.incident;
  if(!dataset.integrityAvailable)return '<span class="ngsl-p-muted">Unavailable</span>';
  if(!incident)return '<span class="ngsl-p-muted">No events reported</span>';
  return '<button type="button" class="ngsl-p-event-link" data-ngsl-detail="'+e(row.id)+'">'+
    incident.focusLosses+' focus · '+incident.fullscreenExits+' fullscreen'+(incident.fullscreenExits===1?' exit':' exits')+
    ' <span aria-hidden="true">›</span></button>';
 };
 const draw=()=>{
  const matches=displayed();
  const totalPages=Math.max(1,Math.ceil(matches.length/PAGE_SIZE));
  page=Math.min(page,totalPages-1);
  const rows=matches.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  tbody.innerHTML=rows.map(row=>{
   const status=scoreStatus(row);
   const sub=status==='progress'?' · '+row.progress.answered+'/50 answered':'';
   const result=row.result?row.result.correct+'/50 <small>· '+(row.result.correct*2)+'%</small>':'—';
   return '<tr><td><b>'+e(row.name)+'</b></td><td><span class="ngsl-p-status ngsl-p-status--'+status+'">'+statuses[status]+e(sub)+'</span></td>'+
    '<td class="ngsl-p-score">'+result+'</td><td>'+e(row.result?rating(row.result.correct):'—')+'</td><td>'+timelineButton(row)+'</td></tr>';
  }).join('')||'<tr><td colspan="5" class="ngsl-p-empty">No students match your filters.</td></tr>';
  root.querySelector('[data-ngsl-count]').textContent=matches.length?'Showing '+(page*PAGE_SIZE+1)+'–'+(page*PAGE_SIZE+rows.length)+' of '+matches.length+' matching students':'No students in this group';
  root.querySelector('[data-ngsl-page-info]').textContent='Page '+(page+1)+' of '+totalPages;
  root.querySelector('[data-ngsl-prev]').disabled=page===0;
  root.querySelector('[data-ngsl-next]').disabled=page>=totalPages-1;
  root.querySelectorAll('[data-ngsl-tab]').forEach(button=>{
   const selected=button.dataset.ngslTab===filter;
   button.classList.toggle('ngsl-p-tab-active',selected);
   button.setAttribute('aria-pressed',String(selected));
  });
 };
 function openTimeline(id){
  const row=all.find(x=>x.id===id);if(!row)return;
  const incident=row.incident;
  const entries=Array.isArray(incident?.timeline)?incident.timeline:[];
  const grouped=[];
  for(const item of entries){
   if(!Object.hasOwn(TYPES,item.type))continue;
   const key=item.type+'|'+item.position+'|'+String(item.at).slice(0,16);
   const prior=grouped.find(x=>x.key===key);
   if(prior)prior.count++;else grouped.push({...item,key,count:1});
  }
  const body=root.querySelector('[data-ngsl-dialog-body]');
  body.innerHTML='<h2>'+e(row.name)+'</h2><p>Browser activity recorded during the diagnostic. These signals may reflect normal browser or device behaviour and are <b>not proof of cheating</b>.</p>'+
   '<p class="ngsl-p-dialog-count">'+(incident?.focusLosses??0)+' focus events · '+(incident?.fullscreenExits??0)+' fullscreen exits</p>'+
   (grouped.length?'<ol class="ngsl-p-events">'+grouped.map(x=>'<li><b>'+e(TYPES[x.type])+' · Question '+x.position+'</b>'+(x.count>1?' <span class="ngsl-p-repeat">×'+x.count+'</span>':'')+
    '<small>'+e(fmtTime(x.at))+'</small></li>').join('')+'</ol>':'<p>No timeline details are available.</p>')+
   '<small>Repeated events within the same minute are grouped for readability; the original server event records are unchanged.</small>';
  root.querySelector('[data-ngsl-dialog]').hidden=false;
  root.querySelector('[data-ngsl-close]').focus();
 }
 const close=()=>{root.querySelector('[data-ngsl-dialog]').hidden=true;};
 root.querySelector('[data-ngsl-search]').addEventListener('input',event=>{query=event.target.value.trim().toLowerCase();page=0;draw();});
 root.querySelectorAll('[data-ngsl-tab]').forEach(button=>button.addEventListener('click',()=>{
  filter=button.dataset.ngslTab;page=0;draw();
 }));
 root.querySelector('[data-ngsl-sort]').addEventListener('change',event=>{sort=event.target.value;page=0;draw();});
 root.querySelector('[data-ngsl-prev]').addEventListener('click',()=>{if(page>0){page--;draw();}});
 root.querySelector('[data-ngsl-next]').addEventListener('click',()=>{if((page+1)*PAGE_SIZE<displayed().length){page++;draw();}});
 root.querySelectorAll('[data-ngsl-quick]').forEach(button=>button.addEventListener('click',()=>{
  filter=button.dataset.ngslQuick;page=0;draw();root.querySelector('.ngsl-p-students').scrollIntoView({behavior:'smooth',block:'start'});
 }));
 root.querySelector('[data-ngsl-rows]').addEventListener('click',event=>{
  const button=event.target.closest('[data-ngsl-detail]');if(button)openTimeline(button.dataset.ngslDetail);
 });
 root.querySelector('[data-ngsl-close]').addEventListener('click',close);
 root.querySelector('[data-ngsl-dialog]').addEventListener('click',event=>{if(event.target===event.currentTarget)close();});
 root.querySelector('[data-ngsl-dialog]').addEventListener('keydown',event=>{if(event.key==='Escape')close();});
 root.querySelector('[data-ngsl-export]').addEventListener('click',()=>{
  const headings=['Student','Status','Score / 50','Percentage','Foundation indicator','Focus events','Fullscreen exits'];
  const records=displayed().map(r=>[r.name,statuses[scoreStatus(r)],r.result?.correct??'',r.result?.correct!=null?r.result.correct*2+'%':'',r.result?rating(r.result.correct):'',r.incident?.focusLosses??'',r.incident?.fullscreenExits??'']);
  const csv='\uFEFF'+[headings,...records].map(row=>row.map(safeCsv).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='NGSL-diagnostic-results.csv';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 draw();
}
