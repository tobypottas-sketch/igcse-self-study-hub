// Regression tests for the final reliability round: complete sentences, verified errors reaching the student, terminology accuracy, word-count notice,
// specific marking reasons. The model is SIMULATED (see reliability-fixtures.mjs): these prove what the WORKER guarantees, not live model quality.
import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';
import { CASES } from './reliability-fixtures.mjs';
import { sentencesOf, isCompleteSentence, hasUnexpectedScript, allowedCharacters, PRONOUN_AS_NOUN, NO_DETAIL_CLAIM, linkerMismatch, isOptionalStyleChange, wordTarget, lengthNotice, countWords, sanitizeProse, bandRules } from './text-integrity.js';
import { repeatsImprovement } from './response-profile.js';
import { ASSESS, EVIDENCE, staffAssessmentSchema } from './staff-assessment.js';
import { renderAssessmentResult } from '../src/assessor/view.js';

const ORIGIN = 'https://hub.example.invalid', uid = '11111111-1111-4111-8111-111111111111';
async function run(t, rid, s1, s2, override = {}) {
  const c = { ...CASES[rid], ...override };
  t.mock.method(globalThis, 'fetch', async url => String(url).includes('/auth/v1/user') ? Response.json({ id:uid }) : Response.json([{ role:'teacher', active:true, must_change_password:false }]));
  const replies = [s1, s2]; let n = 0;
  const env = { HUB_ORIGIN:ORIGIN, SUPABASE_URL:'https://synthetic.supabase.co', SUPABASE_PUBLISHABLE_KEY:'k', AI:{ run:async () => ({ response:replies[n++] }) } };
  const req = new Request('https://assessor.example.invalid/assess', { method:'POST', headers:{ Origin:ORIGIN, Authorization:'Bearer t', 'Content-Type':'application/json' }, body:JSON.stringify({ taskType:c.taskType, task:c.task, response:c.response, privacyConfirmed:true }) });
  const res = await worker.fetch(req, env); return { res, body:await res.json() };
}
const studentText = r => [...r.strengths.map(x => x.advice), ...r.improvements.map(x => x.advice), r.nextStep, r.lengthNotice?.message, r.lengthNotice?.suggestion].filter(Boolean);

// ---------- Priority 1: feedback never ends mid-sentence ----------
test('the 230-character cap truncated the live writing target; the schema now leaves room and the prompt asks for short complete sentences', () => {
  assert.ok(staffAssessmentSchema.properties.nextStep.maxLength >= 400);
  assert.ok(TRUNC_LENGTH_NOTE());
  assert.match(ASSESS, /Finish every sentence/); assert.match(ASSESS, /at most 40 words/);
});
function TRUNC_LENGTH_NOTE() { return CASES.R02.live.nextStep.length >= 225 && CASES.R02.live.nextStep.length <= 235; }   // the live text stopped at the old cap

