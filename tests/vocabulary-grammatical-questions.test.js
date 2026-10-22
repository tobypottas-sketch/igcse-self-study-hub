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
    assert.equal(record.type, 'gap_fill', `${question.type} must blank a curated gap-fill sentence, not a ${record.type}`);
    const filled = question.sourceText.replace('____', question.markingReference.acceptedAnswers[0]);
    assert.equal(norm(filled), norm(record.text), `${question.type}: ${question.sourceText}`);
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
