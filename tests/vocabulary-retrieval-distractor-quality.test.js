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
  vocabularyId:'vocab_downtime_fixture',
  term:'downtime',
  partOfSpeech:'noun',
  senses:[{
    senseId:'downtime_fixture_1',
    meaning:'free time',
    misleadingDistractors:['salary','training','deadline']
  }]
};

const nounContext = {
  contextId:'u1_downtime_fixture_meaning',
  type:'meaning_context',
  text:'Many students use their downtime to play sport or meet friends.'
};

test('base-form retrieval prefers authored misleading distractors over random same-POS words when no reviewed language bank exists', () => {
  const unitItems = [
    nounTarget,
    { vocabularyId:'vocab_opponent', term:'opponent', partOfSpeech:'noun', senses:[{ senseId:'opponent_1', meaning:'rival' }] },
    { vocabularyId:'vocab_tournament', term:'tournament', partOfSpeech:'noun', senses:[{ senseId:'tournament_1', meaning:'competition' }] },
    { vocabularyId:'vocab_patience', term:'patience', partOfSpeech:'noun', senses:[{ senseId:'patience_1', meaning:'calm persistence' }] }
  ];
  const activity = build({ item:nounTarget, context:nounContext, unitItems });
  assert.deepEqual(new Set(activity.options), new Set(['downtime','salary','training','deadline']));
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

test('inflected verb retrieval prefers semantic distractors in the same grammatical form', () => {
  const activity = build({ item:denyTarget, context:denyContext, unitItems:verbItems });
  assert.deepEqual(new Set(activity.options), new Set(['denied','recommended','permitted','arranged']));
  assert.ok(!activity.options.some(option => ['deny','denies','denying'].includes(option)));
});
