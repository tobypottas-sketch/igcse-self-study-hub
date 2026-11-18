// Authenticated production Rewards Shop. Atomic purchase/equip RPCs enforce
// balances and ownership; purchases never mutate genuine learning XP.
import {createClient} from 'npm:@supabase/supabase-js@2.117.3';

const cors={
 'Access-Control-Allow-Origin':'*',
 'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
 'Access-Control-Allow-Methods':'POST, OPTIONS'
};
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{...cors,'Cache-Control':'no-store'}});
function configuredKey(primary:string,fallback:string):string|undefined{
 const direct=Deno.env.get(primary);
 if(direct)return direct;
 const raw=Deno.env.get(fallback);
 if(!raw)return undefined;
 try{
  const value=JSON.parse(raw);
  return typeof value.default==='string'?value.default:Object.values(value).find((v):v is string=>typeof v==='string');
 }catch{return undefined}
}
const amount=(value:unknown):number|null=>{
 const number=Number(value);
 return Number.isSafeInteger(number)&&number>=0?number:null;
};
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return reply({ok:false,error:'Method not allowed'},405);
 try{
  const token=req.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
  const url=Deno.env.get('SUPABASE_URL');
  const key=configuredKey('SUPABASE_ANON_KEY','SUPABASE_PUBLISHABLE_KEYS');
  if(!token||!url||!key)return reply({ok:false,error:'Authentication unavailable'},401);
  const client=createClient(url,key,{global:{headers:{Authorization:'Bearer '+token}},
   auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userData,error:userError}=await client.auth.getUser(token);
  if(userError||!userData?.user?.id)return reply({ok:false,error:'Invalid session'},401);
  const studentId=userData.user.id;
  const {data:profile,error:profileError}=await client.from('profiles')
   .select('role,active').eq('id',studentId).single();
  if(profileError||profile?.role!=='student'||profile?.active!==true)
   return reply({ok:false,error:'Active student account required'},403);
  const body=await req.json().catch(()=>({}));
  const action=String(body?.action??'status');
  if(!['status','buy','equip'].includes(action))return reply({ok:false,error:'Unsupported action'},400);
  if(action==='buy'||action==='equip'){
   const rewardId=typeof body.rewardId==='string'?body.rewardId:'';
   if(!/^[a-z0-9-]{2,50}$/.test(rewardId))return reply({ok:false,error:'Invalid reward'},400);
   const serviceKey=configuredKey('SUPABASE_SERVICE_ROLE_KEY','SUPABASE_SECRET_KEYS');
   if(!serviceKey)return reply({ok:false,error:'Shop unavailable'},503);
   // The catalogue is the explicit server-side release switch.
   const {data:listed,error:listedError}=await client.from('vocabulary_reward_catalog')
     .select('reward_id,enabled').eq('reward_id',rewardId).maybeSingle();
   if(listedError||!listed||listed.enabled!==true)
     return reply({ok:false,error:'Reward not available'},403);
   const service=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
   const method=action==='buy'?'redeem_vocabulary_reward':'equip_vocabulary_reward';
   const {error:mutationError}=await service.rpc(method,{p_student_id:studentId,p_reward_id:rewardId});
   if(mutationError){
    const display=/not enough|insufficient|not owned|not available|already owned|wallet not available/i.test(mutationError.message)
      ?mutationError.message:'Unable to complete reward action';
    return reply({ok:false,error:display},400);
   }
  }
  const [wallet,owned,catalog]=await Promise.all([
   client.from('vocabulary_reward_wallets').select('verified_earned_xp,spent_xp')
    .eq('student_id',studentId).maybeSingle(),
   client.from('vocabulary_reward_owned').select('reward_id,category,equipped,acquired_at')
    .eq('student_id',studentId),
   client.from('vocabulary_reward_catalog')
    .select('reward_id,name,category,xp_price,description,icon,enabled').eq('enabled',true).order('xp_price')
  ]);
  if(wallet.error||owned.error||catalog.error)
   return reply({ok:false,error:'Real rewards data unavailable'},503);
  const earned=wallet.data?amount(wallet.data.verified_earned_xp):null;
  const spent=wallet.data?amount(wallet.data.spent_xp):null;
  if(wallet.data&&(earned===null||spent===null||spent>earned))
   return reply({ok:false,error:'Real wallet requires reconciliation'},503);
  return reply({
   ok:true,shopMode:'production',readOnly:false,purchasesEnabled:true,
   walletStatus:wallet.data?'ready':'not_initialized',
   wallet:wallet.data?{verifiedEarned:earned,spent,available:earned!-spent!}:null,
   rewards:(catalog.data??[]).map(({enabled,...row})=>row),
   owned:owned.data??[],
   note:'Verified XP wallet. Purchases reduce shop balance, not learning XP.'
  });
 }catch(error){
  console.error('Production rewards status:',error instanceof Error?error.message:'unknown');
  return reply({ok:false,error:'Production rewards status unavailable'},503);
 }
});
