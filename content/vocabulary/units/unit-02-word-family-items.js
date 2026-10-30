// Unit 2 Word Families items (writing_set, taskType 'word_family'), WORDS 1–10 ONLY: three items for each word that has a genuine family.
// Same record shape as unit-01-word-family-expansion.js. Each sentence has one gap that exactly one form of the family completes, and the
// gap never opens the sentence. "device" and "current affairs" have no family, so they have no items (see unit-02-word-families.js).
const unitNumber = 2;
const status = 'draft';
function family(id, vocabularyId, name, sourceText, acceptedAnswer) {
  return {
    activityContentId:`u2_writing_word_family_${id}`, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'word_family', prompt:`Use the correct form from the ${name} word family.`, sourceText, acceptedAnswers:[acceptedAnswer], linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}

export default [
  family('entertainment_a', 'vocab_entertainment', 'entertainment', 'The comedian worked hard to _____ the audience for two hours.', 'entertain'),
  family('entertainment_b', 'vocab_entertainment', 'entertainment', 'We found the documentary surprisingly _____ as well as informative.', 'entertaining'),
  family('entertainment_c', 'vocab_entertainment', 'entertainment', 'The festival offers free _____ for children, including puppet shows and face painting.', 'entertainment'),
  family('entertainment_d', 'vocab_entertainment', 'entertainment', 'The _____ wore a bright costume and told jokes to the crowd.', 'entertainer'),
  family('access_a', 'vocab_access', 'access', 'Not every school has _____ to fast internet.', 'access'),
  family('access_b', 'vocab_access', 'access', 'The new ramp makes the library _____ for wheelchair users.', 'accessible'),
  family('access_c', 'vocab_access', 'access', 'After the storm, the village was _____ for three days because the bridge had collapsed.', 'inaccessible'),
  family('digital_a', 'vocab_digital', 'digital', 'Many students prefer _____ notes to handwritten ones.', 'digital'),
  family('digital_b', 'vocab_digital', 'digital', 'Please send the form _____ rather than by post.', 'digitally'),
  family('digital_c', 'vocab_digital', 'digital', 'The archive hopes to _____ thousands of old letters over the next year.', 'digitise'),
  family('streaming_a', 'vocab_streaming', 'streaming', 'The rapid growth of _____ has hurt cinemas.', 'streaming'),
  family('streaming_b', 'vocab_streaming', 'streaming', 'I like to _____ music while I do my homework.', 'stream'),
  family('streaming_c', 'vocab_streaming', 'streaming', 'The young _____ answers viewers’ questions while she plays.', 'streamer'),
  family('relevant_a', 'vocab_relevant', 'relevant', 'Only use examples that are _____ to the topic.', 'relevant'),
  family('relevant_b', 'vocab_relevant', 'relevant', 'Explain the _____ of this quotation to your argument.', 'relevance'),
  family('relevant_c', 'vocab_relevant', 'relevant', 'The long story about his holiday was _____ to the essay question.', 'irrelevant'),
  family('educator_a', 'vocab_educator', 'educator', 'After years as a trainee, she became a respected _____ at the college.', 'educator'),
  family('educator_b', 'vocab_educator', 'educator', 'Schools should _____ students about the risks of sharing personal information.', 'educate'),
  family('educator_c', 'vocab_educator', 'educator', 'A good _____ gives students the confidence to ask questions.', 'education'),
  family('afford_a', 'vocab_afford_2', 'afford', 'Few teenagers can _____ the newest phone without help.', 'afford'),
  family('afford_b', 'vocab_afford_2', 'afford', 'The company launched a cheaper, more _____ version of its tablet.', 'affordable'),
  family('afford_c', 'vocab_afford_2', 'afford', 'Rent in the city centre is _____ for most students.', 'unaffordable'),
  family('essential_a', 'vocab_essential', 'essential', 'A good night’s sleep is _____ before an exam.', 'essential'),
  family('essential_b', 'vocab_essential', 'essential', 'The two designs are _____ identical, apart from the colour.', 'essentially'),
  family('essential_c', 'vocab_essential', 'essential', 'Take the _____ and leave everything else at home.', 'essentials')
];
