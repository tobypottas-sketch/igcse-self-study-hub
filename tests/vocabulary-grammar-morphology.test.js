import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFoundationalActivity } from '../src/vocabulary/foundational-activity-builder.js';
import { buildCuratedUnit } from '../content/vocabulary/build-unit.js';
import { validateUnit } from '../content/vocabulary/schema.js';

function verbItem(vocabularyId, term, forms) {
  return {
    vocabularyId,
    term,
    partOfSpeech:'verb',
    coreMeaning:`meaning of ${term}`,
    senses:[{
      senseId:`${term}_1`,
      meaning:`meaning of ${term}`,
      acceptedParaphrases:[],
      contextDependentParaphrases:[],
      misleadingDistractors:[],
      grammarForms:forms
    }],
    wordFamily:[],
    collocations:[]
  };
}

const deny = verbItem('vocab_deny','deny',{ base:'deny', thirdPerson:'denies', past:'denied', pastParticiple:'denied', ing:'denying' });
const recommend = verbItem('vocab_recommend','recommend',{ base:'recommend', thirdPerson:'recommends', past:'recommended', pastParticiple:'recommended', ing:'recommending' });
const demand = verbItem('vocab_demand','demand',{ base:'demand', thirdPerson:'demands', past:'demanded', pastParticiple:'demanded', ing:'demanding' });
const regret = verbItem('vocab_regret','regret',{ base:'regret', thirdPerson:'regrets', past:'regretted', pastParticiple:'regretted', ing:'regretting' });
const unitItems = [deny,recommend,demand,regret];

function occurrence(item) {
  return { occurrenceId:`u1_${item.term}`, vocabularyId:item.vocabularyId, senseId:`${item.term}_1` };
}

test('retrieval uses the exact contextual past-tense answer and form-matched distractors', () => {
  const question = buildFoundationalActivity({
    activityType:'choose_word_sentence',
    occurrence:occurrence(deny),
    item:deny,
    contexts:[{
      contextId:'deny_past',
      type:'gap_fill',
      text:'The athlete denied that he had used a banned substance.',
      targetRewrite:'denied',
      acceptedAnswers:['denied']
    }],
    unitItems,
    mastery:{ status:'building' },
    seed:'past-form'
  });

  assert.equal(question.sourceText,'The athlete ____ that he had used a banned substance.');
  assert.deepEqual(question.markingReference.acceptedAnswers,['denied']);
  assert.ok(question.options.includes('denied'));
  assert.ok(question.options.includes('recommended'));
  assert.ok(question.options.includes('demanded'));
  assert.ok(question.options.includes('regretted'));
  assert.ok(!question.options.includes('deny'));
});

test('retrieval can derive a third-person answer from a natural meaning context', () => {
  const question = buildFoundationalActivity({
    activityType:'gap_fill_bank',
    occurrence:occurrence(recommend),
    item:recommend,
    contexts:[{
      contextId:'recommend_meaning',
      type:'meaning_context',
      text:'The trainer recommends stretching before intense exercise.',
      acceptedAnswers:['suggests']
    }],
    unitItems,
    mastery:{ status:'building' },
    seed:'third-person'
  });

  assert.equal(question.sourceText,'The trainer ____ stretching before intense exercise.');
  assert.deepEqual(question.markingReference.acceptedAnswers,['recommends']);
  assert.ok(question.options.includes('recommends'));
  assert.ok(question.options.includes('denies'));
  assert.ok(question.options.includes('demands'));
  assert.ok(question.options.includes('regrets'));
});

test('non-verbs keep exact lemma retrieval behaviour', () => {
  const leisure = {
    vocabularyId:'vocab_leisure', term:'leisure', partOfSpeech:'noun', coreMeaning:'free time',
    senses:[{ senseId:'leisure_1', meaning:'free time', acceptedParaphrases:['free time'], contextDependentParaphrases:[], misleadingDistractors:[] }],
    wordFamily:[], collocations:[]
  };
  const nouns = [leisure,
    { ...leisure, vocabularyId:'vocab_discipline', term:'discipline', senses:[{ ...leisure.senses[0], senseId:'discipline_1' }] },
    { ...leisure, vocabularyId:'vocab_criteria', term:'criteria', senses:[{ ...leisure.senses[0], senseId:'criteria_1' }] },
    { ...leisure, vocabularyId:'vocab_feat', term:'feat', senses:[{ ...leisure.senses[0], senseId:'feat_1' }] }
  ];
  const question = buildFoundationalActivity({
    activityType:'choose_word_sentence',
    occurrence:{ occurrenceId:'u1_leisure', vocabularyId:'vocab_leisure', senseId:'leisure_1' },
    item:leisure,
    contexts:[{ contextId:'leisure_gap', type:'gap_fill', text:'The centre offers several leisure activities.', targetRewrite:'leisure', acceptedAnswers:['leisure'] }],
    unitItems:nouns,
    mastery:{ status:'building' },
    seed:'noun-form'
  });
  assert.deepEqual(question.markingReference.acceptedAnswers,['leisure']);
});

test('buildCuratedUnit carries grammar forms, grammar patterns and retrieval contexts without new database columns', () => {
  const unit = buildCuratedUnit({
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    status:'draft',
    entries:[{
      term:'deny',
      partOfSpeech:'verb',
      meaning:'to say that something is not true',
      paraphrases:['say that something is not true'],
      distractors:['admit','confirm','allow'],
      meaningSentence:'The athlete denied using a banned substance.',
      paraphrase:{ source:'said it was not true', sentence:'The athlete said it was not true that he had used a banned substance.' },
      production:{ source:'say they did not', sentence:'Some athletes say they did not break the rules.' },
      grammarForms:{ base:'deny', thirdPerson:'denies', past:'denied', pastParticiple:'denied', ing:'denying' },
      grammarPatterns:['deny doing something','deny that + clause'],
      retrievalContexts:[
        { id:'past', text:'The athlete denied that he had used a banned substance.', target:'denied' },
        { id:'perfect', text:'Several athletes have denied the accusation.', target:'denied' }
      ]
    }]
  });

  const sense = unit.items[0].senses[0];
  assert.equal(sense.grammarForms.past,'denied');
  assert.deepEqual(sense.grammarPatterns,['deny doing something','deny that + clause']);
  const extra = unit.contexts.filter(context => context.type === 'gap_fill');
  assert.equal(extra.length,2);
  assert.deepEqual(extra.map(context => context.acceptedAnswers[0]),['denied','denied']);
  assert.ok(extra.every(context => context.targetRewrite === 'denied'));
  assert.equal(unit.occurrences[0].contextIds.length,5);
  assert.equal(validateUnit(unit).ok,true);
});
