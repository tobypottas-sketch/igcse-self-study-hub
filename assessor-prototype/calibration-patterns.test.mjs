// Regression tests for failure PATTERNS found in the first teacher calibration (redundant "add X" advice, inflated praise, wrong error labels,
// generic targets, unverifiable claims). Fixtures are fictional and generic; nothing here memorises a calibration response.
// The model is simulated: these tests prove what the WORKER guarantees, not the quality of live model output.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import worker from './worker.js';
import { profileResponse, describeProfile, redundantAddition, UNVERIFIED_LABEL } from './response-profile.js';
import { ASSESS, EVIDENCE } from './staff-assessment.js';
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
  improvements:[], missingRequirements:[], nextStep:'Choose one problem, such as long sessions replacing sleep, and explain with a detail why it matters.'
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
  const asks = profileResponse('Hi Sam, what food do you like? Can you cook?');
  assert.equal(redundantAddition('Ask some questions about the visit.', asks), 'question');
  assert.equal(redundantAddition('Check the word order in your question.', asks), null);
  assert.equal(redundantAddition('Add a question asking about the price.', profileResponse('What food do you like?')), null);   // one question is not always enough
  assert.equal(redundantAddition('Add a reason.', rich, 'we left early because it rained'), 'reason');
  assert.equal(redundantAddition('Add a reason.', rich, 'we left early'), null);
  assert.equal(redundantAddition('Include a heading.', profileResponse('Report\n\nIntroduction\nText here.')), 'heading');
  assert.equal(profileResponse('Findings\nBy Li Wei\n\nWe counted bins.').headings, 1);   // a byline line is not a heading
  assert.equal(profileResponse('Plain sentence without end\nNext line here.').headings, 0);   // one paragraph: no headings claimed
  assert.match('a tense mistake', UNVERIFIED_LABEL); assert.doesNotMatch('the verb must be were', UNVERIFIED_LABEL);
});

test('advice about developing something that already exists is not treated as redundant', () => {
  const rich = profileResponse(response), asks = profileResponse('Can you cook? What food do you like?');
  for (const text of ['Make your description of the timer more detailed.', 'Use more varied sentence openings.', 'Give a more specific reason, such as how much time it saves.', 'Make your linking phrase more precise.', 'Explain why it is good with one specific detail.'])
    assert.equal(redundantAddition(text, rich, 'we left because it rained'), null, text);
  assert.equal(redundantAddition('Make your question more polite by starting with Could you.', asks), null);
  assert.equal(redundantAddition('Add some questions.', profileResponse('What? Why? When?')), 'question');
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
  const { body } = await run(t, [s1b, withAssess({ strengths:[{ evidence:3, advice:'You use a contrast phrase to introduce the downside, which gives your article balance.' }], improvements:[{ evidence:2, advice:'Add a reason after this sentence.', example:'they help friends stay in touch, and it costs nothing because messages are free' }] })], text);
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
  assert.match(fine.body.result.nextStep, /long sessions/);
  const generic = await run(t, [stage1, withAssess({ nextStep:'Add more detail to your article.' })]);
  assert.equal(generic.res.status, 200); assert.equal(generic.body.result.nextStep, '');   // names no part of THIS response
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
  assert.ok(Array.isArray(input.alreadyPresent) && input.alreadyPresent.length > 0);
});

