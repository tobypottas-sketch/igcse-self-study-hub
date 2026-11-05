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
  return body?.stages === 2 && r && Number.isInteger(r.contentMark) && r.contentMark >= 0 && r.contentMark <= 6 &&
    Number.isInteger(r.languageMark) && r.languageMark >= 0 && r.languageMark <= 9 && r.totalMark === r.contentMark + r.languageMark &&
    ['contentReason','languageReason','nextStep'].every(key => typeof r[key] === 'string' && r[key].trim()) &&
    points(r.strengths) && points(r.improvements) && (r.strengths.length || r.improvements.length);
}
export async function assessWriting(client, input, { signal, fetcher = globalThis.fetch } = {}) {
  validate(input);
  const { data, error } = await client.auth.getSession();
  if (error || !data?.session?.access_token) throw new AssessmentRequestError('Sign in with an active teacher or admin account.', 'access_denied');
  const res = await fetcher(ENDPOINT, { method:'POST', credentials:'omit', redirect:'error', cache:'no-store', signal,
    headers:{ 'Content-Type':'application/json', Authorization:'Bearer ' + data.session.access_token }, body:JSON.stringify(input) });
  let body;
  try { body = await res.json(); } catch { throw new AssessmentRequestError('The service did not return a valid assessment. No mark has been issued.', 'invalid_response'); }
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
