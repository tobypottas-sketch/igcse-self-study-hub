// UNIT 5 – HOLIDAYS: authoring draft (batches 1–2 = words 1–20). Source: 0511 key words UNIT 5 – HOLIDAYS (coursebook order). Words 21–50 are not locked yet.
// Same architecture as unit-04.js. Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-05-draft.js
// A draft (status 'draft') is never in releases/, so the release tooling ignores it. Rename to unit-05.js only when all 50 words are final.
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
const status = 'draft';

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
        { text:'The helicopter ride over the canyon was a breathtaking experience that none of us will forget.', meaning:'so exciting and impressive that you never forget it' }
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
  // breathtaking is also a Unit 4 target: Unit 5 keeps its own item (vocab_breathtaking_5) that reuses the reviewed misspellings of the shared spelling.
  lexicalSpelling:{
    ...LEXICAL_SPELLING_ERRORS,
    vocab_breathtaking_5:LEXICAL_SPELLING_ERRORS.vocab_breathtaking
  }
});
