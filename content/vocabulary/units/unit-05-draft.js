// UNIT 5 – HOLIDAYS: authoring draft (batch 1 = words 1–10). Source: 0511 key words UNIT 5 – HOLIDAYS (coursebook order). Words 11–50 are not locked yet.
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
  lexicalSpelling:{ ...LEXICAL_SPELLING_ERRORS }
});
