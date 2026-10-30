// UNIT 4 – TRANSPORT: approved source for the Unit 4 release (releases/unit-04.js promotes it to live). Source: 0511 key words UNIT 4 – TRANSPORT
// (coursebook order), all 50 authored and audited. Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-04.js
// demand, advertisement, equipment and participant are also earlier-unit targets; each has its own Unit 4 id (idKey 'X_4' -> vocab_X_4) and aliases the earlier spelling list.
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
const status = 'approved';

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
        { id:'1', text:'Each passenger on the night train received a blanket and a small pillow.', target:'passenger', grammarPattern:'' },
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
    }),
  e('efficiently', 'adverb',
    'in a way that works well and does not waste time, energy or money',
    ['without wasting time or energy', 'in a well-planned way'],
    ['very quickly, without careful thought', 'in a slow and careful way', 'in a noisy and disorganised way'],
    'The new ticket system allows the airline to process passengers efficiently.',
    'without wasting time or energy', 'The new ticket system allows the airline to process passengers without wasting time or energy.',
    'in a well-planned way', 'The airport staff cleared the runway in a well-planned way after the snowstorm.',
    {
      masteryContexts:[
        { text:'The depot manager plans the delivery routes carefully so that the lorries use fuel efficiently.', meaning:'without wasting energy, time or money' },
        { text:'Freight trains carry heavy goods more efficiently than lorries because they use less fuel for each tonne.', meaning:'in a way that wastes little energy or money' }
      ],
      situationDistractors:[
        'The driver forgot the route, took three wrong turns and arrived an hour late.',
        'The warehouse workers searched for twenty minutes before they found the missing boxes.',
        'The ticket office ran out of tickets because nobody had ordered new ones.'
      ],
      retrievalContexts:[
        { id:'1', text:'The new baggage system allows the airport to deal with thousands of suitcases efficiently.', target:'efficiently', grammarPattern:'' },
        { id:'2', text:'The city redesigned its bus routes so that commuters could travel efficiently across town.', target:'efficiently', grammarPattern:'' },
        { id:'3', text:'Small teams of ground staff can turn an aircraft around efficiently if everyone knows their task.', target:'efficiently', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'efficiently', wrong:['carelessly', 'reluctantly', 'noisily'] },
        { id:'2', answer:'efficiently', wrong:['carelessly', 'noisily', 'suddenly'] },
        { id:'3', answer:'efficiently', wrong:['reluctantly', 'carelessly', 'noisily'] }
      ]
    }),
  e('demand', 'noun',
    'a strong need or wish for something, especially from customers or the public',
    ['need', 'call'],
    ['an order given by a police officer or teacher', 'the amount of money paid for a service', 'the supply of goods that a company has available'],
    'There is a growing demand for electric buses in many cities.',
    'need', 'There is a growing need for electric buses in many cities.',
    'call', 'There was a strong call for cheaper train tickets after the price rise.',
    {
      idKey:'demand_4',
      teacherNote:'Unit 4 item (demand_4): the noun sense. Unit 1 vocab_demand is the verb "to require a lot of effort"; separate item that shares only the lexical spelling list.',
      masteryContexts:[
        { text:'The demand for cheap flights rises sharply every summer.', meaning:'the strong wish of customers to buy something' },
        { text:'There is such strong demand for the new tram line that the council plans to build a second one.', meaning:'a strong need from the public for something' }
      ],
      situationDistractors:[
        'The shop had hundreds of unsold scooters in its warehouse and nobody came to buy them.',
        'The bus company reduced its timetable because very few people used the service.',
        'The factory produced twice as many bicycles as it had planned.'
      ],
      retrievalContexts:[
        { id:'1', text:'The demand for electric cars has grown quickly over the last five years.', target:'demand', grammarPattern:'' },
        { id:'2', text:'Because of high demand, the railway company added extra trains on Friday evenings.', target:'demand', grammarPattern:'' },
        { id:'3', text:'Airlines usually raise their prices when demand is at its highest.', target:'demand', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'demand', wrong:['fear', 'permission', 'respect'] },
        { id:'2', answer:'demand', wrong:['costs', 'wages', 'prices'] },
        { id:'3', answer:'demand', wrong:['safety', 'comfort', 'wind'] }
      ]
    }),
  e('invention', 'noun',
    'something newly created or designed that did not exist before',
    ['creation', 'new device'],
    ['the discovery of something that already existed in nature', 'a small repair made to an old machine', 'a story about life in the future'],
    'The invention of the steam engine changed transport for ever.',
    'creation', 'The creation of the steam engine changed transport for ever.',
    'new device', 'The new device that helps cars park themselves was shown at the exhibition.',
    {
      masteryContexts:[
        { text:'Her latest invention is a folding electric scooter that fits inside a school bag.', meaning:'a newly designed device' },
        { text:'The bicycle was a remarkable invention, because it gave ordinary people a cheap way to travel.', meaning:'something that was created and did not exist before' }
      ],
      situationDistractors:[
        'The explorers found a hidden valley that nobody had ever mapped before.',
        'The mechanic repaired the old engine and the bus ran again.',
        'The museum displayed old posters from the nineteenth century.'
      ],
      retrievalContexts:[
        { id:'1', text:'Many historians believe that the invention of the wheel was the most important step in the history of transport.', target:'invention', grammarPattern:'' },
        { id:'2', text:'The invention of the jet engine made long-distance air travel much faster.', target:'invention', grammarPattern:'' },
        { id:'3', text:'The Wright brothers’ invention made it possible for people to fly in a powered aeroplane.', target:'invention', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'invention', wrong:['repair', 'price', 'weight'] },
        { id:'2', answer:'invention', wrong:['repair', 'sale', 'cost'] },
        { id:'3', answer:'invention', wrong:['mistake', 'complaint', 'holiday'] }
      ]
    }),
  e('machinery', 'noun',
    'large powered devices, considered together, that are used to do work in industry, farming or construction',
    ['mechanical devices', 'heavy powered devices'],
    ['a group of workers who operate vehicles', 'the buildings where factories are located', 'the money spent on running a factory'],
    'The factory uses modern machinery to build aeroplane parts.',
    'mechanical devices', 'The factory uses modern mechanical devices to build aeroplane parts.',
    'heavy powered devices', 'Cranes and other heavy powered devices were brought in to lift the bridge into place.',
    {
      masteryContexts:[
        { text:'Farmers now use heavy machinery to plant and harvest crops across large fields.', meaning:'large powered devices used to do work' },
        { text:'The port has invested in new machinery for unloading containers from ships.', meaning:'powered devices used for lifting and moving heavy loads' }
      ],
      situationDistractors:[
        'Farmers planted every seed by hand, working in the fields from dawn until dark.',
        'The warehouse was full of wooden boxes, stacked from floor to ceiling.',
        'The workers carried the bricks up the ladder one by one.'
      ],
      retrievalContexts:[
        { id:'1', text:'The construction company uses heavy machinery to dig the tunnel under the river.', target:'machinery', grammarPattern:'' },
        { id:'2', text:'Workers must wear ear protection when they are near noisy machinery.', target:'machinery', grammarPattern:'' },
        { id:'3', text:'The airport spent millions on new machinery to load luggage onto the planes.', target:'machinery', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'machinery', wrong:['furniture', 'clothing', 'luggage'] },
        { id:'2', answer:'machinery', wrong:['furniture', 'scenery', 'clothing'] },
        { id:'3', answer:'machinery', wrong:['furniture', 'clothing', 'uniforms'] }
      ]
    }),
  e('advertisement', 'noun',
    'a notice, picture, film or message designed to persuade people to buy or use something',
    ['promotional message', 'paid promotion'],
    ['a warning notice put up for passengers', 'a timetable showing when trains arrive', 'a report written by a journalist'],
    'A large advertisement for the new express train appeared on every bus in the city.',
    'promotional message', 'A large promotional message for the new express train appeared on every bus in the city.',
    'paid promotion', 'A paid promotion for the new tram line appeared on every bus.',
    {
      idKey:'advertisement_4',
      teacherNote:'Unit 4 item (advertisement_4), separate from Unit 3 advertisement; shares only the lexical spelling list.',
      masteryContexts:[
        { text:'The bus company paid for a huge advertisement on the side of every double-decker bus.', meaning:'a notice designed to persuade people to use a service' },
        { text:'The advertisement promised free Wi-Fi on all trains, but passengers found that the signal was weak.', meaning:'a message designed to persuade people to buy or use something' }
      ],
      situationDistractors:[
        'A police officer stopped the traffic so that a group of children could cross the road.',
        'The station announcer reminded everyone to keep their luggage with them.',
        'The newspaper published a long report about the new motorway.'
      ],
      retrievalContexts:[
        { id:'1', text:'The airline ran a television advertisement showing smiling passengers on a luxury flight.', target:'advertisement', grammarPattern:'' },
        { id:'2', text:'Passengers waiting at the station noticed a colourful advertisement for cheap holidays on the wall.', target:'advertisement', grammarPattern:'' },
        { id:'3', text:'Every advertisement on the underground must be approved by the transport authority before it goes up.', target:'advertisement', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'advertisement', wrong:['timetable', 'ticket', 'warning'] },
        { id:'2', answer:'advertisement', wrong:['timetable', 'suitcase', 'engine'] },
        { id:'3', answer:'advertisement', wrong:['ticket', 'suitcase', 'engine'] }
      ]
    }),
  e('enormous', 'adjective',
    'extremely large',
    ['huge', 'gigantic'],
    ['extremely important to many people', 'extremely expensive to build', 'extremely old and badly damaged'],
    'The new airport terminal is enormous, with room for thousands of passengers.',
    'huge', 'The new airport terminal is huge, with room for thousands of passengers.',
    'gigantic', 'A gigantic cargo ship blocked the narrow channel for several hours.',
    {
      masteryContexts:[
        { text:'An enormous crane lifted the bridge sections into place one by one.', meaning:'extremely large in size' },
        { text:'The tunnel project cost an enormous amount of money, but it saved hours of travelling time every day.', meaning:'very great in amount' }
      ],
      situationDistractors:[
        'The tiny car could hardly carry two people and one small bag.',
        'The path beside the river was so narrow that only one cyclist could pass at a time.',
        'The model train was no bigger than a pencil case.'
      ],
      retrievalContexts:[
        { id:'1', text:'The cruise ship is so enormous that it cannot enter the old harbour.', target:'enormous', grammarPattern:'' },
        { id:'2', text:'Engineers built an enormous bridge across the bay, more than five kilometres long.', target:'enormous', grammarPattern:'' },
        { id:'3', text:'The airport car park was enormous, with room for more than ten thousand vehicles.', target:'enormous', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'enormous', wrong:['silent', 'popular', 'expensive'] },
        { id:'2', answer:'enormous', wrong:['ancient', 'empty', 'awful'] },
        { id:'3', answer:'enormous', wrong:['crowded', 'closed', 'narrow'] }
      ]
    }),
  e('equipment', 'noun',
    'the tools, devices and items needed for a particular purpose',
    ['gear', 'necessary tools'],
    ['the people who work in a team', 'the rules that must be followed during a job', 'the money spent on a project'],
    'All rescue teams must carry the correct safety equipment.',
    'gear', 'All rescue teams must carry the correct safety gear.',
    'necessary tools', 'The mechanic packed all the necessary tools into the back of the van.',
    {
      idKey:'equipment_4',
      teacherNote:'Unit 4 item (equipment_4), separate from Unit 2 equipment; shares only the lexical spelling list.',
      masteryContexts:[
        { text:'The airline checks all emergency equipment, including life jackets and oxygen masks, before every flight.', meaning:'the items needed for a particular purpose' },
        { text:'Railway workers need special equipment to repair the tracks at night.', meaning:'the tools and devices needed to do a job' }
      ],
      situationDistractors:[
        'The passengers waited in the departure hall until their gate was announced.',
        'The coach driver told the group to be back at the bus by six o’clock.',
        'The workers took a break and drank tea beside the road.'
      ],
      retrievalContexts:[
        { id:'1', text:'The airport fire service keeps its emergency equipment in a special building beside the runway.', target:'equipment', grammarPattern:'' },
        { id:'2', text:'Engineers brought heavy equipment to the site to repair the damaged bridge.', target:'equipment', grammarPattern:'' },
        { id:'3', text:'Cyclists should check their lights and other safety equipment before riding at night.', target:'equipment', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'equipment', wrong:['furniture', 'tickets', 'luggage'] },
        { id:'2', answer:'equipment', wrong:['furniture', 'clothing', 'luggage'] },
        { id:'3', answer:'equipment', wrong:['posters', 'tickets', 'luggage'] }
      ]
    }),
  e('collision', 'noun',
    'an accident in which moving vehicles or objects hit each other',
    ['crash', 'accident between vehicles'],
    ['a sudden stop caused by a red light', 'a disagreement between two drivers about the route', 'a fault in the brakes of a vehicle'],
    'A collision between two lorries closed the motorway for three hours.',
    'crash', 'A crash between two lorries closed the motorway for three hours.',
    'accident between vehicles', 'An accident between vehicles at the junction caused long delays.',
    {
      masteryContexts:[
        { text:'A fog warning was issued after a collision involving more than twenty cars.', meaning:'a crash between moving vehicles' },
        { text:'The pilot turned sharply to avoid a mid-air collision with another aircraft.', meaning:'an accident in which things hit each other' }
      ],
      situationDistractors:[
        'The two trains passed each other safely on parallel tracks.',
        'A lorry broke down on the hard shoulder, and the driver called for help.',
        'The cyclist braked gently and stopped at the red light.'
      ],
      retrievalContexts:[
        { id:'1', text:'Heavy fog caused a collision between a bus and a lorry on the main road.', target:'collision', grammarPattern:'' },
        { id:'2', text:'Air traffic controllers guide planes carefully to prevent a mid-air collision.', target:'collision', grammarPattern:'' },
        { id:'3', text:'The train driver braked hard, but a collision with the fallen tree could not be avoided.', target:'collision', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'collision', wrong:['race', 'meeting', 'journey'] },
        { id:'2', answer:'collision', wrong:['meeting', 'race', 'party'] },
        { id:'3', answer:'collision', wrong:['race', 'meeting', 'delay'] }
      ]
    }),
  e('organisation', 'noun',
    'a group of people who work together for a particular purpose, such as a company, charity or public body',
    ['association', 'official body'],
    ['the way in which things are arranged', 'a plan made for a long journey', 'a building where people work'],
    'A national organisation is campaigning for safer cycle lanes in the city.',
    'association', 'A national association is campaigning for safer cycle lanes in the city.',
    'official body', 'The official body responsible for rail safety published its yearly report.',
    {
      masteryContexts:[
        { text:'The road safety organisation visits schools to teach children how to cross busy streets.', meaning:'a group of people working together for a particular purpose' },
        { text:'Air travel is regulated by an international organisation that sets safety standards for all airlines.', meaning:'an official body set up to do a particular job' }
      ],
      situationDistractors:[
        'A group of friends met by chance on the platform and chatted until the train arrived.',
        'One man built a small boat alone in his garden over several years.',
        'The shop on the station concourse sells newspapers and snacks.'
      ],
      retrievalContexts:[
        { id:'1', text:'A charity organisation provides free bicycles to students who cannot afford transport.', target:'organisation', grammarPattern:'' },
        { id:'2', text:'The organisation that runs the metro system has promised to keep fares low next year.', target:'organisation', grammarPattern:'' },
        { id:'3', text:'An international organisation sets safety rules for airlines all over the world.', target:'organisation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'organisation', wrong:['bridge', 'timetable', 'engine'] },
        { id:'2', answer:'organisation', wrong:['driver', 'ticket', 'station'] },
        { id:'3', answer:'organisation', wrong:['engineer', 'aeroplane', 'island'] }
      ]
    }),
  e('participant', 'noun',
    'a person who takes part in an activity, event or trial',
    ['person involved', 'member of the group'],
    ['a person who watches an event from the crowd', 'a person who plans and manages an event', 'a person who travels on a bus or train'],
    'Every participant in the cycling safety trial wore a bright jacket.',
    'person involved', 'Every person involved in the cycling safety trial wore a bright jacket.',
    'member of the group', 'The youngest member of the group was only eight years old.',
    {
      idKey:'participant_4',
      teacherNote:'Unit 4 item (participant_4), separate from Unit 3 participant; shares only the lexical spelling list.',
      masteryContexts:[
        { text:'Each participant in the road safety workshop learned how to give first aid.', meaning:'a person who takes part in an event' },
        { text:'Every participant in the trial received a free bicycle helmet.', meaning:'a person involved in a test or study' }
      ],
      situationDistractors:[
        'The spectators clapped from the pavement as the cyclists rode past.',
        'The organiser stood at the finish line with a stopwatch and a microphone.',
        'A sponsor gave the cycling club some money but did not attend the event.'
      ],
      retrievalContexts:[
        { id:'1', text:'Each participant in the cycling safety trial kept a diary of every journey they made.', target:'participant', grammarPattern:'' },
        { id:'2', text:'The mayor thanked each participant in the car-free day for helping to reduce traffic.', target:'participant', grammarPattern:'' },
        { id:'3', text:'The oldest participant in the road safety campaign was an eighty-year-old retired bus driver.', target:'participant', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'participant', wrong:['spectator', 'engineer', 'pilot'] },
        { id:'2', answer:'participant', wrong:['passenger', 'spectator', 'inspector'] },
        { id:'3', answer:'participant', wrong:['spectator', 'engineer', 'journalist'] }
      ]
    }),
  e('livelihood', 'noun',
    'the work or activity that a person depends on to earn money for living',
    ['means of earning a living', 'source of income'],
    ['the amount of money a person is paid each month', 'the particular position a person holds in a company', 'the way a person chooses to live and spend free time'],
    'For thousands of families in the region, ferry work provides their livelihood.',
    'means of earning a living', 'For thousands of families in the region, ferry work provides their means of earning a living.',
    'source of income', 'Closing the bus depot would destroy the only source of income for many local families.',
    {
      masteryContexts:[
        { text:'Many taxi drivers depend on tourism for their livelihood.', meaning:'the way a person earns money to live' },
        { text:'When the ferry service closed, hundreds of dockworkers lost their livelihood.', meaning:'the work that a person depends on for an income' }
      ],
      situationDistractors:[
        'The family spent the weekend at a beach resort and relaxed in the sun.',
        'The manager moved to a larger office on the top floor of the building.',
        'The tourists asked the guide where they could buy a cup of coffee.'
      ],
      retrievalContexts:[
        { id:'1', text:'Ferry work has been the livelihood of many families on the island for generations.', target:'livelihood', grammarPattern:'' },
        { id:'2', text:'The new motorway threatened the livelihood of the owners of small roadside cafés.', target:'livelihood', grammarPattern:'' },
        { id:'3', text:'Many rickshaw drivers earn their livelihood by carrying tourists around the old city.', target:'livelihood', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'livelihood', wrong:['hobby', 'uniform', 'fashion'] },
        { id:'2', answer:'livelihood', wrong:['holiday', 'uniform', 'neighbour'] },
        { id:'3', answer:'livelihood', wrong:['holiday', 'uniform', 'weekend'] }
      ]
    }),
  e('fatality', 'noun',
    'a death caused by an accident, disaster or similar event',
    ['death', 'loss of life'],
    ['an injury that heals after a few weeks', 'a person who is hurt in an accident', 'a report written after an accident'],
    'Each fatality on the road is a reminder of why speed limits matter.',
    'death', 'Each death on the road is a reminder of why speed limits matter.',
    'loss of life', 'Fortunately, the collision caused no loss of life.',
    {
      masteryContexts:[
        { text:'Fortunately, the minor crash at the roundabout caused no fatality, only some damage to the vehicles.', meaning:'a death caused by an accident' },
        { text:'Each fatality on the railway is recorded in an official report so that safety can be improved.', meaning:'a death in an accident or disaster' }
      ],
      situationDistractors:[
        'A cyclist fell off her bike and bruised her knee, but she was able to walk home.',
        'The bus was delayed for an hour after the driver took a wrong turning.',
        'Rescue workers helped everyone leave the damaged ferry safely.'
      ],
      retrievalContexts:[
        { id:'1', text:'Investigators are still trying to discover what caused the single fatality in last night’s bus accident.', target:'fatality', grammarPattern:'' },
        { id:'2', text:'New speed limits were introduced after a fatality at the same junction.', target:'fatality', grammarPattern:'' },
        { id:'3', text:'The airline had an excellent record, with not a single fatality in thirty years.', target:'fatality', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'fatality', wrong:['delay', 'complaint', 'mistake'] },
        { id:'2', answer:'fatality', wrong:['festival', 'holiday', 'picnic'] },
        { id:'3', answer:'fatality', wrong:['holiday', 'festival', 'promotion'] }
      ]
    }),
  e('initiative', 'noun',
    'a new plan or action intended to solve a problem or improve a situation',
    ['scheme', 'programme'],
    ['the ability to make decisions without being told what to do', 'a speech given at the start of a meeting', 'the first lesson in a training course'],
    'The council introduced a new initiative to reduce traffic outside schools.',
    'scheme', 'The council introduced a new scheme to reduce traffic outside schools.',
    'programme', 'A new programme to teach children road safety has started in primary schools.',
    {
      masteryContexts:[
        { text:'The government has announced a new initiative to make roads safer near schools.', meaning:'a new plan to solve a problem' },
        { text:'The bus company’s latest initiative offers free travel to students on Sundays.', meaning:'a new action intended to improve a situation' }
      ],
      situationDistractors:[
        'The school was closed for the holidays, and the playground was empty.',
        'The traffic officer waved the cars forward when the lights failed.',
        'A group of tourists took a photograph in front of the old station.'
      ],
      retrievalContexts:[
        { id:'1', text:'A cycling initiative in the city has persuaded thousands of commuters to leave their cars at home.', target:'initiative', grammarPattern:'' },
        { id:'2', text:'The railway company welcomed the government’s initiative to build a new high-speed line.', target:'initiative', grammarPattern:'' },
        { id:'3', text:'Local residents started an initiative to clean up the litter beside the main road.', target:'initiative', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'initiative', wrong:['timetable', 'festival', 'engine'] },
        { id:'2', answer:'initiative', wrong:['complaint', 'timetable', 'festival'] },
        { id:'3', answer:'initiative', wrong:['argument', 'exercise', 'accident'] }
      ]
    }),
  e('campaign', 'noun',
    'an organised series of actions intended to achieve a particular result, such as changing public behaviour',
    ['public-awareness drive', 'planned series of actions'],
    ['a long fight between two armies', 'a short speech given at a public meeting', 'a plan for the route of a journey'],
    'The road safety campaign reminds drivers to slow down near schools.',
    'public-awareness drive', 'The road safety public-awareness drive reminds drivers to slow down near schools.',
    'planned series of actions', 'A planned series of actions to protect cyclists begins next month.',
    {
      masteryContexts:[
        { text:'The charity started a campaign to persuade cyclists to wear helmets.', meaning:'a series of actions planned to achieve a result' },
        { text:'Thanks to a successful campaign, the council agreed to build a new crossing outside the school.', meaning:'organised public action to achieve a change' }
      ],
      situationDistractors:[
        'The driver switched on the radio and sang along to his favourite song.',
        'A single officer stood at the junction and waved cars through.',
        'The engineers worked late to repair the bridge, then went home.'
      ],
      retrievalContexts:[
        { id:'1', text:'A national campaign encourages drivers to put their phones away while driving.', target:'campaign', grammarPattern:'' },
        { id:'2', text:'The campaign to save the local railway line attracted thousands of supporters.', target:'campaign', grammarPattern:'' },
        { id:'3', text:'Parents organised a campaign for a safer crossing outside the primary school.', target:'campaign', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'campaign', wrong:['bridge', 'timetable', 'engine'] },
        { id:'2', answer:'campaign', wrong:['journey', 'timetable', 'tunnel'] },
        { id:'3', answer:'campaign', wrong:['timetable', 'journey', 'holiday'] }
      ]
    }),
  e('pothole', 'noun',
    'a hole in the surface of a road caused by wear or damage',
    ['hole in the road', 'damaged patch of road'],
    ['a deep hole that is dug for pipes or cables', 'a long crack that runs along the edge of a road', 'a pond or pool of water beside a road'],
    'The bus driver slowed down to avoid a deep pothole.',
    'hole in the road', 'The bus driver slowed down to avoid a deep hole in the road.',
    'damaged patch of road', 'The council promised to repair the damaged patch of road outside the school.',
    {
      masteryContexts:[
        { text:'A deep pothole in the middle of the lane damaged two tyres on the same afternoon.', meaning:'a hole in a road surface caused by damage' },
        { text:'The council promised to fill every pothole on the main road before the end of the month.', meaning:'a damaged hole in a road' }
      ],
      situationDistractors:[
        'The road had just been resurfaced, and the new tarmac was smooth and black.',
        'A fallen tree blocked the lane until workers arrived with a saw.',
        'Workers dug a trench beside the pavement to lay new cables.'
      ],
      retrievalContexts:[
        { id:'1', text:'The front wheel of the bicycle hit a pothole, and the rider had to stop to check for damage.', target:'pothole', grammarPattern:'' },
        { id:'2', text:'Heavy lorries and freezing weather soon turned a small crack into a dangerous pothole.', target:'pothole', grammarPattern:'' },
        { id:'3', text:'Residents have asked the council to repair the pothole outside the primary school.', target:'pothole', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'pothole', wrong:['tunnel', 'village', 'holiday'] },
        { id:'2', answer:'pothole', wrong:['bridge', 'junction', 'tunnel'] },
        { id:'3', answer:'pothole', wrong:['holiday', 'weather', 'accident'] }
      ]
    }),
  e('trauma', 'noun',
    'a serious physical or emotional effect caused by a shocking or dangerous event',
    ['lasting distress', 'deep shock'],
    ['a physical illness that spreads quickly', 'a feeling of tiredness after a long journey', 'a sense of pride after an achievement'],
    'The survivors of the train crash were offered counselling to help them deal with the trauma.',
    'lasting distress', 'The survivors of the train crash were offered counselling to help them deal with the lasting distress.',
    'deep shock', 'The deep shock of the accident stayed with the driver for months.',
    {
      masteryContexts:[
        { text:'Witnessing a serious accident can cause trauma that lasts for months.', meaning:'a lasting emotional shock' },
        { text:'The school arranged support for pupils to help them cope with the trauma of the bus accident.', meaning:'a serious emotional effect caused by a shocking event' }
      ],
      situationDistractors:[
        'The passengers enjoyed the calm crossing and watched dolphins from the deck.',
        'The driver felt tired after the long journey and stopped for a rest.',
        'The bus arrived on time, and everyone went straight home.'
      ],
      retrievalContexts:[
        { id:'1', text:'The pilot received counselling to help him deal with the trauma of the emergency landing.', target:'trauma', grammarPattern:'' },
        { id:'2', text:'Emergency workers are trained to recognise signs of trauma in people who have been through a disaster.', target:'trauma', grammarPattern:'' },
        { id:'3', text:'Years after the accident, the driver still felt the trauma every time he heard a loud noise.', target:'trauma', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'trauma', wrong:['cost', 'noise', 'speed'] },
        { id:'2', answer:'trauma', wrong:['boredom', 'fashion', 'noise'] },
        { id:'3', answer:'trauma', wrong:['cold', 'price', 'distance'] }
      ]
    }),
  e('measures', 'noun',
    'actions taken to achieve a result or deal with a problem',
    ['actions', 'official steps'],
    ['the sizes of objects, shown in numbers', 'the amounts of money paid for a service', 'the instruments used to find the weight of a load'],
    'The city has introduced strict measures to cut pollution from traffic.',
    'actions', 'The city has introduced strict actions to cut pollution from traffic.',
    'official steps', 'Official steps to improve air quality were announced yesterday.',
    {
      masteryContexts:[
        { text:'The council took emergency measures to clear the snow from the main roads.', meaning:'actions taken to deal with a problem' },
        { text:'Safety measures on the new tram line include barriers, warning lights and cameras.', meaning:'actions taken to achieve a result such as safety' }
      ],
      situationDistractors:[
        'The tourists bought tickets and boarded the sightseeing bus.',
        'The pilot announced that the flight would land in twenty minutes.',
        'A mechanic washed the car and polished the wheels.'
      ],
      retrievalContexts:[
        { id:'1', text:'Cameras and speed bumps are among the measures used to slow down drivers near schools.', target:'measures', grammarPattern:'' },
        { id:'2', text:'Emergency measures were taken to repair the flooded railway line before the morning rush hour.', target:'measures', grammarPattern:'' },
        { id:'3', text:'Airports have introduced extra security measures after the warning.', target:'measures', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'measures', wrong:['tickets', 'uniforms', 'timetables'] },
        { id:'2', answer:'measures', wrong:['holidays', 'uniforms', 'timetables'] },
        { id:'3', answer:'measures', wrong:['holidays', 'fares', 'meals'] }
      ]
    }),
  e('estimate', 'verb',
    'to calculate or judge an amount approximately',
    ['roughly calculate', 'judge approximately'],
    ['to count exactly how many there are', 'to guess without any evidence', 'to give a firm promise about something'],
    'Transport officials estimate that more than ten thousand passengers use the station every day.',
    'roughly calculate', 'Transport officials roughly calculate that more than ten thousand passengers use the station every day.',
    'judge approximately', 'The engineers judge approximately how long the repairs will take.',
    {
      grammarForms:{ base:'estimate', thirdPerson:'estimates', past:'estimated', pastParticiple:'estimated', ing:'estimating' },
      masteryContexts:[
        { text:'Engineers estimate that the new bridge will cost about two hundred million pounds.', meaning:'to calculate approximately' },
        { text:'It is difficult to estimate how many cars use this road because there are no counting machines.', meaning:'to judge an amount without exact figures' }
      ],
      situationDistractors:[
        'The driver counted every passenger as they got on and wrote down the exact number.',
        'The bus company published the exact timetable on its website.',
        'The engineer measured the bridge with a tape and recorded the precise length.'
      ],
      retrievalContexts:[
        { id:'1', text:'Experts estimate that heavy traffic costs the city millions of pounds in lost time each year.', target:'estimate', grammarPattern:'' },
        { id:'2', text:'It is hard to estimate how long the roadworks will last until the engineers finish their survey.', target:'estimate', grammarPattern:'' },
        { id:'3', text:'Before you set off, use a map to estimate how long the journey will take.', target:'estimate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'estimate', wrong:['regret', 'refuse', 'forget'] },
        { id:'2', answer:'estimate', wrong:['regret', 'refuse', 'announce'] },
        { id:'3', answer:'estimate', wrong:['forget', 'repair', 'sell'] }
      ]
    }),
  e('regulation', 'noun',
    'an official rule made by an authority',
    ['official rule', 'formal requirement'],
    ['a set of laws considered together', 'a habit that a person follows each day', 'a suggestion that people may ignore'],
    'A new regulation says that all lorries must be fitted with a speed-limiting device.',
    'official rule', 'A new official rule says that all lorries must be fitted with a speed-limiting device.',
    'formal requirement', 'A formal requirement forces all drivers to carry a warning triangle.',
    {
      masteryContexts:[
        { text:'Under the new regulation, every school bus must have a seat belt for each child.', meaning:'an official rule made by an authority' },
        { text:'The airline broke a safety regulation, so it was fined by the aviation authority.', meaning:'an official rule about how something must be done' }
      ],
      situationDistractors:[
        'The driver chose a different route because he wanted to see the coast.',
        'The bus company offered a discount to passengers who travelled on Sundays.',
        'The tourists asked the guide where they could buy a cup of coffee.'
      ],
      retrievalContexts:[
        { id:'1', text:'European regulation requires every new car to be fitted with a rear-view camera.', target:'regulation', grammarPattern:'' },
        { id:'2', text:'Under international regulation, pilots must take regular medical tests.', target:'regulation', grammarPattern:'' },
        { id:'3', text:'The tour company was fined for ignoring a basic safety regulation.', target:'regulation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'regulation', wrong:['timetable', 'holiday', 'fashion'] },
        { id:'2', answer:'regulation', wrong:['holiday', 'weather', 'fashion'] },
        { id:'3', answer:'regulation', wrong:['festival', 'holiday', 'journey'] }
      ]
    }),
  e('operate', 'verb',
    'to control or use a machine, vehicle or system',
    ['control', 'work'],
    ['to repair a machine that is not working', 'to build a machine from separate parts', 'to sell a machine to a customer'],
    'Only trained staff are allowed to operate the cranes in the port.',
    'control', 'Only trained staff are allowed to control the cranes in the port.',
    'work', 'It takes years of training to learn how to work a large crane safely.',
    {
      grammarForms:{ base:'operate', thirdPerson:'operates', past:'operated', pastParticiple:'operated', ing:'operating' },
      masteryContexts:[
        { text:'Drivers need a special licence to operate a heavy lorry.', meaning:'to control and use a vehicle' },
        { text:'The pilot learned to operate the aircraft’s flight computer.', meaning:'to use a system correctly' }
      ],
      situationDistractors:[
        'The crane stood still beside the quay because the workers had gone home.',
        'A mechanic repaired the engine of the tractor in his workshop.',
        'The engineers designed the new crane on a computer and sent the plans to the factory.'
      ],
      retrievalContexts:[
        { id:'1', text:'It takes years of practice to learn how to operate a large passenger aircraft safely.', target:'operate', grammarPattern:'' },
        { id:'2', text:'Passengers should not try to operate the emergency door unless the crew tell them to.', target:'operate', grammarPattern:'' },
        { id:'3', text:'The new bus is easy to operate, so drivers need only a short training course.', target:'operate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'operate', wrong:['sell', 'paint', 'photograph'] },
        { id:'2', answer:'operate', wrong:['destroy', 'paint', 'deliver'] },
        { id:'3', answer:'operate', wrong:['paint', 'steal', 'insure'] }
      ]
    }),
  e('detain', 'verb',
    'to officially keep someone in a place and not allow them to leave',
    ['hold', 'keep in custody'],
    ['to make someone wait longer than they expected', 'to follow someone to find out where they are going', 'to ask someone to leave a place immediately'],
    'Border officers may detain a lorry driver for questioning if the papers look false.',
    'hold', 'Border officers may hold a lorry driver for questioning if the papers look false.',
    'keep in custody', 'Customs officers may keep in custody anyone who is carrying false documents.',
    {
      grammarForms:{ base:'detain', thirdPerson:'detains', past:'detained', pastParticiple:'detained', ing:'detaining' },
      masteryContexts:[
        { text:'The police may detain a driver who refuses to take a breath test.', meaning:'to officially keep someone and not let them leave' },
        { text:'Airport officials decided to detain the passenger while they checked his documents.', meaning:'to officially stop someone from leaving a place' }
      ],
      situationDistractors:[
        'The bus driver waved to the passengers as they left at the final stop.',
        'A traveller bought a sandwich and sat down to wait for the evening train.',
        'The tour guide told the group to meet beside the fountain at noon.'
      ],
      retrievalContexts:[
        { id:'1', text:'Police officers have the right to detain anyone who is suspected of a serious crime.', target:'detain', grammarPattern:'' },
        { id:'2', text:'The customs officer decided to detain the lorry driver until the documents had been checked.', target:'detain', grammarPattern:'' },
        { id:'3', text:'The police may only detain a person for a limited time without charging them.', target:'detain', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'detain', wrong:['thank', 'greet', 'invite'] },
        { id:'2', answer:'detain', wrong:['thank', 'pay', 'photograph'] },
        { id:'3', answer:'detain', wrong:['employ', 'invite', 'thank'] }
      ]
    }),
  e('offences', 'noun',
    'illegal acts, or actions that break a rule or law',
    ['crimes', 'violations of the law'],
    ['the feelings of anger caused by rude words', 'the punishments given to people who break the law', 'the people who have been found guilty of a crime'],
    'Drivers who commit serious offences can lose their licences for a year.',
    'crimes', 'Drivers who commit serious crimes can lose their licences for a year.',
    'violations of the law', 'Speeding and parking in the wrong place are common violations of the law in busy city centres.',
    {
      masteryContexts:[
        { text:'Dangerous driving and speeding are among the most serious traffic offences.', meaning:'actions that break the law' },
        { text:'The number of parking offences has risen since the new charges began.', meaning:'illegal acts that break a rule' }
      ],
      situationDistractors:[
        'The coach left the station and drove along the coast road.',
        'A cyclist stopped to buy water at the corner shop.',
        'The captain welcomed the visitors and showed them where the lifeboats were kept.'
      ],
      retrievalContexts:[
        { id:'1', text:'Motoring offences such as speeding can lead to a fine or a driving ban.', target:'offences', grammarPattern:'' },
        { id:'2', text:'The police recorded more than two hundred traffic offences in the city last month.', target:'offences', grammarPattern:'' },
        { id:'3', text:'Drivers who repeat the same offences may lose their licence.', target:'offences', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'offences', wrong:['holidays', 'journeys', 'timetables'] },
        { id:'2', answer:'offences', wrong:['festivals', 'journeys', 'souvenirs'] },
        { id:'3', answer:'offences', wrong:['holidays', 'festivals', 'timetables'] }
      ]
    }),
  e('provisional', 'adjective',
    'temporary and not yet final or permanent',
    ['temporary', 'draft'],
    ['allowed only under certain conditions', 'costing more than most people can afford', 'checked carefully by an expert'],
    'The council has published a provisional timetable for the new bus routes, which may change.',
    'temporary', 'The council has published a temporary timetable for the new bus routes, which may change.',
    'draft', 'The draft plan for the new railway line will be discussed at a public meeting.',
    {
      masteryContexts:[
        { text:'Learner drivers must pass a test before their provisional licence becomes a full one.', meaning:'temporary and not yet permanent' },
        { text:'The provisional date for the opening of the tunnel is March, but it may change.', meaning:'not yet final' }
      ],
      situationDistractors:[
        'The tram stopped at the market and several passengers got on.',
        'A porter carried two large cases to the hotel entrance.',
        'The railway museum is open every day except Monday.'
      ],
      retrievalContexts:[
        { id:'1', text:'Learner drivers must carry their provisional licence at all times.', target:'provisional', grammarPattern:'' },
        { id:'2', text:'The provisional opening date of the new airport is June, but delays are possible.', target:'provisional', grammarPattern:'' },
        { id:'3', text:'Officials gave provisional approval to the new tram route, but a final decision will come later.', target:'provisional', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'provisional', wrong:['delicious', 'crowded', 'windy'] },
        { id:'2', answer:'provisional', wrong:['tiring', 'windy', 'sleepy'] },
        { id:'3', answer:'provisional', wrong:['wooden', 'crowded', 'hungry'] }
      ]
    }),
  e('enforcement', 'noun',
    'the act of making sure that laws or rules are obeyed',
    ['policing', 'monitoring'],
    ['the process of writing new laws', 'the punishment given to a person who breaks a rule', 'a document that explains the rules of the road'],
    'Stricter enforcement of speed limits has reduced accidents near schools.',
    'policing', 'Stricter policing of speed limits has reduced accidents near schools.',
    'monitoring', 'Monitoring of parking rules in the city centre has become stricter this year.',
    {
      masteryContexts:[
        { text:'Stricter enforcement of the speed limit has reduced accidents near the school.', meaning:'making sure that a rule is obeyed' },
        { text:'Without proper enforcement, many drivers ignore the parking rules.', meaning:'making sure that rules are followed' }
      ],
      situationDistractors:[
        'The conductor smiled and helped a child onto the train.',
        'Passengers waited patiently in the departure hall for the gate to open.',
        'A taxi driver stopped to fill his tank with petrol.'
      ],
      retrievalContexts:[
        { id:'1', text:'Traffic police are responsible for the enforcement of speed limits on the motorway.', target:'enforcement', grammarPattern:'' },
        { id:'2', text:'Better enforcement of the seat belt law has saved many lives.', target:'enforcement', grammarPattern:'' },
        { id:'3', text:'Cameras have made the enforcement of parking rules much easier.', target:'enforcement', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'enforcement', wrong:['decoration', 'tourism', 'weather'] },
        { id:'2', answer:'enforcement', wrong:['decoration', 'tourism', 'rainfall'] },
        { id:'3', answer:'enforcement', wrong:['decoration', 'weather', 'tourism'] }
      ]
    }),
  e('statistics', 'noun',
    'numbers that are collected and studied to show facts or patterns',
    ['figures', 'numerical data'],
    ['the study of numbers as a school subject', 'opinions given by a small group of passengers', 'rules that control how a transport system works'],
    'Government statistics show that road accidents have fallen by ten per cent since 2015.',
    'figures', 'Government figures show that road accidents have fallen by ten per cent since 2015.',
    'numerical data', 'Numerical data collected by the rail company shows how many passengers travel each hour.',
    {
      masteryContexts:[
        { text:'The latest statistics show that more people are cycling to work.', meaning:'numbers that show facts' },
        { text:'Transport statistics on rail delays are published every month.', meaning:'numbers collected to show a pattern' }
      ],
      situationDistractors:[
        'The tourists boarded the open-top bus and took photographs of the cathedral.',
        'A mechanic wiped the oil from his hands and closed the bonnet.',
        'The ferry sailed slowly out of the harbour at sunset.'
      ],
      retrievalContexts:[
        { id:'1', text:'According to official statistics, train travel is now faster than it was ten years ago.', target:'statistics', grammarPattern:'' },
        { id:'2', text:'Accident statistics from the past five years helped planners choose where to build the new crossing.', target:'statistics', grammarPattern:'' },
        { id:'3', text:'The airport publishes monthly statistics on the number of delayed flights.', target:'statistics', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'statistics', wrong:['jokes', 'uniforms', 'souvenirs'] },
        { id:'2', answer:'statistics', wrong:['menus', 'fashions', 'uniforms'] },
        { id:'3', answer:'statistics', wrong:['jokes', 'menus', 'uniforms'] }
      ]
    }),
  e('safety', 'noun',
    'the condition of being protected from danger, risk or injury',
    ['protection', 'freedom from danger'],
    ['the protection of property from thieves', 'the speed that is allowed on a road', 'the rules for building new roads'],
    'Seat belts are essential for the safety of everyone in the car.',
    'protection', 'Seat belts are essential for the protection of everyone in the car.',
    'freedom from danger', 'Passengers expect freedom from danger when they board a plane.',
    {
      masteryContexts:[
        { text:'Child seats are designed to improve the safety of young passengers.', meaning:'protection from danger' },
        { text:'Cyclists should always put their own safety first when they cross a busy road.', meaning:'being free from the risk of injury' }
      ],
      situationDistractors:[
        'The tour guide gave everyone a map and a bottle of water.',
        'A baker delivered fresh rolls to the café beside the station.',
        'The passengers clapped when the plane landed on time.'
      ],
      retrievalContexts:[
        { id:'1', text:'Wearing a helmet is important for the safety of cyclists.', target:'safety', grammarPattern:'' },
        { id:'2', text:'Airlines must follow strict rules to protect the safety of their passengers.', target:'safety', grammarPattern:'' },
        { id:'3', text:'Road safety lessons teach children how to cross busy streets.', target:'safety', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'safety', wrong:['fashion', 'price', 'colour'] },
        { id:'2', answer:'safety', wrong:['weather', 'price', 'colour'] },
        { id:'3', answer:'safety', wrong:['fashion', 'weather', 'colour'] }
      ]
    }),
  e('sustainability', 'noun',
    'the ability to continue without seriously damaging the environment or using up resources',
    ['eco-friendliness', 'environmental responsibility'],
    ['the strength of a bridge or a building', 'the quality of being cheap to produce', 'the speed at which a project is completed'],
    'The airline has published a plan to improve its sustainability by using less fuel.',
    'eco-friendliness', 'The airline has published a plan to improve its eco-friendliness by using less fuel.',
    'environmental responsibility', 'Customers increasingly expect environmental responsibility from the companies that move their goods.',
    {
      masteryContexts:[
        { text:'City planners now think about the sustainability of every new transport project.', meaning:'the ability to continue without harming the environment' },
        { text:'Public transport can improve sustainability by reducing the number of cars on the road.', meaning:'using resources without damaging the environment' }
      ],
      situationDistractors:[
        'A tourist asked the driver the price of a ticket to the airport.',
        'The children waved to the sailors from the end of the pier.',
        'The traveller packed a coat and a camera for the journey.'
      ],
      retrievalContexts:[
        { id:'1', text:'Cycle lanes and electric buses are part of the city’s plan for long-term sustainability.', target:'sustainability', grammarPattern:'' },
        { id:'2', text:'Environmental groups welcomed the airport’s new commitment to sustainability.', target:'sustainability', grammarPattern:'' },
        { id:'3', text:'The company’s focus on sustainability led it to replace its diesel lorries with electric ones.', target:'sustainability', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'sustainability', wrong:['disaster', 'laughter', 'curiosity'] },
        { id:'2', answer:'sustainability', wrong:['disaster', 'laughter', 'darkness'] },
        { id:'3', answer:'sustainability', wrong:['curiosity', 'laughter', 'darkness'] }
      ]
    }),
  e('legislation', 'noun',
    'laws considered together, especially laws made by a government',
    ['laws', 'laws made by the government'],
    ['one official rule about a particular activity', 'the act of making sure that laws are obeyed', 'a group of people who discuss and decide policy'],
    'New legislation will make it compulsory for all cyclists to wear helmets.',
    'laws', 'New laws will make it compulsory for all cyclists to wear helmets.',
    'laws made by the government', 'Airlines must follow laws made by the government about the weight of luggage.',
    {
      masteryContexts:[
        { text:'The government is planning new legislation to control the use of electric scooters.', meaning:'laws made by a government' },
        { text:'Road safety legislation has changed several times in the last twenty years.', meaning:'laws considered together' }
      ],
      situationDistractors:[
        'The pilot welcomed the passengers and pointed out the exits.',
        'A cyclist rode past the market and stopped at the traffic lights.',
        'The tourists took a taxi from the hotel to the railway station.'
      ],
      retrievalContexts:[
        { id:'1', text:'Parliament passed new legislation to ban the use of mobile phones while driving.', target:'legislation', grammarPattern:'' },
        { id:'2', text:'The airline industry is controlled by strict international legislation.', target:'legislation', grammarPattern:'' },
        { id:'3', text:'Environmental groups are calling for tougher legislation on exhaust fumes from lorries.', target:'legislation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'legislation', wrong:['entertainment', 'furniture', 'scenery'] },
        { id:'2', answer:'legislation', wrong:['entertainment', 'scenery', 'weather'] },
        { id:'3', answer:'legislation', wrong:['furniture', 'scenery', 'weather'] }
      ]
    }),
  e('introduce', 'verb',
    'to bring something into use for the first time',
    ['bring in', 'start using'],
    ['to say who someone is when two people meet', 'to remove an old system that no longer works', 'to test something before it is sold'],
    'The city plans to introduce a congestion charge for vehicles entering the centre.',
    'bring in', 'The city plans to bring in a congestion charge for vehicles entering the centre.',
    'start using', 'The railway company will start using electric trains on this line in June.',
    {
      grammarForms:{ base:'introduce', thirdPerson:'introduces', past:'introduced', pastParticiple:'introduced', ing:'introducing' },
      masteryContexts:[
        { text:'The government will introduce a new speed limit on country roads next year.', meaning:'to bring into use for the first time' },
        { text:'Airlines will introduce electronic boarding passes at every airport this summer.', meaning:'to start to use something new' }
      ],
      situationDistractors:[
        'The captain waved to the crowd from the bridge of the ship.',
        'Tourists queued outside the museum to buy their tickets.',
        'A mechanic tightened the bolts on the wheel of the van.'
      ],
      retrievalContexts:[
        { id:'1', text:'The council plans to introduce a new bus lane on the main road next month.', target:'introduce', grammarPattern:'' },
        { id:'2', text:'Airlines are about to introduce new rules for hand luggage on short flights.', target:'introduce', grammarPattern:'' },
        { id:'3', text:'Some countries have decided to introduce a lower speed limit in towns.', target:'introduce', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'introduce', wrong:['forget', 'swallow', 'translate'] },
        { id:'2', answer:'introduce', wrong:['forget', 'sneeze', 'translate'] },
        { id:'3', answer:'introduce', wrong:['swallow', 'sneeze', 'translate'] }
      ]
    }),
  e('innovative', 'adjective',
    'using new ideas or methods in an original and effective way',
    ['original', 'pioneering'],
    ['following old methods that have been used for many years', 'recently built or recently bought', 'very popular with young people'],
    'The company has developed innovative designs for folding electric bikes.',
    'original', 'The company has developed original designs for folding electric bikes.',
    'pioneering', 'The pioneering engineers who built the first tunnel under the river faced many problems.',
    {
      masteryContexts:[
        { text:'The airline is famous for its innovative approach to reducing waste on board.', meaning:'using new ideas in an original way' },
        { text:'Engineers have designed an innovative bridge that makes its own electricity.', meaning:'new and effective in an original way' }
      ],
      situationDistractors:[
        'The old ferry carried passengers across the river every hour.',
        'A boy bought a ticket and ran to catch the last bus.',
        'The driver parked the van beside the harbour wall.'
      ],
      retrievalContexts:[
        { id:'1', text:'Engineers have come up with innovative ways to make aircraft lighter.', target:'innovative', grammarPattern:'' },
        { id:'2', text:'The innovative design of the new station won an international prize.', target:'innovative', grammarPattern:'' },
        { id:'3', text:'Several innovative ideas were presented at the transport conference.', target:'innovative', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'innovative', wrong:['ordinary', 'traditional', 'heavy'] },
        { id:'2', answer:'innovative', wrong:['ordinary', 'historic', 'heavy'] },
        { id:'3', answer:'innovative', wrong:['traditional', 'ordinary', 'historic'] }
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
  // One shared list per word: Unit 4's demand, advertisement, equipment and participant reuse the reviewed misspellings of the earlier-unit items with the same spelling.
  lexicalSpelling:{
    ...LEXICAL_SPELLING_ERRORS,
    vocab_demand_4:LEXICAL_SPELLING_ERRORS.vocab_demand,
    vocab_advertisement_4:LEXICAL_SPELLING_ERRORS.vocab_advertisement,
    vocab_equipment_4:LEXICAL_SPELLING_ERRORS.vocab_equipment,
    vocab_participant_4:LEXICAL_SPELLING_ERRORS.vocab_participant
  }
});
