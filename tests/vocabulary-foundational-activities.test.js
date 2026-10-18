import test from 'node:test';
import assert from 'node:assert/strict';
import { activityDefinition } from '../src/vocabulary/activity-catalogue.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';

const item = {
  vocabularyId:'vocab_significant', term:'significant', partOfSpeech:'adjective',
  coreMeaning:'important or large enough to be noticed or have an effect',
  senses:[{ senseId:'significant_1', meaning:'important or large enough to be noticed or have an effect', acceptedParaphrases:['important','notable'], misleadingDistractors:['ordinary','minor','temporary'] }],
  wordFamily:['significance','significantly']
};
const occurrence = { occurrenceId:'u1_significant', vocabularyId:item.vocabularyId, unitNumber:1, senseId:'significant_1' };
const otherItems = [
  { vocabularyId:'vocab_essential', term:'essential', partOfSpeech:'adjective', coreMeaning:'completely necessary', senses:[{ senseId:'essential_1', meaning:'completely necessary', acceptedParaphrases:['necessary'], misleadingDistractors:['optional'] }], wordFamily:['essentially'] },
  { vocabularyId:'vocab_competitive', term:'competitive', partOfSpeech:'adjective', coreMeaning:'wanting to win or be more successful than others', senses:[{ senseId:'competitive_1', meaning:'wanting to win or be more successful than others', acceptedParaphrases:['keen to win'] }], wordFamily:['competition','competitively'] },
  { vocabularyId:'vocab_overwhelming', term:'overwhelming', partOfSpeech:'adjective', coreMeaning:'very strong or difficult to deal with', senses:[{ senseId:'overwhelming_1', meaning:'very strong or difficult to deal with', acceptedParaphrases:['very powerful'] }], wordFamily:['overwhelm','overwhelmingly'] },
  { vocabularyId:'vocab_participant', term:'participant', partOfSpeech:'noun', coreMeaning:'a person who takes part', senses:[{ senseId:'participant_1', meaning:'a person who takes part', acceptedParaphrases:['person taking part'] }], wordFamily:['participate','participation'] }
];
const unitItems = [item, ...otherItems];
const contexts = [
  { contextId:'sig_para', occurrenceId:occurrence.occurrenceId, type:'paraphrase_context', text:'The programme led to an important improvement in results.', targetRewrite:'important', acceptedAnswers:['significant'] },
  { contextId:'sig_prod', occurrenceId:occurrence.occurrenceId, type:'production_context', text:'Regular exercise can have an important effect on mental wellbeing.', targetRewrite:'important', acceptedAnswers:['significant'] }
];
const unitContexts = [
  ...contexts,
  { contextId:'essential_prod', occurrenceId:'u1_essential', type:'production_context', text:'Regular sleep is necessary for recovery.', targetRewrite:'necessary', acceptedAnswers:['essential'] },
  { contextId:'competitive_prod', occurrenceId:'u1_competitive', type:'production_context', text:'Some athletes are keen to win every event.', targetRewrite:'keen to win', acceptedAnswers:['competitive'] },
  { contextId:'overwhelming_prod', occurrenceId:'u1_overwhelming', type:'production_context', text:'The pressure can feel very powerful before a final.', targetRewrite:'very powerful', acceptedAnswers:['overwhelming'] }
];
const unitOccurrences = [
  occurrence,
  { occurrenceId:'u1_essential', vocabularyId:'vocab_essential', senseId:'essential_1' },
  { occurrenceId:'u1_competitive', vocabularyId:'vocab_competitive', senseId:'competitive_1' },
  { occurrenceId:'u1_overwhelming', vocabularyId:'vocab_overwhelming', senseId:'overwhelming_1' }
];
const unitActivities = [{
  activityContentId:'u1_family_significant', contentType:'writing_set',
  activityData:{ taskType:'word_family', prompt:'Choose the correct form of significant.', sourceText:'Results improved ____ after the new programme.', acceptedAnswers:['significantly'], linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId }
}];
const masteryNew = { status:'new', strandEvidence:{} };
const masteryBuilding = { status:'building', strandEvidence:{ meaning:2, recognition:1 } };

function build(type, overrides = {}) {
  return buildActivity({
    activityType:type, occurrence, item, contexts, unitItems, unitContexts, unitOccurrences, unitActivities,
    mastery:activityDefinition(type)?.minimumStage === 'new' ? masteryNew : masteryBuilding,
    seed:`foundational:${type}`, ...overrides
  });
}

