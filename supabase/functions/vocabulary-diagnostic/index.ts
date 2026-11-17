// Single NGSL 50-question baseline. Legacy CEFR assessment actions are retired.
// Answer keys and frequency ranks stay on the trusted database server.
// Deploy with JWT verification enabled and both Supabase keys stored as server secrets.
import { createClient } from 'npm:@supabase/supabase-js@2.117.3';

const PROJECT_URL=Deno.env.get('SUPABASE_URL')??'';
// Support both legacy and current Supabase managed key environments.
// Never return secret keys in responses or write them to logs.
function firstNamedKey(raw:string|undefined):string {
  if(!raw)return '';
  try{
    const keys=JSON.parse(raw);
    const first=keys?.default??Object.values(keys??{})[0];
    return typeof first==='string'?first:'';
  }catch{return ''}
}
const ANON_KEY=Deno.env.get('SUPABASE_ANON_KEY')||firstNamedKey(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'));
const SERVICE_KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||firstNamedKey(Deno.env.get('SUPABASE_SECRET_KEYS'));
const ALLOWED_ACTIONS=new Set(['ngsl-form-preview','ngsl-status','ngsl-start','ngsl-respond','ngsl-pause','ngsl-history','ngsl-teacher-report']);
const MAX_BODY_BYTES=4000;

function headers(){
  return {
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods':'POST,OPTIONS',
    'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info',
    'Vary':'Authorization'
  };
}
function reply(body,status=200){return new Response(JSON.stringify(body),{status,headers:headers()});}
function string(value,max=128){return typeof value==='string'&&value.length<=max?value:null;}
function validUuid(value){return typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);}
function validatePayload(action,payload){
  if(!payload||typeof payload!=='object'||Array.isArray(payload))return false;
  if(['ngsl-status','ngsl-start','ngsl-history','ngsl-teacher-report'].includes(action))return Object.keys(payload).length===0;
  if(action==='ngsl-pause')return validUuid(payload.sessionId);
  if(action==='ngsl-respond')return validUuid(payload.sessionId)&&validUuid(payload.requestId)
    &&typeof payload.questionId==='string'&&/^NGSL-\\d{1,2}$/.test(payload.questionId)
    &&Number.isInteger(payload.position)&&payload.position>=1&&payload.position<=50
    &&['A','B','C','D'].includes(payload.answerId);
  if(action==='ngsl-form-preview')return Object.keys(payload).length===1&&payload.form==='A';
  return false;
}

Deno.serve(async (req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:headers()});
  if(req.method!=='POST')return reply({error:'METHOD_NOT_ALLOWED'},405);
  const authHeader=req.headers.get('authorization')??'';
  const match=/^Bearer\s+(\S+)$/i.exec(authHeader);
  if(!match)return reply({error:'AUTH_REQUIRED'},401);
  if(!PROJECT_URL||!ANON_KEY||!SERVICE_KEY)return reply({error:'SERVICE_UNAVAILABLE'},503);

  let raw='';
  try {
    const reader=req.body?.getReader();
    if(!reader)return reply({error:'BAD_REQUEST'},400);
    const decoder=new TextDecoder();
    let bytes=0;
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      bytes+=value.length;
      if(bytes>MAX_BODY_BYTES){await reader.cancel();return reply({error:'PAYLOAD_TOO_LARGE'},413);}
      raw+=decoder.decode(value,{stream:true});
    }
    raw+=decoder.decode();
  }catch{return reply({error:'BAD_REQUEST'},400);}

  let data:unknown;
  try{data=JSON.parse(raw);}catch{return reply({error:'INVALID_JSON'},400);}
  if(!data||typeof data!=='object'||Array.isArray(data))return reply({error:'BAD_REQUEST'},400);
  const request=data as Record<string,unknown>;
  const action=request.action;
  const payload=request.payload??{};
  if(typeof action!=='string'||!ALLOWED_ACTIONS.has(action)||!validatePayload(action,payload))
    return reply({error:'INVALID_REQUEST'},400);

  try {
    // Identity is server-validated; p_actor NEVER comes from request JSON.
    const userClient=createClient(PROJECT_URL,ANON_KEY,{
      auth:{persistSession:false,autoRefreshToken:false}
    });
    const {data:identity,error:authError}=await userClient.auth.getUser(match[1]);
    if(authError||!identity?.user?.id)return reply({error:'AUTH_REQUIRED'},401);

    // Only the trusted Edge Function uses the service key.
    // Database RPC checks role/class ownership and commits each answer atomically.
    const admin=createClient(PROJECT_URL,SERVICE_KEY,{
      auth:{persistSession:false,autoRefreshToken:false}
    });
    const isPreviewRequest=action==='ngsl-form-preview';
    const rpc=isPreviewRequest?'vocabulary_ngsl_teacher_form_preview':'vocabulary_ngsl_api';
    const args=isPreviewRequest
      ?{p_actor:identity.user.id,p_form:'A'}
      :{p_actor:identity.user.id,p_action:action.slice('ngsl-'.length),p_data:payload};
    const {data:result,error}=await admin.rpc(rpc,args);
    if(error){
      const known=['ACCESS_DENIED','SESSION_UNAVAILABLE','SESSION_CLOSED',
        'OUT_OF_SEQUENCE','QUESTION_MISMATCH','INVALID_OPTION','REPLAY_CONFLICT',
        'FORM_INVALID','REVIEW_ACCESS_DENIED','INVALID_FORM','UNKNOWN_ACTION'];
      const code=known.find(x=>error.message?.includes(x));
      if(code)return reply({error:code},['ACCESS_DENIED','SESSION_UNAVAILABLE','REVIEW_ACCESS_DENIED'].includes(code)?403:409);
      // Do not print question bank, SQL query strings, UUIDs or submitted payloads.
      console.error('Diagnostic RPC failed:',error.code??'unclassified');
      return reply({error:'SERVICE_ERROR'},500);
    }
    return reply(result);
  }catch{
    console.error('Diagnostic endpoint request failed');
    return reply({error:'SERVICE_ERROR'},500);
  }
});
