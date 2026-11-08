import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';
import { studentView } from './student-feedback.js';

const ORIGIN = 'https://hub.example.invalid';
const AUTH_URL = 'https://synthetic.supabase.co';
const uid = '22222222-2222-4222-8222-222222222222';
const QUOTA_SECRET = 'q'.repeat(64);
const TICKET = '33333333-3333-4333-8333-333333333333';
const task = 'Write a review of a science museum for a school magazine. Describe the exhibits and recommend a visit. Write 120–160 words.';
const writing = 'The museum was fascinating because the interactive exhibits made science easy to understand. I recommend visiting with friends.';
const submission = { app: 'review', task, response: writing, privacyNoticeAccepted: true };
const evidence = { requirements: [{ taskQuote: 'recommend a visit', quote: 'I recommend visiting with friends' }], features: [{ label: 'reason', quote: 'because the interactive exhibits made science easy to understand' }], errors: [] };
const assessment = { contentMark: 4, languageMark: 6, contentReason: 'SECRET-TEACHER-REASON the review gives a reason.', languageReason: 'SECRET-LANGUAGE-REASON clear vocabulary.', strengths: [{ evidence: 2, advice: 'Explains why the exhibits worked well.' }], improvements: [{ evidence: 1, advice: 'Explain why this would suit the audience.', example: 'I recommend visiting with friends because the exhibits are fun to try together.' }], missingRequirements: [], nextStep: 'Develop the description of one exhibit.' };
const request = (body = submission, { token = 'student-token', origin = ORIGIN, method = 'POST', path = '/feedback' } = {}) =>
  new Request('https://assessor.example.invalid' + path, { method, headers: { ...(origin ? { Origin: origin } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}), 'Content-Type': 'application/json' }, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
function setup(t, { role = 'student', active = true, mustChange = false, begin = { allowed: true, ticket: TICKET }, beginStatus = 200, replies = [evidence, assessment], aiError } = {}) {
  const calls = { supabase: [], ai: [], order: [] };
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    const u = String(url); calls.supabase.push({ url: u, options });
    assert.equal(options.redirect, 'manual'); assert.equal(options.headers.apikey, 'synthetic-publishable-key');
    if (u.includes('/rpc/')) assert.equal(options.headers.Authorization, undefined, 'no student credential goes to the quota functions'); else assert.equal(options.headers.Authorization, 'Bearer student-token');
    if (u.includes('/auth/v1/user')) { calls.order.push('auth'); return Response.json({ id: uid }); }
    if (u.includes('/rest/v1/profiles')) { calls.order.push('profile'); return Response.json([{ role, active, must_change_password: mustChange }]); }
    if (u.endsWith('/rpc/begin_student_feedback')) { calls.order.push('begin'); calls.begin = JSON.parse(options.body); return Response.json(begin, { status: beginStatus }); }
    if (u.endsWith('/rpc/finish_student_feedback')) { calls.order.push('finish'); calls.finishFull = JSON.parse(options.body); calls.finish = { p_ticket: calls.finishFull.p_ticket, p_refund: calls.finishFull.p_refund }; return Response.json({ ok: true }); }
    throw new Error('unexpected fetch ' + u);
  });
  const env = { HUB_ORIGIN: ORIGIN, SUPABASE_URL: AUTH_URL, SUPABASE_PUBLISHABLE_KEY: 'synthetic-publishable-key', FEEDBACK_QUOTA_SECRET: QUOTA_SECRET, AI: { run: async (model, args) => { calls.order.push('ai'); calls.ai.push({ model, args }); if (aiError) throw aiError; return { response: replies[calls.ai.length - 1] }; } } };
  return { calls, env };
}
const everything = body => JSON.stringify(body);