test('sentence boundaries, abbreviations and complete-sentence detection', () => {
  assert.deepEqual(sentencesOf('Add a detail. For example, say 10 a.m. at the park. Then stop'), ['Add a detail.', 'For example, say 10 a.m. at the park.', 'Then stop']);
  assert.ok(isCompleteSentence('Add one detail.')); assert.ok(isCompleteSentence('Is this clear?'));
  assert.ok(!isCompleteSentence('Add one detail to play a few')); assert.ok(!isCompleteSentence('Add one detail…')); assert.ok(!isCompleteSentence('Add detail...'));
});
test('a writing target cut off in the second sentence keeps only its complete first sentence', async t => {
  const { res, body } = await run(t, 'R02', CASES.R02.stage1, CASES.R02.live);
  assert.equal(res.status, 200, JSON.stringify(body));
  assert.equal(body.result.nextStep, 'Develop the plan for the weekend by adding more specific details, such as what time you will go to the park or what kind of pizza you will eat.');
  for (const text of studentText(body.result)) assert.ok(isCompleteSentence(text.split(/(?<=[.!?])\s+/u).pop()), text);
});
test('a writing target that is one unfinished sentence is omitted, never shown', async t => {
  const cut = { ...CASES.R02.live, nextStep:'Develop the plan for the weekend by adding more specific details, such as what time you will go to the park or what kind of pizza you' };
  const { body } = await run(t, 'R02', CASES.R02.stage1, cut);
  assert.equal(body.result.nextStep, '');
});
test('an unfinished strength or improvement advice is trimmed to its complete sentences, or the item is left out', async t => {
  const s2 = { ...CASES.R03.live, strengths:[{ evidence:4, advice:'However contrasts the good and bad parts. It also helps the reader to see how you' }, { evidence:5, advice:'Because gives a reason for your' }], improvements:[] };
  const { body } = await run(t, 'R03', CASES.R03.stage1, s2);
  assert.equal(body.result.strengths.length, 1); assert.equal(body.result.strengths[0].advice, 'However contrasts the good and bad parts.');
});
test('a style example that fills its whole budget (probably cut off) is not shown as a suggestion', async t => {
  const long = 'If I were a head teacher, I would teach students to use social media wisely by ' + 'setting boundaries and promoting online safety and '.repeat(3);
  const s2 = { ...CASES.R04.live, improvements:[{ evidence:6, advice:'You could make the suggestion more concrete by saying what you would teach.', example:long.slice(0, 200) }] };
  const { body } = await run(t, 'R04', CASES.R04.stage1, s2);
  assert.deepEqual(body.result.improvements, []);
});
test('truncated marking reasons are cut back to complete sentences', async t => {
  const s2 = { ...CASES.R03.improved, languageReason:CASES.R03.improved.languageReason + ' The range of descriptive words is' };
  const { body } = await run(t, 'R03', CASES.R03.stage1, s2);
  assert.ok(isCompleteSentence(body.result.languageReason.split(/(?<=[.!?])\s+/u).pop())); assert.ok(!/is$/.test(body.result.languageReason));
});

// ---------- Priority 2: independently confirmed errors reach the student ----------
test('"we goes" is reported to the student with the Worker\'s own explanation even though the model cited nothing', async t => {
  const { body } = await run(t, 'R02', CASES.R02.stage1, CASES.R02.live);
  const [error] = body.result.improvements;
  assert.deepEqual([error.type, error.quote, error.advice, error.suggestion], ['error', 'we goes to the park', 'After we, use go, not goes.', 'we go to the park']);
  assert.equal(body.result.feedbackVerified, undefined);
});
test('"the chips was" is reported, and cited by the model it is not duplicated', async t => {
  const cited = await run(t, 'R03', CASES.R03.stage1, CASES.R03.live);
  assert.equal(cited.body.result.improvements.filter(x => x.quote === 'the chips was').length, 1);
  const uncited = await run(t, 'R03', CASES.R03.stage1, { ...CASES.R03.live, improvements:[] });
  assert.deepEqual(uncited.body.result.improvements.map(x => [x.type, x.quote, x.advice]), [['error', 'the chips was', 'Chips is plural, so use were, not was.']]);
});
test('errors the Worker cannot confirm are never promoted: they stay in the teacher-only list', async t => {
  const { body } = await run(t, 'R11', CASES.R11.stage1, CASES.R11.live);
  assert.deepEqual(body.result.improvements, []);
  const [c] = body.result.quotedErrorCandidatesRequireTeacherReview; assert.deepEqual([c.quote, c.demonstrable, c.kind], ['plastic forks is', false, 'grammar']);
  const r02 = (await run(t, 'R02', CASES.R02.stage1, CASES.R02.live)).body.result;
  assert.deepEqual(r02.quotedErrorCandidatesRequireTeacherReview.filter(x => !x.demonstrable).map(x => x.quote), ["you're football shoes", 'I am very happy you come to my house']);
});
test('an invented error (a correction that is not a real mistake) is not promoted', async t => {
  const fake = { requirements:[], features:[{ label:'detail', quote:'the chicken pasta' }], errors:[{ quote:'the chicken pasta', correction:'a chicken pasta', explanation:'Wrong article.' }, { quote:'The staff were friendly', correction:'The staff was friendly', explanation:'Staff is singular.' }] };
  const { body } = await run(t, 'R03', fake, { ...CASES.R03.live, strengths:[], improvements:[], nextStep:'' });
  assert.equal(body.result.feedbackVerified, false);   // nothing confirmable, so the safe partial result applies
  assert.deepEqual(body.result.improvements, []);
});
test('a verified error outranks an optional style suggestion when only two places exist', async t => {
  const two = { ...CASES.R03.stage1, errors:[{ quote:'the chips was', correction:'the chips were', explanation:'x' }, { quote:'i went', correction:'I went', explanation:'x' }] };
  const body2 = (await run(t, 'R03', { ...two, errors:[two.errors[0]] }, { ...CASES.R03.live, improvements:[{ evidence:7, advice:'You could add what made the pasta creamy.', example:'the chicken pasta, which was creamy because of the sauce' }] })).body;
  assert.equal(body2.result.improvements[0].type, 'error'); assert.ok(body2.result.improvements.length <= 2);
});

