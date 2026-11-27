import {createClient} from 'npm:@supabase/supabase-js@2.117.3';
import {ingestActiveLearning} from '../_shared/active-learning-ingestion.js';
import {resolveVocabularyTimingContext} from '../_shared/active-learning-vocabulary-resolver.js';
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:CORS});
function key(name:string){const raw=Deno.env.get(name);if(!raw)throw Error('Configuration unavailable');const obj=JSON.parse(raw);const value=obj.default??Object.values(obj)[0];if(typeof value!=='string'||!value)throw Error('Configuration unavailable');return value;}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 const auth=req.headers.get('Authorization');if(!auth)return json({error:'Authentication required'},401);
 // Separate server gate. Never activate before database and browser verification.
 if(Deno.env.get('ACTIVE_LEARNING_V2_ENABLED')!=='true')return json({error:'Tracking unavailable'},503);
 try{
  const url=Deno.env.get('SUPABASE_URL');if(!url)throw Error('Configuration unavailable');
  const caller=createClient(url,key('SUPABASE_PUBLISHABLE_KEYS'),{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await caller.auth.getUser();if(error||!data.user)return json({error:'Invalid session'},401);
  const admin=createClient(url,key('SUPABASE_SECRET_KEYS'),{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:profile,error:pe}=await admin.from('profiles').select('id,role,active,must_change_password').eq('id',data.user.id).single();
  if(pe||profile?.role!=='student'||!profile.active||profile.must_change_password!==false)return json({error:'Student account required'},403);
  const raw=await req.text();if(raw.length>131072)return json({error:'Batch too large'},413);
  let body;try{body=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
  const cache=new Map<string,unknown>();
  async function one(table:string,column:string,id:string,fields:string){
   const k=table+':'+id;if(cache.has(k))return cache.get(k);
   const {data,error}=await admin.from(table).select(fields).eq(column,id).maybeSingle();if(error)throw Error('Catalogue unavailable');cache.set(k,data);return data;
  }
  const lookup={
   occurrence:(id:string)=>one('vocabulary_unit_occurrences','occurrence_id',id,'unit_number,vocabulary_id,sense_id,status,active'),
   item:(id:string)=>one('vocabulary_items','vocabulary_id',id,'status,senses'),
   context:(id:string)=>one('vocabulary_contexts','context_id',id,'status,occurrence_id,sense_id,context_type'),
   activity:(id:string)=>one('vocabulary_unit_activities','activity_content_id',id,'status,unit_number,content_type,activity_data')
  };
  const result=await ingestActiveLearning({request:{json:async()=>body},authenticate:async()=>({id:profile.id,role:profile.role,active:profile.active,mustChangePassword:profile.must_change_password}),resolveContext:(c:any)=>resolveVocabularyTimingContext(c,lookup),persist:async({studentId,batchId,rows}:any)=>{
    const {data,error}=await admin.rpc('persist_active_learning_v2',{p_student:studentId,p_batch:batchId,p_rows:rows});if(error)throw Error('Persistence unavailable');return data;
  }});
  return json(result);
 }catch{return json({error:'Learning time not accepted'},422);}
});
