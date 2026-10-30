// Unit 4 · Paraphrasing content (phrase_set and idea_set), WORDS 1–20 ONLY. Same record shapes and contract as unit-03-activities.js:
//   phrase_set : originalPhrase (plain wording) -> equivalentPhrase (contains the target), acceptedVariants, chunks, commonMeaningDistortions
//   idea_set   : originalIdea (contains the target) with accurate paraphrases that do NOT contain it, a meaning invariant, and three
//                meaning-changing distractors each tagged with the misconception it represents.
// Every record is linked to exactly one Unit 4 word. Words 21–50 are not authored yet.
const status = 'approved';
const unitNumber = 4;

function phrase(id, originalPhrase, equivalentPhrase, linkedVocabularyIds, { acceptedVariants = [], chunks = null, distortions = [] } = {}) {
  return {
    activityContentId:`u4_phrase_${id}`, unitNumber, contentType:'phrase_set', status,
    activityData:{
      originalPhrase, equivalentPhrase, acceptedVariants,
      chunks:chunks ?? equivalentPhrase.split(/\s+/),
      commonMeaningDistortions:distortions,
      linkedVocabularyIds,
      primaryEvidenceTargetId:linkedVocabularyIds.length === 1 ? linkedVocabularyIds[0] : undefined
    }
  };
}

function idea(id, originalIdea, accurateParaphrase, invariantType, invariantValue, distractors, linkedVocabularyIds = []) {
  return {
    activityContentId:`u4_idea_${id}`, unitNumber, contentType:'idea_set', status,
    activityData:{
      originalIdea,
      accurateParaphrases:Array.isArray(accurateParaphrase) ? accurateParaphrase : [accurateParaphrase],
      meaningInvariants:[{ type:invariantType, value:invariantValue }],
      distractors,
      linkedVocabularyIds
    }
  };
}

