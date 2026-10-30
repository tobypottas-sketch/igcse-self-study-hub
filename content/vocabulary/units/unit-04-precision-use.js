// Unit 4 Precision & Use content: two "weak wording -> precise word" items per word, WORDS 1–20 ONLY. Same contract as unit-03-precision-use.js:
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
  precision('u4_writing_precision_passenger_b', 'vocab_passenger', P('traveller'), 'The last traveller to leave the ferry was an elderly man with a walking stick.', ['passenger'], ['captain', 'engineer', 'sailor']),
  precision('u4_writing_precision_engineer_a', 'vocab_engineer', P('a technical expert'), 'Before the first flight, a technical expert checked the new aircraft’s wings carefully.', ['an engineer'], ['a tourist', 'a passenger', 'a spectator']),
  precision('u4_writing_precision_engineer_b', 'vocab_engineer', P('a person trained to design and repair trains'), 'The railway company hired a person trained to design and repair trains to fix the fault.', ['an engineer'], ['a conductor', 'a ticket seller', 'a tour guide']),
  precision('u4_writing_precision_pilot_a', 'vocab_pilot', P('the person who flies the plane'), 'Over the speaker, the person who flies the plane told us to fasten our seat belts.', ['the pilot'], ['the mechanic', 'the porter', 'the guard']),
  precision('u4_writing_precision_pilot_b', 'vocab_pilot', P('a plane driver'), 'My uncle works as a plane driver for an international airline.', ['a pilot'], ['a mechanic', 'a porter', 'a cook']),
  precision('u4_writing_precision_airship_a', 'vocab_airship', P('a steerable gas-filled aircraft'), 'In the 1930s, a steerable gas-filled aircraft carried tourists across the Atlantic.', ['an airship'], ['an aeroplane', 'an ambulance', 'an escalator']),
  precision('u4_writing_precision_airship_b', 'vocab_airship', P('a lighter-than-air craft'), 'The museum has a model of a lighter-than-air craft that once carried passengers over Europe.', ['an airship'], ['an aeroplane', 'an ambulance', 'an escalator']),
  precision('u4_writing_precision_launch_a', 'vocab_launch', P('send up'), 'Scientists hope to send up a new weather satellite from the coast next month.', ['launch'], ['repair', 'recycle', 'collect']),
  precision('u4_writing_precision_launch_b', 'vocab_launch', P('begin'), 'The airline will begin a new service to Tokyo in March.', ['launch'], ['cancel', 'delay', 'repeat']),
  precision('u4_writing_precision_height_a', 'vocab_height', P('how tall the lorry is'), 'Drivers must always check how tall the lorry is before entering the tunnel.', ['the height of the lorry'], ['the weight of the lorry', 'the speed of the lorry', 'the age of the lorry']),
  precision('u4_writing_precision_height_b', 'vocab_height', P('the distance from bottom to top of'), 'Engineers measured the distance from bottom to top of the new tower.', ['the height of'], ['the weight of', 'the age of', 'the cost of']),
  precision('u4_writing_precision_anxious_a', 'vocab_anxious', P('very worried'), 'Many first-time flyers feel very worried before the aeroplane takes off.', ['anxious', 'extremely anxious'], ['eager', 'relaxed', 'delighted']),
  precision('u4_writing_precision_anxious_b', 'vocab_anxious', P('nervous and uneasy'), 'Through the window, the nervous and uneasy passengers watched dark clouds gather.', ['anxious'], ['eager', 'sleepy', 'generous']),
  precision('u4_writing_precision_vehicle_a', 'vocab_vehicle', P('a car, bus or lorry'), 'Only a car, bus or lorry with a special permit may enter the old town.', ['a vehicle'], ['a garage', 'a bridge', 'a station']),
  precision('u4_writing_precision_vehicle_b', 'vocab_vehicle', P('machine used for transport'), 'The council wants to replace every old machine used for transport with a cleaner electric one.', ['vehicle'], ['road', 'garage', 'tunnel']),
  precision('u4_writing_precision_pollution_a', 'vocab_pollution', P('dirty air'), 'Traffic fumes cause dirty air in many large cities.', ['air pollution', 'pollution'], ['air travel', 'air pressure', 'air conditioning']),
  precision('u4_writing_precision_pollution_b', 'vocab_pollution', P('harmful waste in the environment'), 'Local people blamed the factory for harmful waste in the environment.', ['pollution'], ['noise', 'congestion', 'delay']),
  precision('u4_writing_precision_destination_a', 'vocab_destination', P('the place we were travelling to'), 'After a long day, we arrived at the place we were travelling to just before midnight.', ['our destination', 'the destination'], ['our departure', 'our route', 'our timetable']),
  precision('u4_writing_precision_destination_b', 'vocab_destination', P('end point'), 'The bus company published a map showing every route and its end point.', ['destination'], ['driver', 'engine', 'ticket']),
  precision('u4_writing_precision_spacious_a', 'vocab_spacious', P('very big inside'), 'The new coach is very big inside, so passengers can stretch out their legs.', ['spacious', 'very spacious'], ['crowded', 'narrow', 'noisy']),
  precision('u4_writing_precision_spacious_b', 'vocab_spacious', P('large and open'), 'Compared with the old station, the new terminal is large and open, with wide corridors.', ['spacious'], ['cramped', 'dusty', 'noisy'])

];
