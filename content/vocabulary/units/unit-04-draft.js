// UNIT 4 – TRANSPORT: authoring draft (batch 1 = words 1–10). Source: 0511 key words UNIT 4 – TRANSPORT (coursebook order). Words 11–50 are not locked yet.
// Same architecture as unit-03.js. Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-04-draft.js
// A draft (status 'draft') is never in releases/, so the release tooling ignores it. Rename to unit-04.js only when all 50 words are final.
import { buildCuratedUnit } from '../build-unit.js';
import { LEXICAL_SPELLING_ERRORS } from '../lexical-spelling-errors.js';
import unit4Activities from './unit-04-activities.js';
import unit4PrecisionUse from './unit-04-precision-use.js';
import unit4WordFamilyItems from './unit-04-word-family-items.js';
import unit4Collocations from './unit-04-collocations.js';
import unit4SituationExtras from './unit-04-situation-extras.js';
import unit4MeaningMatch from './unit-04-meaning-match.js';
import unit4MeaningMastery from './unit-04-meaning-mastery.js';
import unit4ContextPassages from './unit-04-context-passages.js';
import { unit4WordFamilies, unit4WordFamilyRejected } from './unit-04-word-families.js';
import { unit4WordFamilyAlternates } from './unit-04-word-family-alternates.js';

const UNIT_NUMBER = 4;
const status = 'draft';

const e = (term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence, paraphraseSource, paraphraseSentence, productionSource, productionSentence, extras = {}) => ({
  term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence,
  paraphrase:{ source:paraphraseSource, sentence:paraphraseSentence },
  production:{ source:productionSource, sentence:productionSentence },
  ...extras
});

