// Regression tests for the "simple, targeted, clear, actionable" feedback requirements.
// The model is simulated: these tests prove what the WORKER guarantees (verification, classification, guards, prompt rules),
// not the quality of live model output. Nothing here is specific to one response; the Bella's Kitchen review is a fictional fixture.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from './worker.js';
import { renderAssessmentResult } from '../src/assessor/view.js';

const ORIGIN = 'https://hub.example.invalid';
const uid = '11111111-1111-4111-8111-111111111111';
const task = 'Write a review of a restaurant you have visited for your school magazine. Describe the food and service, give your opinion with reasons, and say whether you recommend it. Write 120–160 words.';
const response = "Last Saturday I ate at Bella's Kitchen with my family. The staff were friendly and welcomed us with a smile. I ordered the chicken pasta, which was creamy and tasty. However, the chips was cold when they arrived, so I did not enjoy them much. The restaurant is clean and the prices are fair. I think families would like it because there is a big menu for children. Overall, I would recommend Bella's Kitchen, but the kitchen should serve hot food.";
const submission = { taskType:'review', task, response, privacyConfirmed:true };

const stage1 = {
  requirements:[{ taskQuote:'say whether you recommend it', quote:"I would recommend Bella's Kitchen" }],
  features:[
    { label:'service detail', quote:'The staff were friendly and welcomed us with a smile' },
    { label:'reason with because', quote:'families would like it because there is a big menu for children' },
    { label:'food adjectives', quote:'creamy and tasty' }
  ],
  errors:[
    { quote:'the chips was cold', correction:'the chips were cold', explanation:'Chips is plural, so the verb must be were.' },
    { quote:'The staff were friendly', correction:'The staff were friendly', explanation:'No change needed.' } // not a real error
  ]
};
// catalogue ids: 1 requirement(recommend) 2 staff 3 because 4 adjectives 5 chips error
const good = {
  contentMark:4, languageMark:6, contentReason:'The review covers food, service and a recommendation, but ideas are only generally developed.',
  languageReason:'Mostly accurate with some variety; one agreement error does not impede meaning.',
  strengths:[
    { evidence:3, advice:'You give a reason for your opinion about families, which makes your recommendation convincing.' },
    { evidence:2, advice:'You describe the service with a specific detail, so the reader can picture the welcome.' }
  ],
  improvements:[
    { evidence:5, advice: 'Chips is a plural noun, so it needs the plural verb were. This is a grammar error, not a style choice.', example:'the chips were cold' },
    { evidence:2, advice:'This is optional. You already say the staff were friendly, so develop that detail instead of adding a new point.', example:'The staff were friendly: our waiter smiled, found us a table by the window and brought water straight away.' }
  ],
  missingRequirements:[], nextStep:'Develop one opinion by adding a reason and a specific detail.'
};

function run(t, replies, body = submission) {
  const ai = [];
  t.mock.method(globalThis, 'fetch', async url => String(url).includes('/auth/v1/user') ? Response.json({ id:uid }) : Response.json([{ role:'teacher', active:true, must_change_password:false }]));
  const env = { HUB_ORIGIN:ORIGIN, SUPABASE_URL:'https://synthetic.supabase.co', SUPABASE_PUBLISHABLE_KEY:'k', AI:{ run:async (model, args) => { ai.push(args); return { response:replies[ai.length - 1] }; } } };
  const req = new Request('https://assessor.example.invalid/assess', { method:'POST', headers:{ Origin:ORIGIN, Authorization:'Bearer t', 'Content-Type':'application/json' }, body:JSON.stringify(body) });
  return worker.fetch(req, env).then(async res => ({ res, body:await res.json(), ai }));
}
const withGood = (patch = {}) => ({ ...good, ...patch });

test('agreement error is classified as an error and corrected with a plain explanation', async t => {
  const { res, body } = await run(t, [stage1, good]);
  assert.equal(res.status, 200);
  const chips = body.result.improvements.find(item => item.type === 'error');
  assert.ok(chips);
  assert.equal(chips.quote, 'the chips was cold');
  assert.equal(chips.suggestion, 'the chips were cold');
  assert.match(chips.advice, /plural/);
});

test('an optional development suggestion is classified as style, never as an error', async t => {
  const { body } = await run(t, [stage1, good]);
  const style = body.result.improvements.find(item => item.type === 'style');
  assert.ok(style);
  assert.equal(style.quote, 'The staff were friendly and welcomed us with a smile');
  assert.ok(style.suggestion.length > 0);
  assert.match(style.advice, /already say the staff were friendly/);
});

