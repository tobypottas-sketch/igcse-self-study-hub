// Unit 2 (Digital Life) formal check, through the existing Unit Check machinery. Fixtures only; no real student data.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import unit2Content from '../content/vocabulary/units/unit-02.js';
import { UNIT_CHECKS, unitCheckFor } from '../content/vocabulary/checks/index.js';
import unit1Check from '../content/vocabulary/checks/unit-01-check.js';
import unit2Check from '../content/vocabulary/checks/unit-02-check.js';
import unit4Check from '../content/vocabulary/checks/unit-04-check.js';
import unit6Check from '../content/vocabulary/checks/unit-06-check.js';
import { nextCheckState, scoreCheck, scoreSummary, feedbackForAttempt } from '../src/vocabulary/unit-check-model.js';
import { renderUnitCheckReview, renderUnitCheckScreen } from '../src/vocabulary/unit-check-view.js';

const repo = fileURLToPath(new URL('..', import.meta.url));
const check = unitCheckFor(2);
const forms = Object.values(check.forms); const all = forms.flatMap(f => f.questions); const mcqs = q => q.filter(x => x.type.endsWith('_mcq'));
const occurrences = new Map(unit2Content.occurrences.map(o => [o.occurrenceId, o])); const items = new Map(unit2Content.items.map(i => [i.vocabularyId, i]));
const itemOf = q => items.get(occurrences.get(q.target).vocabularyId);
const counts = qs => qs.reduce((m, q) => ({ ...m, [q.type]: (m[q.type] ?? 0) + 1 }), {});
const words = s => s.toLowerCase().match(/[a-z]+(?:-[a-z]+)*/g) ?? [];

test('1-5. Unit 2 has Forms A/B/C of ten questions (30 in all) with the agreed type mix and unique ids', () => {
  assert.equal(check.unitNumber, 2); assert.equal(check.maxAttempts, 3); assert.equal(check.title, 'Unit Vocabulary Check'); assert.deepEqual(Object.keys(check.forms), ['A', 'B', 'C']);
  for (const [id, f] of Object.entries(check.forms)) { assert.equal(f.id, id); assert.equal(f.questions.length, 10); }
  assert.equal(all.length, 30);
  assert.deepEqual(counts(check.forms.A.questions), { passage_mcq: 4, paraphrase_mcq: 2, word_form: 2, precision_mcq: 2 });
  assert.deepEqual(counts(check.forms.B.questions), { passage_mcq: 3, paraphrase_mcq: 3, word_form: 2, precision_mcq: 2 });
  assert.deepEqual(counts(check.forms.C.questions), { passage_mcq: 3, paraphrase_mcq: 2, word_form: 2, precision_mcq: 3 });
  assert.equal(new Set(all.map(q => q.id)).size, 30); assert.equal(new Set(forms.map(f => f.passage)).size, 3);
  for (const [id, f] of Object.entries(check.forms)) for (const q of f.questions) assert.ok(q.id.startsWith(id));
});

test('6-10. every MCQ has four distinct choices containing the answer once; every question has a diagnostic, an explanation and a target', () => {
  for (const q of all) {
    assert.ok(q.prompt && q.answer && q.diagnostic.trim() && q.explanation.trim() && q.target, q.id);
    if (q.type.endsWith('_mcq')) { assert.equal(q.choices.length, 4, q.id); assert.equal(new Set(q.choices.map(c => c.toLowerCase())).size, 4, q.id); assert.equal(q.choices.filter(c => c === q.answer).length, 1, q.id); }
    else { assert.equal(q.type, 'word_form'); assert.equal(q.choices, undefined); assert.ok(String(q.answer).trim().length > 2); }
    assert.equal(q.diagnostic.toLowerCase().includes(String(q.answer).toLowerCase()), false, `${q.id}: diagnostic must not reveal the answer`);
  }
});

test('passages: 90-150 words, gaps only as many as the form needs, every gap has a passage question', () => {
  const gapCount = { A: 4, B: 3, C: 3 };
  for (const [id, f] of Object.entries(check.forms)) {
    const n = f.passage.split(/\s+/).length; assert.ok(n >= 90 && n <= 150, `${id}: ${n} words`);
    assert.deepEqual([...f.passage.matchAll(/\[\[(\d)\]\]/g)].map(m => +m[1]), Array.from({ length: gapCount[id] }, (_, i) => i + 1), `${id}: gaps`);
    assert.equal(f.questions.filter(q => q.type === 'passage_mcq').length, gapCount[id]);
    f.questions.filter(q => q.type === 'passage_mcq').forEach((q, i) => assert.match(q.prompt, new RegExp(`gap ${i + 1}\\?$`)));
  }
});