const phraseSets = [
  phrase('breathtaking_view', 'an extremely beautiful view', 'a breathtaking view', ['vocab_breathtaking'], { acceptedVariants:['a breathtaking sight'], chunks:['a', 'breathtaking', 'view'], distortions:['an ordinary view', 'a dangerous view', 'a hidden view'] }),
  phrase('comfort_travel', 'travel while relaxed and free from pain', 'travel in comfort', ['vocab_comfort'], { chunks:['travel', 'in comfort'], distortions:['travel in danger', 'travel in a hurry', 'travel in silence'] }),
  phrase('reality_road', 'the true situation of life on the road', 'the reality of life on the road', ['vocab_reality'], { chunks:['the reality', 'of life on the road'], distortions:['the dream of life on the road', 'the danger of life on the road', 'the cost of life on the road'] }),
  phrase('toughest_stage', 'the most difficult stage of the race', 'the toughest stage of the race', ['vocab_toughest'], { acceptedVariants:['the hardest stage of the race'], chunks:['the toughest stage', 'of the race'], distortions:['the longest stage of the race', 'the final stage of the race', 'the easiest stage of the race'] }),
  phrase('storeys_building', 'a building with twenty floors', 'a building with twenty storeys', ['vocab_storeys'], { chunks:['a building', 'with twenty storeys'], distortions:['a building with twenty rooms', 'a building with twenty lifts', 'a building with twenty owners'] }),
  phrase('accommodate_passengers', 'have room for three hundred travellers', 'accommodate three hundred travellers', ['vocab_accommodate'], { acceptedVariants:['hold three hundred travellers'], chunks:['accommodate', 'three hundred travellers'], distortions:['refuse three hundred travellers', 'charge three hundred travellers', 'collect three hundred travellers'] }),
  phrase('luxury_holiday', 'a holiday full of expensive pleasures', 'a luxury holiday', ['vocab_luxury'], { chunks:['a luxury', 'holiday'], distortions:['a budget holiday', 'a short holiday', 'a dangerous holiday'] }),
  phrase('altitude_aeroplane', 'the height of the aeroplane above sea level', 'the altitude of the aeroplane', ['vocab_altitude'], { acceptedVariants:['the aeroplane’s altitude'], chunks:['the altitude', 'of the aeroplane'], distortions:['the speed of the aeroplane', 'the weight of the aeroplane', 'the age of the aeroplane'] }),
  phrase('landscape_north', 'the natural scenery of the north', 'the landscape of the north', ['vocab_landscape'], { chunks:['the landscape', 'of the north'], distortions:['the weather of the north', 'the roads of the north', 'the population of the north'] }),
  phrase('passenger_train', 'a person travelling on the train', 'a passenger on the train', ['vocab_passenger'], { acceptedVariants:['a train passenger'], chunks:['a passenger', 'on the train'], distortions:['a driver of the train', 'a guard on the train', 'a cleaner on the train'] }),
  phrase('engineer_railway', 'a person trained to design and repair railways', 'a railway engineer', ['vocab_engineer'], { chunks:['a railway', 'engineer'], distortions:['a railway passenger', 'a railway driver', 'a railway owner'] }),
  phrase('pilot_airline', 'a person who flies an airliner', 'an airline pilot', ['vocab_pilot'], { chunks:['an airline', 'pilot'], distortions:['an airline passenger', 'an airline cleaner', 'an airline manager'] }),
  phrase('airship_passenger', 'a gas-filled aircraft that carries travellers', 'a passenger airship', ['vocab_airship'], { chunks:['a passenger', 'airship'], distortions:['a passenger helicopter', 'a passenger balloon', 'a passenger submarine'] }),
  phrase('launch_bus_service', 'start a new bus service', 'launch a new bus service', ['vocab_launch'], { chunks:['launch', 'a new bus service'], distortions:['cancel a new bus service', 'use a new bus service', 'pay for a new bus service'] }),
  phrase('height_building', 'how tall the building is', 'the height of the building', ['vocab_height'], { chunks:['the height', 'of the building'], distortions:['the length of the building', 'the age of the building', 'the owner of the building'] }),
  phrase('anxious_flight', 'worried about the flight', 'anxious about the flight', ['vocab_anxious'], { chunks:['anxious', 'about the flight'], distortions:['eager for the flight', 'angry about the flight', 'bored by the flight'] }),
  phrase('vehicle_goods', 'a machine for carrying goods on roads', 'a goods vehicle', ['vocab_vehicle'], { chunks:['a goods', 'vehicle'], distortions:['a goods driver', 'a goods garage', 'a goods station'] }),
  phrase('pollution_cars', 'damage to the air caused by cars', 'air pollution from cars', ['vocab_pollution'], { chunks:['air pollution', 'from cars'], distortions:['air pressure from cars', 'air travel from cars', 'air conditioning from cars'] }),
  phrase('destination_train', 'the place the train is going to', 'the destination of the train', ['vocab_destination'], { chunks:['the destination', 'of the train'], distortions:['the driver of the train', 'the departure of the train', 'the speed of the train'] }),
  phrase('spacious_cabin', 'a cabin with plenty of room', 'a spacious cabin', ['vocab_spacious'], { chunks:['a spacious', 'cabin'], distortions:['a crowded cabin', 'a tiny cabin', 'a noisy cabin'] })
];