test('foundational catalogue types exist with the intended first-class response modes', () => {
  const expected = {
    definition_to_word:'choice', word_definition_match:'matching', drag_word_definition:'drag_match', drag_definition_word:'drag_match',
    gap_fill_bank:'choice', drag_word_sentence:'drag_gap', type_missing_word:'text', spell_word:'spelling',
    choose_word_sentence:'choice', word_family_choice:'choice'
  };
  for (const [type,responseMode] of Object.entries(expected)) {
    const definition = activityDefinition(type);
    assert.ok(definition, type);
    assert.equal(definition.responseMode, responseMode, type);
    assert.equal(definition.productive, false, type);
  }
});

test('definition and matching activities use plausible unit material and one primary evidence target', () => {
  const choice = build('definition_to_word');
  assert.equal(choice.contentSource, 'item');
  assert.ok(choice.options.includes('significant'));
  assert.equal(choice.options.length, 4);
  assert.ok(choice.options.every(option => unitItems.some(candidate => candidate.term === option)));

  for (const type of ['word_definition_match','drag_word_definition','drag_definition_word']) {
    const activity = build(type);
    assert.equal(activity.contentSource, 'item', type);
    assert.equal(activity.primaryEvidenceTargetId, item.vocabularyId, type);
    assert.ok(activity.pairs.length >= 3, type);
    assert.equal(activity.markingReference.acceptedAnswers.length >= 1, true, type);
    assert.ok(activity.pairs.some(pair => pair.vocabularyId === item.vocabularyId), type);
  }
});

test('retrieval activities create a real blank from curated context instead of inventing a sentence', () => {
  for (const type of ['gap_fill_bank','drag_word_sentence','type_missing_word','choose_word_sentence']) {
    const activity = build(type);
    assert.equal(activity.contentSource, 'context', type);
    assert.match(activity.sourceText, /____/u, type);
    assert.doesNotMatch(activity.sourceText, /important/u, type);
    assert.deepEqual(activity.markingReference.acceptedAnswers, ['significant'], type);
    assert.ok(activity.contextId, type);
  }
});

test('spelling requires retrieval of the target word without exposing the whole answer', () => {
  const activity = build('spell_word');
  assert.equal(activity.contentSource, 'item');
  assert.equal(activity.responseMode, 'spelling');
  assert.deepEqual(activity.markingReference.acceptedAnswers, ['significant']);
  assert.ok(activity.spellingPattern);
  assert.notEqual(activity.spellingPattern.toLocaleLowerCase('en'), 'significant');
});

test('word-family choice uses curated writing content and plausible family alternatives', () => {
  const activity = build('word_family_choice');
  assert.equal(activity.contentSource, 'unit_activity');
  assert.equal(activity.activityContentId, 'u1_family_significant');
  assert.ok(activity.options.includes('significantly'));
  assert.ok(activity.options.length >= 3);
  assert.deepEqual(activity.markingReference.acceptedAnswers, ['significantly']);
});

test('foundational builders fail closed when quality prerequisites are missing', () => {
  assert.throws(() => buildActivity({ activityType:'definition_to_word', occurrence, item, contexts, unitItems:[item], unitContexts:contexts, unitOccurrences:[occurrence], unitActivities, mastery:masteryNew }), /distractor|alternative|requires/i);
  assert.throws(() => buildActivity({ activityType:'gap_fill_bank', occurrence, item, contexts:[{ ...contexts[0], targetRewrite:'missing phrase' }], unitItems, unitContexts, unitOccurrences, unitActivities, mastery:masteryBuilding }), /blank|context|rewrite/i);
  assert.throws(() => buildActivity({ activityType:'word_family_choice', occurrence, item:{ ...item, wordFamily:[] }, contexts, unitItems:[{ ...item, wordFamily:[] }], unitContexts, unitOccurrences, unitActivities:[], mastery:masteryBuilding }), /word-family|word family|curated/i);
});

test('same seed produces stable foundational option and pair ordering', () => {
  assert.deepEqual(build('definition_to_word').options, build('definition_to_word').options);
  assert.deepEqual(build('word_definition_match').pairs, build('word_definition_match').pairs);
  assert.deepEqual(build('gap_fill_bank').options, build('gap_fill_bank').options);
});