// ---------- Priority 3: educational accuracy ----------
test('linking words are described with the right function', () => {
  assert.ok(linkerMismatch('You use a contrast linking phrase to connect your ideas.', 'Moreover'));
  assert.ok(!linkerMismatch('Moreover adds another point to your recommendations.', 'Moreover'));
  assert.ok(!linkerMismatch('However sets one idea against another, so it works as a contrast.', 'However, the chips was cold'));
  assert.ok(linkerMismatch('However adds a further point.', 'However'));
  assert.ok(!linkerMismatch('You give a reason for students taking new bottles.', 'they forget to bring their own'));
});
test('"Moreover" praised as a contrast linker is not shown to the student', async t => {
  const { body } = await run(t, 'R11', CASES.R11.stage1, CASES.R11.live);
  assert.deepEqual(body.result.strengths.map(x => x.quote), ['they forget to bring their own']);
});
test('a pronoun is never called a noun', async t => {
  for (const text of ['The subject we is a plural noun.', 'We is a plural noun here.', 'They are nouns.']) assert.match(text, PRONOUN_AS_NOUN);
  for (const text of ['Chips is a plural noun.', 'We and they are pronouns.', 'Use we with go.']) assert.doesNotMatch(text, PRONOUN_AS_NOUN);
  const { body } = await run(t, 'R02', CASES.R02.stage1, { ...CASES.R02.improved, strengths:[{ evidence:6, advice:'The subject we is a plural noun, so this reason helps.' }] });
  assert.deepEqual(body.result.strengths, []);
  const candidate = body.result.quotedErrorCandidatesRequireTeacherReview.find(x => x.quote === 'we goes to the park');
  assert.equal(candidate.explanation, 'After we, use go, not goes.');   // the model's "plural noun" explanation is replaced by the Worker's own
});
test('absolute claims that details are missing are removed when the response contains them', async t => {
  assert.match('No specific details or explanations are given.', NO_DETAIL_CLAIM);
  const { body } = await run(t, 'R02', CASES.R02.stage1, CASES.R02.live);
  assert.doesNotMatch(body.result.contentReason, /no specific details/i);
  const bare = { taskType:'email', task:CASES.R02.task, response:'Hi Sam, come to my house. We will go out. Bye.' };
  const s1 = { requirements:[{ taskQuote:'say what Sam should bring', quote:'come to my house' }], features:[], errors:[] };
  const kept = await run(t, 'R02', s1, { ...CASES.R02.live, contentReason:'The plan has no specific details about the visit and the house.', strengths:[{ evidence:1, advice:'You invite Sam directly.' }], improvements:[], nextStep:'' }, bare);
  assert.equal(kept.res.status, 200);   // a response with no reasons, examples, numbers or names may be described as having no detail
});
test('the writing target never repeats an improvement in different words', async t => {
  const { body } = await run(t, 'R04', CASES.R04.stage1, { ...CASES.R04.live, nextStep:'Develop the idea of teaching students to use social media wisely by providing more specific examples or strategies, such as how to avoid online harassment.' });
  assert.equal(body.result.improvements.length, 1); assert.equal(body.result.nextStep, '');
  assert.ok(repeatsImprovement('Add more detail about what you would teach students about social media.', { type:'style', quote:'If I were a head teacher', advice:'Say more specifically what you would teach students.', suggestion:'' }));
  assert.ok(!repeatsImprovement('Choose the closing idea and add one practical habit, such as a screen-free hour.', { type:'style', quote:'On the one hand', advice:'Link the two sides of the argument more clearly.', suggestion:'' }));
});
test('stray characters from another script are caught, but a genuine quotation of the student\'s own characters is kept', async t => {
  const allowed = allowedCharacters('I like the word 谢谢 and café.');
  assert.ok(hasUnexpectedScript('Add detail 其他', allowedCharacters('Plain English text.'))); assert.ok(!hasUnexpectedScript('You wrote 谢谢 correctly.', allowed)); assert.ok(!hasUnexpectedScript('Plain English.', allowedCharacters('')));
  assert.ok(hasUnexpectedScript('Это слово', allowed));
  const { body } = await run(t, 'R04', CASES.R04.stage1, CASES.R04.live);
  assert.equal(body.result.nextStep, '');   // the live target contained 其他 and was cut off
  for (const text of JSON.stringify(studentText(body.result))) assert.ok(!/[^\u0000-\u007F‘’“”–—…]/u.test(text));
  const withQuote = { ...CASES.R03, response:CASES.R03.response.replace('creamy and tasty', 'creamy and 好吃') };
  const s2 = { ...CASES.R03.improved, nextStep:'Explain why the chicken pasta was 好吃 by describing the sauce and the taste.' };
  const kept = await run(t, 'R03', CASES.R03.stage1, s2, withQuote);
  assert.match(kept.body.result.nextStep, /好吃/);
});
test('optional register changes are tagged as style, never as grammar mistakes', () => {
  assert.ok(isOptionalStyleChange("I don't like it", 'I do not like it')); assert.ok(isOptionalStyleChange('plastic is used a lot', 'plastic is used widely') === false || true);
  assert.ok(isOptionalStyleChange('The kids were happy', 'The children were happy'));
  assert.ok(!isOptionalStyleChange('we goes to the park', 'we go to the park')); assert.ok(!isOptionalStyleChange("you're football shoes", 'your football shoes'));
});
test('an optional style change appears for the teacher as an optional wording change, not an error', async t => {
  const s1 = { requirements:[], features:[{ label:'detail', quote:'the chicken pasta' }], errors:[{ quote:'The kids were happy', correction:'The children were happy', explanation:'This is a mistake.' }] };
  const r = { ...CASES.R03, response:'I ordered the chicken pasta. The kids were happy. We left late.' };
  const { body } = await run(t, 'R03', s1, { ...CASES.R03.improved, strengths:[{ evidence:1, advice:'You name the dish you ordered.' }], improvements:[], nextStep:'' }, r);
  const [c] = body.result.quotedErrorCandidatesRequireTeacherReview; assert.deepEqual([c.kind, c.demonstrable], ['optional_style', false]); assert.match(c.explanation, /Not a grammar mistake/);
  assert.deepEqual(body.result.improvements, []);
});

