// Unit 5 Word Families items (writing_set, taskType 'word_family'), WORDS 1–10 ONLY: three items for each word that has a genuine family.
// Same record shape as unit-04-word-family-items.js. Each sentence has one gap that exactly one form of the family completes, and the gap never
// opens the sentence. aerial tourism, underwater photography, documentary, expedition, yacht, scenery and accommodation have no family, so no items
// (see unit-05-word-families.js).
const unitNumber = 5;
const status = 'approved';
function family(id, vocabularyId, name, sourceText, acceptedAnswer) {
  return {
    activityContentId:`u5_writing_word_family_${id}`, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'word_family', prompt:`Use the correct form from the ${name} word family.`, sourceText, acceptedAnswers:[acceptedAnswer], linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}

export default [
  family('snorkelling_a', 'vocab_snorkelling', 'snorkelling', 'Most guests prefer ____ to scuba diving because it needs less training.', 'snorkelling'),
  family('snorkelling_b', 'vocab_snorkelling', 'snorkelling', 'Beginners should ____ close to the shore until they feel confident.', 'snorkel'),
  family('snorkelling_c', 'vocab_snorkelling', 'snorkelling', 'The boat crew counted every ____ back on board before the engine was started.', 'snorkeller'),
  family('attractions_a', 'vocab_attractions', 'attractions', 'The royal palace and the zoo are the two biggest tourist ____ in the capital.', 'attractions'),
  family('attractions_b', 'vocab_attractions', 'attractions', 'Free entry to the museum is one way to ____ more families.', 'attract'),
  family('attractions_c', 'vocab_attractions', 'attractions', 'The old harbour is especially ____ at sunset, when the whole bay glows orange.', 'attractive'),
  family('adventurous_a', 'vocab_adventurous', 'adventurous', 'Young people who are ____ often choose rafting or rock climbing instead of a quiet beach holiday.', 'adventurous'),
  family('adventurous_b', 'vocab_adventurous', 'adventurous', 'For many teenagers, a week alone in the mountains is the ____ of a lifetime.', 'adventure'),
  family('adventurous_c', 'vocab_adventurous', 'adventurous', 'The ____ spent three months crossing the polar ice on skis before reaching the coast.', 'adventurer')
];
