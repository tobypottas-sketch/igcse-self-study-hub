import test from 'node:test';
import assert from 'node:assert/strict';
import { buildActivity } from '../src/vocabulary/activity-factory.js';

const item = {
  vocabularyId:'vocab_preference', term:'preference', partOfSpeech:'noun',
  coreMeaning:'a greater liking for one option', wordFamily:['prefer','preference','preferable','preferably'],
  senses:[{ senseId:'s1', meaning:'a greater liking for one option' }]
};
const occurrence = { occurrenceId:'u01-v001', vocabularyId:item.vocabularyId, senseId:'s1', unitNumber:1 };
const unitItems = [
  item,
  { vocabularyId:'v2', term:'selection', partOfSpeech:'noun', wordFamily:['select','selection','selective'] },
  { vocabularyId:'v3', term:'solution', partOfSpeech:'noun', wordFamily:['solve','solution','solvable'] }
];
const unitActivities = [
  {
    activityContentId:'family-a', contentType:'writing_set',
    activityData:{ taskType:'word_family', linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId,
      prompt:'Use the correct form of preference.', sourceText:'Many students ____ individual sports.', acceptedAnswers:['prefer'] }
  },
  {
    activityContentId:'family-b', contentType:'writing_set',
    activityData:{ taskType:'word_family', linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId,
      prompt:'Use the correct form of preference.', sourceText:'Her ____ is for individual sports.', acceptedAnswers:['preference'] }
  }
];
const mastery = { status:'mastered' };

for (const activityType of ['word_family_choice','word_family_match','word_family_switch']) {
  test(`${activityType} prefers an unused curated Word Family prompt`, () => {
    const first = buildActivity({ activityType, occurrence, item, unitItems, unitActivities, mastery, seed:`${activityType}:first` });
    const second = buildActivity({ activityType, occurrence, item, unitItems, unitActivities, mastery, usedContentIds:[first.contentId], seed:`${activityType}:second` });
    assert.notEqual(second.contentId,first.contentId);
  });
}
