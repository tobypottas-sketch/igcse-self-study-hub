// UNIT 5 – HOLIDAYS: approved source for the Unit 5 release (releases/unit-05.js promotes it to live). Source: 0511 key words UNIT 5 – HOLIDAYS
// (coursebook order), all 50 authored and audited. The full 50-word list is locked. Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-05.js
// breathtaking, recommendation, destination, availability, equipment and evaluate are also earlier-unit targets; each has its own Unit 5 id (idKey 'X_5' -> vocab_X_5) and aliases the earlier spelling list.
import { buildCuratedUnit } from '../build-unit.js';
import { LEXICAL_SPELLING_ERRORS } from '../lexical-spelling-errors.js';
import unit5Activities from './unit-05-activities.js';
import unit5PrecisionUse from './unit-05-precision-use.js';
import unit5WordFamilyItems from './unit-05-word-family-items.js';
import unit5Collocations from './unit-05-collocations.js';
import unit5SituationExtras from './unit-05-situation-extras.js';
import unit5MeaningMatch from './unit-05-meaning-match.js';
import unit5MeaningMastery from './unit-05-meaning-mastery.js';
import unit5ContextPassages from './unit-05-context-passages.js';
import { unit5WordFamilies, unit5WordFamilyRejected } from './unit-05-word-families.js';
import { unit5WordFamilyAlternates } from './unit-05-word-family-alternates.js';

const UNIT_NUMBER = 5;
const status = 'approved';

const e = (term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence, paraphraseSource, paraphraseSentence, productionSource, productionSentence, extras = {}) => ({
  term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence,
  paraphrase:{ source:paraphraseSource, sentence:paraphraseSentence },
  production:{ source:productionSource, sentence:productionSentence },
  ...extras
});