const entries = [
  e('breathtaking', 'adjective',
    'extremely beautiful, impressive or exciting',
    ['stunning', 'awe-inspiring'],
    ['dangerous and difficult to reach', 'very tiring and uncomfortable', 'cheap and easy to find'],
    'The train journey through the mountains offers breathtaking views of lakes and glaciers.',
    'stunning', 'The train journey through the mountains offers stunning views of lakes and glaciers.',
    'awe-inspiring', 'From the plane window, the awe-inspiring view of the clouds made the whole cabin go quiet.',
    {
      masteryContexts:[
        { text:'From the top of the cable car, we enjoyed a breathtaking view of the snow-covered valley.', meaning:'extremely beautiful and impressive' },
        { text:'The coastal railway journey is breathtaking, especially at sunset when the sea turns gold.', meaning:'so beautiful or exciting that it amazes you' }
      ],
      situationDistractors:[
        'The bus station was dirty and grey, and the view from the window was of a car park.',
        'The motorway was long and flat, and there was nothing interesting to see for hours.',
        'The traveller slept through the whole journey and saw none of the scenery.'
      ],
      retrievalContexts:[
        { id:'1', text:'The train climbs slowly through the Alps and offers breathtaking views of the mountains.', target:'breathtaking', grammarPattern:'' },
        { id:'2', text:'Passengers on the coastal road were silent for a moment because the view was so breathtaking.', target:'breathtaking', grammarPattern:'' },
        { id:'3', text:'The sunrise over the desert highway was absolutely breathtaking, so we stopped to take photographs.', target:'breathtaking', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'breathtaking', wrong:['noisy', 'crowded', 'muddy'] },
        { id:'2', answer:'breathtaking', wrong:['crowded', 'tiring', 'muddy'] },
        { id:'3', answer:'breathtaking', wrong:['tiring', 'muddy', 'crowded'] }
      ]
    }),
  e('comfort', 'noun',
    'a state of being physically relaxed and free from pain or difficulty',
    ['physical ease', 'being relaxed and at ease'],
    ['a feeling of excitement before a journey', 'a lack of space for people or luggage', 'the money paid for a ticket'],
    'The seat was so narrow that comfort was impossible on the eight-hour flight.',
    'physical ease', 'The seat was so narrow that physical ease was impossible on the eight-hour flight.',
    'being relaxed and at ease', 'Passengers value being relaxed and at ease during a long journey.',
    {
      masteryContexts:[
        { text:'The new coach has wide seats and extra legroom, so passengers can travel in comfort even on long journeys.', meaning:'a relaxed state without pain or difficulty' },
        { text:'Many passengers choose the train for its comfort, because they can stretch their legs and move around.', meaning:'physical ease and relaxation' }
      ],
      situationDistractors:[
        'The seat was hard and narrow, and the passenger could not stretch his legs for ten hours.',
        'The bus was so crowded that people stood pressed together and could hardly move.',
        'The train was freezing, and the windows would not close.'
      ],
      retrievalContexts:[
        { id:'1', text:'Wide seats and plenty of legroom allow passengers to travel in comfort.', target:'comfort', grammarPattern:'' },
        { id:'2', text:'The airline is famous for the comfort of its seats on long flights.', target:'comfort', grammarPattern:'' },
        { id:'3', text:'For the sake of comfort, many drivers put a cushion behind their backs.', target:'comfort', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'comfort', wrong:['danger', 'fear', 'pain'] },
        { id:'2', answer:'comfort', wrong:['smell', 'weight', 'noise'] },
        { id:'3', answer:'comfort', wrong:['speed', 'money', 'noise'] }
      ]
    }),
  e('reality', 'noun',
    'the true situation or what actually exists, not what is imagined or hoped for',
    ['the true situation', 'how things actually are'],
    ['a dream about what might happen', 'a plan made before a journey', 'a story told to entertain people'],
    'The advert promised a smooth, quiet journey, but the reality was a delayed train and a crowded carriage.',
    'the true situation', 'The advert promised a smooth, quiet journey, but the true situation was a delayed train and a crowded carriage.',
    'how things actually are', 'Travellers often discover how things actually are only after they arrive.',
    {
      masteryContexts:[
        { text:'Students imagine that driving a bus is easy, but the reality is long hours and heavy traffic.', meaning:'the true situation, not what people imagine' },
        { text:'In reality, the new tunnel took twelve years to build, not the five that the engineers had promised.', meaning:'what actually happened' }
      ],
      situationDistractors:[
        'The young pilot dreamed of flying a jumbo jet one day and drew pictures of aeroplanes all week.',
        'The engineers made a detailed plan for the new bridge and showed it to the mayor.',
        'The writer invented a story about a train that could travel through time.'
      ],
      retrievalContexts:[
        { id:'1', text:'The brochure promised a quiet cabin, but the reality was a noisy engine under the floor.', target:'reality', grammarPattern:'' },
        { id:'2', text:'Many young people dream of becoming pilots, but the reality of the job includes long hours away from home.', target:'reality', grammarPattern:'' },
        { id:'3', text:'In reality, the journey took six hours, not the three that the timetable had suggested.', target:'reality', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'reality', wrong:['dream', 'promise', 'plan'] },
        { id:'2', answer:'reality', wrong:['dream', 'hope', 'promise'] },
        { id:'3', answer:'reality', wrong:['secret', 'silence', 'danger'] }
      ]
    }),
  e('toughest', 'adjective',
    'most difficult to do or to deal with',
    ['hardest', 'most demanding'],
    ['most exciting to watch', 'most expensive to organise', 'most popular with visitors'],
    'The toughest part of the cycling race was the long climb on the last day.',
    'hardest', 'The hardest part of the cycling race was the long climb on the last day.',
    'most demanding', 'The most demanding stage of the rally crosses a desert of soft sand.',
    {
      masteryContexts:[
        { text:'The toughest section of the railway was the tunnel through the mountain, which took nine years to dig.', meaning:'the most difficult to build or complete' },
        { text:'For many drivers, the toughest challenge on the road is staying alert during a long night shift.', meaning:'the hardest to deal with' }
      ],
      situationDistractors:[
        'The final stage of the race was short and easy, and everyone finished in a good mood.',
        'The route was flat, the weather was perfect and the cyclists enjoyed the ride.',
        'The driver found the journey so simple that he arrived an hour early.'
      ],
      retrievalContexts:[
        { id:'1', text:'The toughest part of the journey is crossing the desert in the middle of the day.', target:'toughest', grammarPattern:'' },
        { id:'2', text:'Many drivers say that the toughest test of all is driving through heavy snow.', target:'toughest', grammarPattern:'' },
        { id:'3', text:'It was the toughest race of her career, because the course was steep, wet and very long.', target:'toughest', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'toughest', wrong:['easiest', 'shortest', 'cheapest'] },
        { id:'2', answer:'toughest', wrong:['simplest', 'cheapest', 'fastest'] },
        { id:'3', answer:'toughest', wrong:['shortest', 'cheapest', 'easiest'] }
      ]
    }),
  e('storeys', 'noun',
    'the different floors or levels of a building',
    ['floors', 'levels'],
    ['the rooms where passengers wait', 'the lifts and stairs inside a tower', 'the shops inside a building'],
    'The new car park has six storeys, so it can hold thousands of vehicles.',
    'floors', 'The new car park has six floors, so it can hold thousands of vehicles.',
    'levels', 'The airport car park has eight levels, and a lift runs between them.',
    {
      masteryContexts:[
        { text:'The airport hotel has twelve storeys, and every room on the top floors has a view of the runway.', meaning:'the floors or levels of a building' },
        { text:'The new ferry terminal is only three storeys high, so it does not block the view of the harbour.', meaning:'levels of a building, counted from the ground upwards' }
      ],
      situationDistractors:[
        'The tourists queued for the lift, which took them from the ground to the viewing platform.',
        'The guide pointed at the tall tower and said that it was the tallest in the city.',
        'The engineers measured the height of the bridge in metres.'
      ],
      retrievalContexts:[
        { id:'1', text:'The new airport car park has six storeys and space for four thousand cars.', target:'storeys', grammarPattern:'' },
        { id:'2', text:'The railway hotel is only four storeys high, so it looks small beside the huge station.', target:'storeys', grammarPattern:'' },
        { id:'3', text:'Skyscrapers with more than a hundred storeys are now being built in several Asian cities.', target:'storeys', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'storeys', wrong:['tickets', 'engines', 'wheels'] },
        { id:'2', answer:'storeys', wrong:['rooms', 'lifts', 'doors'] },
        { id:'3', answer:'storeys', wrong:['tickets', 'engines', 'tourists'] }
      ]
    }),
  e('accommodate', 'verb',
    'to have enough space or room for people or things',
    ['hold', 'have room for'],
    ['to carry people from one place to another', 'to pay for people to travel', 'to stop people from entering'],
    'The new ferry can accommodate two hundred cars and a thousand passengers.',
    'hold', 'The new ferry can hold two hundred cars and a thousand passengers.',
    'have room for', 'A large coach should have room for every traveller and all of their luggage.',
    {
      grammarForms:{ base:'accommodate', thirdPerson:'accommodates', past:'accommodated', pastParticiple:'accommodated', ing:'accommodating' },
      masteryContexts:[
        { text:'The new stadium can accommodate eighty thousand fans, and extra trains run after every match.', meaning:'have enough space for' },
        { text:'The minibus is small and cannot accommodate more than eight people with their luggage.', meaning:'have enough room to hold' }
      ],
      situationDistractors:[
        'The driver asked everyone to show their tickets before getting on.',
        'The airline moved a group of travellers to a later flight because of bad weather.',
        'The bus left the station ten minutes late because of heavy traffic.'
      ],
      retrievalContexts:[
        { id:'1', text:'The new ferry can accommodate two hundred cars and a thousand people.', target:'accommodate', grammarPattern:'' },
        { id:'2', text:'Small aircraft cannot accommodate large suitcases in the cabin, so luggage must be checked in.', target:'accommodate', grammarPattern:'' },
        { id:'3', text:'The station was rebuilt with wider platforms to accommodate the growing number of commuters.', target:'accommodate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'accommodate', wrong:['repair', 'inspect', 'sell'] },
        { id:'2', answer:'accommodate', wrong:['repair', 'inspect', 'lose'] },
        { id:'3', answer:'accommodate', wrong:['repair', 'ignore', 'predict'] }
      ]
    }),
  e('luxury', 'noun',
    'great comfort provided by expensive things',
    ['lavish surroundings', 'expensive enjoyment'],
    ['a simple, cheap way of travelling', 'the basic things that people need to live', 'a short rest taken during a journey'],
    'Passengers in first class travel in luxury, with private cabins and gourmet meals.',
    'lavish surroundings', 'Passengers in first class travel in lavish surroundings, with private cabins and gourmet meals.',
    'expensive enjoyment', 'Many wealthy tourists pay thousands of pounds for expensive enjoyment on a cruise ship.',
    {
      masteryContexts:[
        { text:'The cruise ship offers passengers a life of luxury, with private balconies and five-star restaurants.', meaning:'great comfort provided by expensive things' },
        { text:'For many families, a holiday abroad is a luxury that they can enjoy only once every few years.', meaning:'something enjoyable and expensive that is not necessary' }
      ],
      situationDistractors:[
        'The family brought sandwiches and sat on a hard wooden bench in the station.',
        'The bus was cheap and simple, with plastic seats and no heating.',
        'The traveller needed to get to work every day, so he bought a monthly pass.'
      ],
      retrievalContexts:[
        { id:'1', text:'First-class passengers travel in luxury, with private cabins and gourmet meals.', target:'luxury', grammarPattern:'' },
        { id:'2', text:'For many people, owning a private jet is a luxury that they can only dream about.', target:'luxury', grammarPattern:'' },
        { id:'3', text:'The five-star hotel at the airport offers every luxury, from heated floors to a private cinema.', target:'luxury', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'luxury', wrong:['danger', 'poverty', 'fear'] },
        { id:'2', answer:'luxury', wrong:['necessity', 'problem', 'habit'] },
        { id:'3', answer:'luxury', wrong:['problem', 'danger', 'delay'] }
      ]
    }),
  e('altitude', 'noun',
    'the height of a place or object above sea level',
    ['height above sea level', 'elevation'],
    ['the distance between two cities', 'the speed of a moving vehicle', 'the depth of a lake or sea'],
    'The altitude of the mountain station is more than three thousand metres.',
    'height above sea level', 'The height above sea level of the mountain station is more than three thousand metres.',
    'elevation', 'The airport sits at an elevation of two thousand metres, so planes need longer runways.',
    {
      masteryContexts:[
        { text:'At high altitude, the air is thinner, so climbers and pilots need extra oxygen.', meaning:'height above sea level' },
        { text:'The cable car carries visitors from the village to a viewing point at an altitude of three thousand metres.', meaning:'the height of a place above sea level' }
      ],
      situationDistractors:[
        'The ship sailed for two days across the ocean without stopping.',
        'The pilot told the passengers that the flight would take three hours and ten minutes.',
        'The engineer measured the depth of the tunnel under the river.'
      ],
      retrievalContexts:[
        { id:'1', text:'Aeroplanes usually cruise at an altitude of about ten thousand metres.', target:'altitude', grammarPattern:'' },
        { id:'2', text:'La Paz is one of the highest cities in the world, with an altitude of more than three thousand metres.', target:'altitude', grammarPattern:'' },
        { id:'3', text:'The pilot reduced the altitude slowly as the plane approached the runway.', target:'altitude', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'altitude', wrong:['expense', 'engine', 'island'] },
        { id:'2', answer:'altitude', wrong:['island', 'engine', 'airport'] },
        { id:'3', answer:'altitude', wrong:['noise', 'price', 'colour'] }
      ]
    }),
  e('landscape', 'noun',
    'all the natural scenery that can be seen across an area, such as hills, fields and rivers',
    ['scenery', 'view of the countryside'],
    ['a map showing roads and railways', 'a painting hung on a station wall', 'a road that crosses an open area'],
    'The railway crosses mountains, lakes and forests, so passengers enjoy the landscape all day.',
    'scenery', 'The railway crosses mountains, lakes and forests, so passengers enjoy the scenery all day.',
    'view of the countryside', 'From the train window, passengers have a wonderful view of the countryside.',
    {
      masteryContexts:[
        { text:'The Trans-Siberian railway passes through a changing landscape of forests, lakes and endless plains.', meaning:'all the natural features that can be seen across an area' },
        { text:'The new motorway has changed the landscape of the valley, which was once quiet farmland.', meaning:'the appearance of an area of countryside' }
      ],
      situationDistractors:[
        'The tourists studied a map of the region and marked the roads in red.',
        'The guide showed them a painting of the mountains inside the museum.',
        'The driver parked beside the road and checked the tyres.'
      ],
      retrievalContexts:[
        { id:'1', text:'The railway crosses mountains, lakes and forests, so the passengers are never bored by the landscape.', target:'landscape', grammarPattern:'' },
        { id:'2', text:'Wind farms have changed the landscape of the hills near our village.', target:'landscape', grammarPattern:'' },
        { id:'3', text:'From the top of the tower, visitors can see the whole landscape stretching to the sea.', target:'landscape', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'landscape', wrong:['timetable', 'ticket', 'engine'] },
        { id:'2', answer:'landscape', wrong:['weight', 'price', 'speed'] },
        { id:'3', answer:'landscape', wrong:['timetable', 'ticket', 'engine'] }
      ]
    }),
  e('passenger', 'noun',
    'a person who travels in a vehicle, aircraft or ship but is not the driver or crew',
    ['person travelling on board', 'traveller on board'],
    ['a person who drives a bus or taxi', 'a person who sells tickets at a station', 'a person who checks luggage at an airport'],
    'Every passenger must fasten a seat belt before the aeroplane takes off.',
    'person travelling on board', 'Every person travelling on board must fasten a seat belt before the aeroplane takes off.',
    'traveller on board', 'A traveller on board the ferry must keep their ticket until they get off.',
    {
      masteryContexts:[
        { text:'The bus driver waited until every passenger had found a seat before he moved off.', meaning:'a person who travels in a vehicle but does not drive it' },
        { text:'A passenger on the night train described the journey as the most relaxing of her life.', meaning:'a traveller who is not the driver or crew' }
      ],
      situationDistractors:[
        'The driver checked the engine and filled the tank with fuel before leaving.',
        'The ticket inspector walked through the carriages checking the tickets.',
        'The pilot told the control tower that the aeroplane was ready to take off.'
      ],
      retrievalContexts:[
        { id:'1', text:'Every passenger must fasten a seat belt before the aeroplane takes off.', target:'passenger', grammarPattern:'' },
        { id:'2', text:'The last passenger to board the ferry was a small boy carrying a huge suitcase.', target:'passenger', grammarPattern:'' },
        { id:'3', text:'The taxi driver asked the passenger which hotel she wanted to go to.', target:'passenger', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'passenger', wrong:['mechanic', 'engineer', 'guard'] },
        { id:'2', answer:'passenger', wrong:['sailor', 'captain', 'cook'] },
        { id:'3', answer:'passenger', wrong:['mechanic', 'pilot', 'guard'] }
      ]
    })
];

// Authored Word Families (unit-04-word-families.js): per-form facts feed Mastery; the plain family list is the non-headword forms of the SAME
// family. A rejected headword keeps NO family list, so Recognise/Match never offer unauthorised members.
function familyFields(entry) {
  const family = unit4WordFamilies[entry.term];
  if (!family) return unit4WordFamilyRejected[entry.term] ? { wordFamily:[] } : {};
  const lower = value => String(value).toLocaleLowerCase('en');
  return {
    wordFamilyForms:family.forms.map(row => ({ form:row.form, partOfSpeech:row.partOfSpeech, example:row.example, pedagogicallyUseful:true, ...(unit4WordFamilyAlternates[entry.term]?.[row.form] ? { altExample:unit4WordFamilyAlternates[entry.term][row.form] } : {}) })),
    wordFamily:family.forms.map(row => row.form).filter(form => lower(form) !== lower(entry.term))
  };
}

// Authored Meaning Mastery wrong meanings are applied by position to the word's two mastery contexts, as in Units 1 and 2.
const enrichedEntries = entries.map(entry => {
  const authoredMastery = unit4MeaningMastery[entry.term];
  const masteryContexts = authoredMastery
    ? (entry.masteryContexts ?? []).map((record, index) => {
        const authored = authoredMastery[index] ?? {};
        return { text:authored.text ?? record.text, meaning:authored.meaning ?? record.meaning, ...(Array.isArray(authored.wrongMeanings) ? { wrongMeanings:authored.wrongMeanings } : {}) };
      })
    : entry.masteryContexts;
  return {
    ...entry,
    ...(masteryContexts ? { masteryContexts } : {}),
    ...(unit4SituationExtras[entry.term] ? { situationDistractors:[...(entry.situationDistractors ?? []), ...unit4SituationExtras[entry.term]] } : {}),
    ...(unit4Collocations[entry.term] ? { collocations:unit4Collocations[entry.term] } : {}),
    ...(unit4MeaningMatch[entry.term] ? { wrongParaphrases:unit4MeaningMatch[entry.term] } : {}),
    ...(unit4ContextPassages[entry.term] ? { masteryPassages:unit4ContextPassages[entry.term] } : {}),
    ...familyFields(entry)
  };
});

export default buildCuratedUnit({
  unitNumber:UNIT_NUMBER,
  unitTitle:'Transport',
  status,
  source:'0511 key words UNIT 4 – TRANSPORT',
  entries:enrichedEntries,
  activities:[...unit4Activities, ...unit4PrecisionUse, ...unit4WordFamilyItems],
  lexicalSpelling:{ ...LEXICAL_SPELLING_ERRORS }
});
