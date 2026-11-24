// Unit 10 Precision & Use content: two "weak wording -> precise word" items per word, WORDS 1–48 (complete). Same contract as unit-09-precision-use.js:
// each item is a writing_set improve_vocabulary record; the weak wording quoted in the prompt appears exactly once in sourceText and not at its
// start; distractors fit the sentence grammatically but are wrong in meaning.
const status = 'approved';
const unitNumber = 10;
function precision(id, vocabularyId, prompt, sourceText, acceptedAnswers, distractors) {
  return {
    activityContentId:id, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'improve_vocabulary', prompt, sourceText, acceptedAnswers, distractors, linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}
const P = weak => `Replace “${weak}” with a more precise Unit 10 word or phrase.`;
const x = (term, vocabularyId, rows) => rows.map(([suffix, weak, sourceText, distractors]) => precision(`u10_writing_precision_${term.replace(/[^a-z]+/g, '_')}_${suffix}`, vocabularyId, P(weak), sourceText, [term], distractors));

export default [
  ...x('education', 'vocab_education', [
    ['a', 'schooling', 'Every child in the country has the right to free schooling until the age of sixteen.', ['employment', 'recreation', 'industry']],
    ['b', 'learning', 'The charity believes that learning at school is the best way out of poverty.', ['loneliness', 'recreation', 'employment']]
  ]),
  ...x('higher education', 'vocab_higher_education', [
    ['a', 'more study after school', 'Most of my friends want to go into more study after school when they finish their exams.', ['employment', 'recreation', 'industry']],
    ['b', 'university study', 'The cost of university study has risen sharply in the last ten years.', ['recreation', 'loneliness', 'industry']]
  ]),
  ...x('university', 'vocab_university', [
    ['a', 'a big college for degrees', 'My cousin is studying law at a big college for degrees in Manchester.', ['industry', 'recreation', 'employment']],
    ['b', 'the place where degrees are studied', 'She was the first person in her family to go to the place where degrees are studied.', ['industry', 'recreation', 'literacy']]
  ]),
  ...x('academic', 'vocab_academic_10', [
    ['a', 'study-based', 'The school is proud of its strong study-based results this year.', ['reluctant', 'cosmopolitan', 'overseas']],
    ['b', 'school-related', 'He is a talented footballer, but his school-related work has suffered this term.', ['reluctant', 'cosmopolitan', 'overseas']]
  ]),
  ...x('recreation', 'vocab_recreation', [
    ['a', 'fun things to do', 'The new park offers space for sport and fun things to do.', ['employment', 'assessment', 'industry']],
    ['b', 'free-time activities', 'Students need time for free-time activities as well as for study.', ['assessment', 'employment', 'preparation']]
  ]),
  ...x('literacy', 'vocab_literacy', [
    ['a', 'reading and writing', 'The government wants to improve reading and writing among adults in rural areas.', ['recreation', 'employment', 'industry']],
    ['b', 'reading ability', 'Bedtime stories help young children develop early reading ability.', ['employment', 'industry', 'loneliness']]
  ]),
  ...x('assessment', 'vocab_assessment', [
    ['a', 'checking of work', 'There is no final exam, so the regular checking of work throughout the year decides your grade.', ['recreation', 'loneliness', 'industry']],
    ['b', 'judgement', 'The doctor made a quick judgement of the injured player before the game continued.', ['recreation', 'presentation', 'preference']]
  ]),
  ...x('international crisis', 'vocab_international_crisis', [
    ['a', 'big world problem', 'Governments met to discuss the big world problem caused by the rapid spread of the disease.', ['qualification', 'achievement', 'opportunity']],
    ['b', 'global emergency', 'Rising food prices in many countries have caused the worst global emergency in decades.', ['achievement', 'opportunity', 'qualification']]
  ]),
  ...x('digital device', 'vocab_digital_device', [
    ['a', 'gadget', 'Please switch off any electronic gadget before the exam begins.', ['qualification', 'achievement', 'opinion']],
    ['b', 'phone or tablet thing', 'The library lends a phone or tablet thing to students who do not have one.', ['qualification', 'achievement', 'opinion']]
  ]),
  ...x('progress', 'vocab_progress', [
    ['a', 'getting better', 'The teacher was pleased with the getting better that the class had shown in writing.', ['loneliness', 'recreation', 'literacy']],
    ['b', 'improvement', 'Scientists are making steady improvement in the search for a cure.', ['recreation', 'loneliness', 'literacy']]
  ]),
  ...x('encourage', 'vocab_encourage', [
    ['a', 'push', 'Good teachers push shy students to share their ideas.', ['evaluate', 'reflect', 'succeed']],
    ['b', 'get', 'The city built cycle lanes to get more people to ride bikes.', ['reflect', 'evaluate', 'succeed']]
  ]),
  ...x('reflect', 'vocab_reflect_10', [
    ['a', 'think', 'At the end of each term, students think on what they have learned.', ['contribute', 'encourage', 'succeed']],
    ['b', 'look back', 'Take a few minutes to look back on how well your group worked.', ['contribute', 'encourage', 'develop']]
  ]),
  ...x('performance', 'vocab_performance', [
    ['a', 'results', 'Her teachers were impressed by her results in the final exam.', ['loneliness', 'recreation', 'literacy']],
    ['b', 'show', 'The school choir gave a wonderful show at the end-of-year concert.', ['loneliness', 'recreation', 'assessment']]
  ]),
  ...x('confidence', 'vocab_confidence_10', [
    ['a', 'belief in herself', 'Speaking in class every day gave her more belief in herself in English.', ['loneliness', 'recreation', 'literacy']],
    ['b', 'courage', 'The good mark gave him the courage to try the advanced course.', ['loneliness', 'literacy', 'recreation']]
  ]),
  ...x('contribute', 'vocab_contribute_10', [
    ['a', 'give', 'All students are expected to give ideas to class discussions.', ['succeed', 'reflect', 'evaluate']],
    ['b', 'add', 'Too much screen time can add to poor concentration.', ['succeed', 'reflect', 'evaluate']]
  ]),
  ...x('condition', 'vocab_condition', [
    ['a', 'rule', 'You can borrow the laptop on one rule: you return it by Friday.', ['loneliness', 'recreation', 'literacy']],
    ['b', 'state', 'Although the car is old, it is still in excellent state.', ['recreation', 'loneliness', 'literacy']]
  ]),
  ...x('conditional', 'vocab_conditional', [
    ['a', 'if-sentence', 'The sentence “If I were rich, I would travel” is a second if-sentence.', ['discussion', 'presentation', 'opinion']],
    ['b', 'sentence with if', 'Try to include at least one sentence with if in your persuasive speech.', ['discussion', 'presentation', 'opinion']]
  ]),
  ...x('preparation', 'vocab_preparation', [
    ['a', 'getting ready', 'Good getting ready is the key to doing well in exams.', ['loneliness', 'recreation', 'literacy']],
    ['b', 'planning', 'The athletes trained every day in planning for the race.', ['recreation', 'loneliness', 'intonation']]
  ]),
  ...x('employment', 'vocab_employment_10', [
    ['a', 'work', 'A good qualification makes it easier to find work in a big city.', ['loneliness', 'recreation', 'literacy']],
    ['b', 'paid jobs', 'Many young people move to cities in search of paid jobs.', ['loneliness', 'pronunciation', 'intonation']]
  ]),
  ...x('career', 'vocab_career', [
    ['a', 'job for life', 'She wants a job for life in medicine, so she is studying biology.', ['loneliness', 'recreation', 'literacy']],
    ['b', 'working life', 'During his long working life as a footballer, he played for five clubs.', ['loneliness', 'literacy', 'recreation']]
  ]),
  ...x('subject', 'vocab_subject', [
    ['a', 'thing we study', 'History is a popular thing we study at our school.', ['loneliness', 'recreation', 'literacy']],
    ['b', 'topic', 'He felt uncomfortable and quickly changed the topic.', ['loneliness', 'literacy', 'recreation']]
  ]),
  ...x('aspect', 'vocab_aspect', [
    ['a', 'part', 'The most difficult part of learning a language is remembering vocabulary.', ['loneliness', 'literacy', 'recreation']],
    ['b', 'side', 'For many students, the social side of university is as important as studying.', ['loneliness', 'literacy', 'recreation']]
  ]),
  ...x('industry', 'vocab_industry', [
    ['a', 'business world', 'The tourism business world employs thousands of people in our country.', ['loneliness', 'literacy', 'intonation']],
    ['b', 'businesses', 'She wants to work in the fashion businesses as a designer.', ['loneliness', 'literacy', 'pronunciation']]
  ]),
  ...x('interview', 'vocab_interview', [
    ['a', 'meeting', 'He wore a suit to his meeting with the manager for the job at the bank.', ['literacy', 'loneliness', 'recreation']],
    ['b', 'chat', 'The magazine published its chat with the famous singer.', ['literacy', 'loneliness', 'recreation']]
  ]),
  ...x('overseas', 'vocab_overseas', [
    ['a', 'foreign', 'The university welcomes foreign students from eighty countries.', ['reluctant', 'academic', 'lonely']],
    ['b', 'from abroad', 'The number of visitors from abroad to the city has doubled.', ['reluctant', 'academic', 'lonely']]
  ]),
  ...x('challenge', 'vocab_challenge_10', [
    ['a', 'hard thing', 'Writing an essay in a foreign language is a real hard thing.', ['loneliness', 'literacy', 'recreation']],
    ['b', 'difficulty', 'The biggest difficulty for new students is making friends.', ['literacy', 'pronunciation', 'recreation']]
  ]),
  ...x('reluctant', 'vocab_reluctant', [
    ['a', 'unwilling', 'Many students are unwilling to speak English in front of the class.', ['academic', 'overseas', 'cosmopolitan']],
    ['b', 'not keen', 'He was not keen to try the spicy food, but he loved it.', ['academic', 'overseas', 'cosmopolitan']]
  ]),
  ...x('cosmopolitan', 'vocab_cosmopolitan', [
    ['a', 'multicultural', 'London is a multicultural city where you can hear hundreds of languages.', ['reluctant', 'academic', 'lonely']],
    ['b', 'very international', 'The school has a very international atmosphere, with students from thirty countries.', ['reluctant', 'lonely', 'accurate']]
  ]),
  ...x('assignment', 'vocab_assignment_10', [
    ['a', 'homework task', 'The history homework task must be handed in by Friday.', ['loneliness', 'literacy', 'recreation']],
    ['b', 'piece of work', 'Late work loses marks, so hand in your piece of work on time.', ['loneliness', 'literacy', 'intonation']]
  ]),
  ...x('loneliness', 'vocab_loneliness', [
    ['a', 'sadness', 'Many overseas students feel sadness in their first weeks away from home because they know nobody.', ['qualification', 'industry', 'pronunciation']],
    ['b', 'being alone', 'The charity visits elderly people to reduce their being alone.', ['qualification', 'industry', 'intonation']]
  ]),
  ...x('opportunity', 'vocab_opportunity', [
    ['a', 'chance', 'Studying abroad gave her the chance to learn a new language.', ['loneliness', 'literacy', 'recreation']],
    ['b', 'good time', 'Do not miss this good time to meet students from other countries.', ['loneliness', 'literacy', 'intonation']]
  ]),
  ...x('examination', 'vocab_examination', [
    ['a', 'test', 'All students must take a written test at the end of the course.', ['loneliness', 'recreation', 'literacy']],
    ['b', 'check-up', 'After the accident, the doctor carried out a full check-up of the boy’s arm.', ['loneliness', 'recreation', 'literacy']]
  ]),
  ...x('research', 'vocab_research_10', [
    ['a', 'studies', 'Recent studies suggest that teenagers need more sleep than adults.', ['loneliness', 'recreation', 'intonation']],
    ['b', 'looking things up', 'Before writing your essay, do some looking things up in the library.', ['loneliness', 'recreation', 'intonation']]
  ]),
  ...x('presentation', 'vocab_presentation', [
    ['a', 'talk', 'Each student will give a five-minute talk about a famous scientist.', ['loneliness', 'literacy', 'recreation']],
    ['b', 'speech with slides', 'Practise your speech with slides several times before you give it.', ['loneliness', 'literacy', 'recreation']]
  ]),
  ...x('pronunciation', 'vocab_pronunciation', [
    ['a', 'way of saying words', 'Her grammar is excellent, but she needs to work on her way of saying words.', ['loneliness', 'industry', 'literacy']],
    ['b', 'accent', 'The teacher corrected my accent when I said the word “island”.', ['loneliness', 'industry', 'employment']]
  ]),
  ...x('intonation', 'vocab_intonation', [
    ['a', 'tone', 'Her tone made it clear that she was surprised.', ['employment', 'industry', 'literacy']],
    ['b', 'voice going up and down', 'Good speakers vary their voice going up and down to keep the audience interested.', ['employment', 'industry', 'loneliness']]
  ]),
  ...x('vocabulary', 'vocab_vocabulary', [
    ['a', 'range of words', 'Reading widely is the best way to increase your range of words.', ['loneliness', 'recreation', 'employment']],
    ['b', 'word knowledge', 'Her word knowledge grew quickly when she started reading novels in English.', ['loneliness', 'recreation', 'employment']]
  ]),
  ...x('accurately', 'vocab_accurately', [
    ['a', 'right', 'Try to copy the numbers right from the board.', ['reluctantly', 'lonely', 'overseas']],
    ['b', 'correctly', 'The scientists measured the temperature correctly every hour.', ['reluctantly', 'lonely', 'nervously']]
  ]),
  ...x('effectively', 'vocab_effectively', [
    ['a', 'well', 'Good students learn to manage their time well.', ['reluctantly', 'lonely', 'overseas']],
    ['b', 'successfully', 'She used examples successfully to support her argument.', ['reluctantly', 'lonely', 'overseas']]
  ]),
  ...x('evaluate', 'vocab_evaluate_10', [
    ['a', 'check', 'You must check how reliable each source is before using it.', ['succeed', 'reflect', 'communicate']],
    ['b', 'judge', 'The school will judge the new timetable after one term.', ['succeed', 'contribute', 'reflect']]
  ]),
  ...x('develop', 'vocab_develop', [
    ['a', 'grow', 'Team sports help children grow confidence and social skills.', ['succeed', 'reflect', 'contribute']],
    ['b', 'make', 'The company is trying to make a new app for learning vocabulary.', ['succeed', 'reflect', 'contribute']]
  ]),
  ...x('communicate', 'vocab_communicate_10', [
    ['a', 'talk', 'Overseas students quickly learn to talk in English with their classmates.', ['succeed', 'reflect', 'evaluate']],
    ['b', 'get across', 'A good poster should get across one clear message.', ['succeed', 'reflect', 'evaluate']]
  ]),
  ...x('opinion', 'vocab_opinion', [
    ['a', 'thoughts', 'The teacher asked each student to give their thoughts about the book.', ['loneliness', 'literacy', 'recreation']],
    ['b', 'feeling', 'She has a very strong feeling that animal testing is wrong.', ['loneliness', 'literacy', 'recreation']]
  ]),
  ...x('preference', 'vocab_preference_10', [
    ['a', 'choice', 'My choice is to study in the morning when it is quiet.', ['loneliness', 'literacy', 'recreation']],
    ['b', 'liking', 'Many employers show a liking for applicants with work experience.', ['loneliness', 'literacy', 'intonation']]
  ]),
  ...x('discussion', 'vocab_discussion', [
    ['a', 'chat', 'We had a lively chat in class about whether homework should be banned.', ['loneliness', 'literacy', 'recreation']],
    ['b', 'talk', 'After a long talk, the committee agreed on a plan.', ['loneliness', 'literacy', 'recreation']]
  ]),
  ...x('achievement', 'vocab_achievement_10', [
    ['a', 'good thing', 'Passing all her exams was a great good thing after such a difficult year.', ['loneliness', 'literacy', 'recreation']],
    ['b', 'success', 'The award recognises outstanding success in science.', ['loneliness', 'literacy', 'intonation']]
  ]),
  ...x('qualification', 'vocab_qualification_10', [
    ['a', 'certificate', 'You need a teaching certificate to work in a state school.', ['loneliness', 'recreation', 'intonation']],
    ['b', 'paper', 'She left school without a single paper, but later went to college.', ['loneliness', 'recreation', 'intonation']]
  ]),
  ...x('succeed', 'vocab_succeed', [
    ['a', 'do well', 'If you work hard and ask for help, you will do well.', ['encourage', 'evaluate', 'reflect']],
    ['b', 'manage', 'If you plan carefully and keep going, you will manage in the end.', ['encourage', 'evaluate', 'contribute']]
  ])
];
