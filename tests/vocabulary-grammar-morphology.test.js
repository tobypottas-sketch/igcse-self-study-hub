import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFoundationalActivity } from '../src/vocabulary/foundational-activity-builder.js';
import { buildCuratedUnit } from '../content/vocabulary/build-unit.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import { reviewedGapDistractors } from '../src/vocabulary/gapfill-distractors.js';

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
  return { occurrenceId:`u1_${item.term}`, unitNumber:1, vocabularyId:item.vocabularyId, senseId:`${item.term}_1` };
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
  // This sentence has teacher-reviewed wrong options (same form, none can also fit the blank).
  assert.deepEqual([...question.options].sort(),['denied',...reviewedGapDistractors('The athlete ____ that he had used a banned substance.','denied')].sort());
  assert.ok(!question.options.includes('deny'));
});

test('retrieval blanks the exact third-person form from a curated gap-fill sentence', () => {
  const question = buildFoundationalActivity({
    activityType:'gap_fill_bank',
    occurrence:occurrence(recommend),
    item:recommend,
    contexts:[{
      contextId:'recommend_gap',
      type:'gap_fill',
      text:'The trainer recommends stretching before intense exercise.',
      targetRewrite:'recommends',
      acceptedAnswers:['recommends']
    }],
    unitItems,
    mastery:{ status:'building' },
    seed:'third-person'
  });

  assert.equal(question.sourceText,'The trainer ____ stretching before intense exercise.');
  assert.deepEqual(question.markingReference.acceptedAnswers,['recommends']);
  assert.ok(question.options.includes('recommends'));
  assert.deepEqual([...question.options].sort(),['recommends',...reviewedGapDistractors('The trainer ____ stretching before intense exercise.','recommends')].sort());
});

test('paraphrase and meaning sentences are never blanked, because their blank would not match the answer form', () => {
  for (const type of ['paraphrase_context','meaning_context','production_context']) {
    assert.throws(() => buildFoundationalActivity({
      activityType:'gap_fill_bank',
      occurrence:occurrence(recommend),
      item:recommend,
      contexts:[{ contextId:`recommend_${type}`, type, text:'The trainer suggests stretching before intense exercise.', targetRewrite:'suggests', acceptedAnswers:['recommend'] }],
      unitItems,
      mastery:{ status:'building' },
      seed:'no-synonym-blank'
    }), /No curated context can form an accurate target-word blank/, type);
  }
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

test('a sentence without reviewed distractors falls back to same-form words from the unit', () => {
  const question = buildFoundationalActivity({
    activityType:'gap_fill_bank',
    occurrence:occurrence(recommend),
    item:recommend,
    contexts:[{ contextId:'recommend_new', type:'gap_fill', text:'The doctor recommends a long rest after the match.', targetRewrite:'recommends', acceptedAnswers:['recommends'] }],
    unitItems,
    mastery:{ status:'building' },
    seed:'fallback'
  });
  assert.equal(reviewedGapDistractors(question.sourceText,'recommends'),null);
  assert.ok(question.options.includes('recommends'));
  assert.ok(question.options.includes('denies'));
});
