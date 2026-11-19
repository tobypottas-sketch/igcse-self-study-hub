import {createClient} from 'npm:@supabase/supabase-js@2.117.3';
import {validateTeacherPasswordAction,canManageStudent,createReadablePassword} from './validation.js';
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'};
const reply=(data,status=200)=>Response.json(data,{status,headers});
const key=(primary,fallback)=>{const direct=Deno.env.get(primary);if(direct)return direct;const raw=Deno.env.get(fallback);if(!raw)return '';try{const parsed=JSON.parse(raw);return parsed.default??Object.values(parsed)[0]??'';}catch{return '';}};
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 try{
  const token=/^Bearer\\s+(\\S+)$/i.exec(req.headers.get('authorization')??'')?.[1];
  if(!token)return reply({error:'Please sign in again.'},401);
  const url=Deno.env.get('SUPABASE_URL')??'';
  const pub=key('SUPABASE_ANON_KEY','SUPABASE_PUBLISHABLE_KEYS');
  const secret=key('SUPABASE_SERVICE_ROLE_KEY','SUPABASE_SECRET_KEYS');
  if(!url||!pub||!secret)return reply({error:'Service unavailable.'},503);
  const input=validateTeacherPasswordAction(await req.json());
  const caller=createClient(url,pub,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:identity,error:authError}=await caller.auth.getUser(token);
  if(authError||!identity?.user)return reply({error:'Please sign in again.'},401);
  const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const actorId=identity.user.id;
  const {data:actor,error:actorError}=await db.from('profiles').select('id,role,active').eq('id',actorId).single();
  if(actorError||!actor?.active||!['teacher','admin'].includes(actor.role))return reply({error:'Staff access required.'},403);
  if(input.action==='list'){
   let classIds=null;
   if(actor.role==='teacher'){
    const {data:assigned,error:assignmentError}=await db.from('teacher_classes').select('class_id').eq('teacher_id',actorId);
    if(assignmentError)throw new Error('Cannot load class assignments.');
    classIds=[...new Set((assigned??[]).map(x=>x.class_id))];
    if(!classIds.length)return reply({students:[]});
   }
   let query=db.from('student_class_memberships').select('class_id,student_id').is('ended_at',null);
   if(classIds)query=query.in('class_id',classIds);
   const {data:links,error:linksError}=await query.range(0,999);
   if(linksError)throw new Error('Cannot load your class roster.');
   const ids=[...new Set((links??[]).map(x=>x.student_id))];
   if(!ids.length)return reply({students:[]});
   const profiles=[];
   for(let i=0;i<ids.length;i+=100){
    const {data,error}=await db.from('profiles').select('id,display_name,school_email,active,role').in('id',ids.slice(i,i+100)).eq('role','student').eq('active',true);
    if(error)throw new Error('Cannot load student names.');
    profiles.push(...(data??[]));
   }
   const byId=new Map(profiles.map(x=>[x.id,x]));
   const students=(links??[]).flatMap(link=>{
    const p=byId.get(link.student_id);
    return p?[{id:p.id,name:p.display_name,email:p.school_email,classId:link.class_id}]:[];
   });
   return reply({students});
  }
  // Never trust client-supplied class, role, email or membership.
  const {data:student,error:studentError}=await db.from('profiles').select('id,role,active,display_name,school_email').eq('id',input.studentId).maybeSingle();
  if(studentError||!student||student.role!=='student'||!student.active)return reply({error:'Student account unavailable.'},403);
  const {data:membership,error:membershipError}=await db.from('student_class_memberships').select('class_id,ended_at').eq('student_id',input.studentId).is('ended_at',null).limit(1).maybeSingle();
  if(membershipError||!membership)return reply({error:'Student is not in an active class.'},403);
  let assigned=actor.role==='admin';
  if(!assigned){
   const {data:link,error:linkError}=await db.from('teacher_classes').select('class_id').eq('teacher_id',actorId).eq('class_id',membership.class_id).maybeSingle();
   if(linkError)throw new Error('Cannot confirm class access.');
   assigned=Boolean(link);
  }
  if(!canManageStudent({actor,student,membership,assigned}))return reply({error:'You can reset passwords only for students in your own classes.'},403);
  const hour=new Date(Date.now()-3600000).toISOString();
  const day=new Date(Date.now()-86400000).toISOString();
  const [{count:actorCount,error:actorLimitError},{count:studentCount,error:studentLimitError}]=await Promise.all([
   db.from('teacher_student_password_reset_events').select('id',{head:true,count:'exact'}).eq('actor_id',actorId).gte('created_at',hour),
   db.from('teacher_student_password_reset_events').select('id',{head:true,count:'exact'}).eq('student_id',input.studentId).gte('created_at',day)
  ]);
  if(actorLimitError||studentLimitError)throw new Error('Password reset audit unavailable.');
  if((actorCount??0)>=8)return reply({error:'Hourly reset limit reached. Contact an administrator.'},429);
  if((studentCount??0)>=3)return reply({error:'This student has reached the daily reset limit.'},429);
  // Audit an attempt before using privileged auth. No password is recorded.
  const {data:audit,error:auditError}=await db.from('teacher_student_password_reset_events').insert({actor_id:actorId,student_id:input.studentId}).select('id').single();
  if(auditError||!audit)throw new Error('Reset auditing unavailable.');
  const password=createReadablePassword();
  const {error:resetError}=await db.auth.admin.updateUserById(input.studentId,{password});
  if(resetError)return reply({error:'Password could not be reset. Try again or contact an administrator.'},500);
  await db.from('teacher_student_password_reset_events').update({succeeded:true}).eq('id',audit.id);
  return reply({ok:true,studentId:input.studentId,name:student.display_name,email:student.school_email,temporaryPassword:password});
 }catch(err){
  const message=err instanceof Error?err.message:'Unable to reset password.';
  return reply({error:message==='Invalid password reset request.'||message==='Invalid request.'?message:'Password service unavailable. Please try again.'},400);
 }
});