test('prompts carry the marking-method and naming rules, and stay free of response-specific text', () => {
  const source = readFileSync(new URL('./staff-assessment.js', import.meta.url), 'utf8') + readFileSync(new URL('./response-profile.js', import.meta.url), 'utf8') + readFileSync(new URL('./error-check.js', import.meta.url), 'utf8');
  for (const rule of [/DEVELOPED/, /Covering every point/, /independently/, /agreement mistake, not a tense mistake/, /Never ask the student to add anything listed there/, /not grammar structures/, /never state what Cambridge requires/, /Look at the whole response before saying/, /must not repeat an improvement/, /Content 5–6 when most points are developed/]) assert.match(ASSESS, rule);
  assert.match(EVIDENCE, /agreement mistake, not a tense mistake/);
  // Calibration fragments are stored only as hashes, so the repository holds none of the calibration text.
  const banned = new Set(['a03ea09072d789adff29aff6a3758e9294c96ce803915c1456384eaa6e2d2df9', 'd9705d8ee25f3f783a0c0a5e4b15bd7f6279dcfe11fa053504b2c14c5fb2a8b9', '4cf27f8df32973a6142bb07803bad8d903e7888c414954dc75d0dbaed3eb2689', '5a317aa0527b01498bd14bca3283b54dc2307c042b1de418edbf4a998c6160c7', 'e8e9c3bfb4e6d57eee905f9e95ba7786ff7b4cb9178191bd0eb99e19b35be9ce', 'ff91397bfd44773830d567bda03f5c246bbe60399b94255e10583c32adb79a57', '21b31b520371a81a62f323b7327d56f25944f0ff604544382808f796c5e55b2b', '89fa2733789ee21bea26045681252816810fb49631df46ac704be451b385b270', '1775f06ac13a1198fd72f816a81548c168bee6becb14a621d28623f44fcdf579', 'd49d0f08c85e7d3cc4b3940c9646309d4ed2276982d8c9458cf43cfee435ce1b', '6f861d40766c9c5cb3577dd3e5cef0cd9d200f498a4c3fa307d3fdf2c263e915', '9af2921d3fd57fe886c9022d1fcc055d53a79e4032fa6137e397583884e1a5de']);
  const lowered = source.toLowerCase(); const grams = new Set();
  for (const n of [1, 2, 3]) { const parts = lowered.split(/[^\p{L}\p{N}']+/u).filter(Boolean); for (let i = 0; i + n <= parts.length; i++) grams.add(parts.slice(i, i + n).join(' ')); }
  for (const gram of grams) assert.ok(!banned.has(createHash('sha256').update(gram).digest('hex')), 'calibration fragment in source');
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

test('suggestions and targets may not claim that something is absent, and the profile notes how information was collected', async t => {
  const { ABSENCE_CLAIM, namesPartOfResponse } = await import('./response-profile.js');
  for (const text of ['Your report is missing a method.', 'You do not include a conclusion.', 'There is no mention of costs.', 'You never mention the reason.']) assert.match(text, ABSENCE_CLAIM, text);
  for (const text of ['Say how this change would help.', 'Explain the effect with one detail.']) assert.doesNotMatch(text, ABSENCE_CLAIM, text);
  assert.ok(describeProfile(profileResponse('During one week I counted the bins and surveyed students.')).some(fact => /how information was collected \(counted, surveyed\)/.test(fact)));
  assert.equal(namesPartOfResponse('Add more detail to your article.', response), false);
  assert.equal(namesPartOfResponse('Explain why long sessions can replace sleep.', response), true);
  const reply = withAssess({ improvements:[{ evidence:2, advice:'This is optional. Your article does not include a reason for this, so explain why.', example:'On the other hand, long sessions can replace sleep, so students feel tired.' }] });
  const { body } = await run(t, [stage1, reply]);
  assert.equal(body.result.improvements.length, 0);
});

test('writing-target checks run on the text the student would see, and development wording is not mistaken for praise', async t => {
  const s1 = { ...stage1, errors:[{ quote:'many games teach teamwork', correction:'many game teaches teamwork', explanation:'x' }] };
  const hidden = await run(t, [s1, withAssess({ nextStep:'Rewrite the sentence in evidence 4 so the verb matches.' })]);
  assert.equal(hidden.res.status, 200); assert.equal(hidden.body.result.nextStep, '');
  const detail = await run(t, [stage1, withAssess({ nextStep:'Pick one benefit of online games and add a real example from a teenager\'s week.', improvements:[{ evidence:2, advice:'This is optional. Make this point more detailed: say how long sessions affect school.', example:'On the other hand, long sessions can replace sleep, so students are tired at school.' }] })]);
  assert.match(detail.body.result.nextStep, /benefit/); assert.equal(detail.body.result.improvements.length, 1);
});

test('a writing target that restates an improvement in different words is left out', async t => {
  const improvement = [{ evidence:2, advice:'This is optional. Say why long sessions are a problem for teenagers, so the reader sees the effect.', example:'On the other hand, long sessions can replace sleep, so teenagers are tired at school.' }];
  const repeated = await run(t, [stage1, withAssess({ improvements:improvement, nextStep:'Explain why long sessions are a problem for teenagers and what effect they have.' })]);
  assert.equal(repeated.body.result.improvements.length, 1); assert.equal(repeated.body.result.nextStep, '');
  const distinct = await run(t, [stage1, withAssess({ improvements:improvement, nextStep:'Choose one benefit of games, such as teamwork, and add a real example from a friendship.' })]);
  assert.match(distinct.body.result.nextStep, /teamwork/);
});

test('after an error has been explained the target must work on a different skill', async t => {
  const s1 = { requirements:[{ taskQuote:'advantages and disadvantages', quote:'they help friends stay in touch' }], features:[{ label:'plan', quote:'However, a timer can solve this problem' }], errors:[{ quote:'we goes to the club', correction:'we go to the club', explanation:'Wrong verb.' }] };
  const text = { ...submission, response:'Online games are everywhere. They help friends stay in touch. On Friday we goes to the club. However, a timer can solve this problem.' };
  const reply = target => withAssess({ strengths:[{ evidence:2, advice:'You use however to move from a problem to a solution, which helps the reader follow your argument.' }], improvements:[{ evidence:3, advice:'x' }], nextStep:target });
  const same = await run(t, [s1, reply('Practise verbs after we by rewriting your plans for the club on Friday.')], text);
  assert.equal(same.body.result.improvements[0].advice, 'After we, use go, not goes.'); assert.equal(same.body.result.nextStep, '');
  const other = await run(t, [s1, reply('Choose the plan for Friday at the club and add one detail about what you will do there.')], text);
  assert.match(other.body.result.nextStep, /Friday/);
  const { skillAlreadyExplained } = await import('./response-profile.js');
  assert.equal(skillAlreadyExplained('Check your spelling.', ['The correct spelling is receive, not recieve.']), true);
  assert.equal(skillAlreadyExplained('Add a detail about the plan.', ['The correct spelling is receive, not recieve.']), false);
});

test('unverified corrections are shown to the teacher in a separate, clearly labelled section, never as verified feedback', () => {
  const result = { contentMark:4, languageMark:6, totalMark:10, wordCount:40, contentReason:'Ok.', languageReason:'Ok.', nextStep:'',
    strengths:[{ quote:'However, a timer', advice:'You link ideas.' }], improvements:[{ type:'error', quote:'we goes', advice:'After we, use go, not goes.', suggestion:'we go' }],
    quotedErrorCandidatesRequireTeacherReview:[
      { quote:'we goes', correction:'we go', explanation:'model prose', demonstrable:true },
      { quote:'bring <b>you\'re</b> shoes', correction:'bring your shoes', explanation:'The model says this is a tense mistake.', demonstrable:false }] };
  const root = { innerHTML:'' }; renderAssessmentResult(root, result);
  const html = root.innerHTML;
  assert.match(html, /Teacher only: possible errors to check \(not verified\)/); assert.match(html, /assessor-teacher-only/); assert.match(html, /Suggested correction \(unverified\)/);
  assert.ok(html.indexOf('assessor-teacher-only') > html.indexOf('Experimental') || html.indexOf('assessor-teacher-only') > html.indexOf('notice'));   // after the student-facing feedback and notice
  assert.match(html, /could not confirm these/); assert.match(html, /bring your shoes/);
  assert.doesNotMatch(html, /<b>/); assert.match(html, /&lt;b&gt;/);                                   // escaped
  assert.doesNotMatch(html, /tense mistake/); assert.doesNotMatch(html, /model prose/);              // the model's explanation is never displayed
  assert.equal((html.match(/Suggested correction \(unverified\)/g) ?? []).length, 1);                // the verified error is not repeated here
  const none = { innerHTML:'' }; renderAssessmentResult(none, { ...result, quotedErrorCandidatesRequireTeacherReview:[{ quote:'we goes', correction:'we go', demonstrable:true }] });
  assert.doesNotMatch(none.innerHTML, /possible errors to check/i);
  const partial = { innerHTML:'' };
  renderAssessmentResult(partial, { ...result, strengths:[], improvements:[], feedbackVerified:false, reviewStatus:'pending_teacher_review', verifiedEvidence:[{ id:1, kind:'feature', quote:'However, a timer' }] });
  assert.match(partial.innerHTML, /possible errors to check/i); assert.match(partial.innerHTML, /Feedback not verified/);
});

test('target and correction checks avoid the false positives found in review', async t => {
  const { restates, skillAlreadyExplained, usableSuggestion } = await import('./response-profile.js');
  const imp = 'long sessions can replace sleep. This is optional. Explain why long sessions are a problem for teenagers. On the other hand, long sessions can replace sleep, so teenagers are tired at school.';
  assert.equal(restates('Choose the sentence about the timer and explain how it solves the problem of sleep for teenagers.', imp), false);
  assert.equal(restates('Explain why long sessions are a problem for teenagers and what effect they have.', imp), true);
  const uniform = 'School uniforms make students equal. This is optional. Say how uniforms help students feel equal at school.';
  assert.equal(restates('In your paragraph about school uniforms, add the price of one uniform as an example.', uniform), false);
  const taught = ['Friday is a day or month, so it needs a capital letter. After we, use go, not goes.'];
  assert.equal(skillAlreadyExplained('Practise verbs after we in your plans.', taught), true);
  assert.equal(skillAlreadyExplained('Proofread your capital letters again.', taught), true);
  for (const target of ['In your article, add one detail about the museum visit.', 'Add one detail about the capital city and its transport.', 'Add a reason why science is your favourite subject.', 'Explain why going to the club twice a week helps you.'])
    assert.equal(skillAlreadyExplained(target, ['Use a before a consonant sound.', 'Friday needs a capital letter.', 'After we, use go, not goes.', 'Of is repeated; use it only once. The correct spelling is receive, not recieve.']), false, target);
  assert.equal(usableSuggestion('The news are good', 'The news is good'), true);
  assert.equal(usableSuggestion('The news are good', 'The news is good. This is a tense mistake: news is uncountable, the student must learn past simple.'), false);
  assert.equal(usableSuggestion('we goes', 'completely different words in this long correction text'), false);
});

test('one possible error per quotation, and a misleading correction is replaced by a plain note', async t => {
  const err = (quote, correction) => ({ quote, correction, explanation: 'x' });
  const s1 = { requirements:[{ taskQuote:'advantages and disadvantages', quote:'they help friends stay in touch' }], features:[],
    errors:[err('they help friends stay in touch', 'they helps friends stay in touch'), err('they help friends stay in touch', 'they help friend stay in touch'), err('many games teach teamwork', 'many games teach team work. This is a tense mistake and the student must study the past simple.')] };
  const { body } = await run(t, [s1, withAssess({ strengths:[{ evidence:1, advice:'You give a clear reason, so the reader sees the benefit.' }] })]);
  const list = body.result.quotedErrorCandidatesRequireTeacherReview;
  assert.equal(list.length, 2); assert.equal(new Set(list.map(item => item.quote)).size, 2);
  assert.ok(list.every(item => item.correction === '' || !/tense|past simple/.test(item.correction)));
  const root = { innerHTML:'' }; renderAssessmentResult(root, { ...body.result, quotedErrorCandidatesRequireTeacherReview:[{ quote:'many games teach teamwork', correction:'', demonstrable:false }] });
  assert.match(root.innerHTML, /No usable suggestion/);
});
