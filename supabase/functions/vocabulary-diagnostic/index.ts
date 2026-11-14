// Pilot diagnostic endpoint. No live student UI calls this function yet.
// This function never returns correct answers, answer rationales or CEFR cut scores.
// Deploy with JWT verification enabled and both Supabase keys stored as server secrets.
import { createClient } from 'npm:@supabase/supabase-js@2.117.3';

const PROJECT_URL=Deno.env.get('SUPABASE_URL')??'';
const ANON_KEY=Deno.env.get('SUPABASE_ANON_KEY')??'';
const SERVICE_KEY=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'';
const ALLOWED_ACTIONS=new Set(['status','start','respond','history','assign','report']);
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
  if(action==='start')return validUuid(payload.assignmentId);
  if(action==='respond')return validUuid(payload.sessionId)
    &&validUuid(payload.requestId)
    &&string(payload.questionId,110)!==null
    &&Number.isInteger(payload.questionVersion)&&payload.questionVersion>0
    &&Number.isInteger(payload.position)&&payload.position>0
    &&['A','B','C','D','unknown'].includes(payload.answerId);
  if(action==='assign')return validUuid(payload.studentId)&&validUuid(payload.formId)
    &&['baseline','follow_up','teacher_retake'].includes(payload.kind)
    &&(payload.availableAt===undefined||!Number.isNaN(Date.parse(payload.availableAt)))
    &&(payload.expiresAt===undefined||!Number.isNaN(Date.parse(payload.expiresAt)));
  if(action==='status'||action==='history'||action==='report')return Object.keys(payload).length===0;
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
    const {data:result,error}=await admin.rpc('vocabulary_diagnostic_api',{
      p_actor:identity.user.id,p_action:action,p_data:payload
    });
    if(error){
      const known=['ACCESS_DENIED','ASSIGNMENT_UNAVAILABLE','SESSION_UNAVAILABLE',
        'SESSION_CLOSED','OUT_OF_SEQUENCE','QUESTION_MISMATCH','INVALID_OPTION',
        'REPLAY_CONFLICT','OPEN_SESSION_EXISTS','FORM_UNAVAILABLE',
        'BASELINE_ALREADY_ASSIGNED','BASELINE_REQUIRED','FOLLOWUP_NOT_DUE',
        'BASELINE_COMPLETE','STUDENT_UNAVAILABLE','UNKNOWN_ACTION',
        'EMPTY_FORM','FORM_INVALID','INVALID_KIND'];
      const code=known.find(x=>error.message?.includes(x));
      if(code)return reply({error:code},['ACCESS_DENIED','SESSION_UNAVAILABLE'].includes(code)?403:409);
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
