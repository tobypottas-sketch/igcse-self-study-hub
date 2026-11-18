// ADMIN-ONLY read-only cohort XP readiness audit. No wallet writes, no funding.
// Uses the exact same XP and mastery engine as the per-student XP audit.
import {createClient} from 'npm:@supabase/supabase-js@2.117.3';
import {computeXp,progressSnapshot} from '../../../src/vocabulary/engagement-model.js';
import {buildUnitPathwayStates} from '../../../src/vocabulary/pathway-view-model.js';
import {clearPathwayCoverage,registerPathwayCoverage} from '../../../src/vocabulary/pathway-coverage-store.js';
import {coverageFromServerSetMembers} from '../_shared/vocabulary-pathway-sets.js';
import {fetchAllRows} from '../../../src/vocabulary/teacher-paging.js';

const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{...cors,'Cache-Control':'no-store'}});
function key(primary:string,fallback:string):string|undefined{
 const direct=Deno.env.get(primary);if(direct)return direct;
 const raw=Deno.env.get(fallback);if(!raw)return undefined;
 try{const value=JSON.parse(raw);return typeof value.default==='string'?value.default:Object.values(value).find((v):v is string=>typeof v==='string')}catch{return undefined}
}
const index=(rows:any[],field:string)=>Object.fromEntries(rows.map(row=>[String(row[field]),row]));
const group=(rows:any[],field:string)=>{
 const buckets=new Map<string,any[]>();
 for(const row of rows){const id=String(row[field]);if(!buckets.has(id))buckets.set(id,[]);buckets.get(id)!.push(row);}
 return buckets;
};
const selectAll=(makeQuery:()=>any,label:string)=>fetchAllRows(makeQuery,{label});
const xp=(missions:any[],snapshot:any,timeZone:string)=>computeXp({missions,snapshot,timeZone} as any).total;

Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return reply({ok:false,error:'Method not allowed'},405);
 try{
  const token=req.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
  const url=Deno.env.get('SUPABASE_URL');
  const anon=key('SUPABASE_ANON_KEY','SUPABASE_PUBLISHABLE_KEYS');
  const secret=key('SUPABASE_SERVICE_ROLE_KEY','SUPABASE_SECRET_KEYS');
  if(!token||!url||!anon||!secret)return reply({ok:false,error:'Authentication unavailable'},401);
  const caller=createClient(url,anon,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData,error:authError}=await caller.auth.getUser(token);
  if(authError||!userData?.user?.id)return reply({ok:false,error:'Invalid session'},401);
  const {data:profile,error:profileError}=await caller.from('profiles').select('role,active').eq('id',userData.user.id).single();
  if(profileError||profile?.role!=='admin'||profile?.active!==true)return reply({ok:false,error:'Admin access required'},403);
  const payload=await req.json().catch(()=>({}));
  const page=payload?.page;
  if(!Number.isInteger(page)||page<0||page>99)return reply({ok:false,error:'Invalid batch page'},400);
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const size=20;
  const profiles=await admin.from('profiles').select('id',{count:'exact'})
    .eq('role','student').eq('active',true).order('id').range(page*size,(page+1)*size-1);
  if(profiles.error)return reply({ok:false,error:'Student list unavailable'},503);
  const ids=(profiles.data||[]).map(row=>row.id);
  if(ids.length===0)return reply({ok:true,auditOnly:true,readyForWalletFunding:false,page,pageSize:size,totalStudents:profiles.count??0,
   examined:0,more:false,summary:{withMissions:0,zeroXp:0,timeZoneSensitive:0,missingWallets:0,walletDiscrepancies:0,earnedXpSum:0}});
  const [occurrences,members,global,unit,missions,wallets]=await Promise.all([
   selectAll(()=>admin.from('vocabulary_unit_occurrences').select('occurrence_id,vocabulary_id,unit_number,unit_title,set_number,position_in_unit,sense_id,status',{count:'exact'}).eq('status','live').eq('active',true).order('unit_number').order('position_in_unit').order('occurrence_id'),'live occurrences'),
   selectAll(()=>admin.from('vocabulary_set_members').select('unit_number,pathway_id,set_number,position,occurrence_id',{count:'exact'}).order('unit_number').order('pathway_id').order('set_number').order('position'),'set members'),
   selectAll(()=>admin.from('vocabulary_global_mastery').select('student_id,vocabulary_id,status,review_due_at,recent_error_pattern,strand_evidence',{count:'exact'}).in('student_id',ids).order('student_id').order('vocabulary_id'),'global mastery'),
   selectAll(()=>admin.from('vocabulary_unit_mastery').select('student_id,occurrence_id,status,recent_error_pattern,contextual_evidence',{count:'exact'}).in('student_id',ids).order('student_id').order('occurrence_id'),'unit mastery'),
   selectAll(()=>admin.from('vocabulary_missions').select('student_id,mission_id,unit_number,mission_kind,pathway_id,pathway_stage,practice_family,mission_size,score,stars,best_streak,completed_at',{count:'exact'}).in('student_id',ids).order('student_id').order('completed_at').order('mission_id'),'missions'),
   selectAll(()=>admin.from('vocabulary_reward_wallets').select('student_id,verified_earned_xp,spent_xp',{count:'exact'}).in('student_id',ids).order('student_id'),'wallets')
  ]);
  const byGlobal=group(global,'student_id'),byUnit=group(unit,'student_id'),byMission=group(missions,'student_id');
  const byWallet=index(wallets,'student_id'),units=group(occurrences,'unit_number');
  const memberByUnit=group(members,'unit_number');
  const summary={withMissions:0,zeroXp:0,timeZoneSensitive:0,missingWallets:0,walletDiscrepancies:0,earnedXpSum:0};
  for(const id of ids){
   // Rebuild canonical coverage independently, with no shared state between students.
   clearPathwayCoverage();
   const masterUnit=index(byUnit.get(id)||[],'occurrence_id');
   const masterGlobal=index(byGlobal.get(id)||[],'vocabulary_id');
   for(const [number,rows] of units){
    const states=buildUnitPathwayStates({occurrences:rows,unitMastery:masterUnit,globalMastery:masterGlobal,coverageByPathway:{}} as any);
    if(!Object.values(states).every((state:any)=>state?.mastered===true))continue;
    registerPathwayCoverage(Number(number),coverageFromServerSetMembers(memberByUnit.get(number)||[],rows));
   }
   const snapshot=progressSnapshot({occurrences,unitMastery:masterUnit,globalMastery:masterGlobal} as any);
   const studentMissions=byMission.get(id)||[];
   if(studentMissions.length)summary.withMissions++;
   const china=xp(studentMissions,snapshot,'Asia/Shanghai');
   const utc=xp(studentMissions,snapshot,'UTC');
   if(china!==utc)summary.timeZoneSensitive++;
   if(china===0)summary.zeroXp++;
   summary.earnedXpSum+=china;
   const wallet=byWallet[id];
   if(!wallet)summary.missingWallets++;
   else if(!Number.isSafeInteger(Number(wallet.verified_earned_xp))||Number(wallet.verified_earned_xp)!==china||
     Number(wallet.spent_xp)>china)summary.walletDiscrepancies++;
  }
  clearPathwayCoverage();
  return reply({ok:true,auditOnly:true,readyForWalletFunding:false,page,pageSize:size,totalStudents:profiles.count??0,
   examined:ids.length,more:(page+1)*size<(profiles.count??0),calendarTimezone:'Asia/Shanghai',summary,
   note:'Aggregated server XP only. Never authorizes or performs wallet crediting.'});
 }catch(error){console.error('Admin cohort XP audit:',error instanceof Error?error.message:'unknown');
  return reply({ok:false,error:'Cohort XP audit unavailable'},503)}
});