test('"errors" whose correction changes nothing are discarded, so correct wording is never criticised', async t => {
  const { body } = await run(t, [stage1, good]);
  assert.ok(!body.result.verifiedEvidence.some(item => item.kind === 'possible_error' && item.quote === 'The staff were friendly'));
  assert.equal(body.result.verifiedEvidence.filter(item => item.kind === 'possible_error').length, 1);
});

test('a model "error" that is really correct wording cannot be turned into an improvement', async t => {
  const onlyFalse = { ...stage1, errors:[stage1.errors[1]] };
  const { body } = await run(t, [onlyFalse, withGood({ improvements:[{ evidence:5, advice:'Fix this.', example:'x' }] })]);
  assert.equal(body.result.improvements.filter(item => item.type === 'error').length, 0);
});

test('strengths that praise ordinary wording as sophisticated, vivid or similar are dropped', async t => {
  for (const bad of ['You used sophisticated and vivid vocabulary here.', 'Your impressive word choice is excellent.']) {
    const mixed = withGood({ strengths:[{ evidence:4, advice:bad }, { evidence:2, advice:'You describe the service with a specific detail.' }] });
    const { body } = await run(t, [stage1, mixed]);
    assert.deepEqual(body.result.strengths.map(item => item.evidence), [2], bad);
  }
});

test('the model is limited to two strengths and two improvements', async t => {
  const { ai } = await run(t, [stage1, good]);
  const schema = ai[1].response_format.json_schema;
  assert.equal(schema.properties.strengths.maxItems, 2);
  assert.equal(schema.properties.improvements.maxItems, 2);
  const three = withGood({ improvements:[good.improvements[0], good.improvements[1], { evidence:4, advice:'Another point.', example:'' }] });
  const rejected = await run(t, [stage1, three]);
  assert.equal(rejected.res.status, 503); assert.equal(rejected.body.stage, 'assessment_model');
});

test('fewer than two weaknesses is accepted rather than invented', async t => {
  const one = withGood({ improvements:[good.improvements[0]] });
  assert.equal((await run(t, [stage1, one])).body.result.improvements.length, 1);
  const none = withGood({ improvements:[] });
  const { res, body } = await run(t, [stage1, none]);
  assert.equal(res.status, 200); assert.equal(body.result.improvements.length, 0);
});

test('a suggestion that repeats the original, drifts from its meaning, or carries unverified quotation marks is not shown as a correction', async t => {
  for (const example of ['the chips was cold', 'The restaurant is expensive and noisy', '']) {
    const { body } = await run(t, [stage1, withGood({ improvements:[{ evidence:5, advice:'Chips is plural so use were.', example }] })]);
    const item = body.result.improvements[0];
    assert.equal(item.suggestion, 'the chips were cold', 'falls back to the stage-1 correction: ' + JSON.stringify(example));
  }
  const quoted = await run(t, [stage1, withGood({ improvements:[{ evidence:2, advice:'Optional: develop it.', example:'The staff were friendly and "gave us free dessert" to everyone.' }] })]);
  assert.ok(!quoted.body.result.improvements[0].suggestion.includes('"'));
});

test('error corrections are the checked stage-1 correction; model examples cannot change an error or smuggle evidence numbers', async t => {
  for (const example of ['the chips were hot, see evidence 2', 'the chips were cold']) {
    const { body } = await run(t, [stage1, withGood({ improvements:[{ evidence:5, advice:'Chips is plural.', example }] })]);
    assert.equal(body.result.improvements[0].suggestion, 'the chips were cold');
  }
  // an optional style suggestion with an unusable example (evidence reference, drift from the student's meaning) is omitted, not shown without help
  const style = await run(t, [stage1, withGood({ improvements:[{ evidence:2, advice:'Optional.', example:'The staff were friendly, see evidence 3 and 7 for more.' }] })]);
  assert.equal(style.body.result.improvements.length, 0);
  const drift = await run(t, [stage1, withGood({ improvements:[{ evidence:2, advice:'Optional.', example:'The waiters were rude and slow.' }] })]);
  assert.equal(drift.body.result.improvements.length, 0);
});

