// Student feedback client: sends one request to the separate /feedback route and rebuilds the answer from an allow-list.
// Never stores anything. Marks are not part of the student response, and anything that is not on the allow-list is dropped here as well.
export const FEEDBACK_ENDPOINT = 'https://igcse-writing-assessor.toby-pottas.workers.dev/feedback';
const APPS = ['email', 'review'];
export class FeedbackError extends Error {
  constructor(message, code, retryAfterSeconds = 0) { super(message); this.code = code; this.retryAfterSeconds = retryAfterSeconds; }
}
function clock(seconds, now = Date.now()) {
  try { return new Date(now + seconds * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); } catch { return ''; }
}
export function messageFor(status, body, now = Date.now()) {
  const retry = Number.isInteger(body?.retryAfterSeconds) ? body.retryAfterSeconds : 0;
  if (status === 429 && body?.error === 'rate_limited') {
    if (body.reason === 'busy') return ['rate_busy', 'Your feedback is still being prepared. Please wait for it to finish.'];
    if (body.reason === 'too_soon') return ['rate_too_soon', 'Please wait ' + (retry > 0 ? Math.min(retry, 600) + ' seconds' : 'a minute') + ' before asking again. This gives everyone a fair turn.'];
    if (body.reason === 'daily_limit') return ['rate_daily', 'You have used all of today’s feedback requests. They start again ' + (retry > 0 ? 'at about ' + clock(retry, now) : 'tomorrow') + '. You can keep improving your writing and ask again then.'];
    if (body.reason === 'global_limit') return ['rate_global', 'Feedback has reached its limit for today. Please try again tomorrow. Your writing is still here.'];
  }
  if (status === 403 && body?.error === 'feedback_not_available') return ['not_available', 'AI feedback is not available for your account yet. Please ask your teacher.'];
  if (status === 401 || (status === 403 && body?.error === 'active_student_required')) return ['access_denied', 'Please sign in again with your student account to get feedback.'];
  if (status === 400 && body?.error === 'remove_personal_identifiers') return ['personal_details', 'Please remove email addresses and personal details from your writing, then try again.'];
  if (status === 400 || status === 413) return ['invalid_submission', 'Check that your writing is not empty and not longer than 6,000 characters, then try again.'];
  if (status === 503 && body?.category === 'quota_or_rate_limit') return ['allowance_used', 'AI feedback has used up its allowance for today. Please try again tomorrow. Your writing is still here.'];
  return ['unavailable', 'We could not get your feedback this time. Your writing is still here and nothing was saved. Please try again in a minute.'];
}
const text = (value, max) => typeof value === 'string' ? value.slice(0, max) : '';
// Rebuilds the feedback from known fields only (so an unexpected field, such as a mark, can never be displayed).
export function parseFeedback(body) {
  const f = body?.feedback;
  if (!f || typeof f !== 'object' || typeof f.partial !== 'boolean' || !Array.isArray(f.strengths) || !Array.isArray(f.improvements)) return null;
  const strengths = f.strengths.slice(0, 2).map(item => ({ quote: text(item?.quote, 300), advice: text(item?.advice, 400) })).filter(item => item.quote && item.advice);
  const improvements = f.improvements.slice(0, 2).map(item => ({ quote: text(item?.quote, 300), advice: text(item?.advice, 400), type: item?.type === 'error' ? 'error' : 'style', suggestion: text(item?.suggestion, 300) })).filter(item => item.quote && item.advice);
  const n = f.lengthNotice;
  const lengthNotice = n && Number.isInteger(n.wordCount) && Number.isInteger(n.minimum) ? { wordCount: n.wordCount, minimum: n.minimum, maximum: Number.isInteger(n.maximum) ? n.maximum : null, message: text(n.message, 400), suggestion: text(n.suggestion, 300) } : null;
  const partial = f.partial || (!strengths.length && !improvements.length);
  return { partial, strengths: partial ? [] : strengths, improvements: partial ? [] : improvements, nextStep: partial ? '' : text(f.nextStep, 450), lengthNotice };
}
const TIMEOUT_MS = 90000;
export async function requestFeedback(client, input, { signal, fetcher = globalThis.fetch, timeoutMs = TIMEOUT_MS, now = Date.now } = {}) {
  if (!input || !APPS.includes(input.app) || input.privacyNoticeAccepted !== true || typeof input.task !== 'string' || input.task.trim().length < 10 || input.task.length > 1500 ||
      typeof input.response !== 'string' || input.response.trim().length < 4 || input.response.length > 6000 || Object.keys(input).some(k => !['app', 'task', 'response', 'privacyNoticeAccepted'].includes(k)))
    throw new FeedbackError('Write something first, then ask for feedback. Check the box to confirm you have removed personal details.', 'invalid_submission');
  const { data, error } = await client.auth.getSession();
  if (error || !data?.session?.access_token) throw new FeedbackError('Please sign in again with your student account to get feedback.', 'access_denied');
  const controller = new AbortController(); let timedOut = false;
  const onCallerAbort = () => controller.abort(signal.reason);
  if (signal?.aborted) onCallerAbort(); else signal?.addEventListener('abort', onCallerAbort, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  let res, body;
  try {
    res = await fetcher(FEEDBACK_ENDPOINT, { method: 'POST', credentials: 'omit', redirect: 'error', cache: 'no-store', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + data.session.access_token }, body: JSON.stringify(input) });
    try { body = await res.json(); } catch { body = null; }
  } catch (caught) {
    if (timedOut && caught?.name === 'AbortError') throw new FeedbackError('This took too long and was stopped. Your writing is still here. Please try again in a minute.', 'timeout');
    if (caught?.name === 'AbortError') throw caught;
    throw new FeedbackError('We could not reach the feedback service. Check your internet connection and try again. Your writing is still here.', 'network');
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', onCallerAbort); }
  if (!res.ok) { const [code, message] = messageFor(res.status, body, now()); throw new FeedbackError(message, code, Number.isInteger(body?.retryAfterSeconds) ? body.retryAfterSeconds : 0); }
  const feedback = parseFeedback(body);
  if (!feedback) throw new FeedbackError('We could not read the feedback this time. Your writing is still here. Please try again in a minute.', 'invalid_response');
  return feedback;
}