test('source grounding: every target is a distinct real Unit 2 occurrence; word-form answers come from the tested item\'s word family; precision/passage answers are Unit 2 words or its stated collocations', () => {
  assert.equal(new Set(all.map(q => q.target)).size, 30, '30 distinct target words');
  for (const q of all) {
    const o = occurrences.get(q.target); assert.ok(o && o.unitNumber === 2 && /^u2_\d\d_/.test(q.target), q.id); const item = itemOf(q);
    assert.ok(q.explanation.toLowerCase().includes(item.term.toLowerCase()), `${q.id}: explanation names "${item.term}"`);
    const norm = s => s.toLowerCase();
    if (q.type === 'word_form') { const fam = [item.term, ...item.wordFamily].map(norm); assert.ok(fam.includes(norm(q.answer)), `${q.id}: "${q.answer}" is in the ${item.term} family ${fam}`); assert.match(q.prompt, /^Complete the sentence using the correct form of [a-z]+: “[^”]*______[^”]*”$/); }
    if (q.type === 'passage_mcq') assert.equal(norm(q.answer), norm(item.term), q.id);
    if (q.type === 'precision_mcq' && /most natural|best means/.test(q.prompt)) assert.ok(item.collocations.some(c => norm(q.answer).includes(norm(c.split(' ').at(-1))) || norm(c).includes(norm(q.answer))) || norm(q.answer).includes(norm(item.term)), `${q.id}: answer ${q.answer} relates to ${item.term} collocations`);
    if (q.type === 'paraphrase_mcq') assert.ok(q.prompt.toLowerCase().split(/[^a-z-]+/).some(w => w.startsWith(item.term.toLowerCase().slice(0, 5))) || item.wordFamily.some(w => q.prompt.toLowerCase().includes(w.slice(0, 5))) || q.choices.includes(q.answer) && words(q.answer).includes(item.term.toLowerCase()), q.id);
  }
  const unitTerms = new Set(unit2Content.items.map(i => i.term));
  for (const q of mcqs(all).filter(x => x.type === 'passage_mcq' || (x.type === 'paraphrase_mcq' && !/ /.test(x.answer)))) for (const c of q.choices) { const base = c.replace(/ies$/, 'y').replace(/s$/, ''); assert.ok([c, base].some(w => unitTerms.has(w) || unit2Content.items.some(i => i.wordFamily.includes(w))), `${q.id}: choice "${c}" is Unit 2 vocabulary`); }
});

test('question types are used as designed: paraphrases are not only one-word synonyms, typed prompts name the word and fix the part of speech, no obvious length giveaways', () => {
  for (const f of forms) assert.ok(mcqs(f.questions).filter(q => q.type === 'paraphrase_mcq').some(q => /\s/.test(q.answer)), `${f.id} has a sentence-level paraphrase`);
  assert.ok(all.filter(q => q.type === 'paraphrase_mcq' && !/\s/.test(q.answer)).length <= 3);
  for (const q of mcqs(all)) { const lens = q.choices.map(c => c.length); const longest = Math.max(...lens); const second = [...lens].sort((a, b) => b - a)[1]; if (q.type !== 'precision_mcq') assert.ok(q.answer.length <= second * 1.3 + 4 || q.answer.length < longest, `${q.id}: answer is conspicuously the longest`); assert.ok(Math.max(...lens) <= Math.min(...lens) * 3 + 8, `${q.id}: option lengths comparable`); }
  assert.equal(all.filter(q => q.type === 'word_form').length, 6);
});

test('answer positions: A/B/C/D balanced in every form and overall, no run of three in a row', () => {
  const dist = qs => [0, 1, 2, 3].map(i => mcqs(qs).filter(q => q.choices.indexOf(q.answer) === i).length);
  for (const f of forms) { const d = dist(f.questions); assert.equal(d.reduce((a, b) => a + b), 8); assert.ok(Math.max(...d) <= 3 && Math.min(...d) >= 1, `${f.id}: ${d}`); const seq = mcqs(f.questions).map(q => q.choices.indexOf(q.answer)); for (let i = 2; i < seq.length; i += 1) assert.ok(!(seq[i] === seq[i - 1] && seq[i] === seq[i - 2]), `${f.id}: run`); }
  const d = dist(all); assert.equal(d.reduce((a, b) => a + b), 24); assert.ok(Math.max(...d) - Math.min(...d) <= 2, `overall ${d}`);
});

