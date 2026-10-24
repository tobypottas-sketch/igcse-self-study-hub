// Job 9 (Part 16): explicit Word Families Mastery validation over every Unit 1 family. Mastery must be real (typed, no bank, several forms),
// reachable (two different prompts per word), honest (only authored, complete families) and identical on the client and the server.
import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/releases/unit-01.js';
import { unit1WordFamilies, unit1WordFamilyRejected } from '../content/vocabulary/units/unit-01-word-families.js';
import { unit1WordFamilyAlternates } from '../content/vocabulary/units/unit-01-word-family-alternates.js';
import { planPathwayQuestion } from '../src/vocabulary/pathway-planner.js';
import { evaluateFamilyEligibility, familyMasks, familySlotsForMask, FAMILY_STATUS, ALT_BIT } from '../supabase/functions/_shared/vocabulary-word-family.js';
import { itemStageMarking } from '../supabase/functions/_shared/vocabulary-stage-marking.js';
import { markSlotAnswer, encodeSlotAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';
import { validateVocabularyAttempt } from '../supabase/functions/vocabulary-attempt-action/validation.js';

const content = { ...unit1, itemsById: Object.fromEntries(unit1.items.map(i => [i.vocabularyId, i])), contextsByOccurrence: {} };
for (const c of unit1.contexts) (content.contextsByOccurrence[c.occurrenceId] ??= []).push(c);
const authored = Object.keys(unit1WordFamilies);
const itemOf = term => unit1.items.find(i => i.term === term);
const whole = (text, form) => new RegExp(`(^|[^a-z])${form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z])`, 'i').test(text);
const ask = (item, k) => {
  const target = unit1.occurrences.find(o => o.vocabularyId === item.vocabularyId);
  return planPathwayQuestion({ pathwayId: 'word_families', stageId: 'mastery', content, target, seed: `${target.occurrenceId}:${k}`, optionNonce: `n${k}` }).question;
};
const variantsOf = item => familyMasks(item, item.senses[0]);

test('exactly the authored families are eligible; every rejected target is recorded with a reason and is never eligible', () => {
  assert.ok(authored.length >= 20, `${authored.length} families (at least 20 required)`);
  assert.equal(authored.length + Object.keys(unit1WordFamilyRejected).length, 50, 'every Unit 1 word is either authored or rejected with a reason');
  for (const term of authored) assert.equal(evaluateFamilyEligibility(itemOf(term), itemOf(term).senses[0]).status, FAMILY_STATUS.ELIGIBLE, term);
  for (const [term, reason] of Object.entries(unit1WordFamilyRejected)) {
    assert.ok(String(reason).length > 15, `${term}: a rejection needs a real reason`);
    assert.notEqual(evaluateFamilyEligibility(itemOf(term), itemOf(term).senses[0]).status, FAMILY_STATUS.ELIGIBLE, term);
    assert.throws(() => ask(itemOf(term), 0), /not offered/i, `${term} must not run family Mastery`);
  }
});

test('every authored family: three or more forms including the headword, two or more parts of speech, one authored example per form', () => {
  for (const [term, family] of Object.entries(unit1WordFamilies)) {
    const forms = family.forms;
    assert.ok(forms.length >= 3, term);
    assert.equal(forms[0].form, term, `${term}: the headword is the first form`);
    assert.ok(new Set(forms.map(f => f.partOfSpeech)).size >= 2, `${term}: needs two parts of speech`);
    assert.equal(new Set(forms.map(f => f.form)).size, forms.length, `${term}: duplicate forms`);
    for (const f of forms) { assert.ok(whole(f.example, f.form), `${term}/${f.form}: example must contain the form`); assert.ok(!/^\s*\W*[A-Za-z]/.test('') || true); }
    for (const f of forms.slice(1)) assert.ok(!new RegExp(`^\\W*${f.form}\\b`, 'i').test(f.example), `${term}/${f.form}: a non-headword example must not begin with its form (gap would give a capital)`);
  }
});

test('Mastery is typed: several gaps, no options, no tiles, no word bank, and the headword is never asked', () => {
  for (const term of authored) {
    const item = itemOf(term);
    for (let k = 0; k < 6; k += 1) {
      const q = ask(item, k);
      assert.equal(q.type, 'family_multi_form', term);
      assert.equal(q.responseMode, 'slots', term);
      assert.ok(q.slots.length >= 2 && q.slots.length <= 3, `${term}: ${q.slots.length} gaps`);
      assert.ok(!q.options?.length && !q.tiles?.length && !q.wordBank?.length, `${term}: no bank`);
      assert.ok(!q.markingReference.slotAnswers.some(a => a[0].toLowerCase() === term.toLowerCase()), `${term}: the headword is the prompt, never an answer`);
      assert.equal(q.slots.filter(s => s.sourceText.includes('____')).length, q.slots.length, `${term}: every slot has a blank`);
    }
  }
});

test('no gap shows any form that another gap of the same question asks for (answers cannot be copied across slots)', () => {
  for (const term of authored) {
    const item = itemOf(term);
    for (let k = 0; k < 6; k += 1) {
      const q = ask(item, k);
      const answers = q.markingReference.slotAnswers.map(a => a[0]);
      const visible = `${q.prompt} ${q.slots.map(s => s.sourceText).join(' ')}`;
      for (const answer of answers) assert.ok(!whole(visible, answer), `${term}: "${answer}" is visible in ${visible}`);
    }
  }
});

test('Mastery is reachable: every authored family has at least two different prompts (variants), so two distinct promptKeys exist', () => {
  for (const term of authored) {
    const item = itemOf(term);
    const variants = variantsOf(item);
    assert.ok(variants.length >= 2, `${term}: only ${variants.length} prompt variant(s); per-word Mastery needs two distinct prompts`);
    const seen = new Set();
    for (let k = 0; k < 60; k += 1) seen.add(ask(item, k).activityVariantId);
    assert.ok(seen.size >= 2, `${term}: the planner only ever served ${[...seen]}`);
  }
});

test('the alternate prompts are hand-authored sentences for the same forms (alt variants use altExample, never a generated sentence)', () => {
  for (const [term, alt] of Object.entries(unit1WordFamilyAlternates)) {
    const item = itemOf(term);
    const sense = item.senses[0];
    for (const [form, sentence] of Object.entries(alt)) {
      const row = sense.wordFamilyForms.find(r => r.form === form);
      assert.equal(row.altExample, sentence, `${term}/${form}`);
      assert.notEqual(row.altExample, row.example);
      assert.ok(whole(row.altExample, form) && !new RegExp(`^\\W*${form}\\b`, 'i').test(row.altExample), `${term}/${form}: alternate must contain and not start with its form`);
    }
    const altVariants = variantsOf(item).filter(v => v & ALT_BIT);
    assert.ok(altVariants.length >= 1, `${term}: authored alternates must yield an alternate prompt`);
    for (const v of altVariants) {
      const primary = familySlotsForMask(item, sense, v & (ALT_BIT - 1)), second = familySlotsForMask(item, sense, v);
      assert.deepEqual(second.map(s => s.form), primary.map(s => s.form), 'the same forms are asked');
      second.forEach((s, i) => assert.notEqual(s.sourceText, primary[i].sourceText, 'but in a different sentence'));
    }
  }
});

test('a form without an authored alternate yields no alternate prompt (nothing is generated to fill the gap)', () => {
  const item = structuredClone(itemOf('preference'));
  item.senses[0].wordFamilyForms = item.senses[0].wordFamilyForms.map(row => ({ ...row, altExample: undefined }));
  assert.equal(familyMasks(item, item.senses[0]).filter(v => v & ALT_BIT).length, 0);
  assert.equal(familyMasks(item, item.senses[0]).length, 1, 'two non-target forms and no alternate: a single prompt, so Mastery would be unreachable and the readiness check must say so');
});

test('server parity: the Edge marking derives exactly the slots the client asked, for every variant of every family', () => {
  for (const term of authored) {
    const item = itemOf(term);
    for (const variant of variantsOf(item)) {
      const slots = familySlotsForMask(item, item.senses[0], variant);
      const server = itemStageMarking({ item: { term: item.term, word_family: item.wordFamily }, sense: item.senses[0], questionType: 'family_multi_form', activityVariantId: `q${variant}` });
      assert.deepEqual(server.slotAnswers, slots.map(s => [s.form]), `${term} q${variant}`);
    }
  }
});

test('marking: exact forms pass in the authored order; a wrong inflection, a swapped order, the headword or a blank fails; case and spaces are forgiven', () => {
  const item = itemOf('avoid');
  const variant = variantsOf(item)[0];
  const server = itemStageMarking({ item: { term: item.term, word_family: item.wordFamily }, sense: item.senses[0], questionType: 'family_multi_form', activityVariantId: `q${variant}` });
  const right = server.slotAnswers.map(a => a[0]);
  assert.equal(markSlotAnswer(encodeSlotAnswer(right), server.slotAnswers).correct, true);
  assert.equal(markSlotAnswer(encodeSlotAnswer(right.map(a => ` ${a.toUpperCase()}. `)), server.slotAnswers).correct, true);
  assert.equal(markSlotAnswer(encodeSlotAnswer([...right].reverse()), server.slotAnswers).correct, false, 'forms in the wrong gaps');
  assert.equal(markSlotAnswer(encodeSlotAnswer(right.map(() => 'avoid')), server.slotAnswers).correct, false, 'the headword everywhere');
  assert.equal(markSlotAnswer(encodeSlotAnswer([right[0], 'avoidances', ...right.slice(2)]), server.slotAnswers).correct, false, 'a wrong inflection');
  assert.equal(markSlotAnswer(encodeSlotAnswer([right[0], '', ...right.slice(2)]), server.slotAnswers).correct, false);
});

test('the attempt validator accepts a family variant on item content, including the alternate prompt, and rejects a malformed one', () => {
  const base = { rawAnswer: 'a|b', questionType: 'family_multi_form', contentSource: 'item', occurrenceId: 'u1_03_avoid', pathwayId: 'word_families', pathwayStage: 'mastery', servedPathwayStage: 'mastery' };
  for (const variant of ['q3', `q${3 | ALT_BIT}`]) assert.doesNotThrow(() => validateVocabularyAttempt({ ...base, activityVariantId: variant }), variant);
  assert.throws(() => validateVocabularyAttempt({ ...base, activityVariantId: 'q3; drop table' }));
});

test('the 29 eligible families fill two complete Sets of ten; the nine others are held back and never padded', async () => {
  const { evaluateUnitReadiness } = await import('../src/vocabulary/pathway-readiness.js');
  const { releasePlannerContent } = await import('../content/vocabulary/readiness-report.js');
  const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit1) }).pathways.word_families;
  assert.equal(readiness.live, true);
  assert.equal(readiness.servedCount, 29);
  assert.equal(readiness.playableSetCount, 2);
  assert.equal(readiness.setMembers.flat().length, 20);
  assert.equal(readiness.heldBackCount, 9);
  const order = unit1.occurrences.map(o => o.occurrenceId).filter(id => readiness.servedOccurrenceIds.includes(id));
  assert.deepEqual(readiness.setMembers.flat(), order.slice(0, 20), 'deterministic authored order');
});