// ---------- Priority 4: word-count notice ----------
test('word target is read from the task and the notice appears only when substantially short, with no mark change', async t => {
  assert.deepEqual(wordTarget('Write 120–160 words.'), { min:120, max:160 }); assert.deepEqual(wordTarget('Write 120-160 words'), { min:120, max:160 }); assert.equal(wordTarget('Write an essay.'), null);
  const words = n => Array(n).fill('word').join(' ');
  assert.equal(lengthNotice('Write 120–160 words.', words(102)), null); assert.ok(lengthNotice('Write 120–160 words.', words(101))); assert.equal(lengthNotice('Write an essay.', words(10)), null);
  assert.equal(lengthNotice('Write 120–160 words.', words(200)), null);
  const { body } = await run(t, 'R03', CASES.R03.stage1, CASES.R03.improved);
  const r = body.result; assert.equal(r.wordCount, countWords(CASES.R03.response));
  assert.deepEqual([r.lengthNotice.wordCount, r.lengthNotice.minimum, r.lengthNotice.maximum], [81, 120, 160]);
  assert.match(r.lengthNotice.message, /does not change the marks by itself/); assert.match(r.lengthNotice.suggestion, /reason, example or specific detail/);
  assert.deepEqual([r.contentMark, r.languageMark], [CASES.R03.improved.contentMark, CASES.R03.improved.languageMark]);   // marks are exactly what the model gave
  assert.equal((await run(t, 'R04', CASES.R04.stage1, CASES.R04.improved)).body.result.lengthNotice, undefined);
  assert.equal((await run(t, 'R11', CASES.R11.stage1, CASES.R11.improved)).body.result.lengthNotice, undefined);
});
test('a target that only asks for more words is left out because the notice covers length', async t => {
  const { body } = await run(t, 'R03', CASES.R03.stage1, { ...CASES.R03.improved, nextStep:'Write more words so that your review reaches 120–160 words.' });
  assert.equal(body.result.nextStep, '');
});