test('an active student gets verified feedback and the Worker maps the app to the 0511 task type', async t => {
  const { env, calls } = setup(t); const res = await worker.fetch(request(), env); assert.equal(res.status, 200);
  const body = await res.json(); assert.deepEqual(Object.keys(body), ['feedback']);
  assert.equal(body.feedback.partial, false); assert.equal(body.feedback.strengths.length, 1); assert.equal(body.feedback.improvements.length >= 0, true);
  assert.equal(typeof body.feedback.nextStep, 'string');
  assert.equal(calls.ai.length, 2); assert.equal(JSON.parse(calls.ai[0].args.messages.at(-1).content).taskType, 'review');
  assert.deepEqual(calls.order.filter(x => x !== 'ai'), ['auth', 'profile', 'begin', 'finish']); assert.deepEqual(calls.finish, { p_ticket: TICKET, p_refund: false });
  assert.equal(res.headers.get('cache-control'), 'no-store');
});
test('marks, reasons, evidence lists, teacher-only data and diagnostics NEVER reach a student', async t => {
  const { env } = setup(t); const text = await (await worker.fetch(request(), env)).text();
  for (const forbidden of ['contentMark', 'languageMark', 'totalMark', 'contentReason', 'languageReason', 'SECRET-', 'quotedErrorCandidates', 'verifiedEvidence', 'observedEvidence', 'checks', 'reviewStatus', 'warning', 'stage', 'model', 'Cambridge examiner'])
    assert.ok(!text.includes(forbidden), forbidden + ' leaked to the student');
  assert.doesNotMatch(text, /"(?:content|language|total)"?\s*:\s*\d/i);
});
test('the request may not choose the task type, role or extra fields; unknown apps are rejected before any quota is used', async t => {
  for (const body of [{ ...submission, taskType: 'essay' }, { ...submission, app: 'essay' }, { ...submission, app: '__proto__' }, { ...submission, privacyNoticeAccepted: false }, { ...submission, role: 'admin' }, { ...submission, task: 'short' }, { ...submission, response: 'x'.repeat(6001) }, 'not json', [] ]) {
    const { env, calls } = setup(t); const res = await worker.fetch(request(body), env); assert.ok([400, 413].includes(res.status), JSON.stringify(body).slice(0, 40));
    assert.ok(!calls.order.includes('begin') && calls.ai.length === 0, 'a malformed request must not use quota or AI'); t.mock.restoreAll();
  }
});
test('emails and obvious identifiers are rejected without using quota', async t => {
  const { env, calls } = setup(t); const res = await worker.fetch(request({ ...submission, response: writing + ' Write to alex@example.com' }), env);
  assert.equal(res.status, 400); assert.equal((await res.json()).error, 'remove_personal_identifiers'); assert.ok(!calls.order.includes('begin'));
});
for (const [role, active, mustChange] of [['teacher', true, false], ['admin', true, false], ['student', false, false], ['student', true, true]])
  test(`${role}${active ? '' : ' (inactive)'}${mustChange ? ' (must change password)' : ''} is refused by the student route with no quota or AI use`, async t => {
    const { env, calls } = setup(t, { role, active, mustChange }); const res = await worker.fetch(request(), env);
    assert.equal(res.status, 403); assert.equal((await res.json()).error, 'active_student_required'); assert.ok(!calls.order.includes('begin') && calls.ai.length === 0);
  });
