import test from 'node:test';
import assert from 'node:assert/strict';
import unit from '../content/vocabulary/releases/unit-01.js';
import { planPathwayQuestion } from '../src/vocabulary/pathway-planner.js';
import { PATHWAY_IDS, PATHWAY_STAGE_IDS } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';
import { assertContextQuestionMatchesContextType } from '../supabase/functions/vocabulary-attempt-action/validation.js';

// Guard for "grammatically awful questions": every blank must be cut from a real curated sentence in which the target
// already appears in the exact form being asked for, and the server must be willing to save the attempt.
const content = {
  ...unit,
  itemsById:Object.fromEntries(unit.items.map(row => [row.vocabularyId,row])),
  contextsByOccurrence:{},
  activitiesById:Object.fromEntries(unit.activities.map(row => [row.activityContentId,row]))
};
for (const row of unit.contexts) (content.contextsByOccurrence[row.occurrenceId] ??= []).push(row);
const contextById = new Map(unit.contexts.map(row => [row.contextId,row]));
const norm = value => String(value).toLowerCase().replace(/\s+/g,' ').trim();

function* questions() {
  for (const occurrence of unit.occurrences) for (const pathwayId of PATHWAY_IDS) for (const stageId of PATHWAY_STAGE_IDS) for (let seed = 0; seed < 4; seed += 1) {
    let built;
    try { built = planPathwayQuestion({ pathwayId, stageId, content, target:occurrence, mastery:{ status:'new' }, usedContentIds:seed % 2 ? ['item:used'] : [], seed:`g${seed}`, optionNonce:`n${seed}` }); }
    catch { continue; }
    yield { occurrence, pathwayId, stageId, question:built.question };
  }
}
const all = [...questions()];

test('the audit actually covers blank-based questions in several pathways', () => {
  const blankTypes = new Set(all.filter(row => String(row.question.sourceText ?? '').includes('____')).map(row => row.question.type));
  for (const type of ['spell_in_context','type_missing_word','choose_word_sentence','gap_fill_bank','context_sentence_match']) assert.ok(blankTypes.has(type), type);
});

test('filling the correct answer into a curated blank restores the curated sentence exactly', () => {
  for (const { question } of all.filter(row => row.question.contentSource === 'context' && String(row.question.sourceText ?? '').includes('____'))) {
    const record = contextById.get(question.contentId);
    assert.ok(record, `${question.type}: unknown context ${question.contentId}`);
    // Meaning Mastery blanks the sense's authored mastery sentence (a meaning_context or paraphrase_context record); everything else blanks a curated gap-fill sentence.
    const expectedTypes = question.type === 'gloss_in_context_type' ? ['meaning_context', 'paraphrase_context'] : ['gap_fill'];
    assert.ok(expectedTypes.includes(record.type), `${question.type} must blank a curated ${expectedTypes.join('/')} sentence, not a ${record.type}`);
    if (Array.isArray(question.slots)) {
      // a multi-slot passage: every slot, filled with its answer, restores one of this word's curated gap-fill sentences
      const gapTexts = new Set(unit.contexts.filter(row => row.occurrenceId === record.occurrenceId && row.type === 'gap_fill').map(row => norm(row.text)));
      question.slots.forEach((slot, index) => assert.ok(gapTexts.has(norm(slot.sourceText.replace('____', question.markingReference.slotAnswers[index][0]))), `${question.type}: ${slot.sourceText}`));
      continue;
    }
    const filled = question.sourceText.replace('____', question.markingReference.acceptedAnswers[0]);
    // Meaning Mastery's sentence is the sense's authored masteryContext that is filed under this context id (the server derives the answer from it).
    const authored = question.type === 'gloss_in_context_type'
      ? content.itemsById[question.vocabularyId ?? unit.occurrences.find(o => o.occurrenceId === record.occurrenceId)?.vocabularyId].senses.flatMap(sense => sense.masteryContexts ?? []).find(row => row.contextId === question.contentId)
      : record;
    assert.ok(authored, `${question.type}: authored sentence for ${question.contentId}`);
    assert.equal(norm(filled), norm(authored.text), `${question.type}: ${question.sourceText}`);
  }
});

test('a blank never starts a sentence, so a capital letter cannot give the answer away', () => {
  for (const { question } of all.filter(row => String(row.question.sourceText ?? '').includes('____'))) {
    assert.ok(!question.sourceText.trim().startsWith('____'), question.sourceText);
  }
});

test('the server accepts every context-backed question type the app can serve', () => {
  for (const { question } of all.filter(row => row.question.contentSource === 'context')) {
    const record = contextById.get(question.contentId);
    assert.doesNotThrow(() => assertContextQuestionMatchesContextType(record.type, question.type), `${question.type} <- ${record.type}`);
  }
});

test('spelling choice options are distinct and contain the exact answer form', () => {
  for (const { question } of all.filter(row => row.question.type === 'spelling_choice')) {
    const options = question.options.map(norm);
    assert.equal(new Set(options).size, options.length, question.prompt);
    assert.ok(options.includes(norm(question.markingReference.acceptedAnswers[0])));
    assert.equal(options.length, 4);
  }
});

