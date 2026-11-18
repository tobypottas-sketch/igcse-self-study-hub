// Isolated test shop: no access to real XP wallets or student purchases.
// Only pre-enabled sandbox accounts can see prices, purchase or equip.
import { createClient } from 'npm:@supabase/supabase-js@2.117.3';

const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
};
const respond=(data:unknown,status=200)=>Response.json(data,{
  status,headers:{...cors,'Cache-Control':'no-store'}
});
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(req.method!=='POST')return respond({ok:false,error:'Method not allowed'},405);
  try{
    const token=req.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
    const url=Deno.env.get('SUPABASE_URL');
    const anonKey=Deno.env.get('SUPABASE_ANON_KEY');
    if(!token||!url||!anonKey)return respond({ok:false,error:'Authentication unavailable'},401);
    const client=createClient(url,anonKey,{global:{headers:{Authorization:`Bearer ${token}`}},
      auth:{persistSession:false,autoRefreshToken:false}});
    const {data:userData,error:userError}=await client.auth.getUser(token);
    if(userError||!userData?.user?.id)return respond({ok:false,error:'Invalid session'},401);
    const studentId=userData.user.id;
    const {data:profile,error:profileError}=await client.from('profiles')
      .select('role,active').eq('id',studentId).single();
    if(profileError||profile?.role!=='student'||profile?.active!==true)
      return respond({ok:false,error:'Student account required'},403);

    const {data:wallet,error:walletError}=await client.from('vocabulary_reward_sandbox_wallets')
      .select('granted_xp,spent_xp,enabled').eq('student_id',studentId).maybeSingle();
    if(walletError)return respond({ok:false,error:'Sandbox unavailable'},503);
    if(!wallet?.enabled)return respond({ok:true,sandboxEnabled:false});

    const body=await req.json().catch(()=>({}));
    const action=String(body?.action??'status');
    if(!['status','buy','equip'].includes(action))return respond({ok:false,error:'Unknown action'},400);
    if(action==='buy'||action==='equip'){
      const rewardId=typeof body?.rewardId==='string'?body.rewardId:'';
      if(!/^[a-z0-9-]{2,50}$/.test(rewardId))
        return respond({ok:false,error:'Invalid reward'},400);
      const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if(!key)throw new Error('Missing server configuration');
      const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
      const functionName=action==='buy'?'redeem_vocabulary_sandbox_reward':'equip_vocabulary_sandbox_reward';
      const {error}=await admin.rpc(functionName,{p_student_id:studentId,p_reward_id:rewardId});
      if(error){
        const message=/not enough|insufficient|not owned|unavailable|already owned/i.test(error.message)
          ?error.message:'Unable to process sandbox reward';
        return respond({ok:false,error:message},400);
      }
    }
    const [balance,items,owned]=await Promise.all([
      client.from('vocabulary_reward_sandbox_wallets').select('granted_xp,spent_xp')
        .eq('student_id',studentId).single(),
      client.from('vocabulary_reward_catalog')
        .select('reward_id,name,category,xp_price,description,icon').order('xp_price'),
      client.from('vocabulary_reward_sandbox_owned')
        .select('reward_id,category,price_paid,equipped,acquired_at')
        .eq('student_id',studentId)
    ]);
    if(balance.error||items.error||owned.error)
      return respond({ok:false,error:'Sandbox data unavailable'},503);
    const granted=Number(balance.data.granted_xp),spent=Number(balance.data.spent_xp);
    return respond({ok:true,sandboxEnabled:true,shopMode:'sandbox',
      wallet:{granted,spent,available:Math.max(0,granted-spent)},
      rewards:items.data??[],owned:owned.data??[]});
  }catch(error){
    console.error('Sandbox shop error:',error instanceof Error?error.message:'unknown');
    return respond({ok:false,error:'Sandbox service unavailable'},503);
  }
});