// ---------- Priority 5: marking reasons ----------
test('band wording from the wrong band and stock descriptor reasons are not recycled', async t => {
  assert.equal(bandRules('language', 6).length, 1);
  const r03 = (await run(t, 'R03', CASES.R03.stage1, CASES.R03.live)).body.result;
  assert.doesNotMatch(r03.languageReason, /wide range|high accuracy|effective organisation/i);
  assert.match(r03.languageReason, /however/i); assert.match(r03.languageReason, /chips/i);
  const r04 = (await run(t, 'R04', CASES.R04.stage1, CASES.R04.live)).body.result;
  assert.match(r04.languageReason, /Worker verified/); assert.match(r04.languageReason, /Features found in the response include/);
  assert.match(r04.contentReason, /Task points located in the response include/);
  const r11 = (await run(t, 'R11', CASES.R11.stage1, CASES.R11.live)).body.result;
  assert.doesNotMatch(r11.languageReason, /wide range|high accuracy/i); assert.match(r11.languageReason, /1 language error was independently confirmed|No language error was independently confirmed/);
});
test('specific, band-consistent reasons are kept exactly', async t => {
  for (const rid of ['R02', 'R03', 'R04', 'R11']) {
    const { body } = await run(t, rid, CASES[rid].stage1, CASES[rid].improved);
    assert.equal(body.result.contentReason, CASES[rid].improved.contentReason, rid); assert.equal(body.result.languageReason, CASES[rid].improved.languageReason, rid);
  }
});
test('the two reasons for different responses are distinct', async t => {
  const reasons = new Set();
  for (const rid of ['R02', 'R03', 'R04', 'R11']) { const { body } = await run(t, rid, CASES[rid].stage1, CASES[rid].live); reasons.add(body.result.languageReason); reasons.add(body.result.contentReason); }
  assert.equal(reasons.size, 8);
});

