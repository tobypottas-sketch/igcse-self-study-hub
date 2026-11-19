// Read-only vocabulary practice leaderboard. Never reads or modifies sandbox wallets.
// Returns only first and last display-name tokens, ranks and XP earned from completed missions to authenticated active students.
import {createClient} from 'npm:@supabase/supabase-js@2.117.3';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
const reply=(data,status=200)=>Response.json(data,{status,headers:{...cors,'Cache-Control':'no-store'}});
const valid=(v)=>typeof v==='string'&&v.length>0;
const configured=(name,fallback)=>{const direct=Deno.env.get(name);if(direct)return direct;const raw=Deno.env.get(fallback);if(!raw)return null;try{const parsed=JSON.parse(raw);return parsed.default||Object.values(parsed).find(v=>typeof v==='string')||null}catch{return null}};
// Present the recorded given name and surname, omitting English middle names and
// parenthetical nicknames. Keep the original profile record unmodified.
function shortName(value){
 const clean=String(value||'Student').replace(/\([^)]*\)|（[^）]*）/g,' ')
  .replace(/[<>]/g,'').trim();
 const parts=clean.split(/\s+/).filter(Boolean);
 if(!parts.length)return 'Student';
 return parts.length===1?parts[0]:parts[0]+' '+parts[parts.length-1];
}
function day(date){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(date));const val=key=>parts.find(x=>x.type===key)?.value||'00';return val('year')+'-'+val('month')+'-'+val('day')}
function weekStart(){const parts=day(new Date()).split('-').map(Number);const dt=new Date(Date.UTC(parts[0],parts[1]-1,parts[2]));dt.setUTCDate(dt.getUTCDate()-(dt.getUTCDay()+6)%7);return dt.toISOString().slice(0,10)}
function scores(missions,studentIds){
 const group=new Map(studentIds.map(id=>[id,[]]));for(const row of missions)group.get(row.student_id)?.push(row);
 const monday=weekStart();const totals=new Map();
 for(const [id,rows] of group){
  rows.sort((a,b)=>String(a.completed_at).localeCompare(String(b.completed_at))||String(a.mission_id).localeCompare(String(b.mission_id)));
  const daily=new Map(),buckets=new Map();let all=0,weekly=0;
  for(const row of rows){
   if(!row.completed_at||!Number.isFinite(Number(row.score)))continue;
   const d=day(row.completed_at);const b=row.mission_kind==='mixed'?'mixed':String(row.pathway_id||'')+'|'+String(row.pathway_stage||'');
   const key=d+'|'+b;const count=(buckets.get(key)||0)+1;buckets.set(key,count);
   let xp=Number(row.score)>=9?20:Number(row.score)>=7?15:10;if(count>=3)xp=Math.floor(xp/2);
   const used=daily.get(d)||0;xp=Math.max(0,Math.min(xp,80-used));daily.set(d,used+xp);
   all+=xp;if(d>=monday)weekly+=xp;
  }
  totals.set(id,{all,weekly});
 }
 return totals;
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return reply({ok:false,error:'Method not allowed'},405);
 try{
  const token=req.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
  const url=Deno.env.get('SUPABASE_URL'),anon=configured('SUPABASE_ANON_KEY','SUPABASE_PUBLISHABLE_KEYS'),secret=configured('SUPABASE_SERVICE_ROLE_KEY','SUPABASE_SECRET_KEYS');
  if(!token||!url||!anon||!secret)return reply({ok:false,error:'Authentication unavailable'},401);
  const caller=createClient(url,anon,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:authError}=await caller.auth.getUser(token);
  if(authError||!user)return reply({ok:false,error:'Invalid session'},401);
  const {data:callerProfile,error:profileError}=await caller.from('profiles').select('role,active').eq('id',user.id).single();
  if(profileError||callerProfile?.role!=='student'||callerProfile?.active!==true)return reply({ok:false,error:'Student account required'},403);
  const request=await req.json().catch(()=>({}));
  const scope=request.scope==='school'?'school':'class';const period=request.period==='all'?'all':'weekly';const expanded=request.expanded===true;
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:myMemberships,error:mineError}=await admin.from('student_class_memberships').select('class_id').eq('student_id',user.id).is('ended_at',null);
  if(mineError)return reply({ok:false,error:'Class membership unavailable'},503);
  if(!myMemberships?.length)return reply({ok:true,scope,period,rows:[],me:null,className:null,empty:'You are not assigned to a class yet.'});
  const classIds=[...new Set(myMemberships.map(x=>x.class_id))];
  const [membershipResult,classesResult]=await Promise.all([
   scope==='school'?admin.from('student_class_memberships').select('student_id,class_id').is('ended_at',null):admin.from('student_class_memberships').select('student_id,class_id').is('ended_at',null).in('class_id',classIds),
   admin.from('classes').select('id,class_name,active').in('id',classIds)
  ]);
  if(membershipResult.error||classesResult.error)return reply({ok:false,error:'Class data unavailable'},503);
  const activeMine=classesResult.data?.filter(c=>c.active!==false)||[];
  if(!activeMine.length)return reply({ok:true,scope,period,rows:[],me:null,className:null,empty:'Your class is not currently active.'});
  const activeIds=new Set(activeMine.map(c=>c.id));
  // For students in multiple classes, default to the alphabetically first active class.
  const selected=activeMine.sort((a,b)=>String(a.class_name).localeCompare(String(b.class_name)))[0];
  const relevant=(membershipResult.data||[]).filter(m=>scope==='school'||m.class_id===selected.id);
  const ids=[...new Set(relevant.map(x=>x.student_id))];
  if(ids.length>1000)return reply({ok:false,error:'Leaderboard exceeds supported class size'},503);
  const profiles=await admin.from('profiles').select('id,display_name,role,active').in('id',ids);
  if(profiles.error)return reply({ok:false,error:'Students unavailable'},503);
  const active=(profiles.data||[]).filter(x=>x.role==='student'&&x.active===true);
  const eligible=active.map(x=>x.id);
  if(!eligible.includes(user.id))return reply({ok:false,error:'Class membership unavailable'},403);
  const missions=[];
  // Supabase PostgREST responses cap rows. Fail closed rather than silently rank on truncated records.
  for(let offset=0;offset<=10000;offset+=1000){
   const batch=await admin.from('vocabulary_missions').select('student_id,mission_id,mission_kind,pathway_id,pathway_stage,score,completed_at')
    .in('student_id',eligible).not('completed_at','is',null).order('completed_at',{ascending:true}).order('mission_id',{ascending:true}).range(offset,offset+999);
   if(batch.error)return reply({ok:false,error:'Practice scores unavailable'},503);
   missions.push(...(batch.data||[]));if((batch.data||[]).length<1000)break;
   if(offset===10000)return reply({ok:false,error:'Too many missions to rank safely'},503);
  }
  const earned=scores(missions,eligible);
  const list=active.map(p=>({id:p.id,label:shortName(p.display_name),xp:earned.get(p.id)?.[period]||0}))
   .sort((a,b)=>b.xp-a.xp||a.label.localeCompare(b.label)||a.id.localeCompare(b.id))
   .map((p,index)=>({...p,rank:index+1,isYou:p.id===user.id}));
  const me=list.find(p=>p.isYou)||null;
  const visible=expanded?list.slice(0,100):list.slice(0,7);
  const publicRow=p=>p?{rank:p.rank,name:p.isYou?'You':p.label,xp:p.xp,isYou:p.isYou}:null;
  return reply({ok:true,scope,period,className:scope==='school'?'All classes':selected.class_name,
   count:list.length,rows:visible.map(publicRow),me:publicRow(me),expanded,
   metric:'Completed-mission Practice XP; excludes mastery bonuses, shop credits and purchases'});
 }catch(error){console.error('Practice leaderboard:',error instanceof Error?error.message:'unknown');return reply({ok:false,error:'Leaderboard temporarily unavailable'},503)}
});
