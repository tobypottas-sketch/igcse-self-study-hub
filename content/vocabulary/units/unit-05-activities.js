// Unit 5 · Paraphrasing content (phrase_set and idea_set), WORDS 1–40 ONLY. Same record shapes and contract as unit-04-activities.js:
//   phrase_set : originalPhrase (plain wording) -> equivalentPhrase (contains the target), acceptedVariants, chunks, commonMeaningDistortions
//   idea_set   : originalIdea (contains the target) with accurate paraphrases that do NOT contain it, a meaning invariant, and three
//                meaning-changing distractors each tagged with the misconception it represents.
// Every record is linked to exactly one Unit 5 word. Words 41–50 are not authored yet.
const status = 'approved';
const unitNumber = 5;

function phrase(id, originalPhrase, equivalentPhrase, linkedVocabularyIds, { acceptedVariants = [], chunks = null, distortions = [] } = {}) {
  return {
    activityContentId:`u5_phrase_${id}`, unitNumber, contentType:'phrase_set', status,
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
    activityContentId:`u5_idea_${id}`, unitNumber, contentType:'idea_set', status,
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
  phrase('aerial_tourism_growth', 'the growth of sightseeing from the air', 'the growth of aerial tourism', ['vocab_aerial_tourism'], { chunks:['the growth', 'of aerial tourism'], distortions:['the growth of cruise holidays', 'the growth of airport shops', 'the growth of train timetables'] }),
  phrase('underwater_photography_course', 'a course in taking pictures beneath the surface', 'a course in underwater photography', ['vocab_underwater_photography'], { chunks:['a course', 'in underwater photography'], distortions:['a course in underwater sports', 'a course in mountain photography', 'a course in boat repair'] }),
  phrase('documentary_rainforest', 'a factual film about the rainforest', 'a documentary about the rainforest', ['vocab_documentary'], { acceptedVariants:['a non-fiction programme about the rainforest'], chunks:['a documentary', 'about the rainforest'], distortions:['a comedy about the rainforest', 'a map of the rainforest', 'a song about the rainforest'] }),
  phrase('snorkelling_bay', 'swimming with a mask and tube in the bay', 'snorkelling in the bay', ['vocab_snorkelling'], { chunks:['snorkelling', 'in the bay'], distortions:['sailing in the bay', 'fishing in the bay', 'surfing in the bay'] }),
  phrase('expedition_desert', 'a six-week journey to explore the desert', 'a six-week expedition to the desert', ['vocab_expedition'], { chunks:['a six-week expedition', 'to the desert'], distortions:['a six-week holiday in the desert', 'a six-week lesson about the desert', 'a six-week job in the desert'] }),
  phrase('yacht_harbour', 'a luxury sailing boat in the harbour', 'a luxury yacht in the harbour', ['vocab_yacht'], { chunks:['a luxury yacht', 'in the harbour'], distortions:['a luxury ferry in the harbour', 'a luxury hotel in the harbour', 'a luxury lorry in the harbour'] }),
  phrase('scenery_highlands', 'the natural views of the highlands', 'the scenery of the highlands', ['vocab_scenery'], { acceptedVariants:['the highland scenery'], chunks:['the scenery', 'of the highlands'], distortions:['the weather of the highlands', 'the roads of the highlands', 'the hotels of the highlands'] }),
  phrase('attractions_airport', 'places of interest near the airport', 'attractions near the airport', ['vocab_attractions'], { acceptedVariants:['tourist attractions near the airport'], chunks:['attractions', 'near the airport'], distortions:['hotels near the airport', 'shops near the airport', 'roads near the airport'] }),
  phrase('accommodation_beach', 'a place to stay near the beach', 'accommodation near the beach', ['vocab_accommodation'], { chunks:['accommodation', 'near the beach'], distortions:['transport near the beach', 'food near the beach', 'parking near the beach'] }),
  phrase('adventurous_traveller', 'a traveller who likes to try exciting new things', 'an adventurous traveller', ['vocab_adventurous'], { acceptedVariants:['a daring traveller'], chunks:['an adventurous', 'traveller'], distortions:['a nervous traveller', 'a wealthy traveller', 'a tired traveller'] }),
  phrase('breathtaking_sunrise', 'an astonishingly beautiful sunrise over the temple', 'a breathtaking sunrise over the temple', ['vocab_breathtaking_5'], { acceptedVariants:['an awe-inspiring sunrise over the temple'], chunks:['a breathtaking sunrise', 'over the temple'], distortions:['a crowded sunrise over the temple', 'an early sunrise over the temple', 'a cloudy sunrise over the temple'] }),
  phrase('spectacular_display', 'a grand and striking firework display', 'a spectacular firework display', ['vocab_spectacular'], { acceptedVariants:['an impressive firework display'], chunks:['a spectacular', 'firework display'], distortions:['a small firework display', 'a noisy firework display', 'a dangerous firework display'] }),
  phrase('dramatic_weather', 'sudden and sharp changes in the weather', 'dramatic changes in the weather', ['vocab_dramatic'], { chunks:['dramatic changes', 'in the weather'], distortions:['small changes in the weather', 'regular changes in the weather', 'seasonal changes in the weather'] }),
  phrase('stunning_resort', 'an extremely attractive beach resort', 'a stunning beach resort', ['vocab_stunning'], { acceptedVariants:['a strikingly beautiful beach resort'], chunks:['a stunning', 'beach resort'], distortions:['an expensive beach resort', 'a crowded beach resort', 'a remote beach resort'] }),
  phrase('popular_tourists', 'enjoyed by large numbers of tourists', 'popular with tourists', ['vocab_popular'], { acceptedVariants:['well-liked by tourists'], chunks:['popular', 'with tourists'], distortions:['unknown to tourists', 'expensive for tourists', 'dangerous for tourists'] }),
  phrase('static_camera', 'a camera that stays in one fixed place', 'a static camera', ['vocab_static'], { acceptedVariants:['a fixed camera'], chunks:['a static', 'camera'], distortions:['a hidden camera', 'a waterproof camera', 'a digital camera'] }),
  phrase('ground_level_view', 'a view taken from low down', 'a ground-level view', ['vocab_ground_level'], { chunks:['a ground-level', 'view'], distortions:['an aerial view', 'a distant view', 'a night view'] }),
  phrase('angle_of_view_lens', 'the width of the scene that a lens can capture', 'the angle of view of a lens', ['vocab_angle_of_view'], { chunks:['the angle of view', 'of a lens'], distortions:['the weight of a lens', 'the price of a lens', 'the length of a lens'] }),
  phrase('ecological_habitats_wetlands', 'the natural environments where wetland wildlife lives', 'the ecological habitats of the wetlands', ['vocab_ecological_habitats'], { chunks:['the ecological habitats', 'of the wetlands'], distortions:['the tourist facilities of the wetlands', 'the weather patterns of the wetlands', 'the farming methods of the wetlands'] }),
  phrase('marine_world_exhibition', 'an exhibition about the sea and its living things', 'an exhibition about the marine world', ['vocab_marine_world'], { chunks:['an exhibition', 'about the marine world'], distortions:['an exhibition about ships and sailors', 'an exhibition about the polar regions', 'an exhibition about the desert'] }),
  phrase('coral_reef', 'the hard colourful material made by tiny sea animals on the reef', 'the coral on the reef', ['vocab_coral'], { chunks:['the coral', 'on the reef'], distortions:['the sand on the reef', 'the fish on the reef', 'the rubbish on the reef'] }),
  phrase('spellbound_performance', 'completely fascinated by the performance', 'spellbound by the performance', ['vocab_spellbound'], { acceptedVariants:['captivated by the performance'], chunks:['spellbound', 'by the performance'], distortions:['bored by the performance', 'annoyed by the performance', 'confused by the performance'] }),
  phrase('wildlife_park', 'the animals and plants living freely in the national park', 'the wildlife of the national park', ['vocab_wildlife'], { chunks:['the wildlife', 'of the national park'], distortions:['the farm animals of the national park', 'the hotels of the national park', 'the roads of the national park'] }),
  phrase('preservation_city', 'the protection of the old city from damage', 'the preservation of the old city', ['vocab_preservation'], { chunks:['the preservation', 'of the old city'], distortions:['the demolition of the old city', 'the promotion of the old city', 'the sale of the old city'] }),
  phrase('environmental_impact_road', 'the effect of the new road on nature', 'the environmental impact of the new road', ['vocab_environmental_impact'], { chunks:['the environmental impact', 'of the new road'], distortions:['the cost of the new road', 'the length of the new road', 'the opening of the new road'] }),
  phrase('journey_mountains', 'a long trip by train through the mountains', 'a long journey by train through the mountains', ['vocab_journey'], { chunks:['a long journey', 'by train', 'through the mountains'], distortions:['a long stay in the mountains', 'a long wait at a mountain village', 'a long lesson about the mountains'] }),
  phrase('licence_fish', 'official permission to fish in the river', 'a licence to fish in the river', ['vocab_licence'], { chunks:['a licence', 'to fish in the river'], distortions:['a rule against fishing in the river', 'a lesson on fishing in the river', 'a fee for crossing the river'] }),
  phrase('offer_city_breaks', 'a cut-price deal on city breaks', 'a special offer on city breaks', ['vocab_offer'], { acceptedVariants:['a special offer for city breaks'], chunks:['a special offer', 'on city breaks'], distortions:['a delay on city breaks', 'a warning on city breaks', 'a complaint about city breaks'] }),
  phrase('guided_tour_old_town', 'a visit led by an expert around the old town', 'a guided tour around the old town', ['vocab_guided_tour'], { chunks:['a guided tour', 'around the old town'], distortions:['a map of the old town', 'a lecture about the old town', 'a race around the old town'] }),
  phrase('travel_assistant_agency', 'an employee at the agency who helps customers book holidays', 'a travel assistant at the agency', ['vocab_travel_assistant'], { chunks:['a travel assistant', 'at the agency'], distortions:['a coach driver at the agency', 'a hotel receptionist at the agency', 'a pilot at the agency'] }),
  phrase('tourism_industry_region', 'the businesses that serve holidaymakers in the region', 'the tourism industry in the region', ['vocab_tourism_industry'], { chunks:['the tourism industry', 'in the region'], distortions:['the farming industry in the region', 'the film industry in the region', 'the steel industry in the region'] }),
  phrase('exploring_villages', 'travelling around to discover the mountain villages', 'exploring the mountain villages', ['vocab_exploring'], { chunks:['exploring', 'the mountain villages'], distortions:['cleaning the mountain villages', 'guarding the mountain villages', 'leaving the mountain villages'] }),
  phrase('observation_birds', 'watching the birds closely from a hide', 'careful observation of the birds from a hide', ['vocab_observation'], { chunks:['careful observation', 'of the birds', 'from a hide'], distortions:['careful feeding of the birds from a hide', 'careful capture of the birds from a hide', 'careful counting of the birds from a hide'] }),
  phrase('relaxation_retreat', 'a quiet place for rest and freedom from stress', 'a quiet place for relaxation', ['vocab_relaxation'], { chunks:['a quiet place', 'for relaxation'], distortions:['a quiet place for competition', 'a quiet place for repairs', 'a quiet place for exams'] }),
  phrase('adventurous_activities_camp', 'exciting things to do that involve some risk at the summer camp', 'adventurous activities at the summer camp', ['vocab_adventurous_activities'], { chunks:['adventurous activities', 'at the summer camp'], distortions:['quiet pastimes at the summer camp', 'boring chores at the summer camp', 'indoor lessons at the summer camp'] }),
  phrase('memorable_day', 'a special day that the whole class will remember', 'a memorable day for the whole class', ['vocab_memorable'], { chunks:['a memorable day', 'for the whole class'], distortions:['a difficult day for the whole class', 'a forgotten day for the whole class', 'a crowded day for the whole class'] }),
  phrase('recommendation_stay', 'a friend’s advice on where to stay', 'a friend’s recommendation on where to stay', ['vocab_recommendation_5'], { chunks:['a friend’s recommendation', 'on where to stay'], distortions:['a friend’s complaint on where to stay', 'a friend’s warning on where to stay', 'a friend’s invoice on where to stay'] }),
  phrase('reservation_table', 'an advance booking for a table at the restaurant', 'a reservation for a table at the restaurant', ['vocab_reservation'], { chunks:['a reservation', 'for a table', 'at the restaurant'], distortions:['a menu for a table at the restaurant', 'a receipt for a table at the restaurant', 'a review for a table at the restaurant'] }),
  phrase('destination_summer', 'a place that families choose to visit in summer', 'a family destination in summer', ['vocab_destination_5'], { chunks:['a family destination', 'in summer'], distortions:['a family timetable in summer', 'a family payment in summer', 'a family complaint in summer'] }),
  phrase('availability_flights', 'whether seats are free to book on summer flights', 'the availability of seats on summer flights', ['vocab_availability_5'], { chunks:['the availability', 'of seats', 'on summer flights'], distortions:['the popularity of seats on summer flights', 'the price of seats on summer flights', 'the design of seats on summer flights'] })
];

const ideaSets = [
  idea('aerial_tourism', 'Aerial tourism has become big business in the mountain region.', ['Sightseeing from the air is now a large and profitable industry in the mountain region.', 'Trips that let visitors see the mountains from above have grown into a major business there.', 'Flying visitors over the mountains has turned into a big commercial success in the region.'], 'degree', 'big business', [
    { text:'Aerial tourism has almost disappeared from the mountain region.', misconceptionCategory:'polarity_change' },
    { text:'Aerial tourism is still a very small activity in the mountain region.', misconceptionCategory:'degree_change' },
    { text:'Mountain tourism by train has become big business in the region.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_aerial_tourism']),
  idea('underwater_photography', 'Underwater photography is difficult because light and colour change quickly below the surface.', ['Taking pictures beneath the surface is hard, since the light and colours alter fast as you go down.', 'Camera work under the sea is demanding because the light and colours change quickly with depth.', 'Pictures taken below the surface are difficult to get right, as light and colour shift quickly there.'], 'cause_effect', 'changing light and colour make it difficult', [
    { text:'Underwater photography is easy because light and colour stay the same below the surface.', misconceptionCategory:'polarity_change' },
    { text:'Underwater photography is difficult because divers must wear heavy suits.', misconceptionCategory:'cause_effect_change' },
    { text:'Underwater photography is slightly tricky because light and colour change a little below the surface.', misconceptionCategory:'degree_change' }
  ], ['vocab_underwater_photography']),
  idea('documentary', 'The documentary showed how mass tourism is damaging the coral reefs.', ['The factual film explained how huge numbers of visitors are harming the coral reefs.', 'A programme based on real events revealed the damage that large-scale tourism is doing to the reefs.', 'The non-fiction programme demonstrated ways in which mass tourism harms the reefs.'], 'cause_effect', 'mass tourism is damaging the reefs', [
    { text:'The documentary showed how mass tourism is protecting the coral reefs.', misconceptionCategory:'polarity_change' },
    { text:'The documentary showed how fishing is damaging the coral reefs.', misconceptionCategory:'cause_effect_change' },
    { text:'The documentary was a comedy about a family on a coral reef holiday.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_documentary']),
  idea('snorkelling', 'Snorkelling is a safe way for beginners to enjoy the sea because it needs no heavy equipment.', ['Swimming with a mask and tube lets newcomers enjoy the sea safely, since no heavy gear is needed.', 'Beginners can explore the water near the surface in safety with a mask and tube, without carrying heavy equipment.', 'Because it does not require heavy equipment, swimming with a mask and tube is a safe way for newcomers to enjoy the sea.'], 'cause_effect', 'no heavy equipment makes it safe', [
    { text:'Snorkelling is a dangerous way for beginners to enjoy the sea because it needs heavy equipment.', misconceptionCategory:'polarity_change' },
    { text:'Snorkelling is a fairly safe way for beginners to enjoy the sea, although it needs a little equipment.', misconceptionCategory:'degree_change' },
    { text:'Surfing is a safe way for beginners to enjoy the sea because it needs no heavy equipment.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_snorkelling']),
  idea('expedition', 'The expedition to the jungle was cancelled because of heavy rain.', ['The organised journey into the jungle was called off since there was so much rain.', 'Torrential rain meant that the trip to explore the jungle did not go ahead.', 'The planned exploring trip to the jungle was stopped because of the downpour.'], 'cause_effect', 'heavy rain caused the cancellation', [
    { text:'The expedition to the jungle went ahead in spite of the heavy rain.', misconceptionCategory:'polarity_change' },
    { text:'The expedition to the jungle was delayed for a week because of heavy rain.', misconceptionCategory:'meaning_confusion' },
    { text:'The expedition to the jungle was cancelled because of a shortage of money.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_expedition']),
  idea('yacht', 'Wealthy tourists often spend their holidays on a private yacht, sailing from island to island.', ['Rich visitors frequently take their holidays on their own pleasure boat, moving from one island to the next.', 'It is common for wealthy tourists to sail between islands on a private pleasure boat during their holidays.', 'Wealthy holidaymakers regularly travel from island to island by sailing on a boat of their own.'], 'comparison', 'wealthy tourists sail between islands on a private boat', [
    { text:'Wealthy tourists rarely spend their holidays on a private yacht.', misconceptionCategory:'degree_change' },
    { text:'Wealthy tourists often spend their holidays on a public ferry, travelling from island to island.', misconceptionCategory:'meaning_confusion' },
    { text:'Wealthy tourists often spend their holidays on a private yacht, staying in one harbour all week.', misconceptionCategory:'added_information' }
  ], ['vocab_yacht']),
  idea('scenery', 'The scenery along the coast road is so beautiful that drivers often stop to take photographs.', ['The natural views beside the coast road are so lovely that motorists frequently pull over to take pictures.', 'Drivers regularly stop to take pictures because the countryside and sea along the coast road look so beautiful.', 'So lovely is the view from the coast road that drivers often stop to photograph it.'], 'cause_effect', 'the beauty makes drivers stop', [
    { text:'The scenery along the coast road is so ugly that drivers never stop to take photographs.', misconceptionCategory:'polarity_change' },
    { text:'The scenery along the coast road is fairly pleasant, so drivers sometimes slow down.', misconceptionCategory:'degree_change' },
    { text:'The traffic along the coast road is so heavy that drivers often stop to rest.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_scenery']),
  idea('attractions', 'The island’s main attractions are its white beaches and its ancient temples.', ['The chief places of interest on the island are its pale sandy shores and its old temples.', 'Visitors mainly come to the island to see its white beaches and its ancient temples.', 'The things most worth seeing on the island are its light sandy beaches and its very old temples.'], 'comparison', 'the beaches and temples are the main things to see', [
    { text:'The island’s main hotels are its white beaches and its ancient temples.', misconceptionCategory:'meaning_confusion' },
    { text:'The island’s main attractions are its modern shopping centres and its busy airports.', misconceptionCategory:'added_information' },
    { text:'The island’s main attractions used to be its white beaches and its ancient temples.', misconceptionCategory:'time_change' }
  ], ['vocab_attractions']),
  idea('accommodation', 'Accommodation in the capital is so expensive that many visitors stay in nearby towns.', ['Places to stay in the capital cost so much that numerous tourists choose to sleep in towns close by.', 'Because hotels and rooms in the capital are so costly, many visitors base themselves in neighbouring towns.', 'The high price of rooms in the capital leads many tourists to stay in nearby towns instead.'], 'cause_effect', 'high prices make visitors stay elsewhere', [
    { text:'Accommodation in the capital is so cheap that many visitors stay in nearby towns.', misconceptionCategory:'polarity_change' },
    { text:'Transport in the capital is so expensive that many visitors stay in nearby towns.', misconceptionCategory:'meaning_confusion' },
    { text:'Accommodation in the capital is slightly expensive, so a few visitors stay in nearby towns.', misconceptionCategory:'degree_change' }
  ], ['vocab_accommodation']),
  idea('adventurous', 'Lena is adventurous, so she chose a camping trip in the mountains rather than a hotel holiday.', ['Lena likes to try daring new things, which is why she went camping in the mountains instead of staying in a hotel.', 'Because she enjoys exciting new experiences, Lena picked a mountain camping trip over a hotel holiday.', 'Being keen on new challenges, Lena preferred camping in the mountains to a holiday in a hotel.'], 'cause_effect', 'her love of new experiences made her choose camping', [
    { text:'Lena is cautious, so she chose a camping trip in the mountains rather than a hotel holiday.', misconceptionCategory:'polarity_change' },
    { text:'Lena is generous, so she paid for a camping trip in the mountains rather than a hotel holiday.', misconceptionCategory:'meaning_confusion' },
    { text:'Lena is adventurous, so she chose a camping trip in the mountains as well as a hotel holiday.', misconceptionCategory:'added_information' }
  ], ['vocab_adventurous']),
  idea('breathtaking', 'The glass bridge over the gorge offers a breathtaking view of the river far below.', ['From the glass bridge above the gorge, the river far below looks astonishingly beautiful.', 'The glass walkway across the gorge gives an awe-inspiring view of the river far below.', 'Looking down from the glass bridge over the gorge, visitors see an amazing and unforgettable sight of the river.'], 'degree', 'amazingly impressive', [
    { text:'The glass bridge over the gorge offers a disappointing view of the river far below.', misconceptionCategory:'polarity_change' },
    { text:'The glass bridge over the gorge offers a pleasant view of the river far below.', misconceptionCategory:'degree_change' },
    { text:'The glass bridge over the gorge is a dangerous crossing for visitors who fear heights.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_breathtaking_5']),
  idea('spectacular', 'The cliff-diving show at the resort is spectacular, and thousands of visitors come to watch it every summer.', ['The resort’s cliff-diving show is extremely impressive to watch, so thousands of visitors come to see it each summer.', 'Every summer, thousands of visitors come to the resort because its cliff-diving show is grand and exciting.', 'Visitors in their thousands watch the resort’s cliff-diving show each summer, since it is so striking.'], 'degree', 'very impressive to watch', [
    { text:'The cliff-diving show at the resort is dull, and thousands of visitors leave early every summer.', misconceptionCategory:'polarity_change' },
    { text:'The cliff-diving show at the resort is fairly entertaining, and a few visitors come to watch it every summer.', misconceptionCategory:'degree_change' },
    { text:'The cliff-diving show at the resort is spectacular, and thousands of visitors take part in it every summer.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_spectacular']),
  idea('dramatic', 'The tourist board reported a dramatic fall in visitor numbers after the storms.', ['The number of visitors dropped sharply and suddenly after the storms, according to the tourist board.', 'After the storms, the tourist board noted a sudden and very large decline in visitors.', 'Visitor numbers fell steeply after the storms, the tourist board said.'], 'degree', 'a sudden and very large fall', [
    { text:'The tourist board reported a dramatic rise in visitor numbers after the storms.', misconceptionCategory:'polarity_change' },
    { text:'The tourist board reported a slight fall in visitor numbers after the storms.', misconceptionCategory:'degree_change' },
    { text:'The tourist board reported a dramatic fall in visitor numbers before the storms.', misconceptionCategory:'time_change' }
  ], ['vocab_dramatic']),
  idea('stunning', 'The brochure promises stunning views from every room of the hotel.', ['The leaflet guarantees extremely attractive views from each of the hotel’s rooms.', 'According to the brochure, every room in the hotel looks out on a strikingly beautiful scene.', 'The hotel’s brochure says that guests in all rooms will enjoy extremely beautiful views.'], 'degree', 'extremely attractive views', [
    { text:'The brochure warns of ugly views from every room of the hotel.', misconceptionCategory:'polarity_change' },
    { text:'The brochure promises stunning views from some rooms of the hotel.', misconceptionCategory:'quantity_change' },
    { text:'The brochure promises quiet rooms with comfortable beds in every part of the hotel.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_stunning']),
  idea('popular', 'Cycling holidays are becoming increasingly popular with older tourists.', ['More and more older tourists are choosing to take cycling holidays.', 'Older visitors are enjoying holidays on bicycles in growing numbers.', 'Holidays based on cycling are attracting a rising number of older tourists.'], 'time', 'increasingly', [
    { text:'Cycling holidays are becoming increasingly unpopular with older tourists.', misconceptionCategory:'polarity_change' },
    { text:'Cycling holidays used to be popular with older tourists.', misconceptionCategory:'time_change' },
    { text:'Cycling holidays are becoming increasingly expensive for older tourists.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_popular']),
  idea('static', 'The documentary was filmed with static cameras, so the viewer sees each scene from one unchanging position.', ['The film was shot with cameras that did not move, so the audience watches every scene from a single position.', 'Because the cameras stayed fixed in place, each scene is seen from the same position throughout the documentary.', 'The documentary uses motionless cameras, which means that the viewer’s position never changes during a scene.'], 'cause_effect', 'cameras do not move, so the viewpoint stays the same', [
    { text:'The documentary was filmed with moving cameras, so the viewer sees each scene from changing positions.', misconceptionCategory:'polarity_change' },
    { text:'The documentary was filmed with hidden cameras, so the viewer sees each scene without the people in it knowing.', misconceptionCategory:'meaning_confusion' },
    { text:'The documentary was filmed with static cameras, so the viewer sees each scene in slow motion.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_static']),
  idea('ground_level', 'Aerial photographs show the layout of the site, but ground-level photographs show what visitors actually see.', ['Pictures taken from the air reveal the plan of the site, whereas pictures taken from low down show the visitor’s own view.', 'The site’s layout appears in photographs shot from above, while photographs taken from a low position show what walkers actually see.', 'Photographs taken from the air show how the site is arranged; those taken from low down show what people walking there really see.'], 'comparison', 'aerial shows the layout; low-level shows what visitors see', [
    { text:'Ground-level photographs show the layout of the site, but aerial photographs show what visitors actually see.', misconceptionCategory:'comparison_change' },
    { text:'Aerial photographs show the layout of the site, but night photographs show what visitors actually see.', misconceptionCategory:'meaning_confusion' },
    { text:'Aerial photographs show the layout of the site, and ground-level photographs show the same thing.', misconceptionCategory:'omitted_information' }
  ], ['vocab_ground_level']),
  idea('angle_of_view', 'A wider angle of view allows tourists to photograph a whole street instead of a single building.', ['If the lens takes in a greater width of the scene, visitors can photograph an entire street rather than one building.', 'Tourists can capture a complete street, not just one building, when a lens covers a broader field of vision.', 'Using a lens that includes more of the scene lets visitors photograph a full street instead of a single building.'], 'comparison', 'wider lens, whole street rather than one building', [
    { text:'A narrower angle of view allows tourists to photograph a whole street instead of a single building.', misconceptionCategory:'comparison_change' },
    { text:'A faster shutter speed allows tourists to photograph a whole street instead of a single building.', misconceptionCategory:'meaning_confusion' },
    { text:'A wider angle of view allows tourists to photograph two streets instead of a single building.', misconceptionCategory:'quantity_change' }
  ], ['vocab_angle_of_view']),
  idea('ecological_habitats', 'Tourism development is threatening the ecological habitats of the island’s rarest birds.', ['New building for visitors is putting at risk the natural homes of the rarest birds on the island.', 'The island’s rarest birds are in danger because tourist development is damaging the environments where they live.', 'The environments that support the island’s rarest birds are under threat from tourism development.'], 'cause_effect', 'tourism development endangers the birds’ habitats', [
    { text:'Tourism development is protecting the ecological habitats of the island’s rarest birds.', misconceptionCategory:'polarity_change' },
    { text:'Tourism development is threatening the ecological habitats of the island’s commonest birds.', misconceptionCategory:'degree_change' },
    { text:'Tourism development is threatening the feeding habits of the island’s rarest birds.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_ecological_habitats']),
  idea('marine_world', 'Pollution is a serious threat to the marine world, especially near busy tourist beaches.', ['Pollution seriously endangers life beneath the waves, particularly near busy tourist beaches.', 'Life in the sea is gravely threatened by pollution, especially close to crowded holiday beaches.', 'Near busy tourist beaches, pollution is a major danger to the ocean and its creatures.'], 'degree', 'a serious threat', [
    { text:'Pollution is a minor benefit to the marine world, especially near busy tourist beaches.', misconceptionCategory:'polarity_change' },
    { text:'Pollution is a small risk to the marine world, especially near busy tourist beaches.', misconceptionCategory:'degree_change' },
    { text:'Pollution is a serious threat to the mountain forests, especially near busy tourist roads.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_marine_world']),
  idea('coral', 'Rising sea temperatures are killing the coral around the island.', ['Warmer seas are destroying the colourful reef material near the island.', 'The reefs near the island are dying because the water is getting hotter.', 'Increasing ocean heat is causing the rock-like sea growth around the island to die.'], 'cause_effect', 'rising sea temperatures are killing', [
    { text:'Rising sea temperatures are helping the coral around the island to grow.', misconceptionCategory:'polarity_change' },
    { text:'Heavy tourism, not sea temperature, is killing the coral around the island.', misconceptionCategory:'cause_effect_change' },
    { text:'Rising sea temperatures are killing the fish around the island.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_coral']),
  idea('spellbound', 'The audience was completely spellbound by the folk dancers.', ['The audience was totally fascinated by the folk dancers.', 'The folk dancers held the audience in complete fascination.', 'The folk dancers completely captivated the audience.'], 'degree', 'completely', [
    { text:'The audience was slightly interested in the folk dancers.', misconceptionCategory:'degree_change' },
    { text:'The audience was completely bored by the folk dancers.', misconceptionCategory:'polarity_change' },
    { text:'The audience was completely frightened by the folk dancers.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_spellbound']),
  idea('wildlife', 'Tourists are not allowed to feed the wildlife in the national park.', ['Visitors are forbidden to give food to the animals living freely in the national park.', 'Giving food to creatures that live free in nature is banned for tourists in the national park.', 'It is against the rules for tourists to feed the free-living animals of the national park.'], 'polarity', 'not allowed', [
    { text:'Tourists are encouraged to feed the wildlife in the national park.', misconceptionCategory:'polarity_change' },
    { text:'Tourists are not allowed to photograph the wildlife in the national park.', misconceptionCategory:'meaning_confusion' },
    { text:'Only a few tourists are allowed to feed the wildlife in the national park.', misconceptionCategory:'quantity_change' }
  ], ['vocab_wildlife']),
  idea('preservation', 'The preservation of the old harbour is more important than building new hotels.', ['Protecting the old harbour from damage matters more than constructing new hotels.', 'Keeping the old harbour safe is a higher priority than putting up new hotels.', 'It is more important to protect the old harbour than to build new hotels.'], 'comparison', 'more important than', [
    { text:'Building new hotels is more important than the preservation of the old harbour.', misconceptionCategory:'comparison_change' },
    { text:'The demolition of the old harbour is more important than building new hotels.', misconceptionCategory:'meaning_confusion' },
    { text:'The preservation of the old harbour is more important than building new hotels, but only in summer.', misconceptionCategory:'added_information' }
  ], ['vocab_preservation']),
  idea('environmental_impact', 'The new airport will have a serious environmental impact on the coast.', ['The new airport will seriously affect the natural surroundings along the coast.', 'The coast will suffer major effects on nature from the new airport.', 'The new airport will do considerable harm to nature on the coast.'], 'degree', 'serious', [
    { text:'The new airport will have a slight environmental impact on the coast.', misconceptionCategory:'degree_change' },
    { text:'The new airport will have a positive environmental impact on the coast.', misconceptionCategory:'polarity_change' },
    { text:'The old airport had a serious environmental impact on the coast.', misconceptionCategory:'time_change' }
  ], ['vocab_environmental_impact']),
  idea('journey', 'The journey to the island takes nearly six hours by ferry.', ['The trip to the island lasts almost six hours by ferry.', 'Getting to the island by ferry takes close to six hours.', 'It takes almost six hours to reach the island by ferry.'], 'quantity', 'nearly six hours', [
    { text:'The journey to the island takes less than an hour by ferry.', misconceptionCategory:'quantity_change' },
    { text:'The ferry to the island holds nearly six hundred passengers.', misconceptionCategory:'meaning_confusion' },
    { text:'The journey to the island takes nearly six hours by ferry, plus a night in a hotel.', misconceptionCategory:'added_information' }
  ], ['vocab_journey']),
  idea('licence', 'Without a licence, nobody may take tourists out to the reef.', ['Nobody may take tourists out to the reef unless they hold official permission.', 'Taking tourists to the reef is forbidden without an official permit.', 'Only people with official permission may take tourists out to the reef.'], 'polarity', 'nobody may', [
    { text:'Even without a licence, anybody may take tourists out to the reef.', misconceptionCategory:'polarity_change' },
    { text:'Without a map, nobody may take tourists out to the reef.', misconceptionCategory:'meaning_confusion' },
    { text:'Without a licence, nobody may take tourists out to the reef or the lagoon.', misconceptionCategory:'added_information' }
  ], ['vocab_licence']),
  idea('offer', 'The airline has a special offer on flights to Rome, but it ends on Friday.', ['The airline has a cut-price deal on flights to Rome, but it finishes on Friday.', 'A bargain on flights to Rome is available from the airline only until Friday.', 'Cheap flights to Rome are on sale with the airline, but only until Friday.'], 'time', 'ends on Friday', [
    { text:'The airline has a special offer on flights to Rome, and it starts on Friday.', misconceptionCategory:'time_change' },
    { text:'The airline has a delay on flights to Rome, but it ends on Friday.', misconceptionCategory:'meaning_confusion' },
    { text:'The airline has a special offer on flights to Rome.', misconceptionCategory:'omitted_information' }
  ], ['vocab_offer']),
  idea('guided_tour', 'All visitors to the caves must join a guided tour.', ['Every visitor to the caves is required to take part in an expert-led visit.', 'Nobody may enter the caves except as part of an organised group visit led by an expert.', 'Entering the caves is only possible with a visit led by a specialist.'], 'quantity', 'all', [
    { text:'Some visitors to the caves must join a guided tour.', misconceptionCategory:'quantity_change' },
    { text:'No visitors to the caves are allowed to join a guided tour.', misconceptionCategory:'polarity_change' },
    { text:'All visitors to the caves must buy a guidebook.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_guided_tour']),
  idea('travel_assistant', 'The travel assistant checked three airlines before finding a cheaper flight for the family.', ['The agency employee compared three airlines before finding the family a cheaper flight.', 'After looking at three airlines, the worker who arranges holidays found the family a cheaper flight.', 'The holiday-booking employee looked at three airlines before finding a cheaper flight for the family.'], 'time', 'before finding', [
    { text:'The travel assistant checked only one airline before finding a cheaper flight for the family.', misconceptionCategory:'quantity_change' },
    { text:'The travel assistant found a cheaper flight for the family before checking three airlines.', misconceptionCategory:'time_change' },
    { text:'The travel assistant checked three hotels before finding a cheaper room for the family.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_travel_assistant']),
  idea('tourism_industry', 'The tourism industry has grown rapidly in the region over the past ten years.', ['Businesses that serve holidaymakers have expanded quickly in the region during the last decade.', 'The region’s holiday trade has increased fast over the past ten years.', 'Over the last ten years, firms providing for holidaymakers in the region have multiplied rapidly.'], 'degree', 'rapidly', [
    { text:'The tourism industry has grown slowly in the region over the past ten years.', misconceptionCategory:'degree_change' },
    { text:'The tourism industry has shrunk rapidly in the region over the past ten years.', misconceptionCategory:'polarity_change' },
    { text:'The tourism industry will grow rapidly in the region over the next ten years.', misconceptionCategory:'time_change' }
  ], ['vocab_tourism_industry']),
  idea('exploring', 'Exploring the rainforest on foot lets visitors see animals that they would never notice from a boat.', ['Discovering the rainforest on foot allows visitors to see animals that they would never spot from a boat.', 'Walking through the rainforest to find out about it lets visitors see animals that boat passengers would never notice.', 'Visitors who travel around the rainforest on foot can see animals that they would miss entirely from a boat.'], 'comparison', 'on foot ... from a boat', [
    { text:'Exploring the rainforest by boat lets visitors see animals that they would never notice on foot.', misconceptionCategory:'comparison_change' },
    { text:'Exploring the rainforest on foot stops visitors from seeing animals that they would notice from a boat.', misconceptionCategory:'polarity_change' },
    { text:'Exploring the rainforest on foot lets visitors see animals that they would never notice from a boat, but only in the dry season.', misconceptionCategory:'added_information' }
  ], ['vocab_exploring']),
  idea('observation', 'Careful observation of the animals showed that they feed mainly at night.', ['Watching the animals closely revealed that they eat mostly after dark.', 'Close attention to the animals demonstrated that they mainly feed during the night.', 'Researchers who watched the animals carefully discovered that most of their feeding happens at night.'], 'cause_effect', 'showed that', [
    { text:'Careful observation of the animals showed that they feed mainly in the morning.', misconceptionCategory:'time_change' },
    { text:'Careful observation of the animals showed that they feed only occasionally at night.', misconceptionCategory:'quantity_change' },
    { text:'Careful observation of the animals showed that they sleep mainly at night.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_observation']),
  idea('relaxation', 'The spa is designed to provide complete relaxation for tired business travellers.', ['The spa is planned to give tired business travellers total rest and freedom from stress.', 'The spa is built so that worn-out business travellers can rest completely and forget their stress.', 'The spa has been created to give exhausted business travellers a complete rest from stress.'], 'degree', 'complete', [
    { text:'The spa is designed to provide some relaxation for tired business travellers.', misconceptionCategory:'degree_change' },
    { text:'The spa is not designed to provide complete relaxation for tired business travellers.', misconceptionCategory:'polarity_change' },
    { text:'The spa is designed to provide complete training for tired business travellers.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_relaxation']),
  idea('adventurous_activities', 'Adventurous activities are becoming more popular with young tourists than sightseeing.', ['Exciting, risky pastimes are increasingly preferred by young travellers to sightseeing.', 'Young holidaymakers now like thrilling outdoor pursuits better than sightseeing.', 'More and more young travellers choose challenging sports over sightseeing.'], 'comparison', 'more popular ... than sightseeing', [
    { text:'Sightseeing is becoming more popular with young tourists than adventurous activities.', misconceptionCategory:'comparison_change' },
    { text:'Adventurous activities are becoming slightly more popular with young tourists than sightseeing.', misconceptionCategory:'degree_change' },
    { text:'Adventurous activities were once more popular with young tourists than sightseeing.', misconceptionCategory:'time_change' }
  ], ['vocab_adventurous_activities']),
  idea('memorable', 'The boat trip was so memorable that the children talked about it for weeks.', ['The boat trip was so special that the children kept talking about it for weeks.', 'The children spoke about the boat trip for weeks because it was worth remembering.', 'The children kept discussing the boat trip for weeks, since it was such a special experience.'], 'cause_effect', 'so ... that', [
    { text:'The boat trip was so memorable that the children forgot about it for weeks.', misconceptionCategory:'polarity_change' },
    { text:'The boat trip was so memorable that the children talked about it for days.', misconceptionCategory:'time_change' },
    { text:'The boat trip was so noisy that the children talked about it for weeks.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_memorable']),
  idea('recommendation', 'A personal recommendation from a friend influences holiday choices more than advertisements do.', ['Advice from a friend affects where people go on holiday more strongly than advertising does.', 'Holiday decisions are shaped more by a friend’s suggestion than by advertisements.', 'People are swayed by a friend’s suggestion about their holiday more than by adverts.'], 'comparison', 'more than advertisements', [
    { text:'Advertisements influence holiday choices more than a personal recommendation from a friend does.', misconceptionCategory:'comparison_change' },
    { text:'A personal recommendation from a friend influences holiday choices only a little.', misconceptionCategory:'degree_change' },
    { text:'A personal complaint from a friend influences holiday choices more than advertisements do.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_recommendation_5']),
  idea('reservation', 'You must make a reservation at least two days in advance, or the restaurant cannot guarantee a table.', ['A table cannot be guaranteed unless you book at least two days beforehand.', 'Unless you book a table at least forty-eight hours ahead, the restaurant cannot promise you one.', 'To be sure of a table, you need to book no later than two days before.'], 'time', 'at least two days in advance', [
    { text:'You must make a reservation at least two weeks in advance, or the restaurant cannot guarantee a table.', misconceptionCategory:'time_change' },
    { text:'You need not make a reservation in advance, because the restaurant can always guarantee a table.', misconceptionCategory:'polarity_change' },
    { text:'You must make a reservation, or the restaurant cannot guarantee a table.', misconceptionCategory:'omitted_information' }
  ], ['vocab_reservation']),
  idea('destination', 'The island has become the favourite destination of British families over the last five years.', ['British families have increasingly chosen the island as their preferred place to visit during the past five years.', 'During the last five years, the island has turned into the place that British families like best to visit.', 'Over the past five years, the island has grown into the holiday spot that British families prefer most.'], 'time', 'over the last five years', [
    { text:'The island has become the favourite destination of British families over the last fifteen years.', misconceptionCategory:'time_change' },
    { text:'The island has stopped being the favourite destination of British families over the last five years.', misconceptionCategory:'polarity_change' },
    { text:'The island has become the favourite destination of German families over the last five years.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_destination_5']),
  idea('availability', 'Availability of rooms is very limited during the festival, so you should book early.', ['There are hardly any rooms free to book during the festival, so you should arrange yours early.', 'Rooms are scarce during the festival, which means that you ought to book well in advance.', 'Since so few rooms can be booked during the festival, early booking is advisable.'], 'cause_effect', 'so you should book early', [
    { text:'Availability of rooms is slightly limited during the festival, so you should book early.', misconceptionCategory:'degree_change' },
    { text:'Availability of rooms is excellent during the festival, so you need not book early.', misconceptionCategory:'polarity_change' },
    { text:'Availability of rooms is very limited during the festival because you booked early.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_availability_5'])
];

export default [...phraseSets, ...ideaSets];