const ideaSets = [
  idea('breathtaking', 'The view from the top of the mountain railway was breathtaking.', ['The scenery seen from the top of the mountain railway was stunning.', 'The top of the mountain railway offered an amazingly beautiful view.', 'From the highest point of the mountain railway, the view was truly impressive.'], 'degree', 'extremely impressive', [
    { text:'The view from the top of the mountain railway was slightly disappointing.', misconceptionCategory:'polarity_change' },
    { text:'The view from the top of the mountain railway was somewhat pleasant.', misconceptionCategory:'degree_change' },
    { text:'The journey up the mountain railway was long and tiring.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_breathtaking']),
  idea('comfort', 'The new coaches allow passengers to travel in comfort.', ['The new coaches let travellers enjoy a relaxed, pain-free journey.', 'Passengers on the new coaches can make their journey in physical ease.', 'The new coaches make it possible for people to travel without discomfort.'], 'cause_effect', 'the new coaches make the journey relaxed', [
    { text:'The new coaches force passengers to travel in discomfort.', misconceptionCategory:'polarity_change' },
    { text:'The new coaches allow passengers to travel at high speed.', misconceptionCategory:'meaning_confusion' },
    { text:'Only passengers who pay extra can travel in a relaxed way on the new coaches.', misconceptionCategory:'added_information' }
  ], ['vocab_comfort']),
  idea('reality', 'The reality of life as a pilot is very different from what most people imagine.', ['The true situation for pilots is not at all what most people expect.', 'Life as a pilot is actually quite unlike the picture most people have.', 'What being a pilot is really like differs greatly from what most people think.'], 'comparison', 'differs greatly from what people imagine', [
    { text:'The reality of life as a pilot is exactly what most people imagine.', misconceptionCategory:'polarity_change' },
    { text:'The reality of life as a pilot is slightly different from what most people imagine.', misconceptionCategory:'degree_change' },
    { text:'The dream of life as a pilot is very different from what most people imagine.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_reality']),
  idea('toughest', 'The toughest part of the journey was crossing the mountains in winter.', ['The hardest section of the trip was getting over the mountains in winter.', 'Crossing the mountains in winter was the most difficult stage of the journey.', 'The most demanding part of the trip was travelling over the mountains in winter.'], 'degree', 'the most difficult part', [
    { text:'The easiest part of the journey was crossing the mountains in winter.', misconceptionCategory:'polarity_change' },
    { text:'The first part of the journey was crossing the mountains in winter.', misconceptionCategory:'time_change' },
    { text:'The toughest part of the journey was crossing the desert in summer.', misconceptionCategory:'added_information' }
  ], ['vocab_toughest']),
  idea('storeys', 'The new hotel next to the station has twelve storeys.', ['The new hotel beside the station has twelve floors.', 'There are twelve levels in the new hotel next to the station.', 'The new hotel by the railway station is twelve floors high.'], 'quantity', 'twelve', [
    { text:'The new hotel next to the station has two storeys.', misconceptionCategory:'quantity_change' },
    { text:'The new hotel next to the station has twelve rooms.', misconceptionCategory:'meaning_confusion' },
    { text:'The old hotel next to the station has twelve storeys.', misconceptionCategory:'time_change' }
  ], ['vocab_storeys']),
  idea('accommodate', 'The new stadium can accommodate fifty thousand fans.', ['The new stadium has enough space for fifty thousand fans.', 'Fifty thousand supporters can fit into the new stadium.', 'The new stadium is able to hold fifty thousand fans.'], 'quantity', 'fifty thousand', [
    { text:'The new stadium has enough space for five thousand fans.', misconceptionCategory:'quantity_change' },
    { text:'The new stadium will be built for fifty thousand fans.', misconceptionCategory:'time_change' },
    { text:'The new stadium has to turn away fifty thousand fans.', misconceptionCategory:'polarity_change' }
  ], ['vocab_accommodate']),
  idea('luxury', 'The hotel offers its guests a life of luxury at a very high price.', ['The hotel gives its guests lavish surroundings for a very high price.', 'Guests at the hotel enjoy expensive, high-class living, and they pay a lot for it.', 'Guests at the hotel pay a very high price for a lavish lifestyle.'], 'quantity', 'a very high price', [
    { text:'The hotel offers its guests a simple life at a very low price.', misconceptionCategory:'polarity_change' },
    { text:'The hotel offers its guests a life of luxury at a fair price.', misconceptionCategory:'degree_change' },
    { text:'The hotel offers its staff a life of luxury at a very high price.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_luxury']),
  idea('altitude', 'The aeroplane reached a cruising altitude of ten thousand metres.', ['The plane climbed to a cruising height of ten thousand metres above sea level.', 'Ten thousand metres above sea level was the height at which the plane cruised.', 'The aircraft levelled out at ten thousand metres above sea level.'], 'quantity', 'ten thousand metres', [
    { text:'The aeroplane reached a cruising speed of ten thousand kilometres an hour.', misconceptionCategory:'meaning_confusion' },
    { text:'The aeroplane reached a cruising altitude of one thousand metres.', misconceptionCategory:'quantity_change' },
    { text:'The aeroplane dropped from a cruising altitude of ten thousand metres.', misconceptionCategory:'polarity_change' }
  ], ['vocab_altitude']),
  idea('landscape', 'The new wind farm has changed the landscape of the valley.', ['The new wind farm has altered the scenery of the valley.', 'The countryside in the valley has been changed by the new wind farm.', 'The new wind farm has made the valley look different.'], 'cause_effect', 'the wind farm changed how the valley looks', [
    { text:'The new wind farm has left the landscape of the valley unchanged.', misconceptionCategory:'polarity_change' },
    { text:'The new wind farm has slightly improved the weather in the valley.', misconceptionCategory:'meaning_confusion' },
    { text:'The new wind farm will change the landscape of the valley next year.', misconceptionCategory:'time_change' }
  ], ['vocab_landscape']),
  idea('passenger', 'Every passenger must show a ticket before boarding the ferry.', ['All travellers must show a ticket before they get on the ferry.', 'Each person travelling on the ferry has to show a ticket before boarding.', 'Before getting on the ferry, everyone who is travelling must show a ticket.'], 'quantity', 'every traveller', [
    { text:'Only some passengers must show a ticket before boarding the ferry.', misconceptionCategory:'quantity_change' },
    { text:'Every passenger must buy a ticket after boarding the ferry.', misconceptionCategory:'time_change' },
    { text:'Every driver must show a ticket before boarding the ferry.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_passenger']),
  idea('engineer', 'The aircraft engineer found a fault in the left wing before take-off.', ['The technical expert who maintains the aircraft discovered a problem in the left wing before it took off.', 'Before take-off, the person responsible for the aircraft’s machinery found a fault in the left wing.', 'A trained technician noticed a defect in the left wing before the plane departed.'], 'time', 'before take-off', [
    { text:'The aircraft engineer found a fault in the left wing after landing.', misconceptionCategory:'time_change' },
    { text:'The aircraft engineer fixed the fault in the left wing before take-off.', misconceptionCategory:'added_information' },
    { text:'The pilot found a fault in the left wing before take-off.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_engineer']),
  idea('pilot', 'The pilot decided to land at a different airport because of the storm.', ['The person flying the plane chose to land at another airport because of the storm.', 'Because of the storm, the aircraft’s captain decided to land somewhere else.', 'The storm made the person in charge of the aircraft choose a different airport for landing.'], 'cause_effect', 'the storm caused the change of airport', [
    { text:'The pilot decided to land at a different airport because of an engine problem.', misconceptionCategory:'cause_effect_change' },
    { text:'The pilot decided to land at the same airport despite the storm.', misconceptionCategory:'polarity_change' },
    { text:'The passengers decided to land at a different airport because of the storm.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_pilot']),
  idea('airship', 'Early airships were slower than aeroplanes but could stay in the air for several days.', ['The first gas-filled steerable aircraft moved more slowly than planes but could remain airborne for days.', 'Although they travelled at lower speeds than aeroplanes, early lighter-than-air craft could fly continuously for several days.', 'Early lighter-than-air aircraft were not as fast as planes, yet they could stay up for days at a time.'], 'comparison', 'slower than aeroplanes but able to stay up for days', [
    { text:'Early airships were faster than aeroplanes but could stay in the air for only a few hours.', misconceptionCategory:'comparison_change' },
    { text:'Early airships were slower than aeroplanes and could stay in the air for only a few minutes.', misconceptionCategory:'time_change' },
    { text:'Early airships were slower than aeroplanes but could carry no passengers.', misconceptionCategory:'added_information' }
  ], ['vocab_airship']),
  idea('launch', 'The company will launch its new electric bus next month.', ['The company will introduce its new electric bus next month.', 'Next month, the company will put its new electric bus into service.', 'The company will bring out its new electric bus next month.'], 'time', 'next month', [
    { text:'The company launched its new electric bus last month.', misconceptionCategory:'time_change' },
    { text:'The company will cancel its new electric bus next month.', misconceptionCategory:'polarity_change' },
    { text:'The company will repair its new electric bus next month.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_launch']),
  idea('height', 'The maximum height of vehicles in the tunnel is four metres.', ['Vehicles in the tunnel must not be taller than four metres.', 'No vehicle taller than four metres is allowed in the tunnel.', 'The tunnel only allows vehicles that are four metres tall or less.'], 'quantity', 'four metres', [
    { text:'The maximum width of vehicles in the tunnel is four metres.', misconceptionCategory:'meaning_confusion' },
    { text:'The maximum height of vehicles in the tunnel is forty metres.', misconceptionCategory:'quantity_change' },
    { text:'Vehicles in the tunnel must be at least four metres tall.', misconceptionCategory:'polarity_change' }
  ], ['vocab_height']),
  idea('anxious', 'The anxious passenger asked the crew if the storm would delay the flight.', ['The nervous traveller asked the crew whether the storm would delay the flight.', 'A worried passenger asked the crew if the flight would be delayed by the storm.', 'Feeling nervous, the passenger asked the crew whether bad weather would hold up the flight.'], 'cause_effect', 'asks whether the storm will delay the flight', [
    { text:'The anxious passenger told the crew that the storm had delayed the flight.', misconceptionCategory:'cause_effect_change' },
    { text:'The excited passenger asked the crew if the storm would delay the flight.', misconceptionCategory:'meaning_confusion' },
    { text:'The anxious passenger asked the crew if the flight would arrive early.', misconceptionCategory:'polarity_change' }
  ], ['vocab_anxious']),
  idea('vehicle', 'Every vehicle entering the city centre must pay a daily charge.', ['All cars, buses and lorries entering the city centre have to pay a daily fee.', 'A daily fee must be paid for each means of transport that goes into the city centre.', 'Anything that drives into the city centre must pay a charge every day.'], 'quantity', 'every one pays', [
    { text:'Only large vehicles entering the city centre must pay a daily charge.', misconceptionCategory:'quantity_change' },
    { text:'Every vehicle entering the city centre must pay a monthly charge.', misconceptionCategory:'time_change' },
    { text:'Every vehicle leaving the city centre must pay a daily charge.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_vehicle']),
  idea('pollution', 'The council wants to reduce pollution in the city centre by banning older diesel lorries.', ['To make the city centre cleaner, the council intends to ban older diesel lorries.', 'By banning older diesel lorries, the council hopes to reduce contamination in the city centre.', 'The council plans to cut harmful damage to the air in the city centre by not allowing old diesel lorries.'], 'cause_effect', 'banning old lorries to reduce harmful substances', [
    { text:'The council wants to increase pollution in the city centre by banning older diesel lorries.', misconceptionCategory:'polarity_change' },
    { text:'The council wants to reduce pollution in the city centre by allowing older diesel lorries.', misconceptionCategory:'cause_effect_change' },
    { text:'The council wants to reduce traffic noise in the city centre by banning older diesel lorries.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_pollution']),
  idea('destination', 'Passengers can check the destination of each train on the departure board.', ['Travellers can see where each train is going on the departure board.', 'Passengers can find out the place each train is travelling to by looking at the departure board.', 'The departure board tells travellers the final stop of every train.'], 'quantity', 'each train', [
    { text:'Passengers can check the speed of each train on the departure board.', misconceptionCategory:'meaning_confusion' },
    { text:'Passengers can check the destination of only one train on the departure board.', misconceptionCategory:'quantity_change' },
    { text:'Passengers can check the destination of each train after it has left the station.', misconceptionCategory:'time_change' }
  ], ['vocab_destination']),
  idea('spacious', 'The new train is more spacious than the old one, so passengers have more room for their luggage.', ['The new train has more room inside than the old one, so travellers can fit more luggage.', 'Passengers have extra space for their bags on the new train, which is roomier than the old one.', 'Because the new train is roomier than the old train, passengers can carry more luggage.'], 'comparison', 'the new train has more room than the old one', [
    { text:'The new train is less spacious than the old one, so passengers have less room for their luggage.', misconceptionCategory:'polarity_change' },
    { text:'The new train is just as spacious as the old one, so passengers have the same room for their luggage.', misconceptionCategory:'comparison_change' },
    { text:'The new train is faster than the old one, so passengers reach their destination sooner.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_spacious'])
];

export default [...phraseSets, ...ideaSets];
