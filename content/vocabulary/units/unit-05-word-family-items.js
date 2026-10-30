// Unit 5 Word Families items (writing_set, taskType 'word_family'), WORDS 1–50: three items for each word that has a genuine family.
// Same record shape as unit-04-word-family-items.js. Each sentence has one gap that exactly one form of the family completes, and the gap never
// opens the sentence. only snorkelling, attractions, adventurous, spectacular, popular, preservation, exploring, observation, relaxation, recommendation, reservation, availability, specialise, qualification, location and equipment have a genuine family, so the other thirty-four words have no items
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
  family('adventurous_c', 'vocab_adventurous', 'adventurous', 'The ____ spent three months crossing the polar ice on skis before reaching the coast.', 'adventurer'),
  family('spectacular_a', 'vocab_spectacular', 'spectacular', 'The fireworks made a ____ finish to the festival, lighting up the whole bay.', 'spectacular'),
  family('spectacular_b', 'vocab_spectacular', 'spectacular', 'Thousands of people gathered on the beach to watch the ____ of the eclipse.', 'spectacle'),
  family('spectacular_c', 'vocab_spectacular', 'spectacular', 'The cliffs rise ____ from the sea, almost two hundred metres high.', 'spectacularly'),
  family('popular_a', 'vocab_popular', 'popular', 'Cycling is a ____ way to explore the island, and bicycle hire shops are everywhere.', 'popular'),
  family('popular_b', 'vocab_popular', 'popular', 'The sudden ____ of the village among tourists surprised the local council.', 'popularity'),
  family('popular_c', 'vocab_popular', 'popular', 'Because the entry fee was so high, the new theme park was ____ with local families.', 'unpopular'),
  family('preservation_a', 'vocab_preservation', 'preservation', 'Volunteers in the village raise money to ____ the harbour walls and the old lighthouse.', 'preserve'),
  family('preservation_b', 'vocab_preservation', 'preservation', 'The museum’s main aim is the ____ of rare manuscripts from fire and damp.', 'preservation'),
  family('preservation_c', 'vocab_preservation', 'preservation', 'Tourists admire the perfectly ____ remains of a Roman villa near the beach.', 'preserved'),
  family('exploring_a', 'vocab_exploring', 'exploring', 'Guests are welcome to ____ the surrounding hills on foot or by bicycle.', 'explore'),
  family('exploring_b', 'vocab_exploring', 'exploring', 'In the nineteenth century, an ____ from Scotland travelled up the river and drew the first map of the region.', 'explorer'),
  family('exploring_c', 'vocab_exploring', 'exploring', 'Scientific ____ of the deep ocean has revealed thousands of new species.', 'exploration'),
  family('observation_a', 'vocab_observation', 'observation', 'Rangers asked the visitors to ____ the seals quietly from the platform.', 'observe'),
  family('observation_b', 'vocab_observation', 'observation', 'The scientists’ conclusions were based on weeks of careful ____ of the birds.', 'observation'),
  family('observation_c', 'vocab_observation', 'observation', 'An experienced ____ sat in the hide and wrote down every bird that landed on the lake.', 'observer'),
  family('relaxation_a', 'vocab_relaxation', 'relaxation', 'After the exams, the students needed a week of complete ____ with no homework at all.', 'relaxation'),
  family('relaxation_b', 'vocab_relaxation', 'relaxation', 'The therapist taught the guests how to ____ their shoulders and breathe slowly.', 'relax'),
  family('relaxation_c', 'vocab_relaxation', 'relaxation', 'After a long walk, a hot bath is a very ____ way to end the day.', 'relaxing'),
  family('recommendation_a', 'vocab_recommendation_5', 'recommendation', 'Could you ____ a quiet place to eat near the cathedral?', 'recommend'),
  family('recommendation_b', 'vocab_recommendation_5', 'recommendation', 'The guidebook gives a clear ____ for every hotel it lists, from budget to luxury.', 'recommendation'),
  family('recommendation_c', 'vocab_recommendation_5', 'recommendation', 'We stayed at a highly ____ guesthouse run by a retired couple.', 'recommended'),
  family('reservation_a', 'vocab_reservation', 'reservation', 'It is wise to ____ your seats on the ferry well in advance during the summer holidays.', 'reserve'),
  family('reservation_b', 'vocab_reservation', 'reservation', 'Please confirm your ____ by email at least a week before your arrival.', 'reservation'),
  family('reservation_c', 'vocab_reservation', 'reservation', 'The front rows of the theatre are ____ for guests with young children.', 'reserved'),
  family('availability_a', 'vocab_availability_5', 'availability', 'Because of the festival, ____ of tents at the campsite is very limited.', 'availability'),
  family('availability_b', 'vocab_availability_5', 'availability', 'Is a double room still ____ for the last week of August?', 'available'),
  family('availability_c', 'vocab_availability_5', 'availability', 'The guide said that the cave tour was ____ today because of flooding.', 'unavailable'),
  family('specialise_a', 'vocab_specialise', 'specialise', 'Some doctors choose to ____ in the illnesses that travellers catch in hot countries.', 'specialise'),
  family('specialise_b', 'vocab_specialise', 'specialise', 'The agency asked a ____ in wildlife photography to lead the weekend course.', 'specialist'),
  family('specialise_c', 'vocab_specialise', 'specialise', 'The university offers a choice of three areas of ____ in the final year of the degree.', 'specialisation'),
  family('qualification_a', 'vocab_qualification', 'qualification', 'After a two-year course, she hoped to ____ as a tour guide.', 'qualify'),
  family('qualification_b', 'vocab_qualification', 'qualification', 'The company employs only fully ____ lifeguards, so parents can feel confident at the pool.', 'qualified'),
  family('qualification_c', 'vocab_qualification', 'qualification', 'To apply for the job, you need a ____ in tourism or a similar subject.', 'qualification'),
  family('location_a', 'vocab_location', 'location', 'The explorers used the stars to ____ their position in the desert.', 'locate'),
  family('location_b', 'vocab_location', 'location', 'The old fortress is ____ on a hill above the river, just outside the town.', 'located'),
  family('location_c', 'vocab_location', 'location', 'The exact ____ of the treasure is marked with a cross on the map.', 'location'),
  family('equipment_a', 'vocab_equipment_5', 'equipment', 'The school wants to ____ every classroom with a computer and a projector.', 'equip'),
  family('equipment_b', 'vocab_equipment_5', 'equipment', 'The kitchen in our self-catering cabin is well ____, with everything from a toaster to a large oven.', 'equipped'),
  family('equipment_c', 'vocab_equipment_5', 'equipment', 'Please return all hired ____ to the shop by six o’clock on Sunday.', 'equipment')
];
