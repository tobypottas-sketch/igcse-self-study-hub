import test from 'node:test';
import assert from 'node:assert/strict';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { buildFoundationalActivity } from '../src/vocabulary/foundational-activity-builder.js';
import { buildPathwayActivity } from '../src/vocabulary/pathway-activity-builder.js';
import authoredBank from '../content/vocabulary/units/unit-01-language-bank.js';
import { LEXICAL_SPELLING_ERRORS } from '../content/vocabulary/lexical-spelling-errors.js';

function target(vocabularyId) {
  const occurrence = unit1.occurrences.find(row => row.vocabularyId === vocabularyId);
  const item = unit1.items.find(row => row.vocabularyId === vocabularyId);
  const contexts = unit1.contexts.filter(row => row.occurrenceId === occurrence?.occurrenceId);
  assert.ok(occurrence, `missing occurrence ${vocabularyId}`);
  assert.ok(item, `missing item ${vocabularyId}`);
  return { occurrence, item, contexts };
}

function argsFor(vocabularyId, status = 'building', seed = 'language-bank-gate') {
  const { occurrence, item, contexts } = target(vocabularyId);
  return {
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
  };
}

function bankFor(vocabularyId) {
  const { item } = target(vocabularyId);
  const authored = authoredBank[item.term];
  return authored ? { ...authored, spellingErrors:LEXICAL_SPELLING_ERRORS[vocabularyId] ?? [] } : null;
}

test('Context Match uses the reviewed leisure-time surface answer instead of bare leisure', () => {
  const bank = bankFor('vocab_leisure');
  const args = argsFor('vocab_leisure', 'building', 'leisure-context-bank');
  const usedContentIds = (bank.contexts ?? [])
    .filter(context => context.id !== 'leisure_ctx_1')
    .map(context => `language-bank:${context.id}`);
  const activity = buildPathwayActivity({
    activityType:'context_sentence_match',
    occurrence:args.occurrence,
    item:args.item,
    contexts:args.contexts,
    unitActivities:args.unitActivities,
    unitItems:args.unitItems,
    unitContexts:args.unitContexts,
    unitOccurrences:args.unitOccurrences,
    mastery:args.mastery,
    readinessStage:args.readinessStage,
    usedContentIds,
    seed:args.seed
  });
  assert.equal(activity.languageBankContextId, 'leisure_ctx_1');
  assert.deepEqual(activity.markingReference.acceptedAnswers, ['leisure time']);
  assert.equal(activity.contentId, 'language-bank:leisure_ctx_1');
  assert.ok(unit1.activities.some(record => record.activityContentId === activity.contentId), 'reviewed bank context must be published as authoritative unit content');
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
  const args = argsFor('vocab_avoid', 'building', 'avoid-context-bank');
  const activity = buildFoundationalActivity({ activityType:'choose_word_sentence', ...args });
  const record = (bank.contexts ?? []).find(context => context.id === activity.languageBankContextId);
  assert.ok(record, 'Context choice must identify the bank context it used');
  const permitted = new Set(['avoid', ...record.distractors.map(row => row.text)]);
  assert.equal(activity.options.length, 4);
  assert.ok(activity.options.every(option => permitted.has(option)), activity.options.join(' | '));
  assert.ok(unit1.activities.some(candidate => candidate.activityContentId === activity.contentId), 'banked Context choice must resolve to published authoritative content');
});

test('avoid spelling recognition samples realistic authored errors instead of algorithmic mangling', () => {
  const bank = bankFor('vocab_avoid');
  assert.ok(bank, 'avoid needs an authored language bank');
  const args = argsFor('vocab_avoid', 'new', 'avoid-spelling-bank');
  const activity = buildPathwayActivity({ activityType:'spelling_choice', ...args });
  const permitted = new Set(['avoid', ...(bank.spellingErrors ?? [])]);
  assert.equal(activity.options.length, 4);
  assert.ok(activity.options.every(option => permitted.has(option)), activity.options.join(' | '));
});

for (const activityType of ['choose_word_sentence','context_sentence_match','gap_fill_bank','drag_word_sentence','type_missing_word']) {
  test(`${activityType} only serves a bank context when its authoritative activity is published`, () => {
    const args = argsFor('vocab_leisure');
    args.unitActivities = args.unitActivities.filter(row => !row.activityContentId.startsWith('language-bank:'));
    const question = activityType === 'context_sentence_match'
      ? buildPathwayActivity({ activityType, ...args })
      : buildFoundationalActivity({ activityType, ...args });
    assert.equal(question.contentSource, 'context');
    assert.ok(args.contexts.some(context => context.contextId === question.contentId));
  });
}
