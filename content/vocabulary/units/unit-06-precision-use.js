// Unit 6 Precision & Use content: two "weak wording -> precise word" items per word, WORDS 1–10 so far. Same contract as unit-05-precision-use.js:
// each item is a writing_set improve_vocabulary record; the weak wording quoted in the prompt appears exactly once in sourceText and not at its
// start; distractors fit the sentence grammatically but are wrong in meaning.
const status = 'draft';
const unitNumber = 6;
function precision(id, vocabularyId, prompt, sourceText, acceptedAnswers, distractors) {
  return {
    activityContentId:id, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'improve_vocabulary', prompt, sourceText, acceptedAnswers, distractors, linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}
const P = weak => `Replace “${weak}” with a more precise Unit 6 word or phrase.`;

export default [
  precision('u6_writing_precision_absorb_a', 'vocab_absorb', P('pick up'), 'Young children can pick up new words from the stories they hear every evening.', ['absorb'], ['spell', 'lend', 'refuse']),
  precision('u6_writing_precision_absorb_b', 'vocab_absorb', P('take in and understand'), 'Teachers should give students time to take in and understand what they have read before the next task begins.', ['absorb'], ['repeat', 'cancel', 'forget']),
  precision('u6_writing_precision_confidence_a', 'vocab_confidence', P('belief in themselves'), 'Learners who practise speaking every week develop belief in themselves when they have to answer in class.', ['confidence'], ['homework', 'permission', 'patience']),
  precision('u6_writing_precision_confidence_b', 'vocab_confidence', P('trust in her own ability'), 'After the successful presentation, she walked out of the hall with new trust in her own ability.', ['confidence'], ['sympathy', 'information', 'distance']),
  precision('u6_writing_precision_dilemma_a', 'vocab_dilemma', P('very hard choice'), 'Choosing between a scholarship abroad and staying near her family was a very hard choice for Mei.', ['dilemma'], ['holiday', 'prize', 'habit']),
  precision('u6_writing_precision_dilemma_b', 'vocab_dilemma', P('difficult choice between two options'), 'Parents often face a difficult choice between two options when deciding which school is best.', ['dilemma'], ['schedule', 'reward', 'tradition']),
  precision('u6_writing_precision_dramatically_a', 'vocab_dramatically', P('a lot'), 'The cost of university courses has risen a lot in recent years.', ['dramatically'], ['slightly', 'politely', 'rarely']),
  precision('u6_writing_precision_dramatically_b', 'vocab_dramatically', P('in a very big way'), 'Online learning has changed the way we study in a very big way.', ['dramatically'], ['slightly', 'neatly', 'quietly']),
  precision('u6_writing_precision_equivalent_a', 'vocab_equivalent', P('the same as'), 'Most universities say that this certificate is the same as an international qualification.', ['equivalent to'], ['superior to', 'unrelated to', 'opposite to']),
  precision('u6_writing_precision_equivalent_b', 'vocab_equivalent', P('of the same level as'), 'The new test is of the same level as the old one, so last year’s results can be compared with this year’s.', ['equivalent to'], ['harder than', 'older than', 'newer than']),
  precision('u6_writing_precision_overload_a', 'vocab_overload', P('give too much work to'), 'Teachers should not give too much work to students while they are preparing for external examinations.', ['overload'], ['ignore', 'excuse', 'reward']),
  precision('u6_writing_precision_overload_b', 'vocab_overload', P('ask too much of'), 'Some parents ask too much of their children by booking extra lessons every evening of the week.', ['overload'], ['excuse', 'forgive', 'abandon']),
  precision('u6_writing_precision_stagnate_a', 'vocab_stagnate', P('stop improving'), 'Many language learners stop improving after they pass their intermediate exam.', ['stagnate'], ['celebrate', 'graduate', 'qualify']),
  precision('u6_writing_precision_stagnate_b', 'vocab_stagnate', P('stay at the same level'), 'If you never try new methods, you will stay at the same level for years.', ['stagnate'], ['graduate', 'compete', 'recover']),
  precision('u6_writing_precision_engage_a', 'vocab_engage', P('get involved'), 'Students will remember the lesson better if they get involved with the topic.', ['engage'], ['argue', 'agree', 'compete']),
  precision('u6_writing_precision_engage_b', 'vocab_engage', P('show a real interest in'), 'Teachers hope that every student will show a real interest in the topic.', ['engage with'], ['argue with', 'agree with', 'compete with']),
  precision('u6_writing_precision_participate_a', 'vocab_participate', P('take part in'), 'More than a hundred students will take part in the sponsored walk next Saturday.', ['participate in'], ['succeed in', 'believe in', 'result in']),
  precision('u6_writing_precision_participate_b', 'vocab_participate', P('join in'), 'Visitors are invited to join in the activities at the science fair.', ['participate in'], ['succeed in', 'believe in', 'result in']),
  precision('u6_writing_precision_passive_a', 'vocab_passive', P('inactive'), 'Students who are inactive in lessons rarely remember what they hear.', ['passive'], ['unfriendly', 'impatient', 'unlucky']),
  precision('u6_writing_precision_passive_b', 'vocab_passive', P('not taking part in'), 'Students who are not taking part in discussions often forget the content quickly.', ['passive in'], ['noisy in', 'careless in', 'generous in'])
];