const entries = [
  e('aerial tourism', 'noun',
    'sightseeing trips and holidays in which visitors see places from the air',
    ['sightseeing from the air', 'holidays that show places from above'],
    ['business travel between cities by aeroplane', 'training courses for people who want to become pilots', 'the transport of goods by aeroplane and helicopter'],
    'Helicopter flights over the glaciers have helped to make aerial tourism a growing business in the region.',
    'sightseeing from the air', 'Helicopter flights over the glaciers have helped to make sightseeing from the air a growing business in the region.',
    'holidays that show places from above', 'The island now earns most of its money from holidays that show places from above, such as helicopter and balloon trips.',
    {
      masteryContexts:[
        { text:'Our hotel offers aerial tourism packages, including a short helicopter flight above the waterfalls.', meaning:'sightseeing trips that show places from the air' },
        { text:'The small airport on the island was built mainly for aerial tourism, because most visitors come to take sightseeing flights over the coral reef.', meaning:'holidays and trips in which people see places from the air' }
      ],
      situationDistractors:[
        'A group of tourists boarded a coach and spent the afternoon visiting museums in the old town.',
        'Passengers on the ferry stayed on deck and watched the harbour lights from the water.',
        'The family drove along the coast road and stopped at a café for lunch.'
      ],
      retrievalContexts:[
        { id:'1', text:'Helicopter rides over the volcano are the most popular form of aerial tourism on the island.', target:'aerial tourism', grammarPattern:'' },
        { id:'2', text:'Visitors who prefer aerial tourism can see the whole canyon in twenty minutes from a small plane.', target:'aerial tourism', grammarPattern:'' },
        { id:'3', text:'Strict rules limit how low helicopters may fly, so aerial tourism does not disturb the people living near the national park.', target:'aerial tourism', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'aerial tourism', wrong:['coastal fishing', 'mountain walking', 'city shopping'] },
        { id:'2', answer:'aerial tourism', wrong:['desert camping', 'river rafting', 'coach travel'] },
        { id:'3', answer:'aerial tourism', wrong:['coach tourism', 'cruise tourism', 'beach tourism'] }
      ]
    }),
  e('underwater photography', 'noun',
    'the activity of taking photographs beneath the surface of the sea, a lake or a river',
    ['taking pictures beneath the surface', 'camera work under the sea'],
    ['painting pictures of ships and sea creatures', 'the study of fish and other sea animals', 'selling cameras and diving equipment in shops'],
    'The magazine hired an expert in underwater photography to capture the colours of the coral reef.',
    'taking pictures beneath the surface', 'The magazine hired an expert in taking pictures beneath the surface to capture the colours of the coral reef.',
    'camera work under the sea', 'Good results in camera work under the sea depend on clear water and bright light.',
    {
      masteryContexts:[
        { text:'Divers who take up underwater photography need a waterproof camera and a strong torch.', meaning:'the activity of taking photographs beneath the surface of the water' },
        { text:'The festival displayed stunning underwater photography showing turtles, rays and brightly coloured fish.', meaning:'pictures taken beneath the surface of the water' }
      ],
      situationDistractors:[
        'The diver collected rubbish from the seabed and put it into a net bag.',
        'A sailor repaired the engine of the fishing boat before the storm arrived.',
        'The guide pointed out a rare bird on top of the cliff, and the group raised their binoculars.'
      ],
      retrievalContexts:[
        { id:'1', text:'Her interest in underwater photography began when she took a waterproof camera on a diving holiday.', target:'underwater photography', grammarPattern:'' },
        { id:'2', text:'Clear, shallow water and bright sunshine are ideal conditions for underwater photography on the reef.', target:'underwater photography', grammarPattern:'' },
        { id:'3', text:'The museum’s exhibition of underwater photography shows shipwrecks, sharks and forests of seaweed.', target:'underwater photography', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'underwater photography', wrong:['desert photography', 'mountain climbing', 'wildlife painting'] },
        { id:'2', answer:'underwater photography', wrong:['mountain photography', 'studio portrait work', 'wedding photography'] },
        { id:'3', answer:'underwater photography', wrong:['wedding photography', 'portrait painting', 'sports reporting'] }
      ]
    }),
  e('documentary', 'noun',
    'a film or television programme that presents real facts about a subject or an event',
    ['factual film', 'non-fiction programme'],
    ['a story about imaginary people and events', 'a short advertisement shown between programmes', 'a live broadcast of a sports match'],
    'The tourist board paid for a documentary about the wildlife of the Amazon rainforest.',
    'factual film', 'The tourist board paid for a factual film about the wildlife of the Amazon rainforest.',
    'non-fiction programme', 'Schools often show a non-fiction programme about volcanoes before a geography trip.',
    {
      masteryContexts:[
        { text:'After watching a documentary about Iceland, Hana decided to spend her summer holiday there.', meaning:'a factual film about real places or events' },
        { text:'The documentary follows a team of explorers as they cross the desert on camels.', meaning:'a programme that shows real events and people' }
      ],
      situationDistractors:[
        'The children laughed at a cartoon about a clumsy penguin who kept falling off an iceberg.',
        'The actors rehearsed their lines for the school play on a stage built from wooden boxes.',
        'The radio presenter read out the weather forecast and the traffic news for the morning.'
      ],
      retrievalContexts:[
        { id:'1', text:'The class watched a documentary about coral reefs and then wrote a report on the threats they face.', target:'documentary', grammarPattern:'' },
        { id:'2', text:'The director spent two years filming the documentary in remote villages, using only real people and no actors.', target:'documentary', grammarPattern:'' },
        { id:'3', text:'Many viewers say that the documentary taught them more about life in the Arctic than any textbook.', target:'documentary', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'documentary', wrong:['comedy', 'musical', 'thriller'] },
        { id:'2', answer:'documentary', wrong:['comedy', 'thriller', 'cartoon'] },
        { id:'3', answer:'documentary', wrong:['advert', 'quiz show', 'soap opera'] }
      ]
    }),
  e('snorkelling', 'noun',
    'swimming near the surface of the water with a mask and a breathing tube to look at underwater life',
    ['swimming with a mask and tube', 'shallow-water swimming with breathing gear'],
    ['riding on waves while standing on a board', 'travelling across the sea on a large ship', 'catching fish with a net from a small boat'],
    'We spent the morning snorkelling above the coral reef and saw dozens of colourful fish.',
    'swimming with a mask and tube', 'We spent the morning swimming with a mask and tube above the coral reef and saw dozens of colourful fish.',
    'shallow-water swimming with breathing gear', 'Even beginners can try shallow-water swimming with breathing gear if the sea is calm.',
    {
      masteryContexts:[
        { text:'The hotel lends masks and tubes to guests who want to go snorkelling in the bay.', meaning:'swimming near the surface with a mask and breathing tube' },
        { text:'Families love snorkelling because it needs little training, and it lets children see fish up close.', meaning:'swimming on the surface to look at underwater life' }
      ],
      situationDistractors:[
        'The lifeguard blew her whistle and told the swimmers to leave the pool because of the storm.',
        'A group of cyclists stopped at the harbour to buy bottles of water and fruit.',
        'The captain steered the ferry slowly past the lighthouse while passengers took photographs.'
      ],
      retrievalContexts:[
        { id:'1', text:'Beginners can try snorkelling in shallow water, using only a mask, a tube and a pair of fins.', target:'snorkelling', grammarPattern:'' },
        { id:'2', text:'The guide gave everyone a mask and a tube, and soon the whole group was snorkelling above the reef.', target:'snorkelling', grammarPattern:'' },
        { id:'3', text:'You do not need to be a strong swimmer for snorkelling, because your face floats at the surface and the tube lets you breathe.', target:'snorkelling', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'snorkelling', wrong:['sailing', 'windsurfing', 'fishing'] },
        { id:'2', answer:'snorkelling', wrong:['sunbathing', 'shopping', 'hiking'] },
        { id:'3', answer:'snorkelling', wrong:['fishing', 'sailing', 'camping'] }
      ]
    }),
  e('expedition', 'noun',
    'an organised journey made by a group of people to explore a place or to do research',
    ['research journey', 'organised exploring trip'],
    ['a short walk taken for exercise', 'a holiday spent resting at a hotel', 'a meeting held to make decisions'],
    'The scientists joined the expedition to the Antarctic to study the penguins.',
    'research journey', 'The scientists joined the research journey to the Antarctic to study the penguins.',
    'organised exploring trip', 'The club is planning an organised exploring trip across the desert next spring.',
    {
      masteryContexts:[
        { text:'Months of planning went into the expedition to climb the mountain, and dozens of porters carried the supplies.', meaning:'an organised journey made to explore or to reach a goal' },
        { text:'The university sent an expedition to the rainforest to record rare birds and plants.', meaning:'an organised group journey for research or exploration' }
      ],
      situationDistractors:[
        'The family flew to a beach resort and spent a lazy week by the pool.',
        'Passengers waited at the gate while the airline checked their boarding passes.',
        'We took the tram to the city centre and queued to buy tickets for the museum.'
      ],
      retrievalContexts:[
        { id:'1', text:'The explorers packed tents, food and medicine for a six-month expedition across the Arctic.', target:'expedition', grammarPattern:'' },
        { id:'2', text:'Photographs from the expedition show the team camping beside a frozen lake in the mountains.', target:'expedition', grammarPattern:'' },
        { id:'3', text:'Funding for the research expedition came from a university and a number of private companies.', target:'expedition', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'expedition', wrong:['commute', 'lesson', 'meeting'] },
        { id:'2', answer:'expedition', wrong:['wedding', 'exam', 'festival'] },
        { id:'3', answer:'expedition', wrong:['holiday', 'election', 'concert'] }
      ]
    }),
  e('yacht', 'noun',
    'a large boat with sails or an engine, used for pleasure or for racing',
    ['pleasure boat', 'private sailing boat'],
    ['a large ship that carries goods across oceans', 'a small boat used only for catching fish', 'a public ferry that crosses a river each day'],
    'They spent a week on a yacht, sailing between the Greek islands.',
    'pleasure boat', 'They spent a week on a pleasure boat, sailing between the Greek islands.',
    'private sailing boat', 'The couple hired a private sailing boat for their honeymoon around the islands.',
    {
      masteryContexts:[
        { text:'The millionaire invited his guests aboard his yacht for a weekend cruise along the Mediterranean coast.', meaning:'a large boat used for pleasure or sport' },
        { text:'On the day of the race, every yacht in the harbour raised its sails and moved slowly towards the starting line.', meaning:'a boat with sails used for pleasure or racing' }
      ],
      situationDistractors:[
        'The commuter ferry crossed the river every ten minutes, carrying workers to the city.',
        'Fishermen pulled in their nets at dawn and sold the catch at the harbour market.',
        'The huge container ship was unloaded by cranes at the port for two days.'
      ],
      retrievalContexts:[
        { id:'1', text:'After the race, the crew lowered the sails and tied the yacht to the jetty.', target:'yacht', grammarPattern:'' },
        { id:'2', text:'The film star owns a luxury yacht, which she keeps in the harbour at Monaco.', target:'yacht', grammarPattern:'' },
        { id:'3', text:'We hired a yacht for a week and sailed between the islands, stopping each evening in a different bay.', target:'yacht', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'yacht', wrong:['ferry', 'tanker', 'lorry'] },
        { id:'2', answer:'yacht', wrong:['bicycle', 'tractor', 'caravan'] },
        { id:'3', answer:'yacht', wrong:['minibus', 'helicopter', 'taxi'] }
      ]
    }),
  e('scenery', 'noun',
    'the natural views of an area, such as hills, forests, rivers and lakes',
    ['natural views', 'beautiful countryside'],
    ['the old buildings and monuments in a city', 'the weather and temperature of a region', 'the plants and animals kept in a zoo'],
    'Tourists travel to the highlands to enjoy the scenery.',
    'natural views', 'Tourists travel to the highlands to enjoy the natural views.',
    'beautiful countryside', 'Cyclists chose the quiet lanes because they wanted to cycle through beautiful countryside.',
    {
      masteryContexts:[
        { text:'We stopped the coach several times so that the passengers could photograph the stunning scenery of mountains, rivers and forests.', meaning:'the natural views of an area' },
        { text:'The mountain scenery is the main reason why so many hikers return to the region every year.', meaning:'the natural beauty of the land, such as hills, lakes and forests' }
      ],
      situationDistractors:[
        'The hotel receptionist gave each guest a key card and a map of the building.',
        'Shoppers hurried through the market, comparing prices before buying souvenirs.',
        'The coach driver checked the tyres and filled the tank with diesel before the long trip.'
      ],
      retrievalContexts:[
        { id:'1', text:'The railway runs through the mountains, so passengers can enjoy spectacular scenery all day.', target:'scenery', grammarPattern:'' },
        { id:'2', text:'Many visitors return to the lake each year for the peaceful scenery, with its pine forests and still water.', target:'scenery', grammarPattern:'' },
        { id:'3', text:'The film was shot in New Zealand, where the dramatic scenery of mountains and fjords creates a perfect backdrop.', target:'scenery', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'scenery', wrong:['luggage', 'timetables', 'traffic'] },
        { id:'2', answer:'scenery', wrong:['nightlife', 'shopping', 'food'] },
        { id:'3', answer:'scenery', wrong:['economy', 'population', 'transport'] }
      ]
    }),
  e('attractions', 'noun',
    'interesting or enjoyable places that tourists visit, such as museums, castles and theme parks',
    ['places of interest', 'sights for visitors'],
    ['hotels and apartments where visitors stay', 'shops and markets where visitors buy gifts', 'buses and trains that visitors use to travel'],
    'The city’s main attractions include a medieval castle, a science museum and a large aquarium.',
    'places of interest', 'The city’s main places of interest include a medieval castle, a science museum and a large aquarium.',
    'sights for visitors', 'The brochure lists the best sights for visitors, from ancient temples to modern art galleries.',
    {
      masteryContexts:[
        { text:'Tourist attractions such as the old fort and the harbour museum are within walking distance of the hotel.', meaning:'interesting places that visitors go to see' },
        { text:'Theme parks and zoos are popular attractions for families with young children.', meaning:'places that people visit because they are interesting or enjoyable' }
      ],
      situationDistractors:[
        'The receptionist gave us a room on the fourth floor with a view of the car park.',
        'The airline lost one of our suitcases, and the staff promised to deliver it the next day.',
        'The taxi driver took a wrong turning, and we arrived at the airport ten minutes late.'
      ],
      retrievalContexts:[
        { id:'1', text:'The tourist office gives visitors a free map showing all the main attractions in the old town.', target:'attractions', grammarPattern:'' },
        { id:'2', text:'The theme park is one of the most popular tourist attractions in the country, drawing millions of visitors every year.', target:'attractions', grammarPattern:'' },
        { id:'3', text:'Because the museum and the castle are close together, visitors can see two major attractions in a single morning.', target:'attractions', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'attractions', wrong:['factories', 'offices', 'warehouses'] },
        { id:'2', answer:'attractions', wrong:['islands', 'airlines', 'seasons'] },
        { id:'3', answer:'attractions', wrong:['meals', 'airlines', 'lessons'] }
      ]
    }),
  e('accommodation', 'noun',
    'a place to stay, such as a hotel room or a flat, while you are away from home',
    ['a place to stay', 'somewhere to stay overnight'],
    ['the food served in a hotel restaurant', 'the staff who work at a hotel reception', 'the transport provided between the airport and the hotel'],
    'It is wise to book accommodation early during the summer festival.',
    'a place to stay', 'It is wise to book a place to stay early during the summer festival.',
    'somewhere to stay overnight', 'Many travellers need somewhere to stay overnight when their flight is delayed until the morning.',
    {
      masteryContexts:[
        { text:'The student hostel offers cheap accommodation near the station, with shared kitchens and four-bed rooms.', meaning:'a place to stay when you are away from home' },
        { text:'Finding suitable accommodation can be difficult in a seaside town during the summer season.', meaning:'rooms or buildings where you can stay for a period of time' }
      ],
      situationDistractors:[
        'The waiter brought a menu to our table and recommended the fish of the day.',
        'Passengers queued at the security gate and placed their bags on the belt.',
        'The guide held up a flag so that the group could find her in the crowded square.'
      ],
      retrievalContexts:[
        { id:'1', text:'The hotel offers comfortable accommodation at a reasonable price, with breakfast included.', target:'accommodation', grammarPattern:'' },
        { id:'2', text:'We booked our accommodation online three months before the festival, because all the rooms sell out quickly.', target:'accommodation', grammarPattern:'' },
        { id:'3', text:'Students who study abroad often live in university accommodation, such as a shared flat or a hall of residence.', target:'accommodation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'accommodation', wrong:['transport', 'entertainment', 'insurance'] },
        { id:'2', answer:'accommodation', wrong:['flights', 'tickets', 'taxis'] },
        { id:'3', answer:'accommodation', wrong:['transport', 'insurance', 'equipment'] }
      ]
    }),
  e('adventurous', 'adjective',
    'willing to try new, exciting or sometimes dangerous things',
    ['daring', 'keen to try new things'],
    ['unwilling to take any risks at all', 'very interested in history and old buildings', 'always ready to help other people'],
    'Tourists who are adventurous often prefer climbing, diving and rafting to lying on a beach.',
    'daring', 'Tourists who are daring often prefer climbing, diving and rafting to lying on a beach.',
    'keen to try new things', 'Children who are keen to try new things usually enjoy a week at an outdoor activity centre.',
    {
      masteryContexts:[
        { text:'My brother is very adventurous, so he booked a kayaking trip through the rapids instead of a relaxing beach holiday.', meaning:'willing to try new and exciting things, even if they are risky' },
        { text:'The company organises holidays for adventurous teenagers who would rather hike across glaciers than sit by a pool.', meaning:'keen on exciting new experiences' }
      ],
      situationDistractors:[
        'The tourist checked the weather forecast three times and then stayed in the hotel all day.',
        'The couple booked the same hotel they had visited for ten years and ate at the same café every evening.',
        'The woman packed a guidebook, a map and a first-aid kit, and she followed the planned route exactly.'
      ],
      retrievalContexts:[
        { id:'1', text:'Tom is very adventurous, so he enjoys sleeping in tents, crossing rivers and climbing steep mountains.', target:'adventurous', grammarPattern:'' },
        { id:'2', text:'Visitors who feel adventurous can try white-water rafting, zip-lining or a night walk through the jungle.', target:'adventurous', grammarPattern:'' },
        { id:'3', text:'Her family chose a quiet beach holiday, but Maria was more adventurous and signed up for a diving course.', target:'adventurous', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'adventurous', wrong:['cautious', 'lazy', 'nervous'] },
        { id:'2', answer:'adventurous', wrong:['sleepy', 'cautious', 'homesick'] },
        { id:'3', answer:'adventurous', wrong:['careful', 'patient', 'tired'] }
      ]
    }),
  e('breathtaking', 'adjective',
    'so beautiful or impressive that it makes people stop and stare in amazement',
    ['awe-inspiring', 'astonishingly beautiful'],
    ['hard to breathe in because the air is thin', 'extremely cold, with strong winds', 'so crowded that people cannot move'],
    'Visitors fell silent when the clouds cleared and revealed the breathtaking view from the summit.',
    'awe-inspiring', 'Visitors fell silent when the clouds cleared and revealed the awe-inspiring view from the summit.',
    'astonishingly beautiful', 'Travel writers often describe the lagoon as astonishingly beautiful at dawn.',
    {
      idKey:'breathtaking_5',
      teacherNote:'Unit 5 item (breathtaking_5): the tourism sense of amazement at a sight. Unit 4 vocab_breathtaking is a separate item that shares only the lexical spelling list.',
      masteryContexts:[
        { text:'The tour guide waited at the viewpoint so that the group could take in the breathtaking sight of the sun rising over the temple.', meaning:'so beautiful or impressive that it amazes you' },
        { text:'The helicopter ride over the canyon was a breathtaking experience, and the whole group fell silent as the cliffs rose around us.', meaning:'so exciting and impressive that it leaves you amazed' }
      ],
      situationDistractors:[
        'The tour group sat in a café and complained that a bus was blocking the window.',
        'The hotel lobby was plain and quiet, and the guests waited patiently for their keys.',
        'The visitors walked quickly past the monument, glanced at it and returned to the coach.'
      ],
      retrievalContexts:[
        { id:'1', text:'Standing on the glass platform above the gorge was a breathtaking experience, and several visitors needed a moment to recover.', target:'breathtaking', grammarPattern:'' },
        { id:'2', text:'Even experienced travellers admit that the first sight of the ancient city at sunrise is breathtaking.', target:'breathtaking', grammarPattern:'' },
        { id:'3', text:'The documentary ends with a breathtaking shot of whales leaping out of the water at sunset.', target:'breathtaking', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'breathtaking', wrong:['routine', 'familiar', 'tedious'] },
        { id:'2', answer:'breathtaking', wrong:['ordinary', 'tiresome', 'harmless'] },
        { id:'3', answer:'breathtaking', wrong:['routine', 'quiet', 'faded'] }
      ]
    }),
  e('spectacular', 'adjective',
    'very impressive, striking and exciting to look at, often because of its size or scale',
    ['grand and striking', 'impressive on a large scale'],
    ['causing great fear or danger to those who watch', 'popular with large numbers of tourists', 'very expensive for ordinary visitors'],
    'The firework display over the harbour was spectacular, with colour filling the sky for twenty minutes.',
    'grand and striking', 'The firework display over the harbour was grand and striking, with colour filling the sky for twenty minutes.',
    'impressive on a large scale', 'The opening ceremony was impressive on a large scale, with hundreds of dancers and a choir of two hundred voices.',
    {
      masteryContexts:[
        { text:'Victoria Falls is spectacular, especially in the rainy season, when millions of litres of water crash into the gorge every second.', meaning:'very impressive to look at, especially because of its size and power' },
        { text:'The ice hotel puts on a spectacular show of light and music every winter evening.', meaning:'exciting and impressive to watch, on a grand scale' }
      ],
      situationDistractors:[
        'A small café on the corner served tea and sandwiches to the walkers.',
        'The bus arrived at the hotel, and the driver unloaded the bags in the rain.',
        'The tourists spent a quiet evening reading in the lounge.'
      ],
      retrievalContexts:[
        { id:'1', text:'The carnival procession through the old town was a spectacular event, with huge floats, live music and thousands of dancers.', target:'spectacular', grammarPattern:'' },
        { id:'2', text:'The waterfall drops over a hundred metres into the gorge, and the spray makes a spectacular sight from the viewing platform.', target:'spectacular', grammarPattern:'' },
        { id:'3', text:'Tourists gather every evening to watch the spectacular sunset show, when hundreds of birds fill the sky above the lake.', target:'spectacular', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'spectacular', wrong:['modest', 'quiet', 'routine'] },
        { id:'2', answer:'spectacular', wrong:['modest', 'gentle', 'tiny'] },
        { id:'3', answer:'spectacular', wrong:['hidden', 'tiny', 'faint'] }
      ]
    }),
  e('dramatic', 'adjective',
    'very noticeable and powerful, because of sharp contrasts or sudden changes',
    ['striking and powerful', 'sudden and sharp'],
    ['connected with acting and the theatre', 'calm, gentle and easy to relax in', 'popular with large crowds of visitors'],
    'The dramatic coastline of the island has steep cliffs that fall straight into the sea.',
    'striking and powerful', 'The striking and powerful coastline of the island has steep cliffs that fall straight into the sea.',
    'sudden and sharp', 'Visitors were surprised by the sudden and sharp drop in temperature when the sun went down.',
    {
      masteryContexts:[
        { text:'The road climbs through dramatic mountain scenery, with sharp peaks, deep valleys and clouds that change colour every hour.', meaning:'striking and powerful, with strong contrasts' },
        { text:'There has been a dramatic rise in the number of tourists visiting the island since the new airport opened.', meaning:'sudden and very large' }
      ],
      situationDistractors:[
        'The path followed a gentle river through flat fields, and nothing changed along the way.',
        'The number of visitors stayed almost the same from one year to the next.',
        'The weather was mild and cloudy all week, with no wind and no rain.'
      ],
      retrievalContexts:[
        { id:'1', text:'Photographers love the dramatic skies over the bay, where black storm clouds and bright sunlight appear together.', target:'dramatic', grammarPattern:'' },
        { id:'2', text:'After the new hotel opened, there was a dramatic increase in the number of visitors, from two thousand to twenty thousand a year.', target:'dramatic', grammarPattern:'' },
        { id:'3', text:'The boat trip had one dramatic moment, when a huge whale leapt out of the water beside us.', target:'dramatic', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'dramatic', wrong:['plain', 'pale', 'cloudless'] },
        { id:'2', answer:'dramatic', wrong:['slight', 'gradual', 'minor'] },
        { id:'3', answer:'dramatic', wrong:['quiet', 'dull', 'slow'] }
      ]
    }),
  e('stunning', 'adjective',
    'extremely attractive or beautiful, in a way that impresses you immediately',
    ['extremely attractive', 'strikingly beautiful'],
    ['causing someone to lose consciousness', 'extremely shocking or upsetting to see', 'very large, tall and heavy'],
    'The hotel offers stunning views of the bay from every room.',
    'extremely attractive', 'The hotel offers extremely attractive views of the bay from every room.',
    'strikingly beautiful', 'Many guests say that the lagoon looks strikingly beautiful at dawn.',
    {
      masteryContexts:[
        { text:'The villa has a stunning terrace overlooking the bay, with white stone floors and a pool the colour of the sky.', meaning:'extremely attractive and impressive to look at' },
        { text:'The island’s beaches are so stunning that they appear on the cover of almost every travel brochure.', meaning:'extremely beautiful and impressive to look at' }
      ],
      situationDistractors:[
        'The beach was littered with rubbish, and the sea smelt of oil.',
        'The hotel room was small and dark, with a window that faced a brick wall.',
        'The road to the village was muddy and full of holes.'
      ],
      retrievalContexts:[
        { id:'1', text:'The resort’s stunning beach, with its white sand and clear blue water, appears on posters all over the city.', target:'stunning', grammarPattern:'' },
        { id:'2', text:'The photographs of the lagoon were so stunning that the magazine used one on its front cover.', target:'stunning', grammarPattern:'' },
        { id:'3', text:'With its stunning mountain backdrop and its sparkling lake, the wedding venue is booked two years in advance.', target:'stunning', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'stunning', wrong:['muddy', 'polluted', 'dull'] },
        { id:'2', answer:'stunning', wrong:['faint', 'blurry', 'ordinary'] },
        { id:'3', answer:'stunning', wrong:['gloomy', 'plain', 'dull'] }
      ]
    }),
  e('popular', 'adjective',
    'liked or enjoyed by a large number of people',
    ['well-liked', 'favoured by many people'],
    ['known only to a small number of experts', 'available at a very low price', 'suitable for people of all ages'],
    'Tropical islands are popular destinations for honeymoon couples.',
    'well-liked', 'Tropical islands are well-liked destinations for honeymoon couples.',
    'favoured by many people', 'The old fishing village remains favoured by many people looking for a quiet weekend away.',
    {
      masteryContexts:[
        { text:'Cycling holidays have become very popular, and many hotels now offer secure places to keep bicycles.', meaning:'liked by many people' },
        { text:'The restaurant on the harbour is popular with both locals and tourists, so booking a table is essential.', meaning:'enjoyed by large numbers of people' }
      ],
      situationDistractors:[
        'The little museum was almost empty, and the guide had no one to talk to all afternoon.',
        'The visitors had to ask three people before anyone knew where the old castle was.',
        'The restaurant on the corner closed down after only two months.'
      ],
      retrievalContexts:[
        { id:'1', text:'In summer, the coastal path is so popular that walkers sometimes have to queue to cross the narrow bridges.', target:'popular', grammarPattern:'' },
        { id:'2', text:'The beach café is popular with local families, and every table is taken by noon.', target:'popular', grammarPattern:'' },
        { id:'3', text:'Hiking has become one of the most popular activities in the national park, because it is cheap, healthy and open to everyone.', target:'popular', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'popular', wrong:['quiet', 'empty', 'unknown'] },
        { id:'2', answer:'popular', wrong:['friendly', 'angry', 'familiar'] },
        { id:'3', answer:'popular', wrong:['dangerous', 'expensive', 'difficult'] }
      ]
    }),
  e('static', 'adjective',
    'staying in one place or position, without moving or changing',
    ['fixed', 'motionless'],
    ['carrying a small electric charge', 'moving smoothly from one place to another', 'changing quickly in size and shape'],
    'The film-maker used a static camera, so the picture of the harbour stayed the same from start to finish.',
    'fixed', 'The film-maker used a fixed camera, so the picture of the harbour stayed the same from start to finish.',
    'motionless', 'For the long exposure, she kept the camera perfectly motionless on a tripod.',
    {
      masteryContexts:[
        { text:'Wildlife photographers often use a static camera hidden in a tree, which films the same waterhole for weeks.', meaning:'staying in one fixed position and not moving' },
        { text:'Visitor numbers to the museum have remained static for three years, at about forty thousand a year.', meaning:'not changing or developing' }
      ],
      situationDistractors:[
        'The drone swooped over the beach, tilted and followed a surfer along the waves.',
        'Prices at the hotel rose twice in the same year, and visitors complained.',
        'The bus raced along the coast road, and the passengers were thrown from side to side.'
      ],
      retrievalContexts:[
        { id:'1', text:'The wildlife film uses a static camera, fixed to a post beside the waterhole, to record the animals for months.', target:'static', grammarPattern:'' },
        { id:'2', text:'Tourist numbers stayed static for five years, neither rising nor falling.', target:'static', grammarPattern:'' },
        { id:'3', text:'Many British families spend summer weekends in a static caravan on the coast, which stays on the same site all year.', target:'static', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'static', wrong:['wireless', 'portable', 'waterproof'] },
        { id:'2', answer:'static', wrong:['erratic', 'unstable', 'seasonal'] },
        { id:'3', answer:'static', wrong:['touring', 'mobile', 'folding'] }
      ]
    }),
  e('ground-level', 'adjective',
    'at or near the level of the ground, rather than high above it',
    ['taken from low down', 'shot from a low position'],
    ['covering the whole surface of the earth', 'taken from a high place such as a hill or tower', 'showing only plants and soil'],
    'Most of the pictures in the guidebook are ground-level, unlike the drone shots on the website.',
    'taken from low down', 'Most of the pictures in the guidebook are taken from low down, unlike the drone shots on the website.',
    'shot from a low position', 'Her best photographs were shot from a low position, which made the old walls look tall and strong.',
    {
      masteryContexts:[
        { text:'The ground-level view of the market shows the crowds, the colourful stalls and the faces of the sellers.', meaning:'seen from a low standing position, not from above' },
        { text:'Drone footage shows the whole island, while ground-level photographs show the details that visitors notice when they walk along the beach.', meaning:'taken from a low position near the earth' }
      ],
      situationDistractors:[
        'The helicopter rose above the valley, and the passengers photographed the river from the air.',
        'A drone flew over the lake and filmed the island from high above the trees.',
        'The tourists climbed to the top of the tower and looked down at the roofs of the old town.'
      ],
      retrievalContexts:[
        { id:'1', text:'The drone pictures are impressive, but the ground-level photographs show what a visitor really sees when walking through the gate.', target:'ground-level', grammarPattern:'' },
        { id:'2', text:'From this ground-level viewpoint, the old city walls look enormous, but from the air they seem low and thin.', target:'ground-level', grammarPattern:'' },
        { id:'3', text:'Beginners are advised to take ground-level shots first, standing on the path, before trying to photograph the valley from the cable car.', target:'ground-level', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'ground-level', wrong:['aerial', 'satellite', 'infrared'] },
        { id:'2', answer:'ground-level', wrong:['aerial', 'distant', 'satellite'] },
        { id:'3', answer:'ground-level', wrong:['aerial', 'overhead', 'elevated'] }
      ]
    }),
  e('angle of view', 'noun',
    'the width of the scene that a camera lens can capture',
    ['field of vision', 'width of the scene captured'],
    ['the tilt of the camera above the ground', 'the distance between a photographer and a subject', 'the number of pictures a camera can store'],
    'A wide angle of view lets the photographer fit the whole bay, the harbour and the mountains into a single picture.',
    'field of vision', 'A wide field of vision lets the photographer fit the whole bay, the harbour and the mountains into a single picture.',
    'width of the scene captured', 'Tourists with phones often forget that every lens affects the width of the scene captured.',
    {
      masteryContexts:[
        { text:'With a narrow angle of view, the lens shows only the statue’s face, not the square around it.', meaning:'the width of the scene that a camera lens can capture' },
        { text:'Guides at the viewpoint explain that a smartphone has a wider angle of view than a telephoto lens, so it can capture more of the valley.', meaning:'how much of a scene a lens can include' }
      ],
      situationDistractors:[
        'The photographer cleaned the lens with a soft cloth and put the camera back in its bag.',
        'A tour guide held up a map and pointed to the route that the coach would follow.',
        'The visitor bought a memory card and a spare battery at the airport shop.'
      ],
      retrievalContexts:[
        { id:'1', text:'To fit the whole mountain range into one picture, she switched to a lens with a much wider angle of view.', target:'angle of view', grammarPattern:'' },
        { id:'2', text:'A photographer chooses the angle of view according to how much of the scene he wants in the picture.', target:'angle of view', grammarPattern:'' },
        { id:'3', text:'The lens on the drone gives an angle of view of almost ninety degrees, so each photograph includes the entire beach.', target:'angle of view', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'angle of view', wrong:['shutter speed', 'battery life', 'memory capacity'] },
        { id:'2', answer:'angle of view', wrong:['price', 'weight', 'colour'] },
        { id:'3', answer:'angle of view', wrong:['aperture', 'altitude', 'exposure'] }
      ]
    }),
  e('ecological habitats', 'noun',
    'natural environments where particular plants and animals live and depend on one another',
    ['natural homes of wildlife', 'environments that support living things'],
    ['places where tourists stay close to nature', 'the study of how nature changes the weather', 'farms where animals are raised for food'],
    'Careless tourism can damage fragile ecological habitats such as wetlands and coral reefs.',
    'natural homes of wildlife', 'Careless tourism can damage fragile natural homes of wildlife such as wetlands and coral reefs.',
    'environments that support living things', 'Protected areas safeguard environments that support living things, from insects to large mammals.',
    {
      masteryContexts:[
        { text:'The nature reserve protects several ecological habitats, including a salt marsh, a pine forest and a freshwater lake.', meaning:'natural environments where plants and animals live together' },
        { text:'Rangers explain to visitors that walking off the path can harm the ecological habitats of insects and small plants.', meaning:'the natural homes of plants and animals' }
      ],
      situationDistractors:[
        'The hotel installed solar panels on its roof and a new heating system in the basement.',
        'Visitors paid an entrance fee at the gate and collected a map of the gardens.',
        'The coach company changed the departure time because of road works.'
      ],
      retrievalContexts:[
        { id:'1', text:'The reserve was created to protect rare ecological habitats, such as peat bogs and ancient woodland, from the effects of tourism.', target:'ecological habitats', grammarPattern:'' },
        { id:'2', text:'Scientists warn that building new resorts on the coast will destroy the ecological habitats on which turtles and seabirds depend.', target:'ecological habitats', grammarPattern:'' },
        { id:'3', text:'The guide stopped the group at the edge of the wetland and explained how the different ecological habitats support each other.', target:'ecological habitats', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'ecological habitats', wrong:['shopping centres', 'sports stadiums', 'industrial parks'] },
        { id:'2', answer:'ecological habitats', wrong:['fishing licences', 'tourist leaflets', 'holiday prices'] },
        { id:'3', answer:'ecological habitats', wrong:['souvenir shops', 'hotel rooms', 'bus routes'] }
      ]
    }),
  e('marine world', 'noun',
    'the sea and the plants and animals that live in it',
    ['life beneath the waves', 'the ocean and its creatures'],
    ['the ships and boats that travel on the sea', 'the sailors and fishermen who work at sea', 'the coastline and beaches next to the sea'],
    'The aquarium takes children on a journey through the marine world.',
    'life beneath the waves', 'The aquarium takes children on a journey through life beneath the waves.',
    'the ocean and its creatures', 'This programme introduces young viewers to the ocean and its creatures.',
    {
      masteryContexts:[
        { text:'The new aquarium lets children walk through a glass tunnel and see the marine world at close range.', meaning:'the sea and the animals and plants that live in it' },
        { text:'Divers returned from the expedition with new photographs of the marine world around the remote island.', meaning:'the underwater environment and its living things' }
      ],
      situationDistractors:[
        'The coach driver turned up the heating while the passengers slept in their seats.',
        'A group of walkers followed the path through the pine forest and stopped to eat lunch.',
        'Visitors sat on the terrace and watched the sun go down behind the hills.'
      ],
      retrievalContexts:[
        { id:'1', text:'The documentary invites viewers to explore the marine world, from tiny plankton to the largest whales.', target:'marine world', grammarPattern:'' },
        { id:'2', text:'Snorkellers at the reef can see colourful fish, turtles and rays, and many return home fascinated by the marine world.', target:'marine world', grammarPattern:'' },
        { id:'3', text:'Children at the seaside centre learn to protect the marine world by collecting plastic from the beach.', target:'marine world', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'marine world', wrong:['insect kingdom', 'desert landscape', 'mountain region'] },
        { id:'2', answer:'marine world', wrong:['city centre', 'farming year', 'royal court'] },
        { id:'3', answer:'marine world', wrong:['mountain forests', 'city parks', 'desert plants'] }
      ]
    }),
  e('coral', 'noun',
    'a hard, often colourful material made by tiny sea animals, which forms reefs in warm seas',
    ['rock-like growth made by tiny sea animals', 'colourful material that forms reefs'],
    ['a smooth round stone found on sandy beaches', 'a green plant that grows on the sea floor', 'a hard shell that protects small shellfish'],
    'Many tourists visit the island to swim among tropical fish and see the coral.',
    'rock-like growth made by tiny sea animals', 'Many tourists visit the island to swim among tropical fish and see the rock-like growth made by tiny sea animals.',
    'colourful material that forms reefs', 'Boat anchors can break the colourful material that forms reefs, so visitors must use the mooring buoys.',
    {
      masteryContexts:[
        { text:'Snorkellers are asked to keep their fins away from the coral, which can take years to grow back if it is broken.', meaning:'the hard, colourful material made by tiny sea animals' },
        { text:'Parts of the reef have turned white because the warm water is killing the coral.', meaning:'the rock-like material that forms reefs in warm seas' }
      ],
      situationDistractors:[
        'The bakery near the harbour sells warm bread and pastries from six o’clock every morning.',
        'The ski lift carried the guests up the snowy slope in under ten minutes.',
        'A street musician played the violin outside the cathedral while crowds took photographs.'
      ],
      retrievalContexts:[
        { id:'1', text:'The glass-bottomed boat floats above a reef where the coral glows pink and orange in the sunlight.', target:'coral', grammarPattern:'' },
        { id:'2', text:'Careless divers can easily damage the coral by touching it or kicking it with their fins.', target:'coral', grammarPattern:'' },
        { id:'3', text:'The beach is made of white sand, but just offshore the sea floor is covered in living coral.', target:'coral', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'coral', wrong:['gravel', 'timber', 'concrete'] },
        { id:'2', answer:'coral', wrong:['boat', 'pier', 'jetty'] },
        { id:'3', answer:'coral', wrong:['stones', 'sand', 'mud'] }
      ]
    }),
  e('spellbound', 'adjective',
    'completely fascinated by something, so that you cannot look away',
    ['completely fascinated', 'too fascinated to look away'],
    ['mildly interested in something', 'very afraid of something', 'too tired to pay attention'],
    'The children sat spellbound while the old fisherman described the storm.',
    'completely fascinated', 'The children sat completely fascinated while the old fisherman described the storm.',
    'too fascinated to look away', 'The tourists on the boat were too fascinated to look away as a whale rose beside them.',
    {
      masteryContexts:[
        { text:'The audience sat spellbound as the dancers moved across the stage in the old temple courtyard.', meaning:'completely fascinated and unable to look away' },
        { text:'Visitors stood spellbound at the cave entrance, watching thousands of bats pour into the evening sky.', meaning:'so amazed that they paid full attention' }
      ],
      situationDistractors:[
        'The passengers yawned and checked their watches during the long delay at the departure gate.',
        'Some guests complained that the buffet was cold and the service was slow.',
        'The coach stopped at a petrol station so that everyone could buy snacks.'
      ],
      retrievalContexts:[
        { id:'1', text:'When the magician pulled a coin from behind the child’s ear, the whole family watched spellbound.', target:'spellbound', grammarPattern:'' },
        { id:'2', text:'The guests around the camp fire were so spellbound by the legend of the lost city that nobody wanted to go to bed.', target:'spellbound', grammarPattern:'' },
        { id:'3', text:'Visitors who watched the sky turn pink above the glacier stood spellbound for several minutes without speaking.', target:'spellbound', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'spellbound', wrong:['unimpressed', 'sleepy', 'embarrassed'] },
        { id:'2', answer:'spellbound', wrong:['bored', 'annoyed', 'unaffected'] },
        { id:'3', answer:'spellbound', wrong:['impatient', 'disappointed', 'furious'] }
      ]
    }),
  e('wildlife', 'noun',
    'the animals and plants that live naturally in the wild, not looked after by people',
    ['animals and plants living freely in nature', 'creatures that live free in nature'],
    ['animals kept in a zoo for visitors to look at', 'the farm animals that provide food for people', 'the pets that families take on holiday'],
    'Visitors to the reserve are asked to keep their distance from the wildlife.',
    'animals and plants living freely in nature', 'Visitors to the reserve are asked to keep their distance from the animals and plants living freely in nature.',
    'creatures that live free in nature', 'The photographer spent a month filming creatures that live free in nature in the mountains of Nepal.',
    {
      masteryContexts:[
        { text:'The nature reserve is famous for its wildlife, including elephants, giraffes and over three hundred species of birds.', meaning:'the animals and plants living freely in nature' },
        { text:'Rangers say that noise from tourist boats can frighten the wildlife and make animals leave their nests and feeding areas.', meaning:'the free-living creatures and plants of the area' }
      ],
      situationDistractors:[
        'The hotel pool was cleaned every morning before the guests came down for breakfast.',
        'We spent the afternoon queueing at passport control with our suitcases.',
        'A guide in a velvet jacket showed the group around the ballroom of the old palace.'
      ],
      retrievalContexts:[
        { id:'1', text:'Guests at the safari lodge sit on the veranda at dusk and watch the wildlife coming down to the waterhole.', target:'wildlife', grammarPattern:'' },
        { id:'2', text:'Because the island has no predators, its wildlife is unafraid of humans, and birds will land on your hand.', target:'wildlife', grammarPattern:'' },
        { id:'3', text:'Rangers counted more than forty species of mammal, bird and reptile, which shows how rich the wildlife of the national park is.', target:'wildlife', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'wildlife', wrong:['traffic', 'shopping', 'furniture'] },
        { id:'2', answer:'wildlife', wrong:['scenery', 'weather', 'transport'] },
        { id:'3', answer:'wildlife', wrong:['history', 'architecture', 'cuisine'] }
      ]
    }),
  e('preservation', 'noun',
    'the act of protecting something so that it is not damaged, lost or destroyed',
    ['protection from damage and loss', 'care and protection'],
    ['the work of making something look new again', 'the study of old objects and buildings', 'the decision to remove something permanently'],
    'Without regular preservation, the ancient temple will slowly fall apart.',
    'protection from damage and loss', 'Without regular protection from damage and loss, the ancient temple will slowly fall apart.',
    'care and protection', 'The museum spends most of its money on the care and protection of rare documents.',
    {
      masteryContexts:[
        { text:'Funding for the preservation of the rainforest comes from entrance fees paid by tourists.', meaning:'the act of protecting something so that it is not harmed or lost' },
        { text:'Tour guides explain that the preservation of the old town walls depends on limiting the number of visitors each day.', meaning:'the work of keeping something safe from damage' }
      ],
      situationDistractors:[
        'The sightseeing boat left the pier at ten o’clock and returned in the late afternoon.',
        'Tourists queued to buy tickets for the evening concert in the main square.',
        'The airline changed the departure time, so the family had to rebook their taxi.'
      ],
      retrievalContexts:[
        { id:'1', text:'The charity spends all of its income on the preservation of the castle, because the roof and the walls are in danger of falling down.', target:'preservation', grammarPattern:'' },
        { id:'2', text:'Many islanders believe that the preservation of their traditional way of life matters more than the money tourists bring.', target:'preservation', grammarPattern:'' },
        { id:'3', text:'Some scientists argue that the preservation of coral reefs is more urgent than the building of new hotels.', target:'preservation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'preservation', wrong:['advertising', 'decoration', 'sale'] },
        { id:'2', answer:'preservation', wrong:['abandonment', 'criticism', 'invention'] },
        { id:'3', answer:'preservation', wrong:['advertising', 'sale', 'transport'] }
      ]
    }),
  e('environmental impact', 'noun',
    'the effect that a person, a business or an activity has on nature and the natural world',
    ['effect on the natural world', 'consequences for nature'],
    ['the profit that a business makes from visitors', 'the number of tourists who visit a place each year', 'the change in weather from one season to the next'],
    'Cruise ships bring money to the port, but their environmental impact is a growing concern.',
    'effect on the natural world', 'Cruise ships bring money to the port, but their effect on the natural world is a growing concern.',
    'consequences for nature', 'The new airport will have serious consequences for nature on the island.',
    {
      masteryContexts:[
        { text:'Before the hotel was approved, an independent report studied its environmental impact on the beach and the nearby wetlands.', meaning:'the effect that an activity has on nature and the natural world' },
        { text:'Using solar panels and recycling water helps the resort to reduce its environmental impact.', meaning:'the way that its activities affect nature and natural resources' }
      ],
      situationDistractors:[
        'The tour operator printed a new brochure with photographs of the harbour at night.',
        'Prices for rooms rise sharply during the school holidays, especially in August.',
        'The conductor checked each ticket and then walked to the next carriage.'
      ],
      retrievalContexts:[
        { id:'1', text:'The council asked the developers to study the likely environmental impact of the new marina on the fish and birds in the bay.', target:'environmental impact', grammarPattern:'' },
        { id:'2', text:'Flying is cheap and fast, but its environmental impact in terms of pollution and carbon dioxide is much greater than that of travelling by train.', target:'environmental impact', grammarPattern:'' },
        { id:'3', text:'Visitors can reduce their environmental impact by refusing single-use plastic and by walking instead of taking taxis.', target:'environmental impact', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'environmental impact', wrong:['building cost', 'ticket price', 'opening time'] },
        { id:'2', answer:'environmental impact', wrong:['popularity', 'comfort', 'speed'] },
        { id:'3', answer:'environmental impact', wrong:['waiting time', 'language barrier', 'luggage weight'] }
      ]
    }),
  e('journey', 'noun',
    'the act of travelling from one place to another, especially over a long distance',
    ['trip between two places', 'time spent getting to a destination'],
    ['a short walk around the local area', 'the place where travellers arrive', 'the money paid for a ticket'],
    'It was a long journey, but the views from the train window made it worthwhile.',
    'trip between two places', 'It was a long trip between two places, but the views from the train window made it worthwhile.',
    'time spent getting to a destination', 'The time spent getting to a destination is tiring after a night flight, so book a quiet room.',
    {
      masteryContexts:[
        { text:'The journey across the desert by camel took three days, with only one stop for water.', meaning:'the act of going from one place to another over a long distance' },
        { text:'After a long journey by overnight train, the group checked into their rooms and slept until noon.', meaning:'a trip between two places that takes some time' }
      ],
      situationDistractors:[
        'The hotel receptionist gave the family a map and told them where the nearest pharmacy was.',
        'The waiters carried trays of grilled fish to the tables on the terrace.',
        'Several guests stayed on the beach to watch the sun set over the water.'
      ],
      retrievalContexts:[
        { id:'1', text:'The journey from London to Edinburgh takes about four and a half hours by train.', target:'journey', grammarPattern:'' },
        { id:'2', text:'We stopped for lunch halfway through our journey, at a small restaurant beside the river.', target:'journey', grammarPattern:'' },
        { id:'3', text:'Passengers on the night ferry were exhausted at the end of the journey because the sea had been rough all night.', target:'journey', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'journey', wrong:['flight', 'ferry crossing', 'coach ride'] },
        { id:'2', answer:'journey', wrong:['film', 'lesson', 'concert'] },
        { id:'3', answer:'journey', wrong:['concert', 'lecture', 'match'] }
      ]
    }),
  e('licence', 'noun',
    'an official document that gives you permission to do, use or own something',
    ['official document giving permission', 'written permission from the authorities'],
    ['a list of the rules for visitors to follow', 'a payment made to the government each year', 'a certificate given to someone who finishes a course'],
    'Visitors need a licence to fish in the lake.',
    'official document giving permission', 'Visitors need an official document giving permission to fish in the lake.',
    'written permission from the authorities', 'Boat operators must carry written permission from the authorities before taking tourists to the reef.',
    {
      teacherNote:'British spelling: licence is the noun; license is the verb (and the American noun spelling). Unit 5 teaches the noun only.',
      masteryContexts:[
        { text:'Tour operators must apply to the government for a licence before they can take visitors into the national park.', meaning:'an official document that gives permission to do something' },
        { text:'The fishing guide showed us her licence, which proved that she was allowed to take visitors onto the lake.', meaning:'an official card that shows someone has permission to do a job' }
      ],
      situationDistractors:[
        'The guesthouse owner served tea and warm bread on the sunny balcony.',
        'The brochure described a walk through the flower fields in spring.',
        'By nine o’clock the beach was crowded with families and umbrellas.'
      ],
      retrievalContexts:[
        { id:'1', text:'Anyone who wants to run a boat trip around the bay needs a licence from the harbour authority.', target:'licence', grammarPattern:'' },
        { id:'2', text:'You must show your driving licence when you collect the hire car, and the clerk will photocopy it.', target:'licence', grammarPattern:'' },
        { id:'3', text:'The café was closed by the council because its owner had no licence to sell alcohol.', target:'licence', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'licence', wrong:['guidebook', 'torch', 'suitcase'] },
        { id:'2', answer:'licence', wrong:['lesson', 'mirror', 'instructor'] },
        { id:'3', answer:'licence', wrong:['profit', 'customers', 'supplies'] }
      ]
    }),
  e('offer', 'noun',
    'a special deal or reduced price that a business advertises to attract customers',
    ['cut-price deal', 'bargain package'],
    ['a payment returned to a customer after a cancellation', 'a request for a customer to pay more', 'a booking that has been confirmed in writing'],
    'The travel agency has a new offer on winter holidays in the Alps.',
    'cut-price deal', 'The travel agency has a new cut-price deal on winter holidays in the Alps.',
    'bargain package', 'The airline has launched a bargain package for customers who book before March.',
    {
      teacherNote:'Noun sense only: a special deal advertised to customers. The verb “to offer” is not taught in this item.',
      masteryContexts:[
        { text:'The ski resort has a special offer for families: children under twelve stay and eat for free.', meaning:'a deal that a business advertises to attract customers, often at a lower price' },
        { text:'Tourists who book before January can take advantage of an offer that includes flights, three nights in a hotel and a free city walk.', meaning:'a special package or lower price available for a limited time' }
      ],
      situationDistractors:[
        'The ferry was delayed for an hour because of fog in the channel.',
        'Hikers set off at dawn so that they could reach the summit before the clouds came in.',
        'The cathedral was built in the twelfth century and has a tower that visitors can climb.'
      ],
      retrievalContexts:[
        { id:'1', text:'The airline is running a special offer this month: return flights to Madrid are half price if you book online.', target:'offer', grammarPattern:'' },
        { id:'2', text:'Customers who accept the offer by Friday will get a free room upgrade.', target:'offer', grammarPattern:'' },
        { id:'3', text:'The best offer in the brochure is seven nights in Greece for the price of five.', target:'offer', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'offer', wrong:['delay', 'route', 'warning'] },
        { id:'2', answer:'offer', wrong:['apology', 'warning', 'complaint'] },
        { id:'3', answer:'offer', wrong:['hotel', 'island', 'photograph'] }
      ]
    }),
  e('guided tour', 'noun',
    'an organised visit in which an expert leads a group and explains the sights',
    ['expert-led visit', 'organised visit with a leader'],
    ['a trip that you plan and make alone', 'a lesson about a place given in a classroom', 'a short visit to the shops near your hotel'],
    'On the first morning, we joined a guided tour around the old fortress.',
    'expert-led visit', 'On the first morning, we joined an expert-led visit around the old fortress.',
    'organised visit with a leader', 'The price includes an organised visit with a leader to the old market.',
    {
      masteryContexts:[
        { text:'The guided tour of the cathedral starts every hour and includes a climb to the top of the tower.', meaning:'an organised visit in which an expert leads you and explains what you see' },
        { text:'Because the caves are dark and the paths are narrow, visitors can enter only on a guided tour.', meaning:'a visit led by someone who knows the place well' }
      ],
      situationDistractors:[
        'Hikers who ignored the weather warning had to be rescued from the mountain.',
        'The tourists wandered through the village without a map, looking at whatever interested them.',
        'She spent the afternoon on her own, reading a novel on the hotel balcony.'
      ],
      retrievalContexts:[
        { id:'1', text:'We booked a guided tour of the old quarter, and our leader pointed out buildings that we would never have noticed alone.', target:'guided tour', grammarPattern:'' },
        { id:'2', text:'Everyone on the guided tour stopped outside the temple while the leader explained that it had been rebuilt twice after fires.', target:'guided tour', grammarPattern:'' },
        { id:'3', text:'Tickets for the guided tour cost fifteen pounds, but the audio headset is free.', target:'guided tour', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'guided tour', wrong:['free map', 'bus ticket', 'shopping trip'] },
        { id:'2', answer:'guided tour', wrong:['night flight', 'airport shuttle', 'cable car'] },
        { id:'3', answer:'guided tour', wrong:['airport shuttle', 'night flight', 'ferry crossing'] }
      ]
    }),
  e('travel assistant', 'noun',
    'a person whose job is to help customers plan and book trips and holidays',
    ['employee who helps customers plan holidays', 'person who arranges trips for clients'],
    ['a person who drives a coach full of holidaymakers', 'a person who cleans the rooms in a hotel', 'a person who checks passports at an airport border'],
    'Her first job after college was as a travel assistant, answering questions and booking flights.',
    'employee who helps customers plan holidays', 'Her first job after college was as an employee who helps customers plan holidays, answering questions and booking flights.',
    'person who arranges trips for clients', 'The company is looking for a person who arranges trips for clients to work in its busy office.',
    {
      teacherNote:'The source labels this a job title; the lexical target is the plain phrase “travel assistant”.',
      masteryContexts:[
        { text:'The travel assistant at the agency suggested a cheaper flight and helped us fill in the visa form.', meaning:'an employee whose job is to help customers plan and book their holidays' },
        { text:'After training as a travel assistant, Marta spent two summers working at a resort, answering guests’ questions and arranging excursions.', meaning:'a worker who helps holidaymakers organise their trips' }
      ],
      situationDistractors:[
        'The customs officer asked the passenger to open her bag and show what was inside.',
        'Rain began just as the guests sat down to eat on the terrace.',
        'The runners crossed the finishing line in front of the cathedral and were handed medals.'
      ],
      retrievalContexts:[
        { id:'1', text:'I was quite nervous before my first day as a travel assistant, but my supervisor explained how the booking system worked.', target:'travel assistant', grammarPattern:'' },
        { id:'2', text:'If you cannot decide between the two islands, ask the travel assistant at the agency, because she can compare prices and suggest routes.', target:'travel assistant', grammarPattern:'' },
        { id:'3', text:'A good travel assistant needs to be patient, well organised and excellent at working out the cheapest routes for customers.', target:'travel assistant', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'travel assistant', wrong:['hotel porter', 'coach driver', 'ticket inspector'] },
        { id:'2', answer:'travel assistant', wrong:['pilot', 'lifeguard', 'chef'] },
        { id:'3', answer:'travel assistant', wrong:['chef', 'lifeguard', 'pilot'] }
      ]
    }),
  e('tourism industry', 'noun',
    'all the businesses and services that provide for people who travel for holidays, such as airlines, tour companies and restaurants',
    ['businesses that serve holidaymakers', 'the business of looking after holidaymakers'],
    ['the factories that make goods to sell in other countries', 'the study of old buildings and monuments in a country', 'the government offices that give passports to travellers'],
    'The tourism industry employs one in ten workers in the country, from cleaners to pilots.',
    'businesses that serve holidaymakers', 'The businesses that serve holidaymakers employ one in ten workers in the country, from cleaners to pilots.',
    'the business of looking after holidaymakers', 'Many students hope to build a career in the business of looking after holidaymakers, perhaps as a tour guide.',
    {
      masteryContexts:[
        { text:'Cheap flights and online booking helped the tourism industry to recover quickly after the storm.', meaning:'all the businesses and services that provide for people on holiday' },
        { text:'In small island economies the tourism industry is often the biggest source of jobs, and it can disappear almost overnight if visitors stop coming.', meaning:'the businesses and services connected with people who travel for pleasure' }
      ],
      situationDistractors:[
        'The village baker gets up at four o’clock every morning to make bread for the shop.',
        'Farmers on the plain were waiting for rain to water their wheat fields.',
        'The new factory produces thousands of bicycle frames every week.'
      ],
      retrievalContexts:[
        { id:'1', text:'Airlines, restaurants, coach firms and tour companies all belong to the tourism industry, which provides millions of jobs worldwide.', target:'tourism industry', grammarPattern:'' },
        { id:'2', text:'When the borders closed, the tourism industry lost almost all of its customers, and thousands of guides and drivers lost their jobs.', target:'tourism industry', grammarPattern:'' },
        { id:'3', text:'A degree in hospitality management can lead to a career in the tourism industry, perhaps as a hotel manager or a travel agent.', target:'tourism industry', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'tourism industry', wrong:['fishing industry', 'car industry', 'film industry'] },
        { id:'2', answer:'tourism industry', wrong:['steel industry', 'farming industry', 'banking industry'] },
        { id:'3', answer:'tourism industry', wrong:['mining industry', 'textile industry', 'publishing industry'] }
      ]
    }),
  e('exploring', 'noun',
    'the activity of travelling around a place or looking at it carefully in order to discover more about it',
    ['discovering new places', 'finding out about a place by travelling around it'],
    ['the activity of packing bags before a long trip', 'the activity of buying souvenirs in local markets', 'the activity of waiting for transport at a station'],
    'For me, exploring is the best part of a holiday, because I love finding streets that are not in the guidebooks.',
    'discovering new places', 'For me, discovering new places is the best part of a holiday, because I love finding streets that are not in the guidebooks.',
    'finding out about a place by travelling around it', 'Part of the school trip is spent finding out about a place by travelling around it.',
    {
      teacherNote:'Topic-specific noun (gerund): the activity of travelling around a place to discover it. Related forms (explore, explorer, exploration) are the word family.',
      masteryContexts:[
        { text:'On the second day, the group left the camp and spent hours exploring the valley and its hidden waterfalls.', meaning:'travelling around a place to find out what it is like' },
        { text:'The brochure promises plenty of time for exploring the ancient ruins at your own pace.', meaning:'walking and looking around a place to discover more about it' }
      ],
      situationDistractors:[
        'The family stayed in their apartment all day and watched films because of the heavy rain.',
        'The ticket inspector walked down the aisle and punched a hole in every ticket.',
        'Customers waited in a long queue to pay for their groceries at the supermarket.'
      ],
      retrievalContexts:[
        { id:'1', text:'The best way to enjoy the old city is by exploring its narrow streets on foot, without a map.', target:'exploring', grammarPattern:'' },
        { id:'2', text:'Children on the nature course spend their mornings exploring the forest and writing down what they find.', target:'exploring', grammarPattern:'' },
        { id:'3', text:'After a week of exploring the islands by boat, the travellers knew every bay and village.', target:'exploring', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'exploring', wrong:['avoiding', 'cleaning', 'measuring'] },
        { id:'2', answer:'exploring', wrong:['guarding', 'cutting', 'fencing'] },
        { id:'3', answer:'exploring', wrong:['leaving', 'warning', 'cleaning'] }
      ]
    }),
  e('observation', 'noun',
    'the act of watching someone or something carefully in order to learn about it',
    ['careful watching', 'close and patient watching'],
    ['a written report on the weather in a region', 'a short talk given to a group of visitors', 'a form that visitors must complete at a border'],
    'Several weeks of observation showed that the birds return to the same nests every spring.',
    'careful watching', 'Several weeks of careful watching showed that the birds return to the same nests every spring.',
    'close and patient watching', 'The expedition’s findings are based on close and patient watching of the glacier over three winters.',
    {
      masteryContexts:[
        { text:'Whale watchers rely on observation, because the animals stay on the surface for only a few seconds at a time.', meaning:'the act of watching something carefully in order to learn about it' },
        { text:'The students’ observation of the village market over three mornings showed which stalls sold most to visitors.', meaning:'the careful watching of people or events to learn something' }
      ],
      situationDistractors:[
        'The children played football in the square until it got dark.',
        'Passengers chatted loudly and ate snacks during the bus ride.',
        'The chef added garlic and chilli to the sauce and stirred it slowly.'
      ],
      retrievalContexts:[
        { id:'1', text:'The researchers did not touch the nests; their findings were based entirely on observation from a hide.', target:'observation', grammarPattern:'' },
        { id:'2', text:'Good guides know that careful observation of the weather is part of keeping visitors safe in the mountains.', target:'observation', grammarPattern:'' },
        { id:'3', text:'During a nature trip, a notebook and binoculars are the most useful tools for observation.', target:'observation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'observation', wrong:['interviews', 'experiments', 'questionnaires'] },
        { id:'2', answer:'observation', wrong:['invention', 'decoration', 'punishment'] },
        { id:'3', answer:'observation', wrong:['gardening', 'cooking', 'shopping'] }
      ]
    }),
  e('relaxation', 'noun',
    'the state of resting and feeling calm, free from worry or stress',
    ['rest and freedom from stress', 'calm time without worry'],
    ['physical exercise that keeps the body fit', 'a group activity that needs a lot of energy', 'a short period of work between two meetings'],
    'Many people book a week at a quiet lakeside cabin in search of relaxation after a busy year at work.',
    'rest and freedom from stress', 'Many people book a week at a quiet lakeside cabin in search of rest and freedom from stress after a busy year at work.',
    'calm time without worry', 'The spa garden gives guests an hour of calm time without worry after a hard week.',
    {
      masteryContexts:[
        { text:'After the hiking trip, the guests spent a day of complete relaxation, reading and sleeping in the garden of the farmhouse.', meaning:'the state of resting and feeling calm, without worry' },
        { text:'Some travellers prefer adventure, but others choose a holiday that is all about relaxation, with massage, yoga and long, slow meals.', meaning:'rest and freedom from stress or hard work' }
      ],
      situationDistractors:[
        'The tour leader hurried from room to room, handing out keys and answering twenty questions at once.',
        'The kitchen staff rushed to prepare two hundred meals before the wedding party arrived.',
        'The climbers tied their ropes and checked each other’s equipment before the steep ascent.'
      ],
      retrievalContexts:[
        { id:'1', text:'Teachers who need a break from their students often choose a holiday of relaxation, with no timetable and no alarm clock.', target:'relaxation', grammarPattern:'' },
        { id:'2', text:'The riverside garden has hammocks, soft music and shady trees, so it is a perfect place for relaxation.', target:'relaxation', grammarPattern:'' },
        { id:'3', text:'Doctors say that regular relaxation is as important for health as good food and enough sleep.', target:'relaxation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'relaxation', wrong:['competition', 'training', 'examination'] },
        { id:'2', answer:'relaxation', wrong:['construction', 'repair', 'navigation'] },
        { id:'3', answer:'relaxation', wrong:['punishment', 'pollution', 'taxation'] }
      ]
    }),
  e('adventurous activities', 'noun',
    'exciting things to do that involve challenge and some risk, such as climbing or white-water rafting',
    ['exciting things to do that involve some risk', 'thrilling outdoor pursuits'],
    ['quiet pastimes that people do indoors in the evening', 'guided visits to museums and historic buildings', 'relaxing treatments such as massage and yoga'],
    'The mountain resort is best known for its adventurous activities, including rock climbing, rafting and zip-lining.',
    'exciting things to do that involve some risk', 'The mountain resort is best known for its exciting things to do that involve some risk, including rock climbing, rafting and zip-lining.',
    'thrilling outdoor pursuits', 'The youth camp specialises in thrilling outdoor pursuits such as canoeing and abseiling.',
    {
      teacherNote:'The phrase names exciting things to do (plural noun phrase). It is not the adjective “adventurous” used for a person, which is taught earlier in the unit.',
      masteryContexts:[
        { text:'Teenagers on the summer programme can choose between sailing, abseiling and other adventurous activities.', meaning:'exciting things to do that involve challenge and some risk' },
        { text:'Insurance for adventurous activities costs more, because accidents are more likely when people climb, jump or race down rivers.', meaning:'sports and pastimes that are exciting and a little dangerous' }
      ],
      situationDistractors:[
        'Guests sat quietly in the library and read magazines in comfortable armchairs.',
        'The class painted watercolours of the village church while sitting on folding stools.',
        'Retired visitors strolled slowly along the flat promenade and stopped for tea.'
      ],
      retrievalContexts:[
        { id:'1', text:'The holiday camp organises adventurous activities such as rock climbing, canoeing and zip-lining for teenagers.', target:'adventurous activities', grammarPattern:'' },
        { id:'2', text:'Parents should check the safety rules before their children join adventurous activities like white-water rafting.', target:'adventurous activities', grammarPattern:'' },
        { id:'3', text:'Because of the danger, you must be over sixteen to take part in the adventurous activities at the outdoor centre.', target:'adventurous activities', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'adventurous activities', wrong:['cooking lessons', 'language classes', 'quiet games'] },
        { id:'2', answer:'adventurous activities', wrong:['reading groups', 'art lessons', 'music clubs'] },
        { id:'3', answer:'adventurous activities', wrong:['cookery classes', 'painting sessions', 'story hours'] }
      ]
    }),
  e('memorable', 'adjective',
    'special or unusual in a way that makes you remember it for a long time',
    ['worth remembering', 'easy to remember because it is special'],
    ['likely to be forgotten quickly', 'too expensive for most people', 'difficult to find without a guide'],
    'Our trip to the volcano was memorable, so we still talk about it every year.',
    'worth remembering', 'Our trip to the volcano was worth remembering, so we still talk about it every year.',
    'easy to remember because it is special', 'Anything that is easy to remember because it is special deserves a place in your holiday diary.',
    {
      masteryContexts:[
        { text:'The cooking lesson with a local family was the most memorable part of our week in Thailand.', meaning:'so special that you remember it for a long time' },
        { text:'The guides made her birthday memorable by lighting a campfire and singing in three languages.', meaning:'special enough to be remembered for a long time' }
      ],
      situationDistractors:[
        'The journey passed without anything unusual happening, and nobody could say afterwards what they had seen.',
        'The meal was cold and plain, and the guests forgot it by the next morning.',
        'Nothing special happened during the lecture, and most listeners left early.'
      ],
      retrievalContexts:[
        { id:'1', text:'Sleeping in a snow hole under the stars was the most memorable night of my life.', target:'memorable', grammarPattern:'' },
        { id:'2', text:'The guide told such a funny story about the castle that the visit became memorable for every child in the group.', target:'memorable', grammarPattern:'' },
        { id:'3', text:'Their wedding photographs show a memorable day, full of laughter, music and old friends.', target:'memorable', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'memorable', wrong:['crowded', 'expensive', 'predictable'] },
        { id:'2', answer:'memorable', wrong:['expensive', 'unnecessary', 'dangerous'] },
        { id:'3', answer:'memorable', wrong:['tiring', 'dull', 'quiet'] }
      ]
    }),
  e('recommendation', 'noun',
    'a suggestion, based on experience, that a place, service or choice is good and worth choosing',
    ['advice about what to choose', 'a suggestion about the best choice'],
    ['a poster that persuades people to visit a place', 'a complaint about poor service at a restaurant', 'a list of prices for rooms and meals'],
    'Before booking the cruise, read the reviews and ask your friends for a recommendation.',
    'advice about what to choose', 'Before booking the cruise, read the reviews and ask your friends for advice about what to choose.',
    'a suggestion about the best choice', 'The woman at the information desk gave us a suggestion about the best choice for a rainy day.',
    {
      idKey:'recommendation_5',
      teacherNote:'Unit 5 item (recommendation_5): advice from someone with experience that a place or service is worth choosing (not an advertisement). Unit 3 vocab_recommendation is a separate item that shares only the lexical spelling list.',
      masteryContexts:[
        { text:'Our host’s recommendation for a family-run café turned out to be the best meal of the trip.', meaning:'a suggestion from someone with experience that something is good and worth choosing' },
        { text:'Online reviews are useful, but many travellers still prefer a personal recommendation from someone they know.', meaning:'advice from a person who says that something is worth choosing' }
      ],
      situationDistractors:[
        'The receptionist asked guests to hand in their keys before they left the building.',
        'The cyclist repaired a puncture at the side of the mountain road.',
        'The museum closes at five on weekdays and at three on Sundays.'
      ],
      retrievalContexts:[
        { id:'1', text:'If you are visiting Kyoto for the first time, ask the owner of your guesthouse for a recommendation about the best temples to see.', target:'recommendation', grammarPattern:'' },
        { id:'2', text:'The restaurant was almost empty until a well-known critic wrote a positive recommendation of its seafood, and then every table was booked.', target:'recommendation', grammarPattern:'' },
        { id:'3', text:'Many travellers trust the recommendation of a friend more than any advertisement in a magazine.', target:'recommendation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'recommendation', wrong:['complaint', 'receipt', 'timetable'] },
        { id:'2', answer:'recommendation', wrong:['photograph', 'menu', 'delivery'] },
        { id:'3', answer:'recommendation', wrong:['punishment', 'payment', 'arrival'] }
      ]
    }),
  e('reservation', 'noun',
    'an arrangement to have a room, a table or a seat kept for you until you arrive',
    ['advance booking', 'booking made before you arrive'],
    ['a message that confirms that a payment has been received', 'a list of the rooms that are still empty', 'a card that opens the door of a room'],
    'I made a reservation for a table for six at the mountain restaurant.',
    'advance booking', 'I made an advance booking for a table for six at the mountain restaurant.',
    'booking made before you arrive', 'A booking made before you arrive guarantees a bed on the busiest weekends.',
    {
      teacherNote:'Tourism/booking sense only: a place, room or table kept for you in advance. Not the “doubt” sense or a nature reserve.',
      masteryContexts:[
        { text:'Without a reservation, you may not find a table at the lakeside restaurant on a Saturday night.', meaning:'an arrangement to have a table kept for you' },
        { text:'The family cancelled their reservation two days before the festival because the baby was ill.', meaning:'a room or place that has been kept for someone in advance' }
      ],
      situationDistractors:[
        'The guide handed out maps and pointed to the best viewing platform.',
        'The shop assistant gave the customer a receipt, and the customer put it in a pocket.',
        'Walkers rested on the hillside and ate sandwiches in the sunshine.'
      ],
      retrievalContexts:[
        { id:'1', text:'It is wise to make a reservation for the ferry in July, because every crossing is full in the school holidays.', target:'reservation', grammarPattern:'' },
        { id:'2', text:'I rang the campsite to change the dates on my reservation, but the manager said that the weekend was already full.', target:'reservation', grammarPattern:'' },
        { id:'3', text:'You can keep your reservation until six o’clock; after that, the restaurant gives the table to other customers.', target:'reservation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'reservation', wrong:['complaint', 'donation', 'suggestion'] },
        { id:'2', answer:'reservation', wrong:['tent', 'map', 'torch'] },
        { id:'3', answer:'reservation', wrong:['umbrella', 'jacket', 'menu'] }
      ]
    }),
  e('destination', 'noun',
    'a place that people travel to for a holiday, a visit or a particular activity',
    ['holiday spot', 'place you are travelling to'],
    ['the long trip that leads to a place', 'the company that arranges a holiday', 'the date on which a holiday begins'],
    'Many travel writers rank Costa Rica as the top destination for anyone who loves rainforests.',
    'holiday spot', 'Many travel writers rank Costa Rica as the top holiday spot for anyone who loves rainforests.',
    'place you are travelling to', 'Always check the weather in the place you are travelling to before you pack.',
    {
      idKey:'destination_5',
      teacherNote:'Unit 5 item (destination_5): a place that people travel to for a holiday or a visit. Unit 4 vocab_destination is a separate item that shares only the lexical spelling list.',
      masteryContexts:[
        { text:'The ferry slowed as it approached the island, and the passengers gathered at the rail to see their destination at last.', meaning:'the place that someone is travelling to' },
        { text:'Patagonia is a dream destination for walkers who want empty trails and enormous mountains.', meaning:'a place that people choose to visit for a holiday' }
      ],
      situationDistractors:[
        'The driver stopped for petrol and checked the oil before continuing down the motorway.',
        'The conductor announced that the train would be forty minutes late because of a signal failure.',
        'Rain drummed on the tent all night, and nobody slept well.'
      ],
      retrievalContexts:[
        { id:'1', text:'Our holiday destination was decided in minutes, because everyone wanted to see the northern lights.', target:'destination', grammarPattern:'' },
        { id:'2', text:'The tour guide asked the passengers to stay in their seats until the bus had reached its final destination.', target:'destination', grammarPattern:'' },
        { id:'3', text:'Safety is the first thing many parents consider when choosing a family destination.', target:'destination', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'destination', wrong:['budget', 'insurance', 'timetable'] },
        { id:'2', answer:'destination', wrong:['payment', 'speed', 'repair'] },
        { id:'3', answer:'destination', wrong:['umbrella', 'sandwich', 'calendar'] }
      ]
    }),
  e('availability', 'noun',
    'whether rooms, tickets or places are free and can be booked',
    ['whether rooms are free to book', 'how many seats or rooms are still free'],
    ['the number of people who want to go to a place', 'the price of rooms during the busiest weeks', 'the distance from a campsite to the nearest village'],
    'The booking website shows the availability of rooms for the next six months.',
    'whether rooms are free to book', 'The booking website shows whether rooms are free to book for the next six months.',
    'how many seats or rooms are still free', 'Please phone the office to find out how many seats or rooms are still free on the night boat.',
    {
      idKey:'availability_5',
      teacherNote:'Unit 5 item (availability_5): whether rooms, tickets or places are free and can be booked. Unit 2 vocab_availability is a separate item that shares only the lexical spelling list.',
      masteryContexts:[
        { text:'Tickets for the boat trip are limited, so online availability changes every hour in summer.', meaning:'whether there are places or seats still free to book' },
        { text:'The agent told us that availability was poor in August, because almost every campsite in the region was already full.', meaning:'how easy it is to find a free place that can be booked' }
      ],
      situationDistractors:[
        'A volunteer collected the litter from the path and put it in large sacks.',
        'The jazz club puts a small band on the stage every Thursday night.',
        'The caretaker locked the gates at dusk and checked the windows.'
      ],
      retrievalContexts:[
        { id:'1', text:'Before you plan the rest of your trip, check the availability of seats on the sleeper train, because it is often fully booked.', target:'availability', grammarPattern:'' },
        { id:'2', text:'Room availability is limited during the carnival, so many visitors stay in towns more than an hour away.', target:'availability', grammarPattern:'' },
        { id:'3', text:'The website shows availability in real time, so you can see at once whether your dates are free.', target:'availability', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'availability', wrong:['comfort', 'price', 'design'] },
        { id:'2', answer:'availability', wrong:['cleaning', 'temperature', 'decoration'] },
        { id:'3', answer:'availability', wrong:['advertising', 'weather', 'payment'] }
      ]
    }),
  e('facilities', 'noun',
    'the buildings, rooms and services that are provided for people to use, such as toilets, a café or a swimming pool',
    ['amenities for guests', 'buildings and services for visitors'],
    ['the money that visitors pay to enter an attraction', 'the people who work at a visitor centre', 'the rules that visitors must follow on a site'],
    'The campsite has excellent facilities, including hot showers and a small shop.',
    'amenities for guests', 'The campsite has excellent amenities for guests, including hot showers and a small shop.',
    'buildings and services for visitors', 'The leaflet lists the buildings and services for visitors, including toilets, a café and a car park.',
    {
      teacherNote:'Normally plural in this sense: the buildings, rooms and services provided for users (toilets, a café, a pool). It is not the same as equipment, which is the physical items needed for an activity.',
      masteryContexts:[
        { text:'The sports centre has excellent facilities, including a pool, a climbing wall and changing rooms.', meaning:'the buildings and services provided for people to use' },
        { text:'Parents of young children often choose a campsite with good toilet and washing facilities.', meaning:'the rooms and services that are provided for the use of visitors' }
      ],
      situationDistractors:[
        'The mayor cut a ribbon to open the new bridge over the river.',
        'A group of students sat on the grass and sketched the old castle.',
        'The postman delivered a parcel to the cottage at the end of the lane.'
      ],
      retrievalContexts:[
        { id:'1', text:'The visitor centre has excellent facilities, including a café, clean toilets and a play area for children.', target:'facilities', grammarPattern:'' },
        { id:'2', text:'Because the campsite has no washing facilities, most of the walkers stayed in the village hostel instead.', target:'facilities', grammarPattern:'' },
        { id:'3', text:'Before booking a family holiday, parents often check the sports facilities, the childcare and the opening hours of the pool.', target:'facilities', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'facilities', wrong:['souvenirs', 'timetables', 'brochures'] },
        { id:'2', answer:'facilities', wrong:['photographs', 'tickets', 'guidebooks'] },
        { id:'3', answer:'facilities', wrong:['rainstorms', 'languages', 'postcards'] }
      ]
    }),
  e('equipment', 'noun',
    'the items and tools that people need in order to do a particular sport or activity',
    ['kit', 'items needed for an activity'],
    ['the money paid to use a sports centre', 'the instructions that explain how to play a sport', 'the people who help visitors during an activity'],
    'The kayak centre provides all the equipment you need, including helmets, paddles and life jackets.',
    'kit', 'The kayak centre provides all the kit you need, including helmets, paddles and life jackets.',
    'items needed for an activity', 'Before the canoe trip, each student received a list of the items needed for an activity like paddling.',
    {
      idKey:'equipment_5',
      teacherNote:'Unit 5 item (equipment_5), separate from the Unit 2 and Unit 4 equipment items; shares only the lexical spelling list. Uncountable: no “an equipment” or “equipments”; use “a piece of equipment”. Facilities are buildings and services, whereas equipment is the physical items needed for an activity.',
      masteryContexts:[
        { text:'Hire shops in the mountain village rent out skis, boots and other winter sports equipment by the day.', meaning:'the items needed for a particular sport or activity' },
        { text:'Climbing a rock face without the right equipment is extremely dangerous, however strong you are.', meaning:'the ropes, tools and clothing that people need for an activity' }
      ],
      situationDistractors:[
        'A waiter carried a tray of cold drinks across the terrace.',
        'The tour leader read out the names of the people in the group.',
        'Heavy rain filled the streets of the old town with puddles.'
      ],
      retrievalContexts:[
        { id:'1', text:'The outdoor centre lends visitors waterproof jackets, helmets and all the other equipment needed for canyoning.', target:'equipment', grammarPattern:'' },
        { id:'2', text:'Some of the expedition equipment was lost when the boat tipped over in the rapids.', target:'equipment', grammarPattern:'' },
        { id:'3', text:'Hiring specialist equipment is cheaper than buying it, especially if you only go skiing once a year.', target:'equipment', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'equipment', wrong:['scenery', 'weather', 'traffic'] },
        { id:'2', answer:'equipment', wrong:['rainfall', 'scenery', 'traffic'] },
        { id:'3', answer:'equipment', wrong:['sunshine', 'traffic', 'information'] }
      ]
    }),
  e('location', 'noun',
    'the place or position where something is found or situated',
    ['position', 'spot'],
    ['a long journey made by sea or by air', 'the number of people who live in a particular area', 'the time of year when most visitors arrive'],
    'The museum’s location, in the old harbour, makes it easy to reach on foot.',
    'position', 'The museum’s position, in the old harbour, makes it easy to reach on foot.',
    'spot', 'The ranger pointed to the spot on the map where the new campsite would be built.',
    {
      teacherNote:'The place or position where something is found. Not the same as destination, which is the place a traveller is going to.',
      masteryContexts:[
        { text:'The new visitor centre has a perfect location at the foot of the mountain, only five minutes from the car park.', meaning:'the place where something is situated' },
        { text:'Because of its remote location, the island has no bridge and can only be reached by boat.', meaning:'the position of a place in relation to other places' }
      ],
      situationDistractors:[
        'The conductor tapped his baton, and the orchestra began to play.',
        'Two children shared an umbrella as they walked to school.',
        'The baker sold out of bread before nine o’clock.'
      ],
      retrievalContexts:[
        { id:'1', text:'The campsite is in a lovely location beside a quiet river, far from the main road.', target:'location', grammarPattern:'' },
        { id:'2', text:'Many walkers choose a guesthouse for its location, hoping to start the path straight from the front door.', target:'location', grammarPattern:'' },
        { id:'3', text:'The tour operator refused to reveal the exact location of the hidden waterfall, because it wanted to protect it from crowds.', target:'location', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'location', wrong:['collection', 'invitation', 'competition'] },
        { id:'2', answer:'location', wrong:['decoration', 'reputation', 'temperature'] },
        { id:'3', answer:'location', wrong:['price', 'menu', 'timetable'] }
      ]
    }),
  e('obtain', 'verb',
    'to get something, especially by making an effort or by following an official process',
    ['acquire', 'get hold of'],
    ['to pay for something in a shop', 'to refuse something that is offered', 'to lose something and look for it'],
    'Visitors must obtain a permit before entering the nature reserve.',
    'acquire', 'Visitors must acquire a permit before entering the nature reserve.',
    'get hold of', 'Students who want to work abroad must get hold of a visa well before they leave.',
    {
      teacherNote:'To get something officially or by making an effort (a visa, permission, information). It is not the same as buy, which means to pay for something.',
      masteryContexts:[
        { text:'Foreign visitors can obtain a tourist visa online in less than ten minutes.', meaning:'to get something through an official process' },
        { text:'It was difficult to obtain accurate information about the ferry times, because every website gave a different answer.', meaning:'to succeed in getting something that is difficult to find' }
      ],
      situationDistractors:[
        'A seagull landed on the railing and watched the children eat their chips.',
        'The farmer drove his tractor slowly along the narrow road.',
        'The choir rehearsed in the hall until late in the evening.'
      ],
      retrievalContexts:[
        { id:'1', text:'Foreign students can obtain a work permit if a local company has agreed to employ them.', target:'obtain', grammarPattern:'' },
        { id:'2', text:'Tourists who wish to climb the volcano must obtain permission from the park office at least a day before.', target:'obtain', grammarPattern:'' },
        { id:'3', text:'The researchers spent six weeks in the forest trying to obtain clear photographs of the rare cat.', target:'obtain', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'obtain', wrong:['repair', 'widen', 'invent'] },
        { id:'2', answer:'obtain', wrong:['burn', 'spill', 'pour'] },
        { id:'3', answer:'obtain', wrong:['unfold', 'predict', 'calm'] }
      ]
    }),
  e('specialise', 'verb',
    'to focus your work or study on one particular area and become an expert in it',
    ['become an expert', 'focus on one area'],
    ['to travel to many different countries in a short time', 'to avoid doing a job that is difficult', 'to teach a subject to a large group of students'],
    'The company is small, but it chooses to specialise in cycling holidays in the mountains.',
    'become an expert', 'The company is small, but it chooses to become an expert in cycling holidays in the mountains.',
    'focus on one area', 'Medical students usually have to focus on one area after five years of general training.',
    {
      teacherNote:'British spelling (-ise). Taught with “in”: specialise in + subject. Students often write the American spelling.',
      masteryContexts:[
        { text:'After a general degree in geography, she decided to specialise in sustainable tourism.', meaning:'to focus on one particular area of study or work' },
        { text:'Some tour operators prefer to specialise in a single region, so that their guides know it extremely well.', meaning:'to concentrate on one area and become an expert in it' }
      ],
      situationDistractors:[
        'A small boat rocked gently beside the stone steps of the harbour.',
        'The shop assistant wrapped the glass vase in layers of paper.',
        'It rained all morning, so the picnic was moved to the village hall.'
      ],
      retrievalContexts:[
        { id:'1', text:'Students who want to become marine biologists usually study general science first and specialise later.', target:'specialise', grammarPattern:'' },
        { id:'2', text:'The agency has only five staff, so it cannot organise every kind of holiday and has chosen to specialise in cultural tours.', target:'specialise', grammarPattern:'' },
        { id:'3', text:'Doctors who specialise in tropical diseases are in great demand, because they help travellers who fall ill abroad.', target:'specialise', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'specialise', wrong:['hesitate', 'celebrate', 'separate'] },
        { id:'2', answer:'specialise', wrong:['recover', 'escape', 'complain'] },
        { id:'3', answer:'specialise', wrong:['believe', 'succeed', 'participate'] }
      ]
    }),
  e('qualification', 'noun',
    'an official certificate or achievement, such as a diploma or an exam result, that shows you have the training or ability to do a job',
    ['certificate', 'proof of training'],
    ['official permission to do something, usually shown on a card', 'a complaint made about the quality of a service', 'a meeting held to discuss a job application'],
    'To work as a ski instructor, you need a qualification in teaching and first aid.',
    'certificate', 'To work as a ski instructor, you need a certificate in teaching and first aid.',
    'proof of training', 'Employers usually ask applicants for proof of training in customer service.',
    {
      teacherNote:'An official certificate or achievement (a diploma, a degree, an exam result) that shows training or ability. A licence, by contrast, is official permission to do something. Often used with “in” (a qualification in first aid) or “for” (a qualification for the job).',
      masteryContexts:[
        { text:'Without a qualification in diving, you cannot work as an instructor at a dive school.', meaning:'an official certificate showing that someone has the training for a job' },
        { text:'Maria has a degree in hospitality, which is an important qualification for anyone who wants to manage a hotel.', meaning:'an achievement, such as a degree, that shows someone is able to do a job' }
      ],
      situationDistractors:[
        'The ferry horn sounded twice as the boat left the quay.',
        'A group of cyclists stopped to fix a flat tyre beside the road.',
        'On Sundays the market square is filled with stalls selling cheese and honey.'
      ],
      retrievalContexts:[
        { id:'1', text:'A lifeguard must have a recognised qualification in rescue and first aid before starting work at the pool.', target:'qualification', grammarPattern:'' },
        { id:'2', text:'Although he had no formal qualification, his years of experience as a mountain guide impressed the employer.', target:'qualification', grammarPattern:'' },
        { id:'3', text:'A university degree is a useful qualification for a career in tourism management.', target:'qualification', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'qualification', wrong:['collection', 'invitation', 'decoration'] },
        { id:'2', answer:'qualification', wrong:['complaint', 'accident', 'holiday'] },
        { id:'3', answer:'qualification', wrong:['souvenir', 'timetable', 'departure'] }
      ]
    }),
  e('evaluate', 'verb',
    'to judge the quality, value or success of something by studying evidence or using clear criteria',
    ['weigh up', 'measure the success of'],
    ['to repeat an activity many times to improve at it', 'to change something so that it looks better', 'to tell people that something is worth choosing'],
    'Tour operators evaluate each new route by studying the number of bookings and the comments of customers.',
    'weigh up', 'Tour operators weigh up each new route by studying the number of bookings and the comments of customers.',
    'measure the success of', 'Researchers measure the success of each new tourist project by using visitor numbers and surveys.',
    {
      idKey:'evaluate_5',
      teacherNote:'Unit 5 item (evaluate_5), separate from Unit 3 evaluate; shares only the lexical spelling list. Sense: to judge quality, value or success using evidence or criteria. It is not the same as recommend, which says that something is worth choosing.',
      masteryContexts:[
        { text:'Before the new bus route was introduced, the council hired an expert to evaluate its effect on traffic and on local businesses.', meaning:'to judge the value or effect of something using evidence' },
        { text:'At the end of the walk, the leader invited everyone to evaluate the route, the guide and the arrangements on a scale from one to five.', meaning:'to judge how good something is by using clear criteria' }
      ],
      situationDistractors:[
        'A busker played the violin outside the station while commuters hurried past.',
        'The children built a sandcastle and decorated it with shells.',
        'Thick clouds covered the summit, so the climbers waited in the hut.'
      ],
      retrievalContexts:[
        { id:'1', text:'Tourist boards use visitor surveys and booking figures to evaluate how successful a campaign has been.', target:'evaluate', grammarPattern:'' },
        { id:'2', text:'Before you choose a language school, take time to evaluate its teaching methods, class sizes and results.', target:'evaluate', grammarPattern:'' },
        { id:'3', text:'The inspectors visited the campsite to evaluate the quality of the food, the cleanliness and the condition of the showers.', target:'evaluate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'evaluate', wrong:['repeat', 'delay', 'invite'] },
        { id:'2', answer:'evaluate', wrong:['borrow', 'applaud', 'forgive'] },
        { id:'3', answer:'evaluate', wrong:['postpone', 'decorate', 'translate'] }
      ]
    }),
  e('itinerary', 'noun',
    'a detailed plan of a trip, showing the route and the places that will be visited',
    ['travel plan', 'day-by-day programme'],
    ['a printed list of the times when trains and buses leave', 'a document that proves you have paid for a holiday', 'a short guide to the history of a town'],
    'The tour company sent us a detailed itinerary showing where we would stay each night.',
    'travel plan', 'The tour company sent us a detailed travel plan showing where we would stay each night.',
    'day-by-day programme', 'The agency emailed the day-by-day programme of the trip a week before departure.',
    {
      teacherNote:'A countable noun: a detailed plan of a trip showing the route and the places to be visited. It is not the same as a timetable, which lists the times when buses or trains leave.',
      masteryContexts:[
        { text:'Our itinerary included two nights in Lisbon, a day trip to the coast and a morning at the national tile museum.', meaning:'a detailed plan of a trip showing places and times' },
        { text:'The tour leader read out the itinerary on the coach so that everybody knew what to expect on the first morning.', meaning:'the planned route and list of places to visit on a journey' }
      ],
      situationDistractors:[
        'The waiter brought a basket of warm bread and a bowl of olives.',
        'The lighthouse keeper polished the lamp every evening before sunset.',
        'Cold water splashed over the bow of the little fishing boat.'
      ],
      retrievalContexts:[
        { id:'1', text:'The itinerary for the first day includes a visit to the castle, lunch in the old town and an evening boat trip.', target:'itinerary', grammarPattern:'' },
        { id:'2', text:'Before leaving, we sent a copy of our itinerary to my parents, so they would know where we were each night.', target:'itinerary', grammarPattern:'' },
        { id:'3', text:'A well-planned itinerary leaves free time for rest, because trying to see too much in a week is exhausting.', target:'itinerary', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'itinerary', wrong:['invoice', 'receipt', 'passport'] },
        { id:'2', answer:'itinerary', wrong:['luggage', 'sandwich', 'sunburn'] },
        { id:'3', answer:'itinerary', wrong:['dictionary', 'postcard', 'sandwich'] }
      ]
    }),
  e('safety regulations', 'noun',
    'official rules made by an authority to protect people from danger and injury',
    ['official protective rules', 'rules that protect people from harm'],
    ['suggestions from experienced travellers about staying healthy', 'the notices that tell visitors the opening times', 'the instructions that explain how to use a machine'],
    'Tour operators must obey strict safety regulations when they take tourists on mountain tracks.',
    'official protective rules', 'Tour operators must obey strict official protective rules when they take tourists on mountain tracks.',
    'rules that protect people from harm', 'Everyone on the site has to follow the rules that protect people from harm, including the wearing of helmets.',
    {
      teacherNote:'A fixed noun phrase, normally plural: official rules made to keep people safe. Taught as a whole; Unit 4 teaches safety and regulation as separate words. Not the same as general advice, which nobody is required to follow.',
      masteryContexts:[
        { text:'Hot-air balloon pilots need a licence, and under strict safety regulations the basket must be inspected every year.', meaning:'official rules designed to keep people from being hurt or put in danger' },
        { text:'The adventure park was closed for a week after inspectors found that it had broken several safety regulations.', meaning:'rules made by an authority to protect people from danger' }
      ],
      situationDistractors:[
        'The conductor stamped each ticket and walked down the swaying carriage.',
        'A sudden gust of wind blew the menu off the café table.',
        'Tourists queued patiently to buy ice cream on the promenade.'
      ],
      retrievalContexts:[
        { id:'1', text:'Cable cars must pass regular inspections under strict safety regulations before they carry passengers.', target:'safety regulations', grammarPattern:'' },
        { id:'2', text:'Because the company ignored safety regulations, the authorities closed the zip-line park for a month.', target:'safety regulations', grammarPattern:'' },
        { id:'3', text:'In most countries, boats that carry passengers must follow safety regulations, such as carrying enough life jackets for everybody.', target:'safety regulations', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'safety regulations', wrong:['opening hours', 'ticket prices', 'dining customs'] },
        { id:'2', answer:'safety regulations', wrong:['school holidays', 'local customs', 'travel brochures'] },
        { id:'3', answer:'safety regulations', wrong:['holiday traditions', 'food prices', 'weather reports'] }
      ]
    }),
  e('excursion', 'noun',
    'a short organised trip, usually made for pleasure or education, from which people return the same day',
    ['day trip', 'organised outing'],
    ['a long and difficult journey to an unknown or dangerous place', 'a talk given by a guide who walks with a group around a building', 'a ticket that allows people to travel on any bus or train for a day'],
    'The highlight of the language course was the excursion to the castle, which took the whole of Saturday.',
    'day trip', 'The highlight of the language course was the day trip to the castle, which took the whole of Saturday.',
    'organised outing', 'Pupils must wear sensible shoes for the organised outing to the caves next week.',
    {
      teacherNote:'A short organised trip, usually for pleasure or education, and normally returning the same day. Not an expedition (a long, difficult journey), not simply a journey, and not a guided tour of one building or site.',
      masteryContexts:[
        { text:'The optional excursion to the island, a boat trip with a picnic lunch, costs extra and must be booked at the tour desk.', meaning:'a short organised trip that people take for pleasure' },
        { text:'Every Friday, the school organises an excursion to a farm, a factory or a museum, and the pupils write a report the next day.', meaning:'a short organised trip, usually for education' }
      ],
      situationDistractors:[
        'The barista steamed the milk and drew a leaf in the foam.',
        'Workmen repaired the tiles on the roof of the station.',
        'An elderly couple sat on a bench and fed crumbs to the sparrows.'
      ],
      retrievalContexts:[
        { id:'1', text:'The school arranged an excursion to a nature reserve, where the pupils spent the day counting birds.', target:'excursion', grammarPattern:'' },
        { id:'2', text:'Tourists who stay in the capital can book a half-day excursion to the old fortress for a small extra fee.', target:'excursion', grammarPattern:'' },
        { id:'3', text:'The highlight of the stay was a full-day excursion along the coast, with a picnic lunch and a stop at a fishing village.', target:'excursion', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'excursion', wrong:['examination', 'exhibition', 'explanation'] },
        { id:'2', answer:'excursion', wrong:['lesson', 'invoice', 'payment'] },
        { id:'3', answer:'excursion', wrong:['rehearsal', 'argument', 'repair'] }
      ]
    })
];

// Authored Word Families (unit-05-word-families.js): per-form facts feed Mastery; the plain family list is the non-headword forms of the SAME
// family. A rejected headword keeps NO family list, so Recognise/Match never offer unauthorised members.
function familyFields(entry) {
  const family = unit5WordFamilies[entry.term];
  if (!family) return unit5WordFamilyRejected[entry.term] ? { wordFamily:[] } : {};
  const lower = value => String(value).toLocaleLowerCase('en');
  return {
    wordFamilyForms:family.forms.map(row => ({ form:row.form, partOfSpeech:row.partOfSpeech, example:row.example, pedagogicallyUseful:true, ...(unit5WordFamilyAlternates[entry.term]?.[row.form] ? { altExample:unit5WordFamilyAlternates[entry.term][row.form] } : {}) })),
    wordFamily:family.forms.map(row => row.form).filter(form => lower(form) !== lower(entry.term))
  };
}

// Authored Meaning Mastery wrong meanings are applied by position to the word's two mastery contexts, as in Units 1–4.
const enrichedEntries = entries.map(entry => {
  const authoredMastery = unit5MeaningMastery[entry.term];
  const masteryContexts = authoredMastery
    ? (entry.masteryContexts ?? []).map((record, index) => {
        const authored = authoredMastery[index] ?? {};
        return { text:authored.text ?? record.text, meaning:authored.meaning ?? record.meaning, ...(Array.isArray(authored.wrongMeanings) ? { wrongMeanings:authored.wrongMeanings } : {}) };
      })
    : entry.masteryContexts;
  return {
    ...entry,
    ...(masteryContexts ? { masteryContexts } : {}),
    ...(unit5SituationExtras[entry.term] ? { situationDistractors:[...(entry.situationDistractors ?? []), ...unit5SituationExtras[entry.term]] } : {}),
    ...(unit5Collocations[entry.term] ? { collocations:unit5Collocations[entry.term] } : {}),
    ...(unit5MeaningMatch[entry.term] ? { wrongParaphrases:unit5MeaningMatch[entry.term] } : {}),
    ...(unit5ContextPassages[entry.term] ? { masteryPassages:unit5ContextPassages[entry.term] } : {}),
    ...familyFields(entry)
  };
});

export default buildCuratedUnit({
  unitNumber:UNIT_NUMBER,
  unitTitle:'Holidays',
  status,
  source:'0511 key words UNIT 5 – HOLIDAYS',
  entries:enrichedEntries,
  activities:[...unit5Activities, ...unit5PrecisionUse, ...unit5WordFamilyItems],
  // breathtaking (Unit 4), recommendation (Unit 3), destination (Unit 4), availability (Unit 2), equipment (Units 2 and 4) and evaluate (Unit 3) are also earlier targets: Unit 5 keeps its own
  // _5 item for each, which reuses the reviewed misspellings of the shared spelling without touching the earlier unit.
  lexicalSpelling:{
    ...LEXICAL_SPELLING_ERRORS,
    vocab_breathtaking_5:LEXICAL_SPELLING_ERRORS.vocab_breathtaking,
    vocab_recommendation_5:LEXICAL_SPELLING_ERRORS.vocab_recommendation,
    vocab_destination_5:LEXICAL_SPELLING_ERRORS.vocab_destination,
    vocab_availability_5:LEXICAL_SPELLING_ERRORS.vocab_availability,
    vocab_equipment_5:LEXICAL_SPELLING_ERRORS.vocab_equipment,
    vocab_evaluate_5:LEXICAL_SPELLING_ERRORS.vocab_evaluate
  }
});
