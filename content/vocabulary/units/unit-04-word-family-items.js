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
  family('participant_c', 'vocab_participant_4', 'participant', 'The council thanked local residents for their ____ in the car-free day.', 'participation'),
  family('operate_a', 'vocab_operate', 'operate', 'Only licensed drivers are permitted to ____ a taxi in the city.', 'operate'),
  family('operate_b', 'vocab_operate', 'operate', 'The tram ____ announced that services would stop earlier on Sundays.', 'operator'),
  family('operate_c', 'vocab_operate', 'operate', 'The new airport terminal will not be fully ____ until the end of the year.', 'operational'),
  family('safety_a', 'vocab_safety', 'safety', 'Airlines spend large sums of money to improve the ____ of their passengers.', 'safety'),
  family('safety_b', 'vocab_safety', 'safety', 'The captain brought the ferry ____ into the harbour despite the storm.', 'safely'),
  family('safety_c', 'vocab_safety', 'safety', 'It is not ____ to cross the railway line when the barriers are down.', 'safe'),
  family('sustainability_a', 'vocab_sustainability', 'sustainability', 'City planners believe that cycle lanes will improve the long-term ____ of urban transport.', 'sustainability'),
  family('sustainability_b', 'vocab_sustainability', 'sustainability', 'Many experts say that cheap short flights are not ____ in the long term.', 'sustainable'),
  family('sustainability_c', 'vocab_sustainability', 'sustainability', 'Fuel for the new trains is produced ____ from waste vegetable oil.', 'sustainably'),
  family('innovative_a', 'vocab_innovative', 'innovative', 'The ____ engineer designed a train that uses no fuel at all.', 'innovative'),
  family('innovative_b', 'vocab_innovative', 'innovative', 'Airlines must ____ if they want to reduce their fuel use.', 'innovate'),
  family('innovative_c', 'vocab_innovative', 'innovative', 'The most important ____ in public transport this century has been the electric bus.', 'innovation'),
  family('fatality_a', 'vocab_fatality', 'fatality', 'Police confirmed that the crash had caused one ____ and three injuries.', 'fatality'),
  family('fatality_b', 'vocab_fatality', 'fatality', 'Tiredness at the wheel is a leading cause of ____ road accidents.', 'fatal'),
  family('fatality_c', 'vocab_fatality', 'fatality', 'The motorist was ____ injured when his car hit a barrier.', 'fatally'),
  family('regulation_a', 'vocab_regulation', 'regulation', 'The tram operator was fined for breaking a ____ on opening hours.', 'regulation'),
  family('regulation_b', 'vocab_regulation', 'regulation', 'Local councils have the power to ____ the number of taxis in the city.', 'regulate'),
  family('regulation_c', 'vocab_regulation', 'regulation', 'The ____ authority can close any airline that ignores safety rules.', 'regulatory'),
  family('enforcement_a', 'vocab_enforcement', 'enforcement', 'Local councils have asked for more money for traffic ____.', 'enforcement'),
  family('enforcement_b', 'vocab_enforcement', 'enforcement', 'The police do not have enough officers to ____ the new speed limit.', 'enforce'),
  family('enforcement_c', 'vocab_enforcement', 'enforcement', 'The ban on mobile phones is rarely ____ on this road.', 'enforced'),
  family('legislation_a', 'vocab_legislation', 'legislation', 'Parliament spent months debating the proposed ____ on drones.', 'legislation'),
  family('legislation_b', 'vocab_legislation', 'legislation', 'The minister said that it was time to ____ on the use of electric scooters.', 'legislate'),
  family('legislation_c', 'vocab_legislation', 'legislation', 'The ____ body of the country meets in the capital every Tuesday.', 'legislative'),
  family('statistics_a', 'vocab_statistics', 'statistics', 'The council collects ____ on the number of cyclists who use the new bridge.', 'statistics'),
  family('statistics_b', 'vocab_statistics', 'statistics', 'There is no ____ evidence that the new speed limit has reduced accidents.', 'statistical'),
  family('statistics_c', 'vocab_statistics', 'statistics', 'It is ____ unlikely that two such accidents will happen in one week.', 'statistically')
];
