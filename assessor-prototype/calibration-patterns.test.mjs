// Regression tests for failure PATTERNS found in the first teacher calibration (redundant "add X" advice, inflated praise, wrong error labels,
// generic targets, unverifiable claims). Fixtures are fictional and generic; nothing here memorises a calibration response.
// The model is simulated: these tests prove what the WORKER guarantees, not the quality of live model output.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from './worker.js';
import { profileResponse, describeProfile, redundantAddition, UNVERIFIED_LABEL } from './response-profile.js';
import { renderAssessmentResult } from '../src/assessor/view.js';
import { assessWriting } from '../src/assessor/client.js';

const ORIGIN = 'https://hub.example.invalid';
const uid = '11111111-1111-4111-8111-111111111111';
const task = "Write an article for your school magazine on 'The advantages and disadvantages of online games for teenagers'. Write 120–160 words.";
const response = 'Online games are everywhere. On the one hand, they help friends stay in touch. Moreover, many games teach teamwork. On the other hand, long sessions can replace sleep. However, a timer can solve this problem. In conclusion, games are fine in moderation.';
const submission = { taskType:'article', task, response, privacyConfirmed:true };
const stage1 = {
  requirements:[{ taskQuote:'advantages and disadvantages', quote:'they help friends stay in touch' }],
  features:[{ label:'contrast linking phrase', quote:'On the other hand, long sessions can replace sleep' }, { label:'solution with however', quote:'However, a timer can solve this problem' }],
  errors:[]
};
// catalogue: 1 requirement, 2 contrast feature, 3 however feature
const base = {
  contentMark:4, languageMark:7, contentReason:'Both sides are covered with some development.', languageReason:'Accurate with a good range of linking words.',
  strengths:[{ evidence:3, advice:'You use however to move from a problem to a solution, which helps the reader follow your argument.' }],
  improvements:[], missingRequirements:[], nextStep:'Choose one disadvantage and explain with a detail why it matters to teenagers.'
};
function run(t, replies, body = submission) {
  const ai = [];
  t.mock.method(globalThis, 'fetch', async url => String(url).includes('/auth/v1/user') ? Response.json({ id:uid }) : Response.json([{ role:'teacher', active:true, must_change_password:false }]));
  const env = { HUB_ORIGIN:ORIGIN, SUPABASE_URL:'https://synthetic.supabase.co', SUPABASE_PUBLISHABLE_KEY:'k', AI:{ run:async (model, args) => { ai.push(args); return { response:replies[ai.length - 1] }; } } };
  const req = new Request('https://assessor.example.invalid/assess', { method:'POST', headers:{ Origin:ORIGIN, Authorization:'Bearer t', 'Content-Type':'application/json' }, body:JSON.stringify(body) });
  return worker.fetch(req, env).then(async res => ({ res, body:await res.json(), ai }));
}
const withAssess = (patch = {}) => ({ ...base, ...patch });

test('profile reports only features that are really present', () => {
  const p = profileResponse(response);
  assert.deepEqual(p.linkingPhrases.slice().sort(), ['however', 'in conclusion', 'moreover', 'on the one hand', 'on the other hand'].sort());
  assert.equal(p.questions, 0); assert.equal(p.greeting, false);
  const email = profileResponse('Hi Sam,\n\nWhat do you like to eat? Can you cook?\n\nYour friend,\nLi');
  assert.equal(email.questions, 2); assert.equal(email.greeting, true); assert.equal(email.signOff, true);
  const report = profileResponse('Report on waste\n\nIntroduction\nThis report explains.\n\nFindings\nWe counted bins.');
  assert.ok(report.headings >= 3);
  assert.ok(describeProfile(email).some(fact => /question/.test(fact)));
  assert.deepEqual(describeProfile(profileResponse('Plain words here.')), []);
});

test('advice that asks for something already present is redundant; other advice is not', () => {
  const rich = profileResponse(response);
  assert.equal(redundantAddition('Add more linking words to connect your ideas.', rich), 'linking');
  assert.equal(redundantAddition('Use transitional phrases between paragraphs.', rich), 'linking');
  assert.equal(redundantAddition('Add more linking words.', profileResponse('I like dogs. They are fun.')), null);
  assert.equal(redundantAddition('Explain why the timer works, with one detail.', rich), null);
  const asks = profileResponse('Hi Sam, what food do you like?');
  assert.equal(redundantAddition('Ask some questions about the visit.', asks), 'question');
  assert.equal(redundantAddition('Check the word order in your question.', asks), null);
  assert.equal(redundantAddition('Add a reason.', rich, 'we left early because it rained'), 'reason');
  assert.equal(redundantAddition('Add a reason.', rich, 'we left early'), null);
  assert.equal(redundantAddition('Include a heading.', profileResponse('Report\n\nIntroduction\nText here.')), 'heading');
  assert.match('a tense mistake', UNVERIFIED_LABEL); assert.doesNotMatch('the verb must be were', UNVERIFIED_LABEL);
});

test('an improvement that asks for linking words already used is dropped, and the rest of the feedback is kept', async t => {
  const reply = withAssess({ improvements:[{ evidence:2, advice:'Add more linking phrases to connect your ideas.', example:'Besides this, long sessions can replace sleep.' }] });
  const { res, body } = await run(t, [stage1, reply]);
  assert.equal(res.status, 200); assert.equal(body.result.improvements.length, 0); assert.equal(body.result.strengths.length, 1);
  assert.equal(body.result.feedbackVerified, undefined);
});

test('a development suggestion survives when it asks for something that is genuinely absent', async t => {
  const reply = withAssess({ improvements:[{ evidence:2, advice:'This is optional. Explain why long sessions are a problem, with one detail.', example:'On the other hand, long sessions can replace sleep, so students feel tired at school.' }] });
  const { body } = await run(t, [stage1, reply]);
  assert.equal(body.result.improvements.length, 1); assert.equal(body.result.improvements[0].type, 'style');
});

