import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { requestFeedback, parseFeedback, messageFor, FeedbackError, FEEDBACK_ENDPOINT } from '../src/assessor/student-client.js';
import { emailTaskText, emailResponseText, safeSignoff, reviewTaskText, reviewResponseText } from '../src/assessor/writing-app-adapters.js';
import { PRIVACY_SUMMARY, PRIVACY_DETAIL, PRIVACY_CONSENT } from '../src/assessor/student-privacy-notice.js';
import { wordTarget } from '../assessor-prototype/text-integrity.js';
const read = p => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const session = { auth: { getSession: async () => ({ data: { session: { access_token: 'synthetic-student-token' } } }) } };
const input = { app: 'email', task: 'Write an informal email to a friend about a school trip.', response: 'Hi Sam, the trip was fun because we visited a castle.', privacyNoticeAccepted: true };
const good = { feedback: { partial: false, strengths: [{ quote: 'because we visited a castle', advice: 'Gives a reason.' }], improvements: [{ quote: 'we goes', advice: 'Use go after we.', type: 'error', suggestion: 'we go' }], nextStep: 'Add one detail about the castle.', lengthNotice: { wordCount: 80, minimum: 120, maximum: 160, message: 'This response has 80 words.', suggestion: 'Add detail.' } } };
const send = (body, status = 200) => async () => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

