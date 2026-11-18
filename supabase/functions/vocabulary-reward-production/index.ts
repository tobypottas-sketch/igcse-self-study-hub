// Student Rewards Shop production status API — read-only release gate.
// No wallet funding, purchases, equipment changes or sandbox credit access.
// Production can only be opened after canonical earned-XP reconciliation.
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
  if(action!=='status')return reply({ok:false,error:'Real shop purchases are not released'},403);
  const [wallet,owned,catalog]=await Promise.all([
   client.from('vocabulary_reward_wallets').select('verified_earned_xp,spent_xp')
    .eq('student_id',studentId).maybeSingle(),
   client.from('vocabulary_reward_owned').select('reward_id,category,equipped,acquired_at')
    .eq('student_id',studentId),
   client.from('vocabulary_reward_catalog')
    .select('reward_id,name,category,xp_price,description,icon,enabled').order('xp_price')
  ]);
  if(wallet.error||owned.error||catalog.error)
   return reply({ok:false,error:'Real rewards data unavailable'},503);
  const earned=wallet.data?amount(wallet.data.verified_earned_xp):null;
  const spent=wallet.data?amount(wallet.data.spent_xp):null;
  if(wallet.data&&(earned===null||spent===null||spent>earned))
   return reply({ok:false,error:'Real wallet requires reconciliation'},503);
  return reply({
   ok:true,shopMode:'production',readOnly:true,purchasesEnabled:false,
   walletStatus:wallet.data?'awaiting_reconciliation':'not_initialized',
   wallet:wallet.data?{verifiedEarned:earned,spent,available:earned!-spent!}:null,
   rewards:(catalog.data??[]).map(({enabled,...row})=>({...row,availableForPurchase:enabled===true})),
   owned:owned.data??[],
   note:'Read-only status. Production XP crediting and purchases are not enabled.'
  });
 }catch(error){
  console.error('Production rewards status:',error instanceof Error?error.message:'unknown');
  return reply({ok:false,error:'Production rewards status unavailable'},503);
 }
});
