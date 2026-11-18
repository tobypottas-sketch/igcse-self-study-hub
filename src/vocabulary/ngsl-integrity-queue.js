// NGSL integrity telemetry: small session-scoped queue, no questions/answers.
// Browser-reported focus signals are advisory and never affect assessment grades.
const TYPES=new Set(['tab_hidden','window_blur','fullscreen_exit','focus_return']);
const UUID=/^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
export function createIntegrityQueue({sessionId,send,storage,onStatus=()=>{},online=()=>true}){
 if(!UUID.test(sessionId)||typeof send!=='function')throw Error('Invalid integrity session');
 const key='ngsl-integrity-'+sessionId;
 const valid=x=>x&&x.sessionId===sessionId&&UUID.test(x.eventId)&&TYPES.has(x.type)
  &&Number.isInteger(x.position)&&x.position>=1&&x.position<=50;
 let pending=[];
 try{const raw=JSON.parse(storage?.getItem(key)??'[]');if(Array.isArray(raw))pending=raw.filter(valid).slice(-80)}catch{}
 let busy=false,disposed=false;
 function status(){onStatus(pending.length,busy)}
 function persist(){
  try{if(pending.length)storage?.setItem(key,JSON.stringify(pending));else storage?.removeItem(key)}catch{}
  status();
 }
 function enqueue(type,position){
  if(!TYPES.has(type)||!Number.isInteger(position)||position<1||position>50||disposed)return;
  const item={sessionId,eventId:crypto.randomUUID(),type,position};
  // Bounded storage prevents an accidental unbounded queue on offline devices.
  pending.push(item);if(pending.length>80)pending=pending.slice(-80);
  persist();return item;
 }
 async function flush(){
  if(busy||!online()||pending.length===0)return false;
  busy=true;status();
  try{
   while(pending.length&&online()){
    const item=pending[0];
    try{
     const result=await send(item);
     if(!result||result.ok!==true)break;
    }catch{break}
    pending.shift();persist();
   }
  }finally{busy=false;persist()}
  return pending.length===0;
 }
 function dispose(){disposed=true;persist()}
 status();
 return {enqueue,flush,dispose,get pendingCount(){return pending.length}};
}
