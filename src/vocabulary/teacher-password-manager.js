import {escapeHtml} from '../views/html.js';
const e=value=>escapeHtml(String(value??''));
export async function openTeacherPasswordManager(root,client,onBack,assignedClasses=[]){
 root.innerHTML='<main class="vocab-shell teacher-password-page"><header class="vocab-topbar"><a href="./" class="vocab-back">← Hub</a><span>Student accounts</span></header><section class="teacher-password-hero"><div><p class="vocab-kicker">STAFF TOOLS</p><h1>Student password resets</h1><p>Only students in your assigned classes. New passwords are shown once.</p></div><button type="button" class="vocab-button" data-pw-back>Back to classes</button></section><section class="teacher-password-card"><p role="status">Loading students…</p></section></main>';
 const page=root.querySelector('.teacher-password-page');
 page.querySelector('[data-pw-back]').addEventListener('click',onBack);
 const card=page.querySelector('.teacher-password-card');
 async function api(body){
  const {data,error}=await client.functions.invoke('teacher-student-password',{body});
  if(error||data?.error)throw new Error(data?.error||'Password service unavailable.');
  return data;
 }
 let rows=[],selected=null,busy=false,query='',classId='all';
 const render=()=>{
  const classes=[...new Set(rows.map(x=>x.classId))];
  const classNames=new Map(assignedClasses.map(c=>[c.id,c.className]));
  const matches=rows.filter(x=>(classId==='all'||x.classId===classId)&&[x.name,x.email].join(' ').toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));
  card.innerHTML='<div class="teacher-password-top"><div><h2>Students</h2><p>'+rows.length+' eligible accounts · select a student to reset</p></div><div class="teacher-password-controls"><input type="search" data-pw-search aria-label="Search student name or email" placeholder="Find student…" value="'+e(query)+'"><select data-pw-class aria-label="Filter by class"><option value="all">All my classes</option>'+classes.map(id=>'<option value="'+e(id)+'"'+(classId===id?' selected':'')+'>'+e(classNames.get(id)||'Class')+'</option>').join('')+'</select></div></div>'+
   '<div class="teacher-password-list" role="list">'+(matches.length?matches.slice(0,100).map(r=>'<div role="listitem" class="teacher-password-row"><div><strong>'+e(r.name)+'</strong><small>'+e(r.email)+'</small></div><button type="button" data-pw-student="'+e(r.id)+'" '+(busy?'disabled':'')+'>Reset password</button></div>').join(''):'<p class="teacher-password-empty">No students match your search.</p>')+'</div>'+
   (matches.length>100?'<p class="teacher-password-small">Showing the first 100 matches. Search for another student to narrow the list.</p>':'')+
   '<p class="teacher-password-small">For security, a new temporary password is generated automatically. Share it privately with the student.</p>';
  const input=card.querySelector('[data-pw-search]');
  input.addEventListener('input',ev=>{query=ev.target.value;const position=ev.target.selectionStart;render();const next=card.querySelector('[data-pw-search]');next.focus();next.setSelectionRange(position,position);});
  card.querySelector('[data-pw-class]').addEventListener('change',ev=>{classId=ev.target.value;render();});
  card.querySelectorAll('[data-pw-student]').forEach(btn=>btn.addEventListener('click',()=>choose(btn.dataset.pwStudent)));
 };
 const dialog=document.createElement('dialog');dialog.className='teacher-password-dialog';page.append(dialog);
 const close=()=>{if(dialog.open)dialog.close();dialog.innerHTML='';selected=null;};
 function choose(id){
  const row=rows.find(r=>r.id===id);if(!row||busy)return;
  selected=row;
  dialog.innerHTML='<form method="dialog" class="teacher-password-modal"><h2>Reset student password?</h2><p><strong>'+e(row.name)+'</strong></p><p>'+e(row.email)+'</p><p>This replaces the student’s current password. Only share the new password directly with them.</p><div class="teacher-password-modal-actions"><button type="button" data-pw-cancel>Cancel</button><button type="button" data-pw-confirm class="teacher-password-primary">Generate new password</button></div></form>';
  dialog.showModal();
  dialog.querySelector('[data-pw-cancel]').addEventListener('click',close);
  dialog.querySelector('[data-pw-confirm]').addEventListener('click',async()=>{
   if(busy||!selected)return;
   busy=true;const btn=dialog.querySelector('[data-pw-confirm]');btn.disabled=true;btn.textContent='Resetting…';
   try{
    const result=await api({action:'reset',studentId:selected.id});
    dialog.innerHTML='<div class="teacher-password-modal"><p class="teacher-password-success">Password reset successfully</p><h2>'+e(result.name)+'</h2><p>One-time temporary password:</p><div class="teacher-password-result"><code data-pw-secret>'+e(result.temporaryPassword)+'</code><button type="button" data-pw-copy>Copy</button></div><p class="teacher-password-small">This password will disappear when you close this window. Keep it private.</p><div class="teacher-password-modal-actions"><button type="button" data-pw-done class="teacher-password-primary">Done</button></div></div>';
    dialog.querySelector('[data-pw-copy]').addEventListener('click',async()=>{
     try{await navigator.clipboard.writeText(result.temporaryPassword);dialog.querySelector('[data-pw-copy]').textContent='Copied';}
     catch{dialog.querySelector('[data-pw-copy]').textContent='Select password to copy';}
    });
    dialog.querySelector('[data-pw-done]').addEventListener('click',close);
   }catch(err){dialog.innerHTML='<div class="teacher-password-modal"><h2>Reset not completed</h2><p role="alert">'+e(err.message)+'</p><button type="button" data-pw-done>Close</button></div>';dialog.querySelector('[data-pw-done]').addEventListener('click',close);}
   finally{busy=false;}
  });
 }
 dialog.addEventListener('close',()=>{dialog.innerHTML='';selected=null;});
 try{
  const data=await api({action:'list'});
  if(!Array.isArray(data.students))throw new Error('Could not load student accounts.');
  rows=data.students.filter(r=>typeof r.id==='string'&&typeof r.name==='string'&&typeof r.email==='string'&&typeof r.classId==='string');
  render();
 }catch(err){card.innerHTML='<p role="alert">'+e(err.message)+'</p><button type="button" class="vocab-button" data-pw-retry>Retry</button>';card.querySelector('[data-pw-retry]').addEventListener('click',()=>openTeacherPasswordManager(root,client,onBack,assignedClasses));}
}
