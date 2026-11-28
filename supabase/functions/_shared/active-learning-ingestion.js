// Server-only orchestration contract. Inject trusted authentication, catalogue,
// and service-role persistence adapters. Never bundle credentials in a client.
import {validateTimingBatch} from './timing-ingestion-contract.js';
export async function ingestActiveLearning({request, authenticate, resolveContext, persist, now=Date.now}) {
  const principal=await authenticate(request);
  if(!principal || principal.role!=='student' || principal.active!==true || principal.mustChangePassword!==false) throw Error('Not authorised');
  const body=await request.json();
  const rows=await validateTimingBatch({batch:body.batch,expectedUserId:body.expectedUserId,principal,now:now(),resolveContext});
  // The database uses its own clock and membership history; browser class IDs
  // are never passed through. Persistence must be atomic, including the manifest.
  const inserted=await persist({studentId:principal.id,batchId:body.batch.id,rows});
  if(!Number.isInteger(inserted)||(inserted!==0&&inserted!==rows.length))throw Error('Invalid persistence acknowledgement');
  return {batchId:body.batch.id,accepted:rows.length,inserted};
}
