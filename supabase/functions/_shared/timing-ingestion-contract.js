// Server-side validation contract. Identity and published context must come
// from trusted adapters, never from the submitted batch.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const modules=new Set(['vocabulary_paraphrase','reading','listening','paraphrasing','essay_writing','email_writing','review_writing']);
const label=x=>typeof x==='string'&&x.length>0&&x.length<=128&&/^[a-zA-Z0-9_.:/-]+$/.test(x);
export class InvalidTimingBatch extends Error {}
export async function validateTimingBatch({batch, expectedUserId, principal, now, resolveContext}) {
  if(!principal||principal.id!==expectedUserId||principal.role!=='student'||principal.active!==true||principal.mustChangePassword!==false)throw Error('Not authorised');
  if(!UUID.test(batch?.id??'')||!Array.isArray(batch.intervals)||batch.intervals.length<1||batch.intervals.length>120||!Number.isSafeInteger(now))throw new InvalidTimingBatch('Invalid batch');
  const rows=[];
  for(const [index,x] of batch.intervals.entries()){
    const a=x?.startMs,b=x?.endMs,c=x?.context;
    if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a<now-86400000||b>now+2000||b<=a||b-a>30000)throw new InvalidTimingBatch('Invalid interval');
    if(!c||!modules.has(c.module)||!label(c.activity)||[c.unit,c.pathway,c.mode,c.occurrence,c.questionType,c.source].some(v=>v!=null&&!(Number.isSafeInteger(v)||label(v))))throw new InvalidTimingBatch('Invalid context');
    if(c.module==='vocabulary_paraphrase'&&(c.unit==null||!c.pathway))throw new InvalidTimingBatch('Missing pathway context');
    const trusted=await resolveContext({module:c.module,activity:c.activity,unit:c.unit??null,pathway:c.pathway??null,mode:c.mode??null,occurrence:c.occurrence??null,questionType:c.questionType??null,source:c.source??null});
    if(!trusted)throw new InvalidTimingBatch('Unpublished or ineligible activity');
    rows.push({student_id:principal.id,batch_id:batch.id,item_index:index,app_key:trusted.module,unit_id:trusted.unit==null?null:String(trusted.unit),pathway_id:trusted.pathway??null,activity_id:trusted.activity,mode:trusted.mode??null,started_at:new Date(a).toISOString(),ended_at:new Date(b).toISOString()});
  }
  return rows;
}
