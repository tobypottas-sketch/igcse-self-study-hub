import test from 'node:test';
import assert from 'node:assert/strict';
import { buildActivity } from '../src/vocabulary/activity-factory.js';

const target = {
  vocabularyId:'v_preference', term:'preference', partOfSpeech:'noun', coreMeaning:'a greater liking for one option',
  wordFamily:['prefer','preference','preferable','preferably'],
  senses:[{ senseId:'s1', meaning:'a greater liking for one option' }]
};
const occurrence = { occurrenceId:'u1-preference', vocabularyId:target.vocabularyId, senseId:'s1', unitNumber:1 };
const unitItems = [
  target,
  { vocabularyId:'v_selection', term:'selection', partOfSpeech:'noun', coreMeaning:'a range to choose from', senses:[{ meaning:'a range to choose from' }], wordFamily:['select','selection','selective','selectively'] },
  { vocabularyId:'v_solution', term:'solution', partOfSpeech:'noun', coreMeaning:'an answer to a problem', senses:[{ meaning:'an answer to a problem' }], wordFamily:['solve','solution','solvable'] },
  { vocabularyId:'v_achievement', term:'achievement', partOfSpeech:'noun', coreMeaning:'something difficult completed successfully', senses:[{ meaning:'something difficult completed successfully' }], wordFamily:['achieve','achievement','achievable'] }
];
const contexts = [{
  contextId:'ctx-preference', type:'paraphrase_context',
  text:'Mina has a preference for individual sports rather than team games.',
  targetRewrite:'preference', acceptedAnswers:['preference']
}];
const unitActivities = [{
  activityContentId:'family-preference', contentType:'writing_set',
  activityData:{ taskType:'word_family', linkedVocabularyIds:[target.vocabularyId], primaryEvidenceTargetId:target.vocabularyId,
    prompt:'Use the correct form of prefer.', sourceText:'Her ____ is for individual sports.', acceptedAnswers:['preference'] }
}];
const mastery = { status:'building', strandEvidence:{} };

function build(activityType) {
  return buildActivity({
    activityType, occurrence, item:target, contexts, unitItems, unitActivities,
    mastery, readinessStage:'building', seed:`stage2:${activityType}`
  });
}

function assertMatchCard(question, presentation) {
  assert.equal(question.responseMode,'matching');
  assert.equal(typeof question.matchCue,'string');
  assert.ok(question.matchCue.trim().length > 0);
  assert.ok(Array.isArray(question.matchOptions));
  assert.equal(question.matchOptions.length,4);
  assert.equal(new Set(question.matchOptions).size,4);
  assert.ok(question.matchOptions.includes(question.markingReference.acceptedAnswers[0]));
  assert.equal(question.matchPresentation,presentation);
}

test('Meaning Match exposes a normalized Match Card cue and four options', () => {
  assertMatchCard(build('word_definition_match'),'meaning_word_to_definition');
});

test('Context Match exposes the gapped sentence once as the Match Card cue', () => {
  const question = build('context_sentence_match');
  assertMatchCard(question,'context_gap_to_word');
  assert.match(question.matchCue,/____/);
});

test('Word Family Match exposes same-family forms through the Match Card contract', () => {
  const question = build('word_family_match');
  assertMatchCard(question,'word_family_form');
  const family = new Set(target.wordFamily.map(value => value.toLowerCase()));
  assert.ok(question.matchOptions.every(value => family.has(value.toLowerCase())));
});

test('Spelling Match exposes all spelling variants simultaneously', () => {
  const question = build('spelling_cue_match');
  assertMatchCard(question,'spelling_visual_discrimination');
  assert.equal(question.matchCue,target.coreMeaning);
});
