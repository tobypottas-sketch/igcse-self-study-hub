import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';
import { languageBankForItem } from '../src/vocabulary/language-bank.js';

function target(vocabularyId) {
  const occurrence = unit1.occurrences.find(row => row.vocabularyId === vocabularyId);
  const item = unit1.items.find(row => row.vocabularyId === vocabularyId);
  const contexts = unit1.contexts.filter(row => row.occurrenceId === occurrence?.occurrenceId);
  assert.ok(occurrence, `missing occurrence ${vocabularyId}`);
  assert.ok(item, `missing item ${vocabularyId}`);
  return { occurrence, item, contexts };
}

function build(vocabularyId, activityType, status = 'building', seed = 'language-bank-gate') {
  const { occurrence, item, contexts } = target(vocabularyId);
  return buildActivity({
    activityType,
    occurrence,
    item,
    contexts,
    unitActivities:unit1.activities,
    unitItems:unit1.items,
    unitContexts:unit1.contexts,
    unitOccurrences:unit1.occurrences,
    mastery:{ status },
    readinessStage:status,
    seed
  });
}

function bankFor(vocabularyId) {
  return languageBankForItem(target(vocabularyId).item);
}

test('Context Match uses the reviewed leisure-time surface answer instead of bare leisure', () => {
  const activity = build('vocab_leisure', 'context_sentence_match', 'building', 'leisure-context-bank');
  assert.deepEqual(activity.markingReference.acceptedAnswers, ['leisure time']);
  assert.equal(activity.languageBankContextId != null, true);
  assert.ok(activity.sourceText?.includes('____'));
});

test('avoid owns a deep authored language bank before random fallback is allowed', () => {
  const bank = bankFor('vocab_avoid');
  assert.ok(bank, 'avoid needs an authored language bank');
  assert.ok((bank.contexts ?? []).length >= 6, 'avoid needs at least six natural contexts');
  assert.ok((bank.definitionDistractors ?? []).length >= 6, 'avoid needs at least six length-matched definition distractors');
  assert.ok((bank.spellingErrors ?? []).length >= 6, 'avoid needs at least six realistic spelling errors');
  assert.ok((bank.misuseSentences ?? []).length >= 4, 'avoid needs at least four diagnosed misuse sentences');
});

test('every avoid context owns three diagnosed distractors that fit that exact item', () => {
  const bank = bankFor('vocab_avoid');
  assert.ok(bank, 'avoid needs an authored language bank');
  for (const context of bank.contexts ?? []) {
    assert.ok(context.id, 'bank context needs an id');
    assert.ok(context.text?.includes('____'), `${context.id} needs an explicit answer slot`);
    assert.equal(context.answer, 'avoid', `${context.id} should target avoid`);
    assert.equal((context.distractors ?? []).length, 3, `${context.id} needs exactly three reviewed distractors`);
    for (const distractor of context.distractors ?? []) {
      assert.ok(distractor.text?.trim(), `${context.id} distractor needs text`);
      assert.ok(distractor.reason?.trim(), `${context.id}/${distractor.text} needs a reason it is wrong here`);
    }
  }
});

test('avoid Context choice uses its reviewed per-sentence distractors rather than unrelated Unit 1 words', () => {
  const bank = bankFor('vocab_avoid');
  assert.ok(bank, 'avoid needs an authored language bank');
  const activity = build('vocab_avoid', 'choose_word_sentence', 'building', 'avoid-context-bank');
  const record = (bank.contexts ?? []).find(context => context.id === activity.languageBankContextId);
  assert.ok(record, 'Context choice must identify the bank context it used');
  const permitted = new Set(['avoid', ...record.distractors.map(row => row.text)]);
  assert.equal(activity.options.length, 4);
  assert.ok(activity.options.every(option => permitted.has(option)), activity.options.join(' | '));
});

test('avoid spelling recognition samples realistic authored errors instead of algorithmic mangling', () => {
  const bank = bankFor('vocab_avoid');
  assert.ok(bank, 'avoid needs an authored language bank');
  const activity = build('vocab_avoid', 'spelling_choice', 'new', 'avoid-spelling-bank');
  const permitted = new Set(['avoid', ...(bank.spellingErrors ?? [])]);
  assert.equal(activity.options.length, 4);
  assert.ok(activity.options.every(option => permitted.has(option)), activity.options.join(' | '));
});