test('forms are comparable: similar prompt and passage length, no word-form answer repeated, no tested word reused', () => {
  const avg = f => f.questions.reduce((s, q) => s + q.prompt.length, 0) / 10; const a = forms.map(avg); assert.ok(Math.max(...a) / Math.min(...a) < 1.45, `prompt length ${a}`);
  const p = forms.map(f => f.passage.length); assert.ok(Math.max(...p) / Math.min(...p) < 1.25, `passage length ${p}`);
  assert.equal(new Set(all.filter(q => q.type === 'word_form').map(q => q.answer)).size, 6);
  const answers = all.filter(q => q.type !== 'word_form').map(q => q.answer.toLowerCase()); assert.equal(new Set(answers).size, answers.length, 'no repeated answers');
});

test('British spelling is used throughout', () => {
  assert.doesNotMatch(JSON.stringify(check), /\b(color|organize|realize|recognize|favorite|center|theater|analyze|apologize)\b/i);
});

test('11-12. Unit 2 is registered; Units 1, 4 and 6 are still registered and untouched', () => {
  assert.equal(check, unit2Check); assert.deepEqual(Object.keys(UNIT_CHECKS), ['1', '2', '3', '4', '5', '6']);
  assert.equal(unitCheckFor(1), unit1Check); assert.equal(unitCheckFor(4), unit4Check); assert.equal(unitCheckFor(6), unit6Check);
});

test('13. the existing engine runs Unit 2: forms follow attempts, scoring, review and screens work', () => {
  const attempts = [];
  for (const [attemptNumber, formId] of [[1, 'A'], [2, 'B'], [3, 'C']]) {
    const state = nextCheckState(attempts); assert.deepEqual([state.attemptNumber, state.formId, state.locked], [attemptNumber, formId, false]);
    const form = check.forms[formId]; const perfect = scoreCheck(form, Object.fromEntries(form.questions.map(q => [q.id, q.answer]))); assert.equal(perfect.score, 10);
    const half = scoreCheck(form, Object.fromEntries(form.questions.slice(0, 5).map(q => [q.id, q.answer]))); assert.equal(half.score, 5);
    const wrong = scoreCheck(form, Object.fromEntries(form.questions.map(q => [q.id, q.type === 'word_form' ? 'zzz' : q.choices.find(c => c !== q.answer)]))); assert.equal(wrong.score, 0);
    assert.equal(scoreCheck(form, Object.fromEntries(form.questions.filter(q => q.type === 'word_form').map(q => [q.id, `  ${q.answer.toUpperCase()}  `]))).score, 2, 'typed marking ignores case and spaces');
    assert.match(renderUnitCheckScreen({ unitNumber: 2, form, attemptNumber, questionIndex: 0, answers: {} }), /Unit 2/);
    assert.match(renderUnitCheckReview({ unitNumber: 2, form, attemptNumber, scored: perfect, feedback: feedbackForAttempt(form, perfect.results, attemptNumber), locked: attemptNumber === 3 }), /Back to Unit 2/);
    attempts.push({ unit_number: 2, form_id: formId, attempt_number: attemptNumber, score: 10, max_score: 10 });
  }
  assert.equal(nextCheckState(attempts).locked, true); assert.deepEqual(scoreSummary(attempts).best, { score: 10, maxScore: 10 });
});

test('14-15. scope: only Unit 2 check content, the registry, registry-assertion tests and this file changed (no engine, other units, Supabase, SQL, Edge or Games)', t => {
  let files; try { files = execFileSync('git', ['diff', '--name-only', 'origin/main...HEAD'], { cwd: repo, encoding: 'utf8' }).split('\n').filter(Boolean); } catch { t.skip('no git history'); return; }
  if (!files.length) { t.skip('no committed diff yet'); return; }
  const allowed = /^(content\/vocabulary\/checks\/(unit-0[1-6]-check|index)\.js|tests\/vocabulary-unit-(0[1-6]-check|check-unit-aware|check-start-panel)\.test\.js)$/;
  for (const f of files) assert.match(f, allowed, f);
  const reg = fs.readFileSync(new URL('../content/vocabulary/checks/index.js', import.meta.url), 'utf8'); assert.match(reg, /1:unit1VocabularyCheck, 2:unit2VocabularyCheck, 3:unit3VocabularyCheck, 4:unit4VocabularyCheck, 5:unit5VocabularyCheck, 6:unit6VocabularyCheck/);
});
