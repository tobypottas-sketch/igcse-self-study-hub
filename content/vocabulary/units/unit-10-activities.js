// Unit 10 · Paraphrasing content (phrase_set and idea_set), WORDS 1–48 (complete). Same record shapes and contract as unit-09-activities.js:
//   phrase_set : originalPhrase (plain wording) -> equivalentPhrase (contains the target), acceptedVariants, chunks, commonMeaningDistortions
//   idea_set   : originalIdea (contains the target) with accurate paraphrases that do NOT contain it, a meaning invariant, and three
//                meaning-changing distractors each tagged with the misconception it represents.
// Every record is linked to exactly one Unit 10 word.
const status = 'approved';
const unitNumber = 10;

function phrase(id, originalPhrase, equivalentPhrase, linkedVocabularyIds, { acceptedVariants = [], chunks = null, distortions = [] } = {}) {
  return {
    activityContentId:`u10_phrase_${id}`, unitNumber, contentType:'phrase_set', status,
    activityData:{
      originalPhrase, equivalentPhrase, acceptedVariants,
      chunks:chunks ?? equivalentPhrase.split(/\s+/),
      commonMeaningDistortions:distortions,
      linkedVocabularyIds,
      primaryEvidenceTargetId:linkedVocabularyIds.length === 1 ? linkedVocabularyIds[0] : undefined
    }
  };
}

function idea(id, originalIdea, accurateParaphrase, invariantType, invariantValue, distractors, linkedVocabularyIds = []) {
  return {
    activityContentId:`u10_idea_${id}`, unitNumber, contentType:'idea_set', status,
    activityData:{
      originalIdea,
      accurateParaphrases:Array.isArray(accurateParaphrase) ? accurateParaphrase : [accurateParaphrase],
      meaningInvariants:[{ type:invariantType, value:invariantValue }],
      distractors,
      linkedVocabularyIds
    }
  };
}

const ph = (id, vocabId, original, equivalent, chunks, distortions) => phrase(`${id}_main`, original, equivalent, [vocabId], { chunks, distortions });

