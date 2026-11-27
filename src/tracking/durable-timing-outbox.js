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
      const batch={id:id(),createdAt:now(),intervals:intervals.map(x=>({startMs:x.startMs,endMs:x.endMs,context:{module:x.context.module,unit:x.context.unit??null,pathway:x.context.pathway??null,activity:x.context.activity,mode:x.context.mode??null}}))};
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
          const batch=JSON.parse(raw);
          if(batch.id!==key.slice(prefix.length))throw Error('Invalid batch identity');
          if(now()-batch.createdAt>maxAgeMs){storage.removeItem(key);continue;}
          // Transport must bind the request to this authenticated student, and reject
          // any mismatch. Server must acknowledge duplicate IDs as success.
          await send(batch,userId);
          guard();
          storage.removeItem(key);
        }
      }).finally(()=>{running=null;});
      return running;
    }
  };
}