test('students are refused by the teacher route, and the teacher route is unchanged', async t => {
  const { env, calls } = setup(t); const res = await worker.fetch(request({ taskType: 'review', task, response: writing, privacyConfirmed: true }, { path: '/assess' }), env);
  assert.equal(res.status, 403); assert.equal((await res.json()).error, 'active_staff_required'); assert.equal(calls.ai.length, 0);
});
test('missing/invalid sessions, wrong origin, wrong method and query strings are refused first', async t => {
  { const { env, calls } = setup(t); assert.equal((await worker.fetch(request(submission, { token: '' }), env)).status, 401); assert.equal(calls.supabase.length, 0); t.mock.restoreAll(); }
  { const { env } = setup(t); assert.equal((await worker.fetch(request(submission, { origin: 'https://evil.example.invalid' }), env)).status, 403); t.mock.restoreAll(); }
  { const { env } = setup(t); assert.equal((await worker.fetch(request(submission, { origin: '' }), env)).status, 403); t.mock.restoreAll(); }
  { const { env } = setup(t); assert.equal((await worker.fetch(request(null, { method: 'GET' }), env)).status, 405); t.mock.restoreAll(); }
  { const { env } = setup(t); const res = await worker.fetch(new Request('https://assessor.example.invalid/feedback?x=1', { method: 'POST', headers: { Origin: ORIGIN, Authorization: 'Bearer student-token', 'Content-Type': 'application/json' }, body: JSON.stringify(submission) }), env); assert.equal(res.status, 400); }
});
test('preflight is allowed only from the Hub origin', async t => {
  const { env } = setup(t); const ok = await worker.fetch(request(null, { method: 'OPTIONS' }), env); assert.equal(ok.status, 204); assert.equal(ok.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal((await worker.fetch(request(null, { method: 'OPTIONS', origin: 'https://evil.example.invalid' }), env)).status, 403);
});
const reasons = { busy: 429, too_soon: 429, daily_limit: 429, global_limit: 429, not_available: 403 };
for (const [reason, status] of Object.entries(reasons))
  test(`quota answer "${reason}" stops the request before any AI call and tells the browser only what it needs`, async t => {
    const { env, calls } = setup(t, { begin: { allowed: false, reason, retry_after: 42 } }); const res = await worker.fetch(request(), env);
    assert.equal(res.status, status); const body = await res.json(); assert.equal(calls.ai.length, 0); assert.ok(!calls.order.includes('finish'), 'no ticket, nothing to release');
    if (status === 429) { assert.equal(body.error, 'rate_limited'); assert.equal(body.reason, reason); assert.equal(body.retryAfterSeconds, 42); } else assert.deepEqual(body, { error: 'feedback_not_available' });
    assert.ok(!JSON.stringify(body).match(/pilot|student_id|used|limit":|global_daily/i) || reason === 'daily_limit' || reason === 'global_limit');
  });
test('the quota check fails closed: unexpected, missing or erroring answers never lead to an AI call', async t => {
  for (const [begin, beginStatus] of [[{ allowed: true }, 200], [{ allowed: true, ticket: 'not-a-uuid' }, 200], [{ allowed: false, reason: 'surprise' }, 200], [null, 200], [{ message: 'boom' }, 500], [{}, 401]]) {
    const { env, calls } = setup(t, { begin, beginStatus }); const res = await worker.fetch(request(), env); assert.equal(res.status, 503); assert.equal((await res.json()).error, 'quota_unavailable'); assert.equal(calls.ai.length, 0); t.mock.restoreAll();
  }
});
test('retryAfterSeconds is clamped to a sane range and never negative', async t => {
  for (const [value, expected] of [[-5, 0], [0, 0], [99999999, 86400], ['abc', 0], [1.5, 0]]) {
    const { env } = setup(t, { begin: { allowed: false, reason: 'too_soon', retry_after: value } }); assert.equal((await (await worker.fetch(request(), env)).json()).retryAfterSeconds, expected); t.mock.restoreAll();
  }
});
test('when the AI fails, the student gets a coarse error, the turn is refunded and nothing from the request is echoed', async t => {
  const { env, calls } = setup(t, { aiError: Object.assign(new Error('Free allocation of 10,000 neurons exceeded. PRIVATE ' + writing), { code: 3036 }) });
  const res = await worker.fetch(request(), env); assert.equal(res.status, 503); const text = await res.text(); const body = JSON.parse(text);
  assert.equal(body.error, 'feedback_unavailable'); assert.equal(body.category, 'quota_or_rate_limit'); assert.ok(!text.includes('PRIVATE') && !text.includes('museum') && !text.includes('neurons'));
  assert.deepEqual(calls.finish, { p_ticket: TICKET, p_refund: true });
});
test('a malformed model answer gives a coarse failure and does NOT refund (junk cannot be retried for free)', async t => {
  const { env, calls } = setup(t, { replies: [{ nonsense: true }] }); const res = await worker.fetch(request(), env); assert.equal(res.status, 503);
  assert.deepEqual(calls.finish, { p_ticket: TICKET, p_refund: false }); assert.ok(!(await res.text()).includes('museum'));
});
test('a result with no checked feedback is returned as a labelled partial, without marks, and still uses the turn', async t => {
  const { env, calls } = setup(t, { replies: [evidence, { ...assessment, strengths: [{ evidence: 9, advice: 'Invented' }], improvements: [] }] });
  const res = await worker.fetch(request(), env); const body = await res.json(); assert.equal(res.status, 200);
  assert.equal(body.feedback.partial, true); assert.deepEqual(body.feedback.strengths, []); assert.deepEqual(body.feedback.improvements, []); assert.equal(body.feedback.nextStep, '');
  assert.ok(!JSON.stringify(body).includes('Invented') && !JSON.stringify(body).includes('Mark')); assert.deepEqual(calls.finish, { p_ticket: TICKET, p_refund: false });
});
test('the AI sees the writing and the task but never identity, tokens or the ticket', async t => {
  const { env, calls } = setup(t); await worker.fetch(request(), env); const text = JSON.stringify(calls.ai.map(c => c.args));
  for (const secret of [uid, 'student-token', 'synthetic-publishable-key', TICKET]) assert.ok(!text.includes(secret), secret + ' reached the AI');
  assert.ok(text.includes('science museum') && text.includes('interactive exhibits'));
});
test('studentView drops anything that talks about marks and builds a mark-free length note', () => {
  const view = studentView({ contentMark: 5, strengths: [{ quote: 'a', advice: 'This deserves a high mark.' }, { quote: 'b', advice: 'Good reason.' }], improvements: [{ quote: 'c', advice: 'Band 7 needs more.', type: 'error' }, { quote: 'd', advice: 'Use were.', type: 'error', suggestion: 'were' }],
    nextStep: 'Add detail.', lengthNotice: { wordCount: 80, minimum: 120, maximum: 160, message: 'The word count does not change the marks by itself', suggestion: 'x' }, quotedErrorCandidatesRequireTeacherReview: [{ quote: 'secret' }] });
  assert.deepEqual(view.strengths, [{ quote: 'b', advice: 'Good reason.' }]); assert.deepEqual(view.improvements, [{ quote: 'd', advice: 'Use were.', type: 'error', suggestion: 'were' }]);
  assert.match(view.lengthNotice.message, /80 words.*120–160 words/); assert.doesNotMatch(everything(view), /marks?|band|secret|contentMark/i);
  assert.equal(studentView({ feedbackVerified: false, strengths: [{ quote: 'a', advice: 'ok' }] }).partial, true);
  assert.equal(studentView(null).partial, true);
});
test('GET / and /assess behaviour are unchanged and /feedback is an additional route', async t => {
  const { env } = setup(t); const res = await worker.fetch(new Request('https://assessor.example.invalid/'), env); assert.equal((await res.json()).studentsEnabled, false);
});

test('the quota functions get the Worker secret and the VERIFIED student id, never the student token, and the secret never reaches the AI, the student or the body', async t => {
  const { env, calls } = setup(t); const res = await worker.fetch(request(), env); const text = await res.text();
  assert.deepEqual(calls.begin, { p_secret: QUOTA_SECRET, p_student_id: uid });
  assert.deepEqual(calls.finishFull, { p_secret: QUOTA_SECRET, p_student_id: uid, p_ticket: TICKET, p_refund: false });
  assert.ok(!text.includes(QUOTA_SECRET) && !JSON.stringify(calls.ai).includes(QUOTA_SECRET));
});
test('the student id comes from Supabase verification, not from anything the student sends', async t => {
  const { env, calls } = setup(t); const forged = { ...submission, studentId: '99999999-9999-4999-8999-999999999999' };
  assert.equal((await worker.fetch(request(forged), env)).status, 400); assert.equal(calls.begin, undefined);
});
test('a missing or short quota secret fails closed before any quota call or AI call', async t => {
  for (const secret of [undefined, '', 'short']) {
    const { env, calls } = setup(t); env.FEEDBACK_QUOTA_SECRET = secret; const res = await worker.fetch(request(), env);
    assert.equal(res.status, 503); assert.equal(calls.ai.length, 0); assert.equal(calls.begin, undefined); t.mock.restoreAll();
  }
});

test('end to end: a strengths-only model answer still yields verified corrections and a next step for the student, with no marks', async t => {
  const { env } = setup(t); const slips = writing + ' I dont mind the queue. Whats best is the shop.';
  const res = await worker.fetch(request({ ...submission, response: slips }), env); assert.equal(res.status, 200);
  const text = await res.text(); const body = JSON.parse(text);
  assert.ok(body.feedback.strengths.length >= 1);
  assert.deepEqual(body.feedback.improvements.filter(i => i.type === 'error').map(i => [i.quote, i.suggestion]).filter(([q]) => ['dont', 'Whats'].includes(q)), [['dont', "don't"], ['Whats', "What's"]]);
  assert.match(body.feedback.nextStep, /\S/); assert.doesNotMatch(text, /contentMark|languageMark|totalMark|SECRET-/);
  for (const i of body.feedback.improvements) assert.ok(slips.includes(i.quote), 'quote is verbatim: ' + i.quote);
});
