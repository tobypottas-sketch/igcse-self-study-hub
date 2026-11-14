// Initial vocabulary diagnostic onboarding contract.
// Rollout is deliberately OFF until a verified diagnostic, approved form,
// student assessment UI, and server-side practice enforcement exist.
export const DIAGNOSTIC_BASELINE_GATE_ENABLED=false;

export const DIAGNOSTIC_ENTRY_STATES=Object.freeze({
  PRACTICE:'practice',
  BASELINE_REQUIRED:'baseline_required',
  BASELINE_IN_PROGRESS:'baseline_in_progress',
  BASELINE_UNAVAILABLE:'baseline_unavailable',
  STATUS_ERROR:'status_error'
});

// A baseline is complete only when there is a completed, server-recorded
// baseline result. Do not infer it from mastery, activity count, CEFR tags,
// assignment availability, or a client-set boolean.
export function decideVocabularyEntry({
  enabled=DIAGNOSTIC_BASELINE_GATE_ENABLED,
  baselineCompleted=false,
  baselineSessionState=null,
  baselineAssignmentId=null,
  statusAvailable=true,
  student=true
}={}){
  if(!enabled||!student)return DIAGNOSTIC_ENTRY_STATES.PRACTICE;
  if(!statusAvailable)return DIAGNOSTIC_ENTRY_STATES.STATUS_ERROR;
  if(baselineCompleted)return DIAGNOSTIC_ENTRY_STATES.PRACTICE;
  if(['in_progress','interrupted'].includes(baselineSessionState))
    return DIAGNOSTIC_ENTRY_STATES.BASELINE_IN_PROGRESS;
  if(typeof baselineAssignmentId==='string'&&baselineAssignmentId.length>0)
    return DIAGNOSTIC_ENTRY_STATES.BASELINE_REQUIRED;
  return DIAGNOSTIC_ENTRY_STATES.BASELINE_UNAVAILABLE;
}

export function initialDiagnosticType({hasAnyExistingTraining=false}={}){
  return hasAnyExistingTraining?'first_diagnostic_after_training':'first_diagnostic_before_training';
}

export function canUnlockFromDiagnosticResult(result){
  return !!result&&result.kind==='baseline'&&result.state==='completed'&&
    result.serverConfirmed===true&&typeof result.completedAt==='string'&&
    Number.isFinite(Date.parse(result.completedAt));
}