test('request goes once to the /feedback route with only the allowed fields and the Hub session', async () => {
  let calls = 0;
  const feedback = await requestFeedback(session, input, { fetcher: async (url, options) => { calls++;
    assert.equal(url, FEEDBACK_ENDPOINT); assert.match(url, /\/feedback$/); assert.equal(options.headers.Authorization, 'Bearer synthetic-student-token'); assert.equal(options.credentials, 'omit'); assert.equal(options.cache, 'no-store');
    assert.deepEqual(Object.keys(JSON.parse(options.body)).sort(), ['app', 'privacyNoticeAccepted', 'response', 'task']); return Response.json(good); } });
  assert.equal(calls, 1); assert.equal(feedback.strengths.length, 1); assert.equal(feedback.improvements[0].type, 'error');
});
test('bad input never reaches the network; signed-out students are told to sign in', async () => {
  let calls = 0; const fetcher = async () => { calls++; };
  for (const bad of [{ ...input, app: 'essay' }, { ...input, privacyNoticeAccepted: false }, { ...input, response: '' }, { ...input, task: 'short' }, { ...input, response: 'x'.repeat(6001) }, { ...input, taskType: 'essay' }])
    await assert.rejects(requestFeedback(session, bad, { fetcher }), error => error instanceof FeedbackError && error.code === 'invalid_submission');
  await assert.rejects(requestFeedback({ auth: { getSession: async () => ({ data: { session: null } }) } }, input, { fetcher }), error => error.code === 'access_denied');
  assert.equal(calls, 0);
});
test('marks and any unexpected field are dropped even if the service sends them', () => {
  const dirty = { feedback: { ...good.feedback, contentMark: 5, languageMark: 7, totalMark: 12, contentReason: 'SECRET', quotedErrorCandidatesRequireTeacherReview: [{ quote: 'x' }], strengths: [{ quote: 'a', advice: 'b', mark: 9 }], improvements: [] }, marks: { total: 12 } };
  const clean = parseFeedback(dirty); const text = JSON.stringify(clean);
  assert.ok(!/Mark|SECRET|quotedError|"mark"|total/i.test(text)); assert.deepEqual(Object.keys(clean).sort(), ['improvements', 'lengthNotice', 'nextStep', 'partial', 'strengths']);
});
test('a partial or empty result is shown as partial and carries no feedback', () => {
  assert.deepEqual(parseFeedback({ feedback: { partial: true, strengths: [{ quote: 'a', advice: 'b' }], improvements: [], nextStep: 'x' } }), { partial: true, strengths: [], improvements: [], nextStep: '', lengthNotice: null });
  assert.equal(parseFeedback({ feedback: { partial: false, strengths: [], improvements: [], nextStep: 'x' } }).partial, true);
  assert.equal(parseFeedback({ nothing: true }), null); assert.equal(parseFeedback({ feedback: { partial: 'no' } }), null);
});
test('every failure has a friendly, accurate message that blames nothing on the student and reveals no private detail', async () => {
  const cases = [[429, { error: 'rate_limited', reason: 'daily_limit', retryAfterSeconds: 3600 }, 'rate_daily', /used all of today/], [429, { error: 'rate_limited', reason: 'too_soon', retryAfterSeconds: 25 }, 'rate_too_soon', /25 seconds/],
    [429, { error: 'rate_limited', reason: 'busy' }, 'rate_busy', /still being prepared/], [429, { error: 'rate_limited', reason: 'global_limit' }, 'rate_global', /reached its limit for today/], [403, { error: 'feedback_not_available' }, 'not_available', /ask your teacher/],
    [403, { error: 'active_student_required' }, 'access_denied', /sign in/i], [401, {}, 'access_denied', /sign in/i], [400, { error: 'remove_personal_identifiers' }, 'personal_details', /remove email/], [413, {}, 'invalid_submission', /6,000/],
    [503, { error: 'feedback_unavailable', category: 'quota_or_rate_limit' }, 'allowance_used', /allowance for today/], [503, { error: 'quota_unavailable' }, 'unavailable', /nothing was saved/], [500, null, 'unavailable', /try again/]];
  for (const [status, body, code, pattern] of cases) {
    await assert.rejects(requestFeedback(session, input, { fetcher: send(body, status) }), error => { assert.equal(error.code, code); assert.match(error.message, pattern); assert.doesNotMatch(error.message, /pilot|student_id|database|supabase|cloudflare worker|stack|500|503/i); return true; });
  }
});
test('the daily-limit message names the local reset time', () => {
  const [, message] = messageFor(429, { error: 'rate_limited', reason: 'daily_limit', retryAfterSeconds: 7200 }, Date.UTC(2026, 10, 7, 12, 0, 0)); assert.match(message, /at about \d/);
});
test('network failure, timeout and caller cancellation are different and never retried', async () => {
  let calls = 0;
  await assert.rejects(requestFeedback(session, input, { fetcher: async () => { calls++; throw new TypeError('Failed to fetch'); } }), error => error.code === 'network' && /internet connection/.test(error.message));
  await assert.rejects(requestFeedback(session, input, { timeoutMs: 20, fetcher: (u, o) => { calls++; return new Promise((_, reject) => o.signal.addEventListener('abort', () => reject(new DOMException('x', 'AbortError')))); } }), error => error.code === 'timeout');
  const controller = new AbortController(); const pending = requestFeedback(session, input, { signal: controller.signal, fetcher: (u, o) => { calls++; return new Promise((_, reject) => { const stop = () => reject(new DOMException('x', 'AbortError')); if (o.signal.aborted) stop(); else o.signal.addEventListener('abort', stop); }); } }); controller.abort();
  await assert.rejects(pending, error => error.name === 'AbortError' && error.code !== 'timeout'); assert.equal(calls, 3);
});
test('malformed success bodies are rejected without showing anything', async () => {
  for (const body of [{}, { feedback: null }, { feedback: { partial: false } }, 'text']) await assert.rejects(requestFeedback(session, input, { fetcher: async () => new Response(JSON.stringify(body), { status: 200 }) }), error => error.code === 'invalid_response');
});
test('Informal Email adapter sends the real task, audience, bullets and word range, and never the student\'s sign-off name', () => {
  const task = emailTaskText({ taskQ: 'Your friend Sam is visiting next month. Write an email to Sam', audience: 'a friend', bp1: 'describe your plans for Saturday', bp2: 'suggest what to bring', bp3: 'ask about food', minWords: 120, maxWords: 160 });
  assert.equal((task.match(/write an (?:informal )?email/gi) || []).length, 1, 'the instruction to write an email is not repeated');
  assert.match(emailTaskText({ taskQ: 'Your friend is visiting', audience: 'a cousin' }), /informal email to a cousin/); for (const bullet of ['plans for Saturday', 'what to bring', 'ask about food']) assert.match(task, new RegExp(bullet));
  assert.deepEqual(wordTarget(task), { min: 120, max: 160 }, 'the Worker must be able to read the word range');
  assert.equal(emailTaskText({ taskQ: 'Write to your friend about a trip', minWords: '', maxWords: '' }).includes('words'), false);
  assert.equal(emailTaskText({ taskQ: '  ', bp1: 'x' }), '', 'no chosen task means nothing is sent');
  const text = emailResponseText({ opening: 'Hi Sam,', bp1: 'First.', bp2: ' ', bp3: 'Third.', closing: 'See you soon!', signoff: 'Best wishes,\nAlex Smith' });
  assert.equal(text, 'Hi Sam,\n\nFirst.\n\nThird.\n\nSee you soon!\n\nBest wishes,\n[Name]'); assert.ok(!text.includes('Alex'));
  assert.equal(safeSignoff('Alex'), '[Name]'); assert.equal(safeSignoff('Best wishes,'), 'Best wishes,\n[Name]'); assert.equal(safeSignoff(''), '');
});
test('Review Writing adapter keeps the chosen or teacher-set prompt and adds the word range only when missing', () => {
  assert.deepEqual(wordTarget(reviewTaskText('Write a review of a film for a school magazine.')), { min: 120, max: 160 });
  assert.equal(reviewTaskText('Write a review. Write 150-200 words.'), 'Write a review. Write 150-200 words.');
  assert.equal(reviewResponseText(['Intro.', '', 'Body.', 'End.']), 'Intro.\n\nBody.\n\nEnd.');
});
test('the privacy notice says what really happens and makes no claims the code does not keep', () => {
  const all = [PRIVACY_SUMMARY, ...PRIVACY_DETAIL, PRIVACY_CONSENT].join(' ');
  assert.match(all, /not saved/i); assert.match(all, /AI/); assert.match(all, /personal details/i); assert.match(all, /no marks/i); assert.match(all, /mistakes/i); assert.doesNotMatch(all, /anonymous|guarantee|100%|never stored by Cloudflare|encrypted at rest/i);
});
test('nothing in the student feedback code touches storage, analytics, the database client or logging', () => {
  for (const file of ['src/assessor/student-client.js', 'src/assessor/student-feedback.js', 'src/assessor/writing-app-adapters.js', 'src/assessor/email-feedback.js', 'src/assessor/review-feedback.js', 'assessor-prototype/student-feedback.js']) {
    const source = read(file).split('\n').filter(line => !line.trim().startsWith('//')).join('\n'); assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|document\.cookie|\.from\(['"]|\.insert\(|\.upsert\(|activity_events|console\.(?:log|info|debug)|sendBeacon|gtag|analytics/, file);
  }
});
test('both apps load the shared component and progress card; Review Writing has a login gate; the teacher assessor is not touched', () => {
  const email = read('email-writing-app.html'), review = read('review-writing.html');
  for (const page of [email, review]) { assert.match(page, /assessment-progress\.css/); assert.match(page, /student-feedback\.css/); assert.match(page, /id="studentFeedbackHost"/); }
  assert.match(email, /src\/assessor\/email-feedback\.js/); assert.match(review, /src\/assessor\/review-feedback\.js/);
  assert.match(review, /review-auth-ready/); assert.match(review, /location\.replace\('\.\/'\)/); assert.match(review, /html:not\(\.review-auth-ready\) body\{visibility:hidden\}/);
  assert.match(read('src/assessor/student-feedback.js'), /from '\.\/progress\.js'/, 'the existing progress component is reused, not copied');
  assert.match(read('src/assessor/email-feedback.js'), /role === 'student'/); assert.match(read('src/assessor/review-feedback.js'), /role === 'student'/);
  for (const file of ['src/assessor/client.js', 'src/assessor/controller.js', 'src/assessor/view.js', 'src/assessor/progress.js']) assert.doesNotMatch(read(file), /\/feedback|student-client|student-feedback/, file + ' must stay teacher-only');
});

test('sign-off keeps only a known closing phrase and never a name', async () => {
  const { safeSignoff } = await import('../src/assessor/writing-app-adapters.js');
  assert.equal(safeSignoff('Best wishes,\nAmy Zhang'), 'Best wishes,\n[Name]');
  assert.equal(safeSignoff('Amy\nZhang\nClass 10B'), '[Name]');
  assert.equal(safeSignoff('Zhang Wei'), '[Name]');
  assert.equal(safeSignoff(''), '');
});