test('every Unit 1 word has enough curated gap-fill sentences to vary Context and Spelling practice', () => {
  for (const occurrence of unit.occurrences) {
    const count = (content.contextsByOccurrence[occurrence.occurrenceId] ?? []).filter(row => row.type === 'gap_fill').length;
    assert.ok(count >= 3, `${occurrence.occurrenceId} has ${count} gap-fill sentences`);
  }
});

test('word-family choice offers the word’s own other forms, not forms of unrelated words', () => {
  const wf = all.filter(row => row.question.type === 'word_family_choice');
  assert.ok(wf.length > 0);
  for (const { occurrence, question } of wf) {
    const item = content.itemsById[occurrence.vocabularyId];
    // The authored accepted form counts as a form of the word even when the item's short family list omits it (e.g. avoid → unavoidable);
    // every authored word-family record can now be served, not only the first.
    const own = new Set([item.term, ...item.wordFamily, ...(question.markingReference?.acceptedAnswers ?? [])].map(norm));
    if (own.size < 3) continue;
    for (const option of question.options) assert.ok(own.has(norm(option)), `${item.term}: "${option}" is not a form of this word`);
  }
});

// Reviewed distractors: a wrong option must never also complete the blank.
import { grammaticalBlankCandidates } from '../src/vocabulary/foundational-activity-builder.js';

function blankCandidates() {
  return unit.occurrences.flatMap(occurrence => {
    const item = content.itemsById[occurrence.vocabularyId];
    return grammaticalBlankCandidates({ item, occurrence, contexts:content.contextsByOccurrence[occurrence.occurrenceId] ?? [] })
      .map(candidate => ({ ...candidate, term:item.term }));
  });
}
const keyOf = candidate => `${candidate.sourceText} => ${candidate.answer}`;
// The reviewed rows as the unit publishes them (on each word's sense, keyed by context id), indexed by sentence for these checks.
const GAPFILL_DISTRACTORS = {};
for (const candidate of blankCandidates()) {
  const item = content.itemsById[candidate.context.vocabularyId];
  const row = item.senses[0].gapDistractors?.find(entry => entry.contextId === candidate.context.contextId);
  if (row) GAPFILL_DISTRACTORS[keyOf(candidate)] = row.wrong;
}

test('every blankable gap sentence has exactly three reviewed distractors, and no reviewed row is orphaned', () => {
  const candidates = blankCandidates();
  assert.ok(candidates.length >= 150, `only ${candidates.length} blankable sentences`);
  const keys = new Set(candidates.map(keyOf));
  for (const candidate of candidates) {
    const row = GAPFILL_DISTRACTORS[keyOf(candidate)];
    assert.ok(row, `no reviewed distractors for ${candidate.term}: ${keyOf(candidate)}`);
    assert.equal(row.length, 3, keyOf(candidate));
    assert.equal(new Set(row.map(norm)).size, 3, `duplicate distractors: ${keyOf(candidate)}`);
    assert.ok(!row.some(value => norm(value) === norm(candidate.answer)), `a distractor equals the answer: ${keyOf(candidate)}`);
    assert.ok(row.every(value => /^[a-z-]+$/.test(value)), `unexpected characters: ${keyOf(candidate)}`);
  }
  const contextIds = new Set(candidates.map(candidate => candidate.context.contextId));
  for (const item of unit.items) for (const row of item.senses[0].gapDistractors ?? []) assert.ok(contextIds.has(row.contextId), `reviewed row matches no sentence: ${row.contextId}`);
});

test('a reviewed distractor never spells the answer of the same word in another form of the same sentence', () => {
  for (const candidate of blankCandidates()) {
    const forms = Object.values(content.itemsById[candidate.vocabularyId ?? candidate.context.vocabularyId]?.senses?.[0]?.grammarForms ?? {}).map(norm);
    for (const value of GAPFILL_DISTRACTORS[keyOf(candidate)]) assert.ok(!forms.includes(norm(value)), `${value} is a form of the target word: ${keyOf(candidate)}`);
  }
});

test('blank questions offer the reviewed distractors', () => {
  const blanks = all.filter(row => row.question.contentSource === 'context' && String(row.question.sourceText ?? '').includes('____'));
  assert.ok(blanks.length > 50);
  for (const { question } of blanks) {
    const answer = question.markingReference.acceptedAnswers[0];
    const reviewed = GAPFILL_DISTRACTORS[`${question.sourceText} => ${answer}`];
    const options = question.options ?? question.draggables ?? question.pairs?.map(pair => pair.definition);
    if (!options) continue;
    assert.deepEqual([...options].sort(), [answer, ...reviewed].sort(), `${question.type}: ${question.sourceText}`);
  }
});

test('a/an before a blank agrees with every option, so the article never gives the answer away', () => {
  const vowel = word => /^[aeiou]/i.test(word) && !/^(uni|use|eu|one)/i.test(word);
  for (const candidate of blankCandidates()) {
    const article = candidate.sourceText.match(/\b(a|an)\s+____/i)?.[1]?.toLowerCase();
    if (!article) continue;
    for (const option of [candidate.answer, ...GAPFILL_DISTRACTORS[keyOf(candidate)]]) {
      assert.equal(vowel(option) ? 'an' : 'a', article, `"${article} ${option}" is ungrammatical, so it signals the answer: ${keyOf(candidate)}`);
    }
  }
});
