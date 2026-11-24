// Unit 10 Word Families items (writing_set, taskType 'word_family'), WORDS 1–48 (complete): three items for each word that has a genuine family.
// Same record shape as unit-09-word-family-items.js. Each sentence has one gap that exactly one form of the family completes, and the gap never
// opens the sentence (see unit-10-word-families.js).
const unitNumber = 10;
const status = 'approved';
function family(id, vocabularyId, name, sourceText, acceptedAnswer) {
  return {
    activityContentId:`u10_writing_word_family_${id}`, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'word_family', prompt:`Use the correct form from the ${name} word family.`, sourceText, acceptedAnswers:[acceptedAnswer], linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}
const fam = (key, vocabularyId, rows) => rows.map(([suffix, sourceText, answer]) => family(`${key}_${suffix}`, vocabularyId, key, sourceText, answer));

export default [
  ...fam('education', 'vocab_education', [['a', 'Every child has the right to a free ____.', 'education'], ['b', 'The campaign tries to ____ teenagers about the dangers of smoking.', 'educate'], ['c', 'We watched an ____ film about the rainforest.', 'educational']]),
  ...fam('academic', 'vocab_academic_10', [['a', 'The ____ year starts in September.', 'academic'], ['b', 'He joined a football ____ when he was twelve.', 'academy'], ['c', 'She is strong ____ but shy in social situations.', 'academically']]),
  ...fam('literacy', 'vocab_literacy', [['a', 'The project aims to raise ____ levels among adults.', 'literacy'], ['b', 'By the end of primary school, children should be fully ____.', 'literate'], ['c', 'Because he never went to school, he was ____ until he was forty.', 'illiterate']]),
  ...fam('assessment', 'vocab_assessment', [['a', 'The speaking ____ takes ten minutes.', 'assessment'], ['b', 'Teachers will ____ your essay using a mark scheme.', 'assess'], ['c', 'An external ____ checked the teachers’ marking.', 'assessor']]),
  ...fam('progress', 'vocab_progress', [['a', 'You have made excellent ____ this year.', 'progress'], ['b', 'The school is famous for its ____ ideas about learning.', 'progressive'], ['c', 'The course shows a clear ____ from easy to difficult tasks.', 'progression']]),
  ...fam('encourage', 'vocab_encourage', [['a', 'Parents should ____ their children to read.', 'encourage'], ['b', 'She needed a little ____ before she tried again.', 'encouragement'], ['c', 'The results of the first survey are very ____.', 'encouraging']]),
  ...fam('reflect', 'vocab_reflect_10', [['a', 'Take time to ____ on what you learned today.', 'reflect'], ['b', 'His diary is full of honest ____ on his first year at university.', 'reflection'], ['c', 'The poem has a quiet, ____ mood.', 'reflective']]),
  ...fam('performance', 'vocab_performance', [['a', 'Her ____ in the final was outstanding.', 'performance'], ['b', 'The band will ____ three new songs tonight.', 'perform'], ['c', 'Every ____ in the show received a certificate.', 'performer']]),
  ...fam('confidence', 'vocab_confidence_10', [['a', 'Winning the prize gave him a lot of ____.', 'confidence'], ['b', 'She feels ____ that she will pass.', 'confident'], ['c', 'He spoke ____ in front of the whole school.', 'confidently']]),
  ...fam('contribute', 'vocab_contribute_10', [['a', 'Everyone was asked to ____ to the class party.', 'contribute'], ['b', 'Her ____ to the team was very important.', 'contribution'], ['c', 'The magazine needs one more ____ for the next issue.', 'contributor']]),
  ...fam('preparation', 'vocab_preparation', [['a', 'Careful ____ helps you stay calm in exams.', 'preparation'], ['b', 'We must ____ the hall before the parents arrive.', 'prepare'], ['c', 'Make sure you are ____ for any question in the interview.', 'prepared']]),
  ...fam('employment', 'vocab_employment_10', [['a', 'The factory provides ____ for many local people.', 'employment'], ['b', 'The new hotel will ____ fifty staff.', 'employ'], ['c', 'My ____ allows me to work from home on Fridays.', 'employer']]),
  ...fam('industry', 'vocab_industry', [['a', 'He works in the music ____.', 'industry'], ['b', 'The city has a large ____ zone with many factories.', 'industrial'], ['c', 'Many countries began to ____ during the twentieth century.', 'industrialise']]),
  ...fam('challenge', 'vocab_challenge_10', [['a', 'Climbing the mountain was a huge ____.', 'challenge'], ['b', 'The test was ____, but I finished it.', 'challenging'], ['c', 'The ____ won the race and became the new champion.', 'challenger']]),
  ...fam('reluctant', 'vocab_reluctant', [['a', 'She was ____ to leave her friends behind.', 'reluctant'], ['b', 'His ____ to try new food annoyed his parents.', 'reluctance'], ['c', 'He ____ handed over his phone to the teacher.', 'reluctantly']]),
  ...fam('examination', 'vocab_examination', [['a', 'The final ____ is in June.', 'examination'], ['b', 'The police will ____ the evidence carefully.', 'examine'], ['c', 'The ____ asked me three questions about my hobbies.', 'examiner']]),
  ...fam('presentation', 'vocab_presentation', [['a', 'I gave a ____ on climate change.', 'presentation'], ['b', 'Each team will ____ its ideas to the judges.', 'present'], ['c', 'The radio ____ played my favourite song.', 'presenter']]),
  ...fam('pronunciation', 'vocab_pronunciation', [['a', 'Listening to songs can improve your ____.', 'pronunciation'], ['b', 'Can you ____ the name of this city?', 'pronounce'], ['c', 'Many people ____ my surname, so I spell it for them.', 'mispronounce']]),
  ...fam('accurately', 'vocab_accurately', [['a', 'Copy the figures ____ from the table.', 'accurately'], ['b', 'Is this map ____ enough for the hike?', 'accurate'], ['c', 'Speed is important, but ____ matters more.', 'accuracy']]),
  ...fam('effectively', 'vocab_effectively', [['a', 'She manages her time very ____.', 'effectively'], ['b', 'Short breaks are an ____ way to stay focused.', 'effective'], ['c', 'The survey measured the ____ of the new rules.', 'effectiveness']]),
  ...fam('develop', 'vocab_develop', [['a', 'Children ____ quickly in their first years.', 'develop'], ['b', 'The ____ of the new app took two years.', 'development'], ['c', 'Her ideas are well ____ and clearly explained.', 'developed']]),
  ...fam('communicate', 'vocab_communicate_10', [['a', 'It is important to ____ clearly with your team.', 'communicate'], ['b', 'Good ____ helps families solve problems.', 'communication'], ['c', 'The lessons are very ____, with lots of pair work.', 'communicative']]),
  ...fam('preference', 'vocab_preference_10', [['a', 'I have a strong ____ for paper books.', 'preference'], ['b', 'Most of my friends ____ texting to calling.', 'prefer'], ['c', 'A quiet room is ____ to a noisy one for revising.', 'preferable']]),
  ...fam('achievement', 'vocab_achievement_10', [['a', 'Graduating from university was her biggest ____.', 'achievement'], ['b', 'You can ____ your goals if you plan carefully.', 'achieve'], ['c', 'Make sure your targets are realistic and ____.', 'achievable']]),
  ...fam('qualification', 'vocab_qualification_10', [['a', 'She has a ____ in first aid.', 'qualification'], ['b', 'He hopes to ____ as an engineer.', 'qualify'], ['c', 'The hospital needs more ____ nurses.', 'qualified']]),
  ...fam('succeed', 'vocab_succeed', [['a', 'If you keep trying, you will ____.', 'succeed'], ['b', 'The school play was a huge ____.', 'success'], ['c', 'She became a ____ writer after many years.', 'successful']])
];
