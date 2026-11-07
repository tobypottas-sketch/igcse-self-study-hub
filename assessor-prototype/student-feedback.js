import { AssessmentError, ValidationFailure, response, configuration, verifyAccount, zeroCounts, runPipeline } from './staff-assessment.js';
// Student writing feedback: a separate, authenticated route that reuses the teacher pipeline but never returns marks.
// Nothing is stored, logged or sent to analytics. The only state is a per-student counter (no text) in Supabase.
const BODY_BYTES = 12000;
// The Worker, not the browser, decides the Cambridge 0511 task type for each app. Add an app here to reuse the route.
export const STUDENT_APPS = Object.freeze({ email:{ taskType:'email' }, review:{ taskType:'review' } });
const QUOTA_REASONS = new Set(['busy', 'too_soon', 'daily_limit', 'global_limit', 'not_available']);
const MARK_TALK = /\b(?:marks?|bands?|scores?|scored|grades?|graded|levels?)\b|\b\d{1,2}\s*(?:\/|out of)\s*\d{1,2}\b/iu;
// Only a failure of the AI platform itself gives a turn back. Junk, injected or unverifiable output (the student's doing) never does:
// otherwise nonsense could be resubmitted every minute without ever using up the daily limit.
const PLATFORM_FAILURES = new Set(['quota_or_rate_limit', 'model_timeout', 'model_unavailable', 'model_permission', 'paid_model_not_allowed']);
const PHONE = /(?:\+?\d[\s().-]?){9,}/;
async function readStudentSubmission(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') ?? '')) throw new AssessmentError(400, 'json_required');
  if (Number(request.headers.get('Content-Length')) > BODY_BYTES) throw new AssessmentError(413, 'submission_too_large');
  const reader = request.body?.getReader();
  if (!reader) throw new AssessmentError(400, 'invalid_submission');
  const chunks = []; let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > BODY_BYTES) { await reader.cancel(); throw new AssessmentError(413, 'submission_too_large'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const input = JSON.parse(new TextDecoder('utf-8', { fatal:true }).decode(bytes));
    if (!input || Array.isArray(input) || typeof input !== 'object' ||
        Object.keys(input).some(key => !['app','task','response','privacyNoticeAccepted'].includes(key)) ||
        !Object.hasOwn(STUDENT_APPS, input.app) || input.privacyNoticeAccepted !== true ||
        typeof input.task !== 'string' || typeof input.response !== 'string' ||
        input.task.trim().length < 10 || input.task.length > 1500 ||
        input.response.trim().length < 4 || input.response.length > 6000)
      throw new AssessmentError(400, 'invalid_submission');
    const combined = input.task + '\n' + input.response;
    if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(combined) || PHONE.test(combined) || /\b(?:student name|candidate number|student id|full name)\s*:/i.test(combined))
      throw new AssessmentError(400, 'remove_personal_identifiers');
    return { taskType:STUDENT_APPS[input.app].taskType, task:input.task.trim(), response:input.response.trim() };
  } catch (error) {
    if (error instanceof AssessmentError) throw error;
    throw new AssessmentError(400, 'invalid_submission');
  } finally { reader.releaseLock(); }
}
async function rpc(config, authorization, name, body) {
  let res;
  try {
    res = await fetch(config.supabase + '/rest/v1/rpc/' + name, { method:'POST', redirect:'manual', signal:AbortSignal.timeout(10000),
      headers:{ Authorization:authorization, apikey:config.key, 'Content-Type':'application/json' }, body:JSON.stringify(body) });
  } catch { throw new AssessmentError(503, 'quota_unavailable'); }
  if (!res.ok) throw new AssessmentError(503, 'quota_unavailable');
  try { return await res.json(); } catch { throw new AssessmentError(503, 'quota_unavailable'); }
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Atomically reserves one request for this student, or says why not. Fails closed: any unexpected answer means no AI call.
async function reserve(config, authorization) {
  const answer = await rpc(config, authorization, 'begin_student_feedback', {});
  if (answer?.allowed === true && UUID.test(answer.ticket ?? '')) return answer.ticket;
  if (answer?.allowed === false && QUOTA_REASONS.has(answer.reason)) {
    const retry = Number.isInteger(answer.retry_after) && answer.retry_after > 0 ? Math.min(answer.retry_after, 86400) : 0;
    throw Object.assign(new AssessmentError(answer.reason === 'not_available' ? 403 : 429, answer.reason === 'not_available' ? 'feedback_not_available' : 'rate_limited'), { reason:answer.reason, retryAfter:retry });
  }
  throw new AssessmentError(503, 'quota_unavailable');
}
// Releases the in-flight slot. A refund is only granted for the exact ticket this Worker was given, which the student never sees.
async function release(config, authorization, ticket, refund) {
  try { await rpc(config, authorization, 'finish_student_feedback', { p_ticket:ticket, p_refund:refund }); } catch { /* the slot expires on its own */ }
}
// What a student may see: verified strengths, verified corrections, one writing target and a neutral length note. Never marks, reasons or teacher-only data.
export function studentView(result) {
  const clean = list => (Array.isArray(list) ? list : []).filter(item => typeof item?.quote === 'string' && typeof item?.advice === 'string' && !MARK_TALK.test(item.advice))
    .map(item => ({ quote:item.quote, advice:item.advice }));
  const strengths = clean(result?.strengths);
  const improvements = (Array.isArray(result?.improvements) ? result.improvements : []).filter(item => typeof item?.quote === 'string' && typeof item?.advice === 'string' && !MARK_TALK.test(item.advice))
    .map(item => ({ quote:item.quote, advice:item.advice, type:item.type === 'error' ? 'error' : 'style', suggestion:typeof item.suggestion === 'string' && !MARK_TALK.test(item.suggestion) ? item.suggestion : '' }));
  const notice = result?.lengthNotice;
  const lengthNotice = notice && Number.isInteger(notice.wordCount) && Number.isInteger(notice.minimum) ? {
    wordCount:notice.wordCount, minimum:notice.minimum, maximum:Number.isInteger(notice.maximum) ? notice.maximum : null,
    message:'This response has ' + notice.wordCount + ' words. The task asks for ' + (Number.isInteger(notice.maximum) ? notice.minimum + '–' + notice.maximum + ' words' : 'at least ' + notice.minimum + ' words') +
      '. A shorter response can limit how fully your ideas are developed.',
    suggestion:'Next time, add one reason, example or specific detail to each point in the task until you reach about ' + notice.minimum + ' words.' } : null;
  const target = typeof result?.nextStep === 'string' && !MARK_TALK.test(result.nextStep) ? result.nextStep : '';
  const partial = result?.feedbackVerified === false || (!strengths.length && !improvements.length);
  return { partial, strengths:partial ? [] : strengths, improvements:partial ? [] : improvements, nextStep:partial ? '' : target, lengthNotice };
}
export async function handleStudentFeedback(request, env, runAI, classifyAIError) {
  let origin; let stage = 'authorization'; let ticket = null; let authorization = ''; let config; let refund = false;
  try {
    config = configuration(env);
    if (request.headers.get('Origin') !== config.origin) throw new AssessmentError(403, 'origin_not_allowed');
    origin = config.origin;
    if (request.method === 'OPTIONS') return response(null, 204, origin);
    if (request.method !== 'POST') throw new AssessmentError(405, 'method_not_allowed');
    if (new URL(request.url).search) throw new AssessmentError(400, 'query_not_allowed');
    const { profile } = await verifyAccount(request, config, 'verification_unavailable');
    if (!profile || profile.active !== true || profile.must_change_password !== false || profile.role !== 'student') throw new AssessmentError(403, 'active_student_required');
    // Validate first: a malformed request must never use up a student's allowance.
    const input = await readStudentSubmission(request);
    if (!env.AI) throw new AssessmentError(503, 'ai_unavailable');
    authorization = request.headers.get('Authorization');
    stage = 'quota'; ticket = await reserve(config, authorization);
    stage = 'assessment';
    const result = await runPipeline(input, runAI, zeroCounts(), () => {});
    const feedback = studentView(result);
    return response({ feedback }, 200, origin);
  } catch (error) {
    if (error instanceof AssessmentError) {
      const body = { error:error.code };
      if (error.reason && error.status === 429) { body.reason = error.reason; body.retryAfterSeconds = error.retryAfter; }   // an account that is simply not enabled learns nothing else
      return response(body, error.status, origin);
    }
    // Fixed coarse codes only: never student text, model output or stack traces.
    const category = stage === 'assessment' ? classifyAIError(error) : null;
    const ownFault = error instanceof ValidationFailure || error instanceof SyntaxError || /^(?:Invalid AI|No AI text|No JSON|Bad JSON)/.test(String(error?.message ?? ''));
    refund = Boolean(ticket) && !ownFault && PLATFORM_FAILURES.has(category);
    return response({ error:'feedback_unavailable', ...(category ? { category } : {}) }, 503, origin);
  } finally {
    if (ticket) await release(config, authorization, ticket, refund);
  }
}
