// Client transport: no service credentials. The server must independently authenticate.
export function createActiveLearningTransport({client}) {
 return async (batch,userId)=>{
   const {data:auth,error:authError}=await client.auth.getUser();
   if(authError||auth?.user?.id!==userId)throw Error('Timing identity changed');
   const {data,error}=await client.functions.invoke('active-learning-ingest',{body:{expectedUserId:userId,batch}});
   if(error?.context?.status===422){
     const rejection=await error.context.json().catch(()=>null);
     if(rejection?.batchId===batch.id&&rejection?.code==='invalid_batch'){
       throw Object.assign(Error('Timing batch permanently rejected'),{rejectedBatchId:batch.id});
     }
   }
   if(error||data?.batchId!==batch.id||data?.accepted!==batch.intervals.length||
      !Number.isInteger(data?.inserted)||![0,batch.intervals.length].includes(data.inserted))
     throw Error('Timing save not acknowledged');
   return data;
 };
}