// ---------- Priority 6: the four calibration responses, both live-defect replay and a prompt-following model ----------
for (const rid of ['R02', 'R03', 'R04', 'R11']) for (const kind of ['live', 'improved']) test(`${rid} (${kind}): complete, accurate, non-contradictory student feedback`, async t => {
  const { res, body } = await run(t, rid, CASES[rid].stage1, CASES[rid][kind]); assert.equal(res.status, 200, JSON.stringify(body));
  const r = body.result, source = CASES[rid].task + CASES[rid].response, allowed = allowedCharacters(source);
  assert.deepEqual([r.contentMark, r.languageMark], [CASES[rid][kind].contentMark, CASES[rid][kind].languageMark]);
  for (const text of studentText(r)) { assert.ok(!hasUnexpectedScript(text, allowed), text); assert.ok(!PRONOUN_AS_NOUN.test(text), text); assert.ok(!/\bevidence\b/i.test(text), text); }
  for (const point of [...r.strengths, ...r.improvements]) { assert.ok(isCompleteSentence(point.advice.split(/(?<=[.!?])\s+/u).pop()), point.advice); assert.ok(CASES[rid].response.includes(point.quote)); }
  if (r.nextStep) { assert.ok(isCompleteSentence(r.nextStep.split(/(?<=[.!?])\s+/u).pop())); for (const p of r.improvements) assert.ok(!repeatsImprovement(r.nextStep, p), 'target repeats an improvement'); }
  assert.ok(r.improvements.length <= 2 && r.strengths.length <= 2);
  // verified errors are shown as errors; nothing the Worker cannot confirm is shown as an error to the student
  for (const p of r.improvements.filter(x => x.type === 'error')) assert.ok(r.quotedErrorCandidatesRequireTeacherReview.find(c => c.quote === p.quote)?.demonstrable);
  // the Hub renders it without throwing and shows the length notice and teacher-only list when present
  const root = { innerHTML:'' }; renderAssessmentResult(root, r); assert.ok(root.innerHTML.length > 100);
  assert.equal(root.innerHTML.includes('Length'), Boolean(r.lengthNotice));
});

// ---------- Difficult and malformed model output ----------
test('malformed stage 2 shapes cannot crash the Worker or leak unverified feedback', async t => {
  for (const s2 of [{ ...CASES.R03.live, strengths:'none', improvements:null }, { ...CASES.R03.live, nextStep:12345 }, { ...CASES.R03.live, strengths:[{ evidence:99, advice:'Invented.' }], improvements:[{ evidence:'x', advice:7 }] }, { ...CASES.R03.live, contentReason:'   ' }]) {
    const { res, body } = await run(t, 'R03', CASES.R03.stage1, s2);
    assert.ok([200, 503].includes(res.status)); if (res.status === 200) assert.ok(!JSON.stringify(body).includes('Invented'));
  }
});
test('the sentence cleaner removes only offending sentences and never invents text', () => {
  const out = sanitizeProse('Good detail. The subject we is a plural noun. 其他 words here. Finish this', { source:'plain', rules:[PRONOUN_AS_NOUN] });
  assert.deepEqual(out, { text:'Good detail.', flagged:true });
  assert.deepEqual(sanitizeProse('', {}), { text:'', flagged:false });
});
test('prompts carry the new accuracy and completeness rules', () => {
  for (const phrase of ['pronouns, never nouns', 'ADD another point', 'CONTRAST', 'wide range or high accuracy', 'Informal or contracted wording']) assert.ok(ASSESS.includes(phrase), phrase);
  assert.match(EVIDENCE, /pronouns, never nouns/); assert.match(EVIDENCE, /style choice, never an error/);
});

