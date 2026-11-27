import { reportingPeriod, timestampOf } from '../reporting/periods.js';
import { WRITING_APPS, chinaDate, buildWritingRows } from './submissions.js';
import { escapeHtml as e } from '../views/html.js';
async function allPages(query) {
  const rows=[];for(let offset=0;;offset+=500){const {data,error}=await query().range(offset,offset+499);if(error)throw error;rows.push(...(data??[]));if((data??[]).length<500)return rows;}
}
const options=(items)=>items.map(([value,label])=>'<option value="'+e(value)+'">'+e(label)+'</option>').join('');
export async function openWritingActivity(root,client,{onBack}) {
  root.innerHTML='<section class="shell wa-page"><header class="wa-hero"><div class="wa-hero-icon" aria-hidden="true">✎</div><div><p class="wa-kicker">TEACHER DASHBOARD · WRITING</p><h1>Writing Activity</h1><p>Review writing submitted through the Hub.</p></div><button class="wa-back" data-writing-back>← Back to Hub</button></header><p class="wa-message" role="status">Loading your classes…</p></section>';
  const page=root.firstElementChild;page.querySelector('[data-writing-back]').onclick=onBack;
  try{
    const [classes,members,profiles]=await Promise.all([
      allPages(()=>client.from('classes').select('id,class_name').eq('active',true).order('id')),
      allPages(()=>client.from('student_class_memberships').select('student_id,class_id,started_at').is('ended_at',null).order('student_id').order('class_id')),
      allPages(()=>client.from('profiles').select('id,display_name').eq('role','student').eq('active',true).order('id'))
    ]);
    if(!page.isConnected)return;
    const names=new Map(profiles.map(p=>[p.id,p.display_name]));
    classes.sort((a,b)=>a.class_name.localeCompare(b.class_name,'en',{numeric:true}));
    const classIds=new Set(classes.map(c=>c.id));
    const roster=members.filter(m=>classIds.has(m.class_id)&&names.has(m.student_id)).map(m=>({studentId:m.student_id,classId:m.class_id,displayName:names.get(m.student_id),startedAt:m.started_at}));
    const today=chinaDate(new Date()),start=chinaDate(new Date(Date.now()-6*86400000));
    page.insertAdjacentHTML('beforeend','<section class="wa-panel wa-filters"><div class="wa-panel-heading"><div><h2>Find submissions</h2><p>Select a class and submission period.</p></div><span class="wa-time">China time · UTC+8</span></div><div class="wa-filter-grid"><label>Class<select data-w-class>'+options(classes.map(c=>[c.id,c.class_name]))+'</select></label><label>Writing type<select data-w-app>'+options(Object.entries(WRITING_APPS))+'</select></label><label>From<input type="date" data-w-from value="'+start+'"></label><label>To<input type="date" data-w-to value="'+today+'"></label></div><div class="wa-question-grid"><label>Exact writing question<select data-w-task><option value="">All questions</option></select></label><button type="button" class="wa-refresh" data-w-refresh>↻ Refresh</button></div></section><div class="wa-results" data-w-results aria-live="polite"></div>');
    page.querySelector('p[role=status]').remove();
    const $=s=>page.querySelector('[data-w-'+s+']');
    const results=$('results');let entries=[],generation=0,missingOnly=false,loaded=false;
    const filters=()=>({classId:$('class').value,appKey:$('app').value,from:$('from').value,to:$('to').value,task:$('task').value});
    function render(){
      const f=filters(),rows=buildWritingRows(roster,entries,f);
      const completed=rows.filter(row=>row.submissions.length).length;
      const missing=rows.length-completed, percent=rows.length?Math.round(100*completed/rows.length):0;
      const visible=rows.map((row,index)=>({row,index})).filter(({row})=>!missingOnly||!row.submissions.length);
      results.innerHTML=`<div class="wa-stats">
        <article class="wa-stat wa-stat--class"><span class="wa-stat-icon" aria-hidden="true">◎</span><div><p>Class size</p><strong>${rows.length}</strong></div></article>
        <article class="wa-stat wa-stat--done"><span class="wa-stat-icon" aria-hidden="true">✓</span><div><p>Submitted</p><strong>${completed}</strong></div></article>
        <article class="wa-stat wa-stat--missing"><span class="wa-stat-icon" aria-hidden="true">!</span><div><p>No recorded submission</p><strong>${missing}</strong></div></article>
      </div>
      <section class="wa-panel wa-completion"><div class="wa-progress-head"><div><h2>Recorded submissions</h2><p>${completed} of ${rows.length} students submitted</p></div><strong>${percent}%</strong></div><progress max="100" value="${percent}" aria-label="Recorded submissions"></progress>${f.task?'':'<p class="wa-note">All questions selected. Counts include any recorded submission in this period.</p>'}</section>
      <section class="wa-panel wa-roster"><div class="wa-panel-heading"><div><h2>Student submissions</h2><p>${visible.length} of ${rows.length} students shown</p></div><label class="wa-toggle"><input type="checkbox" data-w-missing ${missingOnly?'checked':''}> Show only students without a recorded submission</label></div><div class="wa-table-wrap"><table class="wa-table"><thead><tr><th scope="col">#</th><th scope="col">Student</th><th scope="col">Status</th><th scope="col">Words</th><th scope="col">Submitted (China)</th><th scope="col">Writing</th></tr></thead><tbody>${visible.map(({row,index})=>{
        const latest=row.submissions[0];
        return `<tr><td class="wa-number">${index+1}</td><td class="wa-student">${e(row.displayName)}</td><td><span class="wa-status ${latest?'wa-status--done':'wa-status--missing'}">${latest?'✓ Submitted':'○ No recorded submission'}</span></td><td>${latest?e(latest.response.trim().split(/\s+/).length):'—'}</td><td>${latest?e(new Date(latest.submitted_at).toLocaleString('en-GB',{timeZone:'Asia/Shanghai'})):'—'}</td><td>${latest?row.submissions.map((s,i)=>`<details class="wa-response"><summary>View writing${row.submissions.length>1?' '+(i+1):''}</summary><p class="wa-response-date">${e(new Date(s.submitted_at).toLocaleString('en-GB',{timeZone:'Asia/Shanghai'}))}</p><p><strong>${e(s.task)}</strong></p><p class="wa-response-text">${e(s.response)}</p></details>`).join(''):'—'}</td></tr>`;
      }).join('')||'<tr><td colspan="6" class="wa-empty">'+(missingOnly?'Everyone shown has a recorded submission.':'No students in this class.')+'</td></tr>'}</tbody></table></div></section>`;
      results.querySelector('[data-w-missing]').addEventListener('change',event=>{missingOnly=event.target.checked;render();results.querySelector('[data-w-missing]')?.focus();});
    }
    async function refresh(){
      const f=filters(),token=++generation;results.innerHTML='<p class="wa-message" role="status">Loading submissions…</p>';entries=[];loaded=false;
      if(!f.classId){results.textContent='No assigned classes.';return;}
      if(!f.from||!f.to||f.from>f.to){results.textContent='Choose a valid date range.';return;}
      try{
        const ids=roster.filter(s=>s.classId===f.classId).map(s=>s.studentId);
        const period=reportingPeriod('custom',f);
        const start=new Date(period.start).toISOString();
        const end=new Date(Math.min(period.end,period.asOf+1)).toISOString();
        const collected=[];
        for(let i=0;i<ids.length;i+=50)collected.push(...await allPages(()=>client.from('student_writing_submissions').select('id,student_id,app_key,task,response,submitted_at').in('student_id',ids.slice(i,i+50)).eq('app_key',f.appKey).gte('submitted_at',start).lt('submitted_at',end).order('id')));
        if(token!==generation||!page.isConnected)return;
        const enrolment = new Map(roster.filter(s=>s.classId===f.classId).map(s=>[s.studentId,timestampOf(s.startedAt)]));
        entries=collected.filter(row=>timestampOf(row.submitted_at)>=enrolment.get(row.student_id));loaded=true;
        const tasks=[...new Set(entries.map(s=>s.task))].sort();
        $('task').innerHTML='<option value="">All questions</option>'+options(tasks.map(t=>[t,t]));
        if(tasks.includes(f.task))$('task').value=f.task;
        render();
      }catch{if(token===generation&&page.isConnected)results.innerHTML='<p class="wa-message wa-message--error" role="alert">Could not load writing activity. Use Refresh to try again.</p>';}
    }
    for(const key of ['class','app','from','to'])$(''+key).addEventListener('change',refresh);
    $('task').addEventListener('change',()=>{if(loaded)render();});
    $('refresh').onclick=refresh;await refresh();
  }catch{if(page.isConnected){const status=page.querySelector('p[role=status]')??page.querySelector('[data-w-results]');if(status)status.textContent='Could not load classes. Return to the Hub and try again.';}}
}
