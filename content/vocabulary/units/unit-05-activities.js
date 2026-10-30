// Unit 5 · Paraphrasing content (phrase_set and idea_set), WORDS 1–20 ONLY. Same record shapes and contract as unit-04-activities.js:
//   phrase_set : originalPhrase (plain wording) -> equivalentPhrase (contains the target), acceptedVariants, chunks, commonMeaningDistortions
//   idea_set   : originalIdea (contains the target) with accurate paraphrases that do NOT contain it, a meaning invariant, and three
//                meaning-changing distractors each tagged with the misconception it represents.
// Every record is linked to exactly one Unit 5 word. Words 21–50 are not authored yet.
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
  phrase('marine_world_exhibition', 'an exhibition about the sea and its living things', 'an exhibition about the marine world', ['vocab_marine_world'], { chunks:['an exhibition', 'about the marine world'], distortions:['an exhibition about ships and sailors', 'an exhibition about the polar regions', 'an exhibition about the desert'] })
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
  ], ['vocab_marine_world'])
];

export default [...phraseSets, ...ideaSets];
