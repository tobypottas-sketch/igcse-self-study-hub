// Unit 6 Word Families items (writing_set, taskType 'word_family'), WORDS 1–20 so far: three items for each word that has a genuine family.
// Same record shape as unit-05-word-family-items.js. Each sentence has one gap that exactly one form of the family completes, and the gap never
// opens the sentence. Only confidence, stagnate, engage, participate, active, reflect, strategy, forecast and distract have a genuine family in words 1–20, so the other eleven words have no items
// (see unit-06-word-families.js).
const unitNumber = 6;
const status = 'draft';
function family(id, vocabularyId, name, sourceText, acceptedAnswer) {
  return {
    activityContentId:`u6_writing_word_family_${id}`, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'word_family', prompt:`Use the correct form from the ${name} word family.`, sourceText, acceptedAnswers:[acceptedAnswer], linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}

export default [
  family('confidence_a', 'vocab_confidence', 'confidence', 'Daily practice gives learners more ____ before the speaking test.', 'confidence'),
  family('confidence_b', 'vocab_confidence', 'confidence', 'Maria felt ____ that she had revised the right topics.', 'confident'),
  family('confidence_c', 'vocab_confidence', 'confidence', 'Because he had prepared carefully, Ali answered the examiner’s questions ____.', 'confidently'),
  family('stagnate_a', 'vocab_stagnate', 'stagnate', 'Without new challenges, a talented student may ____ and make no further progress.', 'stagnate'),
  family('stagnate_b', 'vocab_stagnate', 'stagnate', 'After a long period of economic ____, the government introduced new policies to create jobs.', 'stagnation'),
  family('stagnate_c', 'vocab_stagnate', 'stagnate', 'Wages stayed ____ for years, even though prices continued to rise.', 'stagnant'),
  family('engage_a', 'vocab_engage', 'engage', 'Good teachers find ways to ____ every student in the lesson.', 'engage'),
  family('engage_b', 'vocab_engage', 'engage', 'Student ____ rises when lessons connect to real life.', 'engagement'),
  family('engage_c', 'vocab_engage', 'engage', 'The speaker gave an ____ talk that held the attention of the whole hall.', 'engaging'),
  family('participate_a', 'vocab_participate', 'participate', 'Every student is encouraged to ____ in the class debate.', 'participate'),
  family('participate_b', 'vocab_participate', 'participate', 'Active ____ in lessons improves both understanding and memory.', 'participation'),
  family('participate_c', 'vocab_participate', 'participate', 'Each ____ received a certificate at the end of the workshop.', 'participant'),
  family('active_a', 'vocab_active', 'active', 'Parents hope that their children will become ____ members of the school community.', 'active'),
  family('active_b', 'vocab_active', 'active', 'The art club organises a different ____ every Friday afternoon.', 'activity'),
  family('active_c', 'vocab_active', 'active', 'Employees who ____ ask questions during training usually learn the new system faster.', 'actively'),
  family('reflect_a', 'vocab_reflect', 'reflect', 'At the end of the course, learners are asked to ____ on what they have learned.', 'reflect'),
  family('reflect_b', 'vocab_reflect', 'reflect', 'Quiet ____ after each lesson helps students to notice their mistakes.', 'reflection'),
  family('reflect_c', 'vocab_reflect', 'reflect', 'The best teachers are ____ practitioners who regularly think about how their lessons went.', 'reflective'),
  family('strategy_a', 'vocab_strategy', 'strategy', 'Good students choose a different study ____ for each type of task.', 'strategy'),
  family('strategy_b', 'vocab_strategy', 'strategy', 'The manager made a ____ decision to open a branch near the university.', 'strategic'),
  family('strategy_c', 'vocab_strategy', 'strategy', 'The company opened its first shop ____ near the main station, where thousands of commuters pass every day.', 'strategically'),
  family('forecast_a', 'vocab_forecast', 'forecast', 'Scientists use satellite data to ____ the path of hurricanes.', 'forecast'),
  family('forecast_b', 'vocab_forecast', 'forecast', 'The ____ on the radio said it would rain all weekend.', 'forecaster'),
  family('forecast_c', 'vocab_forecast', 'forecast', 'Weather ____ has become more reliable because of satellites and powerful computers.', 'forecasting'),
  family('distract_a', 'vocab_distract', 'distract', 'Phone notifications can ____ students from important tasks.', 'distract'),
  family('distract_b', 'vocab_distract', 'distract', 'A tidy workspace removes every possible ____ and makes it easier to concentrate.', 'distraction'),
  family('distract_c', 'vocab_distract', 'distract', 'The sound of building work outside was so ____ that the teacher stopped the lesson.', 'distracting')
];
