import {createClient} from 'npm:@supabase/supabase-js@2.117.3';
import {InvalidTimingBatch} from '../_shared/timing-ingestion-contract.js';
import {ingestActiveLearning} from '../_shared/active-learning-ingestion.js';
import {resolveVocabularyTimingContext} from '../_shared/active-learning-vocabulary-resolver.js';
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:CORS});
class PilotAccessDenied extends Error {}
function key(name:string,fallback:string){
 const raw=Deno.env.get(name);
 const value=raw ? JSON.parse(raw).default : Deno.env.get(fallback);
 if(typeof value!=='string'||!value)throw Error('Configuration unavailable');
 return value;
}
async function readBody(req:Request) {
 const limit=131072;
 if(Number(req.headers.get('content-length'))>limit)return null;
 const reader=req.body?.getReader();
 if(!reader)return '';
 const decoder=new TextDecoder('utf-8',{fatal:true});
 let size=0, body='';
 for(;;){
  const {done,value}=await reader.read();
  if(done)return body+decoder.decode();
  size+=value.byteLength;
  if(size>limit){void reader.cancel().catch(()=>{});return null;}
  body+=decoder.decode(value,{stream:true});
 }
}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 const auth=req.headers.get('Authorization');if(!auth?.startsWith('Bearer '))return json({error:'Authentication required'},401);
 // Separate server gate. Never activate before database and browser verification.
 if(Deno.env.get('ACTIVE_LEARNING_V2_ENABLED')!=='true')return json({code:'tracking_disabled',error:'Tracking unavailable'},503);
 let batchId:unknown;
 try{
  const url=Deno.env.get('SUPABASE_URL');if(!url)throw Error('Configuration unavailable');
  const caller=createClient(url,key('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY'),{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await caller.auth.getUser(auth.slice(7));
  if(error&&(!error.status||error.status>=500))return json({error:'Authentication unavailable'},503);
  if(error||!data.user)return json({error:'Invalid session'},401);
  const admin=createClient(url,key('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:profile,error:pe}=await admin.from('profiles').select('id,role,active,must_change_password').eq('id',data.user.id).maybeSingle();
  if(pe)return json({error:'Account lookup unavailable'},503);
  if(profile?.role!=='student'||!profile.active||profile.must_change_password!==false)return json({error:'Student account required'},403);
  let raw;
  try{raw=await readBody(req);}catch{return json({error:'Invalid request body'},400);}
  if(raw===null)return json({error:'Batch too large'},413);
  let body;try{body=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
  batchId=body?.batch?.id;
  if(body?.expectedUserId!==profile.id)return json({error:'Timing identity mismatch'},403);
  const {data:eligible,error:pilotError}=await admin.rpc('active_learning_v2_pilot_enabled',{p_student:profile.id});
  if(pilotError)return json({error:'Pilot configuration unavailable'},503);
  if(eligible!==true)return json({code:'pilot_access_required',error:'Pilot access required'},403);
  const cache=new Map<string,unknown>();
  async function one(table:string,column:string,id:string,fields:string){
   const k=table+':'+id;if(cache.has(k))return cache.get(k);
   const {data,error}=await admin.from(table).select(fields).eq(column,id).maybeSingle();if(error)throw Error('Catalogue unavailable');cache.set(k,data);return data;
  }
  const lookup={
   publishedMember:async(unit:number,pathway:string,occurrence:string)=>{
    const k='set:'+unit+':'+pathway+':'+occurrence;if(cache.has(k))return cache.get(k);
    const {data,error}=await admin.from('vocabulary_set_members').select('occurrence_id').eq('unit_number',unit).eq('pathway_id',pathway).eq('occurrence_id',occurrence).limit(1);
    if(error)throw Error('Catalogue unavailable');const ok=Boolean(data?.length);cache.set(k,ok);return ok;
   },
   occurrence:(id:string)=>one('vocabulary_unit_occurrences','occurrence_id',id,'unit_number,vocabulary_id,sense_id,status,active'),
   item:(id:string)=>one('vocabulary_items','vocabulary_id',id,'status,senses'),
   context:(id:string)=>one('vocabulary_contexts','context_id',id,'status,occurrence_id,sense_id,context_type'),
   activity:(id:string)=>one('vocabulary_unit_activities','activity_content_id',id,'status,unit_number,content_type,activity_data')
  };
  const result=await ingestActiveLearning({request:{json:async()=>body},authenticate:async()=>({id:profile.id,role:profile.role,active:profile.active,mustChangePassword:profile.must_change_password}),resolveContext:(c:any)=>resolveVocabularyTimingContext(c,lookup),persist:async({studentId,batchId,rows}:any)=>{
    const {data,error}=await admin.rpc('persist_active_learning_v2',{p_student:studentId,p_batch:batchId,p_rows:rows});if(error?.code==='22023')throw new InvalidTimingBatch('Batch rejected');
    if(error?.code==='42501')throw new PilotAccessDenied();
    if(error)throw Error('Persistence unavailable');return data;
  }});
  return json(result);
 }catch(error){
  if(error instanceof PilotAccessDenied)return json({code:'pilot_access_required',error:'Pilot access required'},403);
  if(error instanceof InvalidTimingBatch)return json({code:'invalid_batch',batchId},422);
  return json({error:'Learning time temporarily unavailable'},503);
 }
});
