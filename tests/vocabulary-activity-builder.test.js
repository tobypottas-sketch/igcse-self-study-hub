import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVITY_TYPES, activityDefinition } from '../src/vocabulary/activity-catalogue.js';
import { buildActivity } from '../src/vocabulary/activity-factory.js';

const item = {
  vocabularyId:'vocab_significant', term:'significant', partOfSpeech:'adjective',
  coreMeaning:'of great weight or large enough to be noticed or have an effect',
  senses:[{ senseId:'significant_1', meaning:'of great weight or large enough to be noticed or have an effect', acceptedParaphrases:['important','notable'], contextDependentParaphrases:[], misleadingDistractors:['famous','ordinary','tiny'], masteryContexts:[
    { contextId:'sig_meaning', text:'The programme led to a significant improvement in results.', meaning:'important enough to affect results' },
    { contextId:'sig_para', text:'The programme had an effect large enough to notice.', meaning:'meaningful enough to make a difference' }
  ] }],
  wordFamily:['significance','significantly'], collocations:['significant increase','significant difference','significant impact']
};
const occurrence = { occurrenceId:'u1_46_significant', vocabularyId:item.vocabularyId, unitNumber:1, unitTitle:'Sports and Free Time', senseId:'significant_1' };
const unitItems = [
  item,
  { vocabularyId:'vocab_essential', term:'essential', partOfSpeech:'adjective', coreMeaning:'completely necessary', senses:[{ senseId:'essential_1', meaning:'completely necessary', acceptedParaphrases:['necessary'] }], wordFamily:['essentially'] },
  { vocabularyId:'vocab_competitive', term:'competitive', partOfSpeech:'adjective', coreMeaning:'wanting to win', senses:[{ senseId:'competitive_1', meaning:'wanting to win', acceptedParaphrases:['keen to win'] }], wordFamily:['competition','competitively'] },
  { vocabularyId:'vocab_overwhelming', term:'overwhelming', partOfSpeech:'adjective', coreMeaning:'very strong or difficult to manage', senses:[{ senseId:'overwhelming_1', meaning:'very strong or difficult to manage', acceptedParaphrases:['very powerful'] }], wordFamily:['overwhelm','overwhelmingly'] }
];
const contexts = [
  { contextId:'sig_meaning', vocabularyId:item.vocabularyId, occurrenceId:occurrence.occurrenceId, senseId:'significant_1', type:'meaning_context', text:'The programme led to a significant improvement in results.', acceptedAnswers:['important'] },
  { contextId:'sig_para', vocabularyId:item.vocabularyId, occurrenceId:occurrence.occurrenceId, senseId:'significant_1', type:'paraphrase_context', text:'The programme led to an important improvement in results.', targetRewrite:'important', acceptedAnswers:['significant'] },
  { contextId:'sig_gap', vocabularyId:item.vocabularyId, occurrenceId:occurrence.occurrenceId, senseId:'significant_1', type:'gap_fill', text:'The new programme led to a significant improvement in results.', targetRewrite:'significant', acceptedAnswers:['significant'] },
  { contextId:'sig_prod', vocabularyId:item.vocabularyId, occurrenceId:occurrence.occurrenceId, senseId:'significant_1', type:'production_context', text:'Regular exercise can have an important effect on mental wellbeing.', targetRewrite:'important', acceptedAnswers:['significant'] }
];
const unitActivities = [
  { activityContentId:'u1_phrase_significant', unitNumber:1, contentType:'phrase_set', status:'live', activityData:{ originalPhrase:'an important gain', equivalentPhrase:'a significant improvement', acceptedVariants:['a notable improvement'], chunks:['a','significant','improvement'], commonMeaningDistortions:['a tiny improvement','an ordinary improvement','a temporary improvement'], linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } },
  { activityContentId:'u1_idea_significant', unitNumber:1, contentType:'idea_set', status:'live', activityData:{ originalIdea:'The programme led to a significant improvement in results.', accurateParaphrases:['The programme produced an important improvement in results.','The programme brought about a notable improvement in results.','Results improved in an important way because of the programme.'], meaningInvariants:[{ type:'degree', value:'important improvement' }], distractors:[
    { text:'The programme produced only a tiny improvement in results.', misconceptionCategory:'degree_change' },
    { text:'The programme caused results to become noticeably worse.', misconceptionCategory:'meaning_confusion' },
    { text:'The programme had no clear effect on the final results.', misconceptionCategory:'omitted_information' }
  ], chunks:['The programme','produced','an important improvement','in results.'], linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } },
  { activityContentId:'u1_qt_significant', unitNumber:1, contentType:'question_text', status:'live', activityData:{ sourceText:'The new training programme produced a significant improvement in attendance, although the change was smaller during winter.', questions:[{ question:'What important change did the programme produce?', evidenceSpans:['a significant improvement in attendance'], paraphraseLinks:[{ questionText:'important change', sourceText:'significant improvement' }] },{ question:'When was the change smaller?', evidenceSpans:['during winter'], paraphraseLinks:[{ questionText:'When', sourceText:'during winter' }] }], linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } },
  { activityContentId:'u1_writing_significant', unitNumber:1, contentType:'writing_set', status:'live', activityData:{ taskType:'improve_vocabulary', prompt:'Replace the vague word “big” with a more precise Unit 1 adjective.', sourceText:'The programme produced a big improvement in attendance.', acceptedAnswers:['significant'], linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } },
  { activityContentId:'u1_writing_significant_family', unitNumber:1, contentType:'writing_set', status:'live', activityData:{ taskType:'word_family', prompt:'Use the correct form from the significant word family.', sourceText:'Attendance increased ____ after the new programme began.', acceptedAnswers:['significantly'], linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } },
  { activityContentId:'u1_phrase_other', unitNumber:1, contentType:'phrase_set', status:'live', activityData:{ originalPhrase:'very important result', equivalentPhrase:'significant result', acceptedVariants:['notable result'], chunks:['significant','result'], commonMeaningDistortions:['ordinary result','minor result','unrelated result'], linkedVocabularyIds:[item.vocabularyId], primaryEvidenceTargetId:item.vocabularyId } },
  { activityContentId:'u1_idea_other', unitNumber:1, contentType:'idea_set', status:'live', activityData:{ originalIdea:'The club changed its timetable because evening sessions were poorly attended.', accurateParaphrases:['Low attendance caused the club to alter its evening timetable.'], meaningInvariants:[{ type:'cause_effect', value:'attendance caused timetable change' }], distractors:[
    { text:'The club kept the same timetable because evening sessions were popular.', misconceptionCategory:'cause_effect_change' },
    { text:'The club changed its timetable before attendance began to fall.', misconceptionCategory:'time_change' },
    { text:'Evening attendance improved because the club refused to change its timetable.', misconceptionCategory:'cause_effect_change' }
  ], linkedVocabularyIds:['vocab_other'] } },
  { activityContentId:'u1_qt_other', unitNumber:1, contentType:'question_text', status:'live', activityData:{ sourceText:'The centre extended its opening hours after students asked for more time to practise. Weekend sessions also became cheaper so that more families could afford them.', questions:[{ question:'Why did the centre stay open longer?', evidenceSpans:['students asked for more time to practise'], paraphraseLinks:[{ questionText:'stay open longer', sourceText:'extended its opening hours' }] },{ question:'How did the centre make weekend sessions more accessible?', evidenceSpans:['Weekend sessions also became cheaper'], paraphraseLinks:[{ questionText:'more accessible', sourceText:'became cheaper' }] }], linkedVocabularyIds:['vocab_other'] } }
];
const masteryByStage = {
  new:{ status:'new', strandEvidence:{} }, building:{ status:'building', strandEvidence:{ meaning:3, recognition:2, context:1 } },
  secure:{ status:'secure', strandEvidence:{ meaning:6, recognition:5, context:5, paraphrasing:5, production:2 } }, mastered:{ status:'mastered', strandEvidence:{ meaning:8, recognition:8, context:8, paraphrasing:8, production:8 } }
};
function masteryFor(type) { return masteryByStage[activityDefinition(type).minimumStage]; }
function build(type, overrides = {}) {
  return buildActivity({ activityType:type, occurrence, item, contexts, unitActivities, unitItems, unitContexts:contexts, unitOccurrences:[occurrence], mastery:masteryFor(type), seed:'same-seed', ...overrides });
}

