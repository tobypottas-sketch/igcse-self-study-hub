export const WRITING_APPS = Object.freeze({review_writing:'Review Writing',email_writing:'Informal Email',essay_writing:'Essay Writing'});
export function submissionPayload(appKey, task, response) {
  task=String(task??'').trim(); response=String(response??'').trim();
  if(!Object.hasOwn(WRITING_APPS,appKey)||!task||!response||task.length>12000||response.length>30000) throw new Error('Choose a task and write your response before submitting.');
  return {app_key:appKey,task,response};
}
export function chinaDate(value) {
  const date=new Date(value);
  return Number.isFinite(date.getTime())?new Date(date.getTime()+8*3600000).toISOString().slice(0,10):'';
}
export function buildWritingRows(roster, submissions, {classId,appKey,from,to,task=''}) {
  const byStudent=new Map();
  for(const entry of submissions){
    const day=chinaDate(entry.submitted_at);
    if(entry.app_key!==appKey||!day||day<from||day>to||(task&&entry.task!==task))continue;
    if(!byStudent.has(entry.student_id))byStudent.set(entry.student_id,[]);
    byStudent.get(entry.student_id).push(entry);
  }
  return roster.filter(s=>s.classId===classId).map(s=>({...s,submissions:(byStudent.get(s.studentId)||[]).sort((a,b)=>Date.parse(b.submitted_at)-Date.parse(a.submitted_at))})).sort((a,b)=>a.displayName.localeCompare(b.displayName,'en',{numeric:true}));
}
export async function submitWriting(client, appKey, task, response) {
  const payload=submissionPayload(appKey,task,response);
  const {error}=await client.from('student_writing_submissions').insert(payload);
  if(error)throw error;
}
export function mountWritingSubmission(host,{client,appKey,getTask,getResponse,allowed=()=>true}) {
  const doc=host.ownerDocument;
  const section=doc.createElement('section');section.className='student-feedback';
  const title=doc.createElement('h2');title.textContent='Submit writing to your teacher';
  const hint=doc.createElement('p');hint.textContent='Save a copy of your current writing for your teacher. AI feedback is not required.';
  const button=doc.createElement('button');button.type='button';button.className='sf-button button button--primary';button.textContent='Submit Writing';
  const status=doc.createElement('p');status.setAttribute('role','status');
  section.append(title,hint,button,status);host.append(section);
  let busy=false;
  button.addEventListener('click',async()=>{
    if(busy||!allowed())return;
    try {
      const payload=submissionPayload(appKey,getTask(),getResponse());
      busy=true;button.disabled=true;status.textContent='Submitting…';
      await submitWriting(client,payload.app_key,payload.task,payload.response);
      status.textContent='Submitted successfully. Your teacher can now see this version.';
    }catch(error){status.textContent='Not submitted. '+(error instanceof Error?error.message:'Please try again. Your writing is still here.');}
    finally{busy=false;button.disabled=false;}
  });
  return {dispose(){section.remove();}};
}
