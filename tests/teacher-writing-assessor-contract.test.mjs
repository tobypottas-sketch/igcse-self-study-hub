// Contract tests: the REAL Hub client talking to the REAL Worker (Supabase and Workers AI are synthetic).
// Catches client/Worker drift that hand-written fixtures on either side cannot.
import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../assessor-prototype/worker.js';
import { assessWriting, AssessmentRequestError } from '../src/assessor/client.js';

const ORIGIN = 'https://hub.example.invalid';
const uid = '11111111-1111-4111-8111-111111111111';
const task = 'Write a review of a science museum for a school magazine. Describe the exhibits and recommend a visit. Write 120–160 words.';
const response = 'The museum was fascinating because the interactive exhibits made science easy to understand. I recommend visiting with friends.';
const evidence = { requirements:[{ taskQuote:'recommend a visit', quote:'I recommend visiting with friends' }], features:[{ label:'reason', quote:'because the interactive exhibits made science easy to understand' }], errors:[] };
const assessment = { contentMark:4, languageMark:6, contentReason:'Gives a reason and a recommendation but needs development.', languageReason:'Clear vocabulary with limited variety.',
  strengths:[{ quote:'the interactive exhibits made science easy to understand', advice:'A clear, supported opinion.' }], improvements:[{ quote:'I recommend visiting with friends', advice:'Say why friends would enjoy it.' }], missingRequirements:[], nextStep:'Add one specific exhibit example.' };

function bridge(t, { replies = [evidence, assessment], role = 'teacher' } = {}) {
  const ai = [];
  t.mock.method(globalThis, 'fetch', async url => String(url).includes('/auth/v1/user')
    ? Response.json({ id:uid }) : Response.json([{ role, active:true, must_change_password:false }]));
  const env = { HUB_ORIGIN:ORIGIN, SUPABASE_URL:'https://synthetic.supabase.co', SUPABASE_PUBLISHABLE_KEY:'synthetic-key',
    AI:{ run:async (model, args) => { ai.push(args); return { response:replies[ai.length - 1] }; } } };
  // The browser adds Origin itself; the fetcher stands in for the network between Hub and Worker.
  const fetcher = (url, options) => { const headers = new Headers(options.headers); headers.set('Origin', ORIGIN); return worker.fetch(new Request(url, { ...options, headers }), env); };
  const client = { auth:{ getSession:async () => ({ data:{ session:{ access_token:'synthetic-token' } } }) } };
  return { ai, fetcher, client };
}

test('real client accepts the real Worker response and shows the same marks', async t => {
  const { ai, fetcher, client } = bridge(t);
  const result = await assessWriting(client, { taskType:'review', task, response, privacyConfirmed:true }, { fetcher });
  assert.deepEqual([result.contentMark, result.languageMark, result.totalMark], [4, 6, 10]);
  assert.equal(ai.length, 2);
});

test('real client turns a real Worker denial into an access error without any AI call', async t => {
  const { ai, fetcher, client } = bridge(t, { role:'student' });
  await assert.rejects(assessWriting(client, { taskType:'review', task, response, privacyConfirmed:true }, { fetcher }), error => error.code === 'access_denied');
  assert.equal(ai.length, 0);
});

test('client and Worker enforce identical size limits', async t => {
  for (const [field, limit] of [['task', 3000], ['response', 6000]]) {
    const at = { taskType:'review', task, response, privacyConfirmed:true, [field]:'a '.repeat(limit / 2) };
    const over = { ...at, [field]:at[field] + 'a' };
    const { fetcher, client } = bridge(t);
    await assert.rejects(assessWriting(client, over, { fetcher }), error => error.code === 'invalid_submission', field + ' over limit rejected by client');
    // Same payload sent straight to the Worker must also be rejected (client-side check is not the only guard).
    const { fetcher: raw } = bridge(t);
    const res = await raw('https://assessor.example.invalid/assess', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer synthetic-token' }, body:JSON.stringify(over) });
    assert.ok([400, 413].includes(res.status), field + ' over limit rejected by Worker, got ' + res.status);
  }
});

// Regression: on an older Workers compatibility date, fetch() THROWS if init contains `cache`
// ("The 'cache' field on 'RequestInitializerDict' is not implemented"). The Worker then answered 503 for every
// real request while mocked tests passed. This double behaves like that runtime.
test('Worker outbound Supabase calls use only fetch options the Workers runtime accepts', async t => {
  const seen = [];
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    seen.push(Object.keys(init));
    if ('cache' in init) throw new TypeError("The 'cache' field on 'RequestInitializerDict' is not implemented.");
    // Confirmed live on Cloudflare (Nov 2026): redirect:'error' is not implemented either, so every call threw -> 503.
    if (init.redirect !== undefined && !['follow', 'manual'].includes(init.redirect)) throw new TypeError("Invalid redirect value, must be one of 'follow' or 'manual'.");
    return String(url).includes('/auth/v1/user') ? Response.json({ id:uid }) : Response.json([{ role:'teacher', active:true, must_change_password:false }]);
  });
  const env = { HUB_ORIGIN:ORIGIN, SUPABASE_URL:'https://synthetic.supabase.co', SUPABASE_PUBLISHABLE_KEY:'synthetic-key',
    AI:{ run:async () => { throw new Error('AI must not run for an empty body'); } } };
  const res = await worker.fetch(new Request('https://w.example.invalid/assess', { method:'POST', headers:{ Origin:ORIGIN, Authorization:'Bearer synthetic-token', 'Content-Type':'application/json' }, body:'{}' }), env);
  assert.notEqual(res.status, 503, 'staff verification must not fail because of unsupported fetch options');
  assert.equal(seen.length, 2, 'both Supabase reads were attempted');
  for (const keys of seen) assert.ok(!keys.includes('cache'));
});
