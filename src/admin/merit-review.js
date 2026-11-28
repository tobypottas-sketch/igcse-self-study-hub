async function invokeMeritReview(client, body) {
  const {data,error} = await client.functions.invoke('merit-review',{body});
  if (!error) return data;
  const response = error.context;
  const detail = await response?.json?.().catch(()=>null);
  throw Object.assign(new Error(detail?.error ?? 'Merits could not be updated. Try again.'),{status:response?.status ?? error.status});
}

export function loadMeritReview(client, scope = 'mine') {
  return invokeMeritReview(client,{action:'list',scope});
}

export async function awardReviewedMerit(client, {scope,studentId,number}) {
  const {highestAwarded,recorded,awardedCount} = await invokeMeritReview(client,{action:'award',scope,studentId,number}) ?? {};
  if (!Number.isInteger(highestAwarded) || highestAwarded < number || typeof recorded !== 'boolean' || !Number.isInteger(awardedCount) || awardedCount < 1) {
    throw new Error('The award could not be confirmed. Please retry.');
  }
  return {highestAwarded,recorded,awardedCount};
}

export function reconcileMeritSnapshot(snapshot, studentId, highestAwarded) {
  if (!snapshot) return snapshot;
  const students = snapshot.students.map(student=>{
    if (student.studentId !== studentId) return student;
    const pendingMeritNumbers = (student.pendingMeritNumbers ?? []).filter(number=>number>highestAwarded);
    return {...student,pendingMeritNumbers,pendingMerits:pendingMeritNumbers.length};
  }).filter(student=>student.pendingMerits);
  return {...snapshot,students,pendingMerits:students.reduce((sum,student)=>sum+student.pendingMerits,0)};
}
