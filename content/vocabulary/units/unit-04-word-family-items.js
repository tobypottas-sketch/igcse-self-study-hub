// Unit 4 Word Families items (writing_set, taskType 'word_family'), WORDS 1–10 ONLY: three items for each word that has a genuine family.
// Same record shape as unit-03-word-family-items.js. Each sentence has one gap that exactly one form of the family completes, and the gap never
// opens the sentence. breathtaking, toughest, storeys, accommodate, altitude, landscape and passenger have no family, so no items (see unit-04-word-families.js).
const unitNumber = 4;
const status = 'approved';
function family(id, vocabularyId, name, sourceText, acceptedAnswer) {
  return {
    activityContentId:`u4_writing_word_family_${id}`, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'word_family', prompt:`Use the correct form from the ${name} word family.`, sourceText, acceptedAnswers:[acceptedAnswer], linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}

export default [
  family('comfort_a', 'vocab_comfort', 'comfort', 'Wide seats and extra legroom are important for the ____ of passengers on night trains.', 'comfort'),
  family('comfort_b', 'vocab_comfort', 'comfort', 'Even tall passengers can sit ____ in the new seats, because there is so much legroom.', 'comfortably'),
  family('comfort_c', 'vocab_comfort', 'comfort', 'The wooden benches on the old bus were so ____ that nobody wanted to sit down.', 'uncomfortable'),
  family('reality_a', 'vocab_reality', 'reality', 'Passengers often ____ too late that they have boarded the wrong train.', 'realise'),
  family('reality_b', 'vocab_reality', 'reality', 'Is it ____ to expect a journey of nine hundred kilometres to take only two hours?', 'realistic'),
  family('reality_c', 'vocab_reality', 'reality', 'The pilot asked whether the warning light showed a ____ problem or only a mistake in the display.', 'real'),
  family('luxury_a', 'vocab_luxury', 'luxury', 'The film star lived a life of ____ on a private yacht.', 'luxury'),
  family('luxury_b', 'vocab_luxury', 'luxury', 'The hotel rooms were large, quiet and extremely ____.', 'luxurious'),
  family('luxury_c', 'vocab_luxury', 'luxury', 'Their yacht was ____ equipped, with a cinema, a pool and a private chef.', 'luxuriously')
];
