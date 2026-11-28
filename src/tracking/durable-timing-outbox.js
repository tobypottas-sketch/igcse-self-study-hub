// User-scoped durable queue. One key per batch avoids lost updates between tabs.
// No input content, tokens, names or responses are stored.
export function createDurableTimingOutbox({storage, userId, currentUserId, send, id, now=Date.now, maxAgeMs=86400000}) {
  if (!userId || typeof currentUserId !== 'function') throw Error('Identity required');
  const prefix='hub-active-v2:'+encodeURIComponent(userId)+':';
  let running=null;
  function guard() { if(currentUserId()!==userId) throw Error('Identity changed'); }
  function entries() {
    const keys=[];
    for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key?.startsWith(prefix))keys.push(key);}
    return keys.sort();
  }
  return {
    enqueue(intervals) {
      guard();
      if(!intervals.length)return;
      if(intervals.length>120)throw Error('Batch exceeds maximum size');
      const batch={id:id(),createdAt:now(),intervals:intervals.map(x=>({startMs:x.startMs,endMs:x.endMs,context:{module:x.context.module,unit:x.context.unit??null,pathway:x.context.pathway??null,activity:x.context.activity,mode:x.context.mode??null,occurrence:x.context.occurrence??null,questionType:x.context.questionType??null,source:x.context.source??null}}))};
      storage.setItem(prefix+batch.id,JSON.stringify(batch));
      return batch.id;
    },
    flush() {
      if(running)return running;
      running=Promise.resolve().then(async()=>{
        guard();
        for(const key of entries()){
          guard();
          const raw=storage.getItem(key);
          if(raw===null)continue;
          let batch;
          try { batch=JSON.parse(raw); } catch { storage.removeItem(key); continue; }
          const cutoff=now()-maxAgeMs;
          if(batch?.id!==key.slice(prefix.length)||!Number.isSafeInteger(batch.createdAt)||
             !Array.isArray(batch.intervals)||batch.intervals.length<1||batch.intervals.length>120||
             batch.intervals.some(interval=>!Number.isSafeInteger(interval?.startMs)||interval.startMs<cutoff||
               !Number.isSafeInteger(interval.endMs)||interval.endMs<=interval.startMs||!interval.context)){
            storage.removeItem(key);
            continue;
          }
          try {
            await send(batch,userId);
          } catch (error) {
            // Only a definitive rejection of this exact batch permits deletion.
            if(error?.rejectedBatchId!==batch.id)throw error;
          }
          guard();
          storage.removeItem(key);
        }
      }).finally(()=>{running=null;});
      return running;
    }
  };
}
