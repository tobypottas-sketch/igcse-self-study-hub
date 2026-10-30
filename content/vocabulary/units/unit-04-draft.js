// UNIT 4 – TRANSPORT: authoring draft (batches 1–2 = words 1–20). Source: 0511 key words UNIT 4 – TRANSPORT (coursebook order). Words 21–50 are not locked yet.
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
    }),
  e('engineer', 'noun',
    'a person trained to design, build or repair machines, vehicles or structures',
    ['technical expert', 'technical specialist'],
    ['a person who flies and controls an aircraft', 'a person who sells vehicles to customers', 'a person who checks tickets on trains'],
    'Before the first flight, an engineer checked the new aircraft’s wings carefully.',
    'technical expert', 'Before the first flight, a technical expert checked the new aircraft’s wings carefully.',
    'technical specialist', 'The technical specialist who designed the new tunnel explained how it was built.',
    {
      masteryContexts:[
        { text:'The railway engineer explained how the new bridge could carry heavy freight trains.', meaning:'a person trained to design and build structures' },
        { text:'The aircraft engineer inspected every engine before the plane was allowed to take off.', meaning:'a person trained to keep machines and systems working' }
      ],
      situationDistractors:[
        'The pilot welcomed the passengers and announced the flying time.',
        'The guard waved a green flag and the train left the platform.',
        'The tourist asked a stranger for directions to the nearest station.'
      ],
      retrievalContexts:[
        { id:'1', text:'The engineer who designed the bridge checked every steel beam before it opened to traffic.', target:'engineer', grammarPattern:'' },
        { id:'2', text:'The ship’s engineer repaired the damaged motor while the vessel waited in the harbour.', target:'engineer', grammarPattern:'' },
        { id:'3', text:'She studied physics at university because she wanted to become an engineer and design faster trains.', target:'engineer', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'engineer', wrong:['pilot', 'passenger', 'driver'] },
        { id:'2', answer:'engineer', wrong:['captain', 'passenger', 'cook'] },
        { id:'3', answer:'engineer', wrong:['astronaut', 'accountant', 'announcer'] }
      ]
    }),
  e('pilot', 'noun',
    'a person who flies an aircraft',
    ['person flying the aeroplane', 'person at the controls'],
    ['a person who repairs aircraft engines', 'a person who serves food on a flight', 'a person who travels on a flight'],
    'The pilot told the passengers that the flight would take about two hours.',
    'person flying the aeroplane', 'The person flying the aeroplane told the passengers that the flight would take about two hours.',
    'person at the controls', 'The person at the controls landed the aircraft safely in strong wind.',
    {
      masteryContexts:[
        { text:'The pilot landed the aeroplane safely in thick fog.', meaning:'a person who flies an aircraft' },
        { text:'Our pilot announced that we were flying at ten thousand metres.', meaning:'the person in charge of flying the aeroplane' }
      ],
      situationDistractors:[
        'The mechanic changed a flat tyre at the side of the road.',
        'The ticket inspector walked along the train checking everyone’s tickets.',
        'The ferry captain steered the boat slowly into the harbour.'
      ],
      retrievalContexts:[
        { id:'1', text:'The pilot told the passengers that they would land in about twenty minutes.', target:'pilot', grammarPattern:'' },
        { id:'2', text:'Strong winds made it hard for the pilot to land the aeroplane safely.', target:'pilot', grammarPattern:'' },
        { id:'3', text:'As a child, he dreamed of becoming a pilot and flying jets around the world.', target:'pilot', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'pilot', wrong:['mechanic', 'guard', 'porter'] },
        { id:'2', answer:'pilot', wrong:['mechanic', 'passenger', 'porter'] },
        { id:'3', answer:'pilot', wrong:['driver', 'sailor', 'cyclist'] }
      ]
    }),
  e('airship', 'noun',
    'a large aircraft filled with gas that is lighter than air, which has engines and can be steered',
    ['gas-filled flying craft', 'large steerable aircraft'],
    ['a small flying machine with rotating blades', 'a large bag of hot air that cannot be steered', 'a fast aircraft with fixed wings and jet engines'],
    'The airship floated slowly above the city, carrying tourists on a sightseeing flight.',
    'gas-filled flying craft', 'The gas-filled flying craft floated slowly above the city, carrying tourists on a sightseeing flight.',
    'large steerable aircraft', 'In the 1930s, a large steerable aircraft carried passengers across the Atlantic Ocean.',
    {
      masteryContexts:[
        { text:'In the 1930s, a giant airship carried passengers across the Atlantic in about three days.', meaning:'a large gas-filled aircraft that can be steered' },
        { text:'The advertising company hired an airship to float above the stadium during the match.', meaning:'a lighter-than-air aircraft with engines' }
      ],
      situationDistractors:[
        'The helicopter landed on the hospital roof to collect an injured climber.',
        'The hot-air balloon drifted slowly over the fields at sunrise, going wherever the wind took it.',
        'The jet took off at high speed and disappeared into the clouds.'
      ],
      retrievalContexts:[
        { id:'1', text:'The giant airship floated silently above the city while tourists waved from the cabin below.', target:'airship', grammarPattern:'' },
        { id:'2', text:'Unlike a balloon, the airship has engines and can be steered in any direction.', target:'airship', grammarPattern:'' },
        { id:'3', text:'In the 1930s, a German airship carried passengers across the Atlantic Ocean in about three days.', target:'airship', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'airship', wrong:['mountain', 'bridge', 'tower'] },
        { id:'2', answer:'airship', wrong:['kite', 'cloud', 'parachute'] },
        { id:'3', answer:'airship', wrong:['tram', 'ferry', 'lorry'] }
      ]
    }),
  e('launch', 'verb',
    'to send a rocket, ship or aircraft on its way, or to start a new product or service',
    ['start', 'introduce'],
    ['to stop or cancel something before it begins', 'to repair something that has been damaged', 'to move something heavy to a new place'],
    'The airline will launch a new service between London and Singapore next spring.',
    'start', 'The airline will start a new service between London and Singapore next spring.',
    'introduce', 'The council plans to introduce a new electric bus route next year.',
    {
      grammarForms:{ base:'launch', thirdPerson:'launches', past:'launched', pastParticiple:'launched', ing:'launching' },
      masteryContexts:[
        { text:'The space agency will launch a new satellite from the coast next week.', meaning:'send into the air or space' },
        { text:'The railway company plans to launch a high-speed service between the two cities.', meaning:'start a new service for the public' }
      ],
      situationDistractors:[
        'The company closed the old bus station because too few people used it.',
        'The engineers tested the bridge by driving heavy lorries across it.',
        'The airline cancelled the flight because of thick fog.'
      ],
      retrievalContexts:[
        { id:'1', text:'The airline plans to launch a new route from London to Singapore in the spring.', target:'launch', grammarPattern:'' },
        { id:'2', text:'Scientists will launch the rocket as soon as the weather improves.', target:'launch', grammarPattern:'' },
        { id:'3', text:'The company decided to launch its electric bus service in three cities first.', target:'launch', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'launch', wrong:['cancel', 'repair', 'follow'] },
        { id:'2', answer:'launch', wrong:['repair', 'insure', 'borrow'] },
        { id:'3', answer:'launch', wrong:['close', 'copy', 'sell'] }
      ]
    }),
  e('height', 'noun',
    'how tall something is, measured from the bottom to the top',
    ['vertical measurement', 'tallness'],
    ['how wide something is from side to side', 'how far one place is from another', 'how heavy something is when it is lifted'],
    'The height of the new bridge is more than two hundred metres.',
    'vertical measurement', 'The vertical measurement of the new bridge is more than two hundred metres.',
    'tallness', 'The tallness of the lorry prevented it from passing under the low bridge.',
    {
      masteryContexts:[
        { text:'Drivers must check the height of their lorry before they enter a low tunnel.', meaning:'how tall something is from bottom to top' },
        { text:'Engineers measured the height of the new tower before they planned where the lifts would go.', meaning:'the measurement from bottom to top' }
      ],
      situationDistractors:[
        'The tourists queued at the ticket office to buy tickets for the evening train.',
        'The driver filled the tank with petrol before the long journey.',
        'The ferry carried two hundred cars across the river.'
      ],
      retrievalContexts:[
        { id:'1', text:'Lorry drivers must check the height of their vehicle before entering a low tunnel.', target:'height', grammarPattern:'' },
        { id:'2', text:'The tower has a height of three hundred metres, so it can be seen from far away.', target:'height', grammarPattern:'' },
        { id:'3', text:'The height of the bridge allows tall ships to sail underneath.', target:'height', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'height', wrong:['weight', 'speed', 'colour'] },
        { id:'2', answer:'height', wrong:['weight', 'speed', 'price'] },
        { id:'3', answer:'height', wrong:['length', 'weight', 'age'] }
      ]
    }),
  e('anxious', 'adjective',
    'worried or nervous about something that may happen',
    ['worried', 'nervous'],
    ['very keen and excited to do something', 'angry because of a long delay', 'tired after a long journey'],
    'Many passengers feel anxious before their first flight.',
    'nervous', 'Many passengers feel nervous before their first flight.',
    'worried', 'The worried parents waited at the station for the delayed train.',
    {
      masteryContexts:[
        { text:'Many passengers feel anxious before their first flight, so the crew explain what each noise means.', meaning:'worried about what may happen' },
        { text:'The anxious parents waited at the station, afraid that their daughter’s train had been cancelled.', meaning:'nervous and worried' }
      ],
      situationDistractors:[
        'The passengers laughed and chatted happily as the bus rolled along the coast.',
        'The driver whistled a cheerful tune while he waited at the traffic lights.',
        'The young traveller slept peacefully on the night train.'
      ],
      retrievalContexts:[
        { id:'1', text:'Many people feel anxious before their first flight, especially during take-off.', target:'anxious', grammarPattern:'' },
        { id:'2', text:'The anxious parents kept checking the departure board for news of the delayed train.', target:'anxious', grammarPattern:'' },
        { id:'3', text:'She was anxious about missing the connecting flight, so she ran through the terminal.', target:'anxious', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'anxious', wrong:['bored', 'proud', 'sleepy'] },
        { id:'2', answer:'anxious', wrong:['cheerful', 'sleepy', 'generous'] },
        { id:'3', answer:'anxious', wrong:['pleased', 'cheerful', 'sleepy'] }
      ]
    }),
  e('vehicle', 'noun',
    'something such as a car, bus or lorry that is used to carry people or goods, especially on land',
    ['means of transport', 'form of transport'],
    ['a wide road with several lanes', 'a building where cars are repaired', 'a person who drives a lorry or bus'],
    'Each vehicle that enters the city centre must pay a daily charge.',
    'means of transport', 'Each means of transport that enters the city centre must pay a daily charge.',
    'form of transport', 'An electric form of transport is quiet and produces no smoke.',
    {
      masteryContexts:[
        { text:'The police stopped the vehicle because one of its headlights was broken.', meaning:'something used to carry people or goods on land' },
        { text:'An electric vehicle produces no smoke, so it is better for the air in cities.', meaning:'a machine such as a car or bus used for transport' }
      ],
      situationDistractors:[
        'The tourists walked along the beach and collected shells.',
        'The pilot spoke to the control tower and checked the weather report.',
        'The ticket office closed at six o’clock in the evening.'
      ],
      retrievalContexts:[
        { id:'1', text:'The traffic officer stopped the vehicle because it was travelling far too fast on the motorway.', target:'vehicle', grammarPattern:'' },
        { id:'2', text:'Each vehicle that enters the old town must display a parking permit.', target:'vehicle', grammarPattern:'' },
        { id:'3', text:'Heavy equipment had to be carried across the desert in a vehicle with six wheels.', target:'vehicle', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'vehicle', wrong:['road', 'garage', 'bridge'] },
        { id:'2', answer:'vehicle', wrong:['road', 'bridge', 'garage'] },
        { id:'3', answer:'vehicle', wrong:['building', 'bridge', 'village'] }
      ]
    }),
  e('pollution', 'noun',
    'damage to air, water or land caused by harmful substances or waste',
    ['contamination', 'environmental damage'],
    ['a shortage of fuel caused by heavy use', 'a lack of space caused by too many people', 'a rise in the cost of travelling'],
    'Heavy traffic is one of the main causes of air pollution in big cities.',
    'contamination', 'Heavy traffic is one of the main causes of air contamination in big cities.',
    'environmental damage', 'Cutting the number of cars on the road will reduce environmental damage.',
    {
      masteryContexts:[
        { text:'Traffic fumes are a major cause of air pollution in large cities.', meaning:'damage to the air caused by harmful substances' },
        { text:'The factory was fined because its waste caused serious pollution in the river.', meaning:'harmful damage to water, air or land' }
      ],
      situationDistractors:[
        'The sun shone brightly and the beach was clean and empty.',
        'The city council opened a new cycle lane along the river.',
        'The factory workers finished their shift and went home.'
      ],
      retrievalContexts:[
        { id:'1', text:'Scientists are worried about the high level of air pollution around the busy motorway.', target:'pollution', grammarPattern:'' },
        { id:'2', text:'Electric buses help to reduce pollution because they produce no exhaust fumes.', target:'pollution', grammarPattern:'' },
        { id:'3', text:'Local people blamed the oil company for the pollution that had spread along the coast.', target:'pollution', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'pollution', wrong:['travel', 'supply', 'conditioning'] },
        { id:'2', answer:'pollution', wrong:['congestion', 'accidents', 'delays'] },
        { id:'3', answer:'pollution', wrong:['sunshine', 'silence', 'friendship'] }
      ]
    }),
  e('destination', 'noun',
    'the place to which someone or something is travelling or being sent',
    ['the end of our journey', 'the place we were heading for'],
    ['the road that a journey follows', 'the place where a journey begins', 'the time that a journey takes'],
    'After six hours on the road, we finally reached our destination.',
    'the end of our journey', 'After six hours on the road, we finally reached the end of our journey.',
    'the place we were heading for', 'The taxi driver took us straight to the place we were heading for.',
    {
      masteryContexts:[
        { text:'Venice is a popular holiday destination for visitors from all over the world.', meaning:'a place that people travel to' },
        { text:'We checked the departure board to confirm the time and the destination of our train.', meaning:'the place the train is going to' }
      ],
      situationDistractors:[
        'The road ran straight for fifty kilometres before it curved through the hills.',
        'The coach left from the central station at seven o’clock in the morning.',
        'The journey took nearly nine hours because of heavy traffic.'
      ],
      retrievalContexts:[
        { id:'1', text:'After six hours on the road, we finally reached our destination, a small fishing village.', target:'destination', grammarPattern:'' },
        { id:'2', text:'The departure board shows the time of each train and its destination.', target:'destination', grammarPattern:'' },
        { id:'3', text:'Tokyo is a popular tourist destination for visitors from all over the world.', target:'destination', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'destination', wrong:['journey', 'route', 'departure'] },
        { id:'2', answer:'destination', wrong:['driver', 'engine', 'ticket'] },
        { id:'3', answer:'destination', wrong:['route', 'season', 'guide'] }
      ]
    }),
  e('spacious', 'adjective',
    'having plenty of room inside',
    ['roomy', 'wide and uncrowded'],
    ['very small and difficult to enter', 'very crowded with people or things', 'very clean and carefully organised'],
    'The new carriages are spacious, so passengers can store large suitcases easily.',
    'roomy', 'The new carriages are roomy, so passengers can store large suitcases easily.',
    'wide and uncrowded', 'The new airport lounge is bright, modern, wide and uncrowded.',
    {
      masteryContexts:[
        { text:'The new coach is spacious, so passengers can stretch their legs and put large bags at their feet.', meaning:'having plenty of room inside' },
        { text:'The spacious departure hall was bright and quiet, with rows of empty seats.', meaning:'large enough to hold many people comfortably' }
      ],
      situationDistractors:[
        'Passengers squeezed together on the bus, holding their bags above their heads.',
        'The tiny cabin had one bed, and the suitcases were stacked in the corridor.',
        'Every seat on the tram was taken, and people were standing in the aisle.'
      ],
      retrievalContexts:[
        { id:'1', text:'The new minibus is so spacious that eight people can sit comfortably with their bags.', target:'spacious', grammarPattern:'' },
        { id:'2', text:'We booked a spacious cabin on the ferry, with room for the whole family and our luggage.', target:'spacious', grammarPattern:'' },
        { id:'3', text:'The airport has a spacious terminal where passengers can walk freely even at busy times.', target:'spacious', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'spacious', wrong:['crowded', 'narrow', 'noisy'] },
        { id:'2', answer:'spacious', wrong:['crowded', 'tiny', 'noisy'] },
        { id:'3', answer:'spacious', wrong:['tiny', 'crowded', 'noisy'] }
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
