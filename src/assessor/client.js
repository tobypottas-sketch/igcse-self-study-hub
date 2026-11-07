const ENDPOINT = 'https://igcse-writing-assessor.toby-pottas.workers.dev/assess';
const TYPES = ['email','article','report','essay','review'];
export class AssessmentRequestError extends Error {
  constructor(message, code) { super(message); this.code = code; }
}
function validate(input) {
  if (!input || Object.keys(input).some(key => !['taskType','task','response','privacyConfirmed'].includes(key)) ||
      !TYPES.includes(input.taskType) || input.privacyConfirmed !== true ||
      typeof input.task !== 'string' || input.task.trim().length < 10 || input.task.length > 3000 ||
      typeof input.response !== 'string' || input.response.trim().length < 4 || input.response.length > 6000)
    throw new AssessmentRequestError('Enter a task and response, and confirm that identifying details have been removed.', 'invalid_submission');
}
function validResult(body) {
  const r = body?.result;
  const points = values => Array.isArray(values) && values.every(item => typeof item?.quote === 'string' && typeof item?.advice === 'string');
  // A partial result (marks and evidence, no verified feedback) is valid only when it says so and carries no feedback items at all.
  const partial = r?.feedbackVerified === false;
  return body?.stages === 2 && r && Number.isInteger(r.contentMark) && r.contentMark >= 0 && r.contentMark <= 6 &&
    Number.isInteger(r.languageMark) && r.languageMark >= 0 && r.languageMark <= 9 && r.totalMark === r.contentMark + r.languageMark &&
    ['contentReason','languageReason'].every(key => typeof r[key] === 'string' && r[key].trim()) && points(r.strengths) && points(r.improvements) &&
    (partial ? r.reviewStatus === 'pending_teacher_review' && !r.strengths.length && !r.improvements.length && Array.isArray(r.verifiedEvidence)
      : typeof r.nextStep === 'string' && (r.strengths.length || r.improvements.length));   // the writing target may be empty: it is left out when it cannot be verified
}
// Two sequential 70B inference calls took ~16 s live; allow generous headroom, then stop waiting (no retry).
const REQUEST_TIMEOUT_MS = 90000;
export async function assessWriting(client, input, { signal, fetcher = globalThis.fetch, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  validate(input);
  const { data, error } = await client.auth.getSession();
  if (error || !data?.session?.access_token) throw new AssessmentRequestError('Sign in with an active teacher or admin account.', 'access_denied');
  // Own controller (AbortSignal.any/timeout are not available in every supported browser): caller cancellation and the timeout both abort the request.
  const controller = new AbortController(); let timedOut = false;
  const onCallerAbort = () => controller.abort(signal.reason);
  if (signal?.aborted) onCallerAbort(); else signal?.addEventListener('abort', onCallerAbort, { once:true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  let res, body;
  try {
    res = await fetcher(ENDPOINT, { method:'POST', credentials:'omit', redirect:'error', cache:'no-store', signal:controller.signal,
      headers:{ 'Content-Type':'application/json', Authorization:'Bearer ' + data.session.access_token }, body:JSON.stringify(input) });
    try { body = await res.json(); } catch { if (timedOut) throw new DOMException('timeout', 'AbortError'); throw new AssessmentRequestError('The service did not return a valid assessment. No mark has been issued.', 'invalid_response'); }
  } catch (caught) {
    if (timedOut && caught?.name === 'AbortError') throw new AssessmentRequestError('The assessment took too long and was stopped. No mark has been issued; no automatic retry was made.', 'assessment_timeout');
    throw caught;
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', onCallerAbort); }
  if (res.status === 401 || res.status === 403) throw new AssessmentRequestError('Access denied. Sign in with an active teacher or admin account.', 'access_denied');
  if (!res.ok) {
    const message = res.status === 400 || res.status === 413 ? 'Check the task, response length and privacy confirmation. Remove personal identifiers.' :
      body?.category === 'quota_or_rate_limit' ? 'The assessment service has reached its usage or capacity limit. No mark has been issued.' :
      'The assessment service is unavailable or could not verify its feedback. No mark has been issued.';
    throw new AssessmentRequestError(message, 'assessment_unavailable');
  }
  if (!validResult(body)) throw new AssessmentRequestError('The service did not return a valid assessment. No mark has been issued.', 'invalid_response');
  return body.result;
}
