import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVITY_TYPES, activityDefinition } from '../src/vocabulary/activity-catalogue.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';

const item = {
  vocabularyId:'vocab_significant',
  term:'significant',
  partOfSpeech:'adjective',
  coreMeaning:'important or large enough to be noticed or have an effect',
  senses:[{
    senseId:'significant_1',
    meaning:'important or large enough to be noticed or have an effect',
    acceptedParaphrases:['important','notable'],
    contextDependentParaphrases:[],
    misleadingDistractors:['famous','ordinary','tiny']
  }],
  wordFamily:['significance','significantly'],
  collocations:['significant increase','significant difference','significant impact']
};

const occurrence = {
  occurrenceId:'u1_46_significant', vocabularyId:item.vocabularyId, unitNumber:1,
  unitTitle:'Sports and Free Time', senseId:'significant_1'
};

const contexts = [
  { contextId:'sig_meaning', vocabularyId:item.vocabularyId, occurrenceId:occurrence.occurrenceId, senseId:'significant_1', type:'meaning_context', text:'The programme led to a significant improvement in results.', acceptedAnswers:['important'] },
  { contextId:'sig_para', vocabularyId:item.vocabularyId, occurrenceId:occurrence.occurrenceId, senseId:'significant_1', type:'paraphrase_context', text:'The programme led to an important improvement in results.', targetRewrite:'important', acceptedAnswers:['significant'] },
  { contextId:'sig_prod', vocabularyId:item.vocabularyId, occurrenceId:occurrence.occurrenceId, senseId:'significant_1', type:'production_context', text:'Regular exercise can have an important effect on mental wellbeing.', targetRewrite:'important', acceptedAnswers:['significant'] }
];

const unitActivities = [
  { activityContentId:'u1_phrase_significant', unitNumber:1, contentType:'phrase_set', status:'live', activityData:{ originalPhrase:'an important improvement', equivalentPhrase:'a significant improvement', acceptedVariants:['a notable improvement'], chunks:['a','significant','improvement'], commonMeaningDistortions:['a tiny improvement','an ordinary improvement'], linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } },
  { activityContentId:'u1_idea_significant', unitNumber:1, contentType:'idea_set', status:'live', activityData:{ originalIdea:'The programme led to a significant improvement in results.', accurateParaphrases:['The programme produced an important improvement in results.'], meaningInvariants:[{ type:'degree', value:'important improvement' }], distractors:[{ text:'The programme produced only a tiny improvement in results.', misconceptionCategory:'degree_change' }], chunks:['The programme','produced','an important improvement','in results.'], linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } },
  { activityContentId:'u1_qt_significant', unitNumber:1, contentType:'question_text', status:'live', activityData:{ sourceText:'The new training programme produced a significant improvement in attendance, although the change was smaller during winter.', questions:[{ question:'What important change did the programme produce?', evidenceSpans:['a significant improvement in attendance'], paraphraseLinks:[{ questionText:'important change', sourceText:'significant improvement' }] },{ question:'When was the change smaller?', evidenceSpans:['during winter'], paraphraseLinks:[{ questionText:'When', sourceText:'during winter' }] }], linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } },
  { activityContentId:'u1_writing_significant', unitNumber:1, contentType:'writing_set', status:'live', activityData:{ taskType:'improve_vocabulary', prompt:'Replace the vague word “big” with a more precise Unit 1 adjective.', sourceText:'The programme produced a big improvement in attendance.', acceptedAnswers:['significant'], linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } },
  { activityContentId:'u1_phrase_other', unitNumber:1, contentType:'phrase_set', status:'live', activityData:{ originalPhrase:'very important result', equivalentPhrase:'significant result', acceptedVariants:['notable result'], chunks:['significant','result'], commonMeaningDistortions:['ordinary result'], linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } },
  { activityContentId:'u1_idea_other', unitNumber:1, contentType:'idea_set', status:'live', activityData:{ originalIdea:'The club changed its timetable because evening sessions were poorly attended.', accurateParaphrases:['Low attendance caused the club to alter its evening timetable.'], meaningInvariants:[{ type:'cause_effect', value:'attendance caused timetable change' }], distractors:[{ text:'The club kept the same timetable because evening sessions were popular.', misconceptionCategory:'cause_effect_change' }], linkedVocabularyIds:['vocab_other'] } },
  { activityContentId:'u1_qt_other', unitNumber:1, contentType:'question_text', status:'live', activityData:{ sourceText:'The centre extended its opening hours after students asked for more time to practise. Weekend sessions also became cheaper so that more families could afford them.', questions:[{ question:'Why did the centre stay open longer?', evidenceSpans:['students asked for more time to practise'], paraphraseLinks:[{ questionText:'stay open longer', sourceText:'extended its opening hours' }] },{ question:'How did the centre make weekend sessions more accessible?', evidenceSpans:['Weekend sessions also became cheaper'], paraphraseLinks:[{ questionText:'more accessible', sourceText:'became cheaper' }] }], linkedVocabularyIds:['vocab_other'] } }
];

