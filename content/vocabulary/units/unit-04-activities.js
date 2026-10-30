// Unit 4 · Paraphrasing content (phrase_set and idea_set), WORDS 1–30 ONLY. Same record shapes and contract as unit-03-activities.js:
//   phrase_set : originalPhrase (plain wording) -> equivalentPhrase (contains the target), acceptedVariants, chunks, commonMeaningDistortions
//   idea_set   : originalIdea (contains the target) with accurate paraphrases that do NOT contain it, a meaning invariant, and three
//                meaning-changing distractors each tagged with the misconception it represents.
// Every record is linked to exactly one Unit 4 word. Words 31–50 are not authored yet.
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
  phrase('spacious_cabin', 'a cabin with plenty of room', 'a spacious cabin', ['vocab_spacious'], { chunks:['a spacious', 'cabin'], distortions:['a crowded cabin', 'a tiny cabin', 'a noisy cabin'] }),
  phrase('efficiently_work', 'work without wasting time or energy', 'work efficiently', ['vocab_efficiently'], { chunks:['work', 'efficiently'], distortions:['work carelessly', 'work reluctantly', 'work without a break'] }),
  phrase('demand_electric_buses', 'a strong public need for electric buses', 'demand for electric buses', ['vocab_demand_4'], { chunks:['demand', 'for electric buses'], distortions:['a supply of electric buses', 'a ban on electric buses', 'a price for electric buses'] }),
  phrase('invention_remarkable', 'a very impressive new creation', 'a remarkable invention', ['vocab_invention'], { chunks:['a remarkable', 'invention'], distortions:['a remarkable discovery', 'a remarkable repair', 'a remarkable journey'] }),
  phrase('machinery_construction', 'large powered devices for building work', 'construction machinery', ['vocab_machinery'], { chunks:['construction', 'machinery'], distortions:['construction workers', 'construction materials', 'construction plans'] }),
  phrase('advertisement_tickets', 'a message that persuades people to buy train tickets', 'an advertisement for train tickets', ['vocab_advertisement_4'], { chunks:['an advertisement', 'for train tickets'], distortions:['a timetable for train tickets', 'a warning about train tickets', 'a receipt for train tickets'] }),
  phrase('enormous_aeroplane', 'an extremely large aeroplane', 'an enormous aeroplane', ['vocab_enormous'], { chunks:['an enormous', 'aeroplane'], distortions:['an ancient aeroplane', 'an empty aeroplane', 'an expensive aeroplane'] }),
  phrase('equipment_safety', 'tools and devices needed for safety', 'safety equipment', ['vocab_equipment_4'], { chunks:['safety', 'equipment'], distortions:['safety rules', 'safety officers', 'safety posters'] }),
  phrase('collision_cars', 'a crash between two cars', 'a collision between two cars', ['vocab_collision'], { chunks:['a collision', 'between two cars'], distortions:['a race between two cars', 'a meeting between two cars', 'a journey between two cars'] }),
  phrase('organisation_road_safety', 'a group working together for road safety', 'a road safety organisation', ['vocab_organisation'], { chunks:['a road safety', 'organisation'], distortions:['a road safety timetable', 'a road safety uniform', 'a road safety lesson'] }),
  phrase('participant_trial', 'a person taking part in the trial', 'a participant in the trial', ['vocab_participant_4'], { chunks:['a participant', 'in the trial'], distortions:['a spectator at the trial', 'the organiser of the trial', 'the judge of the trial'] }),
  phrase('livelihood_fishermen', 'the way local fishermen earn money', 'the livelihood of local fishermen', ['vocab_livelihood'], { chunks:['the livelihood', 'of local fishermen'], distortions:['the salary of local fishermen', 'the lifestyle of local fishermen', 'the uniform of local fishermen'] }),
  phrase('fatality_road', 'a death on the road', 'a road fatality', ['vocab_fatality'], { chunks:['a road', 'fatality'], distortions:['a road injury', 'a road delay', 'a road closure'] }),
  phrase('initiative_traffic', 'a new scheme to reduce traffic', 'an initiative to reduce traffic', ['vocab_initiative'], { chunks:['an initiative', 'to reduce traffic'], distortions:['a complaint about traffic', 'a ban on traffic', 'a fine for traffic'] }),
  phrase('campaign_cyclists', 'an organised effort to protect cyclists', 'a campaign to protect cyclists', ['vocab_campaign'], { chunks:['a campaign', 'to protect cyclists'], distortions:['a complaint about cyclists', 'a ban on cyclists', 'a race for cyclists'] }),
  phrase('pothole_deep', 'a deep hole in the road', 'a deep pothole', ['vocab_pothole'], { chunks:['a deep', 'pothole'], distortions:['a deep puddle', 'a deep tunnel', 'a deep river'] }),
  phrase('trauma_crash', 'a lasting emotional shock after a crash', 'trauma after a crash', ['vocab_trauma'], { chunks:['trauma', 'after a crash'], distortions:['excitement after a crash', 'boredom after a crash', 'payment after a crash'] }),
  phrase('measures_road_safety', 'official actions for road safety', 'road safety measures', ['vocab_measures'], { chunks:['road safety', 'measures'], distortions:['road safety posters', 'road safety lessons', 'road safety uniforms'] }),
  phrase('estimate_how_many', 'work out roughly how many', 'estimate how many', ['vocab_estimate'], { chunks:['estimate', 'how many'], distortions:['count exactly how many', 'forget how many', 'ask how many'] }),
  phrase('regulation_safety', 'an official rule about safety', 'a safety regulation', ['vocab_regulation'], { chunks:['a safety', 'regulation'], distortions:['a safety suggestion', 'a safety tradition', 'a safety habit'] }),
  phrase('operate_crane', 'control a crane', 'operate a crane', ['vocab_operate'], { chunks:['operate', 'a crane'], distortions:['repair a crane', 'sell a crane', 'paint a crane'] })
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
  ], ['vocab_spacious']),
  idea('efficiently', 'The new system allows the airline to process passengers efficiently.', ['The new system lets the airline deal with passengers without wasting time or effort.', 'With the new system, the airline can handle its passengers in a well-run, economical way.', 'Passengers can be processed by the airline in a way that wastes very little time with the new system.'], 'degree', 'with very little waste', [
    { text:'The new system allows the airline to process passengers very slowly.', misconceptionCategory:'polarity_change' },
    { text:'The new system allows the airport to process luggage efficiently.', misconceptionCategory:'meaning_confusion' },
    { text:'The new system allows the airline to process passengers efficiently but at a much higher cost.', misconceptionCategory:'added_information' }
  ], ['vocab_efficiently']),
  idea('demand', 'Demand for cheap train tickets rises sharply at the start of the school holidays.', ['Many more people want cheap train tickets at the start of the school holidays.', 'At the start of the school holidays, the public’s wish for cheap train tickets increases greatly.', 'The need for cheap train tickets goes up quickly when the school holidays begin.'], 'time', 'at the start of the school holidays', [
    { text:'Demand for cheap train tickets falls sharply at the start of the school holidays.', misconceptionCategory:'polarity_change' },
    { text:'Demand for cheap train tickets rises slightly at the start of the school holidays.', misconceptionCategory:'degree_change' },
    { text:'Demand for cheap train tickets rises sharply at the end of the school holidays.', misconceptionCategory:'time_change' }
  ], ['vocab_demand_4']),
  idea('invention', 'The invention of the railway changed the way people travelled in the nineteenth century.', ['The creation of the railway transformed how people travelled in the nineteenth century.', 'Travel in the nineteenth century was changed by the creation of the railway.', 'When the railway was first created, it changed how people travelled in the nineteenth century.'], 'cause_effect', 'the new railway changed how people travelled', [
    { text:'The invention of the railway changed the way people travelled in the twentieth century.', misconceptionCategory:'time_change' },
    { text:'The discovery of the railway changed the way people travelled in the nineteenth century.', misconceptionCategory:'meaning_confusion' },
    { text:'The invention of the railway had no effect on the way people travelled in the nineteenth century.', misconceptionCategory:'polarity_change' }
  ], ['vocab_invention']),
  idea('machinery', 'The factory has installed new machinery to produce car parts more quickly.', ['The factory has put in new powered devices so that it can make car parts faster.', 'New mechanical devices have been fitted in the factory so that car parts are produced faster.', 'The factory now has newly installed powered devices that help it make car parts more quickly.'], 'cause_effect', 'new devices to produce parts faster', [
    { text:'The factory has installed new machinery to produce car parts more slowly.', misconceptionCategory:'polarity_change' },
    { text:'The factory has installed new machinery to produce aeroplane parts more quickly.', misconceptionCategory:'meaning_confusion' },
    { text:'The factory plans to install new machinery to produce car parts more quickly.', misconceptionCategory:'time_change' }
  ], ['vocab_machinery']),
  idea('advertisement', 'The airline withdrew its advertisement because it made a false claim about ticket prices.', ['The airline took away its promotional message because it gave false information about ticket prices.', 'Because its promotion contained a false claim about ticket prices, the airline removed it.', 'The airline stopped using its promotional message after it wrongly described its ticket prices.'], 'cause_effect', 'a false claim caused the withdrawal', [
    { text:'The airline withdrew its advertisement because it was too expensive to show.', misconceptionCategory:'cause_effect_change' },
    { text:'The airline kept its advertisement even though it made a false claim about ticket prices.', misconceptionCategory:'polarity_change' },
    { text:'The airline withdrew its timetable because it made a false claim about ticket prices.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_advertisement_4']),
  idea('enormous', 'The enormous cargo ship was too wide to pass through the old canal.', ['The extremely large cargo ship could not fit through the old canal because it was too wide.', 'The old canal was not wide enough for the huge cargo ship.', 'Because of its great width, the gigantic cargo ship could not use the old canal.'], 'cause_effect', 'too wide for the canal', [
    { text:'The enormous cargo ship was too heavy to pass through the old canal.', misconceptionCategory:'cause_effect_change' },
    { text:'The tiny cargo ship was too wide to pass through the old canal.', misconceptionCategory:'degree_change' },
    { text:'The enormous cargo ship passed easily through the old canal.', misconceptionCategory:'polarity_change' }
  ], ['vocab_enormous']),
  idea('equipment', 'All emergency equipment on the ferry is checked before every voyage.', ['Every piece of emergency gear on the ferry is inspected before each journey.', 'Before each voyage, all the emergency tools and devices on the ferry are checked.', 'The ferry’s emergency gear is all examined before every trip.'], 'quantity', 'all of it, before every voyage', [
    { text:'Some emergency equipment on the ferry is checked before every voyage.', misconceptionCategory:'quantity_change' },
    { text:'All emergency equipment on the ferry is checked after every voyage.', misconceptionCategory:'time_change' },
    { text:'All emergency staff on the ferry are trained before every voyage.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_equipment_4']),
  idea('collision', 'The collision between the bus and the lorry happened early in the morning.', ['The crash between the bus and the lorry took place early in the morning.', 'Early in the morning, the bus and the lorry were involved in a crash.', 'The bus and the lorry hit each other early in the morning.'], 'time', 'early in the morning', [
    { text:'The collision between the bus and the lorry happened late at night.', misconceptionCategory:'time_change' },
    { text:'The race between the bus and the lorry happened early in the morning.', misconceptionCategory:'meaning_confusion' },
    { text:'The collision between the bus and the lorry was prevented early in the morning.', misconceptionCategory:'polarity_change' }
  ], ['vocab_collision']),
  idea('organisation', 'The organisation was set up in 1950 to improve road safety.', ['The group was founded in 1950 with the aim of making roads safer.', 'In 1950, people came together to form a group whose aim was safer roads.', 'The association was established in 1950 in order to make the roads safer.'], 'time', '1950', [
    { text:'The organisation was set up in 1990 to improve road safety.', misconceptionCategory:'time_change' },
    { text:'The organisation was set up in 1950 to improve railway comfort.', misconceptionCategory:'meaning_confusion' },
    { text:'The organisation was closed in 1950 after failing to improve road safety.', misconceptionCategory:'polarity_change' }
  ], ['vocab_organisation']),
  idea('participant', 'Every participant in the road safety trial must wear a helmet.', ['All the people taking part in the road safety trial have to wear a helmet.', 'Everyone involved in the road safety trial is required to wear a helmet.', 'Each person who takes part in the road safety trial must put on a helmet.'], 'quantity', 'everyone wears a helmet', [
    { text:'Only the winner of the road safety trial must wear a helmet.', misconceptionCategory:'quantity_change' },
    { text:'Every spectator at the road safety trial must wear a helmet.', misconceptionCategory:'meaning_confusion' },
    { text:'Every participant in the road safety trial may choose not to wear a helmet.', misconceptionCategory:'polarity_change' }
  ], ['vocab_participant_4']),
  idea('livelihood', 'The closure of the railway workshop threatened the livelihood of hundreds of families.', ['Hundreds of families risked losing their means of earning a living when the railway workshop closed.', 'Closing the railway workshop put the income of hundreds of families at risk.', 'The shutting of the railway workshop endangered how hundreds of families earned money.'], 'cause_effect', 'the closure put hundreds of families’ income at risk', [
    { text:'The closure of the railway workshop created new jobs for hundreds of families.', misconceptionCategory:'polarity_change' },
    { text:'The closure of the railway workshop threatened the holidays of hundreds of families.', misconceptionCategory:'meaning_confusion' },
    { text:'The closure of the railway workshop threatened the livelihood of a few families.', misconceptionCategory:'quantity_change' }
  ], ['vocab_livelihood']),
  idea('fatality', 'The police said that the accident had caused one fatality.', ['The police stated that one person had died in the accident.', 'According to the police, the accident had resulted in a single death.', 'One person lost their life in the accident, the police said.'], 'quantity', 'one', [
    { text:'The police said that the accident had caused three fatalities.', misconceptionCategory:'quantity_change' },
    { text:'The police said that the accident had caused no fatalities.', misconceptionCategory:'polarity_change' },
    { text:'The police said that the accident had caused one injury.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_fatality']),
  idea('initiative', 'The new initiative aims to cut the number of road accidents near schools.', ['The new scheme is intended to reduce accidents on roads near schools.', 'The purpose of the new programme is to lower the number of road accidents close to schools.', 'A new plan has been introduced in order to have fewer accidents on roads near schools.'], 'cause_effect', 'the aim is to cut accidents near schools', [
    { text:'The new initiative aims to increase the number of road accidents near schools.', misconceptionCategory:'polarity_change' },
    { text:'The new initiative aims to cut the number of road accidents near hospitals.', misconceptionCategory:'meaning_confusion' },
    { text:'The new initiative cut the number of road accidents near schools last year.', misconceptionCategory:'time_change' }
  ], ['vocab_initiative']),
  idea('campaign', 'The campaign persuaded thousands of drivers to slow down near schools.', ['Thousands of drivers were convinced to reduce speed near schools by the organised effort.', 'Because of the public effort, thousands of drivers began to drive more slowly near schools.', 'The public-awareness drive led thousands of drivers to slow down near schools.'], 'cause_effect', 'the campaign led drivers to slow down', [
    { text:'The campaign forced thousands of drivers to leave their cars near schools.', misconceptionCategory:'cause_effect_change' },
    { text:'The campaign persuaded a few drivers to slow down near schools.', misconceptionCategory:'quantity_change' },
    { text:'The campaign persuaded thousands of drivers to speed up near schools.', misconceptionCategory:'polarity_change' }
  ], ['vocab_campaign']),
  idea('pothole', 'The council has promised to repair every pothole on the main road this month.', ['The council has pledged to mend all the holes in the main road this month.', 'This month, the council intends to fix each hole in the surface of the main road.', 'All the road-surface holes on the main road will be repaired by the council this month, it has promised.'], 'quantity', 'every one, this month', [
    { text:'The council has promised to repair some potholes on the main road this month.', misconceptionCategory:'quantity_change' },
    { text:'The council has promised to build a new main road this month.', misconceptionCategory:'meaning_confusion' },
    { text:'The council has promised to repair every pothole on the main road next year.', misconceptionCategory:'time_change' }
  ], ['vocab_pothole']),
  idea('trauma', 'The survivors were offered counselling to help them deal with the trauma of the accident.', ['The people who survived were given counselling so that they could cope with the lasting shock of the accident.', 'Counselling was offered to survivors to help them manage the emotional effects of the accident.', 'To help them handle the distress caused by the accident, the survivors were offered counselling.'], 'cause_effect', 'counselling offered to help with emotional effects', [
    { text:'The survivors were refused counselling to help them deal with the trauma of the accident.', misconceptionCategory:'polarity_change' },
    { text:'The survivors were offered compensation to help them deal with the cost of the accident.', misconceptionCategory:'meaning_confusion' },
    { text:'The survivors were offered counselling before the accident.', misconceptionCategory:'time_change' }
  ], ['vocab_trauma']),
  idea('measures', 'The council took emergency measures to clear the snow from the roads.', ['The council acted urgently to remove the snow from the roads.', 'Urgent action was taken by the council to clear snow off the roads.', 'The council did what it could at once to get the snow off the roads.'], 'degree', 'urgent action', [
    { text:'The council took emergency measures to build new roads in the snow.', misconceptionCategory:'meaning_confusion' },
    { text:'The council took no emergency measures to clear the snow from the roads.', misconceptionCategory:'polarity_change' },
    { text:'The council plans to take emergency measures to clear the snow from the roads next winter.', misconceptionCategory:'time_change' }
  ], ['vocab_measures']),
  idea('estimate', 'Officials estimate that the new tunnel will carry twenty thousand vehicles a day.', ['Officials calculate roughly that twenty thousand vehicles a day will use the new tunnel.', 'According to officials’ rough calculations, the new tunnel will carry around twenty thousand vehicles daily.', 'Officials believe, though they cannot be exact, that the new tunnel will carry about twenty thousand vehicles every day.'], 'quantity', 'about twenty thousand a day', [
    { text:'Officials guarantee that the new tunnel will carry exactly twenty thousand vehicles a day.', misconceptionCategory:'degree_change' },
    { text:'Officials estimate that the new tunnel will carry two thousand vehicles a day.', misconceptionCategory:'quantity_change' },
    { text:'Officials estimate that the old tunnel carried twenty thousand vehicles a day.', misconceptionCategory:'time_change' }
  ], ['vocab_estimate']),
  idea('regulation', 'A new regulation requires all cyclists to use lights after dark.', ['An official rule now says that every cyclist must have lights when it is dark.', 'All cyclists are required by a new official rule to use lights once it is dark.', 'According to a new rule from the authorities, cyclists must use lights at night.'], 'quantity', 'all cyclists, after dark', [
    { text:'A new regulation advises some cyclists to use lights after dark.', misconceptionCategory:'quantity_change' },
    { text:'A new regulation requires all cyclists to use lights before dark.', misconceptionCategory:'time_change' },
    { text:'A new regulation forbids all cyclists from using lights after dark.', misconceptionCategory:'polarity_change' }
  ], ['vocab_regulation']),
  idea('operate', 'Only trained staff may operate the cranes at the port.', ['Only people who have been trained are permitted to control the port’s cranes.', 'The cranes at the port may be controlled by trained staff alone.', 'Staff must be trained before they are allowed to work the cranes at the port.'], 'quantity', 'only trained staff', [
    { text:'Any member of staff may operate the cranes at the port.', misconceptionCategory:'quantity_change' },
    { text:'Only trained staff may repair the cranes at the port.', misconceptionCategory:'meaning_confusion' },
    { text:'Only trained staff may operate the cranes at the airport.', misconceptionCategory:'added_information' }
  ], ['vocab_operate'])
];

export default [...phraseSets, ...ideaSets];
