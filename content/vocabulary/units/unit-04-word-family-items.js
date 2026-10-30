// Unit 4 Word Families items (writing_set, taskType 'word_family'), WORDS 1–30 ONLY: three items for each word that has a genuine family.
// Same record shape as unit-03-word-family-items.js. Each sentence has one gap that exactly one form of the family completes, and the gap never
// opens the sentence. the fifteen other words have no family, so no items (see unit-04-word-families.js).
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
  family('luxury_c', 'vocab_luxury', 'luxury', 'Their yacht was ____ equipped, with a cinema, a pool and a private chef.', 'luxuriously'),
  family('anxious_a', 'vocab_anxious', 'anxious', 'I always feel ____ when the plane begins to shake in strong wind.', 'anxious'),
  family('anxious_b', 'vocab_anxious', 'anxious', 'The long delay caused great ____ among the waiting passengers.', 'anxiety'),
  family('anxious_c', 'vocab_anxious', 'anxious', 'The family waited ____ at the arrivals gate for news of the diverted flight.', 'anxiously'),
  family('pollution_a', 'vocab_pollution', 'pollution', 'The council introduced a daily charge to reduce traffic ____ in the city centre.', 'pollution'),
  family('pollution_b', 'vocab_pollution', 'pollution', 'Cars that burn petrol ____ the air with harmful gases.', 'pollute'),
  family('pollution_c', 'vocab_pollution', 'pollution', 'After the oil spill, the beaches were so ____ that nobody could swim there.', 'polluted'),
  family('efficiently_a', 'vocab_efficiently', 'efficiently', 'The new system allows staff to load the aircraft ____ and with very little waste.', 'efficiently'),
  family('efficiently_b', 'vocab_efficiently', 'efficiently', 'Cycling is a very ____ way to travel short distances in a crowded city.', 'efficient'),
  family('efficiently_c', 'vocab_efficiently', 'efficiently', 'The council wants to improve the ____ of the local bus service.', 'efficiency'),
  family('invention_a', 'vocab_invention', 'invention', 'Engineers hope to ____ a battery that lasts for a thousand kilometres.', 'invent'),
  family('invention_b', 'vocab_invention', 'invention', 'The ____ showed the judges a model of her new folding bicycle.', 'inventor'),
  family('invention_c', 'vocab_invention', 'invention', 'The team found a very ____ way to carry heavy goods up the steep hill.', 'inventive'),
  family('advertisement_a', 'vocab_advertisement_4', 'advertisement', 'The railway company paid for a colourful ____ in the national newspaper.', 'advertisement'),
  family('advertisement_b', 'vocab_advertisement_4', 'advertisement', 'The government has banned tobacco ____ at bus stops and railway stations.', 'advertising'),
  family('advertisement_c', 'vocab_advertisement_4', 'advertisement', 'The airline will ____ its new routes on television next month.', 'advertise'),
  family('equipment_a', 'vocab_equipment_4', 'equipment', 'The rescue team lost most of its ____ in the flood.', 'equipment'),
  family('equipment_b', 'vocab_equipment_4', 'equipment', 'The airline plans to ____ every plane with free Wi-Fi next year.', 'equip'),
  family('equipment_c', 'vocab_equipment_4', 'equipment', 'The new ambulance is fully ____ with life-saving devices.', 'equipped'),
  family('organisation_a', 'vocab_organisation', 'organisation', 'The charity is a small ____ with only five full-time workers.', 'organisation'),
  family('organisation_b', 'vocab_organisation', 'organisation', 'Our class will ____ a road safety day for the whole school.', 'organise'),
  family('organisation_c', 'vocab_organisation', 'organisation', 'The railway timetable was so badly ____ that passengers missed their connections.', 'organised'),
  family('participant_a', 'vocab_participant_4', 'participant', 'The youngest ____ in the cycling trial was only ten years old.', 'participant'),
  family('participant_b', 'vocab_participant_4', 'participant', 'Several schools have agreed to ____ in the national road safety week.', 'participate'),
  family('participant_c', 'vocab_participant_4', 'participant', 'The council thanked local residents for their ____ in the car-free day.', 'participation')
];