test('advice to add a reason is dropped when the quoted sentence already gives one', async t => {
  const text = { ...submission, response:'Online games are everywhere. On the one hand, they help friends stay in touch because messages are free. On the other hand, long sessions can replace sleep. However, a timer can solve this problem.' };
  const s1b = { requirements:[{ taskQuote:'advantages and disadvantages', quote:'they help friends stay in touch because messages are free' }], features:[{ label:'reason', quote:'they help friends stay in touch because messages are free' }, { label:'contrast', quote:'On the other hand, long sessions can replace sleep' }], errors:[] };
  const { body } = await run(t, [s1b, withAssess({ strengths:[{ evidence:3, advice:'You use a contrast phrase to introduce the downside, which gives your article balance.' }], improvements:[{ evidence:2, advice:'Add a reason after this sentence.', example:'they help friends stay in touch because messages are free' }] })], text);
  assert.equal(body.result.improvements.length, 0);
});

test('error-type labels the Worker cannot demonstrate are not shown to the student', async t => {
  const reply = withAssess({ strengths:[{ evidence:3, advice:'You use however to link a problem and a solution.' }, { evidence:2, advice:'You use the correct tense here.' }],
    improvements:[{ evidence:2, advice:'This is optional. Fix the verb tense by explaining the effect in more detail.', example:'On the other hand, long sessions can replace sleep, so students feel tired.' }], nextStep:'Check the tense of your verbs in every sentence.' });
  const { res, body } = await run(t, [stage1, reply]);
  assert.equal(res.status, 200);
  assert.equal(body.result.improvements.length, 0); assert.equal(body.result.strengths.length, 1); assert.equal(body.result.nextStep, '');
});

test('a writing target that repeats existing features or an improvement is left out instead of shown', async t => {
  const redundant = await run(t, [stage1, withAssess({ nextStep:'Use more linking words in your next article.' })]);
  assert.equal(redundant.res.status, 200); assert.equal(redundant.body.result.nextStep, ''); assert.ok(redundant.body.result.strengths.length);
  const reply = withAssess({ improvements:[{ evidence:2, advice:'This is optional. Explain why long sessions are a problem, with one detail.', example:'On the other hand, long sessions can replace sleep, so students feel tired.' }], nextStep:'Rewrite On the other hand, long sessions can replace sleep with more detail.' });
  const repeated = await run(t, [stage1, reply]);
  assert.equal(repeated.res.status, 200); assert.equal(repeated.body.result.nextStep, ''); assert.equal(repeated.body.result.improvements.length, 1);
  const fine = await run(t, [stage1, withAssess()]);
  assert.match(fine.body.result.nextStep, /disadvantage/);
});

test('praise that rates ordinary wording is rejected, but praise of what the quotation does is kept', async t => {
  const bad = ['You use interesting vocabulary here.', 'This shows engaging and creative expressions.', 'You use great phrases to explain your idea.', 'This is a rich and varied sentence.'];
  for (const advice of bad) {
    const { body } = await run(t, [stage1, withAssess({ strengths:[{ evidence:3, advice }] })]);
    assert.equal(body.result.feedbackVerified, false, advice);
  }
  const { body } = await run(t, [stage1, base]);
  assert.equal(body.result.strengths.length, 1);
});

test('stage 2 receives Worker-counted facts about what the response already contains', async t => {
  const { ai } = await run(t, [stage1, base]);
  const input = JSON.parse(ai[1].messages?.at(-1)?.content ?? ai[1].prompt ?? '{}');
  assert.ok(input.alreadyPresent.some(fact => /linking words or phrases already used/.test(fact) && /however/.test(fact)));
  assert.ok(!('questions' in input));
});

test('prompts carry the marking-method and naming rules, and stay free of response-specific text', () => {
  const source = readFileSync(new URL('./staff-assessment.js', import.meta.url), 'utf8') + readFileSync(new URL('./response-profile.js', import.meta.url), 'utf8');
  for (const rule of [/DEVELOPED/, /Covering every point/, /independently/, /agreement mistake, not a tense mistake/, /alreadyPresent/, /not grammar structures/, /never state what Cambridge requires/, /whole response before saying/, /must not repeat an improvement/]) assert.match(source, rule);
  for (const text of ['Bella', 'chips', 'we goes', "you're football", 'plastic forks', 'school uniform', 'head teacher', 'Space Dogs', 'canteen', 'Sam']) assert.ok(!source.includes(text), text);
});

test('the Hub accepts and renders a result whose writing target was left out', async () => {
  const result = { contentMark:4, languageMark:7, totalMark:11, wordCount:40, contentReason:'Ok.', languageReason:'Ok.', strengths:[{ quote:'However, a timer', advice:'You link ideas.' }], improvements:[], nextStep:'' };
  const root = { innerHTML:'' }; renderAssessmentResult(root, result);
  assert.doesNotMatch(root.innerHTML, /writing target/); assert.match(root.innerHTML, /Strengths/);
  const client = { auth:{ getSession:async () => ({ data:{ session:{ access_token:'synthetic-session-token' } } }) } };
  const out = await assessWriting(client, submission, { fetcher: async () => new Response(JSON.stringify({ stages:2, result }), { status:200, headers:{ 'content-type':'application/json' } }) });
  assert.equal(out.nextStep, '');
  await assert.rejects(assessWriting(client, submission, { fetcher: async () => new Response(JSON.stringify({ stages:2, result:{ ...result, nextStep:undefined } }), { status:200, headers:{ 'content-type':'application/json' } }) }), /valid assessment/);
});
