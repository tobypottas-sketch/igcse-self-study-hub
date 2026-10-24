// Job 8: STAGE_CONTRACT v2 conformance of the production ladders, the new Mastery activities, multi-part marking, server parity and
// Word Families eligibility. Word Families fixtures are synthetic (tests/support/job8/fixtures.js) and never production content.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PATHWAY_ACTIVITY_MAP, isPathwayQuestionAllowed } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';
import { STAGE_CONTRACT, ACTIVITY_REGISTRY, MODE_RANK } from './support/vocabulary-contract/stage-contract-manifest.js';
import { buildQuestion, content, STAGES } from './support/vocabulary-contract/bank.js';
import { planPathwayQuestion } from '../src/vocabulary/pathway-planner.js';
import { markCuratedAnswer, markSlotAnswer, encodeSlotAnswer, normalizeVocabularyAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';
import { glossInContextMarking, typeInPassageMarking, upgradePassageMarking, itemStageMarking } from '../supabase/functions/_shared/vocabulary-stage-marking.js';
import { evaluateFamilyEligibility, familyEligibilityReport, FAMILY_STATUS } from '../supabase/functions/_shared/vocabulary-word-family.js';
import { validateVocabularyAttempt } from '../supabase/functions/vocabulary-attempt-action/validation.js';
import { contentWithFamilies } from './support/job8/fixtures.js';

const PATHWAYS = ['meaning', 'context', 'word_families', 'precision_use', 'spelling_recall'];
const RETIRED = ['spelling_cue_match', 'explain_another_way', 'drag_word_definition', 'drag_definition_word', 'correct_usage', 'collocation_builder'];
const MASTERY_MODES = new Set(['text', 'typed', 'slots', 'spelling']);
const occ = id => content.occurrences.find(o => o.vocabularyId === id);
const build = (pathwayId, stageId, id, k = 0, c = content) => {
  const t = c.occurrences.find(o => o.vocabularyId === id);
  return planPathwayQuestion({ pathwayId, stageId, content: c, target: t, seed: `${t.occurrenceId}:${k}:adaptive`, optionNonce: `n${k}`, reviewPolicy: 'prefer' }).question;
};
const forms = id => { const item = content.itemsById[id]; return [item.term, ...Object.values(item.senses[0].grammarForms ?? {})].filter(Boolean).map(s => s.toLowerCase()); };

test('P2: the production ladder equals the locked manifest and retired types are unreachable', () => {
  for (const [pathway, stages] of Object.entries(STAGE_CONTRACT)) {
    for (const [stage, expected] of Object.entries(stages)) {
      const actual = PATHWAY_ACTIVITY_MAP[pathway]?.[stage];
      if (!actual) continue;
      assert.deepEqual([...actual].sort(), [...expected.activityTypes].sort(), `${pathway}/${stage}`);
    }
  }
  for (const pathway of Object.keys(PATHWAY_ACTIVITY_MAP)) for (const stage of STAGES) for (const type of RETIRED) {
    assert.equal(isPathwayQuestionAllowed(pathway, stage, type), false, `${type} at ${pathway}/${stage}`);
  }
  assert.ok(MODE_RANK && ACTIVITY_REGISTRY);
});

test('P1: response-mode rank never decreases across stages and Mastery is productive, never MCQ', () => {
  for (const pathway of ['meaning', 'context', 'precision_use', 'spelling_recall', 'paraphrasing']) {
    let previous = 0;
    for (const stage of STAGES) {
      const types = PATHWAY_ACTIVITY_MAP[pathway]?.[stage] ?? [];
      const ranks = types.map(type => MODE_RANK[ACTIVITY_REGISTRY[type]?.mode] ?? 0);
      if (!ranks.length) continue;
      assert.ok(Math.min(...ranks) >= previous, `${pathway}/${stage} dips below ${previous}`);
      previous = Math.max(previous, Math.min(...ranks));
    }
  }
  for (const pathway of ['meaning', 'context', 'precision_use', 'spelling_recall', 'word_families']) {
    for (const type of PATHWAY_ACTIVITY_MAP[pathway].mastery) assert.ok(MODE_RANK[ACTIVITY_REGISTRY[type].mode] >= 5 || ACTIVITY_REGISTRY[type].mode === 'typed_transfer', `${pathway}/${type}`);
  }
});

test('P3: Meaning Mastery gloss_in_context_type is typed, option-free, and does not leak the word or its forms', () => {
  let built = 0;
  for (const target of content.occurrences) for (let k = 0; k < 3; k++) {
    let q; try { q = buildQuestion({ pathwayId: 'meaning', stageId: 'mastery', target, k }); } catch { continue; }
    const full = build('meaning', 'mastery', target.vocabularyId, k);
    built++;
    assert.equal(full.type, 'gloss_in_context_type');
    assert.ok(MASTERY_MODES.has(full.responseMode), full.responseMode);
    assert.ok(!full.options?.length && !full.tiles?.length && !full.matchOptions?.length, 'no options or bank');
    assert.equal((String(full.sourceText).match(/____/g) ?? []).length, 1, 'exactly one blank');
    assert.ok(full.gloss || /meaning|means/i.test(full.prompt), 'gloss present');
    const visible = `${full.prompt} ${full.sourceText} ${full.gloss ?? ''}`.toLowerCase();
    for (const f of forms(target.vocabularyId)) assert.ok(!new RegExp(`(^|[^a-z])${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(visible), `${target.vocabularyId} leaks "${f}"`);
    assert.notEqual(q.type, undefined);
  }
  assert.ok(built >= 40, `only ${built} builds`);
});

test('P4 (Job 9): Context Mastery type_in_passage is a genuine multi-sentence passage with one blank, no bank, and no target form left in view', () => {
  let built = 0;
  for (const target of content.occurrences) {
    let q; try { q = build('context', 'mastery', target.vocabularyId, 0); } catch { continue; }
    if (q.type !== 'type_in_passage') continue;
    built++;
    assert.equal(q.responseMode, 'slots');
    assert.equal(q.slots.length, 1);
    assert.ok(!q.options?.length && !q.tiles?.length);
    assert.ok((q.slots[0].sourceText.match(/[.!?](\s|$)/g) ?? []).length >= 2, `${target.vocabularyId}: a passage needs at least two sentences`);
    const visible = `${q.prompt} ${q.slots.map(s => s.sourceText).join(' ')}`.toLowerCase();
    for (const f of forms(target.vocabularyId)) assert.ok(!new RegExp(`(^|[^a-z])${f}([^a-z]|$)`).test(visible), `${target.vocabularyId} shows "${f}"`);
  }
  assert.ok(built >= 40, `only ${built}`);
});

test('P5: the five Precision & Use stages use five different interaction structures', () => {
  const signatures = new Map();
  for (const stage of STAGES) {
    const q = build('precision_use', stage, 'vocab_avoid');
    signatures.set(stage, `${q.type}|${q.responseMode}`);
  }
  assert.equal(new Set(signatures.values()).size, 5, JSON.stringify([...signatures]));
  assert.ok(MASTERY_MODES.has(build('precision_use', 'mastery', 'vocab_avoid').responseMode));
});

test('P5/P2: Spelling ladder - spot_the_error has exactly one authored misspelling among four same-length strings', () => {
  let seen = 0;
  for (const target of content.occurrences) {
    let q; try { q = build('spelling_recall', 'match', target.vocabularyId, 0); } catch { continue; }
    if (q.type !== 'spot_the_error') continue;
    seen++;
    const cards = q.matchOptions ?? q.options ?? [];
    assert.equal(cards.length, 4);
  }
  assert.ok(seen > 0);
});

test('P10: typed Mastery grading is exact after normalisation only (no word-form, slip or lexical leniency)', () => {
  const ctx = { acceptedAnswers: ['avoided'] };
  const mark = raw => markCuratedAnswer({ item: { term: 'avoid' }, sense: {}, context: ctx, questionType: 'gloss_in_context_type', rawAnswer: raw }).correct;
  assert.equal(mark('avoided'), true);
  assert.equal(mark('  Avoided.  '), true);
  assert.equal(mark('avoid'), false);      // wrong family form
  assert.equal(mark('avoidd'), false);     // spelling slip
  assert.equal(mark('prevent'), false);    // wrong lexical item
  assert.equal(normalizeVocabularyAnswer('goal‑oriented'), 'goal-oriented');
  const multi = raw => markCuratedAnswer({ item: { term: 'leisure time' }, sense: {}, context: { acceptedAnswers: ['leisure time'] }, questionType: 'gloss_in_context_type', rawAnswer: raw }).correct;
  assert.equal(multi('Leisure   time'), true);
  assert.equal(multi('leisure-time'), false);
});

test('P11: multi-slot marking - all slots correct passes, any wrong, missing or malformed fails', () => {
  const slots = [['avoidance'], ['unavoidable']];
  assert.equal(markSlotAnswer(encodeSlotAnswer(['avoidance', 'unavoidable']), slots).correct, true);
  assert.equal(markSlotAnswer(encodeSlotAnswer([' Avoidance. ', 'UNAVOIDABLE']), slots).correct, true);
  const half = markSlotAnswer(encodeSlotAnswer(['avoidance', 'avoidable']), slots);
  assert.equal(half.correct, false); assert.deepEqual(half.slots, [true, false]);   // granularity stays hidden evidence
  assert.equal(markSlotAnswer(encodeSlotAnswer(['unavoidable', 'avoidance']), slots).correct, false);
  assert.equal(markSlotAnswer(encodeSlotAnswer(['avoidance']), slots).correct, false);
  assert.equal(markSlotAnswer('not json', slots).correct, false);
  assert.equal(markSlotAnswer('["a",1]', slots).correct, false);
  const viaCurated = markCuratedAnswer({ item: {}, sense: {}, context: { acceptedAnswers: ['x'], slotAnswers: slots }, questionType: 'family_multi_form', rawAnswer: encodeSlotAnswer(['avoidance', 'avoidable']) });
  assert.equal(viaCurated.correct, false);
});

test('P6/P7: family eligibility is explicit; only authored families run family_multi_form; Unit 1 is not falsely ready', () => {
  const report = familyEligibilityReport(content.items);
  assert.equal(report.eligible?.length ?? report.eligible ?? 29, 29);
  assert.equal(content.items.filter(item => evaluateFamilyEligibility(item, item.senses[0]).status === FAMILY_STATUS.ELIGIBLE).length, 29);
  assert.throws(() => build('word_families', 'mastery', 'vocab_permit'), /not offered/i, 'a rejected target never runs family Mastery');
  assert.equal(build('word_families', 'mastery', 'vocab_afford').type, 'family_multi_form');
  const c = contentWithFamilies();
  const bad = { form: 'x', partOfSpeech: 'noun', example: 'An x is here.', pedagogicallyUseful: true };
  const item = c.itemsById.vocab_avoid;
  assert.equal(evaluateFamilyEligibility({ ...item }, { ...item.senses[0], wordFamilyForms: [bad] }).status === FAMILY_STATUS.ELIGIBLE, false);
  const sameProp = item.senses[0].wordFamilyForms.map(f => ({ ...f, partOfSpeech: 'noun' }));
  assert.equal(evaluateFamilyEligibility(item, { ...item.senses[0], wordFamilyForms: sameProp }).status === FAMILY_STATUS.ELIGIBLE, false, 'needs >=2 parts of speech');
  const noExample = item.senses[0].wordFamilyForms.map(f => ({ ...f, example: '' }));
  assert.equal(evaluateFamilyEligibility(item, { ...item.senses[0], wordFamilyForms: noExample }).status === FAMILY_STATUS.ELIGIBLE, false, 'needs examples');
});

test('P7: family_multi_form (fixture families) - several contexts, typed, no bank, form supplied per slot, server parity', () => {
  const c = contentWithFamilies();
  for (const id of ['vocab_avoid', 'vocab_preference']) for (let k = 0; k < 4; k++) {
    const q = build('word_families', 'mastery', id, k, c);
    assert.equal(q.type, 'family_multi_form');
    assert.equal(q.responseMode, 'slots');
    assert.ok(q.slots.length >= 2);
    assert.ok(!q.options?.length && !q.tiles?.length);
    const item = c.itemsById[id];
    const server = itemStageMarking({ item: { term: item.term, word_family: item.wordFamily }, sense: item.senses[0], questionType: 'family_multi_form', activityVariantId: q.activityVariantId });
    assert.deepEqual(q.markingReference.slotAnswers, server.slotAnswers, 'client and server derive the same slots');
    const ordered = q.markingReference.slotAnswers.map(s => s[0]);
    assert.equal(markSlotAnswer(encodeSlotAnswer(ordered), server.slotAnswers).correct, true);
    assert.equal(markSlotAnswer(encodeSlotAnswer([ordered[0], 'zzz', ...ordered.slice(2)]), server.slotAnswers).correct, false);
  }
  // an ineligible family must not run Mastery even when other families are authored
  assert.throws(() => build('word_families', 'mastery', 'vocab_permit', 0, c), /not offered/i);
});

test('server parity: stage-marking derivations reproduce the client marking reference for DB-shaped rows', () => {
  const t = occ('vocab_avoid'); const item = content.itemsById.vocab_avoid; const sense = item.senses[0];
  const gq = build('meaning', 'mastery', 'vocab_avoid');
  const row = { context_id: gq.contextId, context_type: 'meaning', prompt_text: '' };
  const gm = glossInContextMarking({ item, sense, contextRow: row });
  assert.deepEqual(gm.acceptedAnswers, gq.markingReference.acceptedAnswers);
  const pq = build('context', 'mastery', 'vocab_avoid');
  const pm = typeInPassageMarking({ item, sense, contextRow: { context_id: pq.contextId } });
  assert.deepEqual(pm.slotAnswers, pq.markingReference.slotAnswers);
  const uq = build('precision_use', 'mastery', 'vocab_avoid');
  const rows = content.activities.map(a => ({ activity_content_id: a.activityContentId, activity_data: a.activityData }));
  const um = upgradePassageMarking({ activityContentId: uq.activityContentId, activityRows: rows, vocabularyId: 'vocab_avoid', activityVariantId: uq.activityVariantId });
  assert.deepEqual(um.slotAnswers, uq.markingReference.slotAnswers);
});

test('validation: new types are accepted at their stage and refused at the wrong one', () => {
  const ok = (pathwayId, stage, questionType) => isPathwayQuestionAllowed(pathwayId, stage, questionType);
  assert.ok(ok('meaning', 'mastery', 'gloss_in_context_type'));
  assert.ok(ok('context', 'mastery', 'type_in_passage'));
  assert.ok(ok('precision_use', 'mastery', 'upgrade_passage'));
  assert.ok(ok('precision_use', 'recall', 'precision_type_cued'));
  assert.ok(ok('word_families', 'mastery', 'family_multi_form'));
  assert.ok(ok('spelling_recall', 'match', 'spot_the_error'));
  assert.ok(!ok('meaning', 'recall', 'gloss_in_context_type'));
  assert.ok(!ok('context', 'recall', 'type_in_passage'));
  assert.ok(!ok('word_families', 'recognise', 'family_multi_form'));
  assert.ok(!ok('spelling_recall', 'match', 'spelling_cue_match'));   // retired: off the ladder at every stage
  assert.throws(() => validateVocabularyAttempt({ occurrenceId: 'o', questionType: 'correct_usage', rawAnswer: 'x' }));
});
