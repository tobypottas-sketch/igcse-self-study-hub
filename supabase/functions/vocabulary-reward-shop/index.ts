// Rewards Shop API (not deployed or enabled).
// Authenticated student requests only. Wallet, prices and transactions are
// controlled by Supabase; browsers cannot write reward tables directly.
// Funding is intentionally absent pending full XP parity and backfill review.
import { createClient } from 'npm:@supabase/supabase-js@2.117.3';

const CORS = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
};
const reply=(body:unknown,status=200)=>Response.json(body,{
  status,headers:{...CORS,'Cache-Control':'no-store'}
});
const unavailable=()=>reply({ok:false,error:'Rewards spending is not enabled yet.'},423);
function safeError(error:unknown) {
  const message=error instanceof Error?error.message:'';
  if (/not available|not enough|not owned|not a student|student account required|wallet not available/i.test(message))
    return message;
  return 'Could not process the reward request.';
}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
  if(req.method!=='POST')return reply({ok:false,error:'Method not allowed'},405);
  try {
    const jwt=req.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
    if(!jwt)return reply({ok:false,error:'Please sign in'},401);
    const url=Deno.env.get('SUPABASE_URL');
    const anonKey=Deno.env.get('SUPABASE_ANON_KEY');
    if(!url||!anonKey)throw new Error('Supabase configuration missing');
    const userClient=createClient(url,anonKey,{
      global:{headers:{Authorization:`Bearer ${jwt}`}},
      auth:{persistSession:false,autoRefreshToken:false}
    });
    const {data:identity,error:identityError}=await userClient.auth.getUser(jwt);
    if(identityError||!identity?.user)return reply({ok:false,error:'Invalid session'},401);
    const userId=identity.user.id;
    const {data:profile,error:profileError}=await userClient.from('profiles')
      .select('role,active').eq('id',userId).single();
    if(profileError||profile?.role!=='student'||profile?.active!==true)
      return reply({ok:false,error:'Student account required'},403);

    const body=await req.json().catch(()=>({}));
    const action=String(body?.action??'status');
    if(action==='status'){
      // Authenticated RLS reads: an individual can inspect only their own wallet
      // and owned cosmetics. A missing wallet means the rollout is not ready.
      const [catalog,wallet,owned]=await Promise.all([
        userClient.from('vocabulary_reward_catalog')
          .select('reward_id,name,category,xp_price,description,icon,enabled').order('xp_price'),
        userClient.from('vocabulary_reward_wallets')
          .select('verified_earned_xp,spent_xp,updated_at').eq('student_id',userId).maybeSingle(),
        userClient.from('vocabulary_reward_owned')
          .select('reward_id,category,acquired_at,equipped').eq('student_id',userId)
      ]);
      if(catalog.error||wallet.error||owned.error)
        return reply({ok:false,error:'Rewards are not yet available'},503);
      const earned=Number(wallet.data?.verified_earned_xp??0);
      const spent=Number(wallet.data?.spent_xp??0);
      return reply({
        ok:true,spendingEnabled:Deno.env.get('VOCAB_REWARDS_ENABLE_PURCHASES')==='true',
        walletReady:Boolean(wallet.data),
        wallet:wallet.data?{lifetimeEarned:earned,spent,available:Math.max(0,earned-spent)}:null,
        rewards:catalog.data??[],owned:owned.data??[]
      });
    }
    if(!['buy','equip'].includes(action))return reply({ok:false,error:'Unknown action'},400);
    // A deploy flag and a separate DB catalogue enabled flag must both be on.
    // No purchase functions are called while wallet XP funding is unverified.
    if(Deno.env.get('VOCAB_REWARDS_ENABLE_PURCHASES')!=='true')return unavailable();
    const rewardId=typeof body?.rewardId==='string'?body.rewardId.trim():'';
    if(!/^[a-z0-9-]{2,50}$/.test(rewardId))return reply({ok:false,error:'Invalid reward'},400);
    const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!serviceKey)throw new Error('Server key unavailable');
    const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
    const rpc=action==='buy'?'redeem_vocabulary_reward':'equip_vocabulary_reward';
    const {data,error}=await admin.rpc(rpc,{p_student_id:userId,p_reward_id:rewardId});
    if(error)return reply({ok:false,error:safeError(new Error(error.message))},400);
    return reply({ok:true,result:data});
  }catch(error){
    console.error('Rewards Shop request failed:',error instanceof Error?error.message:'unknown');
    return reply({ok:false,error:'Rewards service unavailable'},503);
  }
});
