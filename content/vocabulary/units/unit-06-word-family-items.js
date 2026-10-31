// Unit 6 Word Families items (writing_set, taskType 'word_family'), WORDS 1–40 so far: three items for each word that has a genuine family.
// Same record shape as unit-05-word-family-items.js. Each sentence has one gap that exactly one form of the family completes, and the gap never
// opens the sentence. Only confidence, stagnate, engage, participate, active, reflect, strategy, forecast, distract, evidence, concentration, motivation, effective, inefficient, awareness, respond, hesitation and independent have a genuine family in words 1–30, so the other sixteen words have no items
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
  family('distract_c', 'vocab_distract', 'distract', 'The sound of building work outside was so ____ that the teacher stopped the lesson.', 'distracting'),
  family('evidence_a', 'vocab_evidence', 'evidence', 'Reliable ____ is needed before a scientist can publish a result.', 'evidence'),
  family('evidence_b', 'vocab_evidence', 'evidence', 'After several weeks of practice, the improvement in her pronunciation was ____ to everyone.', 'evident'),
  family('evidence_c', 'vocab_evidence', 'evidence', 'The shop was ____ closed, since the lights were off and the door was locked.', 'evidently'),
  family('concentration_a', 'vocab_concentration', 'concentration', 'Loud music can reduce your ____ when you are solving maths problems.', 'concentration'),
  family('concentration_b', 'vocab_concentration', 'concentration', 'It is easier to ____ on a difficult text in a quiet library.', 'concentrate'),
  family('concentration_c', 'vocab_concentration', 'concentration', 'Ten minutes of ____ practice every day is better than one long, tired session.', 'concentrated'),
  family('motivation_a', 'vocab_motivation', 'motivation', 'Without ____, even talented students may stop trying.', 'motivation'),
  family('motivation_b', 'vocab_motivation', 'motivation', 'Praise and clear targets can ____ students who feel discouraged.', 'motivate'),
  family('motivation_c', 'vocab_motivation', 'motivation', 'Teachers prefer to work with ____ learners who want to improve.', 'motivated'),
  family('effective_a', 'vocab_effective', 'effective', 'Regular self-testing is a highly ____ way to learn vocabulary, and research shows that students remember far more.', 'effective'),
  family('effective_b', 'vocab_effective', 'effective', 'Students who plan their time ____ usually finish their work without stress.', 'effectively'),
  family('effective_c', 'vocab_effective', 'effective', 'Researchers measured the ____ of the scheme by comparing test scores before and after.', 'effectiveness'),
  family('inefficient_a', 'vocab_inefficient', 'inefficient', 'It is ____ to walk to three different offices when one online form would be enough.', 'inefficient'),
  family('inefficient_b', 'vocab_inefficient', 'inefficient', 'The company lost money because of ____ in the way orders were handled.', 'inefficiency'),
  family('inefficient_c', 'vocab_inefficient', 'inefficient', 'Employees who plan badly use their time ____ and finish work late.', 'inefficiently'),
  family('awareness_a', 'vocab_awareness', 'awareness', 'The campaign aims to increase public ____ of the risks of sunburn.', 'awareness'),
  family('awareness_b', 'vocab_awareness', 'awareness', 'Most drivers are ____ of the speed limit near the school.', 'aware'),
  family('awareness_c', 'vocab_awareness', 'awareness', 'Tom was completely ____ that his phone was ringing, because he was wearing headphones.', 'unaware'),
  family('respond_a', 'vocab_respond', 'respond', 'Companies must ____ quickly when customers report a fault.', 'respond'),
  family('respond_b', 'vocab_respond', 'respond', 'The council promised a full ____ to the complaint within a week.', 'response'),
  family('respond_c', 'vocab_respond', 'respond', 'Patients prefer a ____ doctor who listens and answers questions quickly.', 'responsive'),
  family('hesitation_a', 'vocab_hesitation', 'hesitation', 'She accepted the job without ____ because she had wanted it for years.', 'hesitation'),
  family('hesitation_b', 'vocab_hesitation', 'hesitation', 'Please do not ____ to ask for help if the instructions are unclear.', 'hesitate'),
  family('hesitation_c', 'vocab_hesitation', 'hesitation', 'He gave a ____ answer, as if he were not sure the figure was correct.', 'hesitant'),
  family('independent_a', 'vocab_independent', 'independent', 'Good courses help learners to become ____ so that they can study without a teacher.', 'independent'),
  family('independent_b', 'vocab_independent', 'independent', 'Many teenagers want more ____ from their parents when they reach sixteen.', 'independence'),
  family('independent_c', 'vocab_independent', 'independent', 'Please work ____ on this task and do not ask your neighbour for the answers.', 'independently')
];
