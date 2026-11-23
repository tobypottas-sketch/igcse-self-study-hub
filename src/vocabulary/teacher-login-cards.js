import {escapeHtml} from '../views/html.js';
import {renderLoginCards} from '../admin/credential-print.js';

const e=value=>escapeHtml(String(value??''));

async function invoke(client,body){
 const {data,error}=await client.functions.invoke('admin-provision-user',{body});
 if(error||data?.error){
  let message=data?.error;
  if(!message&&error?.context?.json)try{message=(await error.context.json())?.error;}catch{}
  throw new Error(message||'Could not create login cards.');
 }
 return data;
}

/** One class at a time. Credentials are never written to application state or storage. */
export async function openTeacherClassLoginCards(client,assignedClasses=[]){
 const classes=assignedClasses.filter(row=>row?.id&&row?.className);
 let classId='',className='',allStudents=[];
 const panel=document.createElement('dialog');
 panel.className='teacher-login-cards-dialog';
 panel.setAttribute('aria-label','Create student login cards');
 document.body.append(panel);
 let busy=false,roster=[],selected=new Set();
 const close=()=>{if(!busy){panel.close();panel.remove();}};
 panel.addEventListener('cancel',event=>{if(busy)event.preventDefault();else panel.remove();});
 const paint=()=>{
  const count=selected.size;
  panel.innerHTML='<div class="teacher-login-cards-panel"><header><div><p class="vocab-kicker">CLASS ACCOUNT TOOLS</p><h2>Create student login cards</h2><p>Choose an assigned class, then select students to print.</p></div><button type="button" data-card-close aria-label="Close">×</button></header>'+
   '<label class="teacher-login-cards-class-label" for="teacher-login-cards-class">Class to print</label><select id="teacher-login-cards-class" data-card-class><option value="">Choose a class…</option>'+classes.map(c=>'<option value="'+e(c.id)+'"'+(classId===c.id?' selected':'')+'>'+e(c.className)+'</option>').join('')+'</select>'+
   '<p class="teacher-login-cards-warning"><strong>Important:</strong> Creating a login card replaces the selected student’s current password. Their old password will immediately stop working. Student progress, XP and rewards stay unchanged.</p>'+
   '<div class="teacher-login-cards-toolbar"><strong>'+count+' of '+roster.length+' selected</strong><div><button type="button" data-card-all>Select all</button><button type="button" data-card-none>Clear selection</button></div></div>'+
   '<div class="teacher-login-cards-list" role="group" aria-label="Select students">'+(!classId?'<p class="teacher-login-cards-placeholder">Choose a class above to display its students.</p>':!roster.length?'<p class="teacher-login-cards-placeholder">No active students found in this class.</p>':'')+roster.map(row=>'<label><input type="checkbox" data-card-student="'+e(row.id)+'"'+(selected.has(row.id)?' checked':'')+'><span><strong>'+e(row.name)+'</strong><small>'+e(row.email)+'</small></span></label>').join('')+'</div>'+
   '<label class="teacher-login-cards-consent"><input type="checkbox" data-card-consent> I understand that the selected students’ existing passwords will stop working.</label>'+
   '<div class="teacher-login-cards-actions"><button type="button" data-card-cancel>Cancel</button><button type="button" class="vocab-button vocab-button--primary" data-card-generate disabled>Generate '+count+' login card'+(count===1?'':'s')+'</button></div><p data-card-error role="alert"></p></div>';
  panel.querySelector('[data-card-close]').addEventListener('click',close);
  panel.querySelector('[data-card-class]').addEventListener('change',event=>{
   classId=event.target.value;
   const chosen=classes.find(c=>c.id===classId);
   className=chosen?.className??'';
   const byId=new Map();
   if(chosen)for(const row of allStudents)if(row.classId===classId&&row.id&&row.name&&row.email)byId.set(row.id,row);
   roster=[...byId.values()].sort((a,b)=>a.name.localeCompare(b.name));
   selected.clear();paint();
  });
  panel.querySelector('[data-card-cancel]').addEventListener('click',close);
  panel.querySelector('[data-card-all]').addEventListener('click',()=>{selected=new Set(roster.map(row=>row.id));paint();});
  panel.querySelector('[data-card-none]').addEventListener('click',()=>{selected.clear();paint();});
  const button=panel.querySelector('[data-card-generate]');
  const consent=panel.querySelector('[data-card-consent]');
  consent.addEventListener('change',()=>{button.disabled=!consent.checked||!selected.size;});
  panel.querySelectorAll('[data-card-student]').forEach(input=>input.addEventListener('change',()=>{
   if(input.checked)selected.add(input.dataset.cardStudent);else selected.delete(input.dataset.cardStudent);
   paint();
  }));
  button.addEventListener('click',async()=>{
   if(busy||!classId||!classes.some(c=>c.id===classId)||!selected.size||!consent.checked)return;
   const studentIds=roster.filter(row=>selected.has(row.id)).map(row=>row.id);
   // A second explicit confirmation prevents accidental whole-class resets.
   if(!globalThis.confirm?.('Generate '+studentIds.length+' new login password'+(studentIds.length===1?'':'s')+' for '+className+'? Existing passwords for these students will stop working.'))return;
   busy=true;
   panel.querySelectorAll('button,input,select').forEach(input=>{input.disabled=true;});
   button.textContent='Generating secure passwords…';
   try{
    const result=await invoke(client,{action:'issue_class_credentials',classId,studentIds});
    if(!Array.isArray(result.created)||!Array.isArray(result.failed))throw Error('Invalid credential response. Contact an administrator.');
    if(!result.created.length)throw Error(result.failed.length?'No passwords were changed. '+result.failed.map(row=>row.reason).join('; '):'No student credentials returned.');
    panel.close();panel.remove();
    const wrapper=document.createElement('div');
    wrapper.innerHTML=renderLoginCards(result.created,className,'',result.failed);
    const modal=wrapper.firstElementChild;
    if(!modal)return;
    document.body.append(modal);
    const dismiss=()=>{modal.remove();document.removeEventListener('keydown',escape);};
    const escape=event=>{if(event.key==='Escape')dismiss();};
    modal.querySelector('[data-action="admin-close-login-cards"]')?.addEventListener('click',dismiss);
    modal.querySelector('[data-action="admin-print-credentials"]')?.addEventListener('click',()=>globalThis.print?.());
    document.addEventListener('keydown',escape);
    modal.querySelector('[data-action="admin-close-login-cards"]')?.focus();
   }catch(error){
    panel.querySelector('[data-card-error]').textContent=error instanceof Error?error.message:'Unable to generate login cards.';
    panel.querySelectorAll('button,input,select').forEach(input=>{input.disabled=false;});
    const consentAgain=panel.querySelector('[data-card-consent]');
    const generateAgain=panel.querySelector('[data-card-generate]');
    generateAgain.disabled=!consentAgain.checked||!selected.size;
    generateAgain.textContent='Generate '+selected.size+' login cards';
   }finally{busy=false;}
  });
 };
 panel.innerHTML='<div class="teacher-login-cards-panel"><p role="status">Loading authorised class students…</p></div>';
 panel.showModal();
 try{
  const result=await invoke(client,{action:'teacher_list_students'});
  if(!Array.isArray(result.students))throw Error('Student roster unavailable.');
  allStudents=result.students.filter(row=>classes.some(c=>c.id===row.classId));
  if(!classes.length)throw Error('No assigned classes available.');
  paint();
 }catch(error){
  panel.innerHTML='<div class="teacher-login-cards-panel"><h2>Login cards unavailable</h2><p role="alert">'+e(error.message)+'</p><button type="button" data-card-close>Close</button></div>';
  panel.querySelector('[data-card-close]').addEventListener('click',close);
 }
}
