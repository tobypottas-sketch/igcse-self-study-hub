// Shared reference logic for diagnostic protocol unit tests.
// This is NOT a deployed server and contains no real question bank or keys.
// Only a future authenticated backend may invoke these routines with private items.
export const SESSION_STATES=Object.freeze(['assigned','in_progress','completed','interrupted','expired','void']);
export const SESSION_KIND=Object.freeze(['baseline','follow_up','teacher_retake']);
export const PILOT_SCORE_STATUS='uncalibrated';
export const DEFAULT_FOLLOWUP_DAYS=56;

const transitions=Object.freeze({
  assigned:new Set(['in_progress','expired','void']),
  in_progress:new Set(['interrupted','completed','expired','void']),
  interrupted:new Set(['in_progress','expired','void']),
  completed:new Set(),
  expired:new Set(),
  void:new Set()
});

export function assertDiagnosticTransition(previous,next){
  if(!transitions[previous]||!transitions[previous].has(next)){
    throw new Error('Invalid diagnostic session transition: '+previous+' → '+next);
  }
  return {from:previous,to:next};
}

export function nextDiagnosticDueAt(completedAt,days=DEFAULT_FOLLOWUP_DAYS){
  if(typeof completedAt!=='string'||!Number.isFinite(Date.parse(completedAt)))
    throw new Error('Valid completed diagnostic timestamp required');
  if(!Number.isInteger(days)||days<28||days>365)
    throw new Error('Follow-up interval must be between 28 and 365 days');
  return new Date(Date.parse(completedAt)+days*24*60*60*1000).toISOString();
}

// Future delivery backend must retrieve only the current authorised question
// and call this whitelist on its returned record. Never return the private item.
export function toStudentDiagnosticQuestion(item,{sessionId,position,optionOrder}={}){
  if(!item||!Array.isArray(item.options)||item.options.length!==4)
    throw new Error('Private item must have exactly four options');
  if(typeof sessionId!=='string'||!sessionId.trim())throw new Error('Session identity required');
  if(!Number.isInteger(position)||position<1)throw new Error('Question position must be positive');
  const canonical=['A','B','C','D'];
  if(!Array.isArray(optionOrder)||optionOrder.length!==4||
    new Set(optionOrder).size!==4||optionOrder.some(v=>!canonical.includes(v)))
    throw new Error('Server-chosen option order must be a permutation of A–D');
  const options=optionOrder.map(id=>{
    const option=item.options.find(x=>x.id===id);
    if(!option||typeof option.text!=='string'||!option.text.trim())throw new Error('Invalid private option');
    return {id:option.id,text:option.text};
  });
  if(typeof item.stem!=='string'||!item.stem.trim())throw new Error('Question stem required');
  return {
    sessionId,
    questionId:item.itemId,
    questionVersion:item.version,
    position,
    stem:item.stem,
    options,
    allowUnknown:true
  };
}

// Only one response per question in the pilot. Resubmitted identical requestId
// can be idempotently acknowledged by the backend without scoring it twice.
export function validateDiagnosticResponse(request,{session,question,answeredIds=[],submittedRequestIds=[]}={}){
  if(!session||session.state!=='in_progress')throw new Error('Diagnostic is not in progress');
  if(request?.sessionId!==session.id||request?.questionId!==question?.itemId||
      request?.questionVersion!==question?.version)
    throw new Error('Response does not match the server-held session question');
  if(!Number.isInteger(request?.position)||request.position!==session.nextPosition)
    throw new Error('Response is out of sequence');
  if(typeof request?.requestId!=='string'||!request.requestId.trim())
    throw new Error('Idempotency request ID is required');
  if(submittedRequestIds.includes(request.requestId))
    return {status:'duplicate_request',scoreNow:false};
  if(answeredIds.includes(question.itemId+'@'+question.version))
    throw new Error('This diagnostic question has already been answered');
  const valid=new Set(question.options.map(x=>x.id));
  if(request?.answerId!=='unknown'&&!valid.has(request?.answerId))
    throw new Error('Invalid answer option');
  return {status:'accepted',scoreNow:true,answerId:request.answerId};
}

// A pilot result must not invent a CEFR level. This is a server-side aggregation
// of adjudicated answers only; the client never sends or calculates correctness.
export function summarisePilotDiagnostic({sessionId,adjudicatedResponses}={}){
  if(!sessionId||!Array.isArray(adjudicatedResponses))throw new Error('Completed session evidence required');
  const correct=adjudicatedResponses.filter(x=>x.correct===true).length;
  const unknown=adjudicatedResponses.filter(x=>x.answerId==='unknown').length;
  const total=adjudicatedResponses.length;
  if(adjudicatedResponses.some(x=>typeof x.correct!=='boolean'||!x.levelHypothesis))
    throw new Error('All pilot outcomes must be independently adjudicated');
  const coverage={};
  for(const row of adjudicatedResponses){
    const band=row.levelHypothesis;
    coverage[band]??={administered:0,correct:0,unknown:0};
    coverage[band].administered++;
    if(row.correct)coverage[band].correct++;
    if(row.answerId==='unknown')coverage[band].unknown++;
  }
  return {sessionId,scoreStatus:PILOT_SCORE_STATUS,levelEstimate:null,
    total,correct,incorrect:total-correct-unknown,unknown,coverage};
}

// Only an authenticated backend may decide assignment and access. The UI can
// describe invitations but never issue itself an attempt or reset its deadline.
export function shouldOfferFollowup({baselineCompletedAt,lastCompletedAt,now,intervalDays=DEFAULT_FOLLOWUP_DAYS,hasOpenSession=false,assigned=false}={}){
  if(!assigned||hasOpenSession||!baselineCompletedAt||!lastCompletedAt)return false;
  const due=nextDiagnosticDueAt(lastCompletedAt,intervalDays);
  return Number.isFinite(Date.parse(now))&&Date.parse(now)>=Date.parse(due);
}
