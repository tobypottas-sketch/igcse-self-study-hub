// Unit 4 Precision & Use content: two "weak wording -> precise word" items per word, WORDS 1–10 ONLY. Same contract as unit-03-precision-use.js:
// each item is a writing_set improve_vocabulary record; the weak wording quoted in the prompt appears exactly once in sourceText and not at its
// start; distractors fit the sentence grammatically but are wrong in meaning.
const status = 'approved';
const unitNumber = 4;
function precision(id, vocabularyId, prompt, sourceText, acceptedAnswers, distractors) {
  return {
    activityContentId:id, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'improve_vocabulary', prompt, sourceText, acceptedAnswers, distractors, linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}
const P = weak => `Replace “${weak}” with a more precise Unit 4 word or phrase.`;

export default [
  precision('u4_writing_precision_breathtaking_a', 'vocab_breathtaking', P('very beautiful'), 'From the cable car, we had a very beautiful view of the whole valley.', ['breathtaking'], ['ordinary', 'narrow', 'crowded']),
  precision('u4_writing_precision_breathtaking_b', 'vocab_breathtaking', P('amazing'), 'The sunset over the runway was amazing, so the travellers took photographs.', ['breathtaking'], ['ordinary', 'noisy', 'familiar']),
  precision('u4_writing_precision_comfort_a', 'vocab_comfort', P('being physically relaxed'), 'The coach has wide seats, so passengers can enjoy being physically relaxed on long journeys.', ['comfort', 'physical comfort'], ['danger', 'speed', 'silence']),
  precision('u4_writing_precision_comfort_b', 'vocab_comfort', P('ease and relaxation'), 'The airline spends millions on seats that offer passengers ease and relaxation.', ['comfort'], ['speed', 'danger', 'information']),
  precision('u4_writing_precision_reality_a', 'vocab_reality', P('the real situation'), 'The brochure promised a calm crossing, but the real situation is that the ferry shakes badly.', ['the reality', 'reality'], ['the promise', 'the plan', 'the dream']),
  precision('u4_writing_precision_reality_b', 'vocab_reality', P('how things really are'), 'New drivers should think about how things really are on icy roads.', ['the reality', 'the reality of'], ['the colour', 'the price', 'the history']),
  precision('u4_writing_precision_toughest_a', 'vocab_toughest', P('the most difficult'), 'For the cyclists, the most difficult part of the route is the final climb.', ['the toughest', 'toughest'], ['the shortest', 'the cheapest', 'the quietest']),
  precision('u4_writing_precision_toughest_b', 'vocab_toughest', P('hardest'), 'Many pilots say that landing in strong wind is the hardest test of their skill.', ['toughest'], ['safest', 'quietest', 'cheapest']),
  precision('u4_writing_precision_storeys_a', 'vocab_storeys', P('floors'), 'The new airport hotel has thirty floors and a restaurant on the roof.', ['storeys'], ['lifts', 'windows', 'doors']),
  precision('u4_writing_precision_storeys_b', 'vocab_storeys', P('levels'), 'The car park beside the terminal has eight levels, and a lift connects them all.', ['storeys'], ['exits', 'tickets', 'barriers']),
  precision('u4_writing_precision_accommodate_a', 'vocab_accommodate', P('has enough room for'), 'The new ferry has enough room for two hundred cars and a thousand people.', ['can accommodate', 'accommodates'], ['can repair', 'can inspect', 'can follow']),
  precision('u4_writing_precision_accommodate_b', 'vocab_accommodate', P('is big enough to hold'), 'The new stadium is big enough to hold eighty thousand fans, and extra trains run after every match.', ['can accommodate', 'is able to accommodate'], ['can repair', 'can introduce', 'can warn']),
  precision('u4_writing_precision_luxury_a', 'vocab_luxury', P('rich, costly surroundings'), 'First-class passengers on the cruise ship live in rich, costly surroundings for the whole voyage.', ['luxury'], ['danger', 'poverty', 'silence']),
  precision('u4_writing_precision_luxury_b', 'vocab_luxury', P('an expensive extra'), 'A holiday abroad is an expensive extra that many families can only afford once every few years.', ['a luxury'], ['a necessity', 'a problem', 'a habit']),
  precision('u4_writing_precision_altitude_a', 'vocab_altitude', P('height above sea level'), 'Climbers must be careful because the height above sea level affects how much oxygen they get.', ['altitude'], ['distance', 'speed', 'age']),
  precision('u4_writing_precision_altitude_b', 'vocab_altitude', P('height'), 'Mountain railways are built to cope with the changes in height as they climb the slopes.', ['altitude'], ['colour', 'price', 'language']),
  precision('u4_writing_precision_landscape_a', 'vocab_landscape', P('the scenery'), 'From the train window, travellers can enjoy the scenery all day.', ['the landscape'], ['the timetable', 'the luggage', 'the engine']),
  precision('u4_writing_precision_landscape_b', 'vocab_landscape', P('view of the countryside'), 'The new motorway has completely changed the view of the countryside near our village.', ['landscape', 'the landscape'], ['price', 'speed', 'weight']),
  precision('u4_writing_precision_passenger_a', 'vocab_passenger', P('person travelling on the bus'), 'Each person travelling on the bus must show a valid ticket to the driver.', ['passenger'], ['driver', 'mechanic', 'guard']),
  precision('u4_writing_precision_passenger_b', 'vocab_passenger', P('traveller'), 'The last traveller to leave the ferry was an elderly man with a walking stick.', ['passenger'], ['captain', 'engineer', 'sailor'])
];