const phraseSets = [
  ph('education', 'vocab_education', 'free schooling for every child', 'free education for every child', ['free education', 'for every child'], ['free meals for every child', 'free toys for every child', 'free transport for every child']),
  ph('higher_education', 'vocab_higher_education', 'go on to study at university', 'go on to higher education', ['go on to', 'higher education'], ['go on to full-time work', 'go on to primary school', 'go on to a long holiday']),
  ph('university', 'vocab_university', 'study for a degree in medicine', 'study medicine at university', ['study medicine', 'at university'], ['study medicine at home', 'teach medicine at school', 'sell medicine at a shop']),
  ph('academic', 'vocab_academic_10', 'her results in school subjects', 'her academic results', ['her', 'academic results'], ['her sports results', 'her music results', 'her medical results']),
  ph('recreation', 'vocab_recreation', 'space for free-time activities', 'space for recreation', ['space', 'for recreation'], ['space for storage', 'space for parking', 'space for offices']),
  ph('literacy', 'vocab_literacy', 'improve adults’ reading and writing', 'improve adult literacy', ['improve', 'adult literacy'], ['improve adult fitness', 'improve adult wages', 'improve adult housing']),
  ph('assessment', 'vocab_assessment', 'the judging of students’ work all year', 'continuous assessment', ['continuous', 'assessment'], ['continuous holidays', 'continuous punishment', 'continuous teaching']),
  ph('international_crisis', 'vocab_international_crisis', 'a serious emergency affecting many countries', 'an international crisis', ['an international', 'crisis'], ['an international festival', 'an international friendship', 'an international competition']),
  ph('digital_device', 'vocab_digital_device', 'switch off your phone or tablet', 'switch off your digital device', ['switch off', 'your digital device'], ['switch off your desk lamp', 'switch off your alarm clock', 'switch off your heater']),
  ph('progress', 'vocab_progress', 'improve quickly in English', 'make rapid progress in English', ['make rapid progress', 'in English'], ['make rapid mistakes in English', 'make rapid plans in English', 'make rapid notes in English']),
  ph('encourage', 'vocab_encourage', 'give students the confidence to ask questions', 'encourage students to ask questions', ['encourage students', 'to ask questions'], ['force students to ask questions', 'stop students from asking questions', 'pay students to ask questions']),
  ph('reflect', 'vocab_reflect_10', 'think carefully about what you learned', 'reflect on what you learned', ['reflect on', 'what you learned'], ['forget what you learned', 'copy what you learned', 'sell what you learned']),
  ph('performance', 'vocab_performance', 'how well she did in the exam', 'her performance in the exam', ['her performance', 'in the exam'], ['her seat in the exam', 'her lateness in the exam', 'her pen in the exam']),
  ph('confidence', 'vocab_confidence_10', 'believe in yourself when you speak', 'speak with confidence', ['speak', 'with confidence'], ['speak with anger', 'speak with fear', 'speak with difficulty']),
  ph('contribute', 'vocab_contribute_10', 'give ideas to the discussion', 'contribute ideas to the discussion', ['contribute ideas', 'to the discussion'], ['take ideas from the discussion', 'hide ideas from the discussion', 'remove ideas from the discussion']),
  ph('condition', 'vocab_condition', 'only if you return it by Friday', 'on condition that you return it by Friday', ['on condition that', 'you return it by Friday'], ['even though you return it by Friday', 'because you returned it by Friday', 'unless you return it by Friday']),
  ph('conditional', 'vocab_conditional', 'an if-sentence about an imagined situation', 'the second conditional', ['the second', 'conditional'], ['the second question', 'the second paragraph', 'the second command']),
  ph('preparation', 'vocab_preparation', 'to get ready for the race', 'in preparation for the race', ['in preparation', 'for the race'], ['in celebration of the race', 'in protest at the race', 'in memory of the race']),
  ph('employment', 'vocab_employment_10', 'find a paid job', 'find employment', ['find', 'employment'], ['find accommodation', 'find entertainment', 'find a holiday']),
  ph('career', 'vocab_career', 'a long working life as a doctor', 'a career in medicine', ['a career', 'in medicine'], ['a holiday in medicine', 'a hobby in medicine', 'a course in cooking']),
  ph('subject', 'vocab_subject', 'my favourite area of study', 'my favourite subject', ['my favourite', 'subject'], ['my favourite teacher', 'my favourite classroom', 'my favourite holiday']),
  ph('aspect', 'vocab_aspect', 'one important part of the problem', 'an important aspect of the problem', ['an important aspect', 'of the problem'], ['an important cause of the problem', 'an important solution to the problem', 'an important victim of the problem']),
  ph('industry', 'vocab_industry', 'the businesses that make films', 'the film industry', ['the film', 'industry'], ['the film club', 'the film review', 'the film poster']),
  ph('interview', 'vocab_interview', 'a formal meeting to ask questions about a job', 'a job interview', ['a job', 'interview'], ['a job advert', 'a job contract', 'a job promotion']),
  ph('overseas', 'vocab_overseas', 'students from other countries', 'overseas students', ['overseas', 'students'], ['local students', 'part-time students', 'younger students']),
  ph('challenge', 'vocab_challenge_10', 'a really difficult task', 'a real challenge', ['a real', 'challenge'], ['a real pleasure', 'a real mistake', 'a real holiday']),
  ph('reluctant', 'vocab_reluctant', 'did not want to speak in public', 'was reluctant to speak in public', ['was reluctant', 'to speak in public'], ['was eager to speak in public', 'was paid to speak in public', 'was trained to speak in public']),
  ph('cosmopolitan', 'vocab_cosmopolitan', 'a city with people from many cultures', 'a cosmopolitan city', ['a cosmopolitan', 'city'], ['a quiet city', 'an ancient city', 'a dirty city']),
  ph('assignment', 'vocab_assignment_10', 'hand in your piece of coursework', 'hand in your assignment', ['hand in', 'your assignment'], ['hand in your textbook', 'hand in your phone', 'hand in your uniform']),
  ph('loneliness', 'vocab_loneliness', 'the unhappy feeling of being alone', 'feelings of loneliness', ['feelings', 'of loneliness'], ['feelings of excitement', 'feelings of pride', 'feelings of anger']),
  ph('opportunity', 'vocab_opportunity', 'a chance to study abroad', 'an opportunity to study abroad', ['an opportunity', 'to study abroad'], ['a requirement to study abroad', 'a fear of studying abroad', 'a ban on studying abroad']),
  ph('examination', 'vocab_examination', 'sit the final formal test', 'sit the final examination', ['sit the final', 'examination'], ['sit the final lesson', 'sit the final assembly', 'sit the final row']),
  ph('research', 'vocab_research_10', 'detailed study into renewable energy', 'research into renewable energy', ['research', 'into renewable energy'], ['advertising for renewable energy', 'complaints about renewable energy', 'payment for renewable energy']),
  ph('presentation', 'vocab_presentation', 'give a talk to the class', 'give a presentation to the class', ['give a presentation', 'to the class'], ['give a present to the class', 'give a test to the class', 'give a warning to the class']),
  ph('pronunciation', 'vocab_pronunciation', 'the way you say the word', 'the pronunciation of the word', ['the pronunciation', 'of the word'], ['the spelling of the word', 'the meaning of the word', 'the length of the word']),
  ph('intonation', 'vocab_intonation', 'the rise of the voice at the end of a question', 'rising intonation in a question', ['rising intonation', 'in a question'], ['rising volume in a question', 'rising difficulty in a question', 'rising length in a question']),
  ph('vocabulary', 'vocab_vocabulary', 'learn more words', 'increase your vocabulary', ['increase', 'your vocabulary'], ['increase your speed', 'increase your height', 'increase your savings']),
  ph('accurately', 'vocab_accurately', 'measure without making mistakes', 'measure accurately', ['measure', 'accurately'], ['measure quickly', 'measure roughly', 'measure secretly']),
  ph('effectively', 'vocab_effectively', 'use your time in a way that works well', 'use your time effectively', ['use your time', 'effectively'], ['use your time slowly', 'use your time badly', 'use your time alone']),
  ph('evaluate', 'vocab_evaluate_10', 'judge how reliable the website is', 'evaluate the website', ['evaluate', 'the website'], ['design the website', 'copy the website', 'ignore the website']),
  ph('develop', 'vocab_develop', 'build up your speaking skills', 'develop your speaking skills', ['develop', 'your speaking skills'], ['lose your speaking skills', 'hide your speaking skills', 'test your speaking skills']),
  ph('communicate', 'vocab_communicate_10', 'share ideas clearly with others', 'communicate clearly with others', ['communicate clearly', 'with others'], ['argue clearly with others', 'compete clearly with others', 'disagree clearly with others']),
  ph('opinion', 'vocab_opinion', 'what I personally think', 'in my opinion', ['in my', 'opinion'], ['in my experience', 'in my bag', 'in my dream']),
  ph('preference', 'vocab_preference_10', 'liking group work more than working alone', 'a preference for group work', ['a preference', 'for group work'], ['a dislike of group work', 'a fear of group work', 'a need for group work']),
  ph('discussion', 'vocab_discussion', 'a talk in which the whole class shares views', 'a class discussion', ['a class', 'discussion'], ['a class trip', 'a class test', 'a class photo']),
  ph('achievement', 'vocab_achievement_10', 'the feeling of having done something difficult', 'a sense of achievement', ['a sense of', 'achievement'], ['a sense of humour', 'a sense of danger', 'a sense of loss']),
  ph('qualification', 'vocab_qualification_10', 'an official certificate in first aid', 'a qualification in first aid', ['a qualification', 'in first aid'], ['a lesson in first aid', 'a book on first aid', 'an interest in first aid']),
  ph('succeed', 'vocab_succeed', 'manage to pass the test', 'succeed in passing the test', ['succeed in', 'passing the test'], ['fail at passing the test', 'give up passing the test', 'worry about passing the test'])
];

