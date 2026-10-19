import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFoundationalActivity } from '../src/vocabulary/foundational-activity-builder.js';

function occurrenceFor(item) {
  return {
    occurrenceId:`u1_${item.vocabularyId}`,
    vocabularyId:item.vocabularyId,
    senseId:item.senses[0].senseId
  };
}

function build({ item, context, unitItems }) {
  return buildFoundationalActivity({
    activityType:'gap_fill_bank',
    occurrence:occurrenceFor(item),
    item,
    contexts:[context],
    unitItems,
    mastery:{ status:'mastered' },
    seed:'retrieval-quality'
  });
}

const nounTarget = {
  vocabularyId:'vocab_leisure',
  term:'leisure',
  partOfSpeech:'noun',
  senses:[{
    senseId:'leisure_1',
    meaning:'free time',
    misleadingDistractors:['salary','training','deadline']
  }]
};

const nounContext = {
  contextId:'u1_leisure_meaning',
  type:'meaning_context',
  text:'Many students use their leisure to play sport or meet friends.'
};

test('base-form retrieval prefers authored misleading distractors over random same-POS words', () => {
  const unitItems = [
    nounTarget,
    { vocabularyId:'vocab_opponent', term:'opponent', partOfSpeech:'noun', senses:[{ senseId:'opponent_1', meaning:'rival' }] },
    { vocabularyId:'vocab_tournament', term:'tournament', partOfSpeech:'noun', senses:[{ senseId:'tournament_1', meaning:'competition' }] },
    { vocabularyId:'vocab_patience', term:'patience', partOfSpeech:'noun', senses:[{ senseId:'patience_1', meaning:'calm persistence' }] }
  ];
  const activity = build({ item:nounTarget, context:nounContext, unitItems });
  assert.deepEqual(new Set(activity.options), new Set(['leisure','salary','training','deadline']));
});

const denyTarget = {
  vocabularyId:'vocab_deny',
  term:'deny',
  partOfSpeech:'verb',
  senses:[{
    senseId:'deny_1',
    meaning:'say something is not true',
    misleadingDistractors:['recommend','permit','arrange'],
    grammarForms:{ base:'deny', thirdPerson:'denies', past:'denied', pastParticiple:'denied', ing:'denying' }
  }]
};

const denyContext = {
  contextId:'u1_deny_gap_past',
  type:'gap_fill',
  text:'The athlete denied that he had used a banned substance.',
  targetRewrite:'denied',
  acceptedAnswers:['denied']
};

const verbItems = [
  denyTarget,
  { vocabularyId:'vocab_recommend', term:'recommend', partOfSpeech:'verb', senses:[{ senseId:'recommend_1', meaning:'suggest', grammarForms:{ base:'recommend', thirdPerson:'recommends', past:'recommended', pastParticiple:'recommended', ing:'recommending' } }] },
  { vocabularyId:'vocab_permit', term:'permit', partOfSpeech:'verb', senses:[{ senseId:'permit_1', meaning:'allow', grammarForms:{ base:'permit', thirdPerson:'permits', past:'permitted', pastParticiple:'permitted', ing:'permitting' } }] },
  { vocabularyId:'vocab_arrange', term:'arrange', partOfSpeech:'verb', senses:[{ senseId:'arrange_1', meaning:'organise', grammarForms:{ base:'arrange', thirdPerson:'arranges', past:'arranged', pastParticiple:'arranged', ing:'arranging' } }] }
];

test('inflected verb retrieval mixes grammar near-misses with an authored semantic distractor in the same form', () => {
  const activity = build({ item:denyTarget, context:denyContext, unitItems:verbItems });
  const wrong = activity.options.filter(option => option !== 'denied');
  const grammarNearMisses = wrong.filter(option => ['deny','denies','denying'].includes(option));
  const semanticSameForm = wrong.filter(option => ['recommended','permitted','arranged'].includes(option));
  assert.ok(grammarNearMisses.length >= 2, `expected at least two target-form near misses, got ${wrong.join(', ')}`);
  assert.ok(semanticSameForm.length >= 1, `expected one authored semantic distractor in past form, got ${wrong.join(', ')}`);
});