test('capitalisation, spelling and punctuation corrections are kept as errors', async t => {
  const small = { taskType:'review', task, response:'Last saturday we recieve the food and i was happy. Dear Sir' + ' and madam.', privacyConfirmed:true };
  const ev = { requirements:[], features:[{ label:'x', quote:'we recieve the food' }], errors:[
    { quote:'we recieve the food', correction:'we receive the food', explanation:'The word is spelt receive, with e before i only after c in the other order.' },
    { quote:'and i was happy', correction:'and I was happy', explanation:'The pronoun I is always a capital letter.' }] };
  const { body } = await run(t, [ev, withGood({ strengths:[], improvements:[{ evidence:2, advice:'Spell it receive.', example:'' }, { evidence:3, advice:'The word I is always a capital I.', example:'' }] })], small);
  assert.deepEqual(body.result.improvements.map(i => i.suggestion), ['we receive the food', 'and I was happy']);
});

test('a legitimate grammar term or a word in the cited quotation is not treated as hype, and a quote already flagged as an error is not praised', async t => {
  const ok = await run(t, [stage1, withGood({ strengths:[{ evidence:4, advice:'You use the present perfect well.' }, { evidence:5, advice:'You wrote this.' }], improvements:[] })]);
  assert.deepEqual(ok.body.result.strengths.map(i => i.evidence), [4]);
});

test('a style suggestion with no usable example is omitted because it adds little', async t => {
  const { body } = await run(t, [stage1, withGood({ improvements:[{ evidence:2, advice:'Optional: you could add what the staff did.', example:'The staff were friendly and welcomed us with a smile' }] })]);
  assert.equal(body.result.improvements.length, 0);
});

test('quotations, marks, evidence checks and experimental labelling are unchanged', async t => {
  const { body } = await run(t, [stage1, good]);
  const r = body.result;
  assert.equal(r.totalMark, 10); assert.equal(r.experimental, true); assert.match(r.warning, /Experimental/);
  for (const item of [...r.strengths, ...r.improvements]) assert.ok(response.includes(item.quote), item.quote);
  assert.equal(body.stages, 2);
  assert.deepEqual(Object.keys(body.checks).sort(), ['evidenceProposed','evidenceReferencesResolved','evidenceVerified','feedbackLinked','feedbackProposed','textQuotesNeutralised']);
  assert.ok(!JSON.stringify(body.checks).includes('chips'));
});