const D = (text, misconceptionCategory) => ({ text, misconceptionCategory });

const ideaSets = [
  idea('education', 'Her parents worked hard so that she could have a good education.', ['Her parents worked hard so that she could go to good schools and learn well.', 'She was able to study at good schools because her parents worked hard.', 'Thanks to her parents’ hard work, she received good schooling.'], 'meaning', 'good schooling', [
    D('Her parents worked hard so that she could have a good job.', 'meaning_confusion'),
    D('She worked hard so that her parents could have a good education.', 'role_reversal'),
    D('Her parents did not work, so she had a poor education.', 'polarity_change')
  ], ['vocab_education']),
  idea('higher_education', 'More than half of the students in our school go on to higher education.', ['Over fifty per cent of our students continue their studies at university or college.', 'Most students from our school carry on studying at university level after they leave.', 'More than half of our school leavers start degree courses.'], 'quantity', 'more than half', [
    D('More than half of the students in our school start full-time work after leaving.', 'meaning_confusion'),
    D('Only a few students in our school go on to university or college.', 'quantity_change'),
    D('More than half of the students in our school used to go to university.', 'time_change')
  ], ['vocab_higher_education']),
  idea('university', 'My brother is studying engineering at a university in Scotland.', ['My brother is doing an engineering degree in Scotland.', 'In Scotland, my brother is taking a degree course in engineering.', 'My brother attends a degree-level institution in Scotland, where he studies engineering.'], 'meaning', 'degree-level study', [
    D('My brother is working as an engineer at a factory in Scotland.', 'meaning_confusion'),
    D('My brother is teaching engineering at a primary school in Scotland.', 'role_change'),
    D('My brother will study engineering in Scotland next year.', 'time_change')
  ], ['vocab_university']),
  idea('academic', 'Tom is brilliant at sport, but his academic results are disappointing.', ['Tom is excellent at sport, but his marks in school subjects are poor.', 'Although Tom is great at sport, he does badly in his studies.', 'Tom’s exam results are disappointing, even though he is very good at sport.'], 'contrast', 'good at sport, poor at study', [
    D('Tom is brilliant at sport, and his school results are excellent.', 'polarity_change'),
    D('Tom is poor at sport, but his school results are excellent.', 'comparison_reversal'),
    D('Tom is brilliant at sport, but his football results are disappointing.', 'meaning_confusion')
  ], ['vocab_academic_10']),
  idea('recreation', 'The new park provides space for sport and recreation.', ['The new park gives people room to play sport and enjoy their free time.', 'People can use the new park for exercise and leisure activities.', 'The new park is a place where people can relax and do sport.'], 'meaning', 'free-time enjoyment', [
    D('The new park provides space for sport and car parking.', 'meaning_confusion'),
    D('The new park provides no space for sport or free-time activities.', 'polarity_change'),
    D('The old park provided space for sport and free-time activities.', 'time_change')
  ], ['vocab_recreation']),
  idea('literacy', 'Evening classes have greatly improved adult literacy in the region.', ['Thanks to evening classes, many more adults in the region can now read and write.', 'Adults in the area read and write much better because of evening classes.', 'Night classes have helped local adults learn to read and write.'], 'meaning', 'reading and writing', [
    D('Evening classes have greatly improved adult fitness in the region.', 'meaning_confusion'),
    D('Evening classes have slightly improved children’s reading in the region.', 'degree_change'),
    D('Evening classes have not changed how well adults in the region can read.', 'polarity_change')
  ], ['vocab_literacy']),
  idea('assessment', 'On this course, there is continuous assessment instead of a final exam.', ['This course has no final exam; your work is marked throughout the year.', 'Instead of one exam at the end, students on this course are judged on their work all year.', 'Your grade on this course comes from regular checks of your work, not an end-of-year test.'], 'contrast', 'regular marking, not one exam', [
    D('On this course, there is a final exam instead of regular marking.', 'comparison_reversal'),
    D('On this course, there is continuous teaching instead of a final exam.', 'meaning_confusion'),
    D('On this course, there is both a final exam and regular marking.', 'detail_change')
  ], ['vocab_assessment']),
  idea('international_crisis', 'The spread of the disease quickly became an international crisis.', ['The disease spread so fast that it soon became a serious emergency for many countries.', 'Before long, the spread of the disease was a dangerous problem for the whole world.', 'Many nations were soon facing a serious emergency because the disease spread so quickly.'], 'meaning', 'serious emergency affecting many countries', [
    D('The spread of the disease quickly became a local problem in one village.', 'scope_change'),
    D('The spread of the disease slowly became a minor concern for one country.', 'degree_change'),
    D('The spread of the disease quickly led to an international festival.', 'meaning_confusion')
  ], ['vocab_international_crisis']),
  idea('digital_device', 'Students may not use any digital device during the exam.', ['Phones, tablets and laptops are not allowed during the exam.', 'During the exam, students must not use any electronic equipment.', 'No electronic gadgets may be used by students while the exam is taking place.'], 'meaning', 'no electronic equipment', [
    D('Students must use a digital device during the exam.', 'polarity_change'),
    D('Students may not use any pens or paper during the exam.', 'meaning_confusion'),
    D('Teachers may not use any electronic equipment during the exam.', 'role_change')
  ], ['vocab_digital_device']),
  idea('progress', 'Ali has made rapid progress with his English this term.', ['Ali’s English has improved quickly this term.', 'This term, Ali has got much better at English in a short time.', 'Ali’s English has developed fast over the last few months.'], 'meaning', 'quick improvement', [
    D('Ali has made slow progress with his English this term.', 'degree_change'),
    D('Ali’s English has got worse this term.', 'polarity_change'),
    D('Ali made rapid progress with his English last year.', 'time_change')
  ], ['vocab_progress']),
  idea('encourage', 'Good teachers encourage shy students to share their ideas.', ['Good teachers give quiet students the confidence to say what they think.', 'Shy students are supported by good teachers to express their ideas.', 'Good teachers help timid students feel able to speak up.'], 'meaning', 'give support and confidence', [
    D('Good teachers stop shy students from sharing their ideas.', 'polarity_change'),
    D('Shy students encourage good teachers to share their ideas.', 'role_reversal'),
    D('Good teachers force shy students to share their ideas.', 'meaning_confusion')
  ], ['vocab_encourage']),
  idea('reflect', 'At the end of the project, students reflect on what went well.', ['When the project is finished, students think carefully about what worked.', 'Students consider the successful parts of their project once it is over.', 'After the project, students look back and think about its strengths.'], 'meaning', 'think carefully about', [
    D('At the end of the project, students forget about what went well.', 'polarity_change'),
    D('At the start of the project, students think about what will go well.', 'time_change'),
    D('At the end of the project, students complain about what went badly.', 'meaning_confusion')
  ], ['vocab_reflect_10']),
  idea('performance', 'Lack of sleep had a bad effect on his performance in the exam.', ['Because he had not slept enough, he did badly in the exam.', 'Not sleeping enough made him do worse in the exam.', 'He did not do as well in the exam because he was short of sleep.'], 'cause_effect', 'poor sleep led to a worse result', [
    D('Lack of sleep had a good effect on how well he did in the exam.', 'polarity_change'),
    D('His poor exam result caused him to lose sleep.', 'cause_change'),
    D('Lack of sleep had a bad effect on his attendance at the exam.', 'meaning_confusion')
  ], ['vocab_performance']),
  idea('confidence', 'Joining the drama club gave her the confidence to speak in public.', ['After joining the drama club, she felt able to speak in front of people.', 'The drama club helped her believe she could talk to an audience.', 'Being in the drama club made her feel sure enough to speak publicly.'], 'meaning', 'belief in her ability', [
    D('Joining the drama club made her too nervous to speak in public.', 'polarity_change'),
    D('Joining the drama club gave her the money to speak in public.', 'meaning_confusion'),
    D('Joining the drama club might give her the courage to speak in public.', 'certainty_change')
  ], ['vocab_confidence_10']),
  idea('contribute', 'Every member of the group should contribute ideas to the project.', ['Each person in the group ought to give ideas for the project.', 'All group members are expected to offer suggestions for the project.', 'Nobody in the group should leave it to others to come up with ideas.'], 'meaning', 'everyone gives ideas', [
    D('Only the leader of the group should contribute ideas to the project.', 'scope_change'),
    D('Every member of the group should take ideas from other projects.', 'meaning_confusion'),
    D('No member of the group should give ideas to the project.', 'polarity_change')
  ], ['vocab_contribute_10']),
  idea('condition', 'You can borrow the laptop on condition that you return it by Friday.', ['You may borrow the laptop only if you give it back by Friday.', 'The laptop can be borrowed as long as it comes back by Friday.', 'If you promise to bring it back by Friday, you can borrow the laptop.'], 'meaning', 'only if', [
    D('You can borrow the laptop even if you return it after Friday.', 'polarity_change'),
    D('You can borrow the laptop because you returned it last Friday.', 'time_change'),
    D('You must borrow the laptop and return it by Friday.', 'modality_change')
  ], ['vocab_condition']),
  idea('conditional', '“If I had more time, I would learn Japanese” is an example of the second conditional.', ['“If I had more time, I would learn Japanese” is a second-type if-sentence about an imagined situation.', 'The sentence “If I had more time, I would learn Japanese” shows the second type of if-sentence.', 'The structure in “If I had more time, I would learn Japanese” is the second form of if-sentence.'], 'meaning', 'type of if-sentence', [
    D('“If I had more time, I would learn Japanese” is an example of reported speech.', 'meaning_confusion'),
    D('“If I had more time, I would learn Japanese” is an example of a question.', 'meaning_confusion'),
    D('“I learned Japanese when I had more time” is an example of the second type of if-sentence.', 'time_change')
  ], ['vocab_conditional']),
  idea('preparation', 'Good preparation is the key to doing well in exams.', ['Getting ready properly is the most important thing for exam success.', 'If you want to do well in exams, you must plan and revise in advance.', 'Careful revision and planning before exams is what leads to good results.'], 'meaning', 'getting ready in advance', [
    D('Good luck is the key to doing well in exams.', 'meaning_confusion'),
    D('Good preparation makes no difference to how well you do in exams.', 'polarity_change'),
    D('Good preparation is one small part of doing well in exams.', 'degree_change')
  ], ['vocab_preparation']),
  idea('employment', 'Most engineering graduates find employment within six months.', ['The majority of engineering graduates get a paid job within half a year.', 'Within six months, most people with engineering degrees are working.', 'Most engineering graduates start paid work less than six months after finishing.'], 'quantity', 'most within six months', [
    D('Few engineering graduates find work within six months.', 'quantity_change'),
    D('Most engineering graduates find a flat within six months.', 'meaning_confusion'),
    D('Most engineering graduates find work within six years.', 'detail_change')
  ], ['vocab_employment_10']),
  idea('career', 'She wants a career in medicine, so she is studying biology.', ['She is studying biology because she hopes to work in medicine for her working life.', 'Her plan is to become a doctor, which is why she is taking biology.', 'She is studying biology because her goal is a long-term job in medicine.'], 'cause_effect', 'future job explains study choice', [
    D('She wants a hobby in medicine, so she is studying biology.', 'meaning_confusion'),
    D('She is studying medicine, so she wants a job in biology.', 'role_reversal'),
    D('She does not want to work in medicine, so she is studying biology.', 'polarity_change')
  ], ['vocab_career']),
  idea('subject', 'Maths is my favourite subject because I enjoy solving problems.', ['Of all the things I study at school, I like maths best because I enjoy solving problems.', 'I like maths more than anything else I study, because problem-solving is fun.', 'Because I love working out problems, maths is the area of study I prefer.'], 'meaning', 'area of study', [
    D('Maths is my favourite teacher because I enjoy solving problems.', 'meaning_confusion'),
    D('Maths is my least favourite subject because I enjoy solving problems.', 'polarity_change'),
    D('Maths was my favourite subject because I enjoyed solving problems.', 'time_change')
  ], ['vocab_subject']),
  idea('aspect', 'The social aspect of university is as important as studying.', ['Making friends and meeting people at university matters as much as studying.', 'At university, social life is just as important as academic work.', 'The friendships you make at university are as valuable as your studies.'], 'comparison', 'equally important', [
    D('The social side of university is less important than studying.', 'comparison_reversal'),
    D('The social aspect of university is more important than studying.', 'comparison_reversal'),
    D('The social aspect of school is as important as playing sport.', 'meaning_confusion')
  ], ['vocab_aspect']),
  idea('industry', 'The tourism industry employs thousands of people in our country.', ['Thousands of people in our country work in businesses connected with tourism.', 'Hotels, travel firms and other tourist businesses give jobs to thousands of people here.', 'In our country, tourism-related businesses provide work for thousands.'], 'meaning', 'businesses in one area of trade', [
    D('The tourism industry employs only a few people in our country.', 'quantity_change'),
    D('Thousands of tourists visit our country every year.', 'meaning_confusion'),
    D('The tourism industry used to employ thousands of people in our country.', 'time_change')
  ], ['vocab_industry']),
  idea('interview', 'All applicants will have an interview with a tutor before they are offered a place.', ['Everyone who applies will meet a tutor and answer questions before being offered a place.', 'Before a place is offered, each applicant will be questioned by a tutor.', 'Applicants must have a formal meeting with a tutor to get a place.'], 'meaning', 'formal meeting with questions', [
    D('All applicants will have a written exam before they are offered a place.', 'meaning_confusion'),
    D('Only some applicants will meet a tutor before they are offered a place.', 'scope_change'),
    D('All tutors will have an interview with an applicant before they get a job.', 'role_reversal')
  ], ['vocab_interview']),
  idea('overseas', 'The university welcomes overseas students from more than eighty countries.', ['Students from over eighty foreign countries are welcome at the university.', 'The university accepts international students from more than eighty nations.', 'People from more than eighty other countries come to study at the university.'], 'meaning', 'from other countries', [
    D('The university welcomes local students from more than eighty towns.', 'meaning_confusion'),
    D('The university welcomes foreign students from fewer than eight countries.', 'quantity_change'),
    D('The university does not accept students from other countries.', 'polarity_change')
  ], ['vocab_overseas']),
  idea('challenge', 'Moving to a new country was a big challenge for Aisha.', ['Moving to a new country was very difficult for Aisha.', 'Aisha found it really hard to move to a different country.', 'For Aisha, living in a new country was a real test of her abilities.'], 'meaning', 'something difficult', [
    D('Moving to a new country was very easy for Aisha.', 'polarity_change'),
    D('Moving to a new country was a big reward for Aisha.', 'meaning_confusion'),
    D('Moving to a new country will be a small problem for Aisha.', 'degree_change')
  ], ['vocab_challenge_10']),
  idea('reluctant', 'Many students are reluctant to speak English in front of the class.', ['A lot of students do not want to speak English in front of their classmates.', 'Many learners are unwilling to use English when the whole class is listening.', 'Speaking English in front of the class is something many students would prefer to avoid.'], 'meaning', 'unwilling', [
    D('Many students are eager to speak English in front of the class.', 'polarity_change'),
    D('Many students are unable to speak English at all.', 'meaning_confusion'),
    D('A few students are unwilling to speak English in front of the class.', 'quantity_change')
  ], ['vocab_reluctant']),
  idea('cosmopolitan', 'London is a cosmopolitan city where you can hear hundreds of languages.', ['London has people from so many cultures that hundreds of languages are spoken there.', 'People from all over the world live in London, so you hear many languages.', 'London is a multicultural city with hundreds of languages.'], 'meaning', 'many cultures', [
    D('London is an old-fashioned city where everyone speaks the same language.', 'polarity_change'),
    D('London is an expensive city where you can buy hundreds of things.', 'meaning_confusion'),
    D('London is a small city where you can hear a few languages.', 'quantity_change')
  ], ['vocab_cosmopolitan']),
  idea('assignment', 'The history assignment must be handed in by Friday.', ['You need to give your history coursework to the teacher by Friday.', 'The piece of history work we were set is due on Friday.', 'Friday is the deadline for the history task.'], 'meaning', 'set piece of work', [
    D('The history assignment can be handed in any time next month.', 'detail_change'),
    D('The history test will take place on Friday.', 'meaning_confusion'),
    D('The history teacher must give back our work by Friday.', 'role_reversal')
  ], ['vocab_assignment_10']),
  idea('loneliness', 'Many overseas students experience loneliness in their first weeks.', ['A lot of students from abroad feel alone during their first few weeks.', 'In the first weeks, many international students feel isolated and miss people.', 'Many students who come from other countries feel lonely at first.'], 'meaning', 'feeling alone', [
    D('Many overseas students feel excited in their first weeks.', 'meaning_confusion'),
    D('Few overseas students feel alone in their first weeks.', 'quantity_change'),
    D('Many overseas students feel alone in their final weeks.', 'time_change')
  ], ['vocab_loneliness']),
  idea('opportunity', 'Studying abroad gave her the opportunity to learn a new language.', ['Because she studied abroad, she had the chance to learn another language.', 'Studying in another country made it possible for her to learn a new language.', 'Her time studying abroad let her pick up a new language.'], 'meaning', 'chance', [
    D('Studying abroad stopped her from learning a new language.', 'polarity_change'),
    D('Studying abroad forced her to forget her own language.', 'meaning_confusion'),
    D('Learning a new language gave her the chance to study abroad.', 'cause_change')
  ], ['vocab_opportunity']),
  idea('examination', 'All students must take a written examination at the end of the course.', ['Every student has to sit a formal written test when the course finishes.', 'At the end of the course, everyone must do a written exam.', 'There is a compulsory written exam for all students at the end.'], 'meaning', 'formal test', [
    D('Some students may take a written examination at the start of the course.', 'time_change'),
    D('All students must write a letter at the end of the course.', 'meaning_confusion'),
    D('No students have to take a written test at the end of the course.', 'polarity_change')
  ], ['vocab_examination']),
  idea('research', 'Research shows that students who sleep well remember more.', ['Studies show that students who get good sleep remember more.', 'Scientific investigation has found that well-rested students remember more.', 'According to studies, good sleep helps students remember more.'], 'meaning', 'detailed study', [
    D('Rumours suggest that students who sleep well remember more.', 'certainty_change'),
    D('Research shows that students who sleep well remember less.', 'polarity_change'),
    D('Research shows that students who remember more sleep well.', 'cause_change')
  ], ['vocab_research_10']),
  idea('presentation', 'Each student will give a five-minute presentation about a famous scientist.', ['Every student will talk to the class for five minutes about a well-known scientist.', 'Each student must speak for five minutes about a famous scientist.', 'All students will present a short five-minute talk on a famous scientist.'], 'meaning', 'talk to an audience', [
    D('Each student will write a five-page essay about a famous scientist.', 'meaning_confusion'),
    D('A famous scientist will give a five-minute talk to each student.', 'role_reversal'),
    D('Each student will give a fifty-minute talk about a famous scientist.', 'quantity_change')
  ], ['vocab_presentation']),
  idea('pronunciation', 'Her grammar is excellent, but her pronunciation needs work.', ['Her grammar is very good, but the way she says words needs improving.', 'Although her grammar is excellent, she needs to practise how she speaks words.', 'She has excellent grammar but must improve how she says English words.'], 'contrast', 'good grammar, weaker speaking', [
    D('Her grammar is excellent, and the way she says words is perfect.', 'polarity_change'),
    D('Her grammar is excellent, but her spelling needs work.', 'meaning_confusion'),
    D('Her grammar needs work, but the way she says words is excellent.', 'comparison_reversal')
  ], ['vocab_pronunciation']),
  idea('intonation', 'Rising intonation at the end of a sentence often shows that it is a question.', ['When your voice goes up at the end of a sentence, it often means you are asking a question.', 'A question is often shown by the voice rising at the end.', 'If the voice goes up at the end, the sentence is often a question.'], 'meaning', 'rise and fall of the voice', [
    D('Rising volume at the end of a sentence always shows anger.', 'meaning_confusion'),
    D('Falling voice at the end of a sentence often shows that it is a question.', 'polarity_change'),
    D('A question mark at the end of a sentence often shows that it is a question.', 'meaning_confusion')
  ], ['vocab_intonation']),
  idea('vocabulary', 'Reading widely is the best way to increase your vocabulary.', ['The best way to learn more words is to read a lot of different things.', 'If you read many different kinds of text, you will learn more words.', 'Reading a wide range of texts is the most effective way to know more words.'], 'meaning', 'words you know', [
    D('Reading widely is the best way to improve your handwriting.', 'meaning_confusion'),
    D('Reading widely is one of the worst ways to learn new words.', 'polarity_change'),
    D('Reading widely may be a way to learn more words.', 'certainty_change')
  ], ['vocab_vocabulary']),
  idea('accurately', 'You must measure each liquid accurately in the experiment.', ['In the experiment, you have to measure every liquid exactly.', 'Each liquid must be measured correctly, without mistakes, in the experiment.', 'Measure all the liquids precisely when you do the experiment.'], 'meaning', 'exactly, without mistakes', [
    D('You must measure each liquid quickly in the experiment.', 'meaning_confusion'),
    D('You do not need to measure each liquid exactly in the experiment.', 'polarity_change'),
    D('You can measure each liquid roughly in the experiment.', 'degree_change')
  ], ['vocab_accurately']),
  idea('effectively', 'Good students learn to manage their time effectively.', ['Good students learn to use their time in a way that works well.', 'Successful students learn how to organise their time well.', 'Good students find out how to plan their time so that it produces results.'], 'meaning', 'in a way that works', [
    D('Good students learn to manage their time slowly.', 'meaning_confusion'),
    D('Good students never learn to organise their time.', 'polarity_change'),
    D('Good teachers learn to manage students’ time well.', 'role_change')
  ], ['vocab_effectively']),
  idea('evaluate', 'Students must evaluate each source before using it in an essay.', ['Before using a source in an essay, students have to judge how good and reliable it is.', 'Students need to check how trustworthy each source is before they use it.', 'Every source should be assessed by students before it appears in an essay.'], 'meaning', 'judge the quality', [
    D('Students must copy each source before using it in an essay.', 'meaning_confusion'),
    D('Students do not need to check sources before using them.', 'polarity_change'),
    D('Teachers must judge each essay before students use a source.', 'role_reversal')
  ], ['vocab_evaluate_10']),
  idea('develop', 'The course helps students develop their speaking skills.', ['The course helps students improve their speaking skills.', 'Students build up their speaking ability on this course.', 'On the course, students’ speaking skills get stronger.'], 'meaning', 'improve over time', [
    D('The course helps students test their speaking skills once.', 'meaning_confusion'),
    D('The course makes students’ speaking skills weaker.', 'polarity_change'),
    D('The course helps teachers improve their writing skills.', 'role_change')
  ], ['vocab_develop']),
  idea('communicate', 'Overseas students quickly learn to communicate in English.', ['Students from abroad soon learn to share their ideas in English.', 'International students quickly become able to talk with others in English.', 'Before long, foreign students can express themselves in English.'], 'meaning', 'share ideas', [
    D('Overseas students quickly learn to write poems in English.', 'meaning_confusion'),
    D('Overseas students slowly learn to speak in English.', 'degree_change'),
    D('Overseas students never learn to talk with others in English.', 'polarity_change')
  ], ['vocab_communicate_10']),
  idea('opinion', 'In my opinion, school uniforms help students feel equal.', ['I think school uniforms make students feel equal.', 'My view is that uniforms help everyone at school feel the same.', 'I believe that wearing a uniform makes students feel equal.'], 'meaning', 'personal view', [
    D('It is a proven fact that school uniforms help students feel equal.', 'certainty_change'),
    D('In my opinion, school uniforms make students feel unequal.', 'polarity_change'),
    D('In my opinion, school uniforms help teachers feel equal.', 'role_change')
  ], ['vocab_opinion']),
  idea('preference', 'Many employers show a preference for applicants with work experience.', ['A lot of employers would rather choose applicants who have worked before.', 'Many employers like applicants with work experience more than those without it.', 'Applicants who have already worked are often favoured by employers.'], 'meaning', 'liking one thing more', [
    D('Many employers refuse to hire applicants with work experience.', 'polarity_change'),
    D('Many applicants prefer employers with work experience.', 'role_reversal'),
    D('Every employer requires applicants to have a degree.', 'meaning_confusion')
  ], ['vocab_preference_10']),
  idea('discussion', 'The class had a lively discussion about banning homework.', ['The students talked energetically and shared views on banning homework.', 'There was an animated class conversation about whether to ban homework.', 'The class exchanged lots of opinions about banning homework.'], 'meaning', 'talk to share views', [
    D('The class wrote a quiet test about banning homework.', 'meaning_confusion'),
    D('The class had a short, boring talk about banning homework.', 'degree_change'),
    D('The teacher gave a speech about banning homework while the class listened silently.', 'role_change')
  ], ['vocab_discussion']),
  idea('achievement', 'Passing all her exams was a great achievement after such a difficult year.', ['After such a hard year, passing all her exams was a great success.', 'She did something really impressive by passing every exam in such a difficult year.', 'Getting through all her exams after a tough year was a big accomplishment.'], 'meaning', 'difficult success', [
    D('Failing all her exams was a great disappointment after such a difficult year.', 'polarity_change'),
    D('Passing all her exams was easy after such a relaxing year.', 'meaning_confusion'),
    D('Passing one of her exams was a small success after an easy year.', 'quantity_change')
  ], ['vocab_achievement_10']),
  idea('qualification', 'You need a teaching qualification to work in a state school.', ['To teach in a state school, you must have a teaching certificate.', 'State schools only employ teachers who have completed a teacher-training course.', 'A teaching certificate is required for work in a state school.'], 'meaning', 'official certificate', [
    D('You need a teaching uniform to work in a state school.', 'meaning_confusion'),
    D('You do not need any certificate to teach in a state school.', 'polarity_change'),
    D('You need teaching experience abroad to work in a state school.', 'detail_change')
  ], ['vocab_qualification_10']),
  idea('succeed', 'If you work hard and ask for help, you will succeed.', ['Working hard and asking for help will lead you to do well.', 'You will achieve your goals if you work hard and get help.', 'Hard work and asking for support will bring you success.'], 'cause_effect', 'effort leads to success', [
    D('If you work hard and ask for help, you will fail.', 'polarity_change'),
    D('If you work hard and ask for help, you might do well.', 'certainty_change'),
    D('If you do well, you will work hard and ask for help.', 'cause_change')
  ], ['vocab_succeed'])
];

export default [...phraseSets, ...ideaSets];