const masteryByStage = {
  new:{ status:'new', strandEvidence:{} },
  building:{ status:'building', strandEvidence:{ meaning:3, recognition:2, context:1 } },
  secure:{ status:'secure', strandEvidence:{ meaning:6, recognition:5, context:5, paraphrasing:5, production:2 } },
  mastered:{ status:'mastered', strandEvidence:{ meaning:8, recognition:8, context:8, paraphrasing:8, production:8 } }
};
function masteryFor(type) { return masteryByStage[activityDefinition(type).minimumStage]; }

test('builder constructs every approved 0511 activity with catalogue-aligned interaction metadata', () => {
  for (const definition of ACTIVITY_TYPES) {
    const activity = buildActivity({ activityType:definition.id, occurrence, item, contexts, unitActivities, mastery:masteryFor(definition.id), seed:'same-seed' });
    assert.equal(activity.type, definition.id, definition.id);
    assert.equal(activity.responseMode, definition.responseMode, definition.id);
    assert.equal(activity.skillFamily, definition.skillFamily, definition.id);
    assert.deepEqual(activity.strands, definition.strands, definition.id);
    assert.equal(activity.evidenceStrength, definition.evidenceStrength, definition.id);
    assert.ok(activity.activityId, definition.id);
    assert.ok(activity.prompt, definition.id);
    assert.ok(activity.markingReference && typeof activity.markingReference === 'object', definition.id);
  }
});

test('new learners are not handed blind high-stage retrieval when supported alternatives exist', () => {
  assert.throws(() => buildActivity({ activityType:'rewrite_phrase', occurrence, item, contexts, unitActivities, mastery:masteryByStage.new, seed:'new-learner' }), /not ready|stage|supported/i);
  const supported = buildActivity({ activityType:'meaning_match', occurrence, item, contexts, unitActivities, mastery:masteryByStage.new, seed:'new-learner' });
  assert.equal(supported.responseMode, 'choice');
  assert.ok(supported.options.length >= 2);
});

test('phrase and idea work uses the whole curated transformation rather than collapsing to a target synonym', () => {
  const phrase = buildActivity({ activityType:'build_paraphrase', occurrence, item, contexts, unitActivities, mastery:masteryByStage.building, seed:'phrase' });
  assert.ok(phrase.tiles.length >= 2);
  assert.match(phrase.prompt, /important/i);
  assert.ok(phrase.markingReference.acceptedAnswers.some(answer => answer.split(/\s+/).length >= 2));
  assert.notEqual(phrase.markingReference.acceptedAnswers[0].toLocaleLowerCase('en'), item.term.toLocaleLowerCase('en'));
  const idea = buildActivity({ activityType:'same_idea', occurrence, item, contexts, unitActivities, mastery:masteryByStage.building, seed:'idea' });
  assert.match(idea.prompt, /programme led to a significant improvement/i);
  assert.ok(idea.options.some(option => /important improvement/i.test(option)));
  assert.ok(idea.options.some(option => /tiny improvement/i.test(option)));
  assert.equal(idea.markingReference.acceptedAnswers.some(answer => /important improvement/i.test(answer)), true);
});

test('stable seed produces stable option and tile order', () => {
  const args = { occurrence, item, contexts, unitActivities, mastery:masteryByStage.building, seed:'stable-seed' };
  const choiceA = buildActivity({ ...args, activityType:'same_idea' });
  const choiceB = buildActivity({ ...args, activityType:'same_idea' });
  assert.deepEqual(choiceA.options, choiceB.options);
  const tilesA = buildActivity({ ...args, activityType:'build_paraphrase' });
  const tilesB = buildActivity({ ...args, activityType:'build_paraphrase' });
  assert.deepEqual(tilesA.tiles, tilesB.tiles);
});

test('used content IDs are avoided when another compatible curated record exists', () => {
  const first = buildActivity({ activityType:'phrase_match', occurrence, item, contexts, unitActivities, mastery:masteryByStage.new, seed:'avoid-used' });
  const second = buildActivity({ activityType:'phrase_match', occurrence, item, contexts, unitActivities, mastery:masteryByStage.new, usedContentIds:[first.contentId], seed:'avoid-used' });
  assert.notEqual(second.contentId, first.contentId);
});

test('Question ↔ Text activities expose one curated subquestion and a stable variant identifier', () => {
  const bridge = buildActivity({ activityType:'question_text_bridge', occurrence, item, contexts, unitActivities, mastery:masteryByStage.building, seed:'qt' });
  assert.equal(bridge.sourceText, unitActivities[2].activityData.sourceText);
  assert.match(bridge.activityVariantId, /^q\d+$/);
  assert.equal(bridge.markingReference.acceptedAnswers.length, 1);
  assert.equal(bridge.options.length, 4);
  assert.ok(bridge.options.every(option => option.endsWith('?')));

  const evidence = buildActivity({ activityType:'find_evidence', occurrence, item, contexts, unitActivities, mastery:masteryByStage.building, seed:'qt' });
  assert.equal(evidence.responseMode, 'evidence');
  assert.match(evidence.activityVariantId, /^q\d+$/);
  const selectedIndex = Number(evidence.activityVariantId.slice(1));
  const selectedAnswers = unitActivities[2].activityData.questions[selectedIndex].evidenceSpans;
  assert.deepEqual(evidence.markingReference.acceptedAnswers, selectedAnswers);
  assert.ok(evidence.evidenceOptions.includes(selectedAnswers[0]));
});