test('the Cambridge band text and score rules are untouched and the feedback rules are in the prompt', async t => {
  const source = readFileSync(new URL('./staff-assessment.js', import.meta.url), 'utf8');
  for (const band of ['Content 5–6: fulfils task, consistently relevant and appropriate style/purpose/audience, well-developed ideas.',
    'Content 3–4: generally fulfils task, relevant and appropriate, generally developed.',
    'Content 1–2: partial fulfilment/relevance, inconsistent style or audience awareness, limited development. 0: no creditable content.',
    'Language 7–9: wide appropriate vocabulary/structures, high accuracy, effective organisation/cohesion; occasional errors do not impede communication.',
    'Language 4–6: some variety, generally accurate, reasonably organised, errors do not generally impede communication.',
    'Language 1–3: limited range/organisation, errors may impede communication. 0: no creditable language.',
    '120–160 words is the task target, not an automatic deduction or cap.']) assert.ok(source.includes(band), band);
  const { ai } = await run(t, [stage1, good]);
  const prompt = ai[1].messages?.[0]?.content ?? JSON.stringify(ai[1]);
  for (const rule of [/at most 2/i, /fewer, or none/i, /optional/i, /already/i, /you.*your/i, /writing target|next piece of writing/i, /sophisticated/i, /keeps the student's meaning/i, /not a mistake|never call it a mistake/i]) assert.match(prompt, rule);
  assert.ok(!/Bella|chips/i.test(source), 'no response-specific feedback may be hard-coded');
});

test('the stage 2 schema only uses keywords already proven on the live model', async t => {
  const { ai } = await run(t, [stage1, good]);
  const allowed = new Set(['type', 'properties', 'required', 'items', 'maxItems', 'maxLength', 'minimum', 'maximum']);
  const walk = (node, path) => {
    if (Array.isArray(node)) return node.forEach(value => walk(value, path));
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      if (key === 'properties') Object.values(value).forEach(child => walk(child, path + '.' + key)); // property NAMES are not keywords
      else { assert.ok(allowed.has(key), path + '.' + key); walk(value, path + '.' + key); }
    }
  };
  walk(ai[1].response_format.json_schema, 'schema');
});

test('the Hub view labels errors and optional style suggestions and shows one writing target', () => {
  const root = { innerHTML:'' };
  renderAssessmentResult(root, { contentMark:4, languageMark:6, totalMark:10, contentReason:'c', languageReason:'l', nextStep:'Develop one opinion with a reason and a detail.',
    strengths:[{ quote:'creamy and tasty', advice:'You describe the food clearly.' }],
    improvements:[{ quote:'the chips was cold', advice:'Chips is plural.', type:'error', suggestion:'the chips were cold' },
      { quote:'creamy and tasty', advice:'Optional.', type:'style', suggestion:'<b>x</b>' }], warning:'Experimental.' });
  assert.match(root.innerHTML, /Language error/); assert.match(root.innerHTML, /Correction/);
  assert.match(root.innerHTML, /Optional style suggestion/); assert.match(root.innerHTML, /Example revision/);
  assert.match(root.innerHTML, /Your writing target/); assert.ok(!root.innerHTML.includes('<b>x</b>'));
});

// ---- refinement round: never invent a weakness ----
const kitchenError = { quote:'the kitchen should serve hot food', correction:'they should serve hot food' };
const withKitchen = explanation => ({ ...stage1, errors:[...stage1.errors, { ...kitchenError, explanation }] }); // catalogue: 5 chips, 6 staff-friendly(false error dropped) -> kitchen is id 6
const kitchenIt = body => body.result.improvements.filter(item => item.quote === kitchenError.quote);

for (const explanation of ['Pronoun reference is clearer with they.', 'The word kitchen is a noun, so a pronoun must be used.', 'They is needed here because kitchen is repeated.']) {
  test('a false error on "the kitchen should serve hot food" is never shown, whatever Stage 1 claims: ' + explanation, async t => {
    const stageTwo = withGood({ improvements:[
      { evidence:5, advice:'Chips is plural, so the verb must be were, not was.', example:'' },
      { evidence:6, advice:'This is a language error. Use they should serve hot food.', example:'they should serve hot food' }] });
    const { res, body } = await run(t, [withKitchen(explanation), stageTwo]);
    assert.equal(res.status, 200);
    assert.equal(kitchenIt(body).length, 0, 'acceptable wording must not appear as an improvement');
    assert.deepEqual(body.result.improvements.map(item => item.quote), ['the chips was cold']);
    assert.ok(!body.result.improvements.some(item => /pronoun|they should/i.test(item.advice + (item.suggestion ?? ''))));
    assert.equal(body.result.contentMark, 4); assert.equal(body.result.languageMark, 6); // marks are untouched by having one improvement
    // it stays visible to the teacher, never to the student
    assert.ok(body.result.quotedErrorCandidatesRequireTeacherReview.some(item => item.quote === kitchenError.quote));
  });
}

test('one genuine improvement is returned rather than a second, misleading one', async t => {
  const { body } = await run(t, [withKitchen('Pronoun reference is clearer.'), withGood({ improvements:[good.improvements[0], { evidence:6, advice:'Use they.', example:'they should serve hot food' }] })]);
  assert.equal(body.result.improvements.length, 1); assert.equal(body.result.improvements[0].type, 'error');
});

test('an error is explained by the Worker as a plain learning point, whatever the model wrote', async t => {
  for (const advice of ['There is a grammar error in subject–verb agreement.', 'You could prefer were here; it might sound better.', 'x']) {
    const { body } = await run(t, [stage1, withGood({ improvements:[{ evidence:5, advice, example:'' }] })]);
    assert.equal(body.result.improvements[0].advice, 'Chips is plural, so use were, not was.');
    assert.equal(body.result.improvements[0].suggestion, 'the chips were cold');
  }
});

test('strengths cannot claim whole-text organisation or inflate ordinary vocabulary', async t => {
  for (const bad of ['Your review is well-organised, starting with an introduction and ending with a recommendation.', 'You use descriptive vocabulary to show the food.', 'You use rich language throughout.']) {
    const { body } = await run(t, [stage1, withGood({ strengths:[{ evidence:1, advice:bad }, { evidence:3, advice:'You give a reason with because, so your opinion is supported.' }] })]);
    assert.deepEqual(body.result.strengths.map(item => item.evidence), [3], bad);
  }
});

test('a response with no genuine weakness gets no invented improvement and keeps its marks', async t => {
  const cats = { taskType:'essay', task:'Write an essay about whether cats make good pets. Give reasons and examples. Write 120–160 words.', privacyConfirmed:true,
    response:'Cats make good pets because they are independent animals. They need less attention than dogs, which suits busy families. For example, a cat can stay at home while its owner works.' };
  const ev = { requirements:[{ taskQuote:'Give reasons and examples', quote:'For example, a cat can stay at home while its owner works' }], features:[{ label:'reason', quote:'because they are independent animals' }],
    errors:[{ quote:'than dogs', correction:'than the dogs', explanation:'The article the is needed.' }, { quote:'its owner works', correction:'their owner works', explanation:'Their is clearer.' }] };
  const { res, body } = await run(t, [ev, { ...good, contentMark:5, languageMark:8, strengths:[{ evidence:2, advice:'You give a reason with because, so your claim is supported.' }],
    improvements:[{ evidence:3, advice:'The article the is needed before dogs.', example:'' }, { evidence:4, advice:'Their is clearer.', example:'' }] }], cats);
  assert.equal(res.status, 200); assert.equal(body.result.improvements.length, 0);
  assert.equal(body.result.totalMark, 13); assert.equal(body.result.strengths.length, 1);
});

test('a contrasting response: a real article error is corrected and a wrong-direction "correction" is refused', async t => {
  const museum = { taskType:'review', task, privacyConfirmed:true, response:'I visited the science museum on Friday. It was a interesting place. The guide explained how rockets work. I learned a lot about space.' };
  const ev = { requirements:[], features:[{ label:'detail', quote:'The guide explained how rockets work' }], errors:[
    { quote:'a interesting place', correction:'an interesting place', explanation:'Interesting starts with a vowel sound, so use an, not a.' },
    { quote:'how rockets work', correction:'how rockets works', explanation:'Works agrees with rockets.' },
    { quote:'I learned a lot', correction:'I learnt a lot', explanation:'Learnt is the correct past tense.' }] };
  const stageTwo = { ...good, strengths:[{ evidence:1, advice:'You explain what the guide showed, so the reader learns something specific.' }],
    improvements:[{ evidence:2, advice:'Interesting starts with a vowel sound, so use an, not a.', example:'' }, { evidence:3, advice:'Works agrees with rockets.', example:'' }] };
  const { body } = await run(t, [ev, stageTwo], museum);
  assert.deepEqual(body.result.improvements.map(item => [item.quote, item.suggestion]), [['a interesting place', 'an interesting place']]);
});

test('the prompts demand error-only-if-demonstrable, plain explanations, evidence-bound praise and a specific, non-redundant target', async t => {
  const { ai } = await run(t, [stage1, good]);
  const first = JSON.stringify(ai[0]), second = JSON.stringify(ai[1]);
  assert.match(first, /grammatically acceptable is never an error/); assert.match(first, /state that rule in plain words/);
  for (const rule of [/Cite a possible error only when the wording is definitely incorrect/, /name the wrong word and the right word/, /without grammar jargon/, /cannot prove that the whole response is well organised/,
    /least developed/, /Never ask for something the response already contains/, /leave that suggestion out altogether/]) assert.match(second, rule);
});

test('a style item cannot smuggle in an error claim or sit on a quote Stage 1 also called an error', async t => {
  const ev = { requirements:[], features:[{ label:'topic', quote:'the kitchen should serve hot food' }], errors:[{ quote:'the kitchen should serve hot food', correction:'they should serve hot food', explanation:'Pronoun.' }] };
  const stageTwo = withGood({ strengths:[], improvements:[{ evidence:1, advice:'This is optional.', example:'the kitchen should serve hot food quickly' }] });
  const { res, body } = await run(t, [ev, stageTwo]);
  assert.equal(res.status, 503); assert.equal(body.detail, 'no_feedback_linked_to_verified_evidence');
  const mistake = await run(t, [stage1, withGood({ strengths:[], improvements:[{ evidence:2, advice:'This is a grammar mistake in your sentence.', example:'The staff were friendly: our waiter smiled.' }] })]);
  assert.equal(mistake.res.status, 503);
});

test('the writing target cannot be built round an error the Worker could not demonstrate', async t => {
  const { res, body } = await run(t, [withKitchen('Pronoun reference is clearer.'), withGood({ nextStep:'Fix the pronoun in the kitchen should serve hot food by using they.' })]);
  assert.equal(res.status, 503); assert.equal(body.detail, 'target_uses_unconfirmed_error');
  const fine = await run(t, [withKitchen('Pronoun reference is clearer.'), withGood({ nextStep:'Give your opinion about the food a specific reason.' })]);
  assert.equal(fine.res.status, 200);
});
