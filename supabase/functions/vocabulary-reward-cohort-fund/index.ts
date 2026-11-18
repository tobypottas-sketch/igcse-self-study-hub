// ADMIN-ONLY real wallet initialization, bound to a completed cohort audit.
// XP is recomputed from server data and credited through the idempotent locked RPC.
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
const xp=(missions:any[],snapshot:any,timeZone:string)=>computeXp({missions,snapshot,timeZone} as any);

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
  const action=payload?.action;
  if(action!=='initialize')return reply({ok:false,error:'Unsupported action'},400);
  const expected=payload?.expected;
  if(!expected||!Number.isSafeInteger(expected.totalStudents)||!Number.isSafeInteger(expected.examined)||!Number.isSafeInteger(expected.earnedXpSum)||!expected.components)return reply({ok:false,error:'A complete cohort audit is required'},400);
  if(!Number.isInteger(page)||page<0||page>99)return reply({ok:false,error:'Invalid batch page'},400);
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const size=20;
  const fundPlans:{studentId:string;earnedXp:number}[]=[];
  const profiles=await admin.from('profiles').select('id',{count:'exact'})
    .eq('role','student').eq('active',true).order('id').range(page*size,(page+1)*size-1);
  if(profiles.error)return reply({ok:false,error:'Student list unavailable'},503);
  const ids=(profiles.data||[]).map(row=>row.id);
  if(ids.length===0)return reply({ok:false,error:'Cohort batch no longer exists; rerun audit'},409);
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
  const summary={withMissions:0,zeroXp:0,timeZoneSensitive:0,missingWallets:0,walletDiscrepancies:0,earnedXpSum:0,withoutMissionsWithXp:0,masteryWithoutMissions:0,components:{missions:0,personalBests:0,weeklyGoals:0,achievements:0,stageClears:0,pathwayMasteries:0,unitMasteries:0}};
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
   else if((byGlobal.get(id)||[]).length||(byUnit.get(id)||[]).length)summary.masteryWithoutMissions++;
   const chinaResult=xp(studentMissions,snapshot,'Asia/Shanghai');
   const utcResult=xp(studentMissions,snapshot,'UTC');
   const china=chinaResult.total;
   if(china!==utcResult.total || Object.keys(chinaResult.parts).some(key=>chinaResult.parts[key]!==utcResult.parts[key]))summary.timeZoneSensitive++;
   if(china===0)summary.zeroXp++;
   if(!studentMissions.length && china>0)summary.withoutMissionsWithXp++;
   for(const key of Object.keys(summary.components) as (keyof typeof summary.components)[])summary.components[key]+=chinaResult.parts[key];
   summary.earnedXpSum+=china;
   if(!Number.isSafeInteger(china)||china<0)throw new Error('Invalid verified XP');
   fundPlans.push({studentId:id,earnedXp:china});
   const wallet=byWallet[id];
   if(!wallet)summary.missingWallets++;
   else if(!Number.isSafeInteger(Number(wallet.verified_earned_xp))||Number(wallet.verified_earned_xp)!==china||
     Number(wallet.spent_xp)>china)summary.walletDiscrepancies++;
  }
  clearPathwayCoverage();
  if(Object.values(summary.components).reduce((a,b)=>a+b,0)!==summary.earnedXpSum)throw new Error('XP breakdown does not reconcile to lifetime total');
  const snapshotMatches=expected.totalStudents===profiles.count &&
    expected.examined===ids.length && expected.earnedXpSum===summary.earnedXpSum &&
    Object.keys(summary.components).every(key=>Number.isSafeInteger(expected.components[key])&&expected.components[key]===summary.components[key]);
  if(!snapshotMatches)return reply({ok:false,error:'XP audit changed. Run the full read-only audit again before funding.'},409);
  // All 20 calculations have been verified before the first wallet is touched.
  // A partially completed batch can be retried: the RPC is an absolute total,
  // not an additive XP grant, and locks the wallet row.
  let synchronised=0;
  for(const plan of fundPlans){
    const {data:wallet,error:fundError}=await admin.rpc('sync_verified_vocabulary_reward_wallet',{
      p_student_id:plan.studentId,p_verified_earned_xp:plan.earnedXp
    });
    if(fundError||Number(wallet?.verifiedEarned)!==plan.earnedXp)
      return reply({ok:false,error:'One wallet could not be verified. Retry after checking the cohort audit.',synchronised},503);
    synchronised++;
  }
  return reply({ok:true,initialized:true,readOnly:false,page,examined:ids.length,
    synchronised,verifiedEarned:summary.earnedXpSum,
    note:'Verified XP funded using canonical server calculation. Shop purchases remain disabled.'});

 }catch(error){console.error('Admin wallet initialization:',error instanceof Error?error.message:'unknown');
  return reply({ok:false,error:'Wallet initialization unavailable'},503)}
});
