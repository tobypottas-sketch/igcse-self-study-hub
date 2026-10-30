// Unit 3 Word Families items (writing_set, taskType 'word_family'), WORDS 1–10 ONLY: three items for each word that has a genuine family.
// Same record shape as unit-02-word-family-items.js. Each sentence has one gap that exactly one form of the family completes, and the gap never
// opens the sentence. outlet, considerably, guaranteed, fooled, pressure and majority have no family, so no items (see unit-03-word-families.js).
const unitNumber = 3;
const status = 'approved';
function family(id, vocabularyId, name, sourceText, acceptedAnswer) {
  return {
    activityContentId:`u3_writing_word_family_${id}`, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'word_family', prompt:`Use the correct form from the ${name} word family.`, sourceText, acceptedAnswers:[acceptedAnswer], linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}

export default [
  family('participant_a', 'vocab_participant', 'participant', 'More than two hundred runners will ____ in the charity race this weekend.', 'participate'),
  family('participant_b', 'vocab_participant', 'participant', 'Regular ____ in school clubs helps students make new friends.', 'participation'),
  family('participant_c', 'vocab_participant', 'participant', 'The youngest ____ in the cooking contest was only nine years old.', 'participant'),
  family('sprinkled_a', 'vocab_sprinkled', 'sprinkled', 'Please ____ a little salt over the potatoes just before you serve them.', 'sprinkle'),
  family('sprinkled_b', 'vocab_sprinkled', 'sprinkled', 'The chips were ____ with vinegar and salt when they reached our table.', 'sprinkled'),
  family('sprinkled_c', 'vocab_sprinkled', 'sprinkled', 'Only a ____ of customers came to the cafe on the rainy afternoon.', 'sprinkling'),
  family('underestimate_a', 'vocab_underestimate', 'underestimate', 'Because they ____ the amount of sugar in juice, many people drink far too much of it.', 'underestimate'),
  family('underestimate_b', 'vocab_underestimate', 'underestimate', 'The builder gave us a rough ____ of how much the new kitchen would cost.', 'estimate'),
  family('underestimate_c', 'vocab_underestimate', 'underestimate', 'Many diners ____ how hungry they are, so they order far too much food.', 'overestimate'),
  family('harmless_a', 'vocab_harmless', 'harmless', 'Although the spider looks frightening, it is completely ____ and has never hurt anyone.', 'harmless'),
  family('harmless_b', 'vocab_harmless', 'harmless', 'Eating a small piece of cake will do you no ____.', 'harm'),
  family('harmless_c', 'vocab_harmless', 'harmless', 'Too much salt can be ____ to your heart over many years.', 'harmful')
];