test('builder constructs every approved 0511 activity with catalogue-aligned interaction metadata', () => {
  for (const definition of ACTIVITY_TYPES.filter(candidate => candidate.retired !== true)) {
    const activity = build(definition.id);
    assert.equal(activity.type, definition.id, definition.id); assert.equal(activity.responseMode, definition.responseMode, definition.id);
    assert.equal(activity.skillFamily, definition.skillFamily, definition.id); assert.deepEqual(activity.strands, definition.strands, definition.id);
    assert.equal(activity.evidenceStrength, definition.evidenceStrength, definition.id); assert.ok(activity.activityId, definition.id); assert.ok(activity.prompt, definition.id);
    assert.ok(activity.markingReference && typeof activity.markingReference === 'object', definition.id);
  }
});
test('new learners are not handed blind high-stage retrieval when supported alternatives exist', () => {
  assert.throws(() => buildActivity({ activityType:'rewrite_phrase', occurrence, item, contexts, unitActivities, unitItems, mastery:masteryByStage.new, seed:'new-learner' }), /not ready|stage|supported/i);
  const supported = buildActivity({ activityType:'meaning_match', occurrence, item, contexts, unitActivities, unitItems, mastery:masteryByStage.new, seed:'new-learner' });
  assert.equal(supported.responseMode, 'choice'); assert.ok(supported.options.length >= 2);
});
test('phrase and idea work uses the whole curated transformation rather than collapsing to a target synonym', () => {
  const phrase = build('build_paraphrase', { mastery:masteryByStage.building, seed:'phrase' });
  assert.ok(phrase.tiles.length >= 2); assert.match(phrase.prompt, /important/i); assert.ok(phrase.markingReference.acceptedAnswers.some(answer => answer.split(/\s+/).length >= 2));
  assert.notEqual(phrase.markingReference.acceptedAnswers[0].toLocaleLowerCase('en'), item.term.toLocaleLowerCase('en'));
  const idea = build('same_idea', { mastery:masteryByStage.building, seed:'idea' });
  const ideaData = unitActivities[1].activityData;
  assert.match(idea.prompt, /programme led to a significant improvement/i);
  assert.equal(idea.markingReference.acceptedAnswers.length, 1);
  assert.match(idea.activityVariantId, /^q\d+$/);
  const selectedIndex = Number(idea.activityVariantId.slice(1));
  assert.equal(idea.markingReference.acceptedAnswers[0], ideaData.accurateParaphrases[selectedIndex]);
  assert.ok(idea.options.includes(idea.markingReference.acceptedAnswers[0]));
  assert.ok(idea.options.some(option => /tiny improvement/i.test(option)));
  assert.ok(idea.markingReference.acceptedAnswers[0].split(/\s+/).length >= 6);
});
test('stable seed produces stable option and tile order', () => {
  const args = { occurrence, item, contexts, unitActivities, unitItems, mastery:masteryByStage.building, seed:'stable-seed' };
  assert.deepEqual(buildActivity({ ...args, activityType:'same_idea' }).options, buildActivity({ ...args, activityType:'same_idea' }).options);
  assert.deepEqual(buildActivity({ ...args, activityType:'build_paraphrase' }).tiles, buildActivity({ ...args, activityType:'build_paraphrase' }).tiles);
});
test('used content IDs are avoided when another compatible curated record exists', () => {
  const first = build('phrase_match', { mastery:masteryByStage.new, seed:'avoid-used' });
  const second = build('phrase_match', { mastery:masteryByStage.new, usedContentIds:[first.contentId], seed:'avoid-used' });
  assert.notEqual(second.contentId, first.contentId);
});
test('Question ↔ Text activities expose one curated subquestion and a stable variant identifier', () => {
  const bridge = build('question_text_bridge', { mastery:masteryByStage.building, seed:'qt' });
  assert.equal(bridge.sourceText, unitActivities[2].activityData.sourceText); assert.match(bridge.activityVariantId, /^q\d+$/); assert.equal(bridge.markingReference.acceptedAnswers.length, 1); assert.equal(bridge.options.length, 4);
  assert.ok(bridge.options.every(option => option.endsWith('?')));
  const evidence = build('find_evidence', { mastery:masteryByStage.building, seed:'qt' });
  assert.equal(evidence.responseMode, 'evidence'); assert.match(evidence.activityVariantId, /^q\d+$/);
  const selectedIndex = Number(evidence.activityVariantId.slice(1)); const selectedAnswers = unitActivities[2].activityData.questions[selectedIndex].evidenceSpans;
  assert.deepEqual(evidence.markingReference.acceptedAnswers, selectedAnswers); assert.ok(evidence.evidenceOptions.includes(selectedAnswers[0]));
});