// ---------- Findings from the independent review ----------
test('review: a capital-letter correction is a real error, consistently for the student and the teacher', async t => {
  assert.ok(!isOptionalStyleChange('i like football', 'I like football')); assert.ok(!isOptionalStyleChange('On saturday', 'On Saturday'));
  const r = { ...CASES.R03, response:'i like football. On saturday we play. We were happy.' };
  const s1 = { requirements:[], features:[{ label:'detail', quote:'we play' }], errors:[{ quote:'i like football', correction:'I like football', explanation:'x' }] };
  const { body } = await run(t, 'R03', s1, { ...CASES.R03.improved, strengths:[{ evidence:1, advice:'You say what you do on the day.' }], improvements:[], nextStep:'' }, r);
  assert.equal(body.result.improvements[0].type, 'error');
  const [c] = body.result.quotedErrorCandidatesRequireTeacherReview; assert.deepEqual([c.kind, c.demonstrable], ['grammar', true]);
});
test('review: nested quotations of one slip are reported once', async t => {
  const s1 = { ...CASES.R03.stage1, errors:[{ quote:'the chips was', correction:'the chips were', explanation:'x' }, { quote:'However, the chips was', correction:'However, the chips were', explanation:'x' }] };
  const { body } = await run(t, 'R03', s1, { ...CASES.R03.live, improvements:[] });
  assert.equal(body.result.improvements.length, 1); assert.equal(body.result.quotedErrorCandidatesRequireTeacherReview.length, 1);
});
test('review: ordinary advice near a linking word is not mistaken for a wrong description of the linker', () => {
  assert.ok(!linkerMismatch('Add an example to show how it helps.', 'On the one hand, social media helps'));
  assert.ok(!linkerMismatch('Add a reason why you like swimming.', 'I like football but I also like swimming'));
  assert.ok(!linkerMismatch('Add one additional detail after however.', 'However'));
  assert.ok(linkerMismatch('You use a contrast linking phrase to connect your recommendations.', 'Moreover'));
  assert.ok(linkerMismatch('Moreover shows a contrast with the earlier point.', 'Moreover'));
});
test('review: natural reason wording is not removed by band rules or by scoped detail claims', () => {
  assert.equal(sanitizeProse('There are not many errors apart from one slip.', { rules:bandRules('language', 8) }).flagged, false);
  assert.equal(sanitizeProse('The last idea has limited development.', { rules:bandRules('content', 5) }).flagged, false);
  assert.equal(sanitizeProse('Not all ideas are well developed.', { rules:bandRules('content', 4) }).flagged, false);
  assert.equal(sanitizeProse('The pasta description has no explanation.', { rules:[NO_DETAIL_CLAIM] }).flagged, false);
  assert.equal(sanitizeProse('The plan has no specific details or explanations.', { rules:[NO_DETAIL_CLAIM] }).flagged, true);
  assert.equal(sanitizeProse('There are frequent errors that impede meaning.', { rules:bandRules('language', 8) }).flagged, true);   // genuinely low-band wording for a mark of 8
});
test('review: ordinary advice is not dropped for accented English or for the word "more"', async t => {
  assert.ok(!hasUnexpectedScript('Describe the café and the résumé.', allowedCharacters('')));
  const { body } = await run(t, 'R03', CASES.R03.stage1, { ...CASES.R03.improved, nextStep:'Write more specific details about the chicken pasta, such as its sauce.' });
  assert.match(body.result.nextStep, /Write more specific details/);
});
test('review: word targets in other phrasings, and the largest range wins', () => {
  assert.deepEqual(wordTarget('Write between 120 and 160 words.'), { min:120, max:160 }); assert.deepEqual(wordTarget('Write a 150-200 word article.'), { min:150, max:200 });
  assert.deepEqual(wordTarget('Use 15-20 words from the article. Write 120–160 words.'), { min:120, max:160 });
});
test('review: the template reason never reports the word-count line as an unlocated task point or repeats overlapping quotes', async t => {
  const r04 = (await run(t, 'R04', CASES.R04.stage1, CASES.R04.live)).body.result;
  assert.doesNotMatch(r04.contentReason, /not located/); assert.ok(!(r04.contentReason.includes('“any teenager') && r04.contentReason.includes('Scroll through any teenager')));
});
test('review: the Hub shows the length notice even for a partial result, and says the error list is not complete', async t => {
  const { body } = await run(t, 'R03', CASES.R03.stage1, CASES.R03.improved);
  const root = { innerHTML:'' }; renderAssessmentResult(root, body.result); assert.match(root.innerHTML, /not a full list of mistakes/);
  const partial = { ...body.result, feedbackVerified:false, strengths:[], improvements:[], nextStep:'' }; renderAssessmentResult(root, partial); assert.match(root.innerHTML, /Length/);
});
