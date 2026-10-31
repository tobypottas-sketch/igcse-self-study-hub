// Unit 6 Word Families items (writing_set, taskType 'word_family'), WORDS 1–10 so far: three items for each word that has a genuine family.
// Same record shape as unit-05-word-family-items.js. Each sentence has one gap that exactly one form of the family completes, and the gap never
// opens the sentence. Only confidence, stagnate, engage and participate have a genuine family in this batch, so the other six words have no items
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
  family('participate_c', 'vocab_participate', 'participate', 'Each ____ received a certificate at the end of the workshop.', 'participant')
];